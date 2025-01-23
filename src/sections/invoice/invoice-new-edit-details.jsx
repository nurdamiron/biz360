import { useEffect, useState, useCallback } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Box, Stack, Button, Divider, Typography, InputAdornment } from '@mui/material';
import { inputBaseClasses } from '@mui/material/InputBase';
import { fetcher, endpoints } from 'src/lib/axios';
import { Iconify } from 'src/components/iconify';
import { Field } from 'src/components/hook-form';
import MenuItem from '@mui/material/MenuItem';

export const defaultItem = {
  productId: '',
  title: '',
  description: '',
  service: '',
  quantity: 1,
  unit_price: 0,
  total_price: 0,
};

const getFieldNames = (index) => ({
  productId: `items[${index}].productId`,
  title: `items[${index}].title`,
  description: `items[${index}].description`,
  service: `items[${index}].service`,
  quantity: `items[${index}].quantity`,
  unit_price: `items[${index}].unit_price`,
  total_price: `items[${index}].total_price`,
});

function InvoiceItem({ index, onRemove, productList }) {
  const { setValue } = useFormContext();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const fieldNames = getFieldNames(index);

  const handleProductSelect = async (event) => {
    const productId = event.target.value;
    
    if (!productId) {
      setSelectedProduct(null);
      // Reset fields
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
      const productDetails = await fetcher(endpoints.product.details(productId));

      if (productDetails) {
        setSelectedProduct(productDetails);
        setValue(fieldNames.productId, productId);
        setValue(fieldNames.title, productDetails.name || '');
        setValue(fieldNames.description, productDetails.description?.replace(/<[^>]*>?/gm, '') || '');
        setValue(fieldNames.service, productDetails.code || '');
        setValue(fieldNames.unit_price, productDetails.price || 0);
        setValue(fieldNames.quantity, 1);
        setValue(fieldNames.total_price, productDetails.price || 0);
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      setSelectedProduct(null);
    }
  };

  return (
    <Box sx={{ gap: 1.5, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ gap: 2, display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
        <Field.Select
          name={fieldNames.productId}
          label="Выбрать продукт"
          onChange={handleProductSelect}
          slotProps={{
            select: {
              MenuProps: {
                slotProps: {
                  paper: {
                    sx: { maxHeight: 220 },
                  },
                },
              },
            },
          }}
        >
          <MenuItem value="">
            <em>- Не выбрано -</em>
          </MenuItem>
          {productList.map((product) => (
            <MenuItem 
              key={product.id} 
              value={product.id}
              disabled={product.quantity <= 0}
            >
              {product.name} {product.quantity <= 0 ? '(Нет в наличии)' : ''}
            </MenuItem>
          ))}
        </Field.Select>

        {/* <Field.Text
          size="small"
          name={fieldNames.title}
          label="Название"
          disabled
          required
        /> */}

        <Field.Text
          multiline
          maxRows={3}
          size="small"
          name={fieldNames.description}
          label="Описание"
          disabled
        />

        <Field.Text
          size="small"
          name={fieldNames.service}
          label="Номенклатурный номер"
          disabled
          required
        />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Field.Text
            size="small"
            type="number"
            name={fieldNames.quantity}
            label="Количество"
            required
            inputProps={{
              min: 1,
              max: selectedProduct?.quantity || 1
            }}
            sx={{ maxWidth: { md: 96 } }}
          />
          {selectedProduct && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Доступно: {selectedProduct.quantity}
            </Typography>
          )}
        </Box>

        <Field.Text
          size="small"
          name={fieldNames.unit_price}
          label="Цена за ед."
          disabled
          InputProps={{
            startAdornment: <InputAdornment position="start">₸</InputAdornment>,
          }}
          sx={{ maxWidth: { md: 120 } }}
        />

        <Field.Text
          disabled
          size="small"
          name={fieldNames.total_price}
          label="Итого"
          InputProps={{
            startAdornment: <InputAdornment position="start">₸</InputAdornment>,
          }}
          sx={{
            maxWidth: { md: 120 },
            [`& .${inputBaseClasses.input}`]: {
              textAlign: 'right',
            },
          }}
        />
      </Box>

      <Button size="small" color="error" onClick={onRemove}>
        Удалить
      </Button>
    </Box>
  );
}

export function InvoiceNewEditDetails() {
  const { control, setValue, watch } = useFormContext();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productList, setProductList] = useState([]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetcher(endpoints.product.list);
      setProductList(response.products || []);
    } catch (err) {
      setError('Failed to load products. Please try again.');
      console.error('Error fetching products:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const items = watch('items') || [];
  const subtotal = items.reduce((sum, item) => sum + (item.total_price || 0), 0);
  const shipping = watch('shipping') || 0;
  const tax = watch('tax') || 0;
  const discount = watch('discount') || 0;
  const total = subtotal + shipping + tax - discount;

  useEffect(() => {
    setValue('subtotal', subtotal);
    setValue('total', total);
  }, [subtotal, total, setValue]);

  if (isLoading) {
    return <Typography>Загрузка продуктов...</Typography>;
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
        <Button onClick={fetchProducts} sx={{ mt: 2 }}>
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
          <InvoiceItem
            key={item.id}
            index={index}
            onRemove={() => remove(index)}
            productList={productList}
          />
        ))}
      </Stack>

      <Divider sx={{ my: 3, borderStyle: 'dashed' }} />

      <Box sx={{ 
        gap: 3, 
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'flex-end', md: 'center' },
      }}>
        <Button
          size="small"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => append(defaultItem)}
          sx={{ flexShrink: 0 }}
        >
          Добавить товар
        </Button>

        <Box sx={{
          gap: 2,
          width: 1,
          display: 'flex',
          justifyContent: 'flex-end',
          flexDirection: { xs: 'column', md: 'row' },
        }}>
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
            label="Налог"
            name="tax"
            type="number"
            sx={{ maxWidth: { md: 120 } }}
          />
        </Box>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between">
            <Typography>Подытог:</Typography>
            <Typography>{subtotal} ₸</Typography>
          </Stack>

          {shipping > 0 && (
            <Stack direction="row" justifyContent="space-between">
              <Typography>Доставка:</Typography>
              <Typography>+{shipping} ₸</Typography>
            </Stack>
          )}

          {tax > 0 && (
            <Stack direction="row" justifyContent="space-between">
              <Typography>Налог:</Typography>
              <Typography>+{tax} ₸</Typography>
            </Stack>
          )}

          {discount > 0 && (
            <Stack direction="row" justifyContent="space-between">
              <Typography>Скидка:</Typography>
              <Typography color="error">-{discount} ₸</Typography>
            </Stack>
          )}

          <Divider sx={{ borderStyle: 'dashed' }} />

          <Stack direction="row" justifyContent="space-between">
            <Typography variant="h6">Итого:</Typography>
            <Typography variant="h6">{total} ₸</Typography>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}