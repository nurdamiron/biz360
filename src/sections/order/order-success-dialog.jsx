// src/sections/order/OrderSuccessDialog.jsx
import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Divider,
  Stack,
  Grid,
  Link,
  Alert,
  Chip
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { useRouter } from 'src/routes/hooks';

export function OrderSuccessDialog({ open, onClose, orderData, invoiceData }) {
  const router = useRouter();
  const [showDocumentLinks, setShowDocumentLinks] = useState(false);
  
  // If no data is provided, don't render
  if (!open || !orderData) {
    return null;
  }
  
  // Ensure potential bonus is correctly displayed
  const potentialBonus = orderData.potential_bonus || 0;
  
  // Format creation date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Navigate to order details
  const handleViewOrder = () => {
    onClose();
    router.push(`/dashboard/orders/${orderData.id}`);
  };
  
  // Navigate to invoice details
  const handleViewInvoice = () => {
    onClose();
    if (invoiceData?.id) {
      router.push(`/dashboard/invoices/${invoiceData.id}`);
    }
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          p: 1,
          boxShadow: (theme) => theme.customShadows.dialog
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 3, py: 2 }}>
        <Iconify icon="eva:checkmark-circle-2-fill" sx={{ color: 'success.main', width: 28, height: 28 }} />
        <Typography variant="h4">Заказ успешно создан!</Typography>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Информация о заказе
              </Typography>
              
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Номер заказа
                  </Typography>
                  <Typography variant="subtitle2">
                    {orderData.order_number}
                  </Typography>
                </Stack>
                
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Дата создания
                  </Typography>
                  <Typography variant="subtitle2">
                    {formatDate(orderData.created_at)}
                  </Typography>
                </Stack>
                
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Статус
                  </Typography>
                  <Chip 
                    label={orderData.status === 'new' ? 'Новый' : orderData.status} 
                    size="small"
                    color="primary"
                  />
                </Stack>
                
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Сумма заказа
                  </Typography>
                  <Typography variant="subtitle2">
                    {orderData.total?.toLocaleString() || 0} ₸
                  </Typography>
                </Stack>
                
                {potentialBonus > 0 && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Потенциальный бонус
                    </Typography>
                    <Typography variant="subtitle2" sx={{ color: 'success.main' }}>
                      {potentialBonus.toLocaleString()} ₸
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Документы заказа
              </Typography>
              
              {invoiceData ? (
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Счет №
                    </Typography>
                    <Typography variant="subtitle2">
                      {invoiceData.invoice_number || invoiceData.document_number}
                    </Typography>
                  </Stack>
                  
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Тип документа
                    </Typography>
                    <Typography variant="subtitle2">
                      {invoiceData.document_type === 'invoice' 
                        ? 'Счет на оплату' 
                        : invoiceData.document_type}
                    </Typography>
                  </Stack>
                  
                  {showDocumentLinks && invoiceData.download_link && (
                    <Box sx={{ mt: 2 }}>
                      <Alert severity="info">
                        <Link 
                          href={invoiceData.download_link} 
                          target="_blank"
                          rel="noopener"
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <Iconify icon="eva:file-text-outline" />
                          Скачать счет
                        </Link>
                      </Alert>
                    </Box>
                  )}
                  
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => setShowDocumentLinks(!showDocumentLinks)}
                    endIcon={<Iconify icon={showDocumentLinks ? 'eva:chevron-up-fill' : 'eva:chevron-down-fill'} />}
                  >
                    {showDocumentLinks ? 'Скрыть ссылки' : 'Показать ссылки для скачивания'}
                  </Button>
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Документы в процессе формирования...
                </Typography>
              )}
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            
            {potentialBonus > 0 && (
              <Alert 
                severity="success" 
                sx={{ mt: 2 }}
                icon={<Iconify icon="mdi:gift-outline" />}
              >
                <Typography variant="subtitle2">
                  По данному заказу вам начислен потенциальный бонус: {potentialBonus.toLocaleString()} ₸
                </Typography>
                <Typography variant="body2">
                  Бонус будет подтвержден после выполнения заказа и оплаты клиентом.
                </Typography>
              </Alert>
            )}
            
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Что дальше?
              </Typography>
              <Typography variant="body2" paragraph>
                Заказ создан и готов к обработке. Вы можете просмотреть детали заказа или 
                вернуться к списку заказов.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          variant="outlined"
          onClick={onClose}
        >
          Вернуться к списку
        </Button>
        
        {invoiceData && (
          <Button
            variant="contained"
            color="info"
            onClick={handleViewInvoice}
            startIcon={<Iconify icon="eva:file-text-outline" />}
          >
            Просмотр счета
          </Button>
        )}
        
        <Button
          variant="contained"
          onClick={handleViewOrder}
          startIcon={<Iconify icon="eva:shopping-bag-outline" />}
        >
          Просмотр заказа
        </Button>
      </DialogActions>
    </Dialog>
  );
}