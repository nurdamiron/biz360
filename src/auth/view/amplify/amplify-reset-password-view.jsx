import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { PasswordIcon } from 'src/assets/icons';

import { Form, Field } from 'src/components/hook-form';

import { resetPassword } from '../../context/amplify';
import { FormHead } from '../../components/form-head';
import { FormReturnLink } from '../../components/form-return-link';

// ----------------------------------------------------------------------

export const ResetPasswordSchema = zod.object({
  email: zod
    .string()
    .min(1, { message: 'Требуется электронная почта!' })
    .email({ message: 'Адрес электронной почты должен быть действительным!' }),
});

// ----------------------------------------------------------------------

export function AmplifyResetPasswordView() {
  const router = useRouter();

  const defaultValues = {
    email: '',
  };

  const methods = useForm({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const createRedirectPath = (query) => {
    const queryString = new URLSearchParams({ email: query }).toString();
    return `${paths.auth.amplify.updatePassword}?${queryString}`;
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      await resetPassword({ username: data.email });

      const redirectPath = createRedirectPath(data.email);

      router.push(redirectPath);
    } catch (error) {
      console.error(error);
    }
  });

  const renderForm = () => (
    <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
      <Field.Text
        autoFocus
        name="email"
        label="Электронная почта"
        placeholder="example@gmail.com"
        slotProps={{ inputLabel: { shrink: true } }}
      />

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator="Отправляем запрос..."
      >
        Отправить запрос
      </LoadingButton>
    </Box>
  );

  return (
    <>
      <FormHead
        icon={<PasswordIcon />}
        title="Забыли свой пароль?"
        description="Пожалуйста, введите адрес электронной почты, связанный с вашей учетной записью, и мы вышлем вам по электронной почте ссылку для сброса вашего пароля."
      />

      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm()}
      </Form>

      <FormReturnLink href={paths.auth.amplify.signIn} />
    </>
  );
}
