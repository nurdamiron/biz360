// src/sections/sales/components/lead-distribution/index.js
// Экспорт сервиса
export { 
    leadDistributionService, 
    fetchEmployees, 
    fetchLeads, 
    assignLead, 
    autoAssignLeads,
    addLead,
    updateLead,
    deleteLead,
    getDistributionStats
  } from './leadDistributionService';
  
  // Экспорт основных компонентов
  export { default as LeadDistributionBoard } from './LeadDistributionBoard';
  
  // Экспорт компонентов карточек и колонок
  export { default as LeadCard } from './LeadCard';
  export { default as EmployeeColumn } from './EmployeeColumn';
  export { default as UnassignedLeadsColumn } from './UnassignedLeadsColumn';
  
  // Экспорт вспомогательных компонентов
  export { default as DistributionStats } from './DistributionStats';
  export { default as FilterDialog } from './FilterDialog';
  export { default as AutoAssignSettingsDialog } from './AutoAssignSettingsDialog';
  export { default as AddLeadDialog } from './AddLeadDialog';