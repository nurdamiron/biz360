// src/sections/sales/components/development-plan/CompetenciesCard.jsx
import PropTypes from 'prop-types';
import {
  Box,
  Card,
  Stack,
  Divider,
  Typography,
  CardHeader,
  CardContent,
  LinearProgress,
  alpha
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Заглушки для иконок
const Icons = {
  Product: '📦',
  Sales: '🤝',
  Objection: '🛡️',
  Documentation: '📄',
  Info: 'ℹ️'
};

// Компонент для отображения компетенций сотрудника
function CompetenciesCard({ competencies = {} }) {
  const theme = useTheme();
  
  // Соответствие ключей компетенций иконкам и названиям
  const competencyMap = {
    product_knowledge: {
      title: 'Знание продуктов',
      icon: Icons.Product,
      color: theme.palette.primary.main
    },
    sales_skills: {
      title: 'Навыки продаж',
      icon: Icons.Sales,
      color: theme.palette.info.main
    },
    objection_handling: {
      title: 'Работа с возражениями',
      icon: Icons.Objection,
      color: theme.palette.warning.main
    },
    documentation: {
      title: 'Оформление документации',
      icon: Icons.Documentation,
      color: theme.palette.success.main
    }
  };
  
  // Создаем массив компетенций для отображения
  // Если competencies пусто, используем значения по умолчанию
  const competenciesEntries = competencies 
    ? Object.entries(competencies) 
    : Object.keys(competencyMap).map(key => [key, 0]);
  
  // Если нет компетенций даже после дефолтных значений, показываем стандартные
  const hasCompetencies = competenciesEntries.length > 0;
  
  // Если нет компетенций, используем значения по умолчанию
  const defaultCompetencies = hasCompetencies 
    ? [] 
    : [
        ['product_knowledge', 0],
        ['sales_skills', 0],
        ['objection_handling', 0],
        ['documentation', 0]
      ];
  
  // Используем компетенции или дефолтные значения
  const displayCompetencies = hasCompetencies ? competenciesEntries : defaultCompetencies;
  
  return (
    <Card sx={{ 
      boxShadow: theme.customShadows?.z8 || '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
      borderRadius: 2,
      height: '100%'
    }}>
      <CardHeader 
        title="Мои компетенции" 
        subheader="Уровень текущих навыков и знаний"
      />
      <Divider />
      <CardContent>
        {!hasCompetencies && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Данные о компетенциях загружаются или недоступны.
          </Typography>
        )}
        
        <Stack spacing={3}>
          {displayCompetencies.map(([key, value]) => {
            const competency = competencyMap[key] || {
              title: key,
              icon: Icons.Info,
              color: theme.palette.grey[500]
            };
            
            return (
              <Box key={key}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ 
                      mr: 1.5, 
                      display: 'flex', 
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: alpha(competency.color, 0.1),
                      color: competency.color,
                      fontSize: '1rem'
                    }}>
                      {competency.icon}
                    </Box>
                    <Typography variant="body2" fontWeight="medium">
                      {competency.title}
                    </Typography>
                  </Box>
                  <Typography 
                    variant="body2" 
                    fontWeight="bold"
                    color={value >= 80 ? 'success.main' : value >= 60 ? 'warning.main' : 'error.main'}
                  >
                    {value}%
                  </Typography>
                </Box>
                
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(value || 0, 100)}
                  sx={{ 
                    height: 8, 
                    borderRadius: 1,
                    bgcolor: alpha(competency.color, 0.1),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 1,
                      bgcolor: competency.color
                    }
                  }}
                />
              </Box>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}

CompetenciesCard.propTypes = {
  competencies: PropTypes.object
};

CompetenciesCard.defaultProps = {
  competencies: {
    product_knowledge: 0,
    sales_skills: 0,
    objection_handling: 0,
    documentation: 0
  }
};

export { CompetenciesCard };
export default CompetenciesCard;