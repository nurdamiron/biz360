import { useBoolean, usePopover } from 'minimal-shared/hooks';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import { RouterLink } from 'src/routes/components';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomPopover } from 'src/components/custom-popover';
import axiosInstance, { endpoints } from 'src/lib/axios';
import { toast } from 'src/components/snackbar';

import { useAuthContext } from 'src/auth/hooks'; 
// userRole = 'owner' / 'admin' / 'manager' / 'employee'

export function EmployeeTableRow({
  row,
  selected,
  editHref,
  onSelectRow,
  onDeleteRow,
}) {
  const { user } = useAuthContext();
  const userRole = user?.employee?.role || '';

  const menuActions = usePopover();
  const confirmDialog = useBoolean();


  const loadEmployees = async () => {
    try {
      const response = await axiosInstance.get(endpoints.employee.list);
      return response.data; // Всегда возвращаем данные
    } catch (error) {
      console.error('Ошибка загрузки сотрудников:', error);
      return []; // Возвращаем пустой массив вместо null, если данные не загружены
    }
  };
  
  

  

  // Подтверждение (pending -> active)
  const handleConfirmEmployee = async (employeeId) => {
    try {
      await axiosInstance.put(endpoints.employee.update(employeeId), {
        status: 'active',
      });
      toast.success('Сотрудник переведён в статус Active');
      // Обновите список сотрудников
      await loadEmployees();
    } catch (error) {
      console.error(error);
      toast.error('Ошибка при подтверждении сотрудника');
    }
  };
  

  // Забанить (active -> banned)
  const handleBanEmployee = async () => {
    try {
      await axiosInstance.put(endpoints.employee.update(row.id), {
        status: 'banned',
      });
      row.status = 'banned';
      // toast.success('Сотрудник заблокирован');
    } catch (error) {
      console.error(error);
      // toast.error('Ошибка при блокировке');
    }
  };

  const handleUnbanEmployee = async () => {
    try {
      await axiosInstance.put(endpoints.employee.update(row.id), {
        status: 'active',
      });
      row.status = 'active';
    } catch (error) {
      console.error(error);
    }
  };

  // Цвет статуса
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'blocked': // ← меняем с 'banned'
        return 'error';
      default:
        return 'default';
    }
  };
  

  // Проверяем права
  const canConfirm = (userRole === 'owner' || userRole === 'admin') && row.status === 'pending';
  const canBan = (userRole === 'owner' || userRole === 'admin') && row.status === 'active';
  const canUnblock = (userRole === 'owner' || userRole === 'admin') && row.status === 'blocked';

  const handleBlockEmployee = async () => {
    await axiosInstance.put(endpoints.employee.update(row.id), { status: 'blocked' });
  };

  // Меню (троеточие) «Редактировать / Удалить»
  const MenuActions = () => (
    <CustomPopover
      open={menuActions.open}
      anchorEl={menuActions.anchorEl}
      onClose={menuActions.onClose}
    >
      <MenuList>
        <MenuItem component={RouterLink} href={editHref} onClick={menuActions.onClose}>
          <Iconify icon="solar:pen-bold" sx={{ mr: 2 }} />
          Редактировать
        </MenuItem>

        <MenuItem
          sx={{ color: 'error.main' }}
          onClick={() => {
            confirmDialog.onTrue();
            menuActions.onClose();
          }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" sx={{ mr: 2 }} />
          Удалить
        </MenuItem>
      </MenuList>
    </CustomPopover>
  );

  // Диалог удаления
  const DeleteConfirmDialog = () => (
    <ConfirmDialog
      open={confirmDialog.value}
      onClose={confirmDialog.onFalse}
      title="Удалить"
      content="Вы уверены, что хотите удалить этого сотрудника?"
      action={
        <Button variant="contained" color="error" onClick={onDeleteRow}>
          Удалить
        </Button>
      }
    />
  );

  return (
    <>
      <TableRow hover selected={selected}>
        {/* Чекбокс */}
        <TableCell padding="checkbox">
          <Checkbox
            checked={selected}
            onClick={onSelectRow}
          />
        </TableCell>

        {/* Информация о сотруднике */}
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar alt={row.fio} src={row.avatarUrl} sx={{ mr: 2 }} />
            <Stack spacing={0.3}>
              <Link
                component={RouterLink}
                href={editHref}
                variant="subtitle2"
                sx={{ cursor: 'pointer' }}
              >
                {row.fio}
              </Link>
              {/* ПОД ФИО показываем РОЛЬ */}
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {row.role || '—'}
              </Typography>
            </Stack>
          </Box>
        </TableCell>

        <TableCell>
          {row.department || '—'}
        </TableCell>

        <TableCell>
          <Box sx={{ minWidth: 80 }}>
            <LinearProgress
              variant="determinate"
              value={row.overall_performance || 0}
              sx={{ mb: 0.5 }}
            />
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              {(row.overall_performance || 0) + '%'}
            </Typography>
          </Box>
        </TableCell>

        <TableCell>{row.kpi ?? '—'}</TableCell>
        <TableCell>{row.work_volume ?? '—'}</TableCell>
        <TableCell>{row.activity ?? '—'}</TableCell>
        <TableCell>{row.quality ?? '—'}</TableCell>

        {/* Статус */}
        <TableCell>
          <Label variant="soft" color={getStatusColor(row.status)}>
            {row.status}
          </Label>
        </TableCell>

        {/* Кнопки действий (Подтвердить / Забанить / Меню...) */}
        <TableCell align="right">
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            {/* Подтвердить (pending -> active) */}
            {canConfirm && (
              <Tooltip title="Подтвердить сотрудника">
                <Button
                  size="small"
                  variant="outlined"
                  color="success"
                  onClick={handleConfirmEmployee}
                >
                  Подтвердить
                </Button>
              </Tooltip>
            )}

            {/* Забанить (active -> banned) */}
            {canBan && (
              <Tooltip title="Заблокировать сотрудника">
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={handleBanEmployee}
                >
                  Заблокировать
                </Button>
              </Tooltip>
            )}

            {/* Разблокировать (banned -> active) */}
            {canUnblock && (
              <Tooltip title="Разблокировать сотрудника">
                <Button
                  size="small"
                  variant="outlined"
                  color="warning"
                  onClick={handleUnbanEmployee}
                >
                  Разблокировать
                </Button>
              </Tooltip>
            )}

            {/* Кнопка меню */}
            <IconButton onClick={menuActions.onOpen}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          </Stack>
        </TableCell>
      </TableRow>

      <MenuActions />
      <DeleteConfirmDialog />
    </>
  );
}
