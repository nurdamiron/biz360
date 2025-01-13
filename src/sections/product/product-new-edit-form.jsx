import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useFirebaseStorage } from 'src/hooks/useFirebaseStorage';

import {
  _tags,
  PRODUCT_SIZE_OPTIONS,
  PRODUCT_GENDER_OPTIONS,
  PRODUCT_COLOR_NAME_OPTIONS,
  PRODUCT_CATEGORY_GROUP_OPTIONS,
} from 'src/_mock';

import { toast } from 'src/components/snackbar';
import { Form, Field, schemaHelper } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export const NewProductSchema = zod.object({
  name: zod.string().min(1, { message: 'Name is required!' }),
  description: zod.string()
    .min(100, { message: 'Description must be at least 100 characters' })
    .max(500, { message: 'Description must be less than 500 characters' }),
  sub_description: zod.string().optional(),
  images: zod.array(
    zod.union([
      zod.string(),
      zod.instanceof(File),
      zod.object({}) // Для обработки File-подобных объектов
    ])
  ).min(1, { message: 'Добавьте хотя бы одно изображение!' }),
  code: zod.string().min(1, { message: 'Product code is required!' }),
  sku: zod.string().min(1, { message: 'Product SKU is required!' }),
  quantity: zod.number().min(0, { message: 'Quantity must be 0 or greater' }),
  colors: zod.array(zod.string()).min(1, { message: 'Choose at least one color!' }),
  sizes: zod.array(zod.string()).min(1, { message: 'Choose at least one size!' }),
  tags: zod.array(zod.string()).min(2, { message: 'Must have at least 2 tags!' }),
  gender: zod.array(zod.string()).min(1, { message: 'Choose at least one gender!' }),
  price: zod.number().min(0.01, { message: 'Price must be greater than 0!' }),
  price_sale: zod.number().nullable(),
  taxes: zod.number().nullable(),
  category: zod.string(),
  new_label: zod.object({
    enabled: zod.boolean(),
    content: zod.string()
  }),
  sale_label: zod.object({
    enabled: zod.boolean(),
    content: zod.string()
  }),
  is_published: zod.boolean().default(true)
});

// ----------------------------------------------------------------------

export function ProductNewEditForm({ currentProduct }) {
  const router = useRouter();
  const [includeTaxes, setIncludeTaxes] = useState(false);

  const { uploadMultipleImages } = useFirebaseStorage();
  const [uploadedImageUrls, setUploadedImageUrls] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const handleUpload = async (files) => {
    try {
      setIsUploading(true);
      
      // Проверяем на дубликаты имен файлов
      const fileNames = Array.from(files).map(file => file.name);
      const hasDuplicates = fileNames.length !== new Set(fileNames).size;
      
      if (hasDuplicates) {
        toast.warning('Обнаружены файлы с одинаковыми именами. Они будут переименованы автоматически.');
      }
      
      // Загружаем в Firebase
      const urls = await uploadMultipleImages(files);
      setUploadedImageUrls(prev => [...prev, ...urls]);
      setValue('images', urls);
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Не удалось загрузить изображения');
    } finally {
      setIsUploading(false);
    }
  };

  const defaultValues = {
    name: '',
    description: '',
    sub_description: '',
    images: [],
    code: '',
    sku: '',
    price: 0,
    price_sale: null,
    taxes: null,
    quantity: 0,
    tags: [],
    gender: [],
    category: PRODUCT_CATEGORY_GROUP_OPTIONS[0].classify[1],
    colors: [],
    sizes: [],
    new_label: { enabled: false, content: '' },    // Убедимся что эти объекты
    sale_label: { enabled: false, content: '' },    // всегда инициализированы
    is_published: true
  };
  

  const methods = useForm({
    resolver: zodResolver(NewProductSchema),
    defaultValues,
    values: currentProduct,
    mode: 'onTouched', // Изменяем на onTouched
    reValidateMode: 'onChange',
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    try {
      const formData = {
        ...data,
        taxes: includeTaxes ? data.taxes : null,
        images: uploadedImageUrls,
        is_published: values.is_published
      };

      const response = await fetch('https://biz360-backend.onrender.com/api/product/', {
        method: currentProduct ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save product');

      toast.success(currentProduct ? 'Update success!' : 'Create success!');
      router.push(paths.dashboard.product.root);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Не удалось сохранить товар');
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

  const renderDetails = () => (
    <Card>
      <CardHeader 
        title="Детали" 
        subheader="Название, описание, изображения..." 
        sx={{ mb: 3 }} 
      />
      <Divider />
      <Stack spacing={3} sx={{ p: 3 }}>
        <Field.Text 
          name="name" 
          label="Название товара" 
          required 
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
            sx={{ maxHeight: 480 }} 
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
    onUpload={handleUpload}
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

  const renderProperties = () => (
    <Card>
      <CardHeader
        title="Характеристики"
        subheader="Дополнительные свойства и атрибуты..."
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
          <Field.Text name="code" label="Код товара" />

          <Field.Text name="sku" label="Артикул (SKU)" />

          <Field.Text
            name="quantity"
            label="Количество"
            placeholder="0"
            type="number"
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <Field.Select
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
          </Field.Select>

          <Field.MultiSelect
            checkbox
            name="colors"
            label="Цвета"
            options={PRODUCT_COLOR_NAME_OPTIONS}
          />

          <Field.MultiSelect checkbox name="sizes" label="Размеры" options={PRODUCT_SIZE_OPTIONS} />
        </Box>

        <Field.Autocomplete
          name="tags"
          label="Теги"
          placeholder="+ Tags"
          multiple
          freeSolo
          disableCloseOnSelect
          options={_tags.map((option) => option)}
          getOptionLabel={(option) => option}
          renderOption={(props, option) => (
            <li {...props} key={option}>
              {option}
            </li>
          )}
          renderTags={(selected, getTagProps) =>
            selected.map((option, index) => (
              <Chip
                {...getTagProps({ index })}
                key={option}
                label={option}
                size="small"
                color="info"
                variant="soft"
              />
            ))
          }
        />

        <Stack spacing={1}>
          <Typography variant="subtitle2">Пол</Typography>
          <Field.MultiCheckbox row name="gender" options={PRODUCT_GENDER_OPTIONS} sx={{ gap: 2 }} />
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box sx={{ gap: 3, display: 'flex', alignItems: 'center' }}>
  <Field.Switch 
    name="sale_label.enabled" 
    label={null} 
    sx={{ m: 0 }} 
  />
  <Field.Text
    name="sale_label.content"
    label="Метка скидки"
    fullWidth
    disabled={!values.sale_label?.enabled}  // Добавляем опциональную цепочку
  />
</Box>

<Box sx={{ gap: 3, display: 'flex', alignItems: 'center' }}>
  <Field.Switch 
    name="new_label.enabled" 
    label={null} 
    sx={{ m: 0 }} 
  />
  <Field.Text
    name="new_label.content"
    label="Метка новинки"
    fullWidth
    disabled={!values.new_label?.enabled}  // Добавляем опциональную цепочку
  />
</Box>
      </Stack>
    </Card>
  );

  const renderPricing = () => (
    <Card>
      <CardHeader title="Цены" subheader="Настройка цен и налогов" sx={{ mb: 3 }} />

      <Divider />

      <Stack spacing={3} sx={{ p: 3 }}>
        <Field.Text
          name="price"
          label="Обычная цена"
          placeholder="0.00"
          type="number"
          slotProps={{
            inputLabel: { shrink: true },
            input: {
              startAdornment: (
                <InputAdornment position="start" sx={{ mr: 0.75 }}>
                  <Box component="span" sx={{ color: 'text.disabled' }}>
                  ₸
                  </Box>
                </InputAdornment>
              ),
            },
          }}
        />

        <Field.Text
          name="priceSale"
          label="Цена со скидкой"
          placeholder="0.00"
          type="number"
          slotProps={{
            inputLabel: { shrink: true },
            input: {
              startAdornment: (
                <InputAdornment position="start" sx={{ mr: 0.75 }}>
                  <Box component="span" sx={{ color: 'text.disabled' }}>
                  ₸
                  </Box>
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
                    <Box component="span" sx={{ color: 'text.disabled' }}>
                      %
                    </Box>
                  </InputAdornment>
                ),
              },
            }}
          />
        )}
      </Stack>
    </Card>
  );

  const renderActions = () => (
    <Box
      sx={{
        gap: 3,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}
    >
      <FormControlLabel
        label="Publish"
        control={<Switch defaultChecked inputProps={{ id: 'publish-switch' }} />}
        sx={{ pl: 3, flexGrow: 1 }}
      />

      <LoadingButton type="submit" variant="contained" size="large" loading={isSubmitting}>
        {!currentProduct ? 'Создать' : 'Сохранить изменения'}
      </LoadingButton>
    </Box>
  );

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Stack spacing={{ xs: 3, md: 5 }} sx={{ mx: 'auto', maxWidth: { xs: 720, xl: 880 } }}>
        {renderDetails()}
        {renderProperties()}
        {renderPricing()}
        {renderActions()}
      </Stack>
    </Form>
  );
}
