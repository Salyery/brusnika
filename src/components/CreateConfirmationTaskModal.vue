<template>
  <v-dialog
    :model-value="isOpen"
    @update:model-value="$emit('close')"
    max-width="512"
    scrollable
    class="create-confirmation-task-dialog"
  >
    <v-card class="create-confirmation-task-card" :rounded="false">
      <v-card-title class="create-confirmation-task-header">
        <h2 class="create-confirmation-task-title">Создать задачу на подтверждение</h2>
        <button class="create-confirmation-task-close-btn" @click="handleClose">
          <X :size="16" />
        </button>
      </v-card-title>

      <v-card-text class="create-confirmation-task-content">
        <form ref="formRef" @submit.prevent="handleSubmit" class="create-confirmation-task-form">
          <!-- Исполнитель -->
          <div class="form-field">
            <label class="form-label">
              Исполнитель <span class="text-red-500">*</span>
            </label>
            <SearchableSelect
              v-model="executor"
              :options="mockUsers"
              placeholder="Выберите исполнителя"
              :required="true"
            />
          </div>

          <!-- Соисполнители -->
          <div class="form-field">
            <label class="form-label">Соисполнители</label>
            <SearchableMultiSelect
              v-model="coExecutors"
              :options="mockUsers"
              placeholder="Выберите соисполнителей"
              :exclude-ids="executor ? [executor] : []"
            />
          </div>

          <!-- Наблюдатели -->
          <div class="form-field">
            <label class="form-label">Наблюдатели</label>
            <SearchableMultiSelect
              v-model="observers"
              :options="mockUsers"
              placeholder="Выберите наблюдателей"
              :exclude-ids="executor ? [executor, ...coExecutors] : coExecutors"
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
              :disabled="!executor"
            >
              Создать задачу
            </button>
          </div>
        </form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { X } from 'lucide-vue-next';
import SearchableSelect from './SearchableSelect.vue';
import SearchableMultiSelect from './SearchableMultiSelect.vue';

interface Props {
  isOpen: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  submit: [taskId: string];
}>();

const mockUsers = [
  { id: 'u1', name: 'Иванов Иван Иванович' },
  { id: 'u2', name: 'Петрова Анна Сергеевна' },
  { id: 'u3', name: 'Смирнов Петр Александрович' },
  { id: 'u4', name: 'Козлова Елена Дмитриевна' },
  { id: 'u5', name: 'Новиков Андрей Викторович' },
  { id: 'u6', name: 'Соколова Мария Петровна' },
  { id: 'u7', name: 'Морозов Дмитрий Сергеевич' },
  { id: 'u8', name: 'Федорова Ольга Николаевна' },
  { id: 'u9', name: 'Васильев Сергей Иванович' },
  { id: 'u10', name: 'Николаева Татьяна Владимировна' },
];

const formRef = ref<HTMLFormElement | null>(null);
const executor = ref('');
const coExecutors = ref<string[]>([]);
const observers = ref<string[]>([]);

watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    executor.value = '';
    coExecutors.value = [];
    observers.value = [];
  }
});

const handleSubmit = (e?: Event) => {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  if (!executor.value) {
    return;
  }

  const taskId = `ct-${Date.now()}`;
  emit('submit', taskId);
  handleClose();
};

const handleClose = () => {
  executor.value = '';
  coExecutors.value = [];
  observers.value = [];
  emit('close');
};
</script>

<style scoped>
.create-confirmation-task-form {
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

.text-red-500 {
  color: #EF4444;
}

/* Form actions - matching React version */
.form-actions {
  display: flex;
  gap: 8px; /* gap-2 = 0.5rem = 8px */
  padding-top: 8px; /* pt-2 = 0.5rem = 8px */
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

/* Remove backdrop blur for this modal */
:deep(.v-overlay__scrim) {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

:deep(.v-overlay) {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}
</style>
