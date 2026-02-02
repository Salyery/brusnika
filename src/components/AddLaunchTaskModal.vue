<template>
  <v-dialog
    :model-value="isOpen"
    @update:model-value="$emit('close')"
    max-width="500"
  >
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <span>Добавить задачу на запуск</span>
        <v-btn
          icon
          variant="text"
          size="small"
          @click="handleClose"
        >
          <X :size="16" />
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-form @submit.prevent="handleSubmit" class="add-project-form">
          <div class="form-field">
            <v-label class="mb-2">Период *</v-label>
            <v-text-field
              v-model="taskPeriod"
              variant="outlined"
              density="compact"
              required
              placeholder="Например: 01.02.2024 - 15.02.2024"
              hide-details
              class="custom-text-field"
            />
          </div>
          <div class="form-actions">
            <button type="button" class="form-btn form-btn-cancel" @click="handleClose">
              Отмена
            </button>
            <button
              type="submit"
              class="form-btn form-btn-submit"
              :disabled="!taskPeriod.trim()"
            >
              Добавить
            </button>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { X } from 'lucide-vue-next';
import type { Project } from '@/types';

interface Props {
  isOpen: boolean;
  project: Project;
  segmentId: string;
  mediaSegmentId: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  submit: [task: { id: string; period: string }];
}>();

const taskPeriod = ref('');

const handleSubmit = () => {
  if (!taskPeriod.value.trim()) return;

  const newTask = {
    id: `lt-${Date.now()}`,
    period: taskPeriod.value,
  };

  emit('submit', newTask);
  handleClose();
};

const handleClose = () => {
  taskPeriod.value = '';
  emit('close');
};

watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    handleClose();
  }
});
</script>

<style scoped>
/* Override Vuetify CSS variable for this component */
.custom-text-field {
  --v-medium-emphasis-opacity: 1 !important;
}

/* Custom styles for v-label - matching form-label exactly */
.form-field :deep(.v-label) {
  font-size: 12px !important;
  font-weight: 500 !important;
  color: #374151 !important;
  margin-bottom: 4px !important;
  opacity: 1 !important;
  letter-spacing: unset !important;
}
</style>
