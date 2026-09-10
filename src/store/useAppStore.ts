import { useState, useEffect } from 'react';
import {
  Profile,
  Workout,
  WorkoutExercise,
  Meal,
  WaterLog,
  Supplement,
  HealthMetric,
  InjuryPainLog,
  EvolutionPhoto,
  Goal,
  AICoachMessage,
  AIDailySummary
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
import { generateSmartDailySummary, processAICoachPrompt } from '../lib/ai-coach';
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
  syncMessage
} from '../lib/db';
import { isSupabaseConfigured } from '../lib/supabase';

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
  | 'profile';

export function useAppStore() {
  // Supabase sync status
  const [dbConnected, setDbConnected] = useState<boolean>(() => isSupabaseConfigured());

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
    setWorkouts(data.workouts);
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

  // Seed initial data if database is empty
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    loadAllData().then(data => {
      if (!data) return;
      const hasProfiles = data.profiles.length > 0;
      if (!hasProfiles) {
        seedInitialData({
          profiles: INITIAL_PROFILES,
          workouts: INITIAL_WORKOUTS,
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

  // Profile Specific Filters
  const userWorkouts = workouts.filter(w => w.profile_id === activeProfile.id);
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
    setWorkouts(prev =>
      prev.map(w => {
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
      })
    );
  };

  const toggleExerciseCompleted = (workoutId: string, exerciseId: string) => {
    setWorkouts(prev =>
      prev.map(w => {
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
      })
    );
  };

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

  const updateExerciseDuration = (workoutId: string, exerciseId: string, newDurationMin: number) => {
    setWorkouts(prev =>
      prev.map(w => {
        if (w.id !== workoutId || !w.exercises) return w;

        return {
          ...w,
          exercises: w.exercises.map(ex => {
            if (ex.id !== exerciseId) return ex;

            return {
              ...ex,
              duration_minutes: newDurationMin,
              reps_target: `${newDurationMin} min`,
              sets_data: (ex.sets_data || []).map(s => ({ ...s, reps_target: `${newDurationMin} min` }))
            };
          })
        };
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
      const response = processAICoachPrompt(userText, activeProfile, todayWorkout, userInjuries);
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

  return {
    dbConnected,
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
    toggleSetCompleted,
    toggleExerciseCompleted,
    updateExerciseWeight,
    updateExerciseDuration,
    isResting,
    restTimeRemaining,
    startRestTimer,
    cancelRestTimer,
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
    smartDailySummary
  };
}