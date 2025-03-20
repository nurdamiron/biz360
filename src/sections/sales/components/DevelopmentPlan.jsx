// src/sections/sales/components/DevelopmentPlan.jsx
import PropTypes from 'prop-types';
import { useState } from 'react';
import {
  Box,
  Grid,
  Button,
  Alert,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Импорт подкомпонентов
import { CompetenciesCard } from './development-plan/CompetenciesCard';
import { EducationalPathCard } from './development-plan/EducationalPathCard';
import { GrowthPlanCard } from './development-plan/GrowthPlanCard';

// Основной компонент для отображения плана развития
function DevelopmentPlan({ employee }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Функция для переключения статуса завершения курса
  const handleToggleCourseComplete = (courseId) => {
    console.log('Toggle course completion', courseId);
    // В реальном приложении здесь будет запрос к API для обновления статуса курса
  };
  
  return (
    <Grid container spacing={3}>
      {/* Карточка компетенций */}
      <Grid item xs={12} md={6}>
        <CompetenciesCard competencies={employee.competencies} />
      </Grid>
      
      {/* Карточка образовательной траектории */}
      <Grid item xs={12} md={6}>
        <EducationalPathCard 
          developmentPlan={employee.development_plan}
          onToggleCourseComplete={handleToggleCourseComplete}
        />
      </Grid>
      
      {/* Карточка плана роста */}
      <Grid item xs={12}>
        <GrowthPlanCard employee={employee} />
      </Grid>
      
      {/* Уведомление о необходимости согласования плана развития */}
      <Grid item xs={12}>
        <Alert 
          severity="info"
          sx={{ 
            borderRadius: 2,
            boxShadow: theme.customShadows?.z8 || '0 8px 16px 0 rgba(145, 158, 171, 0.16)'
          }}
          action={
            <Button color="info" size="small">
              Запросить встречу
            </Button>
          }
        >
          Для более детального обсуждения вашего плана развития и согласования индивидуальной траектории роста рекомендуется запланировать встречу с руководителем.
        </Alert>
      </Grid>
    </Grid>
  );
}

DevelopmentPlan.propTypes = {
  employee: PropTypes.object.isRequired
};

export default DevelopmentPlan;
