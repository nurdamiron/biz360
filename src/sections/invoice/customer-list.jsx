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
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(endpoints.customer.list);
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
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

  const handleNewCustomer = async (customer) => {
    setShowNewCustomer(false);
    await fetchCustomers();
  };

  const handleSelectCustomer = (customer) => {
    onSelect(customer);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Выбрать клиента
          <Button
            size="small"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => setShowNewCustomer(true)}
          >
            Новый клиент
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
                    transition: 'all 0.2s',
                    bgcolor: selected === customer.id ? 'action.selected' : 'transparent',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Box sx={{ typography: 'subtitle2' }}>{customer.name}</Box>
                        <Box sx={{ typography: 'body2', color: 'text.secondary' }}>
                          {customer.phone_number}
                        </Box>
                      </Box>

                      <Box sx={{ typography: 'body2', color: 'text.secondary' }}>
                        {customer.email}
                      </Box>
                      
                      <Box sx={{ typography: 'body2', color: 'text.secondary' }}>
                        {customer.address}
                      </Box>
                    </Box>

                    {/* Показываем иконку выбора только при наведении или если элемент выбран */}
                    {(hoveredItem === customer.id || selected === customer.id) && (
                      <IconButton 
                        edge="end" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectCustomer(customer);
                        }}
                        sx={{ ml: 2 }}
                      >
                        <Iconify 
                          icon={selected === customer.id ? "mingcute:check-fill" : "mingcute:check-line"}
                          sx={{ 
                            color: selected === customer.id ? 'primary.main' : 'text.secondary',
                          }}
                        />
                      </IconButton>
                    )}
                  </Box>
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
        open={showNewCustomer}
        onClose={() => setShowNewCustomer(false)}
        onSave={handleNewCustomer}
      />
    </>
  );
}