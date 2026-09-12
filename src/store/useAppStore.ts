import { useState, useEffect, useRef } from 'react';
import {
  Profile,
  Workout,
  WorkoutExercise,
  WorkoutLog,
  WorkoutResult,
  Meal,
  WaterLog,
  Supplement,
  HealthMetric,
  InjuryPainLog,
  EvolutionPhoto,
  Goal,
  AICoachMessage,
  AIDailySummary,
  SuggestedAction
} from '../types';
import {
  INITIAL_PROFILES,
  INITIAL_WORKOUTS,
  INITIAL_SUPPLEMENTS,
  INITIAL_INJURIES,
  INITIAL_MEALS,
  INITIAL_GOALS,
  INITIAL_HEALTH_METRICS,
  INITIAL_PHOTOS
} from '../lib/storage';
import { generateSmartDailySummary, processAICoachPrompt, generateWorkout, generateVariation, WorkoutGoal, enrichExerciseFromTemplate, suggestSubstituteExercise } from '../lib/ai-coach';
import {
  loadAllData,
  seedInitialData,
  AllData,
  syncProfile,
  syncWaterLog,
  syncMeal,
  syncSupplement,
  syncHealthMetric,
  syncInjury,
  syncPhoto,
  syncGoal,
  syncMessage,
  syncWorkout,
  syncWorkoutExercise,
  syncWorkoutLog,
  deleteWorkouts,
  deleteWorkoutExercise,
  loginUser,
  registerUser,
  resetPasswordByCpf,
  listUsers,
  setUserActive,
  setUserExpiration,
  ensureAdminAccount,
  validateResetIdentity,
  registerUserAdmin,
  updateUserProfileAdmin,
  updateUserPasswordAdmin,
  uploadAvatar,
  updateProfileAvatarUrl,
  UserWithProfile,
  RegisterInput
} from '../lib/db';
import { isSupabaseConfigured } from '../lib/supabase';
import { UserAccount } from '../types';

export type NavTab =
  | 'dashboard'
  | 'workouts'
  | 'aicoach'
  | 'evolution'
  | 'nutrition'
  | 'supplements'
  | 'health'
  | 'photos'
  | 'goals'
  | 'calendar'
  | 'profile'
  | 'admin';

// ── Helpers de resumo do treino ────────────────────────────────
function parseTargetReps(target: string): number {
  const m = target?.match(/(\d+(?:\.\d+)?)\s*(?:-|–)?\s*(\d+(?:\.\d+)?)?/);
  if (!m) return 0;
  const a = parseFloat(m[1]);
  const b = m[2] ? parseFloat(m[2]) : a;
  return (a + b) / 2;
}

export function computeTotalVolume(exercises: WorkoutExercise[]): number {
  let total = 0;
  for (const ex of exercises) {
    if (!ex.completed) continue;
    for (const s of ex.sets_data || []) {
      total += s.weight_kg * parseTargetReps(s.reps_target);
    }
  }
  return Math.round(total * 10) / 10;
}

export function useAppStore() {
  // Supabase sync status
  const [dbConnected, setDbConnected] = useState<boolean>(() => isSupabaseConfigured());

  // Authentication
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('coach_session_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [adminUsers, setAdminUsers] = useState<UserWithProfile[]>([]);

  const isAuthenticated = !!currentUser;

  const login = async (username: string, password: string) => {
    setAuthBusy(true);
    setAuthError(null);
    try {
      const result = await loginUser(username, password);
      setCurrentUser(result.account);
      localStorage.setItem('coach_session_user', JSON.stringify(result.account));
      setActiveProfileId(result.account.profile_id);
    } catch (e: any) {
      setAuthError(e.message);
      throw e;
    } finally {
      setAuthBusy(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('coach_session_user');
  };

  const register = async (input: RegisterInput, password: string) => {
    setAuthBusy(true);
    setAuthError(null);
    try {
      const profileId = await registerUser(input, password);
      if (profileId && input.avatarFile) {
        try {
          const url = await uploadAvatar(input.avatarFile, profileId);
          await updateProfileAvatarUrl(profileId, url);
        } catch (uploadErr: any) {
          console.error('Avatar upload falhou:', uploadErr);
        }
      }
    } catch (e: any) {
      setAuthError(e.message);
      throw e;
    } finally {
      setAuthBusy(false);
    }
  };

  const resetPassword = async (cpf: string, birthDate: string, newPassword: string) => {
    setAuthBusy(true);
    setAuthError(null);
    try {
      await resetPasswordByCpf(cpf, birthDate, newPassword);
    } catch (e: any) {
      setAuthError(e.message);
      throw e;
    } finally {
      setAuthBusy(false);
    }
  };

  const loadAdminUsers = async () => {
    if (!currentUser || currentUser.role !== 'admin') return;
    try {
      const users = await listUsers();
      setAdminUsers(users);
    } catch (e: any) {
      setAuthError(e.message);
    }
  };

  const toggleUserActive = async (accountId: string, isActive: boolean) => {
    try {
      await setUserActive(accountId, isActive);
      setAdminUsers(prev => prev.map(u => (u.id === accountId ? { ...u, is_active: isActive } : u)));
    } catch (e: any) {
      setAuthError(e.message);
    }
  };

  const updateUserExpiration = async (accountId: string, expiresAt: string | null, days?: number) => {
    try {
      await setUserExpiration(accountId, expiresAt, days);
      await loadAdminUsers();
    } catch (e: any) {
      setAuthError(e.message);
    }
  };

  const validateReset = async (cpf: string, birthDate: string) => {
    setAuthError(null);
    try {
      return await validateResetIdentity(cpf, birthDate);
    } catch (e: any) {
      setAuthError(e.message);
      throw e;
    }
  };

  const registerUserAsAdmin = async (input: RegisterInput, password: string) => {
    setAuthError(null);
    try {
      const profileId = await registerUserAdmin(input, password);
      if (profileId && input.avatarFile) {
        try {
          const url = await uploadAvatar(input.avatarFile, profileId);
          await updateProfileAvatarUrl(profileId, url);
        } catch (uploadErr: any) {
          console.error('Avatar upload falhou:', uploadErr);
        }
      }
      await loadAdminUsers();
    } catch (e: any) {
      setAuthError(e.message);
      throw e;
    }
  };

  const updateUserProfile = async (accountId: string, data: { name?: string; cpf?: string; birth_date?: string; email?: string; gender?: string }) => {
    setAuthError(null);
    try {
      await updateUserProfileAdmin(accountId, data);
      await loadAdminUsers();
    } catch (e: any) {
      setAuthError(e.message);
      throw e;
    }
  };

  const updateUserPassword = async (accountId: string, newPassword: string) => {
    setAuthError(null);
    try {
      await updateUserPasswordAdmin(accountId, newPassword);
    } catch (e: any) {
      setAuthError(e.message);
      throw e;
    }
  };

  // Theme
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('coach_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('coach_theme', next);
      return next;
    });
  };

  // Navigation
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Profiles
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    const saved = localStorage.getItem('coach_profiles');
    return saved ? JSON.parse(saved) : INITIAL_PROFILES;
  });

  const [activeProfileId, setActiveProfileId] = useState<string>(() => {
    const saved = localStorage.getItem('coach_active_profile_id');
    return saved || INITIAL_PROFILES[0].id;
  });

  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];

  // Workouts
  const [workouts, setWorkouts] = useState<Workout[]>(() => {
    const saved = localStorage.getItem('coach_workouts');
    return saved ? JSON.parse(saved) : INITIAL_WORKOUTS;
  });

  // Active workout tracking & Rest timer
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [restTimeRemaining, setRestTimeRemaining] = useState<number | null>(null);
  const [isResting, setIsResting] = useState<boolean>(false);
  const [cardioTimer, setCardioTimer] = useState<{ workoutId: string; exerciseId: string; endsAt: number } | null>(null);
  const [cardioRemaining, setCardioRemaining] = useState<number | null>(null);

  // Sessão de treino / Histórico de treinos realizados
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>(() => {
    const saved = localStorage.getItem('coach_workout_logs');
    return saved ? JSON.parse(saved) : [];
  });
  const [sessionStartedAt, setSessionStartedAt] = useState<string | null>(null);
  const [workoutResult, setWorkoutResult] = useState<WorkoutResult | null>(null);
  const prevAllCompletedRef = useRef<Set<string>>(new Set());

  // Meals
  const [meals, setMeals] = useState<Meal[]>(() => {
    const saved = localStorage.getItem('coach_meals');
    return saved ? JSON.parse(saved) : INITIAL_MEALS;
  });

  // Water
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>(() => {
    const saved = localStorage.getItem('coach_water_logs');
    return saved ? JSON.parse(saved) : [];
  });

  // Supplements
  const [supplements, setSupplements] = useState<Supplement[]>(() => {
    const saved = localStorage.getItem('coach_supplements');
    return saved ? JSON.parse(saved) : INITIAL_SUPPLEMENTS;
  });

  // Health & Metrics
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>(() => {
    const saved = localStorage.getItem('coach_health_metrics');
    return saved ? JSON.parse(saved) : INITIAL_HEALTH_METRICS;
  });

  // Injuries & Pain
  const [injuries, setInjuries] = useState<InjuryPainLog[]>(() => {
    const saved = localStorage.getItem('coach_injuries');
    return saved ? JSON.parse(saved) : INITIAL_INJURIES;
  });

  // Photos
  const [photos, setPhotos] = useState<EvolutionPhoto[]>(() => {
    const saved = localStorage.getItem('coach_photos');
    return saved ? JSON.parse(saved) : INITIAL_PHOTOS;
  });

  // Goals
  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('coach_goals');
    return saved ? JSON.parse(saved) : INITIAL_GOALS;
  });

  // AI Coach Messages
  const [messages, setMessages] = useState<AICoachMessage[]>(() => {
    const saved = localStorage.getItem('coach_ai_messages');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'msg-welcome',
            profile_id: INITIAL_PROFILES[0].id,
            sender: 'ai',
            message: `Olá Leonardo! Sou o seu Coach IA Pessoal. Hoje estou pronto para orientar seu treino, monitorar sua progressão de cargas, sua nutrição e proteger seu joelho direito. Como está se sentindo?`,
            created_at: new Date().toISOString()
          }
        ];
  });

  // Save to localStorage on state changes
  useEffect(() => {
    localStorage.setItem('coach_profiles', JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem('coach_active_profile_id', activeProfileId);
  }, [activeProfileId]);

  useEffect(() => {
    localStorage.setItem('coach_workouts', JSON.stringify(workouts));
  }, [workouts]);

  useEffect(() => {
    localStorage.setItem('coach_workout_logs', JSON.stringify(workoutLogs));
  }, [workoutLogs]);

  useEffect(() => {
    localStorage.setItem('coach_meals', JSON.stringify(meals));
  }, [meals]);

  useEffect(() => {
    localStorage.setItem('coach_water_logs', JSON.stringify(waterLogs));
  }, [waterLogs]);

  useEffect(() => {
    localStorage.setItem('coach_supplements', JSON.stringify(supplements));
  }, [supplements]);

  useEffect(() => {
    localStorage.setItem('coach_health_metrics', JSON.stringify(healthMetrics));
  }, [healthMetrics]);

  useEffect(() => {
    localStorage.setItem('coach_injuries', JSON.stringify(injuries));
  }, [injuries]);

  useEffect(() => {
    localStorage.setItem('coach_photos', JSON.stringify(photos));
  }, [photos]);

  useEffect(() => {
    localStorage.setItem('coach_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('coach_ai_messages', JSON.stringify(messages));
  }, [messages]);

  const refreshFromDB = (data: AllData) => {
    if (!data) return;
    setProfiles(data.profiles);
    setWorkouts(data.workouts.map(w => ({
      ...w,
      exercises: w.exercises?.map(enrichExerciseFromTemplate)
    })));
    setWorkoutLogs(data.workoutLogs || []);
    setMeals(data.meals);
    setWaterLogs(data.waterLogs);
    setSupplements(data.supplements);
    setHealthMetrics(data.healthMetrics);
    setInjuries(data.injuries);
    setPhotos(data.photos);
    setGoals(data.goals);
    setMessages(data.messages);
  };

  // Load data from Supabase on mount
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    loadAllData().then(data => {
      if (!data) return;
      refreshFromDB(data);
    });
  }, []);

  // Seed initial data if database is empty + ensure admin account
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    loadAllData().then(data => {
      if (!data) return;
      const hasProfiles = data.profiles.length > 0;
      if (!hasProfiles) {
        seedInitialData({
          profiles: INITIAL_PROFILES,
          workouts: INITIAL_WORKOUTS,
          workoutLogs: [],
          meals: INITIAL_MEALS,
          waterLogs: [],
          supplements: INITIAL_SUPPLEMENTS,
          healthMetrics: INITIAL_HEALTH_METRICS,
          injuries: INITIAL_INJURIES,
          photos: INITIAL_PHOTOS,
          goals: INITIAL_GOALS,
          messages: []
        });
        refreshFromDB({
          profiles: INITIAL_PROFILES,
          workouts: INITIAL_WORKOUTS,
          workoutLogs: [],
          meals: INITIAL_MEALS,
          waterLogs: [],
          supplements: INITIAL_SUPPLEMENTS,
          healthMetrics: INITIAL_HEALTH_METRICS,
          injuries: INITIAL_INJURIES,
          photos: INITIAL_PHOTOS,
          goals: INITIAL_GOALS,
          messages: []
        });
      }
      ensureAdminAccount('11753940761', '1986-05-17', '123456');
    });
  }, []);

  // Rest Timer Countdown Interval
  useEffect(() => {
    let interval: any = null;
    if (isResting && restTimeRemaining !== null && restTimeRemaining > 0) {
      interval = setInterval(() => {
        setRestTimeRemaining(prev => {
          if (prev === null || prev <= 1) {
            setIsResting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting, restTimeRemaining]);

  // Cardio Countdown: ao chegar a zero, marca o exercício como realizado
  useEffect(() => {
    if (!cardioTimer) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.round((cardioTimer.endsAt - Date.now()) / 1000));
      setCardioRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        const timer = cardioTimer;
        setCardioTimer(null);
        setCardioRemaining(null);

        setWorkouts(prev =>
          prev.map(w => {
            if (w.id !== timer.workoutId || !w.exercises) return w;
            return {
              ...w,
              exercises: w.exercises.map(ex => {
                if (ex.id !== timer.exerciseId || ex.completed) return ex;
                const done = { ...ex, completed: true };
                if (isSupabaseConfigured()) syncWorkoutExercise(done);
                return done;
              })
            };
          })
        );
      }
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardioTimer]);

  // Profile Specific Filters
  const userWorkouts = workouts.filter(w => w.profile_id === activeProfile.id);
  const userWorkoutLogs = [...workoutLogs]
    .filter(l => l.profile_id === activeProfile.id)
    .sort((a, b) => (b.completed_at || b.started_at).localeCompare(a.completed_at || a.started_at));
  const lastWorkoutLog = userWorkoutLogs[0] || null;
  const userSupplements = supplements.filter(s => s.profile_id === activeProfile.id);
  const userInjuries = injuries.filter(i => i.profile_id === activeProfile.id);
  const userGoals = goals.filter(g => g.profile_id === activeProfile.id);
  const userHealthMetrics = healthMetrics.filter(h => h.profile_id === activeProfile.id);
  const userPhotos = photos.filter(p => p.profile_id === activeProfile.id);
  const userMessages = messages.filter(m => m.profile_id === activeProfile.id);

  // Today's Date helpers
  const todayStr = new Date().toISOString().split('T')[0];
  const todayMeals = meals.filter(
    m => m.profile_id === activeProfile.id && m.consumed_at.startsWith(todayStr)
  );
  const todayWaterTotal = waterLogs
    .filter(w => w.profile_id === activeProfile.id && w.logged_at.startsWith(todayStr))
    .reduce((acc, curr) => acc + curr.amount_ml, 0);

  // Nutrition Totals for Today
  const todayCalories = todayMeals.reduce((acc, m) => acc + m.total_calories, 0);
  const todayProtein = todayMeals.reduce((acc, m) => acc + m.total_protein_g, 0);
  const todayCarbs = todayMeals.reduce((acc, m) => acc + m.total_carbs_g, 0);
  const todayFats = todayMeals.reduce((acc, m) => acc + m.total_fats_g, 0);

  // Smart Summary
  const todayWorkout = userWorkouts[0];
  const lastHealth = userHealthMetrics[userHealthMetrics.length - 1];
  const kneeInjury = userInjuries.find(i => i.body_part.toLowerCase().includes('joelho'));
  const smartDailySummary: AIDailySummary = generateSmartDailySummary(
    activeProfile,
    todayWorkout,
    lastHealth,
    kneeInjury
  );

  // Profile Actions
  const switchProfile = (id: string) => {
    setActiveProfileId(id);
  };

  const addProfile = (newProfile: Profile) => {
    setProfiles(prev => [...prev, newProfile]);
    setActiveProfileId(newProfile.id);
    syncProfile(newProfile);
  };

  const updateProfile = (updated: Profile) => {
    setProfiles(prev => prev.map(p => (p.id === updated.id ? updated : p)));
    syncProfile(updated);
  };

  // Workout Actions
  const toggleSetCompleted = (workoutId: string, exerciseId: string, setNumber: number) => {
    if (!sessionStartedAt) setSessionStartedAt(new Date().toISOString());

    setWorkouts(prev => {
      const next = prev.map(w => {
        if (w.id !== workoutId || !w.exercises) return w;

        return {
          ...w,
          exercises: w.exercises.map(ex => {
            if (ex.id !== exerciseId) return ex;

            // Update sets_data
            const updatedSets = (ex.sets_data || []).map(s => {
              if (s.set_number === setNumber) {
                return { ...s, completed: !s.completed };
              }
              return s;
            });

            // If all sets are completed, mark exercise as completed
            const allCompleted = updatedSets.length > 0 && updatedSets.every(s => s.completed);

            return {
              ...ex,
              sets_data: updatedSets,
              completed: allCompleted
            };
          })
        };
      });

      const target = next.find(w => w.id === workoutId)?.exercises?.find(e => e.id === exerciseId);
      if (target) syncWorkoutExercise(target);
      return next;
    });
  };

  const toggleExerciseCompleted = (workoutId: string, exerciseId: string) => {
    if (!sessionStartedAt) setSessionStartedAt(new Date().toISOString());

    setWorkouts(prev => {
      const next = prev.map(w => {
        if (w.id === workoutId && w.exercises) {
          return {
            ...w,
            exercises: w.exercises.map(e => {
              if (e.id === exerciseId) {
                const nextCompleted = !e.completed;
                return {
                  ...e,
                  completed: nextCompleted,
                  sets_data: (e.sets_data || []).map(s => ({ ...s, completed: nextCompleted }))
                };
              }
              return e;
            })
          };
        }
        return w;
      });

      const target = next.find(w => w.id === workoutId)?.exercises?.find(e => e.id === exerciseId);
      if (target) syncWorkoutExercise(target);
      return next;
    });
  };

  const toggleWorkoutCompleted = (workoutId: string) => {
    const w = workouts.find(x => x.id === workoutId);
    if (!w) return;
    if (w.is_completed) {
      setWorkouts(prev => prev.map(x => (x.id === workoutId ? { ...x, is_completed: false } : x)));
      syncWorkout({ ...w, is_completed: false, last_completed_at: w.last_completed_at ?? null });
    } else {
      finalizeWorkout(w);
    }
  };

  const finalizeWorkout = (w: Workout) => {
    if (w.is_completed) return;
    const now = new Date();
    const startedTs = sessionStartedAt ? new Date(sessionStartedAt).getTime() : null;
    const durationSeconds = startedTs
      ? Math.max(1, Math.round((now.getTime() - startedTs) / 1000))
      : (w.estimated_duration_min || 0) * 60;
    const totalVolumeKg = computeTotalVolume(w.exercises || []);
    const completedAt = now.toISOString();

    const log: WorkoutLog = {
      id: `log-${Date.now()}`,
      profile_id: activeProfile.id,
      workout_id: w.id,
      workout_title: w.title,
      started_at: sessionStartedAt || completedAt,
      completed_at: completedAt,
      duration_seconds: durationSeconds,
      total_volume_kg: totalVolumeKg
    };

    setWorkouts(prev =>
      prev.map(x =>
        x.id === w.id ? { ...x, is_completed: true, last_completed_at: completedAt } : x
      )
    );
    syncWorkout({ ...w, is_completed: true, last_completed_at: completedAt });

    setWorkoutLogs(prev => [log, ...prev]);
    syncWorkoutLog(log);
    setSessionStartedAt(null);

    setWorkoutResult({
      workoutId: w.id,
      workoutTitle: w.title,
      totalVolumeKg,
      durationSeconds,
      completedAt
    });
  };

  const confirmWorkoutResult = () => {
    if (workoutResult) {
      const wid = workoutResult.workoutId;
      setWorkouts(prev =>
        prev.map(w => {
          if (w.id !== wid) return w;
          const exercises = (w.exercises || []).map(ex => ({
            ...ex,
            completed: false,
            sets_data: (ex.sets_data || []).map(s => ({ ...s, completed: false }))
          }));
          if (isSupabaseConfigured()) exercises.forEach(syncWorkoutExercise);
          syncWorkout({ ...w, exercises, is_completed: false, last_completed_at: w.last_completed_at ?? null });
          return { ...w, exercises, is_completed: false };
        })
      );
      setSessionStartedAt(null);
    }
    setWorkoutResult(null);
  };

  // Auto-finaliza o treino quando todos os exercícios são concluídos
  useEffect(() => {
    for (const w of workouts) {
      const allDone = (w.exercises?.length || 0) > 0 && w.exercises!.every(e => e.completed);
      const wasAllDone = prevAllCompletedRef.current.has(w.id);
      if (allDone && !wasAllDone) {
        finalizeWorkout(w);
      }
      if (allDone) prevAllCompletedRef.current.add(w.id);
      else prevAllCompletedRef.current.delete(w.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workouts]);

  const updateExerciseWeight = (workoutId: string, exerciseId: string, newWeightKg: number) => {
    setWorkouts(prev =>
      prev.map(w => {
        if (w.id !== workoutId || !w.exercises) return w;

        return {
          ...w,
          exercises: w.exercises.map(ex => {
            if (ex.id !== exerciseId) return ex;

            return {
              ...ex,
              default_weight_kg: newWeightKg,
              sets_data: (ex.sets_data || []).map(s => ({ ...s, weight_kg: newWeightKg }))
            };
          })
        };
      })
    );
  };

  const updateSetWeight = (workoutId: string, exerciseId: string, setNumber: number, newWeightKg: number) => {
    setWorkouts(prev =>
      prev.map(w => {
        if (w.id !== workoutId || !w.exercises) return w;

        return {
          ...w,
          exercises: w.exercises.map(ex => {
            if (ex.id !== exerciseId) return ex;

            return {
              ...ex,
              sets_data: (ex.sets_data || []).map(s =>
                s.set_number === setNumber ? { ...s, weight_kg: newWeightKg } : s
              )
            };
          })
        };
      })
    );
  };

  const updateExerciseDuration = (workoutId: string, exerciseId: string, newDurationMin: number) => {
    setWorkouts(prev =>
      prev.map(w => {
        if (w.id !== workoutId || !w.exercises) return w;

        const updatedEx = w.exercises.map(ex => {
          if (ex.id !== exerciseId) return ex;

          return {
            ...ex,
            duration_minutes: newDurationMin,
            reps_target: `${newDurationMin} min`,
            sets_data: (ex.sets_data || []).map(s => ({ ...s, reps_target: `${newDurationMin} min` }))
          };
        });

        const target = updatedEx.find(ex => ex.id === exerciseId);
        if (target) syncWorkoutExercise(target);
        return { ...w, exercises: updatedEx };
      })
    );
  };

  const updateExerciseVideo = (workoutId: string, exerciseId: string, videoUrl: string) => {
    setWorkouts(prev =>
      prev.map(w => {
        if (w.id !== workoutId || !w.exercises) return w;

        const updatedEx = w.exercises.map(ex =>
          ex.id === exerciseId ? { ...ex, video_url: videoUrl || undefined } : ex
        );

        const updated = { ...w, exercises: updatedEx };
        const target = updatedEx.find(ex => ex.id === exerciseId);
        if (target) syncWorkoutExercise(target);
        return updated;
      })
    );
  };

  const startRestTimer = (seconds: number) => {
    setRestTimeRemaining(seconds);
    setIsResting(true);
  };

  const cancelRestTimer = () => {
    setIsResting(false);
    setRestTimeRemaining(null);
  };

  const startCardioTimer = (workoutId: string, exerciseId: string, durationSeconds: number) => {
    const seconds = Math.max(1, Math.round(durationSeconds));
    setCardioTimer({ workoutId, exerciseId, endsAt: Date.now() + seconds * 1000 });
    setCardioRemaining(seconds);
    if (!sessionStartedAt) setSessionStartedAt(new Date().toISOString());
  };

  const stopCardioTimer = () => {
    setCardioTimer(null);
    setCardioRemaining(null);
  };

  // Nutrition Actions
  const addWater = (amountMl: number) => {
    const newLog: WaterLog = {
      id: `wtr-${Date.now()}`,
      profile_id: activeProfile.id,
      amount_ml: amountMl,
      logged_at: new Date().toISOString()
    };
    setWaterLogs(prev => [...prev, newLog]);
    syncWaterLog(newLog);
  };

  const addMeal = (meal: Omit<Meal, 'id' | 'profile_id'>) => {
    const newMeal: Meal = {
      ...meal,
      id: `meal-${Date.now()}`,
      profile_id: activeProfile.id
    };
    setMeals(prev => [newMeal, ...prev]);
    syncMeal(newMeal);
  };

  // Supplement Actions
  const addSupplement = (supp: Omit<Supplement, 'id' | 'profile_id'>) => {
    const newSupp: Supplement = {
      ...supp,
      id: `supp-${Date.now()}`,
      profile_id: activeProfile.id
    };
    setSupplements(prev => [...prev, newSupp]);
    syncSupplement(newSupp);
  };

  const takeSupplementDose = (suppId: string) => {
    setSupplements(prev =>
      prev.map(s => {
        if (s.id === suppId) {
          const updated = { ...s, current_stock_doses: Math.max(0, s.current_stock_doses - 1) };
          syncSupplement(updated);
          return updated;
        }
        return s;
      })
    );
  };

  // Health Actions
  const addHealthMetric = (metric: Omit<HealthMetric, 'id' | 'profile_id'>) => {
    const newMetric: HealthMetric = {
      ...metric,
      id: `hm-${Date.now()}`,
      profile_id: activeProfile.id
    };
    setHealthMetrics(prev => [...prev, newMetric]);
    syncHealthMetric(newMetric);
    if (metric.weight_kg) {
      updateProfile({ ...activeProfile, current_weight: metric.weight_kg });
    }
  };

  const addInjuryLog = (injury: Omit<InjuryPainLog, 'id' | 'profile_id'>) => {
    const newLog: InjuryPainLog = {
      ...injury,
      id: `inj-${Date.now()}`,
      profile_id: activeProfile.id
    };
    setInjuries(prev => [newLog, ...prev]);
    syncInjury(newLog);
  };

  const updateInjuryPainLevel = (injuryId: string, level: number) => {
    setInjuries(prev =>
      prev.map(i => {
        if (i.id !== injuryId) return i;
        const updated = { ...i, pain_level: level };
        syncInjury(updated);
        return updated;
      })
    );
  };

  // Photos Actions
  const addPhoto = (photo: Omit<EvolutionPhoto, 'id' | 'profile_id'>) => {
    const newPhoto: EvolutionPhoto = {
      ...photo,
      id: `photo-${Date.now()}`,
      profile_id: activeProfile.id
    };
    setPhotos(prev => [newPhoto, ...prev]);
    syncPhoto(newPhoto);
  };

  // Goals Actions
  const addGoal = (goal: Omit<Goal, 'id' | 'profile_id'>) => {
    const newGoal: Goal = {
      ...goal,
      id: `goal-${Date.now()}`,
      profile_id: activeProfile.id
    };
    setGoals(prev => [...prev, newGoal]);
    syncGoal(newGoal);
  };

  // AI Chat Actions
  const sendAICoachMessage = (userText: string) => {
    const userMsg: AICoachMessage = {
      id: `msg-user-${Date.now()}`,
      profile_id: activeProfile.id,
      sender: 'user',
      message: userText,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    syncMessage(userMsg);

    setTimeout(() => {
      const response = processAICoachPrompt(userText, activeProfile, todayWorkout, userInjuries, userWorkouts);
      const aiMsg: AICoachMessage = {
        id: `msg-ai-${Date.now()}`,
        profile_id: activeProfile.id,
        sender: 'ai',
        message: response.message,
        intent_type: response.intent,
        suggested_actions: response.suggestedActions,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMsg]);
      syncMessage(aiMsg);
    }, 600);
  };

  // AI Suggested Actions (botões do Coach)
  const coachReply = (message: string, suggestedActions?: SuggestedAction[]) => {
    const aiMsg: AICoachMessage = {
      id: `msg-ai-${Date.now()}`,
      profile_id: activeProfile.id,
      sender: 'ai',
      message,
      intent_type: 'general',
      suggested_actions: suggestedActions,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, aiMsg]);
    syncMessage(aiMsg);
  };

  const handleCoachAction = async (action?: SuggestedAction | null): Promise<{ navigateTo?: string } | undefined> => {
    if (!action) return;
    const type = action.action;
    const targetWorkout = userWorkouts.find(w => w.id === action.workoutId) || userWorkouts[0];

    switch (type) {
      case 'start_workout': return { navigateTo: 'workouts' };
      case 'view_summary': return { navigateTo: 'dashboard' };
      case 'view_nutrition':
      case 'add_protein_snack': return { navigateTo: 'nutrition' };
      case 'set_rest_day': return { navigateTo: 'workouts' };
      case 'log_pain': return { navigateTo: 'health' };

      case 'list_exercises': {
        const withEx = userWorkouts.filter(w => w.exercises && w.exercises.length > 0);
        if (withEx.length === 0) {
          coachReply('Você ainda não possui um treino salvo com exercícios.');
          return;
        }
        const blocks = withEx.map((w, wi) => {
          const items = (w.exercises || []).map((e, i) => `${i + 1}. ${e.name} (${e.sets}x ${e.reps_target})`).join('\n');
          const tag = w.id === targetWorkout?.id ? ' — **hoje**' : '';
          return `**Treino ${wi + 1}${tag}:**\n${items}`;
        });
        coachReply(`📋 **Sua ficha completa (${withEx.length} ${withEx.length === 1 ? 'treino' : 'treinos'}):**\n\n${blocks.join('\n\n')}`);
        return;
      }

      case 'take_blend': {
        const blend = supplements.find(s => s.is_custom_blend || s.name.toLowerCase().includes('mistura'));
        if (blend) {
          takeSupplementDose(blend.id);
          coachReply(`✅ Dose da **${blend.name}** registrada! Restam ${Math.max(0, blend.current_stock_doses - 1)} doses em estoque.`);
        } else {
          coachReply('⚠️ Nenhuma mistura personalizada encontrada no estoque. Você pode cadastrar uma na aba **Suplementos**.');
        }
        return;
      }

      case 'increase_water': {
        addWater(500);
        coachReply('💧 **+500ml de água registrados!** Continue se hidratando.');
        return;
      }

      case 'remove_exercise': {
        const workout = targetWorkout;
        if (!workout || !workout.exercises || workout.exercises.length === 0) {
          coachReply('⚠️ Não encontrei um treino salvo para fazer o ajuste.');
          return;
        }
        const exercise = workout.exercises.find(e => e.id === action.exerciseId);
        if (!exercise) {
          coachReply(`⚠️ O exercício "${action.exerciseName || ''}" não está na sua ficha atual.`);
          return;
        }
        const currentNames = workout.exercises.map(e => e.name);
        const substitute = suggestSubstituteExercise(exercise.muscle_group, currentNames, workout.id);
        if (substitute) {
          substitute.id = `ex-ai-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
          substitute.order_index = exercise.order_index;
          substitute.default_weight_kg = exercise.default_weight_kg || substitute.default_weight_kg;
          substitute.sets_data = (substitute.sets_data || []).map(s => ({ ...s, weight_kg: substitute.default_weight_kg || 0 }));
          const next = workout.exercises.map(e => e.id === exercise.id ? substitute : e);
          setWorkouts(prev => prev.map(w => w.id === workout.id ? { ...w, exercises: next } : w));
          await deleteWorkoutExercise(exercise.id);
          await syncWorkoutExercise(substitute);
          coachReply(`🗑️ **"${exercise.name}" foi removido** e o **"${substitute.name}" foi incluído em seu lugar** (foco: ${substitute.muscle_group}).\n\nSua ficha segue completa com ${next.length} exercícios. Qualquer outro ajuste, é só avisar.`);
} else {
          coachReply(`ℹ️ Prefiro manter o **"${exercise.name}"** na sua ficha por enquanto: não há outro exercício disponível no meu banco para substituí-lo sem deixar seu treino com um exercício a menos (${exercise.muscle_group}). Se precisar mesmo removê-lo, posso incluir antes um exercício novo para você.`);
          return;
        }
        return;
      }

      case 'apply_review': {
        const workout = targetWorkout;
        if (!workout || !workout.exercises || workout.exercises.length === 0) {
          coachReply('⚠️ Não encontrei exercícios para revisar.');
          return;
        }
        const updated = workout.exercises.map(e => ({
          ...e,
          default_weight_kg: Math.max(0, Math.round((e.default_weight_kg || 0) * 0.8)),
          rest_time_seconds: Math.min(180, Math.round((e.rest_time_seconds || 60) * 1.3)),
          sets_data: (e.sets_data || []).map(s => ({ ...s, weight_kg: Math.max(0, Math.round((s.weight_kg || 0) * 0.8)) }))
        }));
        setWorkouts(prev => prev.map(w => w.id === workout.id ? { ...w, exercises: updated } : w));
        await Promise.all(updated.map(e => syncWorkoutExercise(e)));
        coachReply(`📋 **Revisão aplicada no seu treino!**\n\n- Cargas reduzidas em **20%**\n- Descanso entre séries aumentado\n\nTreine com calma, priorizando a técnica. Qualquer desconforto, me avise.`);
        return;
      }

      default:
        return;
    }
  };

  // AI Workout Generation
  const generateAndSaveWorkout = async (goal: WorkoutGoal, count: number = 1): Promise<Workout[]> => {
    const results: Workout[] = [];
    const variations = count > 1 ? Array.from({ length: count }, (_, i) => i) : [0];

    for (const idx of variations) {
      const result = idx === 0 ? generateWorkout(goal, activeProfile) : generateVariation(goal, activeProfile, idx);
      const workoutId = `wkt-ai-${Date.now()}-${idx}`;
      const newWorkout: Workout = {
        ...result.workout,
        id: workoutId,
        profile_id: activeProfile.id,
        exercises: result.exercises.map(ex => ({ ...ex, workout_id: workoutId }))
      };

      setWorkouts(prev => [newWorkout, ...prev]);
      await syncWorkout(newWorkout);
      for (const ex of newWorkout.exercises ?? []) {
        await syncWorkoutExercise(ex);
      }
      results.push(newWorkout);
    }

    // Post AI message describing the new workout(s)
    const aiMsg: AICoachMessage = {
      id: `msg-ai-${Date.now()}`,
      profile_id: activeProfile.id,
      sender: 'ai',
      message: `✅ **${results.length > 1 ? `${results.length} treinos gerados com sucesso!` : 'Treino gerado com sucesso!'}**\n\n${results.map(r => r.notes).join('\n\n---\n\n')}`,
      intent_type: 'general',
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, aiMsg]);
    syncMessage(aiMsg);

    return results;
  };

  // Keep only one workout (set): deletes all current workouts before creating a new one
  const clearWorkouts = () => {
    const toDelete = workouts.filter(w => w.profile_id === activeProfile.id);
    if (toDelete.length === 0) return;
    setWorkouts(prev => prev.filter(w => w.profile_id !== activeProfile.id));
    deleteWorkouts(toDelete.map(w => w.id));
  };

  return {
    dbConnected,
    currentUser,
    isAuthenticated,
    authBusy,
    authError,
    login,
    logout,
    register,
    resetPassword,
    adminUsers,
    loadAdminUsers,
    toggleUserActive,
    updateUserExpiration,
    validateReset,
    registerUserAsAdmin,
    updateUserProfile,
    updateUserPassword,
    theme,
    toggleTheme,
    activeTab,
    setActiveTab,
    profiles,
    activeProfile,
    activeProfileId,
    switchProfile,
    addProfile,
    updateProfile,
    workouts: userWorkouts,
    allWorkouts: workouts,
    activeWorkout,
    setActiveWorkout,
    workoutLogs: userWorkoutLogs,
    lastWorkoutLog,
    workoutResult,
    confirmWorkoutResult,
    toggleSetCompleted,
    toggleExerciseCompleted,
    toggleWorkoutCompleted,
    updateSetWeight,
    updateExerciseWeight,
    updateExerciseDuration,
    updateExerciseVideo,
    isResting,
    restTimeRemaining,
    startRestTimer,
    cancelRestTimer,
    cardioTimer,
    cardioRemaining,
    startCardioTimer,
    stopCardioTimer,
    meals: todayMeals,
    allMeals: meals,
    todayCalories,
    todayProtein,
    todayCarbs,
    todayFats,
    addMeal,
    todayWaterTotal,
    addWater,
    supplements: userSupplements,
    addSupplement,
    takeSupplementDose,
    healthMetrics: userHealthMetrics,
    addHealthMetric,
    injuries: userInjuries,
    addInjuryLog,
    updateInjuryPainLevel,
    photos: userPhotos,
    addPhoto,
    goals: userGoals,
    addGoal,
    messages: userMessages,
    sendAICoachMessage,
    handleCoachAction,
    generateAndSaveWorkout,
    clearWorkouts,
    smartDailySummary
  };
}