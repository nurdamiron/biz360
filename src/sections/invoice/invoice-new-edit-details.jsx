// invoice-new-edit-details.jsx

import { useState, useEffect, useCallback } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
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


// Исходные поля для новой строки (товара)
export const defaultItem = {
  productId: '',
  title: '',
  description: '',
  service: '',
  quantity: 1,
  unit_price: 0,
  total_price: 0,
};

// Функция-утилита: получить имена полей items[index]
const getFieldNames = (index) => ({
  productId: `items[${index}].productId`,
  title: `items[${index}].title`,
  description: `items[${index}].description`,
  service: `items[${index}].service`,
  quantity: `items[${index}].quantity`,
  unit_price: `items[${index}].unit_price`,
  total_price: `items[${index}].total_price`,
});

function shouldApplyVat(companyType) {
  if (!companyType) return false;
  const vatCompanies = ['ТОО', 'АО', 'ГП', 'ПК'];
  return vatCompanies.includes(companyType);
}

// Одна строка (товар) в списке
function InvoiceItemRow({ index, onRemove, productList }) {
  const { watch, setValue } = useFormContext();
  const fieldNames = getFieldNames(index);

  // Храним детали выбранного товара (для "Доступно: ...")
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Следим за кол-вом и ценой
  const quantity = watch(fieldNames.quantity) || 1;
  const unitPrice = watch(fieldNames.unit_price) || 0;

  // При выборе товара в Select
  const handleSelectProduct = async (event) => {
    const productId = event.target.value;
    if (!productId) {
      // Сброс
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

    const existingItem = watch('items').find((item, i) => i !== index && item.productId === productId);
    if (existingItem) {
      alert('Этот товар уже добавлен в счет!');
      return;
    }

    try {
      const productResp = await fetcher(endpoints.product.details(productId));
      const prod = productResp.data; 
      if (prod) {
        setSelectedProduct(prod);

        // Заполняем поля
        setValue(fieldNames.productId, productId);
        setValue(fieldNames.title, prod.name || '');
        setValue(
          fieldNames.description,
          prod.description?.replace(/<[^>]*>?/gm, '') || ''
        );
        setValue(fieldNames.service, prod.code || '');
        setValue(fieldNames.unit_price, prod.price || 0);
        setValue(fieldNames.quantity, 1);

        // total_price = price * 1
        setValue(fieldNames.total_price, prod.price || 0);
      }
    } catch (error) {
      console.error('Ошибка при получении деталей:', error);
      setSelectedProduct(null);
    }
  };

  // Пересчёт total_price при изменениях
  useEffect(() => {
    const total = Number(quantity) * Number(unitPrice);
    setValue(fieldNames.total_price, total);
  }, [quantity, unitPrice, setValue, fieldNames.total_price]);

  return (
    <Box sx={{ gap: 1.5, display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          gap: 2,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        {/* Селект продукта */}
        <Field.Select
          name={fieldNames.productId}
          label="Выбрать продукт"
          onChange={handleSelectProduct}
          slotProps={{
            select: {
              MenuProps: {
                slotProps: { paper: { sx: { maxHeight: 100, maxWidth: 200 } } },
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
          sx={{ maxWidth: { md: 150} }}

        />

        {/* Количество */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Field.Text
            size="small"
            type="number"
            name={fieldNames.quantity}
            label="Кол-во"
            inputProps={{ min: 1 }}
            sx={{ maxWidth: { md: 300} }}
          />

          {/* «Доступно: ...» + проверка на превышение */}
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

        {/* Цена */}
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

        {/* Итого */}
        <Field.Text
          disabled
          size="small"
          name={fieldNames.total_price}
          label="Итого"
          InputProps={{
            startAdornment: <InputAdornment position="start">₸</InputAdornment>,
          }}
          sx={{
            maxWidth: { md: 150 },
            [`& .${inputBaseClasses.input}`]: {
              textAlign: 'right',
            },
          }}
        />
      </Box>

      {/* Кнопка Удалить строку */}
      <Button size="small" color="error" onClick={onRemove}>
        Удалить
      </Button>
    </Box>
  );
}

export function InvoiceNewEditDetails() {
  const { control, setValue, watch } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  // 2) Определяем логику «НДС включать или нет» по company_type поставщика
  const supplierCompanyType = watch('supplier_company_type');
  const isVatSupplier = shouldApplyVat(supplierCompanyType);

  const [productList, setProductList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 3) Функция загрузки списка продуктов
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetcher(endpoints.product.list);
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
  

  // Достаём нужные поля
  const items = watch('items') || [];
  const shipping = Number(watch('shipping') || 0);
  const discount = Number(watch('discount') || 0);

  const total = items.reduce((acc, item) => acc + (Number(item.total_price) || 0), 0) + shipping - discount;


  // Подытог
  const subtotal = isVatSupplier ? Number((total / 1.12).toFixed(2)) : total;
  const tax = isVatSupplier ? Number((subtotal * 0.12).toFixed(2)) : 0;

  // Если поставщик платит НДС => tax = 12% от subtotal
  useEffect(() => {
    if (isVatSupplier) {
      setValue('tax', tax);
    } else {
      setValue('tax', 0);
    }
  }, [isVatSupplier, subtotal, setValue]);
  // Итого
  const realTax = isVatSupplier ? watch('tax') : 0;

  // Записываем итог в form
  useEffect(() => {
    setValue('subtotal', subtotal);
    setValue('tax', tax);
    setValue('total', total);
  
    console.log('🔹 subtotal:', subtotal);
    console.log('🔹 tax:', tax);
    console.log('🔹 total:', total);
  }, [subtotal, tax, total, setValue]);

  if (isLoading) {
    return <Typography>Загрузка списка продуктов...</Typography>;
  }
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

      <Stack divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />} spacing={3}>
        {fields.map((item, index) => (
          <InvoiceItemRow key={item.id} index={index} productList={productList} onRemove={() => remove(index)} />
        ))}
      </Stack>

      <Divider sx={{ my: 3, borderStyle: 'dashed' }} />

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
          onClick={() => {
            const existingProductIds = watch('items').map(item => item.productId);
            if (existingProductIds.includes('')) {
              alert('Сначала выберите продукт для текущей строки перед добавлением новой.');
              return;
            }
            append(defaultItem);
            }}
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
          {/* Доставка */}
          <Field.Text
            size="small"
            label="Доставка"
            name="shipping"
            type="number"
            sx={{ maxWidth: { md: 120 } }}
          />

          {/* Скидка */}
          <Field.Text
            size="small"
            label="Скидка"
            name="discount"
            type="number"
            sx={{ maxWidth: { md: 120 } }}
          />

          {/* Если поставщик с НДС, показываем «Сумма НДС (12%)» (disabled) */}
          {isVatSupplier && (
            <Field.Text
              size="small"
              label="Сумма НДС (12%)"
              name="tax"
              type="number"
              disabled
              sx={{ maxWidth: { md: 150 } }}
            />
          )}
        </Box>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Stack spacing={2}>
          {/* Подытог */}
          <Stack direction="row" justifyContent="space-between">
              <Typography>Сумма без НДС:</Typography>
              <Typography>{subtotal.toLocaleString()} ₸</Typography>
            </Stack>

          {/* {shipping > 0 && (
            <Stack direction="row" justifyContent="space-between">
              <Typography>Доставка:</Typography>
              <Typography>+{shipping} ₸</Typography>
            </Stack>
          )} */}

          {isVatSupplier && (
            <Stack direction="row" justifyContent="space-between">
              <Typography>НДС (12%):</Typography>
              <Typography>{tax.toLocaleString()} ₸</Typography>
            </Stack>
          )}

          {/* {discount > 0 && (
            <Stack direction="row" justifyContent="space-between">
              <Typography>Скидка:</Typography>
              <Typography color="error">-{discount} ₸</Typography>
            </Stack>
          )} */}

          <Divider sx={{ borderStyle: 'dashed' }} />

          {/* Итого */}
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="h6">Итого (с НДС):</Typography>
            <Typography variant="h6">{total.toLocaleString()} ₸</Typography>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}

