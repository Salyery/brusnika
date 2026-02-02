<template>
  <div class="min-h-screen bg-grey-lighten-5">
    <!-- Compact Header -->
    <div class="client-details-header">
      <div class="client-details-header-container">
        <div class="client-details-header-top">
          <div class="client-details-header-left">
            <v-tooltip text="Назад к списку клиентов" location="bottom">
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
            
            <div class="client-icon-wrapper">
              <Building2 :size="20" />
            </div>
            
            <h1 class="client-title">{{ client.name }}</h1>
          </div>
        </div>

        <!-- Stats -->
        <div class="client-stats-grid">
          <div class="client-stat-card client-stat-card-projects">
            <div class="client-stat-header">
              <FolderOpen :size="14" class="client-stat-icon" />
              <p class="client-stat-label">Проекты</p>
            </div>
            <p class="client-stat-value">{{ clientProjects.length }}</p>
          </div>
          <div class="client-stat-card client-stat-card-brands">
            <div class="client-stat-header">
              <Briefcase :size="14" class="client-stat-icon" />
              <p class="client-stat-label">Бренды</p>
            </div>
            <p class="client-stat-value">{{ clientBrands.length }}</p>
          </div>
          <div class="client-stat-card client-stat-card-teams">
            <div class="client-stat-header">
              <Users :size="14" class="client-stat-icon" />
              <p class="client-stat-label">Команды</p>
            </div>
            <p class="client-stat-value">{{ clientTeams.length }}</p>
          </div>
          <div class="client-stat-card client-stat-card-budget">
            <div class="client-stat-header">
              <p class="client-stat-label">Общий бюджет</p>
            </div>
            <p class="client-stat-value client-stat-value-budget">{{ formatCurrency(totalBudget) }}</p>
          </div>
        </div>

        <!-- Tabs -->
        <div class="client-tabs">
          <button
            @click="activeTab = 'projects'"
            :class="['client-tab', { 'client-tab-active': activeTab === 'projects' }]"
          >
            Проекты ({{ clientProjects.length }})
            <span v-if="activeTab === 'projects'" class="client-tab-indicator"></span>
          </button>
          <button
            @click="activeTab = 'brands'"
            :class="['client-tab', { 'client-tab-active': activeTab === 'brands' }]"
          >
            Бренды ({{ clientBrands.length }})
            <span v-if="activeTab === 'brands'" class="client-tab-indicator"></span>
          </button>
          <button
            @click="activeTab = 'teams'"
            :class="['client-tab', { 'client-tab-active': activeTab === 'teams' }]"
          >
            Команды ({{ clientTeams.length }})
            <span v-if="activeTab === 'teams'" class="client-tab-indicator"></span>
          </button>
          <button
            @click="activeTab = 'members'"
            :class="['client-tab', { 'client-tab-active': activeTab === 'members' }]"
          >
            Участники ({{ clientMembers.length }})
            <span v-if="activeTab === 'members'" class="client-tab-indicator"></span>
          </button>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="client-details-content">
      <div v-if="activeTab === 'projects'" class="client-tab-content">
        <div class="client-projects-header">
          <h2 class="client-projects-title">Проекты клиента</h2>
          
          <div class="search-wrapper">
            <Search class="search-icon" :size="16" />
            <input
              v-model="projectSearchQuery"
              type="text"
              placeholder="Поиск проектов..."
              class="search-input"
            />
          </div>
        </div>
        
        <div v-if="clientProjects.length === 0" class="client-empty">
          <v-sheet variant="outlined" class="client-empty-card">
            <div class="client-empty-content">
              <FolderOpen :size="48" class="client-empty-icon" />
              <p class="client-empty-text">У клиента пока нет проектов</p>
            </div>
          </v-sheet>
        </div>
        
        <div v-else-if="filteredClientProjects.length === 0" class="client-not-found">
          <p class="client-not-found-text">Проекты не найдены</p>
        </div>
        
        <div v-else>
          <div class="client-projects-grid">
            <v-tooltip
              v-for="project in paginatedClientProjects"
              :key="project.id"
              text="Перейти в проект"
              location="bottom"
            >
              <template #activator="{ props: tooltipProps }">
                <v-sheet
                  v-bind="tooltipProps"
                  variant="outlined"
                  class="client-project-card cursor-pointer"
                  @click="handleProjectSelect(project.id)"
                >
            <div class="client-project-card-content">
              <div class="client-project-card-header">
                <div class="client-project-card-info">
                  <div class="client-project-card-meta">
                    <v-tooltip text="Показать проекты с этим брендом" location="bottom">
                      <template #activator="{ props: tooltipProps }">
                        <span v-bind="tooltipProps" class="client-project-brand">
                          {{ getBrandName(project.brandId) }}
                        </span>
                      </template>
                    </v-tooltip>
                    <span class="client-project-separator">•</span>
                    <v-tooltip text="Период РК" location="bottom">
                      <template #activator="{ props: tooltipProps }">
                        <span v-bind="tooltipProps" class="client-project-period">
                          {{ formatPeriod(project.settings.period.start, project.settings.period.end) }}
                        </span>
                      </template>
                    </v-tooltip>
                  </div>
                  <h4 class="client-project-name">
                    {{ project.name }}
                  </h4>
                </div>
                <span class="client-project-badge">
                  {{ project.settings.approvalType }}
                </span>
              </div>

              <div class="client-project-card-footer">
                <div class="client-project-stat">
                  <p class="client-project-stat-label">Бюджет</p>
                  <p class="client-project-stat-value client-project-stat-value-success">{{ formatCurrency(getProjectBudget(project)) }}</p>
                </div>
                <div class="client-project-stat">
                  <p class="client-project-stat-label">Сегменты</p>
                  <div class="client-project-stat-value-group">
                    <span class="client-project-stat-value">{{ project.segments.length }}</span>
                    <PieChart :size="14" class="client-project-stat-icon" />
                  </div>
                </div>
              </div>
            </div>
                </v-sheet>
              </template>
            </v-tooltip>
          </div>
          <Pagination
            :total="filteredClientProjects.length"
            :per-page="24"
            :current-page="projectsTabPage"
            @update:current-page="projectsTabPage = $event"
          />
        </div>
      </div>
      
      <div v-else-if="activeTab === 'brands'" class="client-tab-content">
        <div class="client-brands-header">
          <h2 class="client-brands-title">Бренды клиента</h2>
          
          <div class="client-brands-actions">
            <div class="search-wrapper">
              <Search class="search-icon" :size="16" />
              <input
                v-model="brandSearchQuery"
                type="text"
                placeholder="Поиск брендов..."
                class="search-input"
              />
            </div>
            <button
              class="add-project-btn"
              @click="handleOpenAddBrandModal"
            >
              <Plus :size="16" />
              Добавить бренд
            </button>
          </div>
        </div>
        
        <div v-if="filteredClientBrands.length === 0" class="client-empty">
          <v-sheet variant="outlined" class="client-empty-card">
            <div class="client-empty-content">
              <Briefcase :size="48" class="client-empty-icon" />
              <p class="client-empty-text">У клиента пока нет брендов</p>
              <button class="add-project-btn" @click="handleOpenAddBrandModal">
                <Plus :size="16" />
                Добавить бренд
              </button>
            </div>
          </v-sheet>
        </div>
        
        <div v-else-if="filteredClientBrands.length === 0" class="client-not-found">
          <p class="client-not-found-text">Бренды не найдены</p>
        </div>
        
        <div v-else>
          <div class="client-brands-grid">
            <v-sheet
              v-for="brand in paginatedClientBrands"
            :key="brand.id"
            variant="outlined"
            class="client-brand-card cursor-pointer"
            @click="handleBrandSelect(brand.id)"
          >
            <div class="client-brand-card-content">
              <div class="client-brand-card-header">
                <div class="client-brand-icon-wrapper">
                  <Briefcase :size="20" class="client-brand-icon" />
                </div>
                <div class="client-brand-info">
                  <h4 class="client-brand-name">{{ brand.name }}</h4>
                </div>
              </div>
              <div class="client-brand-stats">
                <div class="client-brand-stat">
                  <span class="client-brand-stat-label">Проекты:</span>
                  <span class="client-brand-stat-value">{{ getBrandProjects(brand.id).length }}</span>
                </div>
                <div class="client-brand-stat">
                  <span class="client-brand-stat-label">Бюджет:</span>
                  <span class="client-brand-stat-value client-brand-stat-value-success">{{ formatCurrency(getBrandBudget(brand.id)) }}</span>
                </div>
              </div>
            </div>
          </v-sheet>
          </div>
          <Pagination
            :total="filteredClientBrands.length"
            :per-page="24"
            :current-page="brandsTabPage"
            @update:current-page="brandsTabPage = $event"
          />
        </div>
      </div>
      
      <div v-else-if="activeTab === 'teams'" class="client-tab-content">
        <TeamsManagement
          :client-id="client.id"
          :teams="teams"
          :members="members"
          :projects="projects"
          @update-teams="handleUpdateTeams"
          @add-member="handleAddMember"
          @project-select="handleProjectSelect"
        />
      </div>
      
      <div v-else-if="activeTab === 'members'" class="client-tab-content">
        <div class="client-members-header">
          <h2 class="client-members-title">Участники клиента</h2>
          
          <div class="client-members-actions">
            <div class="search-wrapper">
              <Search class="search-icon" :size="16" />
              <input
                v-model="memberSearchQuery"
                type="text"
                placeholder="Поиск участников..."
                class="search-input"
              />
            </div>
            <button
              class="add-project-btn"
              @click="isCreateMemberModalOpen = true"
            >
              <Plus :size="16" />
              Добавить участника
            </button>
          </div>
        </div>
        
        <div v-if="clientMembers.length === 0" class="client-empty">
          <v-sheet variant="outlined" class="client-empty-card">
            <div class="client-empty-content">
              <Users :size="48" class="client-empty-icon" />
              <p class="client-empty-text">У клиента пока нет участников</p>
              <button class="add-project-btn" @click="isCreateMemberModalOpen = true">
                <Plus :size="16" />
                Добавить участника
              </button>
            </div>
          </v-sheet>
        </div>
        
        <div v-else-if="filteredClientMembers.length === 0" class="client-not-found">
          <p class="client-not-found-text">Участники не найдены</p>
        </div>
        
        <div v-else>
          <div class="client-members-grid">
            <v-sheet
              v-for="member in paginatedClientMembers"
            :key="member.id"
            variant="outlined"
            class="client-member-card"
          >
            <div class="client-member-card-content">
              <div class="client-member-card-header">
                <div class="client-member-icon-wrapper">
                  <User :size="16" class="client-member-icon" />
                </div>
                <div class="client-member-info">
                  <h4 class="client-member-name">{{ member.name }}</h4>
                  <div v-if="member.email" class="client-member-email">
                    <Mail :size="12" class="client-member-email-icon" />
                    <span>{{ member.email }}</span>
                  </div>
                </div>
              </div>
              <div class="client-member-teams">
                <div class="client-member-teams-label">Команды:</div>
                <div v-if="getMemberTeams(member).length > 0" class="client-member-teams-list">
                  <span
                    v-for="team in getMemberTeams(member)"
                    :key="team.id"
                    class="client-member-team-chip"
                  >
                    {{ team.name }}
                  </span>
                </div>
                <span v-else class="client-member-teams-empty">—</span>
              </div>
              <div class="client-member-actions">
                <button
                  class="client-member-action-btn client-member-action-btn-primary"
                  @click="handleEditMember(member)"
                >
                  <Edit2 :size="12" />
                  Изменить
                </button>
                <button
                  class="client-member-action-btn client-member-action-btn-danger"
                  @click="handleDeleteMember(member.id)"
                >
                  <Trash2 :size="12" />
                </button>
              </div>
            </div>
          </v-sheet>
          </div>
          <Pagination
            :total="filteredClientMembers.length"
            :per-page="24"
            :current-page="membersTabPage"
            @update:current-page="membersTabPage = $event"
          />
        </div>
      </div>
    </div>

    <!-- Modals -->
    <AddBrandModal
      :isOpen="isAddBrandModalOpen"
      :clients="[client]"
      :preselectedClientId="client.id"
      @close="isAddBrandModalOpen = false"
      @submit="handleAddBrand"
    />

    <CreateMemberModal
      :isOpen="isCreateMemberModalOpen || isEditMemberModalOpen"
      :member="editingMember"
      @close="handleCloseMemberModal"
      @submit="handleCreateMember"
      @update-member="handleUpdateMember"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ArrowLeft, Briefcase, Users, Plus, Building2, FolderOpen, Search, User, Mail, Edit2, Trash2, PieChart } from 'lucide-vue-next';
import type { Client, Brand, Project, Team, TeamMember } from '@/types';
import AddBrandModal from '@/components/AddBrandModal.vue';
import CreateMemberModal from '@/components/CreateMemberModal.vue';
import TeamsManagement from '@/components/TeamsManagement.vue';
import Pagination from '@/components/Pagination.vue';

interface Props {
  client: Client;
  brands: Brand[];
  projects: Project[];
  teams: Team[];
  members: TeamMember[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  back: [];
  'add-brand': [brand: Brand];
  'project-select': [projectId: string];
  'brand-select': [brandId: string];
  'add-member': [member: TeamMember];
  'update-member': [member: TeamMember];
  'delete-member': [memberId: string];
  'update-teams': [teams: Team[]];
}>();

const activeTab = ref<'projects' | 'brands' | 'teams' | 'members'>('projects');
const brandSearchQuery = ref('');
const projectSearchQuery = ref('');
const memberSearchQuery = ref('');
const projectsTabPage = ref(1);
const brandsTabPage = ref(1);
const membersTabPage = ref(1);
const isAddBrandModalOpen = ref(false);
const isCreateMemberModalOpen = ref(false);
const isEditMemberModalOpen = ref(false);
const editingMember = ref<TeamMember | null>(null);

const clientBrands = computed(() => {
  return props.brands.filter(b => b.clientId === props.client.id);
});

const filteredClientBrands = computed(() => {
  return clientBrands.value.filter(b =>
    b.name.toLowerCase().includes(brandSearchQuery.value.toLowerCase())
  );
});

const paginatedClientBrands = computed(() => {
  const start = (brandsTabPage.value - 1) * 24;
  return filteredClientBrands.value.slice(start, start + 24);
});

watch(filteredClientBrands, () => { brandsTabPage.value = 1; });

const clientProjects = computed(() => {
  return props.projects.filter(p => p.clientId === props.client.id);
});

const filteredClientProjects = computed(() => {
  return clientProjects.value.filter(p =>
    p.name.toLowerCase().includes(projectSearchQuery.value.toLowerCase())
  );
});

const paginatedClientProjects = computed(() => {
  const start = (projectsTabPage.value - 1) * 24;
  return filteredClientProjects.value.slice(start, start + 24);
});

watch(filteredClientProjects, () => { projectsTabPage.value = 1; });

const clientTeams = computed(() => {
  return props.teams.filter(t => t.clientId === props.client.id);
});

const clientMembers = computed(() => {
  // Получаем всех уникальных участников из команд клиента
  const memberMap = new Map<string, TeamMember>();
  clientTeams.value.forEach(team => {
    team.members.forEach(member => {
      if (!memberMap.has(member.id)) {
        memberMap.set(member.id, member);
      }
    });
  });
  
  // Также добавляем участников из глобального списка, которые могут быть связаны с клиентом
  // (например, только что созданные участники, которые еще не добавлены в команды)
  props.members.forEach(member => {
    if (!memberMap.has(member.id)) {
      // Показываем всех участников из глобального списка
      // В будущем можно добавить проверку на clientId, если такое поле появится
      memberMap.set(member.id, member);
    }
  });
  
  return Array.from(memberMap.values());
});

const filteredClientMembers = computed(() => {
  return clientMembers.value.filter(member =>
    member.name.toLowerCase().includes(memberSearchQuery.value.toLowerCase()) ||
    (member.email && member.email.toLowerCase().includes(memberSearchQuery.value.toLowerCase()))
  );
});

const paginatedClientMembers = computed(() => {
  const start = (membersTabPage.value - 1) * 24;
  return filteredClientMembers.value.slice(start, start + 24);
});

watch(filteredClientMembers, () => { membersTabPage.value = 1; });

const getMemberTeams = (member: TeamMember) => {
  return clientTeams.value.filter(team => 
    team.members.some(m => m.id === member.id)
  );
};

const getBrandName = (brandId?: string) => {
  if (!brandId) return '—';
  return props.brands.find(b => b.id === brandId)?.name || '—';
};

const getProjectBudget = (project: Project) => {
  return project.segments.reduce((sum, segment) => {
    return sum + segment.mediaSegments.reduce((segSum, ms) => segSum + ms.budget, 0);
  }, 0);
};

const getBrandProjects = (brandId: string) => {
  return clientProjects.value.filter(p => p.brandId === brandId);
};

const getBrandBudget = (brandId: string) => {
  return getBrandProjects(brandId).reduce((total, project) => {
    return total + project.segments.reduce((sum, segment) => {
      return sum + segment.mediaSegments.reduce((segSum, ms) => segSum + ms.budget, 0);
    }, 0);
  }, 0);
};

const handleBrandSelect = (brandId: string) => {
  emit('brand-select', brandId);
};

const totalBudget = computed(() => {
  return clientProjects.value.reduce((total, project) => {
    return total + project.segments.reduce((sum, segment) => {
      return sum + segment.mediaSegments.reduce((segSum, ms) => segSum + ms.budget, 0);
    }, 0);
  }, 0);
});

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatPeriod = (start: string, end: string) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };
  return `${formatDate(start)} — ${formatDate(end)}`;
};

const handleAddBrand = (brand: Brand) => {
  emit('add-brand', brand);
  isAddBrandModalOpen.value = false;
};

const handleOpenAddBrandModal = () => {
  isAddBrandModalOpen.value = true;
};

const handleProjectSelect = (projectId: string) => {
  emit('project-select', projectId);
};

const handleCreateMember = (member: TeamMember) => {
  emit('add-member', member);
  isCreateMemberModalOpen.value = false;
};

const handleEditMember = (member: TeamMember) => {
  editingMember.value = member;
  isEditMemberModalOpen.value = true;
};

const handleCloseMemberModal = () => {
  if (editingMember.value) {
    editingMember.value = null;
    isEditMemberModalOpen.value = false;
  } else {
    isCreateMemberModalOpen.value = false;
  }
};

const handleUpdateMember = (member: TeamMember) => {
  emit('update-member', member);
  editingMember.value = null;
  isEditMemberModalOpen.value = false;
};

const handleDeleteMember = (memberId: string) => {
  if (confirm('Вы уверены, что хотите удалить участника?')) {
    emit('delete-member', memberId);
  }
};

const handleUpdateTeams = (updatedTeams: Team[]) => {
  emit('update-teams', updatedTeams);
};
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

/* Header */
.client-details-header {
  background-color: #FFFFFF;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.client-details-header-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 16px 24px;
}

.client-details-header-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.client-details-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-button {
  padding: 6px;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: background-color 0.2s;
  color: #757575;
}

.back-button:hover {
  background-color: #F5F5F5;
}

.client-icon-wrapper {
  width: 40px;
  height: 40px;
  background-color: #E3F2FD;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.client-icon-wrapper svg {
  color: #1E88E5;
}

.client-title {
  font-size: 20px;
  font-weight: 600;
  color: #212121;
  margin: 0;
}

/* Stats Grid */
.client-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: 16px;
}

@media (max-width: 1024px) {
  .client-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.client-stat-card {
  border-radius: 8px;
  padding: 12px;
  background: linear-gradient(to bottom right, var(--stat-from), var(--stat-to));
}

.client-stat-card-projects {
  --stat-from: #E3F2FD;
  --stat-to: #BBDEFB;
}

.client-stat-card-brands {
  --stat-from: #F3E5F5;
  --stat-to: #E1BEE7;
}

.client-stat-card-teams {
  --stat-from: #FFF8E1;
  --stat-to: #FFECB3;
}

.client-stat-card-budget {
  --stat-from: #E8F5E9;
  --stat-to: #C8E6C9;
}

.client-stat-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.client-stat-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.client-stat-card-projects .client-stat-icon {
  color: #1976D2;
}

.client-stat-card-brands .client-stat-icon {
  color: #7B1FA2;
}

.client-stat-card-teams .client-stat-icon {
  color: #F57C00;
}

.client-stat-label {
  font-size: 12px;
  font-weight: 500;
  margin: 0;
}

.client-stat-card-projects .client-stat-label {
  color: #1976D2;
}

.client-stat-card-brands .client-stat-label {
  color: #7B1FA2;
}

.client-stat-card-teams .client-stat-label {
  color: #F57C00;
}

.client-stat-card-budget .client-stat-label {
  color: #388E3C;
}

.client-stat-value {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

.client-stat-card-projects .client-stat-value {
  color: #0D47A1;
}

.client-stat-card-brands .client-stat-value {
  color: #4A148C;
}

.client-stat-card-teams .client-stat-value {
  color: #E65100;
}

.client-stat-value-budget {
  font-size: 18px;
  color: #1B5E20;
}

/* Tabs */
.client-tabs {
  display: flex;
  gap: 24px;
  margin-top: 16px;
  border-bottom: 1px solid #E0E0E0;
}

.client-tab {
  padding-bottom: 8px;
  padding-left: 4px;
  padding-right: 4px;
  font-size: 14px;
  font-weight: 500;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  color: #757575;
  position: relative;
  display: flex;
  align-items: center;
}

.client-tab:hover {
  color: #212121;
}

.client-tab-active {
  color: #1E88E5;
  border-bottom-color: #1E88E5;
}

.client-tab-indicator {
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #1E88E5;
}

/* Content */
.client-details-content {
  max-width: 1440px;
  margin: 0 auto;
  padding: 24px;
}

.client-tab-content {
  width: 100%;
}

/* Projects Tab */
.client-projects-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.client-projects-title {
  font-weight: 600;
  color: #212121;
  margin: 0;
  flex-shrink: 0;
}

.client-projects-header .search-wrapper {
  flex: 1;
  min-width: 0;
}

.client-projects-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 640px) {
  .client-projects-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .client-projects-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.client-project-card {
  background-color: #FFFFFF !important;
  border-radius: 12px !important;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
  transition: box-shadow 0.2s !important;
  padding: 16px !important;
}

.client-project-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1) !important;
}

.client-project-card-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.client-project-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.client-project-card-info {
  flex: 1;
  min-width: 0;
}

.client-project-card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.client-project-brand {
  font-size: 11px;
  padding: 2px 8px;
  background-color: #F3E5F5;
  color: #7B1FA2;
  border-radius: 9999px;
  font-weight: 500;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
}

.client-project-separator {
  font-size: 12px;
  color: #9E9E9E;
}

.client-project-period {
  font-size: 12px;
  color: #757575;
}

.client-project-name {
  font-size: 16px;
  font-weight: 600;
  color: #212121;
  margin: 0 0 4px 0;
  transition: color 0.2s;
}

.client-project-card:hover .client-project-name {
  color: #1E88E5;
}

.client-project-badge {
  font-size: 10px;
  padding: 4px 10px;
  background-color: #E3F2FD;
  color: #1565C0;
  border-radius: 9999px;
  font-weight: 500;
  flex-shrink: 0;
}

.client-project-card-footer {
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid #F5F5F5;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.client-project-card:hover .client-project-name {
  color: #1E88E5;
}

.client-project-stat {
  display: flex;
  flex-direction: column;
}

.client-project-stat-label {
  font-size: 10px;
  color: #9E9E9E;
  text-transform: uppercase;
  font-weight: 500;
  letter-spacing: 0.5px;
  margin: 0 0 2px 0;
}

.client-project-stat-value {
  font-size: 14px;
  font-weight: 700;
  color: #212121;
  margin: 0;
}

.client-project-stat-value-success {
  color: #43A047;
}

.client-project-stat-value-group {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}

.client-project-stat-icon {
  color: #9E9E9E;
  flex-shrink: 0;
}

/* Brands Tab */
.client-brands-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.client-brands-title {
  font-weight: 600;
  color: #212121;
  margin: 0;
  flex-shrink: 0;
}

.client-brands-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.client-brands-actions .search-wrapper {
  flex: 1;
  min-width: 0;
}

.client-brands-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 640px) {
  .client-brands-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .client-brands-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.client-brand-card {
  background-color: #FFFFFF !important;
  border-radius: 12px !important;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
  transition: box-shadow 0.2s !important;
  padding: 20px !important;
  cursor: pointer;
}

.client-brand-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1) !important;
}

.client-brand-card-content {
  display: flex;
  flex-direction: column;
}

.client-brand-card-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.client-brand-icon-wrapper {
  width: 40px;
  height: 40px;
  background-color: #F3E5F5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.client-brand-icon {
  color: #9C27B0;
}

.client-brand-info {
  flex: 1;
  min-width: 0;
}

.client-brand-name {
  font-size: 16px;
  font-weight: 600;
  color: #212121;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.client-brand-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.client-brand-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.client-brand-stat-label {
  color: #757575;
}

.client-brand-stat-value {
  font-weight: 600;
  color: #212121;
}

.client-brand-stat-value-success {
  color: #43A047;
}

/* Members Tab */
.client-members-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.client-members-title {
  font-weight: 600;
  color: #212121;
  margin: 0;
  flex-shrink: 0;
}

.client-members-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.client-members-actions .search-wrapper {
  flex: 1;
  min-width: 0;
}

.client-members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
}

.client-member-card {
  background-color: #FFFFFF !important;
  border-radius: 12px !important;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
  padding: 12px !important;
}

.client-member-card-content {
  display: flex;
  flex-direction: column;
}

.client-member-card-header {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 12px;
}

.client-member-icon-wrapper {
  width: 32px;
  height: 32px;
  background-color: #F3E5F5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.client-member-icon {
  color: #9C27B0;
}

.client-member-info {
  flex: 1;
  min-width: 0;
}

.client-member-name {
  font-size: 14px;
  font-weight: 600;
  color: #212121;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.client-member-email {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: -2px;
}

.client-member-email-icon {
  color: #9E9E9E;
  flex-shrink: 0;
}

.client-member-email span {
  font-size: 12px;
  color: #757575;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.client-member-teams {
  margin-bottom: 12px;
}

.client-member-teams-label {
  font-size: 12px;
  color: #757575;
  margin-bottom: 4px;
}

.client-member-teams-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.client-member-team-chip {
  font-size: 10px;
  padding: 2px 6px;
  background-color: #FFF8E1;
  color: #F57C00;
  border-radius: 9999px;
  display: inline-block;
}

.client-member-teams-empty {
  font-size: 12px;
  color: #9E9E9E;
}

.client-member-actions {
  display: flex;
  gap: 4px;
}

.client-member-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
}

.client-member-action-btn-primary {
  background-color: #FFFFFF;
  color: #1E88E5;
  border-color: #64B5F6;
}

.client-member-action-btn-primary:hover {
  background-color: #E3F2FD;
}

.client-member-action-btn-danger {
  background-color: #FFFFFF;
  color: #F44336;
  border-color: #E57373;
  padding: 6px;
  flex: 0 0 auto;
}

.client-member-action-btn-danger:hover {
  background-color: #FFEBEE;
}

/* Empty states */
.client-empty {
  display: flex;
  justify-content: center;
  padding: 48px 24px;
}

.client-empty-card {
  background-color: #FFFFFF !important;
  border: 1px solid #E0E0E0 !important;
  border-radius: 12px !important;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
  padding: 48px !important;
}

.client-empty-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.client-empty-icon {
  color: #9E9E9E;
  margin-bottom: 12px;
}

.client-empty-text {
  color: #757575;
  margin: 0 0 24px 0;
}

.client-not-found {
  text-align: center;
  padding: 48px 24px;
}

.client-not-found-text {
  color: #757575;
  margin: 0;
}

@media (max-width: 640px) {
  .client-stats-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .client-details-header-top {
    flex-direction: column;
    align-items: flex-start;
  }

  .client-tabs {
    flex-wrap: wrap;
    gap: 12px;
  }

  .client-projects-header,
  .client-brands-header,
  .client-members-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .client-projects-header .search-wrapper,
  .client-brands-actions .search-wrapper,
  .client-members-actions .search-wrapper {
    width: 100%;
  }

  .client-brands-actions,
  .client-members-actions {
    width: 100%;
    flex-direction: column;
  }

  .client-brands-actions .add-project-btn,
  .client-members-actions .add-project-btn {
    width: 100%;
    justify-content: center;
  }

  .client-members-grid {
    grid-template-columns: 1fr;
  }

  .client-title {
    font-size: 1.5rem !important; /* 24px */
    line-height: 1.875rem !important; /* 30px */
  }

  .client-projects-title,
  .client-brands-title,
  .client-members-title {
    font-size: 1.375rem !important; /* 22px */
    line-height: 1.75rem !important; /* 28px */
  }
}

/* Large screen typography - увеличенные размеры для больших экранов */
@media (min-width: 1281px) {
  .client-title {
    font-size: 24px !important; /* увеличение с 20px */
  }

  .client-stat-label {
    font-size: 14px !important; /* увеличение с 12px */
  }

  .client-stat-value {
    font-size: 24px !important; /* увеличение с 20px */
  }

  .client-stat-value-budget {
    font-size: 22px !important; /* увеличение с 18px */
  }

  .client-tab {
    font-size: 16px !important; /* увеличение с 14px */
  }

  .client-project-brand {
    font-size: 13px !important; /* увеличение с 11px */
    padding: 4px 10px !important;
  }

  .client-project-separator,
  .client-project-period {
    font-size: 14px !important; /* увеличение с 12px */
  }

  .client-project-name {
    font-size: 18px !important; /* увеличение с 16px */
  }

  .client-project-badge {
    font-size: 12px !important; /* увеличение с 10px */
    padding: 6px 12px !important;
  }

  .client-project-stat-label {
    font-size: 12px !important; /* увеличение с 10px */
  }

  .client-project-stat-value {
    font-size: 16px !important; /* увеличение с 14px */
  }

  .client-brand-name {
    font-size: 18px !important; /* увеличение с 16px */
  }

  .client-brand-stat {
    font-size: 16px !important; /* увеличение с 14px */
  }

  .client-member-name {
    font-size: 16px !important; /* увеличение с 14px */
  }

  .client-member-email span {
    font-size: 14px !important; /* увеличение с 12px */
  }

  .client-member-teams-label {
    font-size: 14px !important; /* увеличение с 12px */
  }

  .client-member-team-chip {
    font-size: 12px !important; /* увеличение с 10px */
    padding: 4px 8px !important;
  }

  .client-member-teams-empty {
    font-size: 14px !important; /* увеличение с 12px */
  }

  .client-member-action-btn {
    font-size: 14px !important; /* увеличение с 12px */
    padding: 8px 14px !important;
  }

  .client-empty-text,
  .client-not-found-text {
    font-size: 16px !important; /* увеличение базового размера */
  }
}
</style>