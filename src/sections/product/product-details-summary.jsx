import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Rating from '@mui/material/Rating';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { linkClasses } from '@mui/material/Link';
import { formHelperTextClasses } from '@mui/material/FormHelperText';
import axios from 'axios';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { fCurrency, fShortenNumber } from 'src/utils/format-number';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { ColorPicker } from 'src/components/color-utils';
import { NumberInput } from 'src/components/number-input';

const WS_URL = import.meta.env ? import.meta.env.VITE_WS_URL : 'wss://biz360-backend.onrender.com/ws';
const logPrefix = '[ProductDetailsSummary]';

const logger = {
  info: (message, data) => {
    console.info(`${logPrefix} ${message}`, data || '');
  },
  error: (message, error) => {
    console.error(`${logPrefix} ${message}`, error);
  },
  warn: (message, data) => {
    console.warn(`${logPrefix} ${message}`, data || '');
  },
  debug: (message, data) => {
    console.debug(`${logPrefix} ${message}`, data || '');
  },
};

export function ProductDetailsSummary({ 
  productId, 
  items = [], 
  onAddToCart, 
  disableActions, 
  ...other 
}) {
  const router = useRouter();
  const ws = useRef(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const defaultValues = {
    id: '',
    name: '',
    coverUrl: '',
    available: 0,
    price: 0,
    colors: [],
    size: '',
    quantity: 1,
  };

  const methods = useForm({
    defaultValues,
  });

  const { watch, control, setValue, handleSubmit, reset } = methods;
  const values = watch();

  const fetchProduct = async () => {
    logger.info('Fetching product details', { productId });
    try {
      setLoading(true);
      const response = await axios.get(`https://biz360-backend.onrender.com/api/product/details/${productId}`);
      
      // The API returns the product directly without a success flag
      const productData = response.data;
      logger.info('Product details fetched successfully', {
        productId,
        name: productData.name,
      });
  
      setProduct(productData);
      
      logger.debug('Updating form with new product data', {
        id: productData.id,
        name: productData.name,
        available: productData.available,
      });
  
      // Update form with received data
      reset({
        id: productData.id,
        name: productData.name,
        coverUrl: productData.images?.[0] || '',
        available: productData.available || 0,
        price: productData.price || 0,
        colors: productData.colors?.[0] || '',
        size: productData.sizes?.[0] || '',
        quantity: (productData.available || 0) < 1 ? 0 : 1,
      });
      
    } catch (fetchError) {
      logger.error('Error occurred while fetching product', {
        productId,
        error: fetchError.message,
      });
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  useEffect(() => {
    if (!productId) {
      return undefined;
    }

    logger.info('Initializing WebSocket connection', { productId });

    // WebSocket message handler
const handleWebSocketMessage = (event) => {
  try {
    const data = JSON.parse(event.data);
    // Check if the message contains a products array
    const productData = data.products ? data.products[0] : data;
    
    if (productData.id === productId) {
      logger.debug('Received WebSocket update', {
        productId,
        updatedFields: Object.keys(productData),
      });

      setProduct((prev) => {
        const updated = { ...prev, ...productData };
        logger.debug('Updated product state', {
          productId,
          available: updated.available,
          price: updated.price,
        });
        return updated;
      });
      
      // Update form values if necessary
      if (productData.available !== undefined) {
        logger.debug('Updating available quantity', {
          productId,
          available: productData.available,
        });
        setValue('available', productData.available);
      }
      if (productData.price !== undefined) {
        logger.debug('Updating price', {
          productId,
          price: productData.price,
        });
        setValue('price', productData.price);
      }
    }
  } catch (wsError) {
    logger.error('WebSocket message processing error', {
      error: wsError.message,
      data: event.data,
    });
  }
};


    ws.current = new WebSocket(`${WS_URL}?productId=${productId}`);
    ws.current.onmessage = handleWebSocketMessage;
    
    ws.current.onopen = () => {
      logger.info('WebSocket connection established', { productId });
    };

    ws.current.onerror = (wsError) => {
      logger.error('WebSocket error occurred', {
        productId,
        error: wsError,
      });
    };

    ws.current.onclose = () => {
      logger.info('WebSocket connection closed', { productId });
    };
    
    return () => {
      logger.info('Cleaning up WebSocket connection', { productId });
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.close();
      }
    };
  }, [productId, setValue]);

  const existProduct = items.some((item) => item.id === product?.id);
  const isMaxQuantity = items.some((item) => 
    item.id === product?.id && item.quantity >= product.available
  );

  const onSubmit = handleSubmit(async (data) => {
    logger.info('Processing form submission', {
      productId: data.id,
      quantity: data.quantity,
    });

    try {
      if (!existProduct) {
        logger.debug('Adding new product to cart', {
          productId: data.id,
          quantity: data.quantity,
        });
        onAddToCart?.({ ...data, colors: [values.colors] });
      }
      
      logger.info('Navigating to checkout', { productId: data.id });
      router.push(paths.product.checkout);
    } catch (error) {
      logger.error('Error processing form submission', {
        productId: data.id,
        error: error.message,
      });
    }
  });

  const handleAddCart = useCallback(() => {
    logger.info('Adding product to cart', {
      productId: values.id,
      quantity: values.quantity,
    });

    try {
      onAddToCart?.({
        ...values,
        colors: [values.colors],
        subtotal: values.price * values.quantity,
      });

      logger.debug('Product added to cart successfully', {
        productId: values.id,
        quantity: values.quantity,
        subtotal: values.price * values.quantity,
      });
    } catch (error) {
      logger.error('Error adding product to cart', {
        productId: values.id,
        error: error.message,
      });
    }
  }, [onAddToCart, values]);

  if (loading || !product) {
    return (
      <Stack spacing={3} sx={{ pt: 3 }} {...other}>
        <Stack spacing={2}>
          <Box sx={{ width: 100, height: 24, bgcolor: 'grey.200', borderRadius: 0.5 }} />
          <Box sx={{ width: 200, height: 32, bgcolor: 'grey.200', borderRadius: 0.5 }} />
          <Box sx={{ width: 120, height: 24, bgcolor: 'grey.200', borderRadius: 0.5 }} />
        </Stack>
      </Stack>
    );
  }

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Stack spacing={3} sx={{ pt: 3 }} {...other}>
        <Stack spacing={2} alignItems="flex-start">
          {product.new_label && (
            <Label color="info">{product.new_label}</Label>
          )}
          
          {product.sale_label && (
            <Label color="error">{product.sale_label}</Label>
          )}

          <Box
            component="span"
            sx={{
              typography: 'overline',
              color: product.available > 0 ? 'success.main' : 'error.main',
            }}
          >
            {product.available > 0 ? 'В наличии' : 'Нет в наличии'}
          </Box>

          <Typography variant="h5">{product.name}</Typography>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Rating 
              size="small" 
              value={product.ratings || 0} 
              precision={0.1} 
              readOnly 
              sx={{ mr: 1 }} 
            />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {product.totalReviews 
                ? `(${fShortenNumber(product.totalReviews)} отзывов)` 
                : '(Нет отзывов)'}
            </Typography>
          </Box>

          <Box sx={{ typography: 'h5' }}>
            {product.price_sale && (
              <Box
                component="span"
                sx={{ color: 'text.disabled', textDecoration: 'line-through', mr: 0.5 }}
              >
                {fCurrency(product.price_sale)}
              </Box>
            )}
            {fCurrency(product.price)}
          </Box>

          {product.sub_description && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {product.sub_description}
            </Typography>
          )}
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        {product.colors?.length > 0 && (
          <Box sx={{ display: 'flex' }}>
            <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
              Цвет
            </Typography>

            <Controller
              name="colors"
              control={control}
              render={({ field }) => (
                <ColorPicker
                  options={product.colors}
                  value={field.value}
                  onChange={(color) => field.onChange(color)}
                  limit={4}
                />
              )}
            />
          </Box>
        )}

        {product.sizes?.length > 0 && (
          <Box sx={{ display: 'flex' }}>
            <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
              Размер
            </Typography>

            <Field.Select
              name="size"
              size="small"
              helperText={
                <Link underline="always" color="text.primary">
                  Таблица размеров
                </Link>
              }
              sx={{
                maxWidth: 88,
                [`& .${formHelperTextClasses.root}`]: { mx: 0, mt: 1, textAlign: 'right' },
              }}
            >
              {product.sizes.map((size) => (
                <MenuItem key={size} value={size}>
                  {size}
                </MenuItem>
              ))}
            </Field.Select>
          </Box>
        )}

        <Box sx={{ display: 'flex' }}>
          <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
            Количество
          </Typography>

          <Stack spacing={1}>
            <NumberInput
              hideDivider
              value={values.quantity}
              onChange={(event, quantity) => setValue('quantity', quantity)}
              max={product.available}
              sx={{ maxWidth: 112 }}
            />

            <Typography
              variant="caption"
              component="div"
              sx={{ textAlign: 'right', color: 'text.secondary' }}
            >
              Доступно: {product.available}
            </Typography>
          </Stack>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box sx={{ gap: 2, display: 'flex' }}>
          <Button
            fullWidth
            disabled={isMaxQuantity || disableActions || product.available < 1}
            size="large"
            color="warning"
            variant="contained"
            startIcon={<Iconify icon="solar:cart-plus-bold" width={24} />}
            onClick={handleAddCart}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Добавить в корзину
          </Button>

          <Button 
            fullWidth 
            size="large" 
            type="submit" 
            variant="contained" 
            disabled={disableActions || product.available < 1}
          >
            Купить сейчас
          </Button>
        </Box>

        <Box
          sx={{
            gap: 3,
            display: 'flex',
            justifyContent: 'center',
            [`& .${linkClasses.root}`]: {
              gap: 1,
              alignItems: 'center',
              display: 'inline-flex',
              color: 'text.secondary',
              typography: 'subtitle2',
            },
          }}
        >
          <Link>
            <Iconify icon="mingcute:add-line" width={16} />
            Сравнивать
          </Link>

          <Link>
            <Iconify icon="solar:heart-bold" width={16} />
            Избранное
          </Link>

          <Link>
            <Iconify icon="solar:share-bold" width={16} />
            Поделиться
          </Link>
        </Box>
      </Stack>
    </Form>
  );
}