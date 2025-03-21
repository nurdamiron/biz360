// src/sections/sales/components/index.js
// Базовые компоненты
export { default as ClientsList } from './ClientsList';
export { default as SalesPerformance } from './SalesPerformance';
export { default as PotentialBonuses } from './PotentialBonuses';
export { default as DevelopmentPlan } from './DevelopmentPlan';
export { default as LeadInteractionTracker } from './LeadInteractionTracker';

// Компоненты истории клиентов
export { default as ClientHistoryTable } from './client-history/ClientHistoryTable';
export { default as ClientDetailsCard } from './client-history/ClientDetailsCard';

// Компоненты звонков
export { default as CallHistoryTable } from './calls/CallHistoryTable';

// Компоненты планов продаж
export { default as SalesPlanDashboard } from './sales-plans/SalesPlanDashboard';

// Подкомпоненты плана развития
export { default as CompetenciesCard } from './development-plan/CompetenciesCard';
export { default as EducationalPathCard } from './development-plan/EducationalPathCard';
export { default as GrowthPlanCard } from './development-plan/GrowthPlanCard';

// Экспорт подкомпонентов для взаимодействия с лидами
export * from './lead-interaction';

// Экспорт новых улучшенных компонентов распределения лидов
export { 
  LeadDistributionBoard,
  LeadCard,
  EmployeeColumn,
  UnassignedLeadsColumn,
  DistributionStats,
  FilterDialog,
  SmartAssignSettingsDialog,
  AddLeadDialog,
  // Сервисы
  leadDistributionService,
  fetchEmployees,
  fetchLeads,
  assignLead,
  autoAssignLeads,
  addLead,
  updateLead,
  deleteLead,
  getDistributionStats
} from './lead-distribution';