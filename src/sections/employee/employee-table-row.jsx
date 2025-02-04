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
import { useAuthContext } from 'src/auth/hooks'; // или любой хук/контекст, откуда берем роль
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomPopover } from 'src/components/custom-popover';
import { EmployeeQuickEditForm } from './employee-quick-edit-form';
import axiosInstance, { endpoints } from 'src/lib/axios';
// import { toast } from 'src/components/snackbar'; // если хотите показывать уведомления

export function EmployeeTableRow({
  row,
  selected,
  editHref,
  onSelectRow,
  onDeleteRow,
}) {
  // Роль залогиненного пользователя
  const { user } = useAuthContext(); 
  const userRole = user?.employee?.role || ''; 
  // Например, userRole = 'owner', 'admin', 'manager' или 'employee'

  const menuActions = usePopover();
  const confirmDialog = useBoolean();
  const quickEditForm = useBoolean();

  // Кнопка "подтвердить" (только для owner/admin, и только если у сотрудника pending)
  const handleConfirmEmployee = async () => {
    try {
      await axiosInstance.put(endpoints.employee.update(row.id), {
        status: 'active',
      });
      // Локально меняем статус
      row.status = 'active';
      // toast.success('Сотрудник успешно подтверждён!');
    } catch (error) {
      console.error('Ошибка при подтверждении сотрудника:', error);
      // toast.error('Не удалось подтвердить сотрудника');
    }
  };

  // При успешном быстром редактировании
  const handleUpdateSuccess = (updatedData) => {
    Object.assign(row, updatedData);
  };

  // Вспомогательный компонент — «быстрое» редактирование
  const QuickEditFormComponent = () => (
    <EmployeeQuickEditForm
      currentEmployee={row}
      open={quickEditForm.value}
      onClose={quickEditForm.onFalse}
      onUpdateSuccess={handleUpdateSuccess}
    />
  );

  // Меню «Ещё» (редактировать / удалить)
  const MenuActionsComponent = () => (
    <CustomPopover
      open={menuActions.open}
      anchorEl={menuActions.anchorEl}
      onClose={menuActions.onClose}
    >
      <MenuList>
        <MenuItem
          component={RouterLink}
          href={editHref}
          onClick={menuActions.onClose}
        >
          <Iconify icon="solar:pen-bold" />
          Редактировать
        </MenuItem>

        <MenuItem
          onClick={() => {
            confirmDialog.onTrue();
            menuActions.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Удалить
        </MenuItem>
      </MenuList>
    </CustomPopover>
  );

  // Диалог подтверждения удаления
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

  // Цвета для статуса
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'banned':
      case 'blocked':
        return 'error';
      default:
        return 'default';
    }
  };

  // Проверяем, можем ли показывать кнопку подтверждения
  const canConfirm = 
    (userRole === 'owner' || userRole === 'admin') && 
    row.status === 'pending';

  return (
    <>
      <TableRow hover selected={selected} aria-checked={selected} tabIndex={-1}>
        {/* Чекбокс выделения */}
        <TableCell padding="checkbox">
          <Checkbox
            checked={selected}
            onClick={onSelectRow}
            inputProps={{ 'aria-label': `select row ${row.id}` }}
          />
        </TableCell>

        {/* Информация о сотруднике */}
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar alt={row.fio} src={row.avatarUrl} sx={{ mr: 2 }} />
            <Stack>
              <Link
                component={RouterLink}
                href={editHref}
                variant="subtitle2"
                sx={{ cursor: 'pointer' }}
              >
                {row.fio}
              </Link>
              {row.phoneNumber && (
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                  {row.phoneNumber}
                </Typography>
              )}
            </Stack>
          </Box>
        </TableCell>

        <TableCell>{row.department || '—'}</TableCell>

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

        {/* Отображение статуса (active/pending/banned...) */}
        <TableCell>
          <Label variant="soft" color={getStatusColor(row.status)}>
            {row.status}
          </Label>
        </TableCell>

        {/* Действия */}
        <TableCell align="right">
          {/* Кнопка "Подтвердить" видна только если (owner || admin) и сотрудник в статусе pending */}
          {canConfirm && (
            <Tooltip title="Подтвердить сотрудника">
              <Button
                size="small"
                variant="outlined"
                color="success"
                onClick={handleConfirmEmployee}
                sx={{ mr: 1 }}
              >
                Подтвердить
              </Button>
            </Tooltip>
          )}

          {/* Кнопка "Ещё" (Меню) */}
          <IconButton onClick={menuActions.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <QuickEditFormComponent />
      <MenuActionsComponent />
      <DeleteConfirmDialog />
    </>
  );
}
