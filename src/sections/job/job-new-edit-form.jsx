import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import ButtonBase from '@mui/material/ButtonBase';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import {
  _roles,
  JOB_SKILL_OPTIONS,
  JOB_BENEFIT_OPTIONS,
  JOB_EXPERIENCE_OPTIONS,
  JOB_EMPLOYMENT_TYPE_OPTIONS,
  JOB_WORKING_SCHEDULE_OPTIONS,
} from 'src/_mock';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field, schemaHelper } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export const NewJobSchema = zod.object({
  title: zod.string().min(1, { message: 'Требуется название!' }),
  content: zod.string().min(1, { message: 'Контент обязателен!' }),
  employmentTypes: zod.string().array().min(1, { message: 'Выберите хотя бы один вариант!' }),
  role: schemaHelper.nullableInput(zod.string().min(1, { message: 'Требуется роль!' }), {
    // message for null value
    message: 'Требуется роль!',
  }),
  skills: zod.string().array().min(1, { message: 'Выберите хотя бы один вариант!' }),
  workingSchedule: zod.string().array().min(1, { message: 'Выберите хотя бы один вариант!!' }),
  locations: zod.string().array().min(1, { message: 'Выберите хотя бы один вариант!' }),
  expiredDate: schemaHelper.date({ message: { required: 'Требуется срок годности!' } }),
  salary: zod.object({
    price: schemaHelper.nullableInput(
      zod.number({ coerce: true }).min(1, { message: 'Цена обязательна!' }),
      {
        // message for null value
        message: 'Цена обязательна!',
      }
    ),
    // Not required
    type: zod.string(),
    negotiable: zod.boolean(),
  }),
  benefits: zod.string().array().min(0, { message: 'Выберите хотя бы один вариант!' }),
  // Not required
  experience: zod.string(),
});

// ----------------------------------------------------------------------

export function JobNewEditForm({ currentJob }) {
  const router = useRouter();

  const defaultValues = {
    title: '',
    content: '',
    employmentTypes: [],
    experience: '1 year exp',
    role: _roles[1],
    skills: [],
    workingSchedule: [],
    locations: [],
    expiredDate: null,
    salary: { type: 'Hourly', price: null, negotiable: false },
    benefits: [],
  };

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(NewJobSchema),
    defaultValues,
    values: currentJob,
  });

  const {
    reset,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset();
      toast.success(currentJob ? 'Update success!' : 'Create success!');
      router.push(paths.dashboard.job.root);
      console.info('DATA', data);
    } catch (error) {
      console.error(error);
    }
  });

  const renderDetails = () => (
    <Card>
      <CardHeader title="Details" subheader="Название, краткое описание, изображение..." sx={{ mb: 3 }} />

      <Divider />

      <Stack spacing={3} sx={{ p: 3 }}>
        <Stack spacing={1.5}>
          <Typography variant="subtitle2">Заглавие</Typography>
          <Field.Text name="title" placeholder="Ex: Software Engineer..." />
        </Stack>

        <Stack spacing={1.5}>
          <Typography variant="subtitle2">Содержание</Typography>
          <Field.Editor name="content" sx={{ maxHeight: 480 }} />
        </Stack>
      </Stack>
    </Card>
  );

  const renderProperties = () => (
    <Card>
      <CardHeader
        title="Свойства"
        subheader="Дополнительные функции и атрибуты..."
        sx={{ mb: 3 }}
      />

      <Divider />

      <Stack spacing={3} sx={{ p: 3 }}>
        <Stack spacing={1}>
          <Typography variant="subtitle2">Тип занятости</Typography>
          <Field.MultiCheckbox
            row
            name="employmentTypes"
            options={JOB_EMPLOYMENT_TYPE_OPTIONS}
            sx={{ gap: 4 }}
          />
        </Stack>

        <Stack spacing={1}>
          <Typography variant="subtitle2">Опыт</Typography>
          <Field.RadioGroup
            row
            name="experience"
            options={JOB_EXPERIENCE_OPTIONS}
            sx={{ gap: 4 }}
          />
        </Stack>

        <Stack spacing={1.5}>
          <Typography variant="subtitle2">Роль</Typography>
          <Field.Autocomplete
            name="role"
            autoHighlight
            options={_roles.map((option) => option)}
            getOptionLabel={(option) => option}
            renderOption={(props, option) => (
              <li {...props} key={option}>
                {option}
              </li>
            )}
          />
        </Stack>

        <Stack spacing={1.5}>
          <Typography variant="subtitle2">Навыки</Typography>
          <Field.Autocomplete
            name="skills"
            placeholder="+ Навыки"
            multiple
            disableCloseOnSelect
            options={JOB_SKILL_OPTIONS.map((option) => option)}
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
        </Stack>

        <Stack spacing={1.5}>
          <Typography variant="subtitle2">График работы</Typography>
          <Field.Autocomplete
            name="workingSchedule"
            placeholder="+ График работы"
            multiple
            disableCloseOnSelect
            options={JOB_WORKING_SCHEDULE_OPTIONS.map((option) => option)}
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
        </Stack>

        <Stack spacing={1.5}>
          <Typography variant="subtitle2">Места</Typography>
          <Field.CountrySelect multiple name="locations" placeholder="+ Места" />
        </Stack>

        <Stack spacing={1.5}>
          <Typography variant="subtitle2">Истекший</Typography>

          <Field.DatePicker name="expiredDate" />
        </Stack>

        <Stack spacing={2}>
          <Typography variant="subtitle2">Зарплата</Typography>

          <Controller
            name="salary.type"
            control={control}
            render={({ field }) => (
              <Box sx={{ gap: 2, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}>
                {[
                  {
                    label: 'Почасовой',
                    icon: <Iconify icon="solar:clock-circle-bold" width={32} sx={{ mb: 2 }} />,
                  },
                  {
                    label: 'Индивидуально',
                    icon: <Iconify icon="solar:wad-of-money-bold" width={32} sx={{ mb: 2 }} />,
                  },
                ].map((item) => (
                  <Paper
                    component={ButtonBase}
                    variant="outlined"
                    key={item.label}
                    onClick={() => field.onChange(item.label)}
                    sx={{
                      p: 2.5,
                      borderRadius: 1,
                      typography: 'subtitle2',
                      flexDirection: 'column',
                      ...(item.label === field.value && {
                        borderWidth: 2,
                        borderColor: 'text.primary',
                      }),
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </Paper>
                ))}
              </Box>
            )}
          />

          <Field.Text
            name="salary.price"
            placeholder="0.00"
            type="number"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start" sx={{ mr: 0.75 }}>
                    <Box component="span" sx={{ color: 'text.disabled' }}>
                      $
                    </Box>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Field.Switch name="salary.negotiable" label="ЗП обсуждаемо" />
        </Stack>

        <Stack spacing={1}>
          <Typography variant="subtitle2">Преимущества</Typography>
          <Field.MultiCheckbox
            name="benefits"
            options={JOB_BENEFIT_OPTIONS}
            sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}
          />
        </Stack>
      </Stack>
    </Card>
  );

  const renderActions = () => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
      <FormControlLabel
        label="Publish"
        control={<Switch defaultChecked inputProps={{ id: 'publish-switch' }} />}
        sx={{ flexGrow: 1, pl: 3 }}
      />

      <LoadingButton
        type="submit"
        variant="contained"
        size="large"
        loading={isSubmitting}
        sx={{ ml: 2 }}
      >
        {!currentJob ? 'Create job' : 'Сохранить изменения'}
      </LoadingButton>
    </Box>
  );

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Stack spacing={{ xs: 3, md: 5 }} sx={{ mx: 'auto', maxWidth: { xs: 720, xl: 880 } }}>
        {renderDetails()}
        {renderProperties()}
        {renderActions()}
      </Stack>
    </Form>
  );
}
