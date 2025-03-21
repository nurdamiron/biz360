// src/sections/sales/components/lead-analytics/ConversionFunnelChart.jsx
import PropTypes from 'prop-types';
import {
  Box,
  Card,
  Typography,
  CardHeader,
  CardContent,
  Divider,
  Skeleton,
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

// Компонент для отображения воронки конверсии
const ConversionFunnelChart = ({ data, isLoading, title, subheader }) => {
  const theme = useTheme();

  // Если данные загружаются, показываем скелетон
  if (isLoading) {
    return (
      <Card
        sx={{
          borderRadius: 2,
          boxShadow: theme.shadows[8],
          height: '100%'
        }}
      >
        <CardHeader
          title={<Skeleton variant="text" width={200} />}
          subheader={<Skeleton variant="text" width={300} />}
        />
        <Divider />
        <CardContent>
          <Skeleton variant="rectangular" height={300} />
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
          boxShadow: theme.shadows[8],
          height: '100%'
        }}
      >
        <CardHeader
          title={title || "Воронка конверсии"}
          subheader={subheader || "Процент конверсии на каждом этапе"}
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
            Конверсия: <strong>{payload[0].value}%</strong>
          </Typography>
          {payload[0].payload.description && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              {payload[0].payload.description}
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

  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: theme.shadows[8],
        height: '100%'
      }}
    >
      <CardHeader
        title={title || "Воронка конверсии"}
        subheader={subheader || "Процент конверсии на каждом этапе"}
      />
      <Divider />
      <CardContent>
        <Box sx={{ height: 300, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={data}
              margin={{
                top: 10,
                right: 30,
                left: 80,
                bottom: 10,
              }}
              barSize={30}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} />
              <XAxis 
                type="number"
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={theme.palette.primary.main}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
        
        {/* Информация о показателях */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Последовательность этапов конверсии:
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {data.map((stage, index) => (
              <Box 
                key={index}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1 
                }}
              >
                <Box 
                  sx={{ 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    bgcolor: theme.palette.primary.main
                  }}
                />
                <Typography variant="caption" color="text.primary">
                  {stage.name}: <strong>{stage.value}%</strong>
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

ConversionFunnelChart.propTypes = {
  data: PropTypes.array,
  isLoading: PropTypes.bool,
  title: PropTypes.string,
  subheader: PropTypes.string
};

export default ConversionFunnelChart;