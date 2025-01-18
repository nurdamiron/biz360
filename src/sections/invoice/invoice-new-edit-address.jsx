import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Typography, Stack, Box, IconButton, Divider } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { Iconify } from 'src/components/iconify';
import { CustomerList } from './customer-list';

export function InvoiceNewEditAddress() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  const [showFromDialog, setShowFromDialog] = useState(false);
  const [showToDialog, setShowToDialog] = useState(false);

  const values = watch();
  const { invoiceFrom, invoiceTo } = values;

  const handleSelectCustomer = (type, customer) => {
    setValue(type, {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phoneNumber: customer.phone_number,
      fullAddress: customer.address
    });
  };

  return (
    <>
      <Stack
        spacing={{ xs: 3, md: 5 }}
        direction={{ xs: 'column', md: 'row' }}
        divider={
          <Divider
            flexItem
            orientation={mdUp ? 'vertical' : 'horizontal'}
            sx={{ borderStyle: 'dashed' }}
          />
        }
        sx={{ p: 3 }}
      >
        {/* From section */}
        <Stack sx={{ width: 1 }}>
          <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ color: 'text.disabled', flexGrow: 1 }}>
              От:
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
                {errors.invoiceFrom?.message || 'Выберите отправителя'}
              </Typography>
            )}
          </Stack>
        </Stack>

        {/* To section */}
        <Stack sx={{ width: 1 }}>
          <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ color: 'text.disabled', flexGrow: 1 }}>
              Кому:
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
                {errors.invoiceTo?.message || 'Выберите получателя'}
              </Typography>
            )}
          </Stack>
        </Stack>
      </Stack>

      <CustomerList
        open={showFromDialog}
        onClose={() => setShowFromDialog(false)}
        selected={invoiceFrom?.id}
        onSelect={(customer) => handleSelectCustomer('invoiceFrom', customer)}
      />

      <CustomerList
        open={showToDialog}
        onClose={() => setShowToDialog(false)}
        selected={invoiceTo?.id}
        onSelect={(customer) => handleSelectCustomer('invoiceTo', customer)}
      />
    </>
  );
}