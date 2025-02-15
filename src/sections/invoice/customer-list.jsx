import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  List,
  Dialog,
  Button,
  ListItem,
  IconButton,
  DialogTitle,
  DialogActions,
  DialogContent,
  CircularProgress,
  Avatar,
  Typography,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import axiosInstance, { endpoints } from 'src/lib/axios';
import { toast } from 'src/components/snackbar';
import { InvoiceCustomer } from './invoice-customer-view';
import { ConfirmationDialog } from 'src/components/confirmationDialog';
import { kazakhstanBanks } from './kazakhstanBanks';


export function CustomerList({ open, onClose, onSelect, selected }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [currentEditingCustomer, setCurrentEditingCustomer] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(endpoints.customer.list);
      setCustomers(response.data.data);
    } catch (error) {
      console.error('Ошибка при загрузке клиентов:', error);
      toast.error('Не удалось загрузить список клиентов');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchCustomers();
    }
  }, [open, fetchCustomers]);

  const handleOpenNewCustomer = () => {
    setCurrentEditingCustomer(null);
    setShowCustomerForm(true);
  };

  const handleOpenEditCustomer = (event, customer) => {
    event.stopPropagation();
    setCurrentEditingCustomer(customer);
    setShowCustomerForm(true);
  };

  const handleCustomerSaved = async () => {
    setShowCustomerForm(false);
    await fetchCustomers();
  };

  const handleSelectCustomer = (customer) => {
    onSelect(customer);
    onClose();
  };

  const handleDeleteIconClick = (event, customerId) => {
    event.stopPropagation();
    setDeleteId(customerId);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (deleteId) {
        await axiosInstance.delete(endpoints.customer.delete(deleteId));
        toast.success('Клиент успешно удалён');
        fetchCustomers();
      }
    } catch (error) {
      console.error('Ошибка при удалении клиента:', error);
      toast.error('Не удалось удалить клиента');
    } finally {
      setShowConfirm(false);
      setDeleteId(null);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          Заказчики
          <Button
            size="small"
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={handleOpenNewCustomer}
          >
            Новый
          </Button>
        </DialogTitle>

        <DialogContent sx={{ minHeight: 400 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <List sx={{ width: '100%' }}>
              {customers.map((customer) => {
                const bank = kazakhstanBanks.find((b) => b.name === customer.bank_name);

                return (
                  <ListItem
                    key={customer.id}
                    onMouseEnter={() => setHoveredItem(customer.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    onClick={() => handleSelectCustomer(customer)}
                    sx={{
                      cursor: 'pointer',
                      py: 2,
                      px: 3,
                      mb: 1,
                      borderRadius: 1,
                      boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.2s',
                      bgcolor: selected === customer.id ? 'action.selected' : 'background.paper',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {customer.name}
                      </Typography>

                      {customer.company_type && (
                        <Typography variant="body2" color="text.secondary">
                          Тип организации: {customer.company_type}
                        </Typography>
                      )}

                      <Typography variant="body2" color="text.secondary">
                        БИН/ИИН: {customer.bin_iin}
                      </Typography>

                      {customer.iik && (
                        <Typography variant="body2" color="text.secondary">
                          Номер счета: {customer.iik}
                        </Typography>
                      )}

                      {bank && (
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar src={bank.logo} alt={bank.name} sx={{ width: 24, height: 24 }} />
                          <Typography variant="body2">{bank.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            (БИК: {bank.bik})
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {(hoveredItem === customer.id || selected === customer.id) && (
                      <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                        <IconButton
                          edge="end"
                          color="primary"
                          onClick={(e) => handleOpenEditCustomer(e, customer)}
                          sx={{ mr: 1 }}
                        >
                          <Iconify icon="solar:pen-bold" />
                        </IconButton>
                        <IconButton
                          edge="end"
                          color="error"
                          onClick={(e) => handleDeleteIconClick(e, customer.id)}
                          sx={{ mr: 1 }}
                        >
                          <Iconify icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                      </Box>
                    )}
                  </ListItem>
                );
              })}
            </List>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} color="inherit">
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>

      <InvoiceCustomer
        open={showCustomerForm}
        onClose={() => setShowCustomerForm(false)}
        onSave={handleCustomerSaved}
        currentCustomer={currentEditingCustomer}
      />

      <ConfirmationDialog
        open={showConfirm}
        title="Подтвердите удаление"
        description="Вы действительно хотите удалить клиента?"
        confirmText="Удалить"
        cancelText="Отмена"
        onConfirm={handleConfirmDelete}
        onClose={() => {
          setShowConfirm(false);
          setDeleteId(null);
        }}
      />
    </>
  );
}