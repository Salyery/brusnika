<template>
  <div class="min-h-screen bg-grey-lighten-5">
    <!-- Header -->
    <div class="clients-header">
      <div class="clients-header-container">
        <div class="clients-header-content">
          <h1 class="clients-title">Клиенты</h1>
          
          <div class="clients-header-actions">
            <div class="search-wrapper">
              <Search class="search-icon" :size="16" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Поиск клиентов..."
                class="search-input"
              />
            </div>

            <button
              class="add-project-btn"
              @click="handleAddClient"
            >
              <Plus :size="16" />
              Добавить клиента
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="clients-content">
      <div v-if="clients.length === 0" class="clients-empty">
        <v-sheet variant="outlined" class="clients-empty-card">
          <div class="pa-16 text-center">
            <div class="clients-empty-icon-wrapper">
              <Building2 :size="32" class="clients-empty-icon" />
            </div>
            <h3 class="clients-empty-title">Нет клиентов</h3>
            <p class="clients-empty-text">Начните с добавления первого клиента</p>
            <button class="add-project-btn" @click="handleAddClient">
              <Plus :size="16" />
              Добавить клиента
            </button>
          </div>
        </v-sheet>
      </div>

      <div v-else-if="filteredClients.length === 0" class="clients-not-found">
        <p class="clients-not-found-text">Клиенты не найдены</p>
      </div>

      <div v-else>
        <div class="clients-grid">
          <v-sheet
            v-for="client in paginatedClients"
          :key="client.id"
          variant="outlined"
          class="client-card-sheet cursor-pointer"
          @click="handleClientSelect(client.id)"
        >
          <div class="client-card-content">
            <!-- Client Name & Budget -->
            <div class="client-card-header">
              <div class="client-icon-wrapper">
                <Building2 :size="20" class="client-icon" />
              </div>
              <div class="client-info">
                <h4 class="client-name">{{ client.name }}</h4>
                <p class="client-budget">{{ formatCurrency(getTotalBudget(client)) }}</p>
              </div>
            </div>

            <!-- Stats Grid -->
            <div class="client-stats">
              <div class="client-stat-item">
                <div class="client-stat-label">
                  <Users :size="14" class="client-stat-icon client-stat-icon-teams" />
                  <span class="client-stat-text">Команды</span>
                </div>
                <span class="client-stat-value">{{ getClientTeams(client.id).length }}</span>
              </div>
              <div class="client-stat-item">
                <div class="client-stat-label">
                  <FolderOpen :size="14" class="client-stat-icon client-stat-icon-projects" />
                  <span class="client-stat-text">Проекты</span>
                </div>
                <span class="client-stat-value">{{ getClientProjects(client.id).length }}</span>
              </div>
            </div>

            <!-- Brands List -->
            <div v-if="getClientBrands(client.id).length > 0" class="client-brands">
              <div class="client-brands-list">
                <span
                  v-for="brand in getClientBrands(client.id).slice(0, 3)"
                  :key="brand.id"
                  class="client-brand-chip"
                >
                  {{ brand.name }}
                </span>
                <span
                  v-if="getClientBrands(client.id).length > 3"
                  class="client-brand-chip client-brand-chip-more"
                >
                  +{{ getClientBrands(client.id).length - 3 }}
                </span>
              </div>
            </div>
          </div>
        </v-sheet>
        </div>
        <Pagination
          :total="filteredClients.length"
          :per-page="24"
          :current-page="clientsPage"
          @update:current-page="clientsPage = $event"
        />
      </div>
    </div>

    <!-- Add Client Modal -->
    <AddClientModal
      :isOpen="isAddClientModalOpen"
      @close="isAddClientModalOpen = false"
      @submit="handleAddClientSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Plus, Building2, FolderOpen, Users, Search } from 'lucide-vue-next';
import type { Client, Brand, Project, Team } from '@/types';
import AddClientModal from '@/components/AddClientModal.vue';
import Pagination from '@/components/Pagination.vue';

interface Props {
  clients: Client[];
  brands: Brand[];
  projects: Project[];
  teams: Team[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'client-select': [clientId: string];
  'add-client': [client: Client];
}>();

const searchQuery = ref('');
const isAddClientModalOpen = ref(false);
const clientsPage = ref(1);

const filteredClients = computed(() => {
  return props.clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const paginatedClients = computed(() => {
  const start = (clientsPage.value - 1) * 24;
  return filteredClients.value.slice(start, start + 24);
});

watch(filteredClients, () => {
  clientsPage.value = 1;
});

const getClientBrands = (clientId: string) => {
  return props.brands.filter(b => b.clientId === clientId);
};

const getClientProjects = (clientId: string) => {
  return props.projects.filter(p => p.clientId === clientId);
};

const getClientTeams = (clientId: string) => {
  return props.teams.filter(t => t.clientId === clientId);
};

const getTotalBudget = (client: Client) => {
  const clientProjects = getClientProjects(client.id);
  return clientProjects.reduce((total, project) => {
    return total + project.segments.reduce((sum, segment) => {
      return sum + segment.mediaSegments.reduce((segSum, ms) => segSum + ms.budget, 0);
    }, 0);
  }, 0);
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const handleAddClient = () => {
  isAddClientModalOpen.value = true;
};

const handleAddClientSubmit = (client: Client) => {
  emit('add-client', client);
  isAddClientModalOpen.value = false;
};

const handleClientSelect = (clientId: string) => {
  emit('client-select', clientId);
};
</script>

<style scoped>
.clients-header {
  background-color: #FFFFFF;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  border-bottom: 1px solid #E0E0E0;
}

.clients-header-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 16px 24px;
}

.clients-header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.clients-title {
  font-size: 20px;
  font-weight: 600;
  color: #212121;
  margin: 0;
  flex-shrink: 0;
}

.clients-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.clients-header-actions .search-wrapper {
  flex: 1;
  min-width: 0;
}

.clients-header-actions .search-input {
  background-color: #FAFAFA !important;
  border-color: #E0E0E0 !important;
}

.clients-header-actions .search-input:focus {
  background-color: #FFFFFF !important;
  border-color: transparent !important;
  box-shadow: 0 0 0 2px #2196F3 !important;
}

.clients-content {
  max-width: 1440px;
  margin: 0 auto;
  padding: 24px;
}

.clients-empty {
  display: flex;
  justify-content: center;
  padding: 64px 24px;
}

.clients-empty-card {
  background-color: #FFFFFF !important;
  border: 1px solid #E0E0E0 !important;
  border-radius: 12px !important;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
  padding: 64px !important;
}

.clients-empty-icon-wrapper {
  width: 64px;
  height: 64px;
  background-color: #E3F2FD;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.clients-empty-icon {
  color: #1E88E5;
}

.clients-empty-title {
  font-size: 18px;
  font-weight: 500;
  color: #212121;
  margin: 0 0 8px 0;
}

.clients-empty-text {
  color: #757575;
  margin: 0 0 24px 0;
}

.clients-not-found {
  text-align: center;
  padding: 48px 24px;
}

.clients-not-found-text {
  color: #757575;
  margin: 0;
}

.clients-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 640px) {
  .clients-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .clients-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.client-card-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.client-card-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.client-icon-wrapper {
  width: 40px;
  height: 40px;
  background-color: #E3F2FD;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.client-icon {
  color: #1E88E5;
}

.client-info {
  flex: 1;
  min-width: 0;
}

.client-name {
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.25;
}

.client-budget {
  font-size: 14px;
  font-weight: 500;
  color: #43A047;
  margin: 0;
  line-height: 1;
}

.client-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: auto;
}

.client-stat-item {
  background-color: #F9FAFB; /* bg-gray-50 */
  border-radius: 6px;
  padding: 6px 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.client-stat-label {
  display: flex;
  align-items: center;
  gap: 6px;
}

.client-stat-icon {
  flex-shrink: 0;
}

.client-stat-icon-teams {
  color: #F57C00;
}

.client-stat-icon-projects {
  color: #1E88E5;
}

.client-stat-text {
  font-size: 12px;
  color: #757575;
}

.client-stat-value {
  font-size: 14px;
  font-weight: 600;
  color: #212121;
}

.client-brands {
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px solid #E5E7EB; /* border-gray-200 */
}

.client-brands-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px; /* gap-1.5 = 0.375rem = 6px */
}

.client-brand-chip {
  font-size: 10px; /* text-[10px] */
  padding: 2px 8px; /* py-0.5 px-2 = 2px 8px */
  background-color: #F3E5F5; /* bg-secondary-50 */
  color: #7B1FA2; /* text-secondary-700 */
  border-radius: 9999px; /* rounded-full */
  font-weight: 500; /* font-medium */
}

.client-brand-chip-more {
  background-color: #F3F4F6; /* bg-gray-100 */
  color: #4B5563; /* text-gray-600 */
}

@media (max-width: 768px) {
  .clients-header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .clients-header-actions {
    width: 100%;
    flex-direction: column;
  }

  .clients-header-actions .search-wrapper {
    width: 100%;
  }

  .clients-header-actions .add-project-btn {
    width: 100%;
    justify-content: center;
  }

  .clients-title {
    font-size: 1.5rem !important; /* 24px */
    line-height: 1.875rem !important; /* 30px */
  }

  .clients-empty-title {
    font-size: 1.125rem !important; /* 18px */
    line-height: 1.5rem !important; /* 24px */
  }
}

/* Large screen typography - увеличенные размеры для больших экранов */
@media (min-width: 1281px) {
  .clients-title {
    font-size: 24px !important; /* увеличение с 20px */
  }

  .client-name {
    font-size: 18px !important; /* увеличение базового размера */
  }

  .client-budget {
    font-size: 16px !important; /* увеличение с 14px */
  }

  .client-stat-text {
    font-size: 14px !important; /* увеличение с 12px */
  }

  .client-stat-value {
    font-size: 16px !important; /* увеличение с 14px */
  }

  .client-brand-chip {
    font-size: 12px !important; /* увеличение с 10px */
    padding: 4px 10px !important; /* увеличение padding */
  }

  .clients-empty-title {
    font-size: 22px !important; /* увеличение с 18px */
  }

  .clients-empty-text {
    font-size: 16px !important; /* увеличение базового размера */
  }

  .clients-not-found-text {
    font-size: 16px !important; /* увеличение базового размера */
  }
}
</style>