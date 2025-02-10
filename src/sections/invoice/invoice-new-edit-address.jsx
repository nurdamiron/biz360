import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Typography, Stack, Box, IconButton, Divider, Avatar } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { Iconify } from 'src/components/iconify';
import { SupplierList } from './supplier-list';
import { CustomerList } from './customer-list';
import { kazakhstanBanks } from './kazakhstanBanks';



// Функция поиска банка по названию
const findBank = (bankName) => kazakhstanBanks.find((bank) => bank.name === bankName) || {};

export function InvoiceNewEditAddress() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const [openSupplierDialog, setOpenSupplierDialog] = useState(false);

  const billingFrom = watch('billing_from');
  const supplierCompanyType = watch('supplier_company_type'); // <-- ключ для НДС

  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  const [showFromDialog, setShowFromDialog] = useState(false);
  const [showToDialog, setShowToDialog] = useState(false);

  const values = watch();
  const { invoiceFrom, invoiceTo } = values;

  // Выбор поставщика
  const handleSelectSupplier = (supplier) => {
    setValue('billing_from', supplier.id);
    setValue('supplier_company_type', supplier.company_type);  // <-- ВАЖНО
    if (!supplier) return;
    const bankDetails = findBank(supplier.bank_name);
    setValue('invoiceFrom', {
      id: supplier.id || '',
      name: supplier.name || '',
      email: supplier.email || '',
      phoneNumber: supplier.phone_number || '',
      fullAddress: supplier.address || '',
      companyType: supplier.company_type || '',
      bankName: supplier.bank_name || '',
      bankBik: supplier.bank_bik || '',
      iik: supplier.iik || '',
      bankLogo: bankDetails.logo || '',
    });
    setShowFromDialog(false); // Закрываем окно после выбора
  };

  // Выбор клиента
const handleSelectCustomer = (customer) => {
  if (!customer) return;
  const bankDetails = findBank(customer.bank_name);
  
  // Устанавливаем объект для отображения информации о клиенте
  setValue('invoiceTo', {
    id: customer.id || '',
    name: customer.name || '',
    email: customer.email || '',
    phoneNumber: customer.phone_number || '',
    fullAddress: customer.address || '',
    companyType: customer.company_type || '',
    bankName: customer.bank_name || '',
    bankBik: customer.bank_bik || '',
    iik: customer.iik || '',
    bankLogo: bankDetails.logo || '',
  });
  
  // **Добавляем установку поля billing_to**
  setValue('billing_to', customer.id);
  
  setShowToDialog(false); // Закрываем окно после выбора
};


  const handleSupplierDeleted = (deletedId) => {
    if (!deletedId) return;
    if (invoiceFrom?.id === deletedId) {
      setValue('invoiceFrom', null);
    }
  };

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

                {invoiceFrom.companyType && (
                  <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                    Тип организации: {invoiceFrom.companyType}
                  </Typography>
                )}

                {invoiceFrom.iik && (
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Номер счета: {invoiceFrom.iik}
                  </Typography>
                )}

                {invoiceFrom.bankName && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar src={invoiceFrom.bankLogo} alt={invoiceFrom.bankName} sx={{ width: 24, height: 24 }} />
                    <Typography variant="body2">{invoiceFrom.bankName}</Typography>
                    {invoiceFrom.bankBik && (
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        (БИК: {invoiceFrom.bankBik})
                      </Typography>
                    )}
                  </Box>
                )}
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
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Box>

          <Stack spacing={1}>
            {invoiceTo ? (
              <>
                <Typography variant="subtitle2">{invoiceTo.name}</Typography>
                <Typography variant="body2">{invoiceTo.fullAddress}</Typography>
                <Typography variant="body2">{invoiceTo.phoneNumber}</Typography>

                {invoiceTo.companyType && (
                  <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                    Тип организации: {invoiceTo.companyType}
                  </Typography>
                )}

                {invoiceTo.bankName && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar src={invoiceTo.bankLogo} alt={invoiceTo.bankName} sx={{ width: 24, height: 24 }} />
                    <Typography variant="body2">{invoiceTo.bankName}</Typography>
                    {invoiceTo.bankBik && (
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        (БИК: {invoiceTo.bankBik})
                      </Typography>
                    )}
                  </Box>
                )}
              </>
            ) : (
              <Typography variant="subtitle2" sx={{ color: 'error.main' }}>
                {errors.invoiceTo?.message || 'Выберите клиента'}
              </Typography>
            )}
          </Stack>
        </Stack>
      </Stack>

      {/* Диалоги выбора */}
      <SupplierList open={showFromDialog} onClose={() => setShowFromDialog(false)} onSelect={handleSelectSupplier} />
      <CustomerList open={showToDialog} onClose={() => setShowToDialog(false)} onSelect={handleSelectCustomer} />
    </>
  );
}
