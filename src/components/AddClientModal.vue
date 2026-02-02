<template>
  <v-dialog
    :model-value="isOpen"
    @update:model-value="$emit('close')"
    max-width="448"
    scrollable
    class="add-client-dialog"
  >
    <v-card class="add-client-card" :rounded="false">
      <v-card-title class="add-client-header">
        <h2 class="add-client-title">Добавить клиента</h2>
        <button class="add-client-close-btn" @click="handleClose">
          <X :size="16" />
        </button>
      </v-card-title>

      <v-card-text class="add-client-content">
        <form @submit.prevent="handleSubmit" class="add-client-form">
          <!-- Название клиента -->
          <div class="form-field">
            <label class="form-label">Название клиента *</label>
            <input
              v-model="clientName"
              type="text"
              required
              autofocus
              class="form-input"
              placeholder="Введите название"
            />
          </div>

          <!-- Кнопки -->
          <div class="form-actions">
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
              :disabled="!clientName.trim()"
            >
              Создать
            </button>
          </div>
        </form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { X } from 'lucide-vue-next';
import type { Client } from '@/types';

interface Props {
  isOpen: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  submit: [client: Client];
}>();

const clientName = ref('');

const handleSubmit = () => {
  if (!clientName.value.trim()) return;

  const newClient: Client = {
    id: `c${Date.now()}`,
    name: clientName.value.trim(),
  };

  emit('submit', newClient);
  handleClose();
};

const handleClose = () => {
  clientName.value = '';
  emit('close');
};
</script>

<style scoped>
.add-client-form {
  display: flex;
  flex-direction: column;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 4px; /* mb-1 = 0.25rem = 4px */
  margin-bottom: 16px; /* mb-4 = 1rem = 16px */
}

.form-label {
  font-size: 12px; /* text-xs = 0.75rem = 12px */
  font-weight: 500; /* font-medium */
  color: #374151; /* text-gray-700 */
  margin-bottom: 4px; /* mb-1 = 0.25rem = 4px */
}

.form-input {
  width: 100%;
  padding: 8px 12px; /* py-2 px-3 = 8px 12px */
  background-color: #FFFFFF;
  border: 1px solid #D1D5DB; /* border-gray-300 */
  border-radius: 0.5rem; /* rounded-lg = 8px */
  font-size: 14px; /* text-sm */
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  outline: none;
  transition: all 0.2s;
}

.form-input:focus {
  border-color: #2196F3; /* focus:border-primary-500 */
  box-shadow: 0 0 0 1px #2196F3; /* focus:ring-1 focus:ring-primary-500 */
}

.form-input::placeholder {
  color: #9E9E9E; /* placeholder-gray-500 */
  opacity: 1;
}

/* Form actions - matching React version */
.form-actions {
  display: flex;
  gap: 8px; /* gap-2 = 0.5rem = 8px */
  width: 100%;
}

.form-btn {
  flex: 1; /* flex-1 */
  padding: 6px 16px; /* py-1.5 px-4 = 6px 16px */
  border-radius: 0.5rem; /* rounded-lg = 8px */
  font-weight: 500; /* font-medium */
  font-size: 14px; /* text-sm */
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.form-btn-cancel {
  background-color: #FFFFFF;
  border: 1px solid #D1D5DB; /* border-gray-300 */
  color: #374151; /* text-gray-700 */
}

.form-btn-cancel:hover {
  background-color: #F9FAFB; /* hover:bg-gray-50 */
}

.form-btn-submit {
  background-color: #1E88E5; /* bg-primary-600 */
  color: #FFFFFF;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow-sm */
}

.form-btn-submit:hover:not(:disabled) {
  background-color: #1976D2; /* hover:bg-primary-700 */
}

.form-btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>