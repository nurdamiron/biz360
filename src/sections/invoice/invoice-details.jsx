// ==========================================
// invoice-details.jsx
// ==========================================
import { useState, useCallback, useEffect } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { toast, ToastContainer } from "react-toastify";

import { fetcher, endpoints } from 'src/lib/axios';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { INVOICE_STATUS_OPTIONS } from 'src/_mock';

import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';

import { InvoiceToolbar } from './invoice-toolbar';
import { InvoiceTotalSummary } from './invoice-total-summary';

// ----------------------------------------------------------------------

/**
 * Пропсы:
 * - invoice       (опц.) готовые данные
 * - invoiceId     (опц.) айди счета, если надо фетчить GET /api/invoices/:invoiceId
 */
export function InvoiceDetails({ invoice, invoiceId }) {
  // [NEW CODE] 1) локальный стейт, если надо фетчить
  const [fetchedInvoice, setFetchedInvoice] = useState(null);

  // [NEW CODE] 2) Режим "редактирования"
  const [isEditing, setIsEditing] = useState(false);

  // [NEW CODE] 3) Состояние изменённых полей (редактируем)
  const [localData, setLocalData] = useState({});

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState(null);


  const fetchInvoiceData = useCallback(async () => {
    if (!invoiceId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Используем ваш endpoint для получения деталей счета
      const response = await endpoints.get(endpoints.invoice.details(invoiceId));
      console.log('API Response:', response.data);

      if (response.data) {
        // Обновляем состояние с данными
        setFetchedInvoice({
          ...response.data.invoice,
          items: response.data.items || [],
          invoiceTo: {
            name: response.data.customer?.name,
            fullAddress: response.data.customer?.address,
            phoneNumber: response.data.customer?.phone,
          },
          // Добавляем дополнительные поля если нужно
          status: response.data.invoice?.status,
          createDate: response.data.invoice?.date_create,
          dueDate: response.data.invoice?.due_date,
          taxes: response.data.invoice?.tax,
          shipping: response.data.invoice?.shipping,
          discount: response.data.invoice?.discount,
          subtotal: response.data.invoice?.subtotal,
          totalAmount: response.data.invoice?.total,
        });
      }
    } catch (err) {
      console.error('Error fetching invoice:', err);
      setError(err.message || 'Failed to load invoice data');
    } finally {
      setIsLoading(false);
    }
  }, [invoiceId]);


  // Если снаружи не пришёл invoice, но есть invoiceId — фетчим
  useEffect(() => {
    // Загружаем данные только если нет готового invoice
    if (!invoice && invoiceId) {
      fetchInvoiceData();
    }
  }, [invoice, invoiceId, fetchInvoiceData]);

  // Для удобства единая переменная, что реально рендерим
  const finalInvoice = fetchedInvoice || invoice;

  // При смене статуса меняем localData
  const handleChangeStatus = useCallback(async (event) => {
    try {
      const newStatus = event.target.value;
      await endpoints.put(endpoints.invoice.updateStatus(invoiceId, newStatus));
      // Обновляем данные после изменения статуса
      fetchInvoiceData();
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Failed to update status');
    }
  }, [invoiceId, fetchInvoiceData]);

  // [NEW CODE] переключаем режим редактирования
  const toggleEditMode = () => {
    setIsEditing((prev) => !prev);
    // Можно сделать deep copy, если требуется сохранить оригинал
    setLocalData(JSON.parse(JSON.stringify(finalInvoice)));
  };
  // [NEW CODE] при вводе меняем localData
  const handleFieldChange = (field, value) => {
    setLocalData((prev) => ({ ...prev, [field]: value }));
  };

  // [NEW CODE] сохранение через PUT
  const handleSave = async () => {
    try {
      if (!finalInvoice?.id) {
        console.error('Нет ID счёта, не можем сделать PUT');
        return;
      }
      await endpoints.put(`/api/invoices/${finalInvoice.id}`, localData);
      alert('Изменения сохранены!');
      // Применяем изменения в fetchedInvoice
      setFetchedInvoice(localData);
      setIsEditing(false);
    } catch (err) {
      console.error('Ошибка при сохранении:', err);
      alert('Ошибка при сохранении счёта!');
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Загрузка счета...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">
          {error}
        </Typography>
        <Button 
          variant="outlined" 
          onClick={fetchInvoiceData}
          sx={{ mt: 2 }}
        >
          Попробовать снова
        </Button>
      </Box>
    );
  }


  // Если всё ещё не загрузили счет
  if (invoiceId && !finalInvoice) {
    return <div>Загрузка...</div>;
  }

  if (!finalInvoice) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Счет не найден</Typography>
      </Box>
    );
  }

  // ---- Ниже ваш исходный рендер, дополним где надо ----
  const currentStatus = localData?.status;

  return (
    <>
      <InvoiceToolbar
        invoice={finalInvoice}
        currentStatus={finalInvoice.status}
        onChangeStatus={handleChangeStatus}
        statusOptions={INVOICE_STATUS_OPTIONS}
      />

      <Card sx={{ pt: 5, px: 5 }}>
        <Box
          sx={{
            rowGap: 5,
            display: 'grid',
            alignItems: 'center',
            gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
          }}
        >
          <Box
            component="img"
            alt="Invoice logo"
            src="/logo/logo-single.svg"
            sx={{ width: 48, height: 48 }}
          />

          <Stack spacing={1} sx={{ alignItems: { xs: 'flex-start', md: 'flex-end' } }}>
            <Label
              variant="soft"
              color={
                (currentStatus === 'paid' && 'success') ||
                (currentStatus === 'pending' && 'warning') ||
                (currentStatus === 'overdue' && 'error') ||
                'default'
              }
            >
              {currentStatus}
            </Label>

            <Typography variant="h6">{localData?.invoiceNumber}</Typography>
          </Stack>

          {/* Если не редактируем, показываем текст, если редактируем — input */}
          {/* FROM */}
          <Stack sx={{ typography: 'body2' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              От
            </Typography>
            {isEditing ? (
              <input
                value={localData?.invoiceFrom?.name || ''}
                onChange={(e) =>
                  handleFieldChange('invoiceFrom', {
                    ...localData.invoiceFrom,
                    name: e.target.value,
                  })
                }
              />
            ) : (
              <>
                {localData?.invoiceFrom?.name}
                <br />
                {localData?.invoiceFrom?.fullAddress}
                <br />
                Телефон: {localData?.invoiceFrom?.phoneNumber}
                <br />
              </>
            )}
          </Stack>

          {/* TO */}
          <Stack sx={{ typography: 'body2' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Кому
            </Typography>
            {isEditing ? (
              <input
                value={localData?.invoiceTo?.name || ''}
                onChange={(e) =>
                  handleFieldChange('invoiceTo', {
                    ...localData.invoiceTo,
                    name: e.target.value,
                  })
                }
              />
            ) : (
              <>
                {localData?.invoiceTo?.name}
                <br />
                {localData?.invoiceTo?.fullAddress}
                <br />
                Телефон: {localData?.invoiceTo?.phoneNumber}
                <br />
              </>
            )}
          </Stack>

          <Stack sx={{ typography: 'body2' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Date create
            </Typography>
            {fDate(localData?.createDate)}
          </Stack>

          <Stack sx={{ typography: 'body2' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Due date
            </Typography>
            {fDate(localData?.dueDate)}
          </Stack>
        </Box>

        <Scrollbar sx={{ mt: 5 }}>
          <Table sx={{ minWidth: 960 }}>
            <TableHead>
              <TableRow>
                <TableCell width={40}>#</TableCell>
                <TableCell sx={{ typography: 'subtitle2' }}>Description</TableCell>
                <TableCell>Qty</TableCell>
                <TableCell align="right">Unit price</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {localData?.items?.map((row, index) => {
                // Если хотим редактировать items
                if (isEditing) {
                  return (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <input
                          style={{ width: 200 }}
                          value={row.title}
                          onChange={(e) => {
                            const newItems = [...localData.items];
                            newItems[index] = {
                              ...newItems[index],
                              title: e.target.value,
                            };
                            setLocalData((prev) => ({ ...prev, items: newItems }));
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <input
                          type="number"
                          style={{ width: 60 }}
                          value={row.quantity}
                          onChange={(e) => {
                            const qty = Number(e.target.value);
                            const newItems = [...localData.items];
                            newItems[index] = {
                              ...newItems[index],
                              quantity: qty,
                            };
                            setLocalData((prev) => ({ ...prev, items: newItems }));
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">{fCurrency(row.price)}</TableCell>
                      <TableCell align="right">{fCurrency(row.price * row.quantity)}</TableCell>
                    </TableRow>
                  );
                }

                // Иначе в режиме просмотра
                return (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Box sx={{ maxWidth: 560 }}>
                        <Typography variant="subtitle2">{row.title}</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                          {row.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{row.quantity}</TableCell>
                    <TableCell align="right">{fCurrency(row.price)}</TableCell>
                    <TableCell align="right">
                      {fCurrency(row.price * row.quantity)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Scrollbar>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <InvoiceTotalSummary
          taxes={localData?.taxes}
          subtotal={localData?.subtotal}
          discount={localData?.discount}
          shipping={localData?.shipping}
          totalAmount={localData?.totalAmount}
        />

        <Divider sx={{ mt: 5, borderStyle: 'dashed' }} />

        <Box
          sx={{
            py: 3,
            gap: 2,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <div>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              NOTES
            </Typography>
            <Typography variant="body2">
              We appreciate your business. Should you need us to add VAT or extra notes let us know!
            </Typography>
          </div>

          <Box sx={{ flexGrow: { md: 1 }, textAlign: { md: 'right' } }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              Have a question?
            </Typography>
            <Typography variant="body2">support@minimals.cc</Typography>
          </Box>
        </Box>

        {/* [NEW CODE] Кнопки для редактирования и сохранения */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          {isEditing ? (
            <Button variant="contained" color="success" onClick={handleSave}>
              Сохранить
            </Button>
          ) : (
            <Button variant="contained" onClick={toggleEditMode}>
              Редактировать
            </Button>
          )}
          {isEditing && (
            <Button color="inherit" onClick={() => setIsEditing(false)}>
              Отмена
            </Button>
          )}
        </Box>
      </Card>
    </>
  );
}

