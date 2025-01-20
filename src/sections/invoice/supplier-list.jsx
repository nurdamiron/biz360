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
import { InvoiceSupplier } from './invoice-supplier-view';
import { ConfirmationDialog } from 'src/components/confirmationDialog'; // <-- наш диалог подтверждения

export function SupplierList({ open, onClose, onSelect, selected }) {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [currentEditingSupplier, setCurrentEditingSupplier] = useState(null);

  const [hoveredItem, setHoveredItem] = useState(null);

  // --- Для подтверждения удаления
  const [deleteId, setDeleteId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // Загрузка списка
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

  // После сохранения обновляем список
  const handleSupplierSaved = async () => {
    setShowSupplierForm(false);
    await fetchSuppliers();
  };

  const handleSelectSupplier = (supplier) => {
    onSelect(supplier);
    onClose();
  };

  // Шаг 1: при клике на «Удалить» — показать диалог
  const handleDeleteIconClick = (event, supplierId) => {
    event.stopPropagation();
    setDeleteId(supplierId);
    setShowConfirm(true);
  };

  // Шаг 2: подтвердили удаление => делаем запрос
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
              {suppliers.map((supplier) => (
                <ListItem
                                key={supplier.id}
                                onMouseEnter={() => setHoveredItem(supplier.id)}
                                onMouseLeave={() => setHoveredItem(null)}
                                onClick={() => handleSelectSupplier(supplier)}
                                sx={{
                                  cursor: 'pointer',
                                  py: 2,
                                  px: 3,
                                  mb: 1, // Добавляем отступы между элементами
                                  borderRadius: 1, // Закругляем углы
                                  boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)', // Тень для выделения элемента
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
                                    flexDirection: 'column', // Отображаем данные в колонку
                                    gap: 1, // Расстояние между строками
                                  }}
                                >
                                  <Box sx={{ typography: 'subtitle1', fontWeight: 'bold' }}>{supplier.name}</Box>
                                  <Box sx={{ typography: 'body2', color: 'text.secondary' }}>
                                  БИН/ИИН: {supplier.bin_iin}
                                  </Box>

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
                                    {/* <IconButton
                                      edge="end"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelectsupplier(supplier);
                                      }}
                                    >
                                      <Iconify
                                        icon={
                                          selected === supplier.id ? 'mingcute:check-fill' : 'mingcute:check-line'
                                        }
                                        sx={{
                                          color: selected === supplier.id ? 'primary.main' : 'text.secondary',
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

      {/* Модалка создания/редактирования */}
      <InvoiceSupplier
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
