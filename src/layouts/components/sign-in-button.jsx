import Button from '@mui/material/Button';

import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

export function SignInButton({ sx, ...other }) {
  return (
    <Button
      component={RouterLink}
      href={paths.auth.jwt.signIn}
      variant="contained"
      sx={sx}
      {...other}
    >
      Войти
    </Button>
  );
}
