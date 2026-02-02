<template>
  <v-dialog
    :model-value="isOpen"
    @update:model-value="$emit('close')"
    max-width="448"
    scrollable
    class="edit-team-dialog"
  >
    <v-card class="edit-team-card" :rounded="false">
      <v-card-title class="edit-team-header">
        <h2 class="edit-team-title">{{ team ? 'Редактировать команду' : 'Создать команду' }}</h2>
        <button class="edit-team-close-btn" @click="handleClose">
          <X :size="16" />
        </button>
      </v-card-title>

      <v-card-text class="edit-team-content">
        <form @submit.prevent="handleSubmit" class="edit-team-form">
          <!-- Название команды -->
          <div class="form-field">
            <label class="form-label">Название команды *</label>
            <input
              v-model="teamName"
              type="text"
              required
              autofocus
              class="form-input"
              placeholder="Например, Штаб, Москва, Регионы"
            />
          </div>

          <!-- Кнопки -->
          <div class="form-actions">
            <button
              v-if="team && !team.isDefault"
              type="button"
              class="form-btn form-btn-delete"
              @click="handleDelete"
            >
              <Trash2 :size="16" />
              Удалить команду
            </button>
            <div v-else></div>
            
            <div class="form-actions-right">
              <button
                type="button"
                class="form-btn form-btn-cancel"
                @click="handleClose"
              >
                Отмена
              </button>
              <button
                type="submit"
                class="form-btn form-btn-submit"
                :disabled="!teamName.trim()"
              >
                {{ team ? 'Сохранить' : 'Создать' }}
              </button>
            </div>
          </div>
        </form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { X, Trash2 } from 'lucide-vue-next';
import type { Team } from '@/types';

interface Props {
  isOpen: boolean;
  team: Team | null;
  clientId?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  submit: [team: Team];
  delete?: [teamId: string];
}>();

const teamName = ref('');

watch(() => [props.isOpen, props.team], ([isOpen, team]) => {
  if (isOpen && team) {
    teamName.value = team.name;
  } else if (isOpen && !team) {
    teamName.value = '';
  } else if (!isOpen) {
    handleClose();
  }
});

const handleSubmit = () => {
  if (!teamName.value.trim()) return;

  const updatedTeam: Team = props.team ? {
    ...props.team,
    name: teamName.value.trim(),
  } : {
    id: `t${Date.now()}`,
    name: teamName.value.trim(),
    members: [],
    isDefault: false,
    clientId: props.clientId || '',
  };

  emit('submit', updatedTeam);
  handleClose();
};

const handleClose = () => {
  if (props.team) {
    teamName.value = props.team.name;
  } else {
    teamName.value = '';
  }
  emit('close');
};

const handleDelete = () => {
  if (!props.team) return;
  
  if (confirm(`Вы уверены, что хотите удалить команду "${props.team.name}"?`)) {
    emit('delete', props.team.id);
    emit('close');
  }
};
</script>

<style scoped>
.edit-team-form {
  display: flex;
  flex-direction: column;
  gap: 16px; /* space-y-4 = 1rem = 16px */
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px; /* mb-2 = 0.5rem = 8px */
}

.form-label {
  font-size: 14px; /* text-sm = 0.875rem = 14px */
  font-weight: 500; /* font-medium */
  color: #374151; /* text-gray-700 */
  margin-bottom: 8px; /* mb-2 = 0.5rem = 8px */
}

.form-input {
  width: 100%;
  padding: 8px 12px; /* py-2 px-3 = 8px 12px */
  background-color: #FFFFFF;
  border: 1px solid #D1D5DB; /* border-gray-300 */
  border-radius: 0.5rem; /* rounded-lg = 8px */
  font-size: 14px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  outline: none;
  transition: all 0.2s;
}

.form-input:focus {
  border-color: #2196F3; /* focus:border-primary-500 */
  box-shadow: 0 0 0 2px #2196F3; /* focus:ring-2 focus:ring-primary-500 */
}

.form-input::placeholder {
  color: #9E9E9E; /* placeholder-gray-500 */
  opacity: 1;
}

/* Form actions - matching React version */
.form-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px; /* pt-3 = 0.75rem = 12px */
  border-top: 1px solid #E5E7EB; /* border-t border-gray-200 */
  width: 100%;
}

.form-actions-right {
  display: flex;
  gap: 8px; /* gap-2 = 0.5rem = 8px */
  flex: 1;
  min-width: 0;
}

.form-actions-right .form-btn-cancel,
.form-actions-right .form-btn-submit {
  flex: 1;
}

.form-btn {
  padding: 8px 16px; /* py-2 px-4 = 8px 16px */
  border-radius: 0.5rem; /* rounded-lg = 8px */
  font-weight: 500; /* font-medium */
  font-size: 14px; /* text-sm */
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: flex;
  align-items: center;
  gap: 6px; /* gap-1.5 = 0.375rem = 6px */
}

.form-btn-delete {
  background-color: transparent;
  color: #DC2626; /* text-red-600 */
}

.form-btn-delete:hover {
  background-color: #FEF2F2; /* hover:bg-red-50 */
}

.form-btn-cancel {
  background-color: transparent;
  color: #374151; /* text-gray-700 */
}

.form-btn-cancel:hover {
  background-color: #F3F4F6; /* hover:bg-gray-100 */
}

.form-btn-submit {
  background-color: #1E88E5; /* bg-primary-600 */
  color: #FFFFFF;
}

.form-btn-submit:hover:not(:disabled) {
  background-color: #1976D2; /* hover:bg-primary-700 */
}

.form-btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>