<template>
  <div>
    <div class="teams-header">
      <h2 class="teams-title">{{ project ? 'Команды проекта' : 'Команды клиента' }}</h2>
      <div class="teams-actions">
        <div class="search-wrapper">
          <Search class="search-icon" :size="16" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Поиск команд..."
            class="search-input"
          />
        </div>
        
        <button
          class="add-segment-btn add-segment-btn-outlined"
          @click="isCreatingMember = true"
        >
          <UserPlus :size="16" />
          Создать участника
        </button>
        
        <button
          class="add-segment-btn"
          @click="isCreatingTeam = true"
        >
          <Plus :size="16" />
          Добавить команду
        </button>
      </div>
    </div>

    <div class="teams-content">
      <div v-if="clientTeams.length === 0" class="teams-empty">
        <Users :size="48" class="teams-empty-icon" />
        <p class="teams-empty-text">У клиента пока нет команд</p>
        <button class="add-segment-btn" @click="isCreatingTeam = true">
          <Plus :size="16" />
          Добавить команду
        </button>
      </div>

      <div v-else-if="filteredTeams.length === 0" class="teams-empty">
        <p class="teams-empty-text">Команды не найдены</p>
      </div>

      <div v-else>
        <div class="teams-grid">
          <v-card
            v-for="team in paginatedTeams"
          :key="team.id"
          variant="outlined"
          :class="['team-card', { 'team-card-default': team.isDefault }]"
        >
          <v-card-text class="pa-3">
            <div class="team-card-header">
              <div
                :class="team.isDefault ? 'team-icon-default' : 'team-icon'"
                class="team-icon-wrapper"
              >
                <Users
                  :size="16"
                  :class="team.isDefault ? 'team-icon-default-color' : 'team-icon-color'"
                />
              </div>
              <div class="team-name-wrapper">
                <div class="team-name-row">
                  <div class="team-name-group">
                    <input
                      v-if="editingTeamId === team.id"
                      v-model="editingTeamName"
                      type="text"
                      class="team-name-input"
                      @blur="handleSaveTeamName(team.id)"
                      @keydown.enter="handleSaveTeamName(team.id)"
                      @keydown.esc="handleCancelEditTeamName"
                      @click.stop
                    />
                    <template v-else>
                      <h4 class="team-name">{{ team.name }}</h4>
                      <v-tooltip v-if="!team.isDefault" text="Изменить название команды" location="bottom">
                        <template #activator="{ props: tooltipProps }">
                          <button
                            v-bind="tooltipProps"
                            class="team-edit-btn"
                            @click.stop="handleStartEditTeamName(team)"
                          >
                            <Edit2 :size="14" />
                          </button>
                        </template>
                      </v-tooltip>
                    </template>
                  </div>
                  <button
                    v-if="!team.isDefault"
                    class="team-delete-btn"
                    @click.stop="handleDeleteTeamConfirm(team.id, team.name)"
                    title="Удалить команду"
                  >
                    <Trash2 :size="14" />
                  </button>
                </div>
              </div>
            </div>

            <div class="team-content">
              <!-- Add member select -->
              <div class="team-add-member">
                <Select
                  :model-value="null"
                  :items="availableMembers(team)"
                  placeholder="Добавить участника"
                  select-class="team-member-select"
                  @update:model-value="(value) => value && handleAddMemberToTeam(team.id, value)"
                />
                <v-tooltip text="Создать нового участника" location="bottom">
                  <template #activator="{ props: tooltipProps }">
                    <button
                      v-bind="tooltipProps"
                      class="team-add-member-btn"
                      @click.stop="handleCreateMemberForTeam(team.id)"
                    >
                      <UserPlus :size="14" />
                    </button>
                  </template>
                </v-tooltip>
              </div>

              <!-- Members list -->
              <div v-if="team.members.length > 0" class="team-members">
                <div
                  v-for="member in team.members"
                  :key="member.id"
                  :class="['team-member-card', { 'team-member-card-default': team.isDefault }]"
                >
                  <div class="team-member-info">
                    <div class="team-member-name">{{ member.name }}</div>
                    <div v-if="member.email" class="team-member-email">
                      <Mail :size="10" class="team-member-email-icon" />
                      <span>{{ member.email }}</span>
                    </div>
                  </div>
                  <button
                    class="team-member-remove-btn"
                    @click.stop="handleRemoveMember(team.id, member.id)"
                    title="Удалить участника"
                  >
                    <X :size="12" />
                  </button>
                </div>
              </div>

              <!-- Projects using this team -->
              <div
                v-if="team.projectData && team.projectData.length > 0"
                :class="['team-projects', { 'team-projects-default': team.isDefault }]"
              >
                <p class="team-projects-label">Используется в проектах:</p>
                <div class="team-projects-list">
                  <v-tooltip
                    v-for="project in team.projectData"
                    :key="project.id"
                    text="Перейти к проекту"
                    location="bottom"
                  >
                    <template #activator="{ props: tooltipProps }">
                      <button
                        v-bind="tooltipProps"
                        class="team-project-chip"
                        @click.stop="handleProjectSelect(project.id)"
                      >
                        {{ project.name }}
                      </button>
                    </template>
                  </v-tooltip>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
        </div>
        <Pagination
          :total="filteredTeams.length"
          :per-page="24"
          :current-page="teamsPage"
          @update:current-page="teamsPage = $event"
        />
      </div>
    </div>

    <!-- Modals -->
    <EditTeamModal
      :isOpen="isCreatingTeam || isEditingTeam"
      :team="editingTeam ? editingTeam : null"
      :clientId="clientId"
      @close="handleCloseTeamModal"
      @submit="handleTeamSubmit"
      @delete="handleTeamDelete"
    />

    <CreateMemberModal
      :isOpen="isCreatingMember"
      @close="handleCloseMemberModal"
      @submit="handleMemberSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Plus, Users, UserPlus, Mail, Trash2, Edit2, X, Search } from 'lucide-vue-next';
import type { Project, Team, TeamMember } from '@/types';
import EditTeamModal from './EditTeamModal.vue';
import CreateMemberModal from './CreateMemberModal.vue';
import Select from './Select.vue';
import Pagination from './Pagination.vue';

interface Props {
  project?: Project;
  clientId?: string;
  teams: Team[];
  members: TeamMember[];
  projects: Project[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update': [project: Project];
  'update-teams': [teams: Team[]];
  'add-member': [member: TeamMember];
  'project-select': [projectId: string];
}>();

const searchQuery = ref('');
const teamsPage = ref(1);
const editingTeamId = ref<string | null>(null);
const editingTeamName = ref('');
const editingTeam = ref<Team | null>(null);
const isCreatingTeam = ref(false);
const isEditingTeam = ref(false);
const isCreatingMember = ref(false);
const creatingMemberForTeamId = ref<string | null>(null);

const clientId = computed(() => {
  return props.project?.clientId || props.clientId || '';
});

const clientTeams = computed(() => {
  return props.teams
    .filter(t => t.clientId === clientId.value)
    .map(team => {
      const projectNames: string[] = [];
      const projectData: { id: string; name: string }[] = [];
      props.projects.forEach(project => {
        const usesTeam = project.segments.some(seg => seg.teamId === team.id);
        if (usesTeam) {
          projectNames.push(project.name);
          projectData.push({ id: project.id, name: project.name });
        }
      });
      return { ...team, projectNames, projectData };
    });
});

const filteredTeams = computed(() => {
  return clientTeams.value.filter(team =>
    team.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const paginatedTeams = computed(() => {
  const start = (teamsPage.value - 1) * 24;
  return filteredTeams.value.slice(start, start + 24);
});

watch(filteredTeams, () => { teamsPage.value = 1; });

const availableMembers = (team: Team & { projectNames: string[] }) => {
  return props.members
    .filter(m => !team.members.some(tm => tm.id === m.id))
    .map(member => ({ title: member.name, value: member.id }));
};

const handleAddMemberToTeam = (teamId: string, memberId: string) => {
  const memberToAdd = props.members.find(m => m.id === memberId);
  if (!memberToAdd) return;

  const updatedTeams = props.teams.map(team => {
    if (team.id === teamId) {
      return {
        ...team,
        members: [...team.members, memberToAdd],
      };
    }
    return team;
  });

  emit('update-teams', updatedTeams);
};

const handleRemoveMember = (teamId: string, memberId: string) => {
  if (!confirm('Вы уверены, что хотите удалить участника из команды?')) {
    return;
  }

  const updatedTeams = props.teams.map(team => {
    if (team.id === teamId) {
      return {
        ...team,
        members: team.members.filter(m => m.id !== memberId),
      };
    }
    return team;
  });

  emit('update-teams', updatedTeams);
};

const handleStartEditTeamName = (team: Team & { projectNames: string[] }) => {
  // Используем inline редактирование для быстрого изменения названия
  editingTeamId.value = team.id;
  editingTeamName.value = team.name;
};

const handleEditTeam = (team: Team & { projectNames: string[] }) => {
  // Открываем модальное окно для редактирования команды
  editingTeam.value = team;
  isEditingTeam.value = true;
};

const handleSaveTeamName = (teamId: string) => {
  if (!editingTeamName.value.trim()) {
    return;
  }

  const updatedTeams = props.teams.map(team => {
    if (team.id === teamId) {
      return {
        ...team,
        name: editingTeamName.value.trim(),
      };
    }
    return team;
  });

  emit('update-teams', updatedTeams);
  editingTeamId.value = null;
  editingTeamName.value = '';
};

const handleCancelEditTeamName = () => {
  editingTeamId.value = null;
  editingTeamName.value = '';
};

const handleDeleteTeamConfirm = (teamId: string, teamName: string) => {
  if (!confirm(`Вы уверены, что хотите удалить команду "${teamName}"?`)) {
    return;
  }
  const updatedTeams = props.teams.filter(t => t.id !== teamId);
  emit('update-teams', updatedTeams);
};

const handleCreateMemberForTeam = (teamId: string) => {
  creatingMemberForTeamId.value = teamId;
  isCreatingMember.value = true;
};

const handleProjectSelect = (projectId: string) => {
  emit('project-select', projectId);
};

const handleCloseTeamModal = () => {
  isCreatingTeam.value = false;
  isEditingTeam.value = false;
  editingTeam.value = null;
  editingTeamId.value = null;
  editingTeamName.value = '';
};

const handleTeamSubmit = (team: Team) => {
  if (editingTeam.value) {
    // Редактирование существующей команды
    const updatedTeams = props.teams.map(t => 
      t.id === editingTeam.value!.id ? team : t
    );
    emit('update-teams', updatedTeams);
    editingTeam.value = null;
    isEditingTeam.value = false;
  } else {
    // Создание новой команды
    const newTeams = [...props.teams, team];
    emit('update-teams', newTeams);
    isCreatingTeam.value = false;
  }
};

const handleTeamDelete = (teamId: string) => {
  const updatedTeams = props.teams.filter(t => t.id !== teamId);
  emit('update-teams', updatedTeams);
  editingTeam.value = null;
  isEditingTeam.value = false;
};

const handleCloseMemberModal = () => {
  isCreatingMember.value = false;
  creatingMemberForTeamId.value = null;
};

const handleMemberSubmit = (member: TeamMember) => {
  emit('add-member', member);
  
  // Если участник создавался для конкретной команды, сразу добавляем его
  if (creatingMemberForTeamId.value) {
    const updatedTeams = props.teams.map(team => {
      if (team.id === creatingMemberForTeamId.value) {
        return {
          ...team,
          members: [...team.members, member],
        };
      }
      return team;
    });
    emit('update-teams', updatedTeams);
    creatingMemberForTeamId.value = null;
  }
  
  isCreatingMember.value = false;
};
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.teams-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.teams-title {
  flex-shrink: 0;
  /* inherits global h2: font-size 2em, same as other pages */
  font-weight: 600;
  color: #212121;
  margin: 0;
}

.teams-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  flex: 1;
  min-width: 0;
}

.teams-actions .search-wrapper {
  flex: 1;
  min-width: 0;
}

.teams-content {
  padding: 0;
}

.teams-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.teams-empty-icon {
  color: #9E9E9E;
  margin-bottom: 12px;
}

.teams-empty-text {
  color: #757575;
  margin-bottom: 16px;
  font-size: 14px;
}

.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.team-card {
  background-color: #FFFFFF !important;
  border: 1px solid rgb(238, 238, 238) !important;
  border-radius: 12px !important;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
}

.team-card-default {
  background: linear-gradient(to right, #F5F5F5, #FAFAFA) !important;
  border-color: #e0e0e0 !important;
}

.team-card-header {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
}

.team-icon-wrapper {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.team-icon {
  background-color: #FFF8E1;
}

.team-icon-default {
  background-color: #E0E0E0;
}

.team-icon-color {
  color: #F57C00;
}

.team-icon-default-color {
  color: #616161;
}

.team-name-wrapper {
  flex: 1;
  min-width: 0;
}

.team-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: space-between;
}

.team-name-group {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.team-name {
  font-size: 14px;
  font-weight: 600;
  color: #212121;
  margin: 0;
}

.team-name-input {
  font-size: 14px;
  font-weight: 600;
  color: #212121;
  border: 1px solid #2196F3;
  border-radius: 4px;
  padding: 2px 8px;
  flex: 1;
  outline: none;
}

.team-name-input:focus {
  outline: 2px solid #2196F3;
  outline-offset: 0;
}

.team-edit-btn {
  color: #9E9E9E;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}

.team-edit-btn:hover {
  color: #757575;
}

.team-delete-btn {
  color: #F44336;
  background: none;
  border: none;
  padding: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  transition: color 0.2s;
}

.team-delete-btn:hover {
  color: #D32F2F;
}

.team-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.team-add-member {
  display: flex;
  align-items: center;
  gap: 6px;
}

.team-member-select {
  flex: 1;
}

.team-add-member-btn {
  width: 32px;
  height: 32px;
  padding: 6px;
  border: 1px solid #1E88E5;
  border-radius: 8px;
  background-color: #FFFFFF;
  color: #1E88E5;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}

.team-add-member-btn:hover {
  background-color: #E3F2FD;
}

.team-members {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.team-member-card {
  border-radius: 6px;
  padding: 6px 10px;
  border: 1px solid #E0E0E0;
  background-color: #F5F5F5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.team-member-card-default {
  background-color: #FFFFFF;
  border-color: #BDBDBD;
}

.team-member-info {
  flex: 1;
  min-width: 0;
}

.team-member-name {
  font-size: 12px;
  font-weight: 500;
  color: #212121;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.team-member-email {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
}

.team-member-email-icon {
  color: #9E9E9E;
  flex-shrink: 0;
}

.team-member-email span {
  font-size: 10px;
  color: #757575;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.team-member-remove-btn {
  color: #757575;
  background: none;
  border: none;
  padding: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  transition: color 0.2s;
}

.team-member-remove-btn:hover {
  color: #424242;
}

.team-projects {
  padding-top: 8px;
  margin-top: 6px;
  border-top: 1px solid #E0E0E0;
}

.team-projects-default {
  border-top-color: #BDBDBD;
}

.team-projects-label {
  font-size: 10px;
  color: #757575;
  margin: 0 0 4px 0;
}

.team-projects-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.team-project-chip {
  font-size: 10px;
  padding: 2px 6px;
  background-color: #E3F2FD;
  color: #1976D2;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.team-project-chip:hover {
  background-color: #BBDEFB;
}

@media (max-width: 768px) {
  .teams-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .teams-actions {
    width: 100%;
    flex-direction: column;
  }

  .teams-actions .search-wrapper {
    width: 100%;
    max-width: 100% !important;
  }

  .teams-actions .add-segment-btn {
    width: 100%;
    justify-content: center;
  }

  .teams-grid {
    grid-template-columns: 1fr;
  }

  .teams-title {
    font-size: 1.375rem !important; /* 22px */
    line-height: 1.75rem !important; /* 28px */
  }
}

/* Large screen typography - увеличенные размеры для больших экранов */
@media (min-width: 1281px) {
  .team-name {
    font-size: 16px !important; /* увеличение с 14px */
  }

  .team-name-input {
    font-size: 16px !important; /* увеличение с 14px */
    padding: 4px 10px !important;
  }

  .team-member-name {
    font-size: 14px !important; /* увеличение с 12px */
  }

  .team-member-email span {
    font-size: 12px !important; /* увеличение с 10px */
  }

  .team-projects-label {
    font-size: 12px !important; /* увеличение с 10px */
  }

  .team-project-chip {
    font-size: 12px !important; /* увеличение с 10px */
    padding: 4px 8px !important;
  }

  .teams-empty-text {
    font-size: 16px !important; /* увеличение с 14px */
  }
}

.v-theme--dinnovate .add-segment-btn-outlined {
  background-color: #FFFFFF !important;
  color: #1E88E5 !important;
  border: 1px solid #1E88E5 !important;
  box-shadow: none !important;
}

.v-theme--dinnovate .add-segment-btn-outlined:hover {
  background-color: #E3F2FD !important;
  border-color: #1E88E5 !important;
  color: #1E88E5 !important;
}
</style>