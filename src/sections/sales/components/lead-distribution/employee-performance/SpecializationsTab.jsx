// src/sections/sales/components/lead-distribution/employee-performance/SpecializationsTab.jsx
import PropTypes from 'prop-types';
import {
  Box,
  Card,
  Grid,
  Stack,
  Typography,
  Chip,
  LinearProgress,
  Divider,
  Paper,
  alpha
} from '@mui/material';

// Material UI иконки (в комментариях показаны имена для импорта)
// import BusinessIcon from '@mui/icons-material/Business';
// import CategoryIcon from '@mui/icons-material/Category';
// import GroupsIcon from '@mui/icons-material/Groups';
// import LanguageIcon from '@mui/icons-material/Language';

/**
 * Компонент вкладки со специализациями сотрудника
 */
export default function SpecializationsTab({ theme, stats }) {
  
  // Тестовые данные, если не предоставлены реальные
  const mockSpecializations = {
    industries: [
      { name: 'IT', score: 85 },
      { name: 'Финансы', score: 78 },
      { name: 'Телекоммуникации', score: 65 }
    ],
    businessSizes: [
      { name: 'Крупный', score: 80 },
      { name: 'Средний', score: 90 },
      { name: 'Малый', score: 60 }
    ],
    leadSources: [
      { name: 'Сайт', score: 70 },
      { name: 'Выставка', score: 90 },
      { name: 'Рекомендация', score: 85 },
      { name: 'Партнер', score: 80 }
    ]
  };
  
  // Определяем источник данных (реальные или тестовые)
  const specializations = (stats && stats.specializations) 
    ? stats.specializations 
    : mockSpecializations;
  
  // Определение цвета для прогресс-бара в зависимости от оценки
  const getScoreColor = (score) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 60) return theme.palette.primary.main;
    if (score >= 40) return theme.palette.warning.main;
    return theme.palette.error.main;
  };
  
  return (
    <Grid container spacing={3}>
      {/* Отрасли */}
      <Grid item xs={12} md={6}>
        <Card sx={{ 
          height: '100%', 
          borderRadius: 2,
          boxShadow: 'none',
          border: `1px solid ${theme.palette.divider}`
        }}>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <Box 
              sx={{ 
                mr: 1.5, 
                display: 'flex',
                color: theme.palette.primary.main
              }}
            >
              🏢
            </Box>
            <Typography variant="subtitle1" fontWeight="medium">
              Отрасли
            </Typography>
          </Box>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Stack spacing={2.5}>
              {specializations.industries.map((industry, index) => (
                <Box key={index}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">{industry.name}</Typography>
                    <Typography variant="body2" color={getScoreColor(industry.score)} fontWeight="bold">
                      {industry.score}/100
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={industry.score}
                    sx={{ 
                      height: 6, 
                      borderRadius: 1,
                      bgcolor: alpha(getScoreColor(industry.score), 0.1),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 1,
                        bgcolor: getScoreColor(industry.score)
                      }
                    }}
                  />
                </Box>
              ))}
              
              {specializations.industries.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Нет данных о специализации по отраслям
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>
        </Card>
      </Grid>
      
      {/* Размеры бизнеса */}
      <Grid item xs={12} md={6}>
        <Card sx={{ 
          height: '100%', 
          borderRadius: 2,
          boxShadow: 'none',
          border: `1px solid ${theme.palette.divider}`
        }}>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <Box 
              sx={{ 
                mr: 1.5, 
                display: 'flex',
                color: theme.palette.info.main
              }}
            >
              👥
            </Box>
            <Typography variant="subtitle1" fontWeight="medium">
              Размеры бизнеса
            </Typography>
          </Box>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Stack spacing={2.5}>
              {specializations.businessSizes.map((size, index) => (
                <Box key={index}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">{size.name}</Typography>
                    <Typography variant="body2" color={getScoreColor(size.score)} fontWeight="bold">
                      {size.score}/100
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={size.score}
                    sx={{ 
                      height: 6, 
                      borderRadius: 1,
                      bgcolor: alpha(getScoreColor(size.score), 0.1),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 1,
                        bgcolor: getScoreColor(size.score)
                      }
                    }}
                  />
                </Box>
              ))}
              
              {specializations.businessSizes.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Нет данных о специализации по размерам бизнеса
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>
        </Card>
      </Grid>
      
      {/* Источники лидов */}
      <Grid item xs={12}>
        <Card sx={{ 
          borderRadius: 2,
          boxShadow: 'none',
          border: `1px solid ${theme.palette.divider}`
        }}>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <Box 
              sx={{ 
                mr: 1.5, 
                display: 'flex',
                color: theme.palette.warning.main
              }}
            >
              🌐
            </Box>
            <Typography variant="subtitle1" fontWeight="medium">
              Источники лидов
            </Typography>
          </Box>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
              {specializations.leadSources.map((source, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Paper
                    sx={{ 
                      p: 2, 
                      borderRadius: 2,
                      boxShadow: 'none',
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      bgcolor: alpha(getScoreColor(source.score), 0.05)
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
                      <Typography variant="body2" fontWeight="medium">
                        {source.name}
                      </Typography>
                      <Chip 
                        label={`${source.score}%`}
                        size="small"
                        sx={{ 
                          bgcolor: alpha(getScoreColor(source.score), 0.1),
                          color: getScoreColor(source.score),
                          fontWeight: 'bold',
                          height: 24
                        }}
                      />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={source.score}
                      sx={{ 
                        height: 4, 
                        borderRadius: 1,
                        bgcolor: alpha(getScoreColor(source.score), 0.1),
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 1,
                          bgcolor: getScoreColor(source.score)
                        }
                      }}
                    />
                  </Paper>
                </Grid>
              ))}
              
              {specializations.leadSources.length === 0 && (
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Нет данных о специализации по источникам лидов
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        </Card>
      </Grid>
      
      {/* Совместимость и рекомендации */}
      <Grid item xs={12}>
        <Paper 
          sx={{ 
            p: 2,
            borderRadius: 2,
            boxShadow: 'none',
            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
            bgcolor: alpha(theme.palette.info.main, 0.05)
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Рекомендации по распределению
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Сотрудник наиболее эффективен при работе с клиентами в сфере 
            <Typography component="span" fontWeight="bold" color="primary.main"> {specializations.industries[0]?.name || 'IT'}</Typography>, 
            размера <Typography component="span" fontWeight="bold" color="primary.main">{specializations.businessSizes[0]?.name || 'Средний'}</Typography>, 
            пришедших из источника <Typography component="span" fontWeight="bold" color="primary.main">{specializations.leadSources[0]?.name || 'Выставка'}</Typography>.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            При интеллектуальном распределении лидов система автоматически учитывает эти показатели для назначения наиболее подходящих лидов.
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
}

SpecializationsTab.propTypes = {
  theme: PropTypes.object.isRequired,
  stats: PropTypes.object
};