<template>
  <div class="project-onboarding-container">
    <div class="project-onboarding-header">
      <div class="project-onboarding-header-left">
        <h3 class="project-onboarding-title">Настройка проекта</h3>
        <p class="project-onboarding-subtitle">
          Завершено {{ completedSteps }} из {{ steps.length }} шагов
        </p>
      </div>
      <div class="project-onboarding-header-right">
        <div class="project-onboarding-progress-value">{{ Math.round(progress) }}%</div>
        <div class="project-onboarding-progress-label">готовности</div>
      </div>
    </div>

    <!-- Progress bar -->
    <div class="project-onboarding-progress-bar">
      <div 
        class="project-onboarding-progress-fill"
        :style="{ width: `${progress}%` }"
      />
    </div>

    <!-- Steps -->
    <div class="project-onboarding-steps">
      <div
        v-for="step in steps"
        :key="step.id"
        :class="[
          'project-onboarding-step',
          step.isCompleted ? 'project-onboarding-step-completed' : 'project-onboarding-step-pending'
        ]"
      >
        <div class="project-onboarding-step-content">
          <div
            :class="[
              'project-onboarding-step-icon',
              step.isCompleted ? 'project-onboarding-step-icon-completed' : 'project-onboarding-step-icon-pending'
            ]"
          >
            <component
              :is="step.icon"
              :size="20"
              :class="step.isCompleted ? 'text-success-600' : 'text-primary-600'"
            />
          </div>
          <div class="project-onboarding-step-body">
            <div class="project-onboarding-step-header">
              <CheckCircle2
                v-if="step.isCompleted"
                :size="20"
                class="project-onboarding-step-check text-success-600"
              />
              <Circle
                v-else
                :size="20"
                class="project-onboarding-step-check text-gray-400"
              />
              <h4 class="project-onboarding-step-title">{{ step.title }}</h4>
            </div>
            <p class="project-onboarding-step-description">{{ step.description }}</p>
            <!-- Показываем список команд, если они есть и шаг выполнен -->
            <div v-if="step.id === 1 && step.isCompleted && teamsWithMembers.length > 0" class="project-onboarding-step-teams">
              <div class="project-onboarding-step-teams-label">Доступные команды:</div>
              <div class="project-onboarding-step-teams-list">
                <span
                  v-for="team in teamsWithMembers"
                  :key="team.id"
                  class="project-onboarding-step-team-chip"
                >
                  {{ team.name }} ({{ team.members?.length || 0 }})
                </span>
              </div>
            </div>
            <button
              v-if="!step.isCompleted || (step.isCompleted && step.id === 1)"
              :class="[
                'project-onboarding-step-action',
                step.isCompleted ? 'project-onboarding-step-action-completed' : 'project-onboarding-step-action-pending'
              ]"
              @click="step.action"
            >
              {{ step.actionLabel }} →
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="hasSegments"
      class="project-onboarding-success"
    >
      <CheckCircle2 :size="20" class="project-onboarding-success-icon" />
      <div class="project-onboarding-success-content">
        <div class="project-onboarding-success-title">Проект настроен!</div>
        <div class="project-onboarding-success-text">
          Теперь вы можете добавлять медиасегменты, настраивать бюджеты и загружать медиапланы
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { CheckCircle2, Circle, Users, PieChart } from 'lucide-vue-next';

import type { Team } from '@/types';

interface Props {
  hasSegments: boolean;
  teams: Team[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'add-segment': [];
  'manage-teams': [];
}>();

// Логика определения состояния шага с командами
const teamsState = computed(() => {
  // Исключаем команду "Штаб" из подсчета для определения состояния шага
  const customTeams = props.teams.filter(team => !team.isDefault);
  
  // Проверяем наличие команд с участниками (без штаба)
  const teamsWithMembersList = customTeams.filter(team => team.members && team.members.length > 0);
  
  // Проверяем наличие команд без участников (без штаба)
  const teamsWithoutMembers = customTeams.filter(team => !team.members || team.members.length === 0);
  
  // Проверяем общее количество участников во всех командах (кроме штаба)
  const totalMembers = customTeams.reduce((sum, team) => sum + (team.members?.length || 0), 0);
  
  return {
    hasCustomTeams: customTeams.length > 0,
    hasTeamsWithMembers: teamsWithMembersList.length > 0,
    hasTeamsWithoutMembers: teamsWithoutMembers.length > 0,
    hasAnyMembers: totalMembers > 0,
    teamsWithMembers: teamsWithMembersList,
    teamsWithoutMembers,
  };
});

// Отдельное computed для отображения команд в шаблоне (включая штаб, если у него есть участники)
const teamsWithMembers = computed(() => {
  // Включаем все команды с участниками, включая штаб
  return props.teams.filter(team => team.members && team.members.length > 0);
});

const steps = computed(() => {
  const state = teamsState.value;
  
  // Определяем описание и label для шага с командами
  let teamsDescription = 'Настройте команды для разделения работы по проекту';
  let teamsActionLabel = 'Создать команду';
  let teamsIsCompleted = false;
  
  if (!state.hasCustomTeams && !state.hasAnyMembers) {
    // Нет ни команд, ни участников → шаг не выполнен
    teamsDescription = 'Создайте команду проекта и добавьте участников';
    teamsActionLabel = 'Создать команду';
    teamsIsCompleted = false;
  } else if (state.hasTeamsWithMembers) {
    // Есть команды с участниками → шаг выполнен, предлагаем использовать существующую или создать новую
    teamsDescription = state.teamsWithMembers.length === 1 
      ? `Используйте команду "${state.teamsWithMembers[0].name}" или создайте новую`
      : `Используйте существующую команду (${state.teamsWithMembers.length} команд) или создайте новую`;
    teamsActionLabel = 'Управление командами';
    teamsIsCompleted = true;
  } else if (state.hasCustomTeams && !state.hasAnyMembers) {
    // Команда создана, но без участников → просим добавить участников, но шаг показываем как выполненный
    teamsDescription = 'Добавьте участников в команды проекта';
    teamsActionLabel = 'Управление командами';
    teamsIsCompleted = true;
  }
  
  return [
    {
      id: 1,
      title: 'Создайте команду проекта',
      description: teamsDescription,
      isCompleted: teamsIsCompleted,
      action: () => emit('manage-teams'),
      actionLabel: teamsActionLabel,
      icon: Users,
    },
    {
      id: 2,
      title: 'Добавьте сегменты',
      description: 'Создайте сегменты рекламной кампании (регионы, целевые группы)',
      isCompleted: props.hasSegments,
      action: () => emit('add-segment'),
      actionLabel: 'Добавить сегмент',
      icon: PieChart,
    },
  ];
});

const completedSteps = computed(() => {
  return steps.value.filter(s => s.isCompleted).length;
});

const progress = computed(() => {
  return (completedSteps.value / steps.value.length) * 100;
});
</script>

<style scoped>
.project-onboarding-container {
  background: linear-gradient(to bottom right, #E3F2FD, #E1F5FE);
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 2px solid #BBDEFB;
}

.project-onboarding-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.project-onboarding-header-left {
  flex: 1;
}

.project-onboarding-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
}

.project-onboarding-subtitle {
  font-size: 0.875rem;
  color: #4B5563;
}

.project-onboarding-header-right {
  text-align: right;
}

.project-onboarding-progress-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1E88E5;
}

.project-onboarding-progress-label {
  font-size: 0.75rem;
  color: #4B5563;
}

.project-onboarding-progress-bar {
  width: 100%;
  background-color: #FFFFFF;
  border-radius: 9999px;
  height: 0.5rem;
  margin-bottom: 1.5rem;
  overflow: hidden;
}

.project-onboarding-progress-fill {
  background-color: #1E88E5;
  height: 0.5rem;
  border-radius: 9999px;
  transition: width 0.5s;
}

.project-onboarding-steps {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.project-onboarding-step {
  background-color: #FFFFFF;
  border-radius: 0.75rem;
  padding: 1rem;
  border: 2px solid;
  transition: all 0.2s;
}

.project-onboarding-step-completed {
  border-color: #A7F3D0;
  background-color: #FFFFFF;
}

.project-onboarding-step-pending {
  border-color: #E5E7EB;
}

.project-onboarding-step-pending:hover {
  border-color: #BBDEFB;
}

.project-onboarding-step-content {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.project-onboarding-step-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.project-onboarding-step-icon-completed {
  background-color: #D1FAE5;
}

.project-onboarding-step-icon-pending {
  background-color: #BBDEFB;
}

.project-onboarding-step-body {
  flex: 1;
  min-width: 0;
}

.project-onboarding-step-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.project-onboarding-step-check {
  flex-shrink: 0;
}

.project-onboarding-step-title {
  font-weight: 600;
  color: #111827;
}

.project-onboarding-step-description {
  font-size: 0.875rem;
  color: #4B5563;
  margin-bottom: 0.75rem;
}

.project-onboarding-step-teams {
  margin-bottom: 0.75rem;
}

.project-onboarding-step-teams-label {
  font-size: 0.875rem;
  color: #6B7280;
  margin-bottom: 0.5rem;
}

.project-onboarding-step-teams-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.project-onboarding-step-team-chip {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid #1E88E5;
  border-radius: 0.375rem;
  color: #1E88E5;
  background-color: transparent;
}

.project-onboarding-step-action {
  font-size: 0.875rem;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s;
  padding: 0;
}

.project-onboarding-step-action-pending {
  color: #1E88E5;
}

.project-onboarding-step-action-pending:hover {
  color: #1976D2;
}

.project-onboarding-step-action-completed {
  color: #4B5563;
}

.project-onboarding-step-action-completed:hover {
  color: #374151;
}

.project-onboarding-success {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #ECFDF5;
  border: 1px solid #A7F3D0;
  border-radius: 0.75rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.project-onboarding-success-icon {
  color: #059669;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.project-onboarding-success-content {
  flex: 1;
}

.project-onboarding-success-title {
  font-weight: 500;
  color: #065F46;
  margin-bottom: 0.25rem;
}

.project-onboarding-success-text {
  font-size: 0.875rem;
  color: #047857;
}
</style>