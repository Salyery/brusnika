<template>
  <div class="relative">
    <div v-if="label" class="text-caption text-grey-darken-1 mb-1">{{ label }}</div>
    <v-chip-group
      v-if="selectedItems.length > 0"
      class="mt-2 searchable-multiselect-chips"
    >
      <v-chip
        v-for="item in selectedItems"
        :key="item.id"
        size="small"
        closable
        @click:close="handleToggle(item.id)"
      >
        {{ item.name }}
      </v-chip>
    </v-chip-group>

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
          class="searchable-multiselect-btn w-100"
          :style="{ textAlign: 'left', justifyContent: 'space-between', letterSpacing: 'unset' }"
        >
          <span 
            class="searchable-multiselect-text" 
            :class="selectedItems.length > 0 ? 'text-grey-darken-1' : 'text-grey'"
            :style="{ textAlign: 'left', letterSpacing: 'unset', flex: '1', display: 'block', width: '100%' }"
          >
            {{ selectedItems.length > 0 ? `Выбрано: ${selectedItems.length}` : placeholder }}
          </span>
          <ChevronDown :size="16" class="searchable-multiselect-icon transition-transform" :class="[isOpen ? 'rotate-180' : '']" />
        </v-btn>
      </template>
      <div class="searchable-multiselect-dropdown">
        <div v-if="options.length > 6" class="search-input-wrapper">
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
        <div class="searchable-multiselect-list">
          <div
            v-if="filteredOptions.length === 0"
            class="searchable-multiselect-empty"
          >
            {{ availableOptions.length === 0 ? 'Нет доступных опций' : 'Ничего не найдено' }}
          </div>
          <button
            v-for="option in filteredOptions"
            :key="option.id"
            type="button"
            class="searchable-multiselect-option"
            @click="handleToggle(option.id)"
          >
            <span class="searchable-multiselect-checkbox" :class="{ 'searchable-multiselect-checkbox-checked': modelValue.includes(option.id) }">
              <svg v-if="modelValue.includes(option.id)" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </span>
            {{ option.name }}
          </button>
        </div>
      </div>
    </v-menu>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ChevronDown, Search } from 'lucide-vue-next';

interface Option {
  id: string;
  name: string;
}

interface Props {
  modelValue: string[];
  options: Option[];
  label?: string;
  placeholder?: string;
  excludeIds?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  placeholder: 'Выберите опции',
  excludeIds: () => [],
});

const emit = defineEmits<{
  'update:modelValue': [value: string[]];
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
  return availableOptions.value.slice(0, 6);
});

const selectedItems = computed(() => {
  return props.options.filter(opt => props.modelValue.includes(opt.id));
});

const handleToggle = (id: string) => {
  const newValue = props.modelValue.includes(id)
    ? props.modelValue.filter(v => v !== id)
    : [...props.modelValue, id];
  emit('update:modelValue', newValue);
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
.searchable-multiselect-btn,
.searchable-multiselect-btn.v-btn,
.searchable-multiselect-btn.v-btn.v-theme--dinnovate,
.searchable-multiselect-btn.v-btn--variant-outlined,
.searchable-multiselect-btn.v-btn--variant-outlined.v-theme--dinnovate {
  display: flex !important;
  text-align: left !important;
  justify-content: space-between !important;
  letter-spacing: unset !important;
}

.searchable-multiselect-btn .v-btn__content,
.searchable-multiselect-btn.v-btn .v-btn__content,
.searchable-multiselect-btn.v-btn.v-theme--dinnovate .v-btn__content,
.searchable-multiselect-btn.v-btn--variant-outlined .v-btn__content,
.searchable-multiselect-btn.v-btn--variant-outlined.v-theme--dinnovate .v-btn__content {
  grid-area: unset !important;
  width: 100% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  text-align: left !important;
  letter-spacing: unset !important;
  padding: 0 !important;
}

.searchable-multiselect-text,
.searchable-multiselect-btn .v-btn__content .searchable-multiselect-text,
.searchable-multiselect-btn.v-btn .v-btn__content .searchable-multiselect-text,
.searchable-multiselect-btn .v-btn__content > span,
.searchable-multiselect-btn.v-btn .v-btn__content > span {
  text-align: left !important;
  letter-spacing: unset !important;
  flex: 1 !important;
  display: flex !important;
  align-items: center !important;
  width: 100% !important;
}

.searchable-multiselect-icon {
  flex-shrink: 0;
  margin-left: 8px;
}

.searchable-multiselect-dropdown {
  min-width: 300px;
  max-height: 300px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid #eeeeee;
  overflow: hidden;
}

.searchable-multiselect-list {
  max-height: 192px;
  overflow-y: auto;
  padding: 4px 0;
}

.searchable-multiselect-empty {
  padding: 8px 12px;
  font-size: 12px;
  color: #9e9e9e;
}

.searchable-multiselect-option {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  text-align: left;
  font-size: 12px;
  font-family: inherit;
  background: none;
  border: none;
  cursor: pointer;
  color: #616161;
  transition: background 0.15s;
}

.searchable-multiselect-option:hover {
  background: #fafafa;
}

.searchable-multiselect-checkbox {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1e88e5;
}

.searchable-multiselect-checkbox-checked {
  background: #1e88e5;
  border-color: #1e88e5;
}

.searchable-multiselect-checkbox-checked svg {
  color: #fff;
}

/* Chips for selected items - matching React (bg-primary-100 text-primary-700) */
.searchable-multiselect-chips :deep(.v-chip) {
  background-color: #bbdefb !important;
  color: #1976d2 !important;
  font-size: 12px !important;
  border-radius: 6px !important;
}

/* Search input styles - matching React version */
.search-input-wrapper {
  position: relative;
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

.search-input:focus {
  border-color: #2196F3;
  box-shadow: 0 0 0 1px #2196F3;
}

.search-input::placeholder {
  color: #9E9E9E;
  opacity: 1;
}
</style>
