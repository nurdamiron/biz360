// src/sections/sales/components/lead-distribution/employee-performance/CompetenciesTab.jsx
import PropTypes from 'prop-types';
import {
  Box,
  Grid,
  Card,
  Stack,
  Typography,
  LinearProgress,
  CircularProgress,
  Divider,
  Chip,
  alpha,
  Tooltip
} from '@mui/material';
import { motion } from 'framer-motion';

// Material UI иконки
import BusinessIcon from '@mui/icons-material/Business';
import SellIcon from '@mui/icons-material/Sell';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import DescriptionIcon from '@mui/icons-material/Description';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

/**
 * Вкладка компетенций сотрудника в модальном окне профиля
 */
export default function CompetenciesTab({ theme, stats }) {
  // Используем моковые данные, если реальные данные не предоставлены
  const competencies = stats?.competencies || {
    product_knowledge: 82,
    sales_skills: 78,
    objection_handling: 75,
    documentation: 90
  };
  
  // Тренды для каждой компетенции (моковые данные)
  const competencyTrends = stats?.competencyTrends || {
    product_knowledge: 5,
    sales_skills: 3,
    objection_handling: -2,
    documentation: 7
  };
  
  // Информация о компетенциях
  const competencyInfo = {
    product_knowledge: {
      title: 'Знание продуктов',
      icon: <BusinessIcon />,
      color: theme.palette.primary.main,
      description: 'Знание особенностей, преимуществ и недостатков продуктов компании'
    },
    sales_skills: {
      title: 'Навыки продаж',
      icon: <SellIcon />,
      color: theme.palette.info.main,
      description: 'Навыки проведения презентаций, выявления потребностей и закрытия сделок'
    },
    objection_handling: {
      title: 'Работа с возражениями',
      icon: <QuestionAnswerIcon />,
      color: theme.palette.warning.main,
      description: 'Умение эффективно отвечать на вопросы и преодолевать сопротивление клиентов'
    },
    documentation: {
      title: 'Оформление документации',
      icon: <DescriptionIcon />,
      color: theme.palette.success.main,
      description: 'Качество и скорость подготовки коммерческих предложений и договоров'
    }
  };
  
  // Получение цвета для уровня компетенции
  const getCompetencyColor = (value) => {
    if (value >= 80) return theme.palette.success.main;
    if (value >= 60) return theme.palette.info.main;
    if (value >= 40) return theme.palette.warning.main;
    return theme.palette.error.main;
  };
  
  // Получение текста для уровня компетенции
  const getCompetencyLevel = (value) => {
    if (value >= 90) return 'Эксперт';
    if (value >= 80) return 'Продвинутый';
    if (value >= 60) return 'Средний';
    if (value >= 40) return 'Базовый';
    return 'Начальный';
  };
  
  // Анимации для элементов
  const containerAnimation = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24
      }
    }
  };
  
  // Вычисление средней компетенции
  const averageCompetency = Object.values(competencies).reduce((sum, value) => sum + value, 0) / Object.keys(competencies).length;
  
  return (
    <Box>
      <Box
        component={motion.div}
        variants={containerAnimation}
        initial="hidden"
        animate="visible"
      >
        {/* Средняя компетенция */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Общий уровень компетенции
          </Typography>
          
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <CircularProgress
              variant="determinate"
              value={100}
              size={120}
              thickness={4}
              sx={{ color: alpha(theme.palette.primary.main, 0.1) }}
            />
            <CircularProgress
              variant="determinate"
              value={averageCompetency}
              size={120}
              thickness={4}
              sx={{
                color: getCompetencyColor(averageCompetency),
                position: 'absolute',
                left: 0,
                top: 0,
                '& .MuiCircularProgress-circle': {
                  strokeLinecap: 'round'
                }
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column'
              }}
            >
              <Typography
                variant="h3"
                component="div"
                color={getCompetencyColor(averageCompetency)}
                fontWeight="bold"
              >
                {Math.round(averageCompetency)}%
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                {getCompetencyLevel(averageCompetency)}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {/* Подробные компетенции */}
        <Typography variant="h6" gutterBottom>
          Детализация компетенций
        </Typography>
        
        <Grid container spacing={3}>
          {Object.entries(competencies).map(([key, value], index) => {
            const info = competencyInfo[key];
            const trendValue = competencyTrends[key] || 0;
            const color = getCompetencyColor(value);
            
            return (
              <Grid item xs={12} md={6} key={key}>
                <Card
                  component={motion.div}
                  variants={itemAnimation}
                  sx={{
                    p: 2,
                    boxShadow: 'none',
                    border: `1px solid ${alpha(color, 0.2)}`,
                    borderRadius: 2,
                    bgcolor: alpha(color, 0.05)
                  }}
                >
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            bgcolor: alpha(info.color, 0.1),
                            color: info.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {info.icon}
                        </Box>
                        <Typography variant="subtitle1">{info.title}</Typography>
                      </Stack>
                      
                      <Tooltip title="Изменение за последний месяц">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {trendValue > 0 ? (
                            <TrendingUpIcon fontSize="small" color="success" />
                          ) : trendValue < 0 ? (
                            <TrendingDownIcon fontSize="small" color="error" />
                          ) : null}
                          
                          <Typography
                            variant="body2"
                            color={trendValue > 0 ? 'success.main' : trendValue < 0 ? 'error.main' : 'text.secondary'}
                            fontWeight="medium"
                            sx={{ ml: 0.5 }}
                          >
                            {trendValue > 0 ? `+${trendValue}%` : trendValue < 0 ? `${trendValue}%` : '0%'}
                          </Typography>
                        </Box>
                      </Tooltip>
                    </Box>
                    
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Chip
                          label={getCompetencyLevel(value)}
                          size="small"
                          sx={{
                            bgcolor: alpha(color, 0.1),
                            color: color,
                            fontWeight: 'medium'
                          }}
                        />
                        <Typography variant="h6" fontWeight="bold" color={color}>
                          {value}%
                        </Typography>
                      </Box>
                      
                      <LinearProgress
                        variant="determinate"
                        value={value}
                        sx={{
                          height: 8,
                          borderRadius: 2,
                          bgcolor: alpha(color, 0.1),
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 2,
                            bgcolor: color
                          }
                        }}
                      />
                    </Box>
                    
                    <Tooltip title={info.description} placement="top" arrow>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          {info.description}
                        </Typography>
                        <HelpOutlineIcon fontSize="small" color="action" sx={{ ml: 0.5 }} />
                      </Box>
                    </Tooltip>
                  </Stack>
                </Card>
              </Grid>
            );
          })}
        </Grid>
        
        {/* Рекомендации */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Рекомендации по развитию
          </Typography>
          
          <Card
            component={motion.div}
            variants={itemAnimation}
            sx={{
              p: 2,
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.info.main, 0.05)
            }}
          >
            <Typography variant="body2" paragraph>
              На основе анализа компетенций сотрудника рекомендуется:
            </Typography>
            
            <Stack spacing={1}>
              {/* Динамически формируем рекомендации на основе самой низкой компетенции */}
              {(() => {
                const lowestCompetency = Object.entries(competencies).reduce(
                  (lowest, [key, value]) => (value < lowest.value ? { key, value } : lowest),
                  { key: '', value: Infinity }
                );
                
                const recommendations = [];
                
                if (lowestCompetency.key) {
                  const info = competencyInfo[lowestCompetency.key];
                  recommendations.push(
                    <Typography key="lowest" variant="body2">
                      • Повысить уровень компетенции &quot;{info.title}&quot; через дополнительное обучение и практику
                    </Typography>
                  );
                }
                
                // Добавляем общие рекомендации
                recommendations.push(
                  <Typography key="general1" variant="body2">
                    • Участвовать в тренингах по продуктам для улучшения знания особенностей и преимуществ
                  </Typography>
                );
                
                recommendations.push(
                  <Typography key="general2" variant="body2">
                    • Практиковать навыки работы с возражениями через ролевые игры и обмен опытом с коллегами
                  </Typography>
                );
                
                return recommendations;
              })()}
            </Stack>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}

CompetenciesTab.propTypes = {
  theme: PropTypes.object.isRequired,
  stats: PropTypes.object
};