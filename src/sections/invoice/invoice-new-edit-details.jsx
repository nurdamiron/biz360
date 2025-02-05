// invoice-new-edit-details.jsx

import { useEffect, useState, useCallback } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import {
  Box,
  Stack,
  Button,
  Divider,
  Typography,
  InputAdornment,
} from '@mui/material';
import { inputBaseClasses } from '@mui/material/InputBase';
import MenuItem from '@mui/material/MenuItem';

import { Iconify } from 'src/components/iconify';
import { Field } from 'src/components/hook-form';
import { fetcher, endpoints } from 'src/lib/axios';

// Исходные поля для новой строки
export const defaultItem = {
  productId: '',
  title: '',
  description: '',
  service: '',
  quantity: 1,
  unit_price: 0,
  total_price: 0,
};

// Функция-утилита: получить имена полей для items[index]
const getFieldNames = (index) => ({
  productId: `items[${index}].productId`,
  title: `items[${index}].title`,
  description: `items[${index}].description`,
  service: `items[${index}].service`,
  quantity: `items[${index}].quantity`,
  unit_price: `items[${index}].unit_price`,
  total_price: `items[${index}].total_price`,
});

// Компонент «одна позиция товара»
function InvoiceItemRow({ index, onRemove, productList }) {
  const { watch, setValue } = useFormContext();
  const fieldNames = getFieldNames(index);

  // Локально храним детали выбранного товара (чтобы отобразить «Доступно: N»)
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Следим за количеством и ценой
  const quantity = watch(fieldNames.quantity) || 1;
  const unitPrice = watch(fieldNames.unit_price) || 0;

  // При выборе товара
  const handleSelectProduct = async (event) => {
    const productId = event.target.value;

    // Если пользователь сбросил выбор:
    if (!productId) {
      setSelectedProduct(null);
      setValue(fieldNames.productId, '');
      setValue(fieldNames.title, '');
      setValue(fieldNames.description, '');
      setValue(fieldNames.service, '');
      setValue(fieldNames.unit_price, 0);
      setValue(fieldNames.quantity, 1);
      setValue(fieldNames.total_price, 0);
      return;
    }

    try {
      // Фетчим детали
      const productResp = await fetcher(endpoints.product.details(productId));
      // Ваш бэкенд возвращает { success: true, data: {...} }, значит берем productResp.data
      const prod = productResp.data;
      
      if (prod) {
        setSelectedProduct(prod);

        // Заполняем поля формы
        setValue(fieldNames.productId, productId);
        setValue(fieldNames.title, prod.name || '');
        setValue(
          fieldNames.description,
          prod.description?.replace(/<[^>]*>?/gm, '') || ''
        );
        setValue(fieldNames.service, prod.code || '');
        setValue(fieldNames.unit_price, prod.price || 0);

        // Количество по умолчанию = 1
        setValue(fieldNames.quantity, 1);

        // Пересчёт total_price = price * 1
        const total = (prod.price || 0) * 1;
        setValue(fieldNames.total_price, total);
      }
    } catch (error) {
      console.error('Ошибка при получении деталей товара:', error);
      setSelectedProduct(null);
    }
  };

  // Автоматический пересчёт «Итого» (total_price) при изменении quantity / unitPrice
  useEffect(() => {
    const total = Number(quantity) * Number(unitPrice);
    setValue(fieldNames.total_price, total);
  }, [quantity, unitPrice, setValue, fieldNames.total_price]);

  return (
    <Box sx={{ gap: 1.5, display: 'flex', flexDirection: 'column' }}>
      {/* Блок с полями в одну строку (или колонку на мобиле) */}
      <Box
        sx={{
          gap: 2,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        {/* Селект: Выбрать продукт */}
        <Field.Select
          name={fieldNames.productId}
          label="Выбрать продукт"
          onChange={handleSelectProduct}
          slotProps={{
            select: {
              MenuProps: {
                slotProps: {
                  paper: { sx: { maxHeight: 220 } },
                },
              },
            },
          }}
        >
          <MenuItem value="">
            <em>- Не выбрано -</em>
          </MenuItem>
          {productList.map((p) => (
            <MenuItem key={p.id} value={p.id} disabled={p.quantity <= 0}>
              {p.name} {p.quantity <= 0 ? '(нет в наличии)' : ''}
            </MenuItem>
          ))}
        </Field.Select>

        {/* Номенклатурный номер (read-only) */}
        <Field.Text
          size="small"
          name={fieldNames.service}
          label="Номенклатурный номер"
          disabled
        />

        {/* Количество */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Field.Text
            size="small"
            type="number"
            name={fieldNames.quantity}
            label="Кол-во"
            inputProps={{
              min: 1,
            }}
            sx={{ maxWidth: { md: 80 } }}
          />

          {/* Если есть выбранный товар, показываем «Доступно: ...» + предупреждение */}
          {selectedProduct && (
            <>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Доступно: {selectedProduct.quantity}
              </Typography>
              {Number(quantity) > selectedProduct.quantity && (
                <Typography variant="caption" color="error">
                  Вы пытаетесь ввести больше, чем доступно!
                </Typography>
              )}
            </>
          )}
        </Box>

        {/* Цена (read-only) */}
        <Field.Text
          size="small"
          name={fieldNames.unit_price}
          label="Цена"
          disabled
          InputProps={{
            startAdornment: <InputAdornment position="start">₸</InputAdornment>,
          }}
          sx={{ maxWidth: { md: 100 } }}
        />

        {/* Итог (read-only) */}
        <Field.Text
          disabled
          size="small"
          name={fieldNames.total_price}
          label="Итого"
          InputProps={{
            startAdornment: <InputAdornment position="start">₸</InputAdornment>,
          }}
          sx={{
            maxWidth: { md: 110 },
            [`& .${inputBaseClasses.input}`]: {
              textAlign: 'right',
            },
          }}
        />
      </Box>

      {/* Кнопка "Удалить" строку */}
      <Button size="small" color="error" onClick={onRemove}>
        Удалить
      </Button>
    </Box>
  );
}

// Основной компонент «InvoiceNewEditDetails»
export function InvoiceNewEditDetails() {
  const { control, setValue, watch } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const [productList, setProductList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Фетч списка продуктов (один раз)
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Запрашиваем список продуктов
      const response = await fetcher(endpoints.product.list);
      // Предположим формат { products: [ {id, name, price, quantity, ...}, ... ] }
      setProductList(response.products || []);
    } catch (err) {
      console.error('Ошибка загрузки продуктов:', err);
      setError('Не удалось загрузить список продуктов');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Слежение за полями формы
  const items = watch('items') || [];
  const shipping = watch('shipping') || 0;
  const discount = watch('discount') || 0;
  const tax = watch('tax') || 0;

  // Подытог = сумма total_price по всем строкам
  const subtotal = items.reduce((acc, it) => acc + (Number(it.total_price) || 0), 0);
  // Итого = subtotal + shipping + tax - discount
  const total = subtotal + Number(shipping) + Number(tax) - Number(discount);

  // Записываем в форму
  useEffect(() => {
    setValue('subtotal', subtotal);
    setValue('total', total);
  }, [subtotal, total, setValue]);

  // Если идёт загрузка
  if (isLoading) {
    return <Typography>Загрузка списка продуктов...</Typography>;
  }

  // Если ошибка
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
        <Button variant="outlined" onClick={fetchProducts} sx={{ mt: 2 }}>
          Повторить попытку
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ color: 'text.disabled', mb: 3 }}>
        Детали заказа:
      </Typography>

      {/* Список позиций (InvoiceItemRow) */}
      <Stack divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />} spacing={3}>
        {fields.map((item, index) => (
          <InvoiceItemRow
            key={item.id}
            index={index}
            productList={productList}
            onRemove={() => remove(index)}
          />
        ))}
      </Stack>

      <Divider sx={{ my: 3, borderStyle: 'dashed' }} />

      {/* Кнопка «Добавить товар» + поля «Доставка, Скидка, Налог» */}
      <Box
        sx={{
          gap: 3,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-end', md: 'center' },
        }}
      >
        <Button
          size="small"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => append(defaultItem)}
          sx={{ flexShrink: 0 }}
        >
          Добавить товар
        </Button>

        <Box
          sx={{
            gap: 2,
            width: 1,
            display: 'flex',
            justifyContent: 'flex-end',
            flexDirection: { xs: 'column', md: 'row' },
          }}
        >
          <Field.Text
            size="small"
            label="Доставка"
            name="shipping"
            type="number"
            sx={{ maxWidth: { md: 120 } }}
          />

          <Field.Text
            size="small"
            label="Скидка"
            name="discount"
            type="number"
            sx={{ maxWidth: { md: 120 } }}
          />

          <Field.Text
            size="small"
            label="Сумма НДС (12%)"
            name="tax"
            type="number"
            sx={{ maxWidth: { md: 150 } }}
          />
        </Box>
      </Box>

      {/* Итоговая часть */}
      <Box sx={{ mt: 3 }}>
        <Stack spacing={2}>
          {/* Подытог */}
          <Stack direction="row" justifyContent="space-between">
            <Typography>Подытог:</Typography>
            <Typography>{subtotal.toLocaleString()} ₸</Typography>
          </Stack>

          {/* Доставка */}
          {shipping > 0 && (
            <Stack direction="row" justifyContent="space-between">
              <Typography>Доставка:</Typography>
              <Typography>+{shipping} ₸</Typography>
            </Stack>
          )}

          {/* Налог */}
          {tax > 0 && (
            <Stack direction="row" justifyContent="space-between">
              <Typography>Налог:</Typography>
              <Typography>+{tax} ₸</Typography>
            </Stack>
          )}

          {/* Скидка */}
          {discount > 0 && (
            <Stack direction="row" justifyContent="space-between">
              <Typography>Скидка:</Typography>
              <Typography color="error">-{discount} ₸</Typography>
            </Stack>
          )}

          <Divider sx={{ borderStyle: 'dashed' }} />

          {/* Итого */}
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="h6">Итого:</Typography>
            <Typography variant="h6">{total.toLocaleString()} ₸</Typography>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
