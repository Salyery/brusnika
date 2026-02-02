<template>
  <v-select
    :model-value="displayValue"
    :items="items"
    :placeholder="placeholder"
    variant="outlined"
    density="compact"
    hide-details
    item-title="title"
    item-value="value"
    :list-props="{ density: 'compact', class: 'select-compact-list' }"
    class="custom-select"
    :class="selectClass"
    @update:model-value="handleChange"
  >
    <template #append-inner>
      <ChevronDown :size="16" class="select-chevron" />
    </template>
    <template #menu-icon>
      <!-- Hide default menu icon -->
    </template>
    <template #item="{ item, props: itemProps }">
      <v-list-item v-bind="itemProps" slim>
        <template #append>
          <Check v-if="props.modelValue === item.value" :size="16" class="select-item-check" />
        </template>
      </v-list-item>
    </template>
  </v-select>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ChevronDown, Check } from 'lucide-vue-next';

interface SelectItem {
  title: string;
  value: string | null;
}

interface Props {
  modelValue: string | null;
  items: SelectItem[];
  placeholder?: string;
  selectClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  selectClass: '',
});

const emit = defineEmits<{
  'update:modelValue': [value: string | null];
}>();

// Convert modelValue to the format v-select expects
const displayValue = computed(() => {
  if (props.modelValue === null) {
    return null;
  }
  // Find the item that matches the modelValue
  const item = props.items.find(i => i.value === props.modelValue);
  return item ? item.value : null;
});

const handleChange = (value: string | null) => {
  emit('update:modelValue', value);
};
</script>

<style scoped>
.custom-select {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  box-sizing: border-box;
  width: 100%;
}

.custom-select :deep(.v-input) {
  width: 100%;
}

.custom-select :deep(.v-input__control) {
  width: 100%;
}

.custom-select :deep(.v-field) {
  border: none !important;
  box-shadow: none !important;
  border-radius: 0.75rem !important; /* 12px */
  overflow: hidden !important;
  width: 100%;
}

.custom-select :deep(.v-field__outline) {
  border-radius: 0.75rem !important; /* 12px */
}

.custom-select :deep(.v-field__outline__start),
.custom-select :deep(.v-field__outline__end) {
  border-radius: 0.75rem !important;
}

.custom-select :deep(.v-field__field) {
  border-radius: 0.75rem !important;
}

.custom-select :deep(.v-field__input) {
  border-radius: 0.75rem !important;
}

.custom-select :deep(.v-field__append-inner) {
  padding-right: 0;
}

.custom-select :deep(.v-select__menu-icon) {
  display: none !important;
}

.select-chevron {
  color: #9E9E9E;
  opacity: 0.5;
  pointer-events: none;
}

.select-item-check {
  color: #1976d2;
  flex-shrink: 0;
}

/* Width classes - select wrappers take size of select content, no own width */
.filter-select-client,
.filter-select-brand,
.filter-select-year {
  width: fit-content;
  flex: 0 0 auto; /* Don't grow or shrink, size based on content */
}

/* Responsive - on mobile, selects should be full width */
@media (max-width: 768px) {
  .filter-select-client,
  .filter-select-brand,
  .filter-select-year {
    width: 100%;
    flex: 1 1 100%;
  }
  
  .custom-select {
    width: 100%;
  }
  
  .custom-select :deep(.v-input),
  .custom-select :deep(.v-input__control),
  .custom-select :deep(.v-field) {
    width: 100%;
  }
}

</style>
