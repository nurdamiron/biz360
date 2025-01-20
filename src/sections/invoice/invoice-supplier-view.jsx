import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';
import { toast } from 'src/components/snackbar';
import axiosInstance, { endpoints } from 'src/lib/axios';

/*
Пропсы:
- open (boolean) — показывать/скрывать диалог
- onClose (func) — закрыть диалог
- onSave (func) — колбэк после успешного сохранения (чтобы обновить список)
- currentSupplier (object | null) — если есть, значит редактируем
*/

export function InvoiceSupplier({ open, onClose, onSave, currentSupplier }) {
  const isEditMode = Boolean(currentSupplier);

  // Локальный стейт для всех полей
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    address: '',
    company_type: '',
    bin_iin: '',
    bank_name: '',
    bank_bik: '',
    iik: '',
    kbe: '',
    knp: '',
    is_resident: true,
    additional_info: '',
  });

  // При открытии (и при смене currentSupplier) заполняем/очищаем поля
  useEffect(() => {
    if (isEditMode && currentSupplier) {
      setFormData({
        name: currentSupplier.name || '',
        email: currentSupplier.email || '',
        phone_number: currentSupplier.phone_number || '',
        address: currentSupplier.address || '',
        company_type: currentSupplier.company_type || '',
        bin_iin: currentSupplier.bin_iin || '',
        bank_name: currentSupplier.bank_name || '',
        bank_bik: currentSupplier.bank_bik || '',
        iik: currentSupplier.iik || '',
        kbe: currentSupplier.kbe || '',
        knp: currentSupplier.knp || '',
        is_resident:
          currentSupplier.is_resident !== undefined
            ? currentSupplier.is_resident
            : true,
        additional_info: currentSupplier.additional_info
          ? JSON.stringify(currentSupplier.additional_info)
          : '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone_number: '',
        address: '',
        company_type: '',
        bin_iin: '',
        bank_name: '',
        bank_bik: '',
        iik: '',
        kbe: '',
        knp: '',
        is_resident: true,
        additional_info: '',
      });
    }
  }, [isEditMode, currentSupplier]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.phone_number || !formData.address) {
      toast.error('Пожалуйста, заполните хотя бы поля (Имя/Название, E-mail, Телефон, Адрес)');
      return;
    }

    try {
      let additionalInfoParsed = null;
      if (formData.additional_info.trim()) {
        try {
          additionalInfoParsed = JSON.parse(formData.additional_info);
        } catch (error) {
          toast.error('Поле "Доп. информация" должно быть корректным JSON');
          return;
        }
      }

      const payload = {
        ...formData,
        additional_info: additionalInfoParsed,
      };

      if (isEditMode) {
        await axiosInstance.put(
          `${endpoints.supplier.update}/${currentSupplier.id}`,
          payload
        );
        toast.success('Поставщик успешно обновлён!');
      } else {
        await axiosInstance.post(endpoints.supplier.create, payload);
        toast.success('Поставщик успешно создан!');
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Ошибка при сохранении поставщика:', error);
      toast.error('Произошла ошибка при сохранении поставщика');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditMode ? 'Редактировать поставщика' : 'Новый поставщик'}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          <TextField
            label="Имя / Название (обязательно)"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
          <TextField
            label="E-mail (обязательно)"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />
          <TextField
            label="Телефон (обязательно)"
            value={formData.phone_number}
            onChange={(e) => handleChange('phone_number', e.target.value)}
          />
          <TextField
            label="Адрес (обязательно)"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
          />

          <FormControl fullWidth>
            <InputLabel>Тип организации</InputLabel>
            <Select
              value={formData.company_type}
              onChange={(e) => handleChange('company_type', e.target.value)}
            >
              <MenuItem value="ИП">ИП — Индивидуальный предприниматель</MenuItem>
              <MenuItem value="ТОО">ТОО — Товарищество с ограниченной ответственностью</MenuItem>
              <MenuItem value="АО">АО — Акционерное общество</MenuItem>
              <MenuItem value="ПК">ПК — Производственный кооператив</MenuItem>
              <MenuItem value="ГП">ГП — Государственное предприятие</MenuItem>
              <MenuItem value="Ф">Ф — Фонд</MenuItem>
              <MenuItem value="ФП">ФП — Филиал или представительство</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="БИН/ИИН"
            value={formData.bin_iin}
            onChange={(e) => handleChange('bin_iin', e.target.value)}
          />
          <TextField
            label="Название банка"
            value={formData.bank_name}
            onChange={(e) => handleChange('bank_name', e.target.value)}
          />
          <TextField
            label="БИК (Банковский идентификационный код)"
            value={formData.bank_bik}
            onChange={(e) => handleChange('bank_bik', e.target.value)}
          />
          <TextField
            label="ИИК (Индивидуальный идентификационный код)"
            value={formData.iik}
            onChange={(e) => handleChange('iik', e.target.value)}
          />
          <TextField
            label="КБЕ (Код Бенефициара)"
            value={formData.kbe}
            onChange={(e) => handleChange('kbe', e.target.value)}
          />
          <TextField
            label="КНП (Код назначения платежа)"
            value={formData.knp}
            onChange={(e) => handleChange('knp', e.target.value)}
          />

          <FormControlLabel
            label="Является резидентом?"
            control={
              <Checkbox
                checked={formData.is_resident}
                onChange={(e) => handleChange('is_resident', e.target.checked)}
              />
            }
          />

          <TextField
            label="Доп. информация"
            multiline
            rows={3}
            value={formData.additional_info}
            onChange={(e) => handleChange('additional_info', e.target.value)}
            helperText="Можно хранить произвольные поля в формате JSON"
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button color="inherit" onClick={onClose}>
          Отмена
        </Button>
        <Button variant="contained" onClick={handleSubmit}>
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
}
