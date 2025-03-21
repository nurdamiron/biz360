// src/sections/sales/components/lead-analytics/LeadMetricsCards.jsx
import PropTypes from 'prop-types';
import {
  Box,
  Grid,
  Card,
  Typography,
  CardContent,
  Stack,
  Divider,
  Skeleton,
  alpha
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

/**
 * Компонент отображения карточек с ключевыми метриками лидов
 */
const LeadMetricsCards = ({ metrics = {}, isLoading = false }) => {
  const theme = useTheme();
  
  // Если данные загружаются, показываем скелетоны
  if (isLoading) {
    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[...Array(4)].map((_, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Skeleton variant="rectangular" width="100%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="rectangular" width="70%" height={36} />
                <Skeleton variant="rectangular" width="90%" height={20} sx={{ mt: 1 }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }
  
  // Конфигурация метрик для отображения
  const metricCards = [
    {
      title: 'Всего лидов',
      value: metrics.total_leads || 0,
      subtitle: `+${metrics.new_leads_week || 0} за неделю`,
      icon: '📊',
      color: theme.palette.primary.main
    },
    {
      title: 'Лидов в работе',
      value: metrics.leads_in_progress || 0,
      subtitle: `${metrics.new_leads_today || 0} новых сегодня`,
      icon: '⏳',
      color: theme.palette.warning.main
    },
    {
      title: 'Конверсия',
      value: `${metrics.conversion_rate || 0}%`,
      subtitle: 'От лида до сделки',
      icon: '📈',
      color: theme.palette.info.main
    },
    {
      title: 'Цикл сделки',
      value: `${metrics.avg_deal_cycle || 0} дн.`,
      subtitle: `Среднее время до закрытия`,
      icon: '⏱️',
      color: theme.palette.success.main
    }
  ];
  
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {metricCards.map((card, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card
            sx={{
              height: '100%',
              borderRadius: 2,
              boxShadow: theme.shadows[2],
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: theme.shadows[8]
              }
            }}
          >
            <CardContent>
              <Stack
                direction="row"
                alignItems="flex-start"
                justifyContent="space-between"
                spacing={2}
              >
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    {card.title}
                  </Typography>
                  <Typography variant="h4" sx={{ mt: 1, mb: 0.5 }} fontWeight="bold">
                    {card.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {card.subtitle}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    bgcolor: alpha(card.color, 0.1),
                    color: card.color,
                    fontSize: '1.5rem'
                  }}
                >
                  {card.icon}
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

LeadMetricsCards.propTypes = {
  metrics: PropTypes.object,
  isLoading: PropTypes.bool
};

export default LeadMetricsCards;