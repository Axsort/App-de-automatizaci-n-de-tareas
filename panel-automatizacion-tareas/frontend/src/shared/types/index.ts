export type Role = 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'VIEWER';

export type TriggerType = 'TASK_CREATED' | 'TASK_OVERDUE' | 'LOW_STOCK' | 'ORDER_DELAYED';
export type ConditionOperator = 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'CONTAINS';
export type ActionType = 'CHANGE_STATUS' | 'ASSIGN_RESPONSIBLE' | 'CREATE_NOTIFICATION' | 'LOG_AUDIT_EVENT';
export type ExecutionStatus = 'SUCCESS' | 'FAILED' | 'PARTIAL';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
  errors?: { field: string; message: string }[];
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: Role;
  active: boolean;
  mustChangePassword: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
    mustChangePassword: boolean;
  };
}

export interface AutomationCondition {
  id?: number;
  fieldName: string;
  operator: ConditionOperator;
  fieldValue: string;
  sortOrder?: number;
}

export interface AutomationAction {
  id?: number;
  actionType: ActionType;
  parameters: Record<string, unknown>;
  sortOrder?: number;
}

export interface Automation {
  id: number;
  name: string;
  description?: string;
  triggerType: TriggerType;
  active: boolean;
  createdById: number;
  createdByName: string;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  createdAt: string;
  updatedAt: string;
}

export interface Execution {
  id: number;
  automationRuleId: number;
  automationName: string;
  status: ExecutionStatus;
  message?: string;
  errorMessage?: string;
  executedById?: number;
  executedByName: string;
  executedAt: string;
}

export interface AuditLog {
  id: number;
  userId?: number;
  userEmail?: string;
  userName: string;
  action: string;
  resourceType?: string;
  resourceId?: number;
  ipAddress?: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

export interface DashboardData {
  activeAutomations: number;
  todayExecutions: number;
  activeUsers: number;
  todayFailures: number;
  recentFailures: Execution[];
  recentActivity: AuditLog[];
}
