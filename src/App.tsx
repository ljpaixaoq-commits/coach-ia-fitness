import React, { useState, useEffect } from 'react';
import { useAppStore, NavTab } from './store/useAppStore';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { RestTimerWidget } from './components/common/RestTimerWidget';
import { SmartSummaryModal } from './components/common/SmartSummaryModal';

// 11 Views
import { DashboardView } from './views/DashboardView';
import { WorkoutsView } from './views/WorkoutsView';
import { AICoachView } from './views/AICoachView';
import { EvolutionView } from './views/EvolutionView';
import { NutritionView } from './views/NutritionView';
import { SupplementsView } from './views/SupplementsView';
import { HealthView } from './views/HealthView';
import { PhotosView } from './views/PhotosView';
import { GoalsView } from './views/GoalsView';
import { CalendarView } from './views/CalendarView';
import { ProfileFamilyView } from './views/ProfileFamilyView';
import { AuthView } from './views/AuthView';
import { AdminUsersView } from './views/AdminUsersView';

import {
  TrendingUp,
  Pill,
  HeartPulse,
  Camera,
  Target,
  CalendarDays,
  Users,
  ShieldCheck,
  X
} from 'lucide-react';

export function App() {
  const store = useAppStore();
  const [isSmartSummaryModalOpen, setIsSmartSummaryModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sync theme class on <html> element
  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove('dark', 'light');
    html.classList.add(store.theme);
  }, [store.theme]);

  if (!store.isAuthenticated) {
    return (
      <AuthView
        onLogin={store.login}
        onRegister={store.register}
        onResetPassword={store.resetPassword}
        onValidateReset={store.validateReset}
        authBusy={store.authBusy}
        authError={store.authError}
      />
    );
  }

  const customBlend = store.supplements.find((s) => s.is_custom_blend);

  const handleTakeBlendDose = () => {
    if (customBlend) {
      store.takeSupplementDose(customBlend.id);
    }
  };

  return (
    <div className="min-h-screen bg-surface-primary text-content-primary flex flex-col font-sans">
      {/* 1. Header */}
      <Header
        activeProfile={store.activeProfile}
        profiles={store.profiles}
        onSwitchProfile={store.switchProfile}
        activeTab={store.activeTab}
        onOpenSmartSummary={() => setIsSmartSummaryModalOpen(true)}
        theme={store.theme}
        onToggleTheme={store.toggleTheme}
        currentUserName={store.currentUser?.profile_id ? store.activeProfile.name : undefined}
        isAdmin={store.currentUser?.role === 'admin'}
        onLogout={store.logout}
      />

      {/* 2. Main Content Area with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar activeTab={store.activeTab} onSelectTab={store.setActiveTab} isAdmin={store.currentUser?.role === 'admin'} />

        {/* Dynamic Screen View */}
        <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 max-w-7xl mx-auto w-full">
          {store.activeTab === 'dashboard' && (
            <DashboardView
              profile={store.activeProfile}
              todayWorkout={store.workouts[0]}
              smartSummary={store.smartDailySummary}
              todayCalories={store.todayCalories}
              todayProtein={store.todayProtein}
              todayCarbs={store.todayCarbs}
              todayFats={store.todayFats}
              todayWaterTotal={store.todayWaterTotal}
              goals={store.goals}
              onNavigate={store.setActiveTab}
              onAddWater={store.addWater}
              onOpenSmartSummary={() => setIsSmartSummaryModalOpen(true)}
              onTakeBlendDose={handleTakeBlendDose}
            />
          )}

          {store.activeTab === 'workouts' && (
            <WorkoutsView
              workouts={store.workouts}
              onToggleExercise={store.toggleExerciseCompleted}
              onToggleSet={store.toggleSetCompleted}
              onUpdateWeight={store.updateExerciseWeight}
              onUpdateDuration={store.updateExerciseDuration}
              onUpdateVideo={store.updateExerciseVideo}
              onStartRestTimer={store.startRestTimer}
              onAskAIForAdaptation={(prompt) => {
                store.sendAICoachMessage(prompt);
                store.setActiveTab('aicoach');
              }}
            />
          )}

          {store.activeTab === 'aicoach' && (
            <AICoachView
              profile={store.activeProfile}
              messages={store.messages}
              todayWorkout={store.workouts[0]}
              injuries={store.injuries}
              onSendMessage={store.sendAICoachMessage}
              onGenerateWorkout={store.generateAndSaveWorkout}
              onNavigateTab={(tab) => store.setActiveTab(tab as NavTab)}
              hasWorkouts={store.workouts.length > 0}
              onClearWorkouts={store.clearWorkouts}
            />
          )}

          {store.activeTab === 'evolution' && (
            <EvolutionView
              profile={store.activeProfile}
              healthMetrics={store.healthMetrics}
              onAddMetric={store.addHealthMetric}
            />
          )}

          {store.activeTab === 'nutrition' && (
            <NutritionView
              profile={store.activeProfile}
              meals={store.meals}
              todayCalories={store.todayCalories}
              todayProtein={store.todayProtein}
              todayCarbs={store.todayCarbs}
              todayFats={store.todayFats}
              todayWaterTotal={store.todayWaterTotal}
              onAddMeal={store.addMeal}
              onAddWater={store.addWater}
            />
          )}

          {store.activeTab === 'supplements' && (
            <SupplementsView
              supplements={store.supplements}
              onTakeDose={store.takeSupplementDose}
              onAddSupplement={store.addSupplement}
            />
          )}

          {store.activeTab === 'health' && (
            <HealthView
              injuries={store.injuries}
              healthMetrics={store.healthMetrics}
              onUpdatePainLevel={store.updateInjuryPainLevel}
              onAddInjury={store.addInjuryLog}
            />
          )}

          {store.activeTab === 'photos' && (
            <PhotosView
              photos={store.photos}
              onAddPhoto={store.addPhoto}
            />
          )}

          {store.activeTab === 'goals' && (
            <GoalsView
              goals={store.goals}
              onAddGoal={store.addGoal}
            />
          )}

          {store.activeTab === 'calendar' && (
            <CalendarView />
          )}

          {store.activeTab === 'profile' && (
            <ProfileFamilyView
              profiles={store.profiles}
              activeProfile={store.activeProfile}
              onSwitchProfile={store.switchProfile}
              onAddProfile={store.addProfile}
              onUpdateProfile={store.updateProfile}
            />
          )}

          {store.activeTab === 'admin' && store.currentUser?.role === 'admin' && (
            <AdminUsersView
              users={store.adminUsers}
              isAdmin={true}
              onLoad={store.loadAdminUsers}
              onToggleActive={store.toggleUserActive}
              onSetExpiration={store.updateUserExpiration}
              onCreateUser={store.registerUserAsAdmin}
              onUpdateUser={store.updateUserProfile}
              onUpdatePassword={store.updateUserPassword}
              error={store.authError}
            />
          )}
        </main>
      </div>

      {/* 3. Mobile Bottom Navigation */}
      <BottomNav
        activeTab={store.activeTab}
        onSelectTab={store.setActiveTab}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      {/* 4. Mobile Drawer Menu ("Mais") */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-surface-card border-t border-line rounded-t-3xl p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-line">
              <h3 className="text-base font-bold text-content-primary">Todos os Módulos</h3>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-lg bg-dark-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-bold">
              <button
                onClick={() => { store.setActiveTab('evolution'); setIsMobileMenuOpen(false); }}
                className="p-3 rounded-xl bg-dark-850 border border-line flex items-center space-x-2 text-content-secondary"
              >
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Peso & Evolução</span>
              </button>

              <button
                onClick={() => { store.setActiveTab('supplements'); setIsMobileMenuOpen(false); }}
                className="p-3 rounded-xl bg-dark-850 border border-line flex items-center space-x-2 text-content-secondary"
              >
                <Pill className="w-4 h-4 text-amber-400" />
                <span>Suplementos</span>
              </button>

              <button
                onClick={() => { store.setActiveTab('health'); setIsMobileMenuOpen(false); }}
                className="p-3 rounded-xl bg-dark-850 border border-line flex items-center space-x-2 text-content-secondary"
              >
                <HeartPulse className="w-4 h-4 text-rose-400" />
                <span>Saúde & Joelho</span>
              </button>

              <button
                onClick={() => { store.setActiveTab('photos'); setIsMobileMenuOpen(false); }}
                className="p-3 rounded-xl bg-dark-850 border border-line flex items-center space-x-2 text-content-secondary"
              >
                <Camera className="w-4 h-4 text-purple-400" />
                <span>Fotos Corporais</span>
              </button>

              <button
                onClick={() => { store.setActiveTab('goals'); setIsMobileMenuOpen(false); }}
                className="p-3 rounded-xl bg-dark-850 border border-line flex items-center space-x-2 text-content-secondary"
              >
                <Target className="w-4 h-4 text-blue-400" />
                <span>Metas & Hábitos</span>
              </button>

              <button
                onClick={() => { store.setActiveTab('calendar'); setIsMobileMenuOpen(false); }}
                className="p-3 rounded-xl bg-dark-850 border border-line flex items-center space-x-2 text-content-secondary"
              >
                <CalendarDays className="w-4 h-4 text-indigo-400" />
                <span>Calendário</span>
              </button>

              <button
                onClick={() => { store.setActiveTab('profile'); setIsMobileMenuOpen(false); }}
                className="col-span-2 p-3 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center space-x-2 text-blue-400 font-bold"
              >
                <Users className="w-4 h-4" />
                <span>Perfil & Gestão Familiar</span>
              </button>

              {store.currentUser?.role === 'admin' && (
                <button
                  onClick={() => { store.setActiveTab('admin'); setIsMobileMenuOpen(false); }}
                  className="col-span-2 p-3 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center space-x-2 text-amber-400 font-bold"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Administração de Usuários</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Live Rest Timer Widget */}
      {store.isResting && store.restTimeRemaining !== null && (
        <RestTimerWidget
          secondsRemaining={store.restTimeRemaining}
          onAddSeconds={(sec) => store.startRestTimer((store.restTimeRemaining || 0) + sec)}
          onCancel={store.cancelRestTimer}
        />
      )}

      {/* 6. Smart Daily Summary Modal */}
      <SmartSummaryModal
        isOpen={isSmartSummaryModalOpen}
        onClose={() => setIsSmartSummaryModalOpen(false)}
        summary={store.smartDailySummary}
        profile={store.activeProfile}
      />
    </div>
  );
}