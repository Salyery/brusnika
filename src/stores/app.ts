import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Client, Brand, TeamMember, Team, Project } from '@/types';
import { initialClients, initialBrands, initialMembers, initialTeams, initialProjects } from './mockData';

export const useAppStore = defineStore('app', () => {
  // State
  const clients = ref<Client[]>(initialClients);
  const brands = ref<Brand[]>(initialBrands);
  const members = ref<TeamMember[]>(initialMembers);
  const teams = ref<Team[]>(initialTeams);
  const projects = ref<Project[]>(initialProjects);
  
  // Navigation state
  const currentSection = ref<'projects' | 'clients'>('projects');
  const currentView = ref<'list' | 'details'>('list');
  const selectedProjectId = ref<string | null>(null);
  const selectedClientId = ref<string | null>(null);
  const selectedBrandFilter = ref<string | null>(null);

  // Getters (computed)
  const selectedProject = computed(() => {
    return projects.value.find(p => p.id === selectedProjectId.value) || null;
  });

  const selectedClient = computed(() => {
    return clients.value.find(c => c.id === selectedClientId.value) || null;
  });

  // Actions - Clients
  const addClient = (client: Client) => {
    clients.value.push(client);
  };

  // Actions - Brands
  const addBrand = (brand: Brand) => {
    brands.value.push(brand);
  };

  // Actions - Members
  const addMember = (member: TeamMember) => {
    members.value.push(member);
  };

  const updateMember = (updatedMember: TeamMember) => {
    const index = members.value.findIndex(m => m.id === updatedMember.id);
    if (index !== -1) {
      members.value[index] = updatedMember;
      // Также обновляем участника во всех командах
      teams.value.forEach(team => {
        const memberIndex = team.members.findIndex(m => m.id === updatedMember.id);
        if (memberIndex !== -1) {
          team.members[memberIndex] = updatedMember;
        }
      });
    }
  };

  const deleteMember = (memberId: string) => {
    // Удаляем участника из списка
    members.value = members.value.filter(m => m.id !== memberId);
    // Удаляем участника из всех команд
    teams.value.forEach(team => {
      team.members = team.members.filter(m => m.id !== memberId);
    });
  };

  // Actions - Teams
  const updateTeams = (updatedTeams: Team[]) => {
    teams.value = updatedTeams;
  };

  // Actions - Projects
  const addProject = (project: Project) => {
    projects.value.push(project);
  };

  const updateProject = (updatedProject: Project) => {
    const index = projects.value.findIndex(p => p.id === updatedProject.id);
    if (index !== -1) {
      projects.value[index] = updatedProject;
    }
  };

  // Actions - Navigation
  const setCurrentSection = (section: 'projects' | 'clients') => {
    currentSection.value = section;
    currentView.value = 'list';
    selectedProjectId.value = null;
    selectedClientId.value = null;
  };

  const selectProject = (projectId: string | null) => {
    selectedProjectId.value = projectId;
    selectedClientId.value = null;
    currentView.value = projectId ? 'details' : 'list';
    currentSection.value = 'projects';
  };

  const selectClient = (clientId: string | null) => {
    selectedClientId.value = clientId;
    selectedProjectId.value = null;
    currentView.value = clientId ? 'details' : 'list';
    currentSection.value = 'clients';
  };

  const setBrandFilter = (brandId: string | null) => {
    selectedBrandFilter.value = brandId;
    currentSection.value = 'projects';
    currentView.value = 'list';
    selectedProjectId.value = null;
    selectedClientId.value = null;
  };

  const backToList = () => {
    currentView.value = 'list';
    selectedProjectId.value = null;
    selectedClientId.value = null;
  };

  return {
    // State
    clients,
    brands,
    members,
    teams,
    projects,
    currentSection,
    currentView,
    selectedProjectId,
    selectedClientId,
    selectedBrandFilter,
    // Getters
    selectedProject,
    selectedClient,
    // Actions
    addClient,
    addBrand,
    addMember,
    updateMember,
    deleteMember,
    updateTeams,
    addProject,
    updateProject,
    setCurrentSection,
    selectProject,
    selectClient,
    setBrandFilter,
    backToList,
  };
});