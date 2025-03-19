// src/sections/user/user-profile.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  Avatar, 
  Typography, 
  Grid, 
  Box, 
  Divider, 
  Skeleton,
  Stack,
  Paper,
  Chip,
  Button,
  LinearProgress,
  CircularProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useAuthContext } from 'src/auth/hooks';
import { departmentToRussian, roleToRussian } from 'src/auth/utils';
import { Iconify } from 'src/components/iconify';
import { useEmployeeMetrics } from 'src/hooks/use-employee-metrics';
import { fPercent } from 'src/utils/format-number';
import { paths } from 'src/routes/paths';

// Получение цвета в зависимости от значения метрики
const getMetricColor = (value, theme) => {
  if (!value && value !== 0) return theme.palette.text.secondary;
  if (value >= 80) return theme.palette.success.main;
  if (value >= 60) return theme.palette.warning.main;
  return theme.palette.error.main;
};

export default function UserProfile() {
  const { employee, loading: authLoading } = useAuthContext();
  const [userData, setUserData] = useState(null);
  const { id } = useParams();
  const theme = useTheme();
  
  // Получаем метрики сотрудника
  const { 
    loading: metricsLoading, 
    error: metricsError,
    employeeMetrics,
    employeeData,
    bonuses
  } = useEmployeeMetrics(id === 'me' ? null : id);
  
  const loading = authLoading || metricsLoading;
  
  useEffect(() => {
    // Если запрашивается профиль текущего пользователя или "me"
    if (!id || id === 'me') {
      // Объединяем данные из authContext и метрик (если есть)
      setUserData({
        ...employee,
        ...(employeeData || {}),
        metrics: employeeMetrics
      });
    } else {
      // Для другого пользователя используем данные из метрик
      if (employeeData) {
        setUserData({
          ...employeeData,
          metrics: employeeMetrics
        });
      } else if (employee && employee.id === id) {
        // Если ID соответствует текущему пользователю
        setUserData({
          ...employee,
          metrics: employeeMetrics
        });
      }
    }
  }, [employee, employeeData, employeeMetrics, id]);
  
  // Пока данные загружаются
  if (loading || !userData) {
    return (
      <Card>
        <CardContent>
          <Stack spacing={3} alignItems="center" sx={{ py: 3 }}>
            <Skeleton variant="circular" width={120} height={120} />
            <Skeleton variant="text" width={200} height={40} />
            <Skeleton variant="text" width={160} height={30} />
          </Stack>
          <Divider sx={{ my: 3 }} />
          <Stack spacing={2}>
            <Skeleton variant="rectangular" height={60} />
            <Skeleton variant="rectangular" height={60} />
            <Skeleton variant="rectangular" height={60} />
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 5 }}>
            <Avatar
              src={userData.photoURL || ''}
              alt={userData.name}
              sx={{ width: 120, height: 120, mb: 2 }}
            />
            <Typography variant="h5" gutterBottom>
              {userData.name || 'Имя не указано'}
            </Typography>
            <Chip 
              icon={<Iconify icon="clarity:employee-solid" />}
              label={userData.role ? roleToRussian(userData.role) : 'Роль не указана'} 
              color="primary" 
              sx={{ mb: 1 }}
            />
            <Chip 
              icon={<Iconify icon="mdi:office-building" />}
              label={userData.department ? departmentToRussian(userData.department) : 'Отдел не указан'} 
              variant="outlined" 
            />
            
            {userData.isActive !== undefined && (
              <Box sx={{ mt: 3, display: 'flex', alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: userData.isActive ? 'success.main' : 'error.main',
                    mr: 1,
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  {userData.isActive ? 'Активен' : 'Неактивен'}
                </Typography>
              </Box>
            )}
            
            {/* Кнопка для перехода к метрикам */}
            <Button 
              component={Link}
              to={paths.dashboard.metrics.employee(id || 'me')}
              variant="outlined"
              startIcon={<Iconify icon="mdi:chart-line" />}
              sx={{ mt: 3 }}
            >
              Детальные метрики
            </Button>
          </CardContent>
        </Card>
        
        {/* Дополнительная информация */}
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Дополнительная информация
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Stack spacing={2}>
            {userData.hireDate && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Дата приема:</Typography>
                <Typography variant="body2">
                  {new Date(userData.hireDate).toLocaleDateString()}
                </Typography>
              </Box>
            )}
            
            {userData.position && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Должность:</Typography>
                <Typography variant="body2">{userData.position}</Typography>
              </Box>
            )}
            
            {userData.employeeId && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">ID сотрудника:</Typography>
                <Typography variant="body2">{userData.employeeId}</Typography>
              </Box>
            )}
          </Stack>
        </Paper>
      </Grid>
      
      {/* Основная информация */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Контактная информация
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Email:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">
                  {userData.email || 'Не указан'}
                </Typography>
              </Grid>
              
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Телефон:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">
                  {userData.phoneNumber || 'Не указан'}
                </Typography>
              </Grid>
              
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Адрес:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">
                  {userData.address || 'Не указан'}
                </Typography>
              </Grid>
              
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Город:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">
                  {userData.city || 'Не указан'}
                </Typography>
              </Grid>
            </Grid>
            
            {userData.about && (
              <>
                <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>
                  О себе
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2">
                  {userData.about}
                </Typography>
              </>
            )}
          </CardContent>
        </Card>
      </Grid>
      
      {/* Метрики сотрудника */}
      {employeeMetrics && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ключевые показатели
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                {/* KPI */}
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      KPI
                    </Typography>
                    <Box sx={{ position: 'relative', width: 100, height: 100, mx: 'auto', mb: 1 }}>
                      <CircularProgress
                        variant="determinate"
                        value={employeeMetrics.kpi || 0}
                        size={100}
                        thickness={5}
                        sx={{ color: getMetricColor(employeeMetrics.kpi, theme) }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="h6" color={getMetricColor(employeeMetrics.kpi, theme)}>
                          {fPercent(employeeMetrics.kpi / 100)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
                
                {/* Общая эффективность */}
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Общая эффективность
                    </Typography>
                    <Box sx={{ position: 'relative', width: 100, height: 100, mx: 'auto', mb: 1 }}>
                      <CircularProgress
                        variant="determinate"
                        value={employeeMetrics.overall_performance || 0}
                        size={100}
                        thickness={5}
                        sx={{ color: getMetricColor(employeeMetrics.overall_performance, theme) }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="h6" color={getMetricColor(employeeMetrics.overall_performance, theme)}>
                          {fPercent(employeeMetrics.overall_performance / 100)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
                
                {/* Объем работы */}
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Объем работы
                    </Typography>
                    <Box sx={{ position: 'relative', width: 100, height: 100, mx: 'auto', mb: 1 }}>
                      <CircularProgress
                        variant="determinate"
                        value={employeeMetrics.work_volume || 0}
                        size={100}
                        thickness={5}
                        sx={{ color: getMetricColor(employeeMetrics.work_volume, theme) }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="h6" color={getMetricColor(employeeMetrics.work_volume, theme)}>
                          {fPercent(employeeMetrics.work_volume / 100)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
                
                {/* Качество */}
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Качество
                    </Typography>
                    <Box sx={{ position: 'relative', width: 100, height: 100, mx: 'auto', mb: 1 }}>
                      <CircularProgress
                        variant="determinate"
                        value={employeeMetrics.quality || 0}
                        size={100}
                        thickness={5}
                        sx={{ color: getMetricColor(employeeMetrics.quality, theme) }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="h6" color={getMetricColor(employeeMetrics.quality, theme)}>
                          {fPercent(employeeMetrics.quality / 100)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      )}
      
      {/* Информация о бонусах */}
      {bonuses && bonuses.summary && (
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Бонусы
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Потенциальные бонусы:</Typography>
                  <Typography variant="body2">{bonuses.summary.total_potential.toLocaleString()} ₸</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Подтвержденные бонусы:</Typography>
                  <Typography variant="body2">{bonuses.summary.total_confirmed.toLocaleString()} ₸</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Коэффициент подтверждения:</Typography>
                  <Typography variant="body2">{fPercent(bonuses.summary.confirmation_rate / 100)}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );
}