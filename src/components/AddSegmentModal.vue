<template>
  <v-dialog
    :model-value="isOpen"
    @update:model-value="$emit('close')"
    max-width="672"
    scrollable
    class="add-segment-dialog"
  >
    <v-card class="add-segment-card" :rounded="false">
      <v-card-title class="add-segment-header">
        <h2 class="add-segment-title">{{ segment ? 'Редактировать сегмент' : 'Добавить сегмент' }}</h2>
        <button class="add-segment-close-btn" @click="handleClose">
          <X :size="16" />
        </button>
      </v-card-title>

      <v-card-text class="add-segment-content">
        <form ref="formRef" @submit.prevent="handleSubmit" class="add-segment-form">
          <!-- Название сегмента -->
          <div class="form-field">
            <label class="form-label">Название сегмента *</label>
            <input
              v-model="segmentName"
              type="text"
              required
              class="form-input"
              placeholder="Введите название"
            />
          </div>

          <!-- Команда -->
          <div class="form-field">
            <label class="form-label">Команда *</label>
            <Select
              v-model="selectedTeamId"
              :items="teamOptions"
              placeholder="Выберите команду"
            />
          </div>

          <!-- Выбор медиа -->
          <div class="form-field">
            <label class="form-label form-label-media">Выберите медиа *</label>
            <div class="media-selection">
              <label
                v-for="media in mediaTypes"
                :key="media"
                class="media-option"
                :class="{ 'media-option-selected': selectedMedia.includes(media) }"
              >
                <input
                  type="checkbox"
                  :checked="selectedMedia.includes(media)"
                  @change="handleMediaToggle(media)"
                  class="media-checkbox"
                />
                <span class="media-name">{{ media }}</span>
                <input
                  v-if="selectedMedia.includes(media)"
                  :value="formatBudgetDisplay(mediaBudgets[media])"
                  type="text"
                  inputmode="numeric"
                  placeholder="Бюджет"
                  class="media-budget-input"
                  @input="(e) => {
                    const raw = (e.target as HTMLInputElement).value.replace(/\s/g, '').replace(/\D/g, '');
                    mediaBudgets[media] = raw === '' ? 0 : parseInt(raw, 10);
                  }"
                  @click.stop
                />
              </label>
            </div>
            <p v-if="selectedMedia.length === 0" class="media-hint">
              Выберите хотя бы одно медиа
            </p>
          </div>

          <!-- Общий бюджет -->
          <div v-if="selectedMedia.length > 0" class="total-budget">
            <div class="total-budget-text">
              <strong>Общий бюджет сегмента:</strong>
              {{ formatCurrency(totalBudget) }}
            </div>
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
              :disabled="selectedMedia.length === 0"
            >
              {{ segment ? 'Сохранить' : 'Добавить' }}
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
import type { Project, Segment, MediaSegment, MediaType, Team } from '@/types';
import Select from './Select.vue';

interface Props {
  isOpen: boolean;
  project: Project;
  teams: Team[];
  segment?: Segment | null;
}

const props = withDefaults(defineProps<Props>(), {
  segment: null,
});

const emit = defineEmits<{
  close: [];
  submit: [segment: Segment];
}>();

const mediaTypes: MediaType[] = ['Outdoor', 'ТВ', 'Радио', 'Интернет', 'НСТ'];

const formRef = ref<HTMLFormElement | null>(null);
const segmentName = ref('');
const selectedTeamId = ref<string | null>(null);
const selectedMedia = ref<MediaType[]>([]);
const mediaBudgets = ref<Record<MediaType, number>>({
  'Outdoor': 0,
  'ТВ': 0,
  'Радио': 0,
  'Интернет': 0,
  'НСТ': 0,
});

const clientTeams = computed(() => {
  return props.teams.filter(t => t.clientId === props.project.clientId);
});

const teamOptions = computed(() => {
  return clientTeams.value.map(t => ({ title: t.name, value: t.id }));
});

const totalBudget = computed(() => {
  return selectedMedia.value.reduce((sum, media) => sum + (mediaBudgets.value[media] || 0), 0);
});

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
  }).format(value);
};

const formatBudgetDisplay = (value: number) => {
  if (!value && value !== 0) return '';
  if (value === 0) return '';
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    useGrouping: true,
  }).format(value);
};

const handleMediaToggle = (media: MediaType) => {
  if (selectedMedia.value.includes(media)) {
    selectedMedia.value = selectedMedia.value.filter(m => m !== media);
  } else {
    selectedMedia.value = [...selectedMedia.value, media];
  }
};

const handleSubmit = (e: Event) => {
  e.preventDefault();
  e.stopPropagation();

  // Validate form fields
  if (!segmentName.value.trim()) {
    return;
  }

  if (!selectedTeamId.value) {
    return;
  }

  if (selectedMedia.value.length === 0) {
    return;
  }

  // Find existing media segments to preserve their data (for edit mode)
  const existingMediaMap = props.segment 
    ? new Map(props.segment.mediaSegments.map(ms => [ms.mediaType, ms]))
    : new Map();

  const mediaSegments: MediaSegment[] = selectedMedia.value.map(mediaType => {
    const existing = existingMediaMap.get(mediaType);
    
    if (existing) {
      // Update existing media segment (preserve mediaPlans, launchTasks, etc.)
      return {
        ...existing,
        budget: mediaBudgets.value[mediaType] || 0,
      };
    } else {
      // Create new media segment
      return {
        id: `ms-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        mediaType,
        budget: mediaBudgets.value[mediaType] || 0,
        raDocumentUrl: `https://docs.google.com/spreadsheets/d/example-ra-${Date.now()}`,
        clientDocumentUrl: `https://docs.google.com/spreadsheets/d/example-client-${Date.now()}`,
        summarySheetUrl: `https://docs.google.com/spreadsheets/d/example-summary-${Date.now()}`,
        launchTasks: [],
        mediaPlans: [],
      };
    }
  });

  const updatedSegment: Segment = props.segment
    ? {
        ...props.segment,
        name: segmentName.value.trim(),
        teamId: selectedTeamId.value,
        mediaSegments,
      }
    : {
        id: `seg-${Date.now()}`,
        name: segmentName.value.trim(),
        teamId: selectedTeamId.value,
        mediaSegments,
      };

  emit('submit', updatedSegment);
  handleClose();
};

const handleClose = () => {
  if (props.segment) {
    // Reset to segment values for edit mode
    segmentName.value = props.segment.name;
    selectedTeamId.value = props.segment.teamId;
    const media = props.segment.mediaSegments.map(ms => ms.mediaType);
    selectedMedia.value = media;
    const budgets: Record<MediaType, number> = {
      'Outdoor': 0,
      'ТВ': 0,
      'Радио': 0,
      'Интернет': 0,
      'НСТ': 0,
    };
    props.segment.mediaSegments.forEach(ms => {
      budgets[ms.mediaType] = ms.budget;
    });
    mediaBudgets.value = budgets;
  } else {
    // Clear for add mode
    segmentName.value = '';
    selectedTeamId.value = null;
    selectedMedia.value = [];
    mediaBudgets.value = {
      'Outdoor': 0,
      'ТВ': 0,
      'Радио': 0,
      'Интернет': 0,
      'НСТ': 0,
    };
  }
  emit('close');
};

watch(() => [props.isOpen, props.segment], ([isOpen, segment]) => {
  if (isOpen && segment) {
    // Load segment data for editing
    segmentName.value = segment.name;
    selectedTeamId.value = segment.teamId;
    
    const media = segment.mediaSegments.map(ms => ms.mediaType);
    selectedMedia.value = media;
    
    const budgets: Record<MediaType, number> = {
      'Outdoor': 0,
      'ТВ': 0,
      'Радио': 0,
      'Интернет': 0,
      'НСТ': 0,
    };
    
    segment.mediaSegments.forEach(ms => {
      budgets[ms.mediaType] = ms.budget;
    });
    
    mediaBudgets.value = budgets;
  } else if (!isOpen) {
    handleClose();
  }
});
</script>

<style scoped>
.add-segment-form {
  display: flex;
  flex-direction: column;
  gap: 10px; /* space-y-2.5 = 0.625rem = 10px */
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

.form-label-media {
  margin-bottom: 6px; /* mb-1.5 = 0.375rem = 6px */
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

/* Media selection styles - matching React version */
.media-selection {
  display: flex;
  flex-direction: column;
  gap: 6px; /* space-y-1.5 = 0.375rem = 6px */
}

.media-option {
  display: flex;
  align-items: center;
  gap: 10px; /* gap-2.5 = 0.625rem = 10px */
  padding: 10px; /* p-2.5 = 0.625rem = 10px */
  border: 1px solid #E5E7EB; /* border-gray-200 */
  border-radius: 0.5rem; /* rounded-lg = 8px */
  cursor: pointer;
  transition: all 0.2s;
  background-color: #FFFFFF;
}

.media-option:hover {
  border-color: #90CAF9; /* hover:border-primary-300 */
  background-color: rgba(227, 242, 253, 0.3); /* hover:bg-primary-50/30 */
}

.media-option-selected {
  border-color: #90CAF9; /* border-primary-300 when selected */
  background-color: rgba(227, 242, 253, 0.3); /* bg-primary-50/30 when selected */
}

.media-checkbox {
  width: 16px; /* w-4 = 1rem = 16px */
  height: 16px; /* h-4 = 1rem = 16px */
  accent-color: #2196F3; /* text-primary-600 */
  border: 1px solid #D1D5DB; /* border-gray-300 */
  border-radius: 4px; /* rounded */
  cursor: pointer;
}

.media-checkbox:focus {
  outline: 2px solid #2196F3; /* focus:ring-primary-500 */
  outline-offset: 2px; /* focus:ring-2 */
}

.media-name {
  flex: 1;
  font-weight: 500;
  color: #111827; /* text-gray-900 */
  font-size: 14px; /* text-sm */
}

.media-budget-input {
  width: 144px; /* w-36 = 9rem = 144px */
  padding: 6px 10px; /* py-1.5 px-2.5 = 6px 10px */
  background-color: #FFFFFF;
  border: 1px solid #D1D5DB; /* border-gray-300 */
  border-radius: 0.5rem; /* rounded-lg = 8px */
  font-size: 14px; /* text-sm */
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  outline: none;
  transition: all 0.2s;
}

.media-budget-input:focus {
  border-color: #2196F3; /* focus:border-primary-500 */
  box-shadow: 0 0 0 1px #2196F3; /* focus:ring-1 focus:ring-primary-500 */
}

.media-budget-input::placeholder {
  color: #9E9E9E; /* placeholder-gray-500 */
  opacity: 1;
}

.media-hint {
  font-size: 12px; /* text-xs */
  color: #6B7280; /* text-gray-500 */
  margin-top: 6px; /* mt-1.5 = 0.375rem = 6px */
  margin-bottom: 0;
}

/* Total budget styles - matching React version */
.total-budget {
  padding: 12px; /* p-3 = 0.75rem = 12px */
  background-color: #E3F2FD; /* bg-primary-50 */
  border: 1px solid #90CAF9; /* border-primary-200 */
  border-radius: 0.5rem; /* rounded-lg = 8px */
}

.total-budget-text {
  font-size: 14px; /* text-sm */
  color: #111827; /* text-gray-900 */
}

.total-budget-text strong {
  font-weight: 600;
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
</style>
