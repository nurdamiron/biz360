// src/sections/sales/components/lead-distribution/EmployeePerformanceModal.jsx
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  Divider,
  Avatar,
  Chip,
  IconButton,
  Tabs,
  Tab,
  alpha
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useState } from 'react';
import { motion } from 'framer-motion';

// Импортируем иконки
import CloseIcon from '@mui/icons-material/Close';
import WorkIcon from '@mui/icons-material/Work';
import BuildIcon from '@mui/icons-material/Build';
import CategoryIcon from '@mui/icons-material/Category';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AssessmentIcon from '@mui/icons-material/Assessment';

// Импортируем подкомпоненты
import EmployeeHeader from './employee-performance/EmployeeHeader';
import EmployeeMetrics from './employee-performance/EmployeeMetrics';
import CompetenciesTab from './employee-performance/CompetenciesTab';
import SpecializationsTab from './employee-performance/SpecializationsTab';
import CurrentLeadsTab from './employee-performance/CurrentLeadsTab';
import DealsHistoryTab from './employee-performance/DealsHistoryTab';

// Анимации для элементов
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
};

/**
 * Модальное окно с детальной информацией о производительности сотрудника
 */
export default function EmployeePerformanceModal({ open, onClose, employee, stats, leads }) {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  if (!employee) return null;
  
  // Форматирование суммы
  const formatCurrency = (amount) => {
    new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Расчет нагрузки
  const capacity = employee.capacity || 10;
  const currentLoad = leads?.length || 0;
  const loadPercentage = Math.min(100, (currentLoad / capacity) * 100);
  
  // Получение общей суммы потенциальных сделок
  const totalPotentialAmount = leads?.reduce((sum, lead) => sum + lead.potential_amount, 0) || 0;
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">
            Профиль сотрудника
          </Typography>
          <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box
          component={motion.div}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Основная информация о сотруднике */}
          <Card 
            component={motion.div}
            variants={itemVariants}
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              boxShadow: theme.shadows[4],
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Заголовок профиля с основной информацией о сотруднике */}
            <EmployeeHeader 
              employee={employee} 
              theme={theme} 
            />
            
            {/* Метрики сотрудника */}
            <EmployeeMetrics 
              loadPercentage={loadPercentage}
              currentLoad={currentLoad}
              capacity={capacity}
              stats={stats}
              totalPotentialAmount={totalPotentialAmount}
              formatCurrency={formatCurrency}
              theme={theme}
            />
          </Card>
          
          {/* Вкладки с дополнительной информацией */}
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{ mb: 2 }}
          >
            <Tab 
              label="Компетенции" 
              icon={<BuildIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Специализации" 
              icon={<CategoryIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Текущие лиды" 
              icon={<AssignmentTurnedInIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="История сделок" 
              icon={<AssessmentIcon />} 
              iconPosition="start"
            />
          </Tabs>
          
          {/* Содержимое вкладок */}
          <Box sx={{ mb: 3 }}>
            {/* Вкладка "Компетенции" */}
            {activeTab === 0 && (
              <CompetenciesTab theme={theme} />
            )}
            
            {/* Вкладка "Специализации" */}
            {activeTab === 1 && (
              <SpecializationsTab theme={theme} stats={stats} />
            )}
            
            {/* Вкладка "Текущие лиды" */}
            {activeTab === 2 && (
              <CurrentLeadsTab 
                theme={theme} 
                leads={leads} 
                formatCurrency={formatCurrency} 
              />
            )}
            
            {/* Вкладка "История сделок" */}
            {activeTab === 3 && (
              <DealsHistoryTab 
                theme={theme} 
                formatCurrency={formatCurrency}
                stats={stats}
              />
            )}
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button variant="outlined" onClick={onClose}>
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
}

EmployeePerformanceModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  employee: PropTypes.object,
  stats: PropTypes.object,
  leads: PropTypes.array
};