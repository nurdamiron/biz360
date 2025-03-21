// src/sections/sales/components/index.js
// Экспорт базовых компонентов
export { default as ClientsList } from './ClientsList';
export { default as SalesPerformance } from './SalesPerformance';
export { default as PotentialBonuses } from './PotentialBonuses';
export { default as DevelopmentPlan } from './DevelopmentPlan';
export { default as LeadInteractionTracker } from './LeadInteractionTracker';

// Компоненты истории клиентов
export { ClientHistoryTable, ClientDetailsCard } from './client-history';

// Компоненты звонков
export { CallHistoryTable } from './calls';

// Компоненты планов продаж
export { SalesPlanDashboard } from './sales-plans';

// Подкомпоненты плана развития
export { default as CompetenciesCard } from './development-plan/CompetenciesCard';
export { default as EducationalPathCard } from './development-plan/EducationalPathCard';
export { default as GrowthPlanCard } from './development-plan/GrowthPlanCard';

// Экспорт подкомпонентов для взаимодействия с лидами
export * from './lead-interaction';
export * from './lead-distribution';