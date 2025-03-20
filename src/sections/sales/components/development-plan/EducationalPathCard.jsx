// src/sections/sales/components/development-plan/EducationalPathCard.jsx
import PropTypes from 'prop-types';
import { useState } from 'react';
import {
  Box,
  Card,
  Stack,
  Button,
  Divider,
  Typography,
  CardHeader,
  CardContent,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  IconButton,
  alpha,
  Chip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Заглушки для иконок
const Icons = {
  Play: '▶️',
  Time: '⏱️',
  Certificate: '🎓',
  Book: '📚',
  Check: '✓',
  Download: '📥',
  Lock: '🔒',
  Calendar: '📅',
  Filter: '🔍',
  Sort: '↕️'
};

// Компонент для отображения одного курса
const CourseItem = ({ course, onToggleComplete }) => {
  const theme = useTheme();
  
  return (
    <ListItem
      secondaryAction={
        <IconButton 
          edge="end" 
          aria-label="начать курс"
          sx={{ color: theme.palette.primary.main }}
        >
          {Icons.Play}
        </IconButton>
      }
      disablePadding
      sx={{ 
        py: 1.5,
        borderRadius: 1,
        mb: 1,
        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) }
      }}
    >
      <ListItemIcon sx={{ minWidth: 42 }}>
        <Checkbox
          edge="start"
          checked={course.completed}
          onChange={() => onToggleComplete(course.id)}
          sx={{
            '&.Mui-checked': {
              color: theme.palette.success.main,
            }
          }}
        />
      </ListItemIcon>
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography 
              variant="body2" 
              fontWeight="medium"
              sx={{ 
                textDecoration: course.completed ? 'line-through' : 'none',
                color: course.completed ? 'text.disabled' : 'text.primary',
                mr: 1
              }}
            >
              {course.title}
            </Typography>
            {course.completed && (
              <Chip 
                label="Завершен" 
                size="small" 
                color="success" 
                variant="outlined"
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            )}
          </Box>
        }
        secondary={
          <Typography variant="caption" component="div" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
            <Box component="span" sx={{ mr: 0.5, display: 'flex', alignItems: 'center' }}>
              {Icons.Time}
            </Box>
            Длительность: {course.duration} {course.duration === 1 ? 'час' : course.duration < 5 ? 'часа' : 'часов'}
          </Typography>
        }
      />
    </ListItem>
  );
};

CourseItem.propTypes = {
  course: PropTypes.object.isRequired,
  onToggleComplete: PropTypes.func.isRequired
};

// Основной компонент образовательной траектории
function EducationalPathCard({ developmentPlan, onToggleCourseComplete }) {
  const theme = useTheme();
  
  // Прогресс по курсам
  const coursesProgress = (developmentPlan.completed_courses / developmentPlan.total_courses) * 100;
  
  return (
    <Card sx={{ 
      boxShadow: theme.customShadows?.z8 || '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
      borderRadius: 2,
      height: '100%' 
    }}>
      <CardHeader 
        title="Образовательная траектория" 
        subheader="Рекомендуемые курсы для вашего уровня"
        action={
          <Button
            size="small"
            startIcon={Icons.Filter}
            variant="outlined"
          >
            Все курсы
          </Button>
        }
      />
      <Divider />
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Прогресс по курсам
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {Math.round(coursesProgress)}%
            </Typography>
          </Box>
          
          <LinearProgress 
            variant="determinate" 
            value={Math.min(coursesProgress, 100)}
            sx={{ 
              height: 8, 
              borderRadius: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              '& .MuiLinearProgress-bar': {
                borderRadius: 1,
                bgcolor: theme.palette.primary.main
              }
            }}
          />
          
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Завершено {developmentPlan.completed_courses} из {developmentPlan.total_courses} для текущего уровня
          </Typography>
        </Box>
        
        <Typography variant="subtitle2" gutterBottom>
          Рекомендуемые курсы
        </Typography>
        
        <List sx={{ p: 0 }}>
          {developmentPlan.required_courses.map((course) => (
            <CourseItem 
              key={course.id} 
              course={course} 
              onToggleComplete={onToggleCourseComplete} 
            />
          ))}
        </List>
        
        <Button 
          fullWidth 
          variant="outlined" 
          startIcon={Icons.Book}
          sx={{ mt: 2 }}
        >
          Все доступные курсы
        </Button>
      </CardContent>
    </Card>
  );
}

EducationalPathCard.propTypes = {
  developmentPlan: PropTypes.object.isRequired,
  onToggleCourseComplete: PropTypes.func.isRequired
};

export { EducationalPathCard };
export default EducationalPathCard;