<template>
  <v-dialog
    :model-value="isOpen"
    @update:model-value="$emit('close')"
    max-width="448"
    scrollable
    class="add-brand-dialog"
  >
    <v-card class="add-brand-card" :rounded="false">
      <v-card-title class="add-brand-header">
        <h2 class="add-brand-title">Добавить бренд</h2>
        <button class="add-brand-close-btn" @click="handleClose">
          <X :size="16" />
        </button>
      </v-card-title>

      <v-card-text class="add-brand-content">
        <form @submit.prevent="handleSubmit" class="add-brand-form">
          <!-- Клиент -->
          <div class="form-field">
            <label class="form-label">Клиент *</label>
            <Select
              v-model="selectedClientId"
              :items="clientOptions"
              placeholder="Выберите клиента"
              :disabled="!!preselectedClientId"
            />
          </div>

          <!-- Название бренда -->
          <div class="form-field">
            <label class="form-label">Название бренда *</label>
            <input
              v-model="brandName"
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
              :disabled="!brandName.trim() || !selectedClientId"
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
import { ref, computed, watch } from 'vue';
import { X } from 'lucide-vue-next';
import type { Brand, Client } from '@/types';
import Select from './Select.vue';

interface Props {
  isOpen: boolean;
  clients: Client[];
  preselectedClientId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  preselectedClientId: undefined,
});

const emit = defineEmits<{
  close: [];
  submit: [brand: Brand];
}>();

const selectedClientId = ref(props.preselectedClientId || '');
const brandName = ref('');

const clientOptions = computed(() => {
  return props.clients.map(c => ({ title: c.name, value: c.id }));
});

watch(() => props.preselectedClientId, (newValue) => {
  if (newValue) {
    selectedClientId.value = newValue;
  }
});

watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    handleClose();
  }
});

const handleSubmit = () => {
  if (!brandName.value.trim() || !selectedClientId.value) return;

  const newBrand: Brand = {
    id: `b${Date.now()}`,
    name: brandName.value.trim(),
    clientId: selectedClientId.value,
  };

  emit('submit', newBrand);
  handleClose();
};

const handleClose = () => {
  brandName.value = '';
  if (!props.preselectedClientId) {
    selectedClientId.value = '';
  }
  emit('close');
};
</script>

<style scoped>
.add-brand-form {
  display: flex;
  flex-direction: column;
  gap: 12px; /* space-y-3 = 0.75rem = 12px */
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 4px; /* mb-1 = 0.25rem = 4px */
}

.form-label {
  font-size: 12px;
  font-weight: 500;
  color: #374151; /* text-gray-700 */
  margin-bottom: 4px; /* mb-1 = 0.25rem = 4px */
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
  padding-top: 4px; /* pt-1 = 0.25rem = 4px */
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