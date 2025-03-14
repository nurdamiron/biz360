  // src/sections/order/order-supplier-list.jsx
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
  import { OrderSupplierView } from './view/order-supplier-view.jsx';
  import { ConfirmationDialog } from 'src/components/confirmationDialog';
  import { kazakhstanBanks } from '../../utils/kazakhstanBanks';


  export function OrderSupplierList({ open, onClose, onSelect, selected }) {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showSupplierForm, setShowSupplierForm] = useState(false);
    const [currentEditingSupplier, setCurrentEditingSupplier] = useState(null);
    const [hoveredItem, setHoveredItem] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);

    const fetchSuppliers = useCallback(async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(endpoints.supplier.list);
        setSuppliers(response.data.data);
      } catch (error) {
        console.error('Ошибка при загрузке поставщиков:', error);
        toast.error('Не удалось загрузить список поставщиков');
      } finally {
        setLoading(false);
      }
    }, []);

    useEffect(() => {
      if (open) {
        fetchSuppliers();
      }
    }, [open, fetchSuppliers]);

    const handleOpenNewSupplier = () => {
      setCurrentEditingSupplier(null);
      setShowSupplierForm(true);
    };

    const handleOpenEditSupplier = (event, supplier) => {
      event.stopPropagation();
      setCurrentEditingSupplier(supplier);
      setShowSupplierForm(true);
    };

    const handleSupplierSaved = async () => {
      setShowSupplierForm(false);
      await fetchSuppliers();
    };

    const handleSelectSupplier = (supplier) => {
      onSelect(supplier);
      onClose();
    };

    const handleDeleteIconClick = (event, supplierId) => {
      event.stopPropagation();
      setDeleteId(supplierId);
      setShowConfirm(true);
    };

    const handleConfirmDelete = async () => {
      try {
        if (deleteId) {
          await axiosInstance.delete(`${endpoints.supplier.delete}/${deleteId}`);
          toast.success('Поставщик успешно удалён');
          fetchSuppliers();
        }
      } catch (error) {
        console.error('Ошибка при удалении поставщика:', error);
        toast.error('Не удалось удалить поставщика');
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
            Поставщики
            <Button
              size="small"
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={handleOpenNewSupplier}
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
                {suppliers.map((supplier) => {
                  const bank = kazakhstanBanks.find((b) => b.name === supplier.bank_name);

                  return (
                    <ListItem
                      key={supplier.id}
                      onMouseEnter={() => setHoveredItem(supplier.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                      onClick={() => handleSelectSupplier(supplier)}
                      sx={{
                        cursor: 'pointer',
                        py: 2,
                        px: 3,
                        mb: 1,
                        borderRadius: 1,
                        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.2s',
                        bgcolor: selected === supplier.id ? 'action.selected' : 'background.paper',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1,
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight="bold">
                          {supplier.name}
                        </Typography>

                        {/* Тип организации */}
                        {supplier.company_type && (
                          <Typography variant="body2" color="text.secondary">
                            Тип организации: {supplier.company_type}
                          </Typography>
                        )}

                        <Typography variant="body2" color="text.secondary">
                          БИН/ИИН: {supplier.bin_iin}
                        </Typography>

                        {supplier.iik && (
                          <Typography variant="body2" color="text.secondary">
                            Номер счета: {supplier.iik}
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

                      {/* Блок действий */}
                      {(hoveredItem === supplier.id || selected === supplier.id) && (
                        <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                          <IconButton
                            edge="end"
                            color="primary"
                            onClick={(e) => handleOpenEditSupplier(e, supplier)}
                            sx={{ mr: 1 }}
                          >
                            <Iconify icon="solar:pen-bold" />
                          </IconButton>
                          <IconButton
                            edge="end"
                            color="error"
                            onClick={(e) => handleDeleteIconClick(e, supplier.id)}
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

        {/* Модалка создания/редактирования */}
        <OrderSupplierView
          open={showSupplierForm}
          onClose={() => setShowSupplierForm(false)}
          onSave={handleSupplierSaved}
          currentSupplier={currentEditingSupplier}
        />

        {/* Модалка подтверждения */}
        <ConfirmationDialog
          open={showConfirm}
          title="Подтвердите удаление"
          description="Вы действительно хотите удалить поставщика?"
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
