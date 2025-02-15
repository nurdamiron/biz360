import React, { useState } from 'react';
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
import CircularProgress from '@mui/material/CircularProgress';
import { useBoolean, usePopover } from 'minimal-shared/hooks';

import { RouterLink } from 'src/routes/components';
import { fCurrency } from 'src/utils/format-number';
import { fDateTime } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomPopover } from 'src/components/custom-popover';
import { toast } from 'src/components/snackbar';

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
  const [downloading, setDownloading] = useState(false);

  const clientName = row.invoiceTo?.name;
  const clientBin = row.invoiceTo?.bin;

  // Статусы и их метки
  const STATUS_MAP = {
    paid: { label: 'Оплачен', color: 'success' },
    pending: { label: 'Ожидает оплаты', color: 'warning' },
    overdue: { label: 'Просрочен', color: 'error' },
    draft: { label: 'Черновик', color: 'default' }
  };

  // Типы документов и их метки
  const DOCUMENT_TYPES = {
    nakladnaya: 'Накладная',
    invoice: 'Счет на оплату',
    schet_faktura: 'Счет-фактура',
    bank_transfer: 'Банковский перевод'
  };

  // Обработчик скачивания
  const handleDownload = async () => {
    if (!row.downloadLink && !row.fileId) {
      toast.error('Ссылка для скачивания недоступна');
      return;
    }

    try {
      setDownloading(true);

      // Если есть прямая ссылка на скачивание
      if (row.downloadLink) {
        window.open(row.downloadLink, '_blank');
        return;
      }

      // Если есть только fileId, формируем прямую ссылку для экспорта
      if (row.fileId) {
        const fileName = `${DOCUMENT_TYPES[row.documentType] || 'document'}_${row.invoiceNumber}.pdf`;
        const exportUrl = `https://docs.google.com/spreadsheets/d/${row.fileId}/export?format=pdf&id=${row.fileId}`;
        
        const link = document.createElement('a');
        link.href = exportUrl;
        link.target = '_blank';
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Ошибка при скачивании документа');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
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
          <Box>
            <Typography variant="body2">
              {fDateTime(row.createDate)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {DOCUMENT_TYPES[row.documentType] || row.documentType}
            </Typography>
          </Box>
        </TableCell>

        <TableCell>
          <Typography variant="body2">
            {fCurrency(row.total)}
          </Typography>
        </TableCell>

        <TableCell>
          <Label 
            variant="soft" 
            color={STATUS_MAP[row.status]?.color || 'default'}
          >
            {STATUS_MAP[row.status]?.label || row.status}
          </Label>
        </TableCell>

        <TableCell align="right" sx={{ pr: 1 }}>
          {(row.downloadLink || row.fileId) && (
            <IconButton
              onClick={handleDownload}
              disabled={downloading}
              sx={{ mr: 1 }}
            >
              {downloading ? (
                <CircularProgress size={24} />
              ) : (
                <Iconify icon="eva:download-outline" />
              )}
            </IconButton>
          )}
          
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

          {(row.downloadLink || row.fileId) && (
            <MenuItem onClick={() => {
              handleDownload();
              menuActions.onClose();
            }}>
              <Iconify icon="eva:download-outline" />
              Скачать
            </MenuItem>
          )}

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