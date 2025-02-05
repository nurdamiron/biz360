import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Typography, Stack, Box, IconButton, Divider } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { Iconify } from 'src/components/iconify';
import { SupplierList } from './supplier-list';
import { CustomerList } from './customer-list';

export function InvoiceNewEditAddress() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  const [showFromDialog, setShowFromDialog] = useState(false); // Поставщики
  const [showToDialog, setShowToDialog] = useState(false);     // Клиенты

  // Достаём значения из формы
  const values = watch();
  const { invoiceFrom, invoiceTo } = values;

  // --- Выбор поставщика
  const handleSelectSupplier = (supplier) => {
    if (!supplier) return;
    setValue('invoiceFrom', {
      id: supplier.id || '',
      name: supplier.name || '',
      email: supplier.email || '',
      phoneNumber: supplier.phone_number || '',
      fullAddress: supplier.address || '',
    });
  };

  // --- Выбор клиента
  const handleSelectCustomer = (customer) => {
    if (!customer) return;
    setValue('invoiceTo', {
      id: customer.id || '',
      name: customer.name || '',
      email: customer.email || '',
      phoneNumber: customer.phone_number || '',
      fullAddress: customer.address || '',
    });
  };

  // --- Если удалили поставщика — сбросим invoiceFrom, если он совпадает
  const handleSupplierDeleted = (deletedId) => {
    if (!deletedId) return;
    if (invoiceFrom?.id === deletedId) {
      setValue('invoiceFrom', null); // или {} — как вам удобнее
    }
  };

  // --- Если удалили клиента — сбросим invoiceTo, если он совпадает
  const handleCustomerDeleted = (deletedId) => {
    if (!deletedId) return;
    if (invoiceTo?.id === deletedId) {
      setValue('invoiceTo', null);
    }
  };

  return (
    <>
      <Stack
      spacing={{ xs: 3, md: 5 }}
      direction={{ xs: 'column', md: 'row' }}
      divider={
        // Можно Divider для красоты
        <Box
          sx={{
            borderLeft: { xs: 'none', md: '1px dashed grey' },
            borderTop: { xs: '1px dashed grey', md: 'none' },
            minHeight: { md: 120 },
          }}
        />
      }
      sx={{ p: 3 }}
    >
        {/* Левая часть: От (Поставщик) */}
        <Stack sx={{ width: 1 }}>
          <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ color: 'text.disabled', flexGrow: 1 }}>
              От (Поставщик):
            </Typography>

            <IconButton onClick={() => setShowFromDialog(true)}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Box>

          <Stack spacing={1}>
            {invoiceFrom ? (
              <>
                <Typography variant="subtitle2">{invoiceFrom.name}</Typography>
                <Typography variant="body2">{invoiceFrom.fullAddress}</Typography>
                <Typography variant="body2">{invoiceFrom.phoneNumber}</Typography>
              </>
            ) : (
              <Typography variant="subtitle2" sx={{ color: 'error.main' }}>
                {errors.invoiceFrom?.message || 'Выберите поставщика'}
              </Typography>
            )}
          </Stack>
        </Stack>

        {/* Правая часть: Кому (Клиент) */}
        <Stack sx={{ width: 1 }}>
          <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ color: 'text.disabled', flexGrow: 1 }}>
              Кому (Клиент):
            </Typography>

            <IconButton onClick={() => setShowToDialog(true)}>
              <Iconify icon={invoiceTo ? 'solar:pen-bold' : 'mingcute:add-line'} />
            </IconButton>
          </Box>

          <Stack spacing={1}>
            {invoiceTo ? (
              <>
                <Typography variant="subtitle2">{invoiceTo.name}</Typography>
                <Typography variant="body2">{invoiceTo.fullAddress}</Typography>
                <Typography variant="body2">{invoiceTo.phoneNumber}</Typography>
              </>
            ) : (
              <Typography variant="subtitle2" sx={{ color: 'error.main' }}>
                {errors.invoiceTo?.message || 'Выберите клиента'}
              </Typography>
            )}
          </Stack>
        </Stack>
      </Stack>

      {/* Диалог с поставщиками */}
      <SupplierList
        open={showFromDialog}
        onClose={() => setShowFromDialog(false)}
        selected={invoiceFrom?.id}
        onSelect={(supplier) => {
          handleSelectSupplier(supplier);
          setShowFromDialog(false);
        }}
        // Новая проп: вызывается при удалении поставщика
        onDeleted={(deletedId) => {
          handleSupplierDeleted(deletedId);
        }}
      />

      {/* Диалог с клиентами */}
      <CustomerList
        open={showToDialog}
        onClose={() => setShowToDialog(false)}
        selected={invoiceTo?.id}
        onSelect={(customer) => {
          handleSelectCustomer(customer);
          setShowToDialog(false);
        }}
        // Новая проп: вызывается при удалении клиента
        onDeleted={(deletedId) => {
          handleCustomerDeleted(deletedId);
        }}
      />
    </>
  );
}
