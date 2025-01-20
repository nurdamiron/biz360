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
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import axiosInstance, { endpoints } from 'src/lib/axios';
import { toast } from 'src/components/snackbar';
import { InvoiceCustomer } from './invoice-customer-view';

export function CustomerList({ open, onClose, onSelect, selected }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Модалка для создания/редактирования
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [currentEditingCustomer, setCurrentEditingCustomer] = useState(null);

  const [hoveredItem, setHoveredItem] = useState(null);

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

  const handleDeleteCustomer = async (event, customerId) => {
    event.stopPropagation();
    try {
      await axiosInstance.delete(`${endpoints.customer.delete}/${customerId}`);
      toast.success('Клиент успешно удалён');
      fetchCustomers();
    } catch (error) {
      console.error('Ошибка при удалении клиента:', error);
      toast.error('Не удалось удалить клиента');
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
          Заказчик
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
              {customers.map((customer) => (
                <ListItem
                key={customer.id}
                onMouseEnter={() => setHoveredItem(customer.id)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={() => handleSelectCustomer(customer)}
                sx={{
                  cursor: 'pointer',
                  py: 2,
                  px: 3,
                  mb: 1, // Добавляем отступы между элементами
                  borderRadius: 1, // Закругляем углы
                  boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)', // Тень для выделения элемента
                  transition: 'all 0.2s',
                  bgcolor: selected === customer.id ? 'action.selected' : 'background.paper',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column', // Отображаем данные в колонку
                    gap: 1, // Расстояние между строками
                  }}
                >
                  <Box sx={{ typography: 'subtitle1', fontWeight: 'bold' }}>{customer.name}</Box>
                  <Box sx={{ typography: 'body2', color: 'text.secondary' }}>
                    БИН/ИИН: {customer.bin_iin}
                  </Box>
                  {/* <Box sx={{ typography: 'body2', color: 'text.secondary' }}>
                    Email: {customer.email}
                  </Box>
                  <Box sx={{ typography: 'body2', color: 'text.secondary' }}>
                    Адрес: {customer.address}
                  </Box> */}
                </Box>
              
                {/* Блок действий */}
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
                      onClick={(e) => handleDeleteCustomer(e, customer.id)}
                      sx={{ mr: 1 }}
                    >
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                    {/* <IconButton
                      edge="end"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectCustomer(customer);
                      }}
                    >
                      <Iconify
                        icon={
                          selected === customer.id ? 'mingcute:check-fill' : 'mingcute:check-line'
                        }
                        sx={{
                          color: selected === customer.id ? 'primary.main' : 'text.secondary',
                        }}
                      />
                    </IconButton> */}
                  </Box>
                )}
              </ListItem>
              
              ))}
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
    </>
  );
}
