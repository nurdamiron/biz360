// src/sections/sales/components/lead-analytics/LeadSourcesPieChart.jsx
import PropTypes from 'prop-types';
import {
  Box,
  Card,
  Typography,
  CardHeader,
  CardContent,
  Divider,
  Skeleton,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  alpha
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

/**
 * Компонент для отображения источников лидов в виде круговой диаграммы
 */
const LeadSourcesPieChart = ({ data, isLoading, showDetails = false, title, subheader }) => {
  const theme = useTheme();
  
  // Если данные загружаются, показываем скелетон
  if (isLoading) {
    return (
      <Card
        sx={{
          borderRadius: 2,
          boxShadow: theme.shadows[8]
        }}
      >
        <CardHeader
          title={<Skeleton variant="text" width={200} />}
          subheader={<Skeleton variant="text" width={300} />}
        />
        <Divider />
        <CardContent>
          <Skeleton variant="circular" width={300} height={300} sx={{ mx: 'auto' }} />
        </CardContent>
      </Card>
    );
  }
  
  // Если данных нет, показываем сообщение
  if (!data || data.length === 0) {
    return (
      <Card
        sx={{
          borderRadius: 2,
          boxShadow: theme.shadows[8]
        }}
      >
        <CardHeader
          title={title || "Источники лидов"}
          subheader={subheader || "Распределение лидов по источникам"}
        />
        <Divider />
        <CardContent
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 300
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Нет данных для отображения
          </Typography>
        </CardContent>
      </Card>
    );
  }
  
  // Автоматическое определение цветов для источников
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.info.main,
    theme.palette.warning.main,
    theme.palette.success.main,
    theme.palette.error.main,
    theme.palette.secondary.main,
    theme.palette.info.dark,
    theme.palette.warning.dark,
    theme.palette.success.dark,
    theme.palette.primary.dark,
  ];
  
  // Кастомный тултип для диаграммы
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, value, percent, count } = payload[0].payload;
      return (
        <Box
          sx={{
            bgcolor: 'background.paper',
            p: 2,
            boxShadow: theme.shadows[3],
            borderRadius: 1,
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            {name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Доля: <strong>{`${(percent * 100).toFixed(1)}%`}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Количество: <strong>{count}</strong>
          </Typography>
          {value && (
            <Typography variant="body2" color="text.secondary">
              Стоимость: <strong>₽{value.toLocaleString()}</strong>
            </Typography>
          )}
        </Box>
      );
    }
    return null;
  };
  
  CustomTooltip.propTypes = {
    active: PropTypes.bool,
    payload: PropTypes.array
  };
  
  // Кастомный рендер для легенды
  const renderCustomizedLegend = ({ payload }) => (
    <List dense sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
      {payload.map((entry, index) => (
        <ListItem key={`item-${index}`} sx={{ width: 'auto', px: 1 }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              backgroundColor: entry.color,
              mr: 1,
              borderRadius: '50%'
            }}
          />
          <ListItemText
            primary={entry.value}
            primaryTypographyProps={{ variant: 'caption' }}
          />
        </ListItem>
      ))}
    </List>
  );
  
  renderCustomizedLegend.propTypes = {
    payload: PropTypes.array
  };
  
  // Основной контент компонента
  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: theme.shadows[8],
        height: '100%'
      }}
    >
      <CardHeader
        title={title || "Источники лидов"}
        subheader={subheader || "Распределение лидов по источникам"}
      />
      <Divider />
      <CardContent>
        {showDetails ? (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ height: 300, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      innerRadius={showDetails ? 40 : 0}
                      dataKey="percent"
                      nameKey="name"
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend content={renderCustomizedLegend} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Детальная статистика по источникам
              </Typography>
              <List sx={{ width: '100%' }}>
                {data
                  .sort((a, b) => b.percent - a.percent)
                  .map((source, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        mb: 1,
                        borderRadius: 1,
                        bgcolor: alpha(COLORS[index % COLORS.length], 0.05),
                        border: `1px solid ${alpha(COLORS[index % COLORS.length], 0.1)}`
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" fontWeight="medium">
                              {source.name}
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {(source.percent * 100).toFixed(1)}%
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              Количество лидов: {source.count}
                            </Typography>
                            {source.conversion && (
                              <Typography variant="caption" color="text.secondary">
                                Конверсия: {source.conversion}%
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
              </List>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Ключевые выводы:
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Основной источник лидов - <strong>{data.sort((a, b) => b.percent - a.percent)[0]?.name}</strong>,
                  который приносит <strong>{(data.sort((a, b) => b.percent - a.percent)[0]?.percent * 100).toFixed(1)}%</strong> от общего количества.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Рекомендуется уделить внимание источникам с высокой конверсией, но низким объемом лидов
                  для увеличения эффективности привлечения.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        ) : (
          <Box sx={{ height: 300, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  dataKey="percent"
                  nameKey="name"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend content={renderCustomizedLegend} />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

LeadSourcesPieChart.propTypes = {
  data: PropTypes.array,
  isLoading: PropTypes.bool,
  showDetails: PropTypes.bool,
  title: PropTypes.string,
  subheader: PropTypes.string
};

export default LeadSourcesPieChart;