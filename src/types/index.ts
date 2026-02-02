export interface Client {
  id: string;
  name: string;
}

export interface Brand {
  id: string;
  name: string;
  clientId: string;
}

export interface Person {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  email?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  email?: string;
}

export interface Team {
  id: string;
  name: string;
  members: TeamMember[];
  isDefault?: boolean;
  clientId: string;
}

export type ApprovalType = 'Документ' | 'Строками';
export type AmountDisplay = 'С НДС' | 'Без НДС';

export interface OrderParameters {
  productionAsset?: string;
  contractType?: string;
  agencyLegalEntity?: string;
  clientLegalEntity?: string;
  contract?: string;
}

export interface ProjectSettings {
  period: {
    start: string;
    end: string;
  };
  approvalType: ApprovalType;
  amountDisplay: AmountDisplay;
  orderParameters: OrderParameters;
}

export type MediaType = 'Outdoor' | 'ТВ' | 'Радио' | 'Интернет' | 'НСТ';

export type StatusRA = 'В работе РА' | 'В работе у клиента' | 'Согласовано' | 'На доработку' | 'Заказ' | 'Отказ';
export type StatusClient = 'Согласование' | 'Согласовано' | 'На доработку' | 'Отказ' | '—';

export interface MediaPlan {
  id: string;
  name: string;
  clientSheetUrl: string;
  raSheetUrl: string;
  statusRA: StatusRA;
  statusClient: StatusClient;
  createdAt: string;
  lastUploadedAt: string;
  confirmationTaskId?: string;
}

export interface MediaSegment {
  id: string;
  mediaType: MediaType;
  budget: number;
  raDocumentUrl: string;
  clientDocumentUrl: string;
  summarySheetUrl?: string;
  orderCode?: string;
  launchTasks: Array<{ id: string; period: string }>;
  mediaPlans: MediaPlan[];
}

export interface Segment {
  id: string;
  name: string;
  teamId: string;
  mediaSegments: MediaSegment[];
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  brandId?: string;
  settings: ProjectSettings;
  segments: Segment[];
}