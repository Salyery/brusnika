<template>
  <div class="date-picker-field">
    <v-menu
      v-model="menuOpen"
      :close-on-content-click="false"
      :scrim="false"
      location="bottom"
      :offset="4"
      transition="scale-transition"
    >
      <template #activator="{ props: menuProps }">
        <div v-bind="menuProps" class="date-picker-input-wrap">
          <input
            type="text"
            :value="displayValue"
            :placeholder="placeholder"
            :required="required"
            readonly
            class="form-input date-picker-input"
          />
          <Calendar :size="18" class="date-picker-icon" />
        </div>
      </template>
      <v-date-picker
        :model-value="modelValue || null"
        @update:model-value="handleDateSelect"
        hide-header
        class="theme-date-picker"
      />
    </v-menu>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Calendar } from 'lucide-vue-next';

interface Props {
  modelValue: string;
  placeholder?: string;
  required?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  required: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const menuOpen = ref(false);

const displayValue = computed(() => {
  if (!props.modelValue) return '';
  // Парсим дату в формате YYYY-MM-DD, используя локальное время
  const [year, month, day] = props.modelValue.split('-').map(Number);
  if (!year || !month || !day) return '';
  const d = new Date(year, month - 1, day);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
});

const handleDateSelect = (value: string | string[] | Date | Date[] | null) => {
  const date = Array.isArray(value) ? value[0] : value;
  if (date) {
    const d = date instanceof Date ? date : new Date(date);
    if (!isNaN(d.getTime())) {
      // Используем локальное время вместо UTC, чтобы избежать смещения на день
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      emit('update:modelValue', `${year}-${month}-${day}`);
    }
  }
  menuOpen.value = false;
};
</script>

<style scoped>
.date-picker-field {
  width: 100%;
}

.date-picker-input-wrap {
  position: relative;
  width: 100%;
  cursor: pointer;
}

.date-picker-input {
  cursor: pointer;
  padding-right: 36px !important;
}

.date-picker-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #757575;
  pointer-events: none;
}
</style>
