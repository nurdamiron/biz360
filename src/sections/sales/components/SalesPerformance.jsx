// src/sections/sales/components/SalesPerformance.jsx
import PropTypes from 'prop-types';
import { useState } from 'react';
import {
  Box,
  Card,
  Grid,
  Paper,
  Stack,
  Button,
  Divider,
  Typography,
  CardHeader,
  CardContent,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  alpha,
  LinearProgress,
  Alert,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { fCurrency, fPercent } from 'src/utils/format-number';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

// Заглушки для иконок, в реальном проекте заменить на компонент Iconify или IconButton
const Icons = {
  ArrowUp: '↑',
  ArrowDown: '↓',
  Star: '⭐',
  Money: '💰',
  Calendar: '📅',
  Percentage: '%',
  Users: '👥',
  Gauge: '📊',
  Bulb: '💡',
  Chart: '📈',
  Check: '✓',
  Target: '🎯',
};

// Компонент для секции текущего периода
function CurrentPeriod({ salesData }) {
  const theme = useTheme();
  
  if (!salesData) {
    return (
      <Card sx={{ height: '100%', borderRadius: 2 }}>
        <CardHeader title="Текущий период" />
        <CardContent>
          <Alert severity="warning">Данные не доступны</Alert>
        </CardContent>
      </Card>
    );
  }
  
  // Расчет процента выполнения плана
  const planPercentage = salesData.plan > 0 ? (salesData.actual / salesData.plan) * 100 : 0;
  
  return (
    <Card sx={{ 
      height: '100%', 
      boxShadow: theme.customShadows?.z8 || '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
      borderRadius: 2
    }}>
      <CardHeader 
        title="Текущий период" 
        subheader={salesData.currentMonth}
      />
      <Divider />
      <CardContent>
        <Stack spacing={3}>
          {/* Выполнение плана */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Выполнение плана
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {planPercentage.toFixed(0)}%
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.primary">
                {fCurrency(salesData.actual)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                из {fCurrency(salesData.plan)}
              </Typography>
            </Box>
            
            <LinearProgress 
              variant="determinate" 
              value={Math.min(planPercentage, 100)}
              sx={{ 
                height: 10, 
                borderRadius: 1,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 1,
                  bgcolor: planPercentage >= 100 
                    ? theme.palette.success.main 
                    : theme.palette.primary.main
                }
              }}
            />
          </Box>
          
          {/* Конверсия */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Конверсия
              </Typography>
              <Typography 
                variant="body2" 
                fontWeight="bold"
                color={salesData.conversion >= 20 ? 'success.main' : 'warning.main'}
              >
                {salesData.conversion}%
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.primary">
                Контактов: {salesData.contacts}
              </Typography>
              <Typography variant="body2" color="text.primary">
                Закрытий: {salesData.closed}
              </Typography>
            </Box>
            
            <LinearProgress 
              variant="determinate" 
              value={Math.min(salesData.conversion * 3, 100)} // *3 для более наглядного отображения на прогресс-баре
              sx={{ 
                height: 10, 
                borderRadius: 1,
                bgcolor: alpha(theme.palette.info.main, 0.1),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 1,
                  bgcolor: salesData.conversion >= 20 
                    ? theme.palette.success.main 
                    : theme.palette.info.main
                }
              }}
            />
          </Box>
          
          {/* Средний чек */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Средний чек
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography 
                  variant="body2" 
                  color={salesData.averageCheck > salesData.departmentAverage ? 'success.main' : 'text.primary'}
                  sx={{ display: 'flex', alignItems: 'center' }}
                >
                  {salesData.averageCheck > salesData.departmentAverage && (
                    <Box component="span" sx={{ mr: 0.5 }}>{Icons.ArrowUp}</Box>
                  )}
                  {salesData.averageCheck < salesData.departmentAverage && (
                    <Box component="span" sx={{ mr: 0.5 }}>{Icons.ArrowDown}</Box>
                  )}
                  {fCurrency(salesData.averageCheck)}
                </Typography>
              </Box>
            </Box>
            
            <Box>
              <Typography variant="caption" color="text.secondary">
                {salesData.averageCheck > salesData.departmentAverage 
                  ? `На ${Math.round((salesData.averageCheck / salesData.departmentAverage - 1) * 100)}% выше среднего по отделу`
                  : `На ${Math.round((1 - salesData.averageCheck / salesData.departmentAverage) * 100)}% ниже среднего по отделу`
                }
              </Typography>
            </Box>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

CurrentPeriod.propTypes = {
  salesData: PropTypes.object
};

// Компонент для сравнения с коллегами
function ColleagueComparison({ rankData }) {
  const theme = useTheme();
  
  // Проверка на наличие данных
  if (!rankData || !rankData.topPerformers || !Array.isArray(rankData.topPerformers) || rankData.topPerformers.length === 0) {
    return (
      <Card sx={{ height: '100%', borderRadius: 2 }}>
        <CardHeader title="Сравнение с коллегами" />
        <CardContent>
          <Alert severity="info">Данные о коллегах недоступны</Alert>
        </CardContent>
      </Card>
    );
  }
  
  // Безопасное получение данных
  const position = rankData.position || 'Н/Д';
  const total = rankData.total || rankData.topPerformers.length;
  
  // Формируем данные для графика с проверкой
  const lastPerformerKpi = rankData.topPerformers[rankData.topPerformers.length - 1]?.kpi || 50;
  const currentUserKpi = Math.max(lastPerformerKpi - 13, 10); // Гарантируем минимальное значение
  
  // Данные для графика
  const chartData = [
    ...rankData.topPerformers.map(performer => ({
      id: performer.id || 'unknown',
      name: performer.name || `Сотрудник #${performer.id || 'unknown'}`,
      kpi: performer.kpi || 0,
      color: theme.palette.success.main,
      isCurrentUser: false
    })),
    {
      id: 'current',
      name: 'Ваш показатель',
      kpi: currentUserKpi,
      color: theme.palette.primary.main,
      isCurrentUser: true
    }
  ];
  
  return (
    <Card sx={{ 
      height: '100%', 
      boxShadow: theme.customShadows?.z8 || '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
      borderRadius: 2
    }}>
      <CardHeader 
        title="Сравнение с коллегами" 
        subheader={`Ваша позиция в рейтинге: ${position} из ${total}`}
      />
      <Divider />
      <CardContent>
        <Box sx={{ height: 300, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip
                formatter={(value) => [`${value}%`, 'KPI']}
                labelFormatter={(value) => `Сотрудник: ${value}`}
              />
              <Bar 
                dataKey="kpi" 
                name="KPI"
                fill={theme.palette.primary.main} 
                radius={[0, 4, 4, 0]}
                barSize={20}
              />
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}

ColleagueComparison.propTypes = {
  rankData: PropTypes.object
};

// Компонент для рекомендаций по улучшению
function ImprovementRecommendations({ improvements }) {
  const theme = useTheme();
  
  // Проверяем наличие данных
  if (!improvements || !Array.isArray(improvements) || improvements.length === 0) {
    return (
      <Card sx={{ borderRadius: 2 }}>
        <CardHeader title="Рекомендации по улучшению" />
        <CardContent>
          <Alert severity="info">Нет доступных рекомендаций</Alert>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card sx={{ 
      boxShadow: theme.customShadows?.z8 || '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
      borderRadius: 2
    }}>
      <CardHeader 
        title="Рекомендации по улучшению" 
        subheader="На основе ваших показателей"
      />
      <Divider />
      <CardContent>
        <List sx={{ p: 0 }}>
          {improvements.map((improvement, index) => (
            <Box key={index}>
              <ListItem 
                alignItems="flex-start"
                sx={{ px: 0, pt: 2 }}
              >
                <ListItemIcon sx={{ 
                  minWidth: 36, 
                  color: theme.palette.primary.main,
                  mt: 0 
                }}>
                  {Icons.Bulb}
                </ListItemIcon>
                
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" gutterBottom>
                      {improvement.title}
                    </Typography>
                  }
                  secondary={
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                          Текущий показатель: {improvement.current}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                          Целевой уровень: {improvement.target}
                        </Typography>
                      </Box>
                      
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min(improvement.current, 100)}
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
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {improvement.description}
                      </Typography>
                    </Stack>
                  }
                  primaryTypographyProps={{ component: 'div' }}
                  secondaryTypographyProps={{ component: 'div' }}
                />
              </ListItem>
              
              {index < improvements.length - 1 && <Divider sx={{ my: 2 }} />}
            </Box>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

ImprovementRecommendations.propTypes = {
  improvements: PropTypes.array
};

// Основной компонент для отображения эффективности продаж
function SalesPerformance({ salesData, improvements }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Проверяем наличие данных
  const hasSalesData = !!salesData;
  const hasRankData = !!(salesData && salesData.rank);
  
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <CurrentPeriod salesData={salesData} />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <ColleagueComparison rankData={salesData?.rank} />
      </Grid>
      
      <Grid item xs={12}>
        <ImprovementRecommendations improvements={improvements} />
      </Grid>
    </Grid>
  );
}

SalesPerformance.propTypes = {
  salesData: PropTypes.object,
  improvements: PropTypes.array
};

export default SalesPerformance;