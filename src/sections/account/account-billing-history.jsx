// src/sections/account/account-billing-history.jsx
import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';
import { Iconify } from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export function AccountBillingHistory({ invoices, sx, ...other }) {
  const showMore = useBoolean();
  const { employee } = useAuthContext();

  // Выбираем счета пользователя, если они есть, или используем переданные параметры
  const userInvoices = employee?.invoices || invoices || [];

  return (
    <Card sx={sx} {...other}>
      <CardHeader title="История счетов" />
      <Box
        sx={{
          px: 3,
          pt: 3,
          gap: 1.5,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {(showMore.value ? userInvoices : userInvoices.slice(0, 8)).map((invoice) => (
          <Box key={invoice.id} sx={{ display: 'flex', alignItems: 'center' }}>
            <ListItemText
              primary={invoice.invoiceNumber}
              secondary={fDate(invoice.createdAt)}
              slotProps={{
                primary: { sx: { typography: 'body2' } },
                secondary: {
                  sx: { mt: 0.5, typography: 'caption', color: 'text.disabled' },
                },
              }}
            />
            <Typography variant="body2" sx={{ mr: 5 }}>
              {fCurrency(invoice.price)}
            </Typography>
            <Link color="inherit" underline="always" variant="body2" href="#">
              PDF
            </Link>
          </Box>
        ))}
        <Divider sx={{ borderStyle: 'dashed' }} />
      </Box>
      <Box sx={{ p: 2 }}>
        <Button
          size="small"
          color="inherit"
          startIcon={
            <Iconify
              width={16}
              icon={showMore.value ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'}
              sx={{ mr: -0.5 }}
            />
          }
          onClick={showMore.onToggle}
        >
          Показать {showMore.value ? `меньше` : `больше`}
        </Button>
      </Box>
    </Card>
  );
}