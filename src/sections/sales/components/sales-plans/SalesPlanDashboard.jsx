// src/sections/sales/components/sales-plans/SalesPlanDashboard.jsx
import PropTypes from 'prop-types';
import { useState } from 'react';
import {
  Box,
  Card,
  Grid,
  Tabs,
  Tab,
  Typography,
  Stack,
  Divider,
  LinearProgress,
  Chip,
  alpha,
  Button,
  useTheme,
  IconButton
} from '@mui/material';
import { fCurrency, fPercent } from 'src/utils/format-number';

// Заглушки для иконок
const Icons = {
  Calendar: '📅',
  Week: '📆',
  Month: '📅',
  Success: '✓',
  Warning: '⚠️',
  Error: '❌',
  Phone: '📞',
  Money: '💰',
  Target: '🎯',
  Person: '👥',
  Chart: '📊',
  Edit: '✏️',
  Refresh: '🔄',
  Download: '📥',
  BonusMoney: '💸'
};

/**
 * Компонент прогресс-бара с текстовым описанием
 */
const ProgressWithLabels = ({ current, target, title, valuePrefix = '', valueSuffix = '', ...props }) => {
  const theme = useTheme();
  const progress = Math.min((current / target) * 100, 100);
  
  // Определение цвета прогресса
  const getProgressColor = (percent) => {
    if (percent >= 100) return theme.palette.success.main;
    if (percent >= 70) return theme.palette.primary.main;
    if (percent >= 50) return theme.palette.warning.main;
    return theme.palette.error.main;
  };
  
  const progressColor = getProgressColor(progress);
  
  return (
    <Box sx={{ width: '100%', ...props.sx }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="body2" fontWeight="medium">
          {valuePrefix}{current}{valueSuffix} из {valuePrefix}{target}{valueSuffix} ({Math.round(progress)}%)
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 8,
          borderRadius: 2,
          bgcolor: alpha(progressColor, 0.1),
          '& .MuiLinearProgress-bar': {
            borderRadius: 2,
            bgcolor: progressColor
          }
        }}
      />
    </Box>
  );
};

ProgressWithLabels.propTypes = {
  current: PropTypes.number.isRequired,
  target: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  valuePrefix: PropTypes.string,
  valueSuffix: PropTypes.string,
  sx: PropTypes.object
};

/**
 * Компонент для отображения ежедневного плана продаж
 */
const DailyPlanCard = ({ dailyPlan }) => {
  const theme = useTheme();
  
  return (
    <Card sx={{ 
      p: 3, 
      height: '100%',
      borderRadius: 2,
      boxShadow: theme.customShadows?.z8 || '0 8px 16px 0 rgba(145, 158, 171, 0.16)'
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem'
            }}
          >
            {Icons.Calendar}
          </Box>
          <Box>
            <Typography variant="h6">Сегодня</Typography>
            <Typography variant="body2" color="text.secondary">
              {dailyPlan.date}
            </Typography>
          </Box>
        </Stack>
        
        <Chip
          label={
            dailyPlan.salesActual >= dailyPlan.salesTarget
              ? "План выполнен"
              : dailyPlan.salesActual >= dailyPlan.salesTarget * 0.7
              ? "В процессе"
              : "Отставание"
          }
          color={
            dailyPlan.salesActual >= dailyPlan.salesTarget
              ? "success"
              : dailyPlan.salesActual >= dailyPlan.salesTarget * 0.7
              ? "primary"
              : "error"
          }
          sx={{ fontWeight: 'bold' }}
        />
      </Box>
      
      <Stack spacing={3}>
        <ProgressWithLabels
          current={dailyPlan.salesActual}
          target={dailyPlan.salesTarget}
          title="Продажи"
          valuePrefix="₸ "
        />
        
        <ProgressWithLabels
          current={dailyPlan.callsMade}
          target={dailyPlan.callsTarget}
          title="Звонки"
        />
        
        <ProgressWithLabels
          current={dailyPlan.meetingsHeld}
          target={dailyPlan.meetingsTarget}
          title="Встречи"
        />
        
        <ProgressWithLabels
          current={dailyPlan.leadsProcessed}
          target={dailyPlan.leadsToProcessTarget}
          title="Обработка лидов"
        />
      </Stack>
      
      <Button
        variant="outlined"
        startIcon={Icons.Refresh}
        fullWidth
        sx={{ mt: 3 }}
      >
        Обновить данные
      </Button>
    </Card>
  );
};

DailyPlanCard.propTypes = {
  dailyPlan: PropTypes.object.isRequired
};

/**
 * Компонент для отображения еженедельного плана продаж
 */
const WeeklyPlanCard = ({ weeklyPlan }) => {
  const theme = useTheme();
  
  return (
    <Card sx={{ 
      p: 3, 
      height: '100%',
      borderRadius: 2,
      boxShadow: theme.customShadows?.z8 || '0 8px 16px 0 rgba(145, 158, 171, 0.16)'
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.info.main, 0.1),
              color: theme.palette.info.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem'
            }}
          >
            {Icons.Week}
          </Box>
          <Box>
            <Typography variant="h6">Текущая неделя</Typography>
            <Typography variant="body2" color="text.secondary">
              {weeklyPlan.startDate} - {weeklyPlan.endDate}
            </Typography>
          </Box>
        </Stack>
        
        <Typography variant="caption" color="text.secondary">
          Неделя {weeklyPlan.weekNumber}
        </Typography>
      </Box>
      
      <Stack spacing={3}>
        <ProgressWithLabels
          current={weeklyPlan.salesActual}
          target={weeklyPlan.salesTarget}
          title="Продажи"
          valuePrefix="₸ "
        />
        
        <ProgressWithLabels
          current={weeklyPlan.callsMade}
          target={weeklyPlan.callsTarget}
          title="Звонки"
        />
        
        <ProgressWithLabels
          current={weeklyPlan.meetingsHeld}
          target={weeklyPlan.meetingsTarget}
          title="Встречи"
        />
        
        <ProgressWithLabels
          current={weeklyPlan.leadsProcessed}
          target={weeklyPlan.leadsToProcessTarget}
          title="Обработка лидов"
        />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Конверсия:
          </Typography>
          <Chip
            label={`${weeklyPlan.actualConversion}%`}
            color={
              weeklyPlan.actualConversion >= weeklyPlan.conversionTarget
                ? "success"
                : weeklyPlan.actualConversion >= weeklyPlan.conversionTarget * 0.8
                ? "primary"
                : "warning"
            }
            size="small"
            variant="outlined"
          />
        </Box>
      </Stack>
    </Card>
  );
};

WeeklyPlanCard.propTypes = {
  weeklyPlan: PropTypes.object.isRequired
};

/**
 * Компонент для отображения ежемесячного плана продаж
 */
const MonthlyPlanCard = ({ monthlyPlan }) => {
  const theme = useTheme();
  
  return (
    <Card sx={{ 
      p: 3, 
      height: '100%',
      borderRadius: 2,
      boxShadow: theme.customShadows?.z8 || '0 8px 16px 0 rgba(145, 158, 171, 0.16)'
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.success.main, 0.1),
              color: theme.palette.success.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem'
            }}
          >
            {Icons.Month}
          </Box>
          <Box>
            <Typography variant="h6">Текущий месяц</Typography>
            <Typography variant="body2" color="text.secondary">
              {monthlyPlan.month}
            </Typography>
          </Box>
        </Stack>
        
        <IconButton size="small" color="primary">
          {Icons.Edit}
        </IconButton>
      </Box>
      
      <Stack spacing={3}>
        <ProgressWithLabels
          current={monthlyPlan.salesActual}
          target={monthlyPlan.salesTarget}
          title="Продажи"
          valuePrefix="₸ "
        />
        
        <ProgressWithLabels
          current={monthlyPlan.callsMade}
          target={monthlyPlan.callsTarget}
          title="Звонки"
        />
        
        <ProgressWithLabels
          current={monthlyPlan.meetingsHeld}
          target={monthlyPlan.meetingsTarget}
          title="Встречи"
        />
        
        <ProgressWithLabels
          current={monthlyPlan.leadsProcessed}
          target={monthlyPlan.leadsToProcessTarget}
          title="Обработка лидов"
        />
        
        <Box sx={{ 
          p: 2, 
          borderRadius: 2, 
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2">
              <Box component="span" sx={{ mr: 1 }}>{Icons.BonusMoney}</Box>
              Бонусы
            </Typography>
            <Chip
              label={`${Math.round((monthlyPlan.bonusActual / monthlyPlan.bonusTarget) * 100)}%`}
              color={
                monthlyPlan.bonusActual >= monthlyPlan.bonusTarget
                  ? "success"
                  : monthlyPlan.bonusActual >= monthlyPlan.bonusTarget * 0.7
                  ? "primary"
                  : "warning"
              }
              size="small"
            />
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              Текущие бонусы:
            </Typography>
            <Typography variant="body2" fontWeight="bold" color="success.main">
              {fCurrency(monthlyPlan.bonusActual)}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Целевые бонусы:
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {fCurrency(monthlyPlan.bonusTarget)}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Конверсия:
          </Typography>
          <Chip
            label={`${monthlyPlan.actualConversion}%`}
            color={
              monthlyPlan.actualConversion >= monthlyPlan.conversionTarget
                ? "success"
                : monthlyPlan.actualConversion >= monthlyPlan.conversionTarget * 0.8
                ? "primary"
                : "warning"
            }
            size="small"
            variant="outlined"
          />
        </Box>
      </Stack>
      
      <Button
        variant="contained"
        startIcon={Icons.Download}
        fullWidth
        sx={{ mt: 3 }}
      >
        Отчет за месяц
      </Button>
    </Card>
  );
};

MonthlyPlanCard.propTypes = {
  monthlyPlan: PropTypes.object.isRequired
};

/**
 * Основной компонент панели планов продаж
 */
const SalesPlanDashboard = ({ salesPlans }) => {
  const [activeTab, setActiveTab] = useState(0);
  
  // Обработчик изменения вкладки
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab
            label="Ежедневный план"
            icon={Icons.Calendar}
            iconPosition="start"
          />
          <Tab
            label="Еженедельный план"
            icon={Icons.Week}
            iconPosition="start"
          />
          <Tab
            label="Ежемесячный план"
            icon={Icons.Month}
            iconPosition="start"
          />
        </Tabs>
      </Box>
      
      <Grid container spacing={3}>
        {/* Ежедневный план */}
        {activeTab === 0 && (
          <Grid item xs={12}>
            <DailyPlanCard dailyPlan={salesPlans.daily} />
          </Grid>
        )}
        
        {/* Еженедельный план */}
        {activeTab === 1 && (
          <Grid item xs={12}>
            <WeeklyPlanCard weeklyPlan={salesPlans.weekly} />
          </Grid>
        )}
        
        {/* Ежемесячный план */}
        {activeTab === 2 && (
          <Grid item xs={12}>
            <MonthlyPlanCard monthlyPlan={salesPlans.monthly} />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

SalesPlanDashboard.propTypes = {
  salesPlans: PropTypes.object.isRequired
};

export default SalesPlanDashboard;