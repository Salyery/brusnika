<template>
  <div>
    <!-- Onboarding for empty projects -->
    <ProjectOnboarding
      v-if="project.segments.length === 0"
      :has-segments="project.segments.length > 0"
      :teams="projectTeams"
      class="mb-4"
      @add-segment="$emit('add-segment')"
      @manage-teams="handleManageTeams"
    />

    <div>
      <div class="segments-header">
        <h2 class="segments-title">Сегменты проекта</h2>
        <div class="segments-filters">
          <div class="search-wrapper segments-search">
            <Search class="search-icon" :size="16" />
            <input
              v-model="filterSegmentOrMP"
              type="text"
              placeholder="Название сегмента или МП"
              class="search-input"
            />
          </div>
          <div class="segments-filters-group">
            <Select
              v-model="filterTeam"
              :items="teamOptions"
              placeholder="Все команды"
              select-class="filter-select-team"
              @update:model-value="handleTeamChange"
            />
            <Select
              v-model="filterMedia"
              :items="mediaOptions"
              placeholder="Все медиа"
              select-class="filter-select-media"
              @update:model-value="handleMediaChange"
            />
          </div>
        </div>
        <button
          class="add-segment-btn"
          @click="$emit('add-segment')"
        >
          <Plus :size="16" />
          Добавить сегмент
        </button>
      </div>

      <!-- Table -->
      <template v-if="tableRows.length === 0">
        <div class="segments-empty">
          <p class="segments-empty-text">Нет сегментов</p>
          <button class="add-segment-btn" @click="$emit('add-segment')">
            <Plus :size="16" />
            Добавить первый сегмент
          </button>
        </div>
      </template>

      <template v-else>
        <!-- Desktop Table View -->
        <div class="segments-table-container segments-table-desktop">
        <div class="overflow-x-auto">
          <table class="segments-table">
            <thead>
              <tr class="segments-table-header">
                <th class="segments-table-th">Команда</th>
                <th class="segments-table-th">Сегмент</th>
                <th class="segments-table-th">Медиа</th>
                <th class="segments-table-th">Название МП</th>
                <th class="segments-table-th">Статус РА</th>
                <th class="segments-table-th">Статус Клиент</th>
                <th class="segments-table-th">Действие</th>
              </tr>
            </thead>
            <tbody class="segments-table-body">
                <template v-for="(row, index) in tableRows" :key="row.key">
                  <tr class="segments-table-row">
                    <td
                      v-if="row.showTeam"
                      :rowspan="row.teamRowSpan"
                      class="segments-table-td segments-table-td-team"
                    >
                      {{ row.teamName }}
                    </td>
                    <td
                      v-if="row.showSegment"
                      :rowspan="row.segmentRowSpan"
                      class="segments-table-td segments-table-td-segment"
                    >
                      <div class="segments-table-segment-content">
                        <span>{{ row.segmentName }}</span>
                        <v-tooltip text="Редактировать сегмент и бюджеты" location="bottom">
                          <template #activator="{ props: tooltipProps }">
                            <button
                              v-bind="tooltipProps"
                              class="segments-table-edit-btn"
                              @click="$emit('edit-segment', row.segment)"
                            >
                              <Settings :size="14" />
                            </button>
                          </template>
                        </v-tooltip>
                      </div>
                    </td>
                    <td
                      v-if="row.showMedia"
                      :rowspan="row.mediaRowSpan"
                      class="segments-table-td segments-table-td-media"
                    >
                      <div class="segments-table-media-content">
                        <!-- Первая строка: название медиа слева, бюджет справа -->
                        <div class="segments-table-media-row">
                          <div class="segments-table-media-type">{{ row.mediaType }}</div>
                          <div class="segments-table-media-budget">
                            {{ formatCompactCurrency(row.budget) }}
                          </div>
                        </div>
                        <!-- Вторая строка: загрузка МП -->
                        <div v-if="row.showMedia" class="segments-table-media-row">
                          <button
                            class="segments-table-action-btn segments-table-action-btn-primary"
                            @click="handleUploadMediaPlan(row.segmentId, row.mediaSegmentId)"
                          >
                            <Upload :size="12" />
                            Загрузить новый МП
                          </button>
                        </div>
                        <!-- Третья строка: сводный слева, заказ справа -->
                        <div v-if="(row.summarySheetUrl && row.hasAgreedPlan) || row.orderCode" class="segments-table-media-row">
                          <a
                            v-if="row.summarySheetUrl && row.hasAgreedPlan"
                            :href="row.summarySheetUrl"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="segments-table-media-link"
                          >
                            <FileText :size="12" />
                            Сводный
                          </a>
                          <span v-else></span>
                          <v-tooltip v-if="row.orderCode" text="Кликните, чтобы скопировать номер заказа" location="bottom">
                            <template #activator="{ props: tooltipProps }">
                              <span 
                                v-bind="tooltipProps" 
                                class="segments-table-order-code segments-table-order-code-clickable"
                                @click.stop="handleCopyOrderCode(row.orderCode)"
                              >
                                {{ row.orderCode }}
                              </span>
                            </template>
                          </v-tooltip>
                          <span v-else></span>
                        </div>
                        <v-tooltip v-if="row.hasAgreedPlan" text="Создать задачу на запуск" location="bottom">
                          <template #activator="{ props: tooltipProps }">
                            <button
                              v-bind="tooltipProps"
                              class="segments-table-launch-btn"
                              @click="handleCreateLaunchTask(row.segmentId, row.mediaSegmentId, row.segmentName)"
                            >
                              <Plus :size="12" />
                              Задача на запуск
                            </button>
                          </template>
                        </v-tooltip>
                        <div v-if="row.launchTasks && row.launchTasks.length > 0" class="segments-table-launch-tasks">
                          <v-tooltip
                            v-for="task in row.launchTasks"
                            :key="task.id"
                            :text="`Задача на запуск: ${task.period}`"
                            location="bottom"
                          >
                            <template #activator="{ props: tooltipProps }">
                              <a
                                v-bind="tooltipProps"
                                href="#"
                                class="segments-table-launch-task-link"
                              >
                                {{ task.period.split(' ')[0] }}
                              </a>
                            </template>
                          </v-tooltip>
                        </div>
                      </div>
                    </td>
                    <td class="segments-table-td">
                      <div v-if="row.mediaPlan" class="segments-table-mp-content">
                        <div class="segments-table-mp-name">{{ row.mediaPlan.name }}</div>
                        <v-tooltip text="Дата создания МП" location="bottom">
                          <template #activator="{ props: tooltipProps }">
                            <div v-bind="tooltipProps" class="segments-table-mp-date">
                              {{ formatDate(row.mediaPlan.createdAt) }}
                            </div>
                          </template>
                        </v-tooltip>
                        <div class="segments-table-mp-links">
                          <a
                            :href="row.mediaPlan.raSheetUrl"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="segments-table-mp-link"
                            title="РА таблица"
                          >
                            <FileText :size="12" />
                            РА
                          </a>
                          <a
                            :href="row.mediaPlan.clientSheetUrl"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="segments-table-mp-link"
                            title="Клиентская таблица"
                          >
                            <FileText :size="12" />
                            Клиент
                          </a>
                        </div>
                      </div>
                      <span v-else class="segments-table-empty">—</span>
                    </td>
                    <td class="segments-table-td">
                      <div v-if="row.mediaPlan" class="segments-table-status">
                        <div v-if="row.mediaPlan.statusRA !== '—'" :class="['segments-table-status-dot', getStatusDotColor(row.mediaPlan.statusRA)]"></div>
                        <span class="segments-table-status-text">
                          {{ row.mediaPlan.statusRA }}
                        </span>
                      </div>
                      <span v-else class="segments-table-empty">—</span>
                    </td>
                    <td class="segments-table-td">
                      <div v-if="row.mediaPlan" class="segments-table-status">
                        <div v-if="row.mediaPlan.statusClient !== '—'" :class="['segments-table-status-dot', getStatusDotColor(row.mediaPlan.statusClient)]"></div>
                        <span class="segments-table-status-text">
                          {{ row.mediaPlan.statusClient }}
                        </span>
                      </div>
                      <span v-else class="segments-table-empty">—</span>
                    </td>
                    <td class="segments-table-td">
                      <div class="segments-table-actions">
                        <template v-if="row.mediaPlan">
                          <v-tooltip v-if="row.orderCode && !row.mediaPlan.confirmationTaskId" text="Создать задачу на подтверждение" location="bottom">
                            <template #activator="{ props: tooltipProps }">
                              <button
                                v-bind="tooltipProps"
                                class="segments-table-action-btn segments-table-action-btn-success"
                                @click="handleCreateConfirmationTask(row.segmentId, row.mediaSegmentId, row.mediaPlan.id)"
                              >
                                <Plus :size="12" />
                                Подтверждение
                              </button>
                            </template>
                          </v-tooltip>
                          <v-tooltip v-if="row.mediaPlan.confirmationTaskId" text="Задача на подтверждение" location="bottom">
                            <template #activator="{ props: tooltipProps }">
                              <a
                                v-bind="tooltipProps"
                                href="#"
                                class="segments-table-confirmation-task"
                              >
                                {{ row.mediaPlan.confirmationTaskId }}
                              </a>
                            </template>
                          </v-tooltip>
                          <button
                            class="segments-table-action-btn segments-table-action-btn-secondary"
                            @click="handleUploadMediaPlan(row.segmentId, row.mediaSegmentId, row.mediaPlan)"
                          >
                            <RefreshCw :size="12" />
                            Обновить МП
                          </button>
                        </template>
                      </div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Mobile Card View -->
        <div class="segments-cards-container segments-table-mobile">
          <div
            v-for="group in mobileCardGroups"
            :key="group.key"
            class="segments-card"
          >
            <!-- Шапка группы (команда, сегмент, медиа) - показывается один раз для каждого медиа-сегмента -->
            <div class="segments-card-header">
              <div class="segments-card-team">{{ group.teamName }}</div>
              <div class="segments-card-segment">
                <span>{{ group.segmentName }}</span>
                <v-tooltip text="Редактировать сегмент и бюджеты" location="bottom">
                  <template #activator="{ props: tooltipProps }">
                    <button
                      v-bind="tooltipProps"
                      class="segments-table-edit-btn"
                      @click="$emit('edit-segment', group.segment)"
                    >
                      <Settings :size="14" />
                    </button>
                  </template>
                </v-tooltip>
              </div>
              <div class="segments-card-media">
                <div class="segments-card-media-row">
                  <span class="segments-card-media-type">{{ group.mediaType }}</span>
                  <span class="segments-card-media-budget">{{ formatCompactCurrency(group.budget) }}</span>
                </div>
                <div class="segments-card-media-row">
                  <button
                    class="segments-card-action-btn segments-card-action-btn-primary"
                    @click="handleUploadMediaPlan(group.segmentId, group.mediaSegmentId)"
                  >
                    <Upload :size="12" />
                    Загрузить новый МП
                  </button>
                </div>
                <div v-if="(group.summarySheetUrl && group.hasAgreedPlan) || group.orderCode" class="segments-card-media-row">
                  <a
                    v-if="group.summarySheetUrl && group.hasAgreedPlan"
                    :href="group.summarySheetUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="segments-table-media-link"
                  >
                    <FileText :size="12" />
                    Сводный
                  </a>
                  <span v-else></span>
                  <v-tooltip v-if="group.orderCode" text="Кликните, чтобы скопировать номер заказа" location="bottom">
                    <template #activator="{ props: tooltipProps }">
                      <span 
                        v-bind="tooltipProps" 
                        class="segments-table-order-code segments-table-order-code-clickable"
                        @click.stop="handleCopyOrderCode(group.orderCode!)"
                      >
                        {{ group.orderCode }}
                      </span>
                    </template>
                  </v-tooltip>
                  <span v-else></span>
                </div>
                <div v-if="group.hasAgreedPlan" class="segments-card-media-row">
                  <button
                    class="segments-card-launch-btn"
                    @click="handleCreateLaunchTask(group.segmentId, group.mediaSegmentId, group.segmentName)"
                  >
                    <Plus :size="12" />
                    Задача на запуск
                  </button>
                </div>
                <div v-if="group.launchTasks && group.launchTasks.length > 0" class="segments-card-media-row">
                  <div class="segments-card-launch-tasks">
                    <a
                      v-for="task in group.launchTasks"
                      :key="task.id"
                      href="#"
                      class="segments-card-launch-task-link"
                    >
                      {{ task.period.split(' ')[0] }}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <!-- Медиапланы для этого медиа-сегмента -->
            <template v-if="group.mediaPlans.length > 0">
              <div
                v-for="(mediaPlan, index) in group.mediaPlans"
                :key="`${group.mediaSegmentId}-${mediaPlan.id}`"
                class="segments-card-content"
                :class="{ 'segments-card-content-divider': index > 0 }"
              >
                <div class="segments-card-section">
                  <div class="segments-card-label">Медиаплан</div>
                  <div class="segments-card-value">{{ mediaPlan.name }}</div>
                  <v-tooltip text="Дата создания МП" location="bottom">
                    <template #activator="{ props: tooltipProps }">
                      <div v-bind="tooltipProps" class="segments-card-date">{{ formatDate(mediaPlan.createdAt) }}</div>
                    </template>
                  </v-tooltip>
                </div>

                <div class="segments-card-section">
                  <div class="segments-card-label">Статусы</div>
                  <div class="segments-card-statuses">
                    <div class="segments-card-status">
                      <div v-if="mediaPlan.statusRA !== '—'" :class="['segments-table-status-dot', getStatusDotColor(mediaPlan.statusRA)]"></div>
                      <span>РА: {{ mediaPlan.statusRA }}</span>
                    </div>
                    <div class="segments-card-status">
                      <div v-if="mediaPlan.statusClient !== '—'" :class="['segments-table-status-dot', getStatusDotColor(mediaPlan.statusClient)]"></div>
                      <span>Клиент: {{ mediaPlan.statusClient }}</span>
                    </div>
                  </div>
                </div>

                <div class="segments-card-section">
                  <div class="segments-card-label">Действия</div>
                  <div class="segments-card-actions">
                    <v-tooltip v-if="group.orderCode && !mediaPlan.confirmationTaskId" text="Создать задачу на подтверждение" location="bottom">
                      <template #activator="{ props: tooltipProps }">
                        <button
                          v-bind="tooltipProps"
                          class="segments-card-action-btn segments-card-action-btn-success"
                          @click="handleCreateConfirmationTask(group.segmentId, group.mediaSegmentId, mediaPlan.id)"
                        >
                          <Plus :size="14" />
                          Подтверждение
                        </button>
                      </template>
                    </v-tooltip>
                    <button
                      class="segments-card-action-btn segments-card-action-btn-secondary"
                      @click="handleUploadMediaPlan(group.segmentId, group.mediaSegmentId, mediaPlan)"
                    >
                      <RefreshCw :size="14" />
                      Обновить МП
                    </button>
                  </div>
                </div>
              </div>
            </template>

            <!-- Пустое состояние, если нет медиапланов -->
            <div v-else class="segments-card-content">
              <div class="segments-card-section">
                <div class="segments-card-label">Медиаплан</div>
                <div class="segments-card-value" style="color: #BDBDBD;">Нет медиапланов</div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Modals -->
    <UploadMediaPlanModal
      :isOpen="uploadModalState.isOpen"
      :existingPlan="uploadModalState.existingPlan"
      @close="uploadModalState = { isOpen: false, segmentId: '', mediaSegmentId: '' }"
      @submit="handleUploadMediaPlanSubmit"
    />

    <AddLaunchTaskModal
      :isOpen="addLaunchTaskModalState.isOpen"
      :project="project"
      :segment-id="addLaunchTaskModalState.segmentId"
      :media-segment-id="addLaunchTaskModalState.mediaSegmentId"
      @close="addLaunchTaskModalState = { isOpen: false, segmentId: '', mediaSegmentId: '' }"
      @submit="handleAddLaunchTaskSubmit"
    />

    <CreateLaunchTaskModal
      :isOpen="createLaunchTaskModalState.isOpen"
      :project="project"
      :segment-id="createLaunchTaskModalState.segmentId"
      :media-segment-id="createLaunchTaskModalState.mediaSegmentId"
      :segment-name="createLaunchTaskModalState.segmentName"
      @close="createLaunchTaskModalState = { isOpen: false, segmentId: '', mediaSegmentId: '', segmentName: '' }"
      @update="handleCreateLaunchTaskUpdate"
    />

    <CreateConfirmationTaskModal
      :isOpen="confirmationTaskModalState.isOpen"
      @close="confirmationTaskModalState = { isOpen: false, segmentId: '', mediaSegmentId: '', mediaPlanId: '' }"
      @submit="handleCreateConfirmationTaskSubmit"
    />

    <!-- Snackbar для уведомления о копировании -->
    <v-snackbar
      v-model="snackbar.show"
      :timeout="1000"
      color="success"
      location="bottom"
    >
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Plus, Upload, ExternalLink, Settings, PieChart, FileText, Users, Search, RefreshCw, CheckCircle2 } from 'lucide-vue-next';
import type { Project, Segment, MediaSegment, MediaPlan, Team } from '@/types';
import ProjectOnboarding from './ProjectOnboarding.vue';
import UploadMediaPlanModal from './UploadMediaPlanModal.vue';
import AddLaunchTaskModal from './AddLaunchTaskModal.vue';
import CreateLaunchTaskModal from './CreateLaunchTaskModal.vue';
import CreateConfirmationTaskModal from './CreateConfirmationTaskModal.vue';
import Select from './Select.vue';

interface Props {
  project: Project;
  teams: Team[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update': [project: Project];
  'add-segment': [];
  'edit-segment': [segment: Segment];
  'switch-to-teams': [];
}>();

const filterSegmentOrMP = ref('');
const filterTeam = ref<string | null>(null);
const filterMedia = ref<string | null>(null);

const handleTeamChange = (value: string | null) => {
  filterTeam.value = value;
};

const handleMediaChange = (value: string | null) => {
  filterMedia.value = value;
};

const uploadModalState = ref<{
  isOpen: boolean;
  segmentId: string;
  mediaSegmentId: string;
  existingPlan?: MediaPlan;
}>({ isOpen: false, segmentId: '', mediaSegmentId: '' });

const addLaunchTaskModalState = ref<{
  isOpen: boolean;
  segmentId: string;
  mediaSegmentId: string;
}>({ isOpen: false, segmentId: '', mediaSegmentId: '' });

const createLaunchTaskModalState = ref<{
  isOpen: boolean;
  segmentId: string;
  mediaSegmentId: string;
  segmentName: string;
}>({ isOpen: false, segmentId: '', mediaSegmentId: '', segmentName: '' });

const snackbar = ref({
  show: false,
  text: '',
});

const confirmationTaskModalState = ref<{
  isOpen: boolean;
  segmentId: string;
  mediaSegmentId: string;
  mediaPlanId: string;
}>({ isOpen: false, segmentId: '', mediaSegmentId: '', mediaPlanId: '' });

// Фильтруем команды по клиенту проекта
const projectTeams = computed(() => {
  return props.teams.filter(t => t.clientId === props.project.clientId);
});

const teamOptions = computed(() => [
  { title: 'Все команды', value: null },
  ...projectTeams.value
    .map(team => ({ title: team.name, value: team.id }))
]);

const mediaOptions = computed(() => [
  { title: 'Все медиа', value: null },
  { title: 'Outdoor', value: 'Outdoor' },
  { title: 'ТВ', value: 'ТВ' },
  { title: 'Радио', value: 'Радио' },
  { title: 'Интернет', value: 'Интернет' },
  { title: 'НСТ', value: 'НСТ' },
]);

const getTeamName = (teamId: string) => {
  return props.teams.find(t => t.id === teamId)?.name || '';
};

const groupedData = computed(() => {
  const grouped: Array<{
    teamId: string;
    teamName: string;
    segments: Array<{
      segment: Segment;
      mediaSegments: Array<{
        mediaSegment: MediaSegment;
        mediaPlans: MediaPlan[];
      }>;
    }>;
  }> = [];

  const searchLower = filterSegmentOrMP.value.toLowerCase();

  props.project.segments.forEach(segment => {
    if (filterTeam.value && segment.teamId !== filterTeam.value) {
      return;
    }

    const isSegmentMatch = !filterSegmentOrMP.value || segment.name.toLowerCase().includes(searchLower);

    const mediaSegmentsFiltered = segment.mediaSegments
      .filter(ms => !filterMedia.value || ms.mediaType === filterMedia.value)
      .map(ms => ({
        mediaSegment: ms,
        mediaPlans: ms.mediaPlans.filter(mp =>
          !filterSegmentOrMP.value || isSegmentMatch || mp.name.toLowerCase().includes(searchLower)
        ),
      }))
      .filter(item => !filterSegmentOrMP.value || isSegmentMatch || item.mediaPlans.length > 0);

    if (mediaSegmentsFiltered.length > 0) {
      const teamName = getTeamName(segment.teamId);
      let teamGroup = grouped.find(g => g.teamId === segment.teamId);

      if (!teamGroup) {
        teamGroup = {
          teamId: segment.teamId,
          teamName,
          segments: [],
        };
        grouped.push(teamGroup);
      }

      teamGroup.segments.push({
        segment,
        mediaSegments: mediaSegmentsFiltered,
      });
    }
  });

  return grouped;
});

interface TableRow {
  key: string;
  teamName: string;
  segmentName: string;
  segment: Segment;
  segmentId: string;
  mediaType: string;
  budget: number;
  orderCode?: string;
  summarySheetUrl?: string;
  launchTasks: Array<{ id: string; period: string }>;
  mediaPlan?: MediaPlan;
  mediaSegmentId: string;
  showTeam: boolean;
  showSegment: boolean;
  showMedia: boolean;
  teamRowSpan: number;
  segmentRowSpan: number;
  mediaRowSpan: number;
  hasAgreedPlan: boolean;
}

const tableRows = computed(() => {
  const rows: TableRow[] = [];

  groupedData.value.forEach((teamGroup) => {
    let teamRowSpan = 0;
    teamGroup.segments.forEach(seg => {
      seg.mediaSegments.forEach(ms => {
        teamRowSpan += Math.max(ms.mediaPlans.length, 1);
      });
    });

    let firstTeamRow = true;

    teamGroup.segments.forEach((segmentData) => {
      let segmentRowSpan = 0;
      segmentData.mediaSegments.forEach(ms => {
        segmentRowSpan += Math.max(ms.mediaPlans.length, 1);
      });

      let firstSegmentRow = true;

      segmentData.mediaSegments.forEach((msData) => {
        const mediaSegmentRowSpan = Math.max(msData.mediaPlans.length, 1);
        let firstMediaRow = true;

        if (msData.mediaPlans.length === 0) {
          // Empty row for media segment without media plans
          rows.push({
            key: `${segmentData.segment.id}-${msData.mediaSegment.id}-empty`,
            teamName: teamGroup.teamName,
            segmentName: segmentData.segment.name,
            segment: segmentData.segment,
            segmentId: segmentData.segment.id,
            mediaType: msData.mediaSegment.mediaType,
            budget: msData.mediaSegment.budget,
            orderCode: msData.mediaSegment.orderCode,
            summarySheetUrl: msData.mediaSegment.summarySheetUrl,
            launchTasks: msData.mediaSegment.launchTasks || [],
            mediaSegmentId: msData.mediaSegment.id,
            showTeam: firstTeamRow,
            showSegment: firstSegmentRow,
            showMedia: firstMediaRow,
            teamRowSpan,
            segmentRowSpan,
            mediaRowSpan: mediaSegmentRowSpan,
            hasAgreedPlan: false,
          });
          firstTeamRow = false;
          firstSegmentRow = false;
          firstMediaRow = false;
        } else {
          msData.mediaPlans.forEach((mp) => {
            rows.push({
              key: `${segmentData.segment.id}-${msData.mediaSegment.id}-${mp.id}`,
              teamName: teamGroup.teamName,
              segmentName: segmentData.segment.name,
              segment: segmentData.segment,
              segmentId: segmentData.segment.id,
              mediaType: msData.mediaSegment.mediaType,
              budget: msData.mediaSegment.budget,
              orderCode: msData.mediaSegment.orderCode,
              summarySheetUrl: msData.mediaSegment.summarySheetUrl,
              launchTasks: msData.mediaSegment.launchTasks || [],
              mediaPlan: mp,
              mediaSegmentId: msData.mediaSegment.id,
              showTeam: firstTeamRow,
              showSegment: firstSegmentRow,
              showMedia: firstMediaRow,
              teamRowSpan,
              segmentRowSpan,
              mediaRowSpan: mediaSegmentRowSpan,
              hasAgreedPlan: msData.mediaPlans.some(mp => mp.statusClient === 'Согласовано'),
            });
            firstTeamRow = false;
            firstSegmentRow = false;
            firstMediaRow = false;
          });
        }
      });
    });
  });

  return rows;
});

interface MobileCardGroup {
  key: string;
  teamName: string;
  segmentName: string;
  segment: Segment;
  segmentId: string;
  mediaType: string;
  budget: number;
  orderCode?: string;
  summarySheetUrl?: string;
  launchTasks: Array<{ id: string; period: string }>;
  mediaSegmentId: string;
  hasAgreedPlan: boolean;
  mediaPlans: MediaPlan[];
}

const mobileCardGroups = computed(() => {
  const groups: MobileCardGroup[] = [];
  let lastMediaSegmentId: string | null = null;

  tableRows.value.forEach((row) => {
    if (row.mediaSegmentId !== lastMediaSegmentId) {
      // Новый медиа-сегмент - создаем новую группу
      groups.push({
        key: `${row.segmentId}-${row.mediaSegmentId}`,
        teamName: row.teamName,
        segmentName: row.segmentName,
        segment: row.segment,
        segmentId: row.segmentId,
        mediaType: row.mediaType,
        budget: row.budget,
        orderCode: row.orderCode,
        summarySheetUrl: row.summarySheetUrl,
        launchTasks: row.launchTasks,
        mediaSegmentId: row.mediaSegmentId,
        hasAgreedPlan: row.hasAgreedPlan,
        mediaPlans: row.mediaPlan ? [row.mediaPlan] : [],
      });
      lastMediaSegmentId = row.mediaSegmentId;
    } else {
      // Тот же медиа-сегмент - добавляем медиаплан в последнюю группу
      const lastGroup = groups[groups.length - 1];
      if (row.mediaPlan) {
        lastGroup.mediaPlans.push(row.mediaPlan);
      }
      // Обновляем hasAgreedPlan если нужно
      if (row.hasAgreedPlan) {
        lastGroup.hasAgreedPlan = true;
      }
      // Обновляем orderCode и summarySheetUrl из первой строки (они одинаковые для всех строк медиа-сегмента)
      if (!lastGroup.orderCode && row.orderCode) {
        lastGroup.orderCode = row.orderCode;
      }
      if (!lastGroup.summarySheetUrl && row.summarySheetUrl) {
        lastGroup.summarySheetUrl = row.summarySheetUrl;
      }
    }
  });

  return groups;
});

const formatCompactCurrency = (amount: number) => {
  return new Intl.NumberFormat('ru-RU', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(amount) + ' ₽';
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const getStatusDotColor = (status: string) => {
  switch (status) {
    case 'В работе РА':
      return 'status-dot-blue';
    case 'В работе у клиента':
      return 'status-dot-cyan';
    case 'Согласование':
      return 'status-dot-yellow';
    case 'Согласовано':
      return 'status-dot-green';
    case 'На доработку':
      return 'status-dot-orange';
    case 'Заказ':
      return 'status-dot-purple';
    case 'Отказ':
      return 'status-dot-red';
    case '—':
      return 'status-dot-gray-light';
    default:
      return 'status-dot-gray';
  }
};

const handleManageTeams = () => {
  emit('switch-to-teams');
};

const handleUploadMediaPlan = (segmentId: string, mediaSegmentId: string, existingPlan?: MediaPlan) => {
  uploadModalState.value = {
    isOpen: true,
    segmentId,
    mediaSegmentId,
    existingPlan,
  };
};

const handleUploadMediaPlanSubmit = (planData: { name: string; file?: File }) => {
  const updatedProject = { ...props.project };
  const segment = updatedProject.segments.find(s => s.id === uploadModalState.value.segmentId);
  const mediaSegment = segment?.mediaSegments.find(ms => ms.id === uploadModalState.value.mediaSegmentId);
  
  if (mediaSegment) {
    const newPlan: MediaPlan = {
      id: `mp-${Date.now()}`,
      name: planData.name,
      clientSheetUrl: '',
      raSheetUrl: '',
      statusRA: 'В работе РА',
      statusClient: '—',
      createdAt: new Date().toISOString().split('T')[0],
      lastUploadedAt: new Date().toISOString().split('T')[0],
    };

    if (uploadModalState.value.existingPlan) {
      // Replace existing plan
      const index = mediaSegment.mediaPlans.findIndex(mp => mp.id === uploadModalState.value.existingPlan!.id);
      if (index !== -1) {
        mediaSegment.mediaPlans[index] = { ...newPlan, id: uploadModalState.value.existingPlan.id };
      }
    } else {
      // Add new plan
      mediaSegment.mediaPlans.push(newPlan);
    }
  }
  
  emit('update', updatedProject);
  uploadModalState.value = { isOpen: false, segmentId: '', mediaSegmentId: '' };
};

const handleCreateLaunchTask = (segmentId: string, mediaSegmentId: string, segmentName: string) => {
  createLaunchTaskModalState.value = {
    isOpen: true,
    segmentId,
    mediaSegmentId,
    segmentName,
  };
};

const handleCreateLaunchTaskUpdate = (updatedProject: Project) => {
  emit('update', updatedProject);
  createLaunchTaskModalState.value = { isOpen: false, segmentId: '', mediaSegmentId: '', segmentName: '' };
};

const handleAddLaunchTaskSubmit = (task: { id: string; period: string }) => {
  const updatedProject = { ...props.project };
  const segment = updatedProject.segments.find(s => s.id === addLaunchTaskModalState.value.segmentId);
  const mediaSegment = segment?.mediaSegments.find(ms => ms.id === addLaunchTaskModalState.value.mediaSegmentId);
  
  if (mediaSegment) {
    if (!mediaSegment.launchTasks) {
      mediaSegment.launchTasks = [];
    }
    mediaSegment.launchTasks.push(task);
  }
  
  emit('update', updatedProject);
  addLaunchTaskModalState.value = { isOpen: false, segmentId: '', mediaSegmentId: '' };
};

const handleCreateConfirmationTask = (segmentId: string, mediaSegmentId: string, mediaPlanId: string) => {
  confirmationTaskModalState.value = {
    isOpen: true,
    segmentId,
    mediaSegmentId,
    mediaPlanId,
  };
};

const handleCreateConfirmationTaskSubmit = (taskId: string) => {
  const updatedProject = { ...props.project };
  const segment = updatedProject.segments.find(s => s.id === confirmationTaskModalState.value.segmentId);
  const mediaSegment = segment?.mediaSegments.find(ms => ms.id === confirmationTaskModalState.value.mediaSegmentId);
  const mediaPlan = mediaSegment?.mediaPlans.find(mp => mp.id === confirmationTaskModalState.value.mediaPlanId);
  
  if (mediaPlan) {
    mediaPlan.confirmationTaskId = taskId;
  }
  
  emit('update', updatedProject);
  confirmationTaskModalState.value = { isOpen: false, segmentId: '', mediaSegmentId: '', mediaPlanId: '' };
};

const handleCopyOrderCode = async (orderCode: string) => {
  // Убираем решетку из номера заказа перед копированием
  const codeWithoutHash = orderCode.replace(/^#/, '');
  
  try {
    await navigator.clipboard.writeText(codeWithoutHash);
    snackbar.value = {
      show: true,
      text: `Номер заказа ${orderCode} скопирован в буфер обмена`,
    };
  } catch (err) {
    // Fallback для старых браузеров
    const textArea = document.createElement('textarea');
    textArea.value = codeWithoutHash;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      snackbar.value = {
        show: true,
        text: `Номер заказа ${orderCode} скопирован в буфер обмена`,
      };
    } catch (err) {
      snackbar.value = {
        show: true,
        text: 'Не удалось скопировать номер заказа',
      };
    }
    document.body.removeChild(textArea);
  }
};

const handleRefreshMediaPlan = (segmentId: string, mediaSegmentId: string, mediaPlanId: string) => {
  const updatedProject = { ...props.project };
  const segment = updatedProject.segments.find(s => s.id === segmentId);
  const mediaSegment = segment?.mediaSegments.find(ms => ms.id === mediaSegmentId);
  const mediaPlan = mediaSegment?.mediaPlans.find(mp => mp.id === mediaPlanId);
  
  if (mediaPlan) {
    mediaPlan.lastUploadedAt = new Date().toISOString().split('T')[0];
  }
  
  emit('update', updatedProject);
};
</script>

<style scoped>
/* Header - [Title] [Search 2/3 + Filters 1/3] [Button] */
.segments-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  min-width: 0;
}

.segments-title {
  flex-shrink: 0;
  /* inherits global h2: font-size 2em, same as other pages */
  font-weight: 600;
  color: #212121;
  margin: 0;
}

.segments-filters {
  flex: 1 1 0;
  min-width: 0;
  max-width: 100%;
  overflow: visible;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.add-segment-btn {
  flex-shrink: 0;
  flex-grow: 0;
}

/* Empty state */
.segments-empty {
  background-color: #FFFFFF;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  padding: 48px;
  text-align: center;
  border: 1px solid #E0E0E0;
}

.segments-empty-text {
  color: #757575;
  margin-bottom: 16px;
}

/* Table container */
.segments-table-container {
  background-color: #FFFFFF;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  border: 1px solid #E0E0E0;
}

.segments-table {
  width: 100%;
  font-size: 14px;
  border-collapse: collapse;
}

.segments-table-header {
  background-color: #FAFAFA;
  border-bottom: 1px solid #E0E0E0;
}

.segments-table-th {
  padding: 8px 12px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #757575;
}

.segments-table-body {
  border-collapse: collapse;
}

.segments-table-row {
  border-bottom: 1px solid #F5F5F5;
}

.segments-table-row:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.segments-table-td {
  padding: 8px;
  vertical-align: top;
  font-size: 14px;
}

/* Column backgrounds matching React: bg-primary-50/30, bg-secondary-50/30, bg-warning-50/30 */
.segments-table-td-team {
  background-color: rgba(227, 242, 253, 0.3); /* primary-50 at 30% */
  font-size: 14px;
  font-weight: 500;
}

.segments-table-td-segment {
  background-color: rgba(243, 229, 245, 0.3); /* secondary-50 at 30% */
  font-size: 14px;
  font-weight: 500;
}

.segments-table-td-media {
  background-color: rgba(255, 248, 225, 0.3); /* warning-50 at 30% */
}

.segments-table-segment-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.segments-table-edit-btn {
  background-color: transparent;
  border: none;
  color: #757575;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.segments-table-edit-btn:hover {
  color: #424242;
}

.segments-table-media-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.segments-table-media-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.segments-table-media-type {
  font-size: 14px;
  font-weight: 500;
}

.segments-table-media-budget {
  font-size: 12px;
  color: #757575;
  font-weight: 500;
}

.segments-table-media-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #757575;
  text-decoration: none;
}

.segments-table-media-link:hover {
  color: #1E88E5;
  text-decoration: underline;
}

.segments-table-order-code {
  font-family: monospace;
  font-weight: 500;
  font-size: 11px;
  color: #757575;
}

.segments-table-order-code-clickable {
  cursor: pointer;
  transition: color 0.2s;
}

.segments-table-order-code-clickable:hover {
  color: #1E88E5;
  text-decoration: underline;
}

.segments-table-upload-date {
  font-size: 12px;
  color: #757575;
}

.segments-table-launch-tasks {
  margin-top: 4px;
}

.segments-table-launch-tasks {
  margin-top: 4px;
  display: grid;
  grid-template-columns: repeat(4, max-content);
  gap: 4px;
  row-gap: 2px;
  max-width: 100%;
}

.segments-table-launch-task-link {
  display: inline-block;
  font-size: 10px;
  color: #1E88E5;
  text-decoration: none;
  white-space: nowrap;
}

.segments-table-launch-task-link:hover {
  text-decoration: underline;
}

.segments-table-launch-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #4CAF50;
  background-color: transparent;
  border: none;
  cursor: pointer;
  margin-top: 8px;
  text-decoration: none;
}

.segments-table-launch-btn:hover {
  color: #388E3C;
  text-decoration: underline;
}

.segments-table-mp-content {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.segments-table-mp-name {
  font-size: 12px; /* text-xs - matching React */
  font-weight: 500;
  line-height: 1.2;
}

.segments-table-mp-date {
  font-size: 10px;
  color: #BDBDBD;
}

.segments-table-mp-links {
  display: flex;
  gap: 12px;
  font-size: 12px;
  margin-top: 4px;
}

.segments-table-mp-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #757575;
  text-decoration: none;
}

.segments-table-mp-link:hover {
  color: #1E88E5;
  text-decoration: underline;
}

.segments-table-status {
  display: flex;
  align-items: center;
  gap: 6px;
}

.segments-table-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot-gray {
  background-color: #BDBDBD;
}

.status-dot-gray-light {
  background-color: #E0E0E0;
}

.status-dot-yellow {
  background-color: #FFC107;
}

.status-dot-green {
  background-color: #4CAF50;
}

.status-dot-red {
  background-color: #F44336;
}

.status-dot-orange {
  background-color: #FF9800;
}

.status-dot-blue {
  background-color: #2196F3;
}

.status-dot-cyan {
  background-color: #00BCD4;
}

.status-dot-purple {
  background-color: #9C27B0;
}

.segments-table-status-text {
  font-size: 12px;
  color: #424242;
  white-space: nowrap;
}

.segments-table-upload-date {
  font-size: 12px;
  color: #757575;
  white-space: nowrap;
}

.segments-table-empty {
  font-size: 12px;
  color: #BDBDBD;
}

.segments-table-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
}

.segments-table-actions-upload {
  width: 100%;
  margin-bottom: 4px;
}

.segments-table-actions-divider {
  border-top: 1px solid #E0E0E0;
  margin-top: 4px;
  margin-bottom: 4px;
}

.segments-table-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  background-color: transparent;
  border: none;
  cursor: pointer;
  text-decoration: none;
  font-weight: 500;
  margin-bottom: 4px;
}

.segments-table-action-btn-primary {
  color: #1E88E5;
}

.segments-table-action-btn-primary:hover {
  text-decoration: underline;
}

.segments-table-action-btn-success {
  color: #4CAF50;
}

.segments-table-action-btn-success:hover {
  color: #388E3C;
  text-decoration: underline;
}

.segments-table-action-btn-secondary {
  color: #757575;
}

.segments-table-action-btn-secondary:hover {
  color: #1E88E5;
  text-decoration: underline;
}

.segments-table-confirmation-task {
  font-size: 12px;
  color: #1E88E5;
  text-decoration: none;
  font-family: monospace;
}

.segments-table-confirmation-task:hover {
  text-decoration: underline;
}

.whitespace-nowrap {
  white-space: nowrap;
}

/* Mobile Card View */
.segments-cards-container {
  display: none;
}

.segments-table-desktop {
  display: block;
}

.segments-table-mobile {
  display: none;
}

.segments-card {
  background-color: #FFFFFF;
  border-radius: 0.5rem;
  border: 1px solid #E0E0E0;
  margin-bottom: 12px;
  overflow: hidden;
}

.segments-card-content-divider {
  border-top: 1px solid #F5F5F5;
  padding-top: 12px;
  margin-top: 12px;
}

.segments-card-header {
  padding: 12px;
  background-color: #FAFAFA;
  border-bottom: 1px solid #E0E0E0;
}

.segments-card-team {
  font-size: 12px;
  font-weight: 600;
  color: #1E88E5;
  margin-bottom: 4px;
}

.segments-card-segment {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 500;
  color: #7B1FA2;
  margin-bottom: 8px;
}

.segments-card-media {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
}

.segments-card-media-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.segments-card-media-type {
  font-weight: 500;
  color: #212121;
}

.segments-card-media-budget {
  font-size: 12px;
  color: #757575;
  font-weight: 500;
}

.segments-card-upload-date {
  font-size: 12px;
  color: #757575;
}

.segments-card-content {
  padding: 12px;
}

.segments-card-section {
  margin-bottom: 16px;
}

.segments-card-section:last-child {
  margin-bottom: 0;
}

.segments-card-label {
  font-size: 11px;
  font-weight: 600;
  color: #757575;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.segments-card-value {
  font-size: 12px;
  font-weight: 500;
  color: #212121;
  margin-bottom: 4px;
}

.segments-card-date {
  font-size: 12px;
  color: #BDBDBD;
}

.segments-card-statuses {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.segments-card-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #424242;
}

.segments-card-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.segments-card-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 0.5rem;
  border: none;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}

.segments-card-action-btn-primary {
  background-color: #1E88E5;
  color: #FFFFFF;
}

.segments-card-action-btn-primary:hover {
  background-color: #1976D2;
}

.segments-card-action-btn-success {
  background-color: #4CAF50;
  color: #FFFFFF;
}

.segments-card-action-btn-success:hover {
  background-color: #388E3C;
}

.segments-card-action-btn-secondary {
  background-color: #F5F5F5;
  color: #757575;
  border: 1px solid #E0E0E0;
}

.segments-card-action-btn-secondary:hover {
  background-color: #EEEEEE;
  color: #424242;
}

.segments-card-launch-tasks {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}

.segments-card-launch-task-link {
  display: inline-block;
  font-size: 11px;
  color: #1E88E5;
  text-decoration: none;
  white-space: nowrap;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: #E3F2FD;
  transition: all 0.2s;
}

.segments-card-launch-task-link:hover {
  background-color: #BBDEFB;
  text-decoration: none;
}

.segments-card-launch-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #4CAF50;
  background-color: transparent;
  border: none;
  cursor: pointer;
  margin-top: 8px;
  text-decoration: none;
  padding: 0;
}

.segments-card-launch-btn:hover {
  color: #388E3C;
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 768px) {
  .segments-table-desktop {
    display: none !important;
  }

  .segments-table-mobile {
    display: block !important;
  }

  .segments-header {
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 12px !important;
  }

  .segments-title {
    width: 100% !important;
    order: 0 !important;
  }

  .segments-filters {
    flex-direction: column !important;
    gap: 8px !important;
    display: flex !important;
    width: 100% !important;
    flex: none !important;
    overflow: visible !important;
    order: 1 !important;
    align-items: stretch !important;
  }

  .segments-filters .segments-search {
    width: 100% !important;
    flex: none !important;
    min-width: 100% !important;
    max-width: 100% !important;
    display: block !important;
    order: 1 !important;
  }

  .segments-filters .segments-filters-group {
    width: 100% !important;
    flex: none !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 8px !important;
    order: 2 !important;
  }

  .segments-filters-group .filter-select-team,
  .segments-filters-group .filter-select-media {
    width: 100% !important;
    flex: none !important;
    display: block !important;
  }

  .segments-header .add-segment-btn {
    width: 100% !important;
    justify-content: center !important;
    order: 2 !important;
    flex: none !important;
  }

  .segments-title {
    font-size: 1.375rem !important; /* 22px */
    line-height: 1.75rem !important; /* 28px */
  }
}

@media (min-width: 769px) {
  .segments-table-desktop {
    display: block !important;
  }

  .segments-table-mobile {
    display: none !important;
  }
}

/* Large screen typography - увеличенные размеры шрифтов для больших экранов */
@media (min-width: 1281px) {
  .segments-table {
    font-size: 16px;
  }

  .segments-table-th {
    font-size: 14px !important; /* увеличение с 12px */
    padding: 10px 14px !important;
  }

  .segments-table-td {
    font-size: 16px !important; /* увеличение с 14px */
    padding: 10px !important;
  }

  .segments-table-td-team,
  .segments-table-td-segment {
    font-size: 16px !important; /* увеличение с 14px */
  }

  .segments-table-media-type {
    font-size: 16px !important; /* увеличение с 14px */
  }

  .segments-table-media-budget {
    font-size: 14px !important; /* увеличение с 12px */
  }

  .segments-table-media-link {
    font-size: 14px !important; /* увеличение с 12px */
  }

  .segments-table-mp-name {
    font-size: 14px !important; /* увеличение с 12px */
  }

  .segments-table-mp-date {
    font-size: 12px !important; /* увеличение с 10px */
  }

  .segments-table-mp-links {
    font-size: 14px !important; /* увеличение с 12px */
  }

  .segments-table-mp-link {
    font-size: 14px !important; /* увеличение с 12px */
  }

  .segments-table-status-text {
    font-size: 14px !important; /* увеличение с 12px */
  }

  .segments-table-empty {
    font-size: 14px !important; /* увеличение с 12px */
  }

  .segments-table-order-code {
    font-size: 13px !important; /* увеличение с 11px */
  }

  .segments-table-launch-task-link {
    font-size: 12px !important; /* увеличение с 10px */
  }

  .segments-table-launch-btn {
    font-size: 14px !important; /* увеличение с 12px */
  }

  .segments-table-action-btn {
    font-size: 14px !important; /* увеличение с 12px */
  }

  .segments-table-confirmation-task {
    font-size: 14px !important; /* увеличение с 12px */
  }

  .segments-table-upload-date {
    font-size: 14px !important; /* увеличение с 12px */
  }
}
</style>
