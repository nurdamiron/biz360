import { useBoolean, usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';
import { fCurrency } from 'src/utils/format-number';
import { fDate } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomPopover } from 'src/components/custom-popover';

export function InvoiceTableRow({
  row,
  selected,
  editHref,
  onSelectRow,
  onDeleteRow,
  detailsHref,
}) {
  const menuActions = usePopover();
  const confirmDialog = useBoolean();

  // Get client information from row.invoiceTo which comes from the formatInvoiceResponse
  const clientName = row.invoiceTo?.name;
  const clientBin = row.invoiceTo?.bin;

  const getStatusLabel = (status) => {
    const labels = {
      paid: 'Оплачен',
      pending: 'Ожидает оплаты',
      overdue: 'Просрочен',
      draft: 'Черновик'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      paid: 'success',
      pending: 'warning',
      overdue: 'error',
      draft: 'default'
    };
    return colors[status] || 'default';
  };

  const getDocumentTypeLabel = (type) => {
    const types = {
      invoice: 'Счет на оплату',
      act: 'Акт выполненных работ',
      sf: 'Счет-фактура',
      kp: 'Коммерческое предложение'
    };
    return types[type] || type;
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              alt={clientName} 
              sx={{ mr: 2, bgcolor: 'primary.main' }}
            >
              {clientName?.charAt(0)?.toUpperCase()}
            </Avatar>

            <Box>
              <Typography variant="subtitle2">{clientName}</Typography>
              <Typography variant="body2" color="text.secondary">
                БИН/ИИН: {clientBin}
              </Typography>
            </Box>
          </Box>
        </TableCell>

        <TableCell>
          <Label
            variant="soft"
            color="info"
          >
            {getDocumentTypeLabel(row.documentType)}
          </Label>
        </TableCell>

        <TableCell>
          <Typography variant="body2">
            {fDate(row.createDate)}
          </Typography>
        </TableCell>

        <TableCell>
          <Typography variant="body2">
            {fCurrency(row.total)}
          </Typography>
        </TableCell>

        <TableCell>
          <Label
            variant="soft"
            color={getStatusColor(row.status)}
          >
            {getStatusLabel(row.status)}
          </Label>
        </TableCell>

        <TableCell align="right">
          <IconButton onClick={menuActions.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <CustomPopover
        open={menuActions.open}
        anchorEl={menuActions.anchorEl}
        onClose={menuActions.onClose}
      >
        <MenuList>
          <MenuItem component={RouterLink} href={detailsHref} onClick={menuActions.onClose}>
            <Iconify icon="solar:eye-bold" />
            Просмотр
          </MenuItem>

          <MenuItem component={RouterLink} href={editHref} onClick={menuActions.onClose}>
            <Iconify icon="solar:pen-bold" />
            Редактировать
          </MenuItem>

          <Divider sx={{ borderStyle: 'dashed' }} />

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

      <ConfirmDialog
        open={confirmDialog.value}
        onClose={confirmDialog.onFalse}
        title="Удаление"
        content="Вы уверены, что хотите удалить этот документ?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Удалить
          </Button>
        }
      />
    </>
  );
}