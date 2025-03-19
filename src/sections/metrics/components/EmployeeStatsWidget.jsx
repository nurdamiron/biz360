// src/sections/metrics/components/EmployeeStatsWidget.jsx
import PropTypes from 'prop-types';
import { 
  Box, 
  Card, 
  CardContent, 
  CardHeader, 
  Divider, 
  Grid, 
  IconButton, 
  Stack, 
  Typography, 
  Avatar,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
// Для ESLint: Если иконки не установлены, их нужно будет установить или заменить на кнопку без иконки
// import RefreshIcon from '@mui/icons-material/Refresh';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { fPercent } from 'src/utils/format-number';

export default function EmployeeStatsWidget({ employees, topEmployee, onRefresh }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Группировка сотрудников по уровню KPI
  const lowPerformers = employees.filter(e => e.metrics.kpi < 60).length;
  const midPerformers = employees.filter(e => e.metrics.kpi >= 60 && e.metrics.kpi < 80).length;
  const highPerformers = employees.filter(e => e.metrics.kpi >= 80).length;
  
  const pieData = [
    { name: 'Высокая эффективность', value: highPerformers, color: theme.palette.success.main },
    { name: 'Средняя эффективность', value: midPerformers, color: theme.palette.warning.main },
    { name: 'Низкая эффективность', value: lowPerformers, color: theme.palette.error.main }
  ];

  return (
    <Card sx={{ height: '100%', boxShadow: theme.customShadows?.z8 }}>
      <CardHeader 
        title="Статистика сотрудников" 
        action={
          <IconButton aria-label="refresh" onClick={onRefresh}>
            {/* Вместо RefreshIcon можем использовать текст */}
            {/* <RefreshIcon /> */}
            ↻
          </IconButton>
        }
      />
      <Divider />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
                Всего сотрудников
              </Typography>
              <Typography variant="h4">{employees.length}</Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
                Лучший сотрудник
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    mr: 1,
                    bgcolor: theme.palette.primary.main
                  }}
                >
                  {topEmployee?.name.charAt(0) || '?'}
                </Avatar>
                <Typography variant="body2">{topEmployee?.name || 'Не определен'}</Typography>
              </Box>
            </Box>
            
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Высокая эффективность
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.success.main, fontWeight: 'bold' }}>
                  {highPerformers} ({fPercent(highPerformers / employees.length)})
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Средняя эффективность
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.warning.main, fontWeight: 'bold' }}>
                  {midPerformers} ({fPercent(midPerformers / employees.length)})
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Низкая эффективность
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.error.main, fontWeight: 'bold' }}>
                  {lowPerformers} ({fPercent(lowPerformers / employees.length)})
                </Typography>
              </Box>
            </Stack>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box sx={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [
                      `${value} сотрудников (${fPercent(value / employees.length)})`,
                      name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

EmployeeStatsWidget.propTypes = {
  employees: PropTypes.array.isRequired,
  topEmployee: PropTypes.object,
  onRefresh: PropTypes.func
};