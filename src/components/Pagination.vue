<template>
  <div v-if="totalPages > 1" class="pagination">
    <span class="pagination-info">
      {{ startItem }}-{{ endItem }} из {{ total }}
    </span>
    <div class="pagination-controls">
      <button
        type="button"
        class="pagination-btn pagination-btn-prev"
        :disabled="currentPage === 1"
        aria-label="Предыдущая страница"
        @click="goToPage(currentPage - 1)"
      >
        <ChevronLeft :size="16" />
      </button>
      <div class="pagination-pages">
        <button
          v-for="(page, idx) in visiblePages"
          :key="typeof page === 'number' ? page : `ellipsis-${idx}`"
          type="button"
          :class="['pagination-page', { 'pagination-page-active': page === currentPage, 'pagination-page-ellipsis': page === '...' }]"
          :disabled="page === '...'"
          @click="typeof page === 'number' && goToPage(page)"
        >
          {{ page }}
        </button>
      </div>
      <button
        type="button"
        class="pagination-btn pagination-btn-next"
        :disabled="currentPage === totalPages"
        aria-label="Следующая страница"
        @click="goToPage(currentPage + 1)"
      >
        <ChevronRight :size="16" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

interface Props {
  total: number;
  perPage: number;
  currentPage: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:currentPage': [page: number];
}>();

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.perPage)));

const startItem = computed(() => {
  if (props.total === 0) return 0;
  return (props.currentPage - 1) * props.perPage + 1;
});

const endItem = computed(() => {
  const end = props.currentPage * props.perPage;
  return Math.min(end, props.total);
});

const visiblePages = computed(() => {
  const total = totalPages.value;
  const current = props.currentPage;
  const pages: (number | string)[] = [];

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
    return pages;
  }

  const showFirst = current <= 3;
  const showLast = current >= total - 2;

  if (showFirst) {
    for (let i = 1; i <= 5; i++) pages.push(i);
    pages.push('...');
    pages.push(total);
  } else if (showLast) {
    pages.push(1);
    pages.push('...');
    for (let i = total - 4; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    pages.push('...');
    for (let i = current - 1; i <= current + 1; i++) pages.push(i);
    pages.push('...');
    pages.push(total);
  }
  return pages;
});

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    emit('update:currentPage', page);
  }
};
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 0;
  flex-wrap: wrap;
}

.pagination-info {
  font-size: 14px;
  color: #616161;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
  color: #616161;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background: #f5f5f5;
  border-color: #bdbdbd;
  color: #212121;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-pages {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination-page {
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
  color: #616161;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-page:hover {
  background: #f5f5f5;
  border-color: #bdbdbd;
  color: #212121;
}

.pagination-page-active {
  background: #1e88e5;
  border-color: #1e88e5;
  color: #fff;
}

.pagination-page-active:hover {
  background: #1976d2;
  border-color: #1976d2;
  color: #fff;
}

.pagination-page-ellipsis,
.pagination-page:disabled {
  cursor: default;
  pointer-events: none;
}

.pagination-page-ellipsis:hover {
  background: #fff;
  border-color: #e0e0e0;
}
</style>
