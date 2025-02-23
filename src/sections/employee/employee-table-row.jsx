import { useState } from 'react';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Link from '@mui/material/Link';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import axiosInstance, { endpoints } from 'src/lib/axios';
import { toast } from 'src/components/snackbar';

// Фиксированные ширины для каждой колонки
const COLUMN_WIDTHS = {
  employee: 280,
  department: 120,
  metrics: 360,
  status: 100,
  actions: 88
};

const MetricItem = ({ label, value }) => (
  <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 100 }}>
    <Typography variant="body2" sx={{ color: 'text.secondary', width: 70 }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ color: 'text.primary' }}>
      {value}%
    </Typography>
  </Stack>
);

const EmployeeInfo = ({ name, role }) => (
  <Stack direction="row" spacing={2} alignItems="flex-start">
    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
      name === 'John Newman' ? 'bg-gray-400' :
      'bg-green-500'
    }`}>
      {name?.charAt(0).toUpperCase() || 'N'}
    </div>
    <Stack spacing={0.5}>  {/* увеличил spacing для большего отступа */}
      <Typography variant="subtitle2" sx={{ lineHeight: 1.2 }}>  {/* уменьшил lineHeight */}
        {name}
      </Typography>
      <Typography 
        variant="caption" 
        sx={{ 
          color: 'text.disabled',  // сделал цвет более светлым
          fontSize: '0.75rem',
          mt: '-2px'  // небольшой отрицательный отступ для визуального баланса
        }}
      >
        {role || '—'}
      </Typography>
    </Stack>
  </Stack>
);


// Компонент прогресс-бара для метрик
const MetricProgress = ({ value, label }) => {
  const [open, setOpen] = useState(false);

  const getColorByValue = (val) => {
    if (val >= 80) return 'success.main';
    if (val >= 50) return 'warning.main';
    return 'error.main';
  };

  const getDescription = (metricLabel) => {
    const descriptions = {
      'KPI': 'Ключевые показатели эффективности, основанные на выполнении целей',
      'Объём': 'Количество выполненных задач относительно плана',
      'Активность': 'Уровень вовлеченности в рабочие процессы'
    };
    return descriptions[metricLabel] || '';
  };

  return (
    <>
      <div 
        style={{ 
          minWidth: 100,
          maxWidth: 120,
          cursor: 'pointer'
        }}
        onClick={() => setOpen(true)}
      >
        <LinearProgress
          variant="determinate"
          value={value || 0}
          sx={{
            height: 6,
            borderRadius: 1,
            bgcolor: 'background.neutral',
            '& .MuiLinearProgress-bar': {
              borderRadius: 1,
              bgcolor: theme => getColorByValue(value)
            }
          }}
        />
        <Stack 
          direction="row" 
          justifyContent="space-between"
          alignItems="center"
          sx={{ mt: 0.5 }}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {label}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {(value || 0).toFixed(1)}%
          </Typography>
        </Stack>
      </div>

      <Dialog 
        open={open} 
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: { width: '100%', maxWidth: 400 }
        }}
      >
        <DialogTitle>{label}</DialogTitle>
        <DialogContent>
          <Typography variant="h3" sx={{ mt: 2, mb: 1 }}>
            {(value || 0).toFixed(1)}%
          </Typography>
          <Typography color="text.secondary">
            {getDescription(label)}
          </Typography>

          <LinearProgress
            variant="determinate"
            value={value || 0}
            sx={{
              mt: 3,
              height: 8,
              borderRadius: 1,
              bgcolor: 'background.neutral',
              '& .MuiLinearProgress-bar': {
                borderRadius: 1,
                bgcolor: theme => getColorByValue(value)
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

// Основной компонент строки таблицы
export function EmployeeTableRow({
  row,
  selected,
  onSelectRow,
  onDeleteRow,
  editHref,
  onRefresh
}) {
  const [menuOpen, setMenuOpen] = useState(null);

  const handleConfirmEmployee = async () => {
    try {
      if (!row.id) {
        toast.error('ID сотрудника не найден');
        return;
      }
  
      // Подготавливаем данные для обновления
      const updateData = {
        fio: row.fio,
        email: row.email,
        phoneNumber: row.phoneNumber,
        department: row.department,
        role: 'admin',     // Явно указываем роль employee для подтверждения
        status: 'active'      // Меняем статус на активный
      };
  
      console.log('Отправляемые данные:', updateData); // Для отладки
  
      const response = await axiosInstance.put(
        endpoints.employee.update(row.id), 
        updateData
      );
  
      if (response.data?.success) {
        toast.success('Сотрудник подтвержден');
        onRefresh?.();
      } else {
        throw new Error(response.data?.error || 'Ошибка при подтверждении');
      }
  
      handleCloseMenu();
    } catch (error) {
      console.error('Error confirming employee:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Ошибка при подтверждении сотрудника';
      toast.error(errorMessage);
    }
  };

  const handleBlockEmployee = async () => {
    try {
      await axiosInstance.put(endpoints.employee.updateStatus(row.id), {
        status: 'blocked'
      });
      toast.success('Сотрудник заблокирован');
      onRefresh?.();
      handleCloseMenu();
    } catch (error) {
      console.error('Error blocking employee:', error);
      toast.error('Ошибка при блокировке сотрудника');
    }
  };

  const handleUnblockEmployee = async () => {
    try {
      await axiosInstance.put(endpoints.employee.updateStatus(row.id), {
        status: 'active'
      });
      toast.success('Сотрудник разблокирован');
      onRefresh?.();
      handleCloseMenu();
    } catch (error) {
      console.error('Error unblocking employee:', error);
      toast.error('Ошибка при разблокировке сотрудника');
    }
  };

  const handleOpenMenu = (event) => {
    setMenuOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuOpen(null);
  };

  return (
    <TableRow hover selected={selected}>
      <TableCell 
        padding="checkbox"
        sx={{ width: COLUMN_WIDTHS.checkbox }}
      >
        <Checkbox 
          checked={selected} 
          onChange={onSelectRow}
          sx={{ padding: 0.5 }}
        />
      </TableCell>

      <TableCell sx={{ width: COLUMN_WIDTHS.employee }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar 
            src={row.avatarUrl} 
            alt={row.fio}
            sx={{ width: 40, height: 40 }}
          >
            {!row.avatarUrl && row.fio?.charAt(0)}
          </Avatar>
          <Stack spacing={0.5}>
            <Link
              href={editHref}
              sx={{ 
                color: 'text.primary',
                textDecoration: 'none',
                '&:hover': { color: 'primary.main' }
              }}
            >
              <Typography variant="subtitle2">{row.fio}</Typography>
            </Link>
            <Typography variant="body2" color="text.secondary">
              {row.roleNames?.length > 0 ? row.roleNames.join(', ') : (row.role || '—')}
            </Typography>
          </Stack>
        </Stack>
      </TableCell>

      <TableCell sx={{ width: COLUMN_WIDTHS.department }}>
        <Typography variant="body2">
          {row.department || '—'}
        </Typography>
      </TableCell>

      <TableCell sx={{ width: COLUMN_WIDTHS.metrics }}>
        <Stack direction="row" spacing={3}>
          <MetricProgress value={row.kpi} label="KPI" />
          <MetricProgress value={row.work_volume} label="Объём" />
          <MetricProgress value={row.activity} label="Активность" />
        </Stack>
      </TableCell>

      <TableCell sx={{ width: COLUMN_WIDTHS.status }}>
        <Label
          variant="soft"
          color={
            (row.status === 'active' && 'success') ||
            (row.status === 'pending' && 'warning') ||
            'error'
          }
        >
          {row.status === 'active' && 'Активен'}
          {row.status === 'pending' && 'Ожидает'}
          {row.status === 'blocked' && 'Заблокирован'}
        </Label>
      </TableCell>

      <TableCell 
        align="right" 
        sx={{ 
          width: COLUMN_WIDTHS.actions,
          pr: 1
        }}
      >
        <IconButton onClick={handleOpenMenu}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>

        <Menu
          open={Boolean(menuOpen)}
          anchorEl={menuOpen}
          onClose={handleCloseMenu}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{
            sx: { width: 140, maxWidth: '100%' },
          }}
        >
          {row.status === 'pending' && (
            <MenuItem onClick={handleConfirmEmployee}>
              <Iconify icon="eva:checkmark-circle-2-fill" sx={{ mr: 2 }} />
              Подтвердить
            </MenuItem>
          )}
          
          {row.status === 'active' && (
            <MenuItem onClick={handleBlockEmployee}>
              <Iconify icon="eva:close-circle-fill" sx={{ mr: 2 }} />
              Заблокировать
            </MenuItem>
          )}

          {row.status === 'blocked' && (
            <MenuItem onClick={handleUnblockEmployee}>
              <Iconify icon="eva:unlock-fill" sx={{ mr: 2 }} />
              Разблокировать
            </MenuItem>
          )}

          <MenuItem
            component={Link}
            href={editHref}
            sx={{ color: 'info.main' }}
          >
            <Iconify icon="eva:edit-fill" sx={{ mr: 2 }} />
            Редактировать
          </MenuItem>

          <MenuItem 
            onClick={() => {
              onDeleteRow();
              handleCloseMenu();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="eva:trash-2-fill" sx={{ mr: 2 }} />
            Удалить
          </MenuItem>
        </Menu>
      </TableCell>
    </TableRow>
  );
}