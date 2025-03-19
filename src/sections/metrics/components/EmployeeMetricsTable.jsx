// src/sections/metrics/components/EmployeeMetricsTable.jsx
import PropTypes from 'prop-types';
import { 
  Avatar, 
  Box, 
  Card, 
  CardHeader, 
  Chip, 
  Divider, 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow, 
  Typography,
  Button
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

export default function EmployeeMetricsTable({ employees, departmentColor, onShowAll }) {
  const theme = useTheme();

  // Получение цвета в зависимости от значения метрики
  const getMetricColor = (value) => {
    if (value >= 80) return theme.palette.success.main;
    if (value >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  // Маппинг ролей на русские названия
  const roleLabels = {
    head: 'Руководитель',
    manager: 'Менеджер',
    employee: 'Сотрудник'
  };

  return (
    <Card sx={{ boxShadow: theme.customShadows?.z8 }}>
      <CardHeader 
        title="Таблица сотрудников" 
        subheader={`Всего: ${employees.length} человек`}
        action={
          <Button 
            variant="text" 
            color="primary"
            size="small"
            onClick={onShowAll}
          >
            Показать всех
          </Button>
        }
      />
      <Divider />
      <Box sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Сотрудник</TableCell>
              <TableCell align="center">Должность</TableCell>
              <TableCell align="center">Общий KPI</TableCell>
              <TableCell align="center">Кол-во работы</TableCell>
              <TableCell align="center">Качество работы</TableCell>
              <TableCell align="center">Финансовые показатели</TableCell>
              <TableCell align="center">Операционные показатели</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map((employee) => {
              const kpiValue = employee.metrics.kpi || 0;
              const workVolume = employee.metrics.work_volume || 0;
              const quality = employee.metrics.quality || 0;
              const financial = employee.metrics.financial || 0;
              const operational = employee.metrics.operational || 0;
              
              return (
                <TableRow key={employee.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        sx={{ 
                          mr: 2, 
                          bgcolor: employee.role === 'head' ? 
                            departmentColor : theme.palette.grey[300]
                        }}
                      >
                        {employee.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" noWrap>
                          {employee.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
                          ID: {employee.id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={roleLabels[employee.role] || employee.role} 
                      color={employee.role === 'head' ? 'primary' : 'default'}
                      variant={employee.role === 'head' ? 'filled' : 'outlined'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography 
                        variant="body2" 
                        fontWeight="medium"
                        color={getMetricColor(kpiValue)}
                      >
                        {Math.round(kpiValue)}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Typography 
                      variant="body2" 
                      color={getMetricColor(workVolume)}
                    >
                      {Math.round(workVolume)}%
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography 
                      variant="body2" 
                      color={getMetricColor(quality)}
                    >
                      {Math.round(quality)}%
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography 
                      variant="body2" 
                      color={getMetricColor(financial)}
                    >
                      {Math.round(financial || 0)}%
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography 
                      variant="body2" 
                      color={getMetricColor(operational)}
                    >
                      {Math.round(operational || 0)}%
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
    </Card>
  );
}

EmployeeMetricsTable.propTypes = {
  employees: PropTypes.array.isRequired,
  departmentColor: PropTypes.string.isRequired,
  onShowAll: PropTypes.func
};