// src/sections/account/account-socials.jsx
import { useForm } from 'react-hook-form';

import Card from '@mui/material/Card';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';

import { TwitterIcon, FacebookIcon, LinkedinIcon, InstagramIcon } from 'src/assets/icons';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

// Русские названия социальных сетей
const socialNetworkLabels = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  twitter: 'Twitter',
};

// ----------------------------------------------------------------------

export function AccountSocials({ socialLinks }) {
  const { employee } = useAuthContext();
  
  // Получаем ссылки на соцсети из данных пользователя или используем переданные параметры
  const userSocialLinks = employee?.socialLinks || socialLinks || {};
  
  const defaultValues = {
    facebook: '',
    instagram: '',
    linkedin: '',
    twitter: '',
  };

  const methods = useForm({
    defaultValues,
    values: userSocialLinks,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      console.log('Сохранение ссылок на социальные сети:', data);
      
      // Здесь должен быть реальный запрос на обновление социальных сетей
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      toast.success('Профили социальных сетей обновлены!');
    } catch (error) {
      console.error('Ошибка при обновлении социальных сетей:', error);
      toast.error('Не удалось обновить ссылки. Пожалуйста, попробуйте позже.');
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Card
        sx={{
          p: 3,
          gap: 3,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Укажите ссылки на ваши профили в социальных сетях
        </Typography>
        
        {Object.keys(userSocialLinks).map((social) => (
          <Field.Text
            key={social}
            name={social}
            label={socialNetworkLabels[social] || social}
            placeholder={`Ваш профиль ${socialNetworkLabels[social] || social}`}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    {social === 'facebook' && <FacebookIcon sx={{ width: 24 }} />}
                    {social === 'instagram' && <InstagramIcon sx={{ width: 24 }} />}
                    {social === 'linkedin' && <LinkedinIcon sx={{ width: 24 }} />}
                    {social === 'twitter' && <TwitterIcon sx={{ width: 24 }} />}
                  </InputAdornment>
                ),
              },
            }}
          />
        ))}

        <LoadingButton type="submit" variant="contained" loading={isSubmitting} sx={{ ml: 'auto' }}>
          Сохранить изменения
        </LoadingButton>
      </Card>
    </Form>
  );
}