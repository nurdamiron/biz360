// src/sections/sales/components/lead-analytics/LeadsByStatusChart.jsx
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
  alpha
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

/**
 * Компонент для отображения распределения лидов по статусам
 */
const LeadsByStatusChart = ({ data, isLoading, title, subheader }) => {
  const theme = useTheme();
  
  // Цвета для разных статусов лидов
  const getStatusColor = (status) => {
    const statusColors = {
      'Новый': theme.palette.info.main,
      'В работе': theme.palette.warning.main,
      'Квалифицирован': theme.palette.primary.main,
      'Согласование КП': theme.palette.secondary.main,
      'Переговоры': theme.palette.success.main,
      'Подписание': theme.palette.success.dark,
      'Закрыт (успех)': theme.palette.success.main,
      'Закрыт (неудача)': theme.palette.error.main,
      'Отложен': theme.palette.grey[500]
    };
    
    return statusColors[status] || theme.palette.grey[400];
  };
  
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
          <Skeleton variant="rectangular" height={400} />
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
          title={title || "Распределение лидов по статусам"}
          subheader={subheader || "Количество лидов в каждом статусе воронки"}
        />
        <Divider />
        <CardContent
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 400
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Нет данных для отображения
          </Typography>
        </CardContent>
      </Card>
    );
  }
  
  // Кастомный тултип для диаграммы
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
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
            {payload[0].payload.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Количество: <strong>{payload[0].value}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Доля: <strong>{`${payload[0].payload.percent}%`}</strong>
          </Typography>
          {payload[0].payload.conversion && (
            <Typography variant="body2" color="text.secondary">
              Конверсия: <strong>{payload[0].payload.conversion}%</strong>
            </Typography>
          )}
          {payload[0].payload.avgTime && (
            <Typography variant="body2" color="text.secondary">
              Среднее время: <strong>{payload[0].payload.avgTime}</strong>
            </Typography>
          )}
        </Box>
      );
    }
    return null;
  };
  
  CustomTooltip.propTypes = {
    active: PropTypes.bool,
    payload: PropTypes.array,
    label: PropTypes.string
  };
  
  // Преобразуем данные для маленьких карточек статусов
  const statusCards = data.map((item) => ({
    name: item.name,
    value: item.value,
    percent: item.percent,
    color: getStatusColor(item.name)
  }));
  
  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: theme.shadows[8]
      }}
    >
      <CardHeader
        title={title || "Распределение лидов по статусам"}
        subheader={subheader || "Количество лидов в каждом статусе воронки"}
      />
      <Divider />
      <CardContent>
        {/* Карточки со статусами */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {statusCards.map((status, index) => (
            <Grid item xs={6} sm={4} md={3} key={index}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: 'center',
                  borderRadius: 2,
                  borderTop: `3px solid ${status.color}`,
                  boxShadow: theme.shadows[2],
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="subtitle2" noWrap gutterBottom>
                  {status.name}
                </Typography>
                <Typography variant="h5" fontWeight="bold" color={status.color}>
                  {status.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {status.percent}%
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
        
        {/* График распределения */}
        <Box sx={{ height: 400, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 70
              }}
              barSize={40}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={70}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="value" name="Количество лидов">
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getStatusColor(entry.name)} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
        
        {/* Дополнительная информация */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Ключевые наблюдения:
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Основная часть лидов находится в статусе "{
              data.sort((a, b) => b.value - a.value)[0]?.name || 'Новый'
            }" ({data.sort((a, b) => b.value - a.value)[0]?.percent || 0}%). 
            Это говорит о том, что воронка продаж имеет {
              data.sort((a, b) => b.value - a.value)[0]?.value > data.reduce((sum, item) => sum + item.value, 0) / 2
                ? 'потенциальные узкие места' 
                : 'хорошую проходимость'
            }.
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            Рекомендуется обратить внимание на стадию перехода из статуса "{
              data.sort((a, b) => b.value - a.value)[0]?.name || 'Новый'
            }" в следующий статус для оптимизации конверсии.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

LeadsByStatusChart.propTypes = {
  data: PropTypes.array,
  isLoading: PropTypes.bool,
  title: PropTypes.string,
  subheader: PropTypes.string
};

export default LeadsByStatusChart;