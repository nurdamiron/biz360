// src/sections/sales/components/DevelopmentPlan.jsx
import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Grid,
  Card,
  Paper,
  Button,
  Container,
  Typography,
  LinearProgress,
  Divider,
  alpha
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Импортируем компоненты развития
import { CompetenciesCard } from './development-plan/CompetenciesCard';
import { EducationalPathCard } from './development-plan/EducationalPathCard';
import { GrowthPlanCard } from './development-plan/GrowthPlanCard';

export default function DevelopmentPlan({ employee }) {
  const theme = useTheme();
  const [activeItems, setActiveItems] = useState([]);
  
  // Обработчик переключения завершенности курса
  const handleToggleCourseComplete = (courseId) => {
    console.log(`Toggle course completion: ${courseId}`);
    // Здесь должен быть запрос к API для обновления статуса курса
    
    // Имитация изменения статуса (для демонстрации)
    if (employee?.development_plan?.required_courses) {
      const updatedCourses = employee.development_plan.required_courses.map(course => 
        course.id === courseId ? { ...course, completed: !course.completed } : course
      );
      
      // В реальном приложении здесь бы был запрос к API
      console.log('Updated courses:', updatedCourses);
    }
  };
  
  // Если данные сотрудника не загружены, показываем сообщение
  if (!employee) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Данные сотрудника загружаются...
        </Typography>
        <LinearProgress sx={{ mt: 2 }} />
      </Paper>
    );
  }
  
  return (
    <Grid container spacing={3}>
      {/* Заголовок */}
      <Grid item xs={12}>
        <Paper
          sx={{
            p: 3,
            mb: 2,
            borderRadius: 2,
            boxShadow: theme.customShadows?.z8
          }}
        >
          <Typography variant="h5" gutterBottom>
            План развития сотрудника
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Текущий уровень: <strong>{employee.level || 'Junior'}</strong> | 
            Прогресс до <strong>{employee.next_level || 'Middle'}</strong>: {employee.progress_to_next_level || 0}%
          </Typography>
          
          <LinearProgress 
            variant="determinate" 
            value={employee.progress_to_next_level || 0}
            sx={{ 
              mt: 2,
              height: 10, 
              borderRadius: 5,
              bgcolor: alpha(theme.palette.primary.main, 0.15),
              '& .MuiLinearProgress-bar': {
                bgcolor: theme.palette.primary.main
              }
            }}
          />
        </Paper>
      </Grid>
      
      {/* Компетенции */}
      <Grid item xs={12} md={6}>
        <CompetenciesCard competencies={employee.competencies} />
      </Grid>
      
      {/* Образовательная траектория */}
      <Grid item xs={12} md={6}>
        <EducationalPathCard 
          developmentPlan={employee.development_plan}
          onToggleCourseComplete={handleToggleCourseComplete}
        />
      </Grid>
      
      {/* План роста (если есть компонент) */}
      {typeof GrowthPlanCard !== 'undefined' && (
        <Grid item xs={12}>
          <GrowthPlanCard employee={employee} />
        </Grid>
      )}
    </Grid>
  );
}

DevelopmentPlan.propTypes = {
  employee: PropTypes.object
};

// Добавляем значения по умолчанию для пропсов
DevelopmentPlan.defaultProps = {
  employee: {
    level: 'Junior',
    next_level: 'Middle',
    progress_to_next_level: 0,
    competencies: {
      product_knowledge: 0,
      sales_skills: 0,
      objection_handling: 0,
      documentation: 0
    },
    development_plan: {
      completed_courses: 0,
      total_courses: 0,
      required_courses: []
    }
  }
};