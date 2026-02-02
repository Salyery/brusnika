<template>
  <div v-if="project" class="project-details">
    <!-- Compact Header -->
    <div class="project-details-header">
      <div class="project-details-header-container">
        <div class="project-details-header-top">
          <div class="project-details-header-left">
            <v-tooltip text="Назад к списку проектов" location="bottom">
              <template #activator="{ props: tooltipProps }">
                <button
                  v-bind="tooltipProps"
                  @click="$emit('back')"
                  class="back-button"
                >
                  <ArrowLeft :size="16" />
                </button>
              </template>
            </v-tooltip>
            
            <div class="project-icon">
              <FolderOpen :size="20" />
            </div>
            
            <h1 class="project-title">{{ project.name }}</h1>
            
            <v-tooltip text="Редактировать проект" location="bottom">
              <template #activator="{ props: tooltipProps }">
                <button
                  v-bind="tooltipProps"
                  @click="isEditProjectModalOpen = true"
                  class="edit-button"
                >
                  <Settings :size="16" />
                </button>
              </template>
            </v-tooltip>
            
            <v-tooltip text="Тип согласования с клиентом" location="bottom">
              <template #activator="{ props: tooltipProps }">
                <span v-if="project.settings" v-bind="tooltipProps" class="project-badge">
                  {{ project.settings.approvalType }}
                </span>
              </template>
            </v-tooltip>
          </div>
        </div>

        <!-- Stats -->
        <div v-if="project.settings" class="project-stats">
          <v-tooltip text="Период РК" location="bottom">
            <template #activator="{ props: tooltipProps }">
              <div v-bind="tooltipProps" class="project-stat-item">
                <Calendar :size="16" />
                <span>
                  {{ formatPeriod(project.settings.period.start, project.settings.period.end) }}
                </span>
              </div>
            </template>
          </v-tooltip>
          <v-tooltip text="Показывать сумму клиенту" location="bottom">
            <template #activator="{ props: tooltipProps }">
              <div v-bind="tooltipProps" class="project-stat-item">
                <DollarSign :size="16" />
                <span>{{ project.settings.amountDisplay }}</span>
              </div>
            </template>
          </v-tooltip>
        </div>

        <!-- Tabs -->
        <div class="project-tabs">
          <button
            @click="activeTab = 'segments'"
            :class="['project-tab', { 'project-tab-active': activeTab === 'segments' }]"
          >
            <PieChart :size="14" />
            Сегменты
            <span v-if="activeTab === 'segments'" class="project-tab-indicator"></span>
          </button>
          <button
            @click="activeTab = 'teams'"
            :class="['project-tab', { 'project-tab-active': activeTab === 'teams' }]"
          >
            <Users :size="14" />
            Команды
            <span v-if="activeTab === 'teams'" class="project-tab-indicator"></span>
          </button>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="project-details-content">
      <SegmentsTable
        v-if="activeTab === 'segments'"
        :project="project"
        :teams="teams"
        @update="handleUpdate"
        @add-segment="isAddSegmentModalOpen = true"
        @edit-segment="editingSegment = $event"
        @switch-to-teams="activeTab = 'teams'"
      />
      
      <TeamsManagement
        v-else
        :project="project"
        :teams="teams"
        :members="members"
        :projects="projects"
        @update="handleUpdate"
        @update-teams="handleUpdateTeams"
        @add-member="handleAddMember"
        @project-select="handleProjectSelect"
      />
    </div>

    <!-- Modals -->
    <AddSegmentModal
      :isOpen="isAddSegmentModalOpen || editingSegment !== null"
      :project="project"
      :teams="teams"
      :segment="editingSegment"
      @close="handleCloseSegmentModal"
      @submit="handleSegmentSubmit"
    />

    <AddProjectModal
      :isOpen="isEditProjectModalOpen"
      :project="project"
      :clients="clients"
      :brands="brands"
      @close="isEditProjectModalOpen = false"
      @submit="handleEditProject"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ArrowLeft, Users, Calendar, DollarSign, Settings, PieChart, FolderOpen } from 'lucide-vue-next';
import type { Project, Segment, Team, TeamMember, Client, Brand } from '@/types';
import SegmentsTable from '@/components/SegmentsTable.vue';
import TeamsManagement from '@/components/TeamsManagement.vue';
import AddSegmentModal from '@/components/AddSegmentModal.vue';
import AddProjectModal from '@/components/AddProjectModal.vue';

interface Props {
  project: Project;
  teams: Team[];
  members: TeamMember[];
  projects: Project[];
  clients: Client[];
  brands: Brand[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  back: [];
  update: [project: Project];
  updateTeams: [teams: Team[]];
  addMember: [member: TeamMember];
  projectSelect: [projectId: string];
}>();

const activeTab = ref<'segments' | 'teams'>('segments');
const isAddSegmentModalOpen = ref(false);
const isEditProjectModalOpen = ref(false);
const editingSegment = ref<Segment | null>(null);

const formatPeriod = (start: string, end: string) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU');
  };
  return `${formatDate(start)} — ${formatDate(end)}`;
};

const handleUpdate = (updatedProject: Project) => {
  emit('update', updatedProject);
};

const handleUpdateTeams = (teams: Team[]) => {
  emit('updateTeams', teams);
};

const handleAddMember = (member: TeamMember) => {
  emit('addMember', member);
};

const handleProjectSelect = (projectId: string) => {
  emit('projectSelect', projectId);
};

const handleSegmentSubmit = (segment: Segment) => {
  if (editingSegment.value) {
    // Edit mode
    const updatedProject: Project = {
      ...props.project,
      segments: props.project.segments.map(s => s.id === segment.id ? segment : s),
    };
    emit('update', updatedProject);
    editingSegment.value = null;
  } else {
    // Add mode
    const updatedProject: Project = {
      ...props.project,
      segments: [...props.project.segments, segment],
    };
    emit('update', updatedProject);
    isAddSegmentModalOpen.value = false;
  }
};

const handleCloseSegmentModal = () => {
  if (editingSegment.value) {
    editingSegment.value = null;
  } else {
    isAddSegmentModalOpen.value = false;
  }
};

const handleEditProject = (updatedProject: Project) => {
  emit('update', updatedProject);
  isEditProjectModalOpen.value = false;
};

const handleCloseProjectModal = () => {
  isEditProjectModalOpen.value = false;
};
</script>

<style scoped>
.project-details {
  min-height: 100vh;
  background-color: #FAFAFA;
}

/* Header */
.project-details-header {
  background-color: #FFFFFF;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  border-bottom: 1px solid #E0E0E0;
}

.project-details-header-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 12px 24px;
}

.project-details-header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.project-details-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-button,
.edit-button {
  padding: 6px;
  background-color: transparent;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #757575;
  flex-shrink: 0;
}

.back-button:hover,
.edit-button:hover {
  background-color: #F5F5F5;
  color: #424242;
}

.edit-button {
  color: #BDBDBD;
}

.edit-button:hover {
  color: #757575;
}

.project-icon {
  width: 40px;
  height: 40px;
  background-color: #E3F2FD;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #1E88E5;
}

.project-title {
  font-size: 1.875rem; /* 30px - same as global h1 */
  line-height: 2.25rem;
  font-weight: 600;
  color: #212121;
  margin: 0;
}

@media (max-width: 768px) {
  .project-title {
    font-size: 1.5rem !important; /* 24px */
    line-height: 1.875rem !important; /* 30px */
  }
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

/* Stats */
.project-stats {
  display: flex;
  gap: 24px;
  font-size: 14px;
  margin-bottom: 12px;
}

.project-stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #757575;
}

.project-stat-item svg {
  color: #BDBDBD;
}

/* Tabs */
.project-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: -1px;
}

.project-tab {
  position: relative;
  padding: 8px 16px;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  background-color: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  color: #757575;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.project-tab:hover {
  color: #212121;
}

.project-tab-active {
  color: #1E88E5;
}

.project-tab-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #1E88E5;
}

/* Content */
.project-details-content {
  max-width: 1440px;
  margin: 0 auto;
  padding: 16px 24px;
  min-width: 0;
}
</style>