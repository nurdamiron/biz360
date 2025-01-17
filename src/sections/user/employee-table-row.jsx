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
import LinearProgress from '@mui/material/LinearProgress'; // для прогресс-бара

import { RouterLink } from 'src/routes/components';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomPopover } from 'src/components/custom-popover';

import { EmployeeQuickEditForm } from './employee-quick-edit-form';

export function EmployeeTableRow({ row, selected, editHref, onSelectRow, onDeleteRow }) {
  const menuActions = usePopover();
  const confirmDialog = useBoolean();
  const quickEditForm = useBoolean();

  const renderQuickEditForm = () => (
    <EmployeeQuickEditForm
      currentEmployee={row}
      open={quickEditForm.value}
      onClose={quickEditForm.onFalse}
    />
  );

  const renderMenuActions = () => (
    <CustomPopover
      open={menuActions.open}
      anchorEl={menuActions.anchorEl}
      onClose={menuActions.onClose}
      slotProps={{ arrow: { placement: 'right-top' } }}
    >
      <MenuList>
        <li>
          <MenuItem component={RouterLink} href={editHref} onClick={menuActions.onClose}>
            <Iconify icon="solar:pen-bold" />
            Редактировать
          </MenuItem>
        </li>

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

  const renderConfirmDialog = () => (
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
      <TableRow hover selected={selected} aria-checked={selected} tabIndex={-1}>
        {/* Чекбокс для множественного выбора */}
        <TableCell padding="checkbox">
          <Checkbox
            checked={selected}
            onClick={onSelectRow}
            inputProps={{
              id: `${row.id}-checkbox`,
              'aria-label': `${row.id} checkbox`,
            }}
          />
        </TableCell>

        {/* ФИО + телефон */}
        <TableCell>
          <Box sx={{ gap: 2, display: 'flex', alignItems: 'center' }}>
            <Avatar alt={row.fio} src={row.avatarUrl} />

            <Stack sx={{ typography: 'body2', flex: '1 1 auto' }}>
              <Link
                component={RouterLink}
                href={editHref}
                color="inherit"
                variant="subtitle2"
                sx={{ cursor: 'pointer' }}
              >
                {row.fio}
              </Link>

              {/* Телефон под ФИО, более спокойным цветом и меньшим шрифтом */}
              {row.phoneNumber && (
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                  {row.phoneNumber}
                </Typography>
              )}
            </Stack>
          </Box>
        </TableCell>

        {/* Отдел */}
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.department || '—'}</TableCell>

        {/* Общая эффективность (ползунок или прогресс) */}
        <TableCell>
          <Box sx={{ minWidth: 80 }}>
            <LinearProgress
              variant="determinate"
              value={row.overall_performance} // ожидается число 0–100
              sx={{ mb: 0.5 }}
            />
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              {`${row.overall_performance}%`}
            </Typography>
          </Box>
        </TableCell>

        {/* KPI */}
        <TableCell>{row.kpi ?? '—'}</TableCell>

        {/* Объём работ */}
        <TableCell>{row.work_volume ?? '—'}</TableCell>

        {/* Активность */}
        <TableCell>{row.activity ?? '—'}</TableCell>

        {/* Качество */}
        <TableCell>{row.quality ?? '—'}</TableCell>

        {/* Статус (доступ) */}
        <TableCell>
          <Label
            variant="soft"
            color={
              (row.status === 'active' && 'success') ||
              (row.status === 'pending' && 'warning') ||
              (row.status === 'banned' && 'error') ||
              'default'
            }
          >
            {row.status}
          </Label>
        </TableCell>

        {/* Меню действий (иконки) */}
        <TableCell align="right">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <Tooltip title="Quick Edit" placement="top" arrow>
              <IconButton
                color={quickEditForm.value ? 'inherit' : 'default'}
                onClick={quickEditForm.onTrue}
              >
                <Iconify icon="solar:pen-bold" />
              </IconButton>
            </Tooltip>

            <IconButton
              color={menuActions.open ? 'inherit' : 'default'}
              onClick={menuActions.onOpen}
            >
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          </Box>
        </TableCell>
      </TableRow>

      {renderQuickEditForm()}
      {renderMenuActions()}
      {renderConfirmDialog()}
    </>
  );
}
