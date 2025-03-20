// src/sections/sales/components/PotentialBonuses.jsx
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
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  useMediaQuery,
  IconButton,
  alpha,
  CircularProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { fCurrency, fPercent } from 'src/utils/format-number';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

// Заглушки для иконок, в реальном проекте заменить на компонент Iconify или IconButton
const Icons = {
  Refresh: '🔄',
  Download: '📥',
  Money: '💰',
  Calendar: '📅',
  History: '⏱️',
  CheckCircle: '✓',
  PendingCircle: '⏳',
  Info: 'ℹ️',
  Calculator: '🧮',
  Target: '🎯',
  Filter: '🔍',
  Sort: '↕️'
};

// Компонент для отображения общей информации о бонусах
function BonusSummary({ summary }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Данные для круговой диаграммы
  const pieData = [
    { name: 'Подтвержденные', value: summary.total_confirmed, color: theme.palette.success.main },
    { name: 'Потенциальные', value: summary.total_potential, color: theme.palette.warning.main }
  ];
  
  return (
    <Card sx={{ 
      boxShadow: theme.customShadows?.z8 || '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
      borderRadius: 2
    }}>
      <CardHeader 
        title="Общая информация о бонусах" 
        subheader="Текущие и потенциальные бонусы"
        action={
          <IconButton size="small" aria-label="обновить">
            {Icons.Refresh}
          </IconButton>
        }
      />
      <Divider />
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ height: isMobile ? 200 : 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [fCurrency(value), 'Сумма']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Stack spacing={3} justifyContent="center" height="100%">
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body1" color="text.secondary">
                  Подтвержденные бонусы:
                </Typography>
                <Typography variant="h5" color="success.main" fontWeight="bold">
                  {fCurrency(summary.total_confirmed)}
                </Typography>
              </Stack>
              
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body1" color="text.secondary">
                  Потенциальные бонусы:
                </Typography>
                <Typography variant="h5" color="warning.main" fontWeight="bold">
                  {fCurrency(summary.total_potential)}
                </Typography>
              </Stack>
              
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body1" color="text.secondary">
                  Общий прогноз:
                </Typography>
                <Typography variant="h5" color="primary.main" fontWeight="bold">
                  {fCurrency(summary.total_confirmed + summary.total_potential)}
                </Typography>
              </Stack>
              
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Коэффициент подтверждения: {summary.confirmation_rate}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(summary.confirmation_rate, 100)}
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
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

BonusSummary.propTypes = {
  summary: PropTypes.object.isRequired
};

// Компонент для отображения детализации бонусов по клиентам
function BonusDetails({ bonusList }) {
  const theme = useTheme();
  
  // Функция для определения цвета вероятности
  const getProbabilityColor = (probability) => {
    if (probability >= 80) return theme.palette.success.main;
    if (probability >= 50) return theme.palette.info.main;
    if (probability >= 30) return theme.palette.warning.main;
    return theme.palette.error.main;
  };
  
  // Компонент для отображения вероятности в виде прогресс-бара
  const ProbabilityIndicator = ({ value }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <LinearProgress 
        variant="determinate" 
        value={value}
        sx={{ 
          width: 60,
          height: 8, 
          borderRadius: 1,
          bgcolor: alpha(getProbabilityColor(value), 0.1),
          '& .MuiLinearProgress-bar': {
            borderRadius: 1,
            bgcolor: getProbabilityColor(value)
          }
        }}
      />
      <Typography 
        variant="body2" 
        sx={{ color: getProbabilityColor(value), fontWeight: 'medium' }}
      >
        {value}%
      </Typography>
    </Box>
  );
  
  ProbabilityIndicator.propTypes = {
    value: PropTypes.number.isRequired
  };
  
  // Компонент для отображения статуса сделки
  const StatusChip = ({ status }) => {
    let color;
    let icon;
    
    switch (status) {
      case 'Завершена':
        color = theme.palette.success.main;
        icon = Icons.CheckCircle;
        break;
      case 'В процессе':
        color = theme.palette.info.main;
        icon = Icons.PendingCircle;
        break;
      case 'Первый контакт':
        color = theme.palette.warning.main;
        icon = Icons.Info;
        break;
      case 'Согласование':
        color = theme.palette.primary.main;
        icon = Icons.Calculator;
        break;
      default:
        color = theme.palette.grey[500];
        icon = Icons.Info;
    }
    
    return (
      <Chip
        label={status}
        size="small"
        icon={<Box component="span" sx={{ ml: 1 }}>{icon}</Box>}
        sx={{
          bgcolor: alpha(color, 0.1),
          color: color,
          borderColor: alpha(color, 0.2),
          '& .MuiChip-label': {
            px: 1
          },
          height: 24
        }}
      />
    );
  };
  
  StatusChip.propTypes = {
    status: PropTypes.string.isRequired
  };
  
  return (
    <Card sx={{ 
      boxShadow: theme.customShadows?.z8 || '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
      borderRadius: 2
    }}>
      <CardHeader 
        title="Бонусы по клиентам" 
        subheader="Детализация по клиентам и сделкам"
        action={
          <Button
            size="small"
            startIcon={Icons.Download}
            variant="outlined"
          >
            Экспорт
          </Button>
        }
      />
      <Divider />
      <CardContent>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Клиент</TableCell>
                <TableCell>Статус сделки</TableCell>
                <TableCell align="right">Бонус при закрытии</TableCell>
                <TableCell align="right">Вероятность</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bonusList.map((bonus) => (
                <TableRow key={bonus.id} sx={{ '&:hover': { bgcolor: 'background.neutral' } }}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {bonus.client}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <StatusChip status={bonus.status} />
                  </TableCell>
                  <TableCell align="right">
                    <Typography 
                      variant="body2" 
                      fontWeight="medium" 
                      color={bonus.probability >= 50 ? 'success.main' : 'text.primary'}
                    >
                      {fCurrency(bonus.amount)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <ProbabilityIndicator value={bonus.probability} />
                  </TableCell>
                </TableRow>
              ))}
              
              {bonusList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Нет потенциальных бонусов
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}

BonusDetails.propTypes = {
  bonusList: PropTypes.array.isRequired
};

// Компонент для отображения дополнительных бонусов
function AdditionalBonuses() {
  const theme = useTheme();
  
  // Данные по дополнительным бонусам
  const additionalBonusTypes = [
    {
      title: 'Наставничество',
      description: '+2,000 ₽ / месяц за стажера',
      icon: Icons.Target
    },
    {
      title: 'Перевыполнение плана',
      description: '+10% к бонусам при плане >100%',
      icon: Icons.Calendar
    },
    {
      title: 'Качество обслуживания',
      description: '+5,000 ₽ при рейтинге >4.8/5.0',
      icon: Icons.CheckCircle
    }
  ];
  
  return (
    <Card sx={{ 
      boxShadow: theme.customShadows?.z8 || '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
      borderRadius: 2
    }}>
      <CardHeader 
        title="Дополнительные бонусы" 
        subheader="Возможности увеличить свой доход"
      />
      <Divider />
      <CardContent>
        <Grid container spacing={2}>
          {additionalBonusTypes.map((bonus, index) => (
            <Grid item xs={12} sm={4} key={index}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2, 
                  height: '100%',
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 1,
                  color: theme.palette.primary.main,
                  fontSize: '1.25rem'
                }}>
                  {bonus.icon}
                </Box>
                <Typography variant="subtitle2" gutterBottom>
                  {bonus.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {bonus.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}

// Основной компонент для отображения бонусов
function PotentialBonuses({ bonuses }) {
  const theme = useTheme();
  
  if (!bonuses) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <BonusSummary summary={bonuses.summary} />
      </Grid>
      
      <Grid item xs={12}>
        <BonusDetails bonusList={bonuses.list || []} />
      </Grid>
      
      <Grid item xs={12}>
        <AdditionalBonuses />
      </Grid>
    </Grid>
  );
}

PotentialBonuses.propTypes = {
  bonuses: PropTypes.object
};


export default PotentialBonuses;
