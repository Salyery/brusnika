<template>
  <v-dialog
    :model-value="isOpen"
    @update:model-value="$emit('close')"
    max-width="448"
    scrollable
    class="upload-media-plan-dialog"
  >
    <v-card class="upload-media-plan-card" :rounded="false">
      <v-card-title class="upload-media-plan-header">
        <h2 class="upload-media-plan-title">
          {{ existingPlan ? 'Обновить медиаплан' : 'Загрузить медиаплан' }}
        </h2>
        <button class="upload-media-plan-close-btn" @click="handleClose">
          <X :size="20" />
        </button>
      </v-card-title>

      <v-card-text class="upload-media-plan-content">
        <form ref="formRef" @submit.prevent="handleSubmit" class="upload-media-plan-form">
          <!-- Название медиаплана -->
          <div class="form-field">
            <label class="form-label">Название медиаплана *</label>
            <input
              v-model="planName"
              type="text"
              required
              class="form-input"
              placeholder="Введите название"
            />
          </div>

          <!-- Файл медиаплана -->
          <div class="form-field">
            <label class="form-label">Файл медиаплана *</label>
            <div class="file-input-wrapper">
              <input
                ref="fileInputRef"
                type="file"
                @change="handleFileChange"
                :required="!existingPlan"
                accept=".xlsx,.xls,.csv"
                class="file-input"
              />
            </div>
            <p class="file-hint">Файл .xlsx из Q-bit.OOH</p>
          </div>

          <!-- Выбранный файл -->
          <div v-if="file" class="file-selected">
            <Upload :size="16" class="file-icon" />
            <span class="file-name">{{ file.name }}</span>
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
            >
              {{ existingPlan ? 'Обновить' : 'Загрузить' }}
            </button>
          </div>
        </form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { X, Upload } from 'lucide-vue-next';
import type { MediaPlan } from '@/types';

interface Props {
  isOpen: boolean;
  existingPlan?: MediaPlan;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  submit: [plan: { name: string; file?: File }];
}>();

const formRef = ref<HTMLFormElement | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
const planName = ref('');
const file = ref<File | null>(null);

watch(() => props.existingPlan, (plan) => {
  if (plan) {
    planName.value = plan.name;
  } else {
    planName.value = '';
  }
}, { immediate: true });

watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    handleClose();
  }
});

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    file.value = target.files[0];
  } else {
    file.value = null;
  }
};

const handleSubmit = (e?: Event) => {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  if (!planName.value.trim() || (!file.value && !props.existingPlan)) {
    return;
  }

  emit('submit', {
    name: planName.value.trim(),
    file: file.value || undefined,
  });
  handleClose();
};

const handleClose = () => {
  planName.value = props.existingPlan?.name || '';
  file.value = null;
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
  emit('close');
};
</script>

<style scoped>
.upload-media-plan-form {
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
  font-size: 14px; /* text-sm */
  font-weight: 500; /* font-medium */
  color: #374151; /* text-gray-700 */
  margin-bottom: 8px; /* mb-2 = 0.5rem = 8px */
}

.form-input {
  width: 100%;
  padding: 10px 16px; /* py-2.5 px-4 = 10px 16px */
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
  box-shadow: 0 0 0 2px #2196F3; /* focus:ring-2 focus:ring-primary-500 */
}

.form-input::placeholder {
  color: #9E9E9E; /* placeholder-gray-500 */
  opacity: 1;
}

/* File input styles - matching React version */
.file-input-wrapper {
  position: relative;
}

.file-input {
  width: 100%;
  padding: 10px 16px; /* py-2.5 px-4 = 10px 16px */
  background-color: #FFFFFF;
  border: 1px solid #D1D5DB; /* border-gray-300 */
  border-radius: 0.5rem; /* rounded-lg = 8px */
  font-size: 14px; /* text-sm */
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  outline: none;
  transition: all 0.2s;
  cursor: pointer;
}

.file-input:focus {
  border-color: #2196F3; /* focus:border-primary-500 */
  box-shadow: 0 0 0 2px #2196F3; /* focus:ring-2 focus:ring-primary-500 */
}

/* Style file input button - matching React version */
.file-input::file-selector-button {
  margin-right: 16px; /* file:mr-4 = 1rem = 16px */
  padding: 6px 12px; /* file:py-1.5 file:px-3 = 6px 12px */
  border-radius: 0.375rem; /* file:rounded = 6px */
  border: 0;
  font-size: 14px; /* file:text-sm */
  background-color: #E3F2FD; /* file:bg-primary-50 */
  color: #1976D2; /* file:text-primary-700 */
  cursor: pointer;
  transition: all 0.2s;
}

.file-input::file-selector-button:hover {
  background-color: #BBDEFB; /* hover:file:bg-primary-100 */
}

.file-hint {
  font-size: 12px; /* text-xs */
  color: #6B7280; /* text-gray-500 */
  margin-top: 6px; /* mt-1.5 = 0.375rem = 6px */
  margin-bottom: 0;
}

/* Selected file display - matching React version */
.file-selected {
  padding: 12px; /* p-3 = 0.75rem = 12px */
  background-color: #E3F2FD; /* bg-primary-50 */
  border: 1px solid #90CAF9; /* border-primary-200 */
  border-radius: 0.5rem; /* rounded-lg = 8px */
  display: flex;
  align-items: center;
  gap: 8px; /* gap-2 = 0.5rem = 8px */
}

.file-icon {
  color: #1E88E5; /* text-primary-600 */
  flex-shrink: 0;
}

.file-name {
  font-size: 14px; /* text-sm */
  color: #0D47A1; /* text-primary-900 */
}

/* Form actions - matching React version */
.form-actions {
  display: flex;
  gap: 12px; /* gap-3 = 0.75rem = 12px */
  padding-top: 16px; /* pt-4 = 1rem = 16px */
  width: 100%;
}

.form-btn {
  flex: 1; /* flex-1 */
  padding: 10px 16px; /* py-2.5 px-4 = 10px 16px */
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
