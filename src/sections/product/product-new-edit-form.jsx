import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import React, { useState, useCallback, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';
import axiosInstance from 'src/lib/axios';
import { endpoints } from 'src/lib/axios';
import { FormProvider } from 'react-hook-form';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useFirebaseStorage } from 'src/hooks/useFirebaseStorage';

import { PRODUCT_CATEGORY_GROUP_OPTIONS, PRODUCT_GENDER_OPTIONS, PRODUCT_COLOR_NAME_OPTIONS } from 'src/_mock';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

// Схема валидации нового продукта
export const NewProductSchema = zod
  .object({
    name: zod.string().min(1, 'Название товара обязательно!'),
    code: zod
      .string()
      .regex(/^[A-Za-z0-9-]*$/, 'Код может содержать только буквы, цифры, дефис')
      .optional(),
    price: zod
      .number()
      .min(0.01, 'Цена должна быть больше 0!'),
    quantity: zod
      .number()
      .min(1, 'Количество должно быть больше 0!')
      .int('Должно быть целым числом'),

    description: zod.string().optional().nullable(),
    sub_description: zod.string().optional().nullable(),
    images: zod.array(
      zod.union([zod.string(), zod.instanceof(File)])
    ).optional().default([]),
    price_sale: zod.number().nullable().optional(),
    taxes: zod.number().nullable().optional(),
    category: zod.string().nullable().optional(),
    colors: zod.array(zod.string()).optional().default([]),
    sizes: zod.array(zod.string()).optional().default([]),
    tags: zod.array(zod.string()).optional().default([]),
    gender: zod.array(zod.string()).optional().default([]),
    is_published: zod.boolean().default(true),
  })
  .refine(
    (data) => Boolean(data.code?.trim()),
    {
      message: 'Укажите хотя бы code',
      path: ['code'], 
    }
  );




const API_URL = 'https://biz360-backend.onrender.com/api/product';

export function ProductNewEditForm({ currentProduct }) {
  const { id } = useParams();
  const router = useRouter();
  const [includeTaxes, setIncludeTaxes] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [existingProduct, setExistingProduct] = useState(null);
  const { uploadMultipleImages } = useFirebaseStorage();
  const [uploadedImageUrls, setUploadedImageUrls] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const isEditMode = window.location.pathname.includes('/edit');
  const isNewMode = window.location.pathname.includes('/new');

  // Если режим редактирования, загружаем существующий продукт
  useEffect(() => {
    if (!isEditMode) {
      setIsLoading(false);
      return;
    }
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${API_URL}/details/${id}`);
        const json = await response.json();
        // Ожидается, что данные продукта находятся в поле json.data
        const productFromServer = json.data;
        const transformedData = {
          ...productFromServer,
          price: parseFloat(productFromServer.price),
          price_sale: productFromServer.price_sale ? parseFloat(productFromServer.price_sale) : null,
          quantity: parseInt(productFromServer.quantity),
          taxes: productFromServer.taxes ? parseFloat(productFromServer.taxes) : null,
          new_label: productFromServer.new_label || { enabled: false, content: '' },
          sale_label: productFromServer.sale_label || { enabled: false, content: '' },
          colors: Array.isArray(productFromServer.colors) ? productFromServer.colors : [],
          sizes: Array.isArray(productFromServer.sizes) ? productFromServer.sizes : [],
          tags: Array.isArray(productFromServer.tags) ? productFromServer.tags : [],
          gender: Array.isArray(productFromServer.gender) ? productFromServer.gender : [],
          images: Array.isArray(productFromServer.images) ? productFromServer.images : []
        };
        console.log('Получены данные продукта:', transformedData);
        setExistingProduct(transformedData);
        setUploadedImageUrls(transformedData.images);
        setIsLoading(false);
      } catch (error) {
        console.error('Ошибка загрузки продукта:', error);
        toast.error('Не удалось загрузить данные продукта');
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [isEditMode, id]);

  const defaultValues = {
    name: '',
    description: '',
    sub_description: '',
    images: [],
    code: '',
    price: 0,
    price_sale: null,
    taxes: null,
    quantity: 0,
    tags: [],
    gender: [],
    category: '',
    colors: [],
    sizes: [],
    new_label: { enabled: false, content: '' },
    sale_label: { enabled: false, content: '' },
    is_published: true
  };

  // Инициализируем форму; если редактирование – затем обновляем через reset
  const methods = useForm({
    resolver: zodResolver(NewProductSchema),
    defaultValues: existingProduct || defaultValues,
  });

  const { reset, watch, setValue, handleSubmit, formState: { isSubmitting } } = methods;
  const values = watch();

  useEffect(() => {
    if (existingProduct) {
      reset(existingProduct);
    }
  }, [existingProduct, reset]);

  // Добавляем эффект для отслеживания поля "images"
  // Если в поле оказались объекты File, выполняем загрузку в Firebase
  // useEffect(() => {
  //   const files = values.images;
  //   if (files && Array.isArray(files)) {
  //     // Фильтруем только новые объекты File
  //     const newFiles = files.filter((item) => item instanceof File);
  //     if (newFiles.length > 0) {
  //       console.log('Обнаружены новые файлы для загрузки:', newFiles);
  //       uploadMultipleImages(newFiles)
  //         .then((urls) => {
  //           console.log('Получены URL (useEffect):', urls);
  //           // Сохраняем уже загруженные URL (если есть) и новые URL
  //           const existingUrls = files.filter((item) => typeof item === 'string');
  //           const merged = [...existingUrls, ...urls];
  //           setUploadedImageUrls(merged);
  //           setValue('images', merged, { shouldValidate: true });
  //         })
  //         .catch((err) => {
  //           console.error('Ошибка загрузки файлов из формы:', err);
  //           toast.error('Ошибка загрузки изображений');
  //         });
  //     }
  //   }
  // }, [values.images, setValue, uploadMultipleImages]);
  
  

  // Функция загрузки изображений через Firebase Storage
  const handleUpload = async (files) => {
    try {
      console.log('handleUpload вызвана, файлы:', files);
      setIsUploading(true);
      const fileNames = Array.from(files).map(file => file.name);
      const hasDuplicates = fileNames.length !== new Set(fileNames).size;
      if (hasDuplicates) {
        toast.warning('Обнаружены файлы с одинаковыми именами. Они будут переименованы автоматически.');
      }
      const urls = await uploadMultipleImages(files);
      console.log('Получены URL:', urls);
      setUploadedImageUrls(prev => [...prev, ...urls]);
      setValue('images', urls);
    } catch (error) {
      console.error('Ошибка загрузки изображений:', error);
      toast.error('Не удалось загрузить изображения');
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Проверяем обязательные поля перед отправкой
      if (!data.name || !data.code  || !data.price || !data.quantity) {
        toast.error('Пожалуйста, заполните все обязательные поля');
        return;
      }
  
      const updatedData = {
        name: data.name.trim(),
        description: data.description.trim(),
        sub_description: data.sub_description?.trim(),
        code: data.code.trim(),
        price: parseFloat(data.price),
        price_sale: data.price_sale ? parseFloat(data.price_sale) : null,
        quantity: parseInt(data.quantity), // Убедимся, что quantity - целое число
        taxes: data.taxes ? parseFloat(data.taxes) : null,
        colors: data.colors || [],
        sizes: data.sizes || [],
        tags: data.tags || [],
        gender: data.gender || [],
        category: data.category || null,
        new_label: data.new_label || null,
        sale_label: data.sale_label || null,
        images: uploadedImageUrls.length ? uploadedImageUrls : (existingProduct?.images || []),
        is_published: data.is_published
      };
  
      console.log('Данные для отправки:', updatedData);
  
      const response = await axiosInstance({
        url: isEditMode ? `/api/product/${id}` : '/api/product',
        method: isEditMode ? 'PUT' : 'POST',
        data: updatedData
      });

      if (data.quantity < 1) {
        methods.setError('quantity', {
          type: 'manual',
          message: 'Количество должно быть больше 0'
        });
        return;
      }
  
      if (response.data) {
        toast.success(isEditMode ? 'Продукт обновлён' : 'Продукт создан');
        router.push(paths.dashboard.product.root);
      }
    } catch (error) {
      console.error('Ошибка отправки данных:', error);
      const backendError = error.response?.data;
      if (backendError?.fields) {
        backendError.fields.forEach(field => {
          methods.setError(field, {
            type: 'server',
            message: 'Это поле обязательно'
          });
        });
        toast.error(`Ошибка: ${backendError.fields.join(', ')} - обязательные поля`);
      } else {
        toast.error(error.response?.data?.message || 'Не удалось сохранить продукт');
      }
    }
  });
  
  

  const handleRemoveFile = useCallback(
    (inputFile) => {
      const filtered = values.images?.filter((file) => file !== inputFile);
      setValue('images', filtered);
      setUploadedImageUrls(prev => prev.filter(url => url !== inputFile));
    },
    [setValue, values.images]
  );

  const handleRemoveAllFiles = useCallback(() => {
    setValue('images', []);
    setUploadedImageUrls([]);
  }, [setValue]);

  const handleChangeIncludeTaxes = useCallback((event) => {
    setIncludeTaxes(event.target.checked);
  }, []);

  // Блок "Детали товара"
  const renderDetails = () => (
    <Card>
      <CardHeader 
        title="Детали товара" 
        subheader="Название, описание, изображения" 
        sx={{ mb: 3 }} 
      />
      <Divider />
      <Stack spacing={3} sx={{ p: 3 }}>
      <Field.Text 
  name="name" 
  label="Название товара" 
  required 
  error={!!methods.formState.errors.name}
  helperText={methods.formState.errors.name?.message}
/>

        <Field.Text 
          name="sub_description" 
          label="Краткое описание" 
          multiline 
          rows={4} 
        />
        <Stack spacing={1.5}>
          <Typography variant="subtitle2">Описание</Typography>
          <Field.Editor 
  name="description" 
  label="Описание *" 
  multiline 
  rows={4}
  required
  error={!!methods.formState.errors.description}
  helperText={methods.formState.errors.description?.message}
/>
        </Stack>
        <Stack spacing={1.5}>
          <Typography variant="subtitle2">Изображения</Typography>
          <Field.Upload
    multiple
    thumbnail
    name="images"
    maxSize={3145728}
    onRemove={handleRemoveFile}
    onRemoveAll={handleRemoveAllFiles}
    onUpload={handleUpload}  // Передаем нашу функцию загрузки
    loading={isUploading}
    error={methods.formState.isSubmitted && !!methods.formState.errors.images}
    helperText={
      methods.formState.isSubmitted && 
      methods.formState.errors.images?.message
    }
  />
        </Stack>
      </Stack>
    </Card>
  );

  // Блок "Характеристики"
  const renderProperties = () => (
    <Card>
      <CardHeader
        title="Характеристики"
        subheader="Дополнительные свойства и атрибуты"
        sx={{ mb: 3 }}
      />
      <Divider />
      <Stack spacing={3} sx={{ p: 3 }}>
        <Box
          sx={{
            rowGap: 3,
            columnGap: 2,
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' },
          }}
        >
<Field.Text
  name="code"
  label="Номенклатурный номер"
  error={!!methods.formState.errors.code}
  helperText={methods.formState.errors.code?.message}
/>       

<Field.Text
  name="quantity"
  label="Количество" // Добавлена звездочка
  placeholder="1"      // Изменено с 0 на 1
  type="number"
  required            // Добавлено
  error={!!methods.formState.errors.quantity}
  helperText={methods.formState.errors.quantity?.message}
  slotProps={{ 
    inputLabel: { shrink: true },
    input: { 
      min: 1,   // Добавлено минимальное значение
      step: 1   // Добавлен шаг
    } 
  }}
/>
          {/* <Field.Select
            name="category"
            label="Категория"
            slotProps={{
              select: { native: true },
              inputLabel: { shrink: true },
            }}
          >
            {PRODUCT_CATEGORY_GROUP_OPTIONS.map((category) => (
              <optgroup key={category.group} label={category.group}>
                {category.classify.map((classify) => (
                  <option key={classify} value={classify}>
                    {classify}
                  </option>
                ))}
              </optgroup>
            ))}
          </Field.Select> */}
          {/* <Field.MultiSelect
            checkbox
            name="colors"
            label="Цвета"
            options={PRODUCT_COLOR_NAME_OPTIONS}
          />
          <Field.MultiSelect 
            checkbox 
            name="sizes" 
            label="Размеры" 
            options={[]} // Передайте здесь опции для размеров
          /> */}
        </Box>
        <Stack spacing={1}>
          <Typography variant="subtitle2">Пол</Typography>
          <Field.MultiCheckbox row name="gender" options={PRODUCT_GENDER_OPTIONS} sx={{ gap: 2 }} />
        </Stack>
        {/* <Divider sx={{ borderStyle: 'dashed' }} /> */}
        {/* <Box sx={{ gap: 3, display: 'flex', alignItems: 'center' }}>
          <Field.Switch 
            name="sale_label.enabled" 
            label={null} 
            sx={{ m: 0 }} 
          />
          <Field.Text
            name="sale_label.content"
            label="Метка скидки"
            fullWidth
            disabled={!values.sale_label?.enabled}
          />
        </Box> */}
        {/* <Box sx={{ gap: 3, display: 'flex', alignItems: 'center' }}>
          <Field.Switch 
            name="new_label.enabled" 
            label={null} 
            sx={{ m: 0 }} 
          />
          <Field.Text
            name="new_label.content"
            label="Метка новинки"
            fullWidth
            disabled={!values.new_label?.enabled}
          />
        </Box> */}
      </Stack>
    </Card>
  );

  // Блок "Цены"
  const renderPricing = () => (
    <Card>
      <CardHeader title="Цены" subheader="Настройка цен и налогов" sx={{ mb: 3 }} />
      <Divider />
      <Stack spacing={3} sx={{ p: 3 }}>
      <Field.Text
  name="price"
  label="Обычная цена"
  required
  placeholder="0.00"
  type="number"
  error={!!methods.formState.errors.price}
  helperText={methods.formState.errors.price?.message}
  slotProps={{
    inputLabel: { shrink: true },
    input: {
      startAdornment: (
        <InputAdornment position="start" sx={{ mr: 0.75 }}>
          <Box component="span" sx={{ color: 'text.disabled' }}>₸</Box>
        </InputAdornment>
      ),
    },
  }}
/>
        <Field.Text
          name="price_sale"
          label="Цена со скидкой"
          placeholder="0.00"
          type="number"
          slotProps={{
            inputLabel: { shrink: true },
            input: {
              startAdornment: (
                <InputAdornment position="start" sx={{ mr: 0.75 }}>
                  <Box component="span" sx={{ color: 'text.disabled' }}>₸</Box>
                </InputAdornment>
              ),
            },
          }}
        />
        <FormControlLabel
          control={
            <Switch id="toggle-taxes" checked={includeTaxes} onChange={handleChangeIncludeTaxes} />
          }
          label="Цена включает налоги"
        />
        {!includeTaxes && (
          <Field.Text
            name="taxes"
            label="Налоги (%)"
            placeholder="0.00"
            type="number"
            slotProps={{
              inputLabel: { shrink: true },
              input: {
                startAdornment: (
                  <InputAdornment position="start" sx={{ mr: 0.75 }}>
                    <Box component="span" sx={{ color: 'text.disabled' }}>%</Box>
                  </InputAdornment>
                ),
              },
            }}
          />
        )}
      </Stack>
    </Card>
  );

  // Блок с кнопками действий
  const renderActions = () => (
    <Box sx={{ gap: 3, display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
      <FormControlLabel
        label="Опубликовать"
        control={<Switch defaultChecked inputProps={{ id: 'publish-switch' }} />}
        sx={{ pl: 3, flexGrow: 1 }}
      />
      <LoadingButton type="submit" variant="contained" size="large" loading={isSubmitting}>
        {isEditMode ? 'Сохранить изменения' : 'Создать'}
      </LoadingButton>
    </Box>
  );

  return (
    <FormProvider {...methods}>
    <form onSubmit={methods.handleSubmit(onSubmit)}>
      <Stack spacing={{ xs: 3, md: 5 }} sx={{ mx: 'auto', maxWidth: { xs: 720, xl: 880 } }}>
        {renderDetails()}
        {renderProperties()}
        {renderPricing()}
        {renderActions()}
      </Stack>
    </form>
  </FormProvider>
  );
}
