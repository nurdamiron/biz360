// src/sections/sales/components/development-plan/GrowthPlanCard.jsx
import PropTypes from 'prop-types';
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
  alpha,
  Paper
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Заглушки для иконок
const Icons = {
  Target: '🎯',
  Trophy: '🏆',
  Medal: '🏅',
  Chart: '📈',
  Complete: '✓',
  Incomplete: '⭕',
  Star: '⭐',
  Calendar: '📅',
  Group: '👥',
  Certificate: '🎓'
};

// Компонент для отображения элемента требования
const RequirementItem = ({ icon, text, isCompleted }) => {
  const theme = useTheme();
  
  return (
    <ListItem 
      sx={{ 
        py: 1,
        px: 0
      }}
    >
      <ListItemIcon 
        sx={{ 
          minWidth: 36,
          color: isCompleted ? theme.palette.success.main : theme.palette.text.secondary
        }}
      >
        {isCompleted ? Icons.Complete : Icons.Incomplete}
      </ListItemIcon>
      <ListItemText 
        primary={
          <Typography 
            variant="body2" 
            sx={{ 
              color: isCompleted ? theme.palette.success.main : theme.palette.text.primary,
              fontWeight: isCompleted ? 'medium' : 'regular'
            }}
          >
            {text}
          </Typography>
        } 
      />
    </ListItem>
  );
};

RequirementItem.propTypes = {
  icon: PropTypes.node,
  text: PropTypes.string.isRequired,
  isCompleted: PropTypes.bool.isRequired
};

// Основной компонент плана роста
function GrowthPlanCard({ employee }) {
  const theme = useTheme();
  
  // Мок требований для повышения (в реальном приложении эти данные должны приходить с сервера)
  const requirements = [
    { id: 1, text: 'Поддерживать KPI > 85% в течение 3 месяцев', isCompleted: false },
    { id: 2, text: 'Пройти все рекомендуемые курсы', isCompleted: false },
    { id: 3, text: 'Подготовить 2 стажеров', isCompleted: false },
    { id: 4, text: 'Выполнить план на 95% в течение квартала', isCompleted: false }
  ];
  
  // Расчет прогресса до следующего уровня
  const progressToNextLevel = employee.progress_to_next_level || 0;
  
  // Мок уровней карьерного роста
  const careerLevels = [
    { id: 1, level: 'Junior', description: 'Начальный уровень' },
    { id: 2, level: 'Middle', description: 'Основной уровень', current: employee.level === 'Middle' },
    { id: 3, level: 'Senior', description: 'Продвинутый уровень', next: employee.level === 'Middle' },
    { id: 4, level: 'Team Lead', description: 'Уровень руководителя команды' }
  ];
  
  return (
    <Card sx={{ 
      boxShadow: theme.customShadows?.z8 || '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
      borderRadius: 2
    }}>
      <CardHeader 
        title="План роста" 
        subheader={`Для повышения до уровня ${employee.next_level}`}
      />
      <Divider />
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Прогресс до следующего уровня
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {progressToNextLevel}%
            </Typography>
          </Box>
          
          <LinearProgress 
            variant="determinate" 
            value={progressToNextLevel}
            sx={{ 
              height: 10, 
              borderRadius: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              '& .MuiLinearProgress-bar': {
                borderRadius: 1,
                bgcolor: theme.palette.primary.main
              }
            }}
          />
        </Box>
        
        <Typography variant="subtitle2" gutterBottom>
          Требования для повышения
        </Typography>
        
        <List sx={{ mb: 3 }}>
          {requirements.map((req) => (
            <RequirementItem 
              key={req.id}
              icon={Icons.Target}
              text={req.text}
              isCompleted={req.isCompleted}
            />
          ))}
        </List>
        
        <Typography variant="subtitle2" gutterBottom>
          Карьерный путь
        </Typography>
        
        <Stack spacing={2} sx={{ mt: 2 }}>
          {careerLevels.map((level) => (
            <Paper
              key={level.id}
              elevation={0}
              sx={{ 
                p: 2, 
                borderRadius: 2,
                bgcolor: level.current 
                  ? alpha(theme.palette.primary.main, 0.1)
                  : level.next
                    ? alpha(theme.palette.info.main, 0.05)
                    : 'background.default',
                border: `1px solid ${
                  level.current 
                    ? alpha(theme.palette.primary.main, 0.2)
                    : level.next
                      ? alpha(theme.palette.info.main, 0.1)
                      : theme.palette.divider
                }`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <Typography 
                    variant="subtitle2"
                    color={level.current ? 'primary.main' : 'text.primary'}
                  >
                    {level.level}
                  </Typography>
                  {level.current && (
                    <Box 
                      sx={{ 
                        ml: 1, 
                        px: 1, 
                        py: 0.25, 
                        borderRadius: 1,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        fontSize: '0.75rem',
                        fontWeight: 'medium'
                      }}
                    >
                      Текущий
                    </Box>
                  )}
                  {level.next && (
                    <Box 
                      sx={{ 
                        ml: 1, 
                        px: 1, 
                        py: 0.25, 
                        borderRadius: 1,
                        bgcolor: alpha(theme.palette.info.main, 0.1),
                        color: theme.palette.info.main,
                        fontSize: '0.75rem',
                        fontWeight: 'medium'
                      }}
                    >
                      Следующий
                    </Box>
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {level.description}
                </Typography>
              </Box>
              
              {level.current ? (
                <Box 
                  sx={{ 
                    color: theme.palette.primary.main,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    fontSize: '1.2rem'
                  }}
                >
                  {Icons.Star}
                </Box>
              ) : level.next ? (
                <Box 
                  sx={{ 
                    color: theme.palette.info.main,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.info.main, 0.1),
                    fontSize: '1.2rem'
                  }}
                >
                  {Icons.Trophy}
                </Box>
              ) : (
                <Box 
                  sx={{ 
                    color: theme.palette.text.disabled,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.text.disabled, 0.1),
                    fontSize: '1.2rem'
                  }}
                >
                  {Icons.Medal}
                </Box>
              )}
            </Paper>
          ))}
        </Stack>
        
        <Button 
          fullWidth 
          variant="outlined" 
          startIcon={Icons.Certificate}
          sx={{ mt: 3 }}
        >
          Подробнее о карьерном пути
        </Button>
      </CardContent>
    </Card>
  );
}

GrowthPlanCard.propTypes = {
  employee: PropTypes.object.isRequired
};

export { GrowthPlanCard };
export default GrowthPlanCard;
