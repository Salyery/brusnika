<template>
  <div class="relative">
    <div v-if="label" class="text-caption text-grey-darken-1 mb-1">{{ label }}</div>
    <v-menu
      v-model="isOpen"
      :close-on-content-click="false"
      :scrim="false"
      location="bottom"
      :offset="4"
    >
      <template #activator="{ props: menuProps }">
        <v-btn
          v-bind="menuProps"
          variant="outlined"
          :class="['searchable-select-btn w-100', required && !modelValue ? 'border-error' : '']"
          :style="{ textAlign: 'left', justifyContent: 'space-between', letterSpacing: 'unset' }"
        >
          <span 
            class="searchable-select-text" 
            :class="selectedItem ? 'text-grey-darken-1' : 'text-grey'"
            :style="{ textAlign: 'left', letterSpacing: 'unset', flex: '1', display: 'block', width: '100%' }"
          >
            {{ selectedItem ? selectedItem.name : placeholder }}
          </span>
          <ChevronDown :size="16" class="searchable-select-icon transition-transform" :class="[isOpen ? 'rotate-180' : '']" />
        </v-btn>
      </template>
      <div class="searchable-select-dropdown">
        <div class="search-input-wrapper">
          <div class="search-input-inner">
            <Search 
              class="search-icon" 
              :size="16"
            />
            <input
              v-model="search"
              type="text"
              placeholder="Поиск..."
              class="search-input"
              autofocus
            />
          </div>
        </div>
        <div class="searchable-select-list">
          <div
            v-if="filteredOptions.length === 0"
            class="searchable-select-empty"
          >
            {{ availableOptions.length === 0 ? 'Нет доступных опций' : 'Ничего не найдено' }}
          </div>
          <button
            v-for="option in filteredOptions"
            :key="option.id"
            type="button"
            class="searchable-select-option"
            :class="{ 'searchable-select-option-selected': modelValue === option.id }"
            @click="handleSelect(option.id)"
          >
            <span class="searchable-select-option-text">{{ option.name }}</span>
            <Check
              v-if="modelValue === option.id"
              :size="16"
              class="searchable-select-option-check"
            />
          </button>
        </div>
      </div>
    </v-menu>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ChevronDown, Check, Search } from 'lucide-vue-next';

interface Option {
  id: string;
  name: string;
}

interface Props {
  modelValue: string;
  options: Option[];
  label?: string;
  placeholder?: string;
  required?: boolean;
  excludeIds?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  placeholder: 'Выберите опцию',
  required: false,
  excludeIds: () => [],
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const isOpen = ref(false);
const search = ref('');

const availableOptions = computed(() => {
  return props.options.filter(opt => !props.excludeIds.includes(opt.id));
});

const filteredOptions = computed(() => {
  if (search.value) {
    return availableOptions.value.filter(opt =>
      opt.name.toLowerCase().includes(search.value.toLowerCase())
    );
  }
  const first = availableOptions.value.slice(0, 6);
  if (props.modelValue) {
    const selected = availableOptions.value.find(opt => opt.id === props.modelValue);
    if (selected && !first.some(o => o.id === selected.id)) {
      return [selected, ...first.slice(0, 5)];
    }
  }
  return first;
});

const selectedItem = computed(() => {
  return props.options.find(opt => opt.id === props.modelValue);
});

const handleSelect = (id: string) => {
  emit('update:modelValue', id);
  isOpen.value = false;
  search.value = '';
};

watch(isOpen, (open) => {
  if (!open) {
    search.value = '';
  }
});
</script>

<style scoped>
.rotate-180 {
  transform: rotate(180deg);
}

/* Fix button text alignment and letter-spacing - using specific class with maximum specificity */
.searchable-select-btn,
.searchable-select-btn.v-btn,
.searchable-select-btn.v-btn.v-theme--dinnovate,
.searchable-select-btn.v-btn--variant-outlined,
.searchable-select-btn.v-btn--variant-outlined.v-theme--dinnovate {
  display: flex !important;
  text-align: left !important;
  justify-content: space-between !important;
  letter-spacing: unset !important;
}

.searchable-select-btn .v-btn__content,
.searchable-select-btn.v-btn .v-btn__content,
.searchable-select-btn.v-btn.v-theme--dinnovate .v-btn__content,
.searchable-select-btn.v-btn--variant-outlined .v-btn__content,
.searchable-select-btn.v-btn--variant-outlined.v-theme--dinnovate .v-btn__content {
  grid-area: unset !important;
  width: 100% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  text-align: left !important;
  letter-spacing: unset !important;
  padding: 0 !important;
}

.searchable-select-text,
.searchable-select-btn .v-btn__content .searchable-select-text,
.searchable-select-btn.v-btn .v-btn__content .searchable-select-text,
.searchable-select-btn .v-btn__content > span,
.searchable-select-btn.v-btn .v-btn__content > span {
  text-align: left !important;
  letter-spacing: unset !important;
  flex: 1 !important;
  display: flex !important;
  align-items: center !important;
  width: 100% !important;
}

.searchable-select-icon {
  flex-shrink: 0;
  margin-left: 8px;
}

.searchable-select-dropdown {
  min-width: 300px;
  max-height: 300px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid #eeeeee;
  overflow: hidden;
}

.searchable-select-list {
  max-height: 192px;
  overflow-y: auto;
  padding: 4px 0;
}

.searchable-select-empty {
  padding: 8px 12px;
  font-size: 12px;
  color: #9e9e9e;
}

.searchable-select-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 12px;
  padding-right: 32px;
  text-align: left;
  font-size: 12px;
  font-family: inherit;
  background: none;
  border: none;
  cursor: pointer;
  color: #616161;
  transition: background 0.15s;
}

.searchable-select-option-text {
  flex: 1;
  min-width: 0;
}

.searchable-select-option-check {
  flex-shrink: 0;
  color: #1976d2;
  margin-left: 8px;
}

.searchable-select-option:hover {
  background: #fafafa;
}

.searchable-select-option.searchable-select-option-selected {
  background: #e3f2fd !important;
  color: #1976d2 !important;
}

/* Search input styles - matching React version */
.search-input-wrapper {
  padding: 8px;
  border-bottom: 1px solid #eeeeee;
}

.search-input-inner {
  position: relative;
}

.search-icon,
.search-input-inner .search-icon,
.search-input-wrapper .search-icon {
  position: absolute !important;
  left: 8px !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  color: #9E9E9E !important;
  pointer-events: none !important;
  z-index: 1 !important;
  margin: 0 !important;
  padding: 0 !important;
}

.search-input {
  width: 100% !important;
  padding: 6px 12px 6px 32px !important;
  background-color: #FFFFFF;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;
}

.search-input:focus {
  border-color: #2196F3;
  box-shadow: 0 0 0 1px #2196F3;
}

.search-input::placeholder {
  color: #9E9E9E;
  opacity: 1;
}

/* Border error style - matching React version */
:deep(.border-error) {
  border-color: #FCA5A5 !important; /* border-red-300 */
}

:deep(.border-error.v-btn--variant-outlined) {
  border: 1px solid #FCA5A5 !important; /* border-red-300 */
}
</style>
