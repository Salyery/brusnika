<template>
  <v-dialog
    :model-value="isOpen"
    @update:model-value="$emit('close')"
    max-width="768"
    scrollable
    class="add-project-dialog"
  >
    <v-card class="add-project-card" :rounded="false">
      <v-card-title class="add-project-header">
        <h2 class="add-project-title">{{ project ? 'Редактировать проект' : 'Добавить проект' }}</h2>
        <button class="add-project-close-btn" @click="$emit('close')">
          <X :size="16" />
        </button>
      </v-card-title>

      <v-card-text class="add-project-content">
        <form @submit.prevent="handleSubmit" class="add-project-form">
          <!-- Название проекта -->
          <div class="form-field">
            <label class="form-label">Название проекта *</label>
            <input
              v-model="projectName"
              type="text"
              required
              class="form-input"
              placeholder="Введите название"
            />
          </div>

          <!-- Клиент и Бренд -->
          <div class="form-row">
            <div class="form-field">
              <label class="form-label" :class="{ 'form-label-disabled': project }">Клиент *</label>
              <div class="form-select-with-btn">
                <input
                  v-if="project"
                  :value="clientName"
                  type="text"
                  disabled
                  class="form-input form-input-disabled"
                />
                <template v-else>
                  <Select
                    v-model="selectedClientId"
                    :items="clientSelectItems"
                    placeholder="Выберите клиента"
                    @update:model-value="handleClientChange"
                  />
                  <button
                    type="button"
                    class="form-add-btn"
                    @click="showAddClient = true"
                    title="Добавить клиента"
                  >
                    <Plus :size="16" />
                  </button>
                </template>
              </div>
            </div>

            <div class="form-field">
              <label class="form-label" :class="{ 'form-label-disabled': project }">Бренд</label>
              <div class="form-select-with-btn">
                <input
                  v-if="project"
                  :value="brandName"
                  type="text"
                  disabled
                  class="form-input form-input-disabled"
                />
                <template v-else>
                  <Select
                    v-model="selectedBrandId"
                    :items="brandSelectItems"
                    placeholder="Выберите бренд"
                    :disabled="!selectedClientId"
                  />
                  <button
                    type="button"
                    class="form-add-btn"
                    :disabled="!selectedClientId"
                    @click="showAddBrand = true"
                    title="Добавить бренд"
                  >
                    <Plus :size="16" />
                  </button>
                </template>
              </div>
            </div>
          </div>

          <!-- Даты -->
          <div class="form-row">
            <div class="form-field">
              <label class="form-label">Дата начала *</label>
              <DatePickerField
                v-model="periodStart"
                placeholder="Выберите дату"
                required
              />
            </div>
            <div class="form-field">
              <label class="form-label">Дата окончания *</label>
              <DatePickerField
                v-model="periodEnd"
                placeholder="Выберите дату"
                required
              />
            </div>
          </div>

          <!-- Переключатели -->
          <div class="form-row">
            <div class="form-field">
              <label class="form-label" :class="{ 'form-label-disabled': project }">Вид согласования с клиентом *</label>
              <div class="toggle-group">
                <span class="toggle-label" :class="{ 'toggle-label-disabled': project }">Документ</span>
                <button
                  type="button"
                  class="toggle-switch"
                  :class="{ 
                    'toggle-switch-active': (project ? project.settings.approvalType : approvalType) === 'Строками',
                    'toggle-switch-disabled': project
                  }"
                  :disabled="project"
                  @click="handleApprovalTypeToggle"
                >
                  <span class="toggle-switch-thumb"></span>
                </button>
                <span class="toggle-label" :class="{ 'toggle-label-disabled': project }">Строками</span>
              </div>
            </div>

            <div class="form-field">
              <label class="form-label" :class="{ 'form-label-disabled': project }">Показывать сумму клиенту *</label>
              <div class="toggle-group">
                <span class="toggle-label" :class="{ 'toggle-label-disabled': project }">Без НДС</span>
                <button
                  type="button"
                  class="toggle-switch"
                  :class="{ 
                    'toggle-switch-active': (project ? project.settings.amountDisplay : amountDisplay) === 'С НДС',
                    'toggle-switch-disabled': project
                  }"
                  :disabled="project"
                  @click="handleAmountDisplayToggle"
                >
                  <span class="toggle-switch-thumb"></span>
                </button>
                <span class="toggle-label" :class="{ 'toggle-label-disabled': project }">С НДС</span>
              </div>
            </div>
          </div>

          <!-- Параметры создания заказа -->
          <div class="form-section">
            <h3 class="form-section-title">Параметры создания заказа</h3>
            
            <div class="form-row">
              <div class="form-field">
                <label class="form-label">Производственный актив</label>
                <Select
                  v-model="productionAsset"
                  :items="productionAssetItems"
                  placeholder="Не выбрано"
                />
              </div>

              <div class="form-field">
                <label class="form-label">Тип договора</label>
                <Select
                  v-model="contractType"
                  :items="contractTypeItems"
                  placeholder="Не выбрано"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-field">
                <label class="form-label">Юр. Лицо РА</label>
                <Select
                  v-model="agencyLegalEntity"
                  :items="agencyLegalEntityItems"
                  placeholder="Не выбрано"
                />
              </div>

              <div class="form-field">
                <label class="form-label">Юр. Лицо Клиента</label>
                <Select
                  v-model="clientLegalEntity"
                  :items="clientLegalEntityItems"
                  placeholder="Не выбрано"
                />
              </div>
            </div>

            <div class="form-field">
              <label class="form-label">Договор</label>
              <Select
                :model-value="null"
                :items="[]"
                :disabled="!agencyLegalEntity || !clientLegalEntity"
                :placeholder="!agencyLegalEntity || !clientLegalEntity ? 'Выберите пару юр.лиц' : 'Выберите договор'"
              />
            </div>
          </div>

          <!-- Buttons -->
          <div class="form-actions">
            <button
              type="button"
              class="form-btn form-btn-cancel"
              @click="$emit('close')"
            >
              Отмена
            </button>
            <button
              type="submit"
              class="form-btn form-btn-submit"
              :disabled="!isFormValid"
            >
              {{ project ? 'Сохранить' : 'Создать' }}
            </button>
          </div>
        </form>
      </v-card-text>
    </v-card>

    <!-- Модальные окна для добавления клиента и бренда -->
    <AddClientModal
      :isOpen="showAddClient"
      @close="showAddClient = false"
      @submit="handleAddClient"
    />
    <AddBrandModal
      :isOpen="showAddBrand"
      :clients="clients"
      :preselectedClientId="selectedClientId"
      @close="showAddBrand = false"
      @submit="handleAddBrand"
    />
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { X, Plus } from 'lucide-vue-next';
import type { Project, Client, Brand, ApprovalType, AmountDisplay } from '@/types';
import AddClientModal from './AddClientModal.vue';
import AddBrandModal from './AddBrandModal.vue';
import Select from './Select.vue';
import DatePickerField from './DatePickerField.vue';

interface Props {
  isOpen: boolean;
  clients: Client[];
  brands: Brand[];
  project?: Project | null;
}

const props = withDefaults(defineProps<Props>(), {
  project: null,
});

const emit = defineEmits<{
  close: [];
  submit: [project: Project];
  'add-client': [client: Client];
  'add-brand': [brand: Brand];
}>();

const productionAssets = ['Актив 1', 'Актив 2', 'Актив 3'];
const contractTypes = ['Основной', 'Дополнительный', 'Рамочный'];
const agencyLegalEntities = ['ООО РА Брусника', 'ООО Медиа Групп'];
const clientLegalEntities = ['ООО Клиент 1', 'ООО Клиент 2'];

const selectedClientId = ref('');
const selectedBrandId = ref('');
const projectName = ref('');
const periodStart = ref('');
const periodEnd = ref('');
const approvalType = ref<ApprovalType>('Строками');
const amountDisplay = ref<AmountDisplay>('С НДС');
const productionAsset = ref('');
const contractType = ref('');
const agencyLegalEntity = ref('');
const clientLegalEntity = ref('');

const showAddClient = ref(false);
const showAddBrand = ref(false);

const clientName = computed(() => {
  if (!props.project) return '';
  return props.clients.find(c => c.id === props.project!.clientId)?.name || props.project.clientId;
});

const brandName = computed(() => {
  if (!props.project) return '';
  return props.project.brandId
    ? (props.brands.find(b => b.id === props.project!.brandId)?.name || props.project.brandId)
    : '—';
});

const clientSelectItems = computed(() => 
  props.clients.map(c => ({ title: c.name, value: c.id }))
);

const brandSelectItems = computed(() => {
  if (!selectedClientId.value) return [];
  return props.brands
    .filter(b => b.clientId === selectedClientId.value)
    .map(b => ({ title: b.name, value: b.id }));
});

const productionAssetItems = productionAssets.map(asset => ({ title: asset, value: asset }));
const contractTypeItems = contractTypes.map(type => ({ title: type, value: type }));
const agencyLegalEntityItems = agencyLegalEntities.map(entity => ({ title: entity, value: entity }));
const clientLegalEntityItems = clientLegalEntities.map(entity => ({ title: entity, value: entity }));

const isFormValid = computed(() => {
  return !!(
    projectName.value &&
    selectedClientId.value &&
    periodStart.value &&
    periodEnd.value
  );
});

const handleClientChange = (value: string | null) => {
  if (value) {
    selectedClientId.value = value;
    selectedBrandId.value = '';
  }
};

const handleSubmit = () => {
  if (!isFormValid.value) return;

  const updatedProject: Project = props.project
    ? {
        ...props.project,
        name: projectName.value,
        settings: {
          ...props.project.settings,
          period: {
            start: periodStart.value,
            end: periodEnd.value,
          },
          orderParameters: {
            productionAsset: productionAsset.value || undefined,
            contractType: contractType.value || undefined,
            agencyLegalEntity: agencyLegalEntity.value || undefined,
            clientLegalEntity: clientLegalEntity.value || undefined,
          },
        },
      }
    : {
        id: `p${Date.now()}`,
        name: projectName.value,
        clientId: selectedClientId.value,
        brandId: selectedBrandId.value || undefined,
        settings: {
          period: {
            start: periodStart.value,
            end: periodEnd.value,
          },
          approvalType: approvalType.value,
          amountDisplay: amountDisplay.value,
          orderParameters: {
            productionAsset: productionAsset.value || undefined,
            contractType: contractType.value || undefined,
            agencyLegalEntity: agencyLegalEntity.value || undefined,
            clientLegalEntity: clientLegalEntity.value || undefined,
          },
        },
        segments: [],
      };

  emit('submit', updatedProject);
  handleClose();
};

watch(() => [props.isOpen, props.project], ([isOpen, project]) => {
  if (isOpen && project) {
    // Load project data for editing
    projectName.value = project.name;
    selectedClientId.value = project.clientId;
    selectedBrandId.value = project.brandId || '';
    periodStart.value = project.settings.period.start;
    periodEnd.value = project.settings.period.end;
    approvalType.value = project.settings.approvalType;
    amountDisplay.value = project.settings.amountDisplay;
    productionAsset.value = project.settings.orderParameters?.productionAsset || '';
    contractType.value = project.settings.orderParameters?.contractType || '';
    agencyLegalEntity.value = project.settings.orderParameters?.agencyLegalEntity || '';
    clientLegalEntity.value = project.settings.orderParameters?.clientLegalEntity || '';
  } else if (isOpen && !project) {
    // Reset for add mode
    handleClose();
  }
});

const handleClose = () => {
  if (props.project) {
    // Reset to project values for edit mode
    projectName.value = props.project.name;
    selectedClientId.value = props.project.clientId;
    selectedBrandId.value = props.project.brandId || '';
    periodStart.value = props.project.settings.period.start;
    periodEnd.value = props.project.settings.period.end;
    approvalType.value = props.project.settings.approvalType;
    amountDisplay.value = props.project.settings.amountDisplay;
    productionAsset.value = props.project.settings.orderParameters?.productionAsset || '';
    contractType.value = props.project.settings.orderParameters?.contractType || '';
    agencyLegalEntity.value = props.project.settings.orderParameters?.agencyLegalEntity || '';
    clientLegalEntity.value = props.project.settings.orderParameters?.clientLegalEntity || '';
  } else {
    // Clear for add mode
    selectedClientId.value = '';
    selectedBrandId.value = '';
    projectName.value = '';
    periodStart.value = '';
    periodEnd.value = '';
    approvalType.value = 'Строками';
    amountDisplay.value = 'С НДС';
    productionAsset.value = '';
    contractType.value = '';
    agencyLegalEntity.value = '';
    clientLegalEntity.value = '';
  }
};

const handleAddClient = (client: Client) => {
  emit('add-client', client);
  selectedClientId.value = client.id;
  showAddClient.value = false;
};

const handleAddBrand = (brand: Brand) => {
  emit('add-brand', brand);
  selectedBrandId.value = brand.id;
  showAddBrand.value = false;
};

const handleApprovalTypeToggle = () => {
  if (!props.project) {
    approvalType.value = approvalType.value === 'Строками' ? 'Документ' : 'Строками';
  }
};

const handleAmountDisplayToggle = () => {
  if (!props.project) {
    amountDisplay.value = amountDisplay.value === 'С НДС' ? 'Без НДС' : 'С НДС';
  }
};
</script>

<style scoped>
.add-project-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-label {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
}

.form-label-disabled {
  color: #6B7280;
}

.form-input-disabled {
  background-color: #F3F4F6;
  color: #6B7280;
  cursor: not-allowed;
}

.toggle-label-disabled {
  color: #6B7280;
}

.toggle-switch-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.form-select-with-btn {
  display: flex;
  gap: 6px;
}

.form-section {
  padding-top: 8px;
  border-top: 1px solid #E5E7EB;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-section-title {
  font-size: 12px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.form-actions {
  display: flex;
  gap: 8px;
  padding-top: 8px;
  width: 100%;
}
</style>
