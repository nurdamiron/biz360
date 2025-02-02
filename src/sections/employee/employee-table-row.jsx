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
import { EmployeeQuickEditForm } from './employee-quick-edit-form';
import axiosInstance, { endpoints } from 'src/lib/axios';

/**
 * Component for rendering a single employee row in the table
 * @param {Object} props Component properties
 * @param {Object} props.row - Employee data object
 * @param {boolean} props.selected - Whether the row is selected
 * @param {string} props.editHref - URL for editing the employee
 * @param {Function} props.onSelectRow - Callback when row is selected
 * @param {Function} props.onDeleteRow - Callback when row is deleted
 */
export function EmployeeTableRow({ row, selected, editHref, onSelectRow, onDeleteRow }) {
  // Hooks for managing UI state
  const menuActions = usePopover();
  const confirmDialog = useBoolean();
  const quickEditForm = useBoolean();

  /**
   * Updates the local employee data after a successful edit
   * @param {Object} updatedData - New employee data
   */
  const handleUpdateSuccess = (updatedData) => {
    Object.assign(row, updatedData);
  };

  /**
   * Renders the quick edit form component
   */
  const QuickEditFormComponent = () => (
    <EmployeeQuickEditForm
      currentEmployee={row}
      open={quickEditForm.value}
      onClose={quickEditForm.onFalse}
      onUpdateSuccess={handleUpdateSuccess}
    />
  );

  /**
   * Renders the actions menu popover
   */
  const MenuActionsComponent = () => (
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

  /**
   * Renders the confirmation dialog for deletion
   */
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

  /**
   * Gets the status color based on employee status
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'banned':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <>
      <TableRow hover selected={selected} aria-checked={selected} tabIndex={-1}>
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
              {row.phoneNumber && (
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                  {row.phoneNumber}
                </Typography>
              )}
            </Stack>
          </Box>
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {row.department || '—'}
        </TableCell>

        <TableCell>
          <Box sx={{ minWidth: 80 }}>
            <LinearProgress
              variant="determinate"
              value={row.overall_performance}
              sx={{ mb: 0.5 }}
            />
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              {`${row.overall_performance}%`}
            </Typography>
          </Box>
        </TableCell>

        <TableCell>{row.kpi ?? '—'}</TableCell>
        <TableCell>{row.work_volume ?? '—'}</TableCell>
        <TableCell>{row.activity ?? '—'}</TableCell>
        <TableCell>{row.quality ?? '—'}</TableCell>

        <TableCell>
          <Label
            variant="soft"
            color={getStatusColor(row.status)}
          >
            {row.status}
          </Label>
        </TableCell>

        <TableCell align="right">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <IconButton
              color={menuActions.open ? 'inherit' : 'default'}
              onClick={menuActions.onOpen}
            >
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          </Box>
        </TableCell>
      </TableRow>

      <QuickEditFormComponent />
      <MenuActionsComponent />
      <DeleteConfirmDialog />
    </>
  );
}