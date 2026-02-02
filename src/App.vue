<template>
  <v-app theme="dinnovate">
    <GlobalMenu
      :active-section="store.currentSection"
      @section-change="store.setCurrentSection"
    />

    <v-main style="background-color: #FAFAFA;">
      <v-container fluid class="pa-0">
        <!-- Projects List -->
        <ProjectsList
          v-if="store.currentView === 'list' && store.currentSection === 'projects'"
          :key="'projects-list'"
          :projects="store.projects"
          :clients="store.clients"
          :brands="store.brands"
          :teams="store.teams"
          :brand-filter="store.selectedBrandFilter"
          @project-select="handleProjectSelect"
          @open-add-project-modal="isAddProjectModalOpen = true"
          @brand-filter-change="store.setBrandFilter"
        />

        <!-- Clients List -->
        <ClientsList
          v-if="store.currentView === 'list' && store.currentSection === 'clients'"
          :key="'clients-list'"
          :clients="store.clients"
          :brands="store.brands"
          :projects="store.projects"
          :teams="store.teams"
          @client-select="handleClientSelect"
          @add-client="handleAddClient"
        />

        <!-- Project Details -->
        <ProjectDetails
          v-if="store.currentView === 'details' && store.currentSection === 'projects' && store.selectedProject"
          :key="`project-${store.selectedProjectId}`"
          :project="store.selectedProject"
          :teams="store.teams"
          :members="store.members"
          :projects="store.projects"
          :clients="store.clients"
          :brands="store.brands"
          @back="store.backToList"
          @update="handleProjectUpdate"
          @update-teams="handleUpdateTeams"
          @add-member="handleAddMember"
          @project-select="handleProjectSelect"
        />

        <!-- Client Details -->
        <ClientDetails
          v-if="store.currentView === 'details' && store.currentSection === 'clients' && store.selectedClient"
          :key="`client-${store.selectedClientId}`"
          :client="store.selectedClient"
          :brands="store.brands"
          :projects="store.projects"
          :teams="store.teams"
          :members="store.members"
          @back="store.backToList"
          @add-brand="handleAddBrand"
          @project-select="handleProjectSelect"
          @brand-select="handleBrandSelect"
          @add-member="handleAddMember"
          @update-member="handleUpdateMember"
          @delete-member="handleDeleteMember"
          @update-teams="handleUpdateTeams"
        />
      </v-container>
    </v-main>

    <!-- Modals -->
    <AddProjectModal
      :isOpen="isAddProjectModalOpen"
      :clients="store.clients"
      :brands="store.brands"
      @close="isAddProjectModalOpen = false"
      @submit="handleProjectCreate"
      @add-client="handleAddClient"
      @add-brand="handleAddBrand"
    />
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAppStore } from '@/stores/app';
import GlobalMenu from '@/components/GlobalMenu.vue';
import ProjectsList from '@/views/ProjectsList.vue';
import ClientsList from '@/views/ClientsList.vue';
import ProjectDetails from '@/views/ProjectDetails.vue';
import ClientDetails from '@/views/ClientDetails.vue';
import AddProjectModal from '@/components/AddProjectModal.vue';
import type { Project, Client, Brand, TeamMember, Team } from '@/types';

const store = useAppStore();

// Modal states
const isAddProjectModalOpen = ref(false);

// Handlers
const handleProjectSelect = (projectId: string) => {
  store.selectProject(projectId);
};

const handleClientSelect = (clientId: string) => {
  store.selectClient(clientId);
};

const handleProjectCreate = (project: Project) => {
  store.addProject(project);
  isAddProjectModalOpen.value = false;
};

const handleProjectUpdate = (updatedProject: Project) => {
  store.updateProject(updatedProject);
};

const handleAddClient = (client: Client) => {
  store.addClient(client);
};

const handleAddBrand = (brand: Brand) => {
  store.addBrand(brand);
};

const handleAddMember = (member: TeamMember) => {
  store.addMember(member);
};

const handleUpdateTeams = (teams: Team[]) => {
  store.updateTeams(teams);
};

const handleBrandSelect = (brandId: string) => {
  store.setBrandFilter(brandId);
};

const handleUpdateMember = (member: TeamMember) => {
  store.updateMember(member);
};

const handleDeleteMember = (memberId: string) => {
  store.deleteMember(memberId);
};
</script>
