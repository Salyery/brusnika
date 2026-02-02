<template>
  <div class="projects-list">
    <!-- Compact Header Section -->
    <div class="projects-header">
      <div class="projects-header-container">
        <div class="projects-header-content">
          <h1 class="projects-title">Проекты</h1>
          
          <div class="projects-filters">
            <div class="search-wrapper projects-search">
              <Search class="search-icon" :size="16" />
              <input
                v-model="filterName"
                type="text"
                placeholder="Название проекта..."
                class="search-input"
              />
            </div>
            <div class="projects-filters-group">
              <Select
                v-model="filterClient"
                :items="clientSelectItems"
                placeholder="Все клиенты"
                select-class="filter-select-client"
                @update:model-value="handleClientChange"
              />
              <Select
                v-model="filterBrand"
                :items="brandSelectItems"
                placeholder="Все бренды"
                select-class="filter-select-brand"
                @update:model-value="handleBrandChange"
              />
              <Select
                v-model="filterYear"
                :items="yearSelectItems"
                placeholder="Все годы"
                select-class="filter-select-year"
                @update:model-value="handleYearChange"
              />
            </div>
          </div>

          <button
            class="add-project-btn"
            @click="$emit('open-add-project-modal')"
          >
            <Plus :size="16" />
            Добавить проект
          </button>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="projects-content">
      <div v-if="filteredProjects.length === 0" class="empty-state">
        <div class="empty-state-icon">
          <Building2 :size="32" />
        </div>
        <h3 class="empty-state-title">Нет созданных проектов</h3>
        <p class="empty-state-text">Начните с создания первого проекта рекламной кампании</p>
        <button
          class="empty-state-btn"
          @click="$emit('open-add-project-modal')"
        >
          Создать проект
        </button>
      </div>

      <div v-else>
        <div class="projects-grid">
          <v-sheet
            v-for="project in paginatedProjects"
          :key="project.id"
          variant="outlined"
          :class="['project-card-sheet', { 'cursor-pointer': !isEmptyProject(project) }]"
          @click="(e) => handleCardClick(e, project)"
        >
            <!-- Header -->
            <div class="project-header">
              <h3 class="project-name">{{ project.name }}</h3>
              <v-tooltip text="Тип согласования с клиентом" location="bottom">
                <template #activator="{ props: tooltipProps }">
                  <span v-bind="tooltipProps" class="project-badge">{{ project.settings.approvalType }}</span>
                </template>
              </v-tooltip>
              <span
                v-if="isEmptyProject(project)"
                class="project-warning-badge"
              >
                <AlertCircle :size="12" />
                Требует настройки
              </span>
            </div>
            
            <!-- Grid 3x2 -->
            <div class="project-grid">
              <div class="project-grid-item">
                <p class="project-label">Клиент</p>
                <p class="project-value">{{ getClientName(project.clientId) }}</p>
              </div>
              <div class="project-grid-item">
                <p class="project-label">Период</p>
                <p class="project-value">
                  {{ formatPeriod(project.settings.period.start, project.settings.period.end) }}
                </p>
              </div>
              <div class="project-grid-item">
                <p class="project-label">Бренд</p>
                <p class="project-value">{{ getBrandName(project.brandId) }}</p>
              </div>
              <div class="project-grid-item">
                <p class="project-label">Бюджет</p>
                <p class="project-value project-budget">{{ formatCurrency(getTotalBudget(project)) }}</p>
              </div>
              <div class="project-grid-item">
                <p class="project-label">Медиасегменты</p>
                <div class="project-tags">
                  <template v-if="getMediaSegmentsCount(project) > 0">
                    <span
                      v-for="ms in getMediaSegments(project)"
                      :key="ms.id"
                      class="project-tag project-tag-secondary"
                    >
                      {{ ms.mediaType }}
                    </span>
                  </template>
                  <span v-else class="project-empty">—</span>
                </div>
              </div>
              <div class="project-grid-item">
                <p class="project-label">Команды</p>
                <div class="project-tags">
                  <template v-if="getUsedTeams(project).length > 0">
                    <span
                      v-for="team in getUsedTeams(project)"
                      :key="team.id"
                      class="project-tag project-tag-warning"
                    >
                      {{ team.name }}
                    </span>
                  </template>
                  <span v-else class="project-empty">—</span>
                </div>
              </div>
            </div>

            <!-- Segments Detail -->
            <div v-if="project.segments.length > 0" class="project-segments">
              <div class="project-segments-list">
                <div
                  v-for="segment in project.segments.slice(0, 5)"
                  :key="segment.id"
                  class="project-segment"
                >
                  <span class="segment-name">{{ segment.name }}</span>
                  <span class="segment-divider">•</span>
                  <span class="segment-value">{{ getTeamName(project, segment.teamId) }}</span>
                  <span class="segment-divider">•</span>
                  <span class="segment-value">{{ getSegmentMediaList(segment) }}</span>
                  <span class="segment-divider">•</span>
                  <span class="segment-budget">
                    {{ formatCompactCurrency(getSegmentBudget(segment)) }}
                  </span>
                  <template v-if="getSegmentMediaPlansCount(segment) > 0">
                    <span class="segment-divider">•</span>
                    <span class="segment-value">МП:</span>
                    <span class="segment-count">{{ getSegmentMediaPlansCount(segment) }}</span>
                  </template>
                </div>
                <div
                  v-if="project.segments.length > 5"
                  class="project-segment project-segment-more"
                >
                  +{{ project.segments.length - 5 }} ещё
                </div>
              </div>
            </div>

            <!-- Onboarding for empty projects -->
            <div v-if="isEmptyProject(project)" class="project-onboarding">
              <div class="onboarding-content">
                <div class="onboarding-header">
                  <div class="onboarding-icon">
                    <AlertCircle :size="20" />
                  </div>
                  <div class="onboarding-text">
                    <h4 class="onboarding-title">Настройте проект</h4>
                    <p class="onboarding-description">Для начала работы выполните следующие шаги:</p>
                  </div>
                </div>

                <div class="onboarding-steps">
                  <div
                    v-for="(step, index) in onboardingSteps"
                    :key="index"
                    class="onboarding-step"
                  >
                    <div class="onboarding-step-number">{{ index + 1 }}</div>
                    <span class="onboarding-step-text">{{ step }}</span>
                  </div>
                </div>

                <button
                  class="onboarding-btn"
                  @click.stop="handleProjectSelect(project.id)"
                >
                  Начать настройку проекта
                  <ChevronRight :size="16" />
                </button>
              </div>
            </div>
        </v-sheet>
        </div>
        <Pagination
          :total="filteredProjects.length"
          :per-page="PROJECTS_PER_PAGE"
          :current-page="projectsPage"
          @update:current-page="projectsPage = $event"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Plus, Building2, AlertCircle, ChevronRight, Search } from 'lucide-vue-next';
import Select from '@/components/Select.vue';
import Pagination from '@/components/Pagination.vue';
import type { Project, Client, Brand, Team } from '@/types';

interface Props {
  projects: Project[];
  clients: Client[];
  brands: Brand[];
  teams: Team[];
  brandFilter?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  brandFilter: null,
});

const emit = defineEmits<{
  'project-select': [projectId: string];
  'open-add-project-modal': [];
  'brand-filter-change': [brandId: string | null];
}>();

// Filters
const filterName = ref('');
const filterClient = ref<string | null>(null);
const filterBrand = ref<string | null>(props.brandFilter);
const filterYear = ref<string | null>(null);
const projectsPage = ref(1);

// Select items
const clientSelectItems = computed(() => [
  { title: 'Все клиенты', value: null },
  ...props.clients.map(c => ({ title: c.name, value: c.id }))
]);

const brandSelectItems = computed(() => [
  { title: 'Все бренды', value: null },
  ...props.brands.map(b => ({ title: b.name, value: b.id }))
]);

const yearSelectItems = computed(() => {
  const years = getYears();
  return [
    { title: 'Все годы', value: null },
    ...years.map(y => ({ title: y, value: y }))
  ];
});

// Filter handlers
const handleClientChange = (value: string | null) => {
  filterClient.value = value;
};

const handleBrandChange = (value: string | null) => {
  filterBrand.value = value;
  emit('brand-filter-change', value);
};

const handleYearChange = (value: string | null) => {
  filterYear.value = value;
};

// Get unique years
const getYears = () => {
  const years = new Set<string>();
  props.projects.forEach(project => {
    const year = new Date(project.settings.period.start).getFullYear();
    years.add(year.toString());
  });
  return Array.from(years).sort((a, b) => b.localeCompare(a));
};

// Filtered projects
const filteredProjects = computed(() => {
  return props.projects.filter(project => {
    const nameMatch = project.name.toLowerCase().includes(filterName.value.toLowerCase());
    const clientMatch = !filterClient.value || project.clientId === filterClient.value;
    const brandMatch = !filterBrand.value || project.brandId === filterBrand.value;
    const yearMatch = !filterYear.value || new Date(project.settings.period.start).getFullYear().toString() === filterYear.value;
    return nameMatch && clientMatch && brandMatch && yearMatch;
  });
});

// Paginated projects (10 per page)
const PROJECTS_PER_PAGE = 10;
const paginatedProjects = computed(() => {
  const start = (projectsPage.value - 1) * PROJECTS_PER_PAGE;
  return filteredProjects.value.slice(start, start + PROJECTS_PER_PAGE);
});

watch(filteredProjects, () => {
  projectsPage.value = 1;
});

// Helper functions
const getClientName = (clientId: string) => {
  return props.clients.find(c => c.id === clientId)?.name || '';
};

const getBrandName = (brandId?: string) => {
  if (!brandId) return '—';
  return props.brands.find(b => b.id === brandId)?.name || '—';
};

const getTeamName = (project: Project, teamId: string) => {
  return props.teams.find(t => t.id === teamId)?.name || '—';
};

const getUsedTeams = (project: Project) => {
  const usedTeamIds = new Set(project.segments.map(s => s.teamId));
  return props.teams.filter(t => usedTeamIds.has(t.id) && t.clientId === project.clientId);
};

const getTotalBudget = (project: Project) => {
  return project.segments.reduce((sum, segment) => {
    return sum + segment.mediaSegments.reduce((segSum, ms) => segSum + ms.budget, 0);
  }, 0);
};

const getSegmentBudget = (segment: Project['segments'][0]) => {
  return segment.mediaSegments.reduce((sum, ms) => sum + ms.budget, 0);
};

const getMediaSegments = (project: Project) => {
  const allMediaSegments = project.segments.flatMap(seg => seg.mediaSegments);
  // Возвращаем только уникальные медиасегменты по типу медиа
  const uniqueMediaTypes = new Set<string>();
  return allMediaSegments.filter(ms => {
    if (uniqueMediaTypes.has(ms.mediaType)) {
      return false;
    }
    uniqueMediaTypes.add(ms.mediaType);
    return true;
  });
};

const getMediaSegmentsCount = (project: Project) => {
  // Считаем только уникальные типы медиа
  const uniqueMediaTypes = new Set<string>();
  project.segments.forEach(seg => {
    seg.mediaSegments.forEach(ms => {
      uniqueMediaTypes.add(ms.mediaType);
    });
  });
  return uniqueMediaTypes.size;
};

const getSegmentMediaList = (segment: Project['segments'][0]) => {
  // Возвращаем только уникальные типы медиа
  const uniqueMediaTypes = Array.from(new Set(segment.mediaSegments.map(ms => ms.mediaType)));
  return uniqueMediaTypes.join(', ');
};

const getSegmentMediaPlansCount = (segment: Project['segments'][0]) => {
  return segment.mediaSegments.reduce((sum, ms) => sum + ms.mediaPlans.length, 0);
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatCompactCurrency = (amount: number) => {
  return new Intl.NumberFormat('ru-RU', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(amount) + ' ₽';
};

const formatPeriod = (start: string, end: string) => {
  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };
  return `${formatDate(start)} — ${formatDate(end)}`;
};

const isEmptyProject = (project: Project) => {
  return project.segments.length === 0;
};

const handleCardClick = (event: MouseEvent, project: Project) => {
  // Проверяем, что клик не был на интерактивном элементе (кнопка внутри onboarding)
  const target = event.target as HTMLElement;
  if (target.closest('.onboarding-btn')) {
    return;
  }
  
  if (!isEmptyProject(project)) {
    handleProjectSelect(project.id);
  }
};

const handleProjectSelect = (projectId: string) => {
  emit('project-select', projectId);
};

const onboardingSteps = [
  'Создайте команды проекта, если требуется (по умолчанию есть «Штаб»)',
  'Добавьте сегменты рекламной кампании',
  'В каждом сегменте настройте медиа и бюджеты',
  'Загрузите медиапланы, проверьте отображения в Google Sheets',
];
</script>

<style scoped>
.projects-list {
  min-height: 100vh;
  background-color: #FAFAFA;
}

/* Header Section */
.projects-header {
  background-color: #FFFFFF;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important; /* shadow-sm - matching React version */
}

.projects-header-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 16px 24px;
}

.projects-header-content {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  min-width: 0;
}

.projects-title {
  flex-shrink: 0;
  font-weight: 600;
  color: #212121;
  white-space: nowrap;
  margin: 0;
}

.projects-filters {
  flex: 1 1 0;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.search-wrapper {
  position: relative;
  flex: 1;
  min-width: 0;
}

/* Ensure filters wrap when container is too narrow */
@media (max-width: 1200px) {
  .projects-filters {
    flex-wrap: wrap;
  }
  
  .projects-search {
    flex: 1 1 100% !important;
    min-width: 200px;
    order: 1;
  }
  
  .projects-filters-group {
    flex: 1 1 100%;
    order: 2;
  }
  
  .projects-filters-group .filter-select-client,
  .projects-filters-group .filter-select-brand,
  .projects-filters-group .filter-select-year {
    flex: 1 1 auto;
    min-width: 140px;
  }
  
  .add-project-btn {
    flex: 0 0 auto;
    order: 3;
  }
}

.search-icon {
  position: absolute;
  left: 12px !important;
  top: 50%;
  transform: translateY(-50%);
  color: #9E9E9E;
  pointer-events: none;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 6px 12px 6px 32px !important;
  background-color: #FFFFFF;
  border: 1px solid #D1D5DB;
  border-radius: 12px;
  font-size: 14px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;
}

.search-input:focus {
  border-color: #2196F3 !important;
  box-shadow: inset 0 0 0 1px #2196F3 !important;
}

.projects-filters .search-input {
  background-color: #FAFAFA !important;
  border-color: #E0E0E0 !important;
}

.projects-filters .search-input:focus {
  background-color: #FFFFFF !important;
  border-color: #2196F3 !important;
  box-shadow: inset 0 0 0 1px #2196F3 !important;
}

.add-project-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #1E88E5;
  color: #FFFFFF;
  padding: 8px 16px;
  border-radius: 0.75rem; /* 12px */
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.add-project-btn:hover {
  background-color: #1976D2;
}

/* Content Section */
.projects-content {
  max-width: 1440px;
  margin: 0 auto;
  padding: 24px;
}

/* Empty State */
.empty-state {
  background-color: #FFFFFF;
  border-radius: 0.75rem; /* 12px */
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  border: 1px solid #E0E0E0;
  padding: 64px;
  text-align: center;
}

.empty-state-icon {
  width: 64px;
  height: 64px;
  background-color: #E3F2FD;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: #1E88E5;
}

.empty-state-title {
  font-size: 18px;
  font-weight: 500;
  color: #212121;
  margin: 0 0 8px;
}

.empty-state-text {
  color: #757575;
  margin: 0 0 24px;
}

.empty-state-btn {
  background-color: #1E88E5;
  color: #FFFFFF;
  padding: 10px 24px;
  border-radius: 0.75rem; /* 12px */
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.empty-state-btn:hover {
  background-color: #1976D2;
}

/* Projects Grid */
.projects-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Project Header */
.project-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.project-name {
  font-size: 20px;
  font-weight: 600;
  color: #212121;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-badge {
  font-size: 10px;
  padding: 4px 10px;
  background-color: #E3F2FD;
  color: #1565C0;
  border-radius: 9999px;
  font-weight: 500;
  white-space: nowrap;
}

.project-warning-badge {
  font-size: 10px;
  padding: 4px 10px;
  background-color: #FFF8E1;
  color: #E65100;
  border-radius: 9999px;
  font-weight: 500;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Project Grid */
.project-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px 24px;
  margin-bottom: 16px;
}

.project-grid-item {
  display: flex;
  flex-direction: column;
}

.project-label {
  font-size: 12px;
  color: #757575;
  margin: 0 0 2px;
}

.project-value {
  font-size: 14px;
  font-weight: 500;
  color: #212121;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-budget {
  font-weight: 600;
  color: #43A047;
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.project-tag {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 8px;
  font-weight: 500;
}

.project-tag-secondary {
  background-color: #F3E5F5;
  color: #7B1FA2;
}

.project-tag-warning {
  background-color: #FFF8E1;
  color: #E65100;
}

.project-tag-count {
  font-size: 12px;
  color: #757575;
}

.project-empty {
  font-size: 12px;
  color: #BDBDBD;
}

/* Project Segments */
.project-segments {
  padding-top: 12px;
  border-top: 1px solid #E0E0E0;
}

.project-segments-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.project-segment {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background-color: #F5F5F5;
  border-radius: 0.75rem; /* 12px */
  font-size: 12px;
}

.segment-name {
  font-weight: 500;
  color: #212121;
}

.segment-divider {
  color: #BDBDBD;
}

.segment-value {
  color: #757575;
}

.segment-budget {
  font-weight: 500;
  color: #43A047;
}

.segment-count {
  font-weight: 600;
  color: #212121;
}

.project-segment-more {
  color: #757575;
}

/* Project Onboarding */
.project-onboarding {
  padding-top: 12px;
  border-top: 1px solid #E0E0E0;
}

.onboarding-content {
  background: linear-gradient(to bottom right, #E3F2FD, #BBDEFB);
  border-radius: 0.75rem; /* 12px */
  padding: 16px;
}

.onboarding-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.onboarding-icon {
  width: 32px;
  height: 32px;
  background-color: #1E88E5;
  border-radius: 0.75rem; /* 12px */
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #FFFFFF;
}

.onboarding-text {
  flex: 1;
}

.onboarding-title {
  font-size: 14px;
  font-weight: 600;
  color: #212121;
  margin: 0 0 4px;
}

.onboarding-description {
  font-size: 14px;
  color: #757575;
  margin: 0;
}

.onboarding-steps {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.onboarding-step {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.onboarding-step-number {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 700;
  color: #1E88E5;
}

.onboarding-step-text {
  color: #424242;
}

.onboarding-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: #1E88E5;
  color: #FFFFFF;
  padding: 10px 16px;
  border-radius: 0.75rem; /* 12px */
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.onboarding-btn:hover {
  background-color: #1976D2;
}

/* Responsive - elements should wrap when container is narrow */
@media (max-width: 1200px) {
  .projects-filters {
    flex-wrap: wrap;
  }
  
  .search-wrapper {
    flex: 1 1 100%;
    min-width: 200px;
    order: 1;
  }
  
  .filter-select-client,
  .filter-select-brand,
  .filter-select-year {
    flex: 1 1 auto;
    min-width: 140px;
  }
  
  .add-project-btn {
    flex: 0 0 auto;
    order: 2;
  }
}

@media (max-width: 1024px) {
  .projects-header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .projects-title {
    width: 100%;
  }
  
  .projects-filters {
    flex-direction: row;
    flex-wrap: wrap;
    width: 100%;
  }
  
  .search-wrapper {
    flex: 1 1 100%;
    min-width: 100%;
    order: 1;
  }
  
  .add-project-btn {
    order: 2;
    flex: 0 0 auto;
    width: auto;
  }
}

@media (max-width: 768px) {
  .projects-header-container {
    padding: 12px 16px;
  }
  
  .projects-header-content {
    gap: 12px;
    flex-direction: column !important;
    align-items: stretch !important;
  }
  
  .projects-title {
    width: 100% !important;
    order: 0 !important;
  }
  
  .projects-filters {
    flex-direction: column !important;
    gap: 8px !important;
    display: flex !important;
    width: 100% !important;
    flex: none !important;
    overflow: visible !important;
    order: 1 !important;
    align-items: stretch !important;
  }
  
  .projects-filters .search-wrapper {
    width: 100% !important;
    flex: none !important;
    min-width: 100% !important;
    max-width: 100% !important;
    order: 1 !important;
    display: block !important;
  }
  
  .projects-filters .projects-filters-group {
    width: 100% !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 8px !important;
    order: 2 !important;
    flex: none !important;
  }
  
  .projects-filters-group .filter-select-client,
  .projects-filters-group .filter-select-brand,
  .projects-filters-group .filter-select-year {
    width: 100% !important;
    flex: none !important;
    display: block !important;
  }
  
  .projects-header-content .add-project-btn {
    width: 100% !important;
    justify-content: center !important;
    order: 2 !important;
    flex: none !important;
  }
  
  .project-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .project-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .projects-content {
    padding: 16px;
  }


  .project-name {
    font-size: 1.125rem !important; /* 18px */
    line-height: 1.5rem !important; /* 24px */
  }

  .empty-state-title {
    font-size: 1.125rem !important; /* 18px */
    line-height: 1.5rem !important; /* 24px */
  }

  .onboarding-title {
    font-size: 1rem !important; /* 16px */
    line-height: 1.5rem !important; /* 24px */
  }
}

@media (max-width: 480px) {
  .projects-header-container {
    padding: 8px 12px;
  }
  
  .projects-content {
    padding: 12px;
  }
  
  .project-card-content {
    padding: 16px;
  }
}
</style>
