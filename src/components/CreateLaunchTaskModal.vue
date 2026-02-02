<template>
  <v-dialog
    :model-value="isOpen"
    @update:model-value="$emit('close')"
    max-width="700"
    scrollable
    class="create-launch-task-dialog"
  >
    <v-card class="create-launch-task-card" :rounded="false">
      <v-card-title class="create-launch-task-header">
        <div class="create-launch-task-header-text">
          <h2 class="create-launch-task-title">Создать задачу на запуск</h2>
          <p class="create-launch-task-subtitle">{{ segmentName }}</p>
        </div>
        <button type="button" class="create-launch-task-close-btn" aria-label="Закрыть" @click="handleClose">
          <X :size="16" />
        </button>
      </v-card-title>

      <v-card-text class="create-launch-task-content">
        <form @submit.prevent="handleSubmit" class="create-launch-task-form">
          <div class="form-field">
            <label class="form-label">Соисполнители</label>
            <SearchableMultiSelect
              v-model="coExecutors"
              :options="mockUsers"
              placeholder="Выберите соисполнителей"
            />
          </div>

          <div class="form-field">
            <label class="form-label">Наблюдатели</label>
            <SearchableMultiSelect
              v-model="observers"
              :options="mockUsers"
              placeholder="Выберите наблюдателей"
            />
          </div>

          <div class="form-row form-row-dates">
            <div class="form-field">
              <label class="form-label">Дата начала <span class="text-red-500">*</span></label>
              <DatePickerField
                v-model="dateFrom"
                placeholder="Выберите дату"
                required
              />
            </div>
            <div class="form-field">
              <label class="form-label">Дата окончания <span class="text-red-500">*</span></label>
              <DatePickerField
                v-model="dateTo"
                placeholder="Выберите дату"
                required
              />
            </div>
          </div>

          <div class="form-field">
            <label class="form-label">
              Приложенные РИМ и документы, либо дата их предоставления <span class="text-red-500">*</span>
            </label>
            <div class="launch-task-docs">
              <div class="launch-task-docs-toolbar">
                <button type="button" class="launch-task-docs-btn" title="Жирный текст" @click="insertFormatting('bold')">
                  <Bold :size="16" />
                </button>
                <button type="button" class="launch-task-docs-btn" title="Добавить ссылку" @click="insertFormatting('link')">
                  <LinkIcon :size="16" />
                </button>
              </div>
              <textarea
                ref="textareaRef"
                v-model="documentsText"
                class="launch-task-docs-textarea form-input"
                rows="4"
                required
                placeholder="Опишите приложенные документы или укажите дату их предоставления. Используйте **текст** для выделения жирным и [текст](url) для ссылок."
              />
            </div>
            <p class="form-hint">Поддерживается markdown: **жирный**, [ссылка](url)</p>
          </div>

          <div class="form-field">
            <label class="form-label">
              Срок предоставления медиафакта (согласованный с клиентом) <span class="text-red-500">*</span>
            </label>
            <div class="radio-group">
              <label class="radio-option">
                <input v-model="mediaFactDeadline" type="radio" value="standard" />
                <span>Стандартные условия по СМИ</span>
              </label>
              <label class="radio-option">
                <input v-model="mediaFactDeadline" type="radio" value="custom" />
                <span>Другой вариант</span>
              </label>
            </div>
            <input
              v-if="mediaFactDeadline === 'custom'"
              v-model="customMediaFactDeadline"
              type="text"
              class="form-input mt-2"
              placeholder="Укажите срок"
              required
            />
          </div>

          <hr class="form-divider" />
          <h3 class="form-section-title">Информация по отчётности</h3>

          <div class="form-field">
            <label class="form-label">Особые требования к отчету <span class="text-red-500">*</span></label>
            <SearchableMultiSelect
              v-model="reportRequirementsSelected"
              :options="reportRequirementsOptions"
              placeholder="Выберите требования"
            />
            <input
              v-if="reportRequirementsSelected.includes('other')"
              v-model="customReportRequirement"
              type="text"
              class="form-input mt-2"
              placeholder="Опишите другой вариант"
              required
            />
          </div>

          <div class="form-field">
            <label class="form-label">Технический фотоотчет <span class="text-red-500">*</span></label>
            <div class="toggle-group">
              <span class="toggle-label">Нет</span>
              <button
                type="button"
                class="toggle-switch"
                :class="{ 'toggle-switch-active': technicalPhotoReport === 'yes' }"
                @click="handleTechnicalPhotoReportToggle"
              >
                <span class="toggle-switch-thumb"></span>
              </button>
              <span class="toggle-label">Да</span>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="form-btn form-btn-cancel" @click="handleClose">
              Отмена
            </button>
            <button
              type="submit"
              class="form-btn form-btn-submit"
              :disabled="!isFormValid"
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
import { ref, computed, watch, nextTick } from 'vue';
import { X, Bold, Link as LinkIcon } from 'lucide-vue-next';
import type { Project } from '@/types';
import SearchableMultiSelect from './SearchableMultiSelect.vue';
import DatePickerField from './DatePickerField.vue';

interface Props {
  isOpen: boolean;
  segmentName: string;
  project: Project;
  segmentId: string;
  mediaSegmentId: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  update: [project: Project];
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

const reportRequirements = [
  { id: 'night-photo', label: 'Ночные фото' },
  { id: 'close-photo', label: 'Фото вблизи' },
  { id: 'every-plot', label: 'Фото каждого сюжета' },
  { id: 'video', label: 'Видеоотчет' },
  { id: 'es', label: 'ЭС' },
  { id: 'other', label: 'Другой вариант' },
];

const reportRequirementsOptions = computed(() => {
  return reportRequirements.map(r => ({ id: r.id, name: r.label }));
});

const textareaRef = ref<HTMLTextAreaElement | null>(null);

const coExecutors = ref<string[]>([]);
const observers = ref<string[]>([]);
const dateFrom = ref('');
const dateTo = ref('');
const documentsText = ref('');
const mediaFactDeadline = ref<'standard' | 'custom'>('standard');
const customMediaFactDeadline = ref('');
const technicalPhotoReport = ref<'yes' | 'no' | ''>('');
const reportRequirementsSelected = ref<string[]>([]);
const customReportRequirement = ref('');

const isFormValid = computed(() => {
  return !!(
    dateFrom.value &&
    dateTo.value &&
    documentsText.value &&
    technicalPhotoReport.value &&
    reportRequirementsSelected.value.length > 0 &&
    (mediaFactDeadline.value !== 'custom' || customMediaFactDeadline.value) &&
    (!reportRequirementsSelected.value.includes('other') || customReportRequirement.value)
  );
});

watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    coExecutors.value = [];
    observers.value = [];
    dateFrom.value = '';
    dateTo.value = '';
    documentsText.value = '';
    mediaFactDeadline.value = 'standard';
    customMediaFactDeadline.value = '';
    technicalPhotoReport.value = '';
    reportRequirementsSelected.value = [];
    customReportRequirement.value = '';
  }
});

function insertFormatting(type: 'bold' | 'link') {
  nextTick(() => {
    const textarea = textareaRef.value;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = documentsText.value.substring(start, end);
    let newText = '';

    if (type === 'bold') {
      newText = documentsText.value.substring(0, start) + `**${selectedText || 'текст'}**` + documentsText.value.substring(end);
      documentsText.value = newText;
      nextTick(() => {
        textarea.focus();
        const newStart = start + 2;
        textarea.setSelectionRange(newStart, newStart + (selectedText || 'текст').length);
      });
    } else if (type === 'link') {
      const url = prompt('Введите URL:');
      if (url) {
        newText = documentsText.value.substring(0, start) + `[${selectedText || 'текст ссылки'}](${url})` + documentsText.value.substring(end);
        documentsText.value = newText;
        nextTick(() => textarea.focus());
      }
    }
  });
}

const handleTechnicalPhotoReportToggle = () => {
  technicalPhotoReport.value = technicalPhotoReport.value === 'yes' ? 'no' : 'yes';
};

function handleSubmit(e?: Event) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  if (!isFormValid.value) {
    return;
  }

  const taskId = `lt-${Date.now()}`;
  const updatedProject: Project = {
    ...props.project,
    segments: props.project.segments.map(segment => {
      if (segment.id !== props.segmentId) return segment;
      return {
        ...segment,
        mediaSegments: segment.mediaSegments.map(mediaSegment => {
          if (mediaSegment.id !== props.mediaSegmentId) return mediaSegment;
          return {
            ...mediaSegment,
            launchTasks: [
              ...(mediaSegment.launchTasks || []),
              {
                id: taskId,
                coExecutors: coExecutors.value,
                observers: observers.value,
                dateFrom: dateFrom.value,
                dateTo: dateTo.value,
                documentsText: documentsText.value,
                mediaFactDeadline: mediaFactDeadline.value === 'custom' ? customMediaFactDeadline.value : mediaFactDeadline.value,
                technicalPhotoReport: technicalPhotoReport.value,
                reportRequirements: reportRequirementsSelected.value.includes('other')
                  ? [...reportRequirementsSelected.value, customReportRequirement.value]
                  : reportRequirementsSelected.value,
              },
            ],
          };
        }),
      };
    }),
  };

  emit('update', updatedProject);
  handleClose();
}

function handleClose() {
  coExecutors.value = [];
  observers.value = [];
  dateFrom.value = '';
  dateTo.value = '';
  documentsText.value = '';
  mediaFactDeadline.value = 'standard';
  customMediaFactDeadline.value = '';
  technicalPhotoReport.value = '';
  reportRequirementsSelected.value = [];
  customReportRequirement.value = '';
  emit('close');
}
</script>

<style scoped>
.create-launch-task-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-label {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0;
}

.text-red-500 {
  color: #ef4444;
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-row-dates {
  flex-wrap: wrap;
}

.form-row-dates .form-field {
  flex: 1;
  min-width: 160px;
}

.mt-2 {
  margin-top: 8px;
}

.form-hint {
  font-size: 12px;
  color: #6b7280;
  margin: 4px 0 0;
}

.launch-task-docs {
  border: 1px solid #d1d5db;
  border-radius: 0.75rem;
  overflow: hidden;
  background: #fff;
}

.launch-task-docs-toolbar {
  display: flex;
  gap: 4px;
  padding: 6px 8px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.launch-task-docs-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: none;
  border: none;
  border-radius: 6px;
  color: #6b7280;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.launch-task-docs-btn:hover {
  background: #e5e7eb;
  color: #111827;
}

.launch-task-docs-textarea {
  display: block;
  width: 100%;
  min-height: 96px;
  padding: 12px;
  resize: vertical;
  border: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}

.launch-task-docs-textarea:focus {
  outline: none;
  box-shadow: none !important;
}

.form-divider {
  margin: 16px 0 8px;
  border: none;
  border-top: 1px solid #e5e7eb;
}

.form-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px;
}

.radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 24px;
}

.radio-option {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
}

.radio-option input {
  width: 16px;
  height: 16px;
  accent-color: #1e88e5;
}

.form-actions {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  margin-top: 4px;
  width: 100%;
}

.form-btn {
  flex: 1;
  padding: 8px 16px;
  border-radius: 0.75rem;
  font-weight: 500;
  font-size: 14px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.form-btn-cancel {
  background: #fff;
  border: 1px solid #d1d5db;
  color: #374151;
}

.form-btn-cancel:hover {
  background: #f9fafb;
}

.form-btn-submit {
  background: #1e88e5;
  color: #fff;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.form-btn-submit:hover:not(:disabled) {
  background: #1976d2;
}

.form-btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

:deep(.v-overlay__scrim) {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

:deep(.v-overlay) {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}
</style>
