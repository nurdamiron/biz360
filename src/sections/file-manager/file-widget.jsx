// src/sections/file-manager/file-widget.jsx
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import { Iconify } from 'src/components/iconify';
import { fNumber } from 'src/utils/format-number';

// ----------------------------------------------------------------------

/*
Пропсы:
- icon: путь/иконка раздела (например, "/assets/icons/ic-analytics.svg")
- title: заголовок (например, "Текущая оценка" или "Продажи")
- value: текущее значение (число)
- total: плановое/макс. значение (число)
- manager: имя ответственного (строка)
- managerIcon: иконка для менеджера (например, "eva:person-fill")
- showAsPercent: boolean, если true – показывать прогресс как %
*/
export function FileWidget({
  sx,
  icon,
  title = 'Текущая оценка',
  value = 0,
  total = 100,
  manager,
  managerIcon = 'eva:person-fill',
  showAsPercent = true,
  ...other
}) {
  const progressValue = total > 0 ? (value / total) * 100 : 0;

  return (
    <Card sx={[{ p: 3, position: 'relative' }, ...(Array.isArray(sx) ? sx : [sx])]} {...other}>
      {/* Кнопка с троеточием */}
      <IconButton sx={{ top: 8, right: 8, position: 'absolute' }}>
        <Iconify icon="eva:more-vertical-fill" />
      </IconButton>

      {/* Иконка раздела (если есть) */}
      {icon && (
        <Box
          component="img"
          src={icon}
          sx={{ width: 48, height: 48 }}
        />
      )}

      {/* Заголовок */}
      <Typography variant="h6" sx={{ mt: icon ? 2 : 0 }}>
        {title}
      </Typography>

      {/* Ответственный человек (если manager передан) */}
      {manager && (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <Iconify icon={managerIcon} sx={{ mr: 1, color: 'text.disabled' }} />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Ответственный: {manager}
          </Typography>
        </Box>
      )}

      {/* Прогресс-бар */}
      <LinearProgress
        variant="determinate"
        value={progressValue}
        sx={{ my: 2, height: 6 }}
      />

      {/* Нижняя строка: показываем % или число */}
      <Box
        sx={{
          gap: 0.5,
          display: 'flex',
          typography: 'subtitle2',
          justifyContent: 'flex-end',
        }}
      >
        {showAsPercent ? (
          <>
            <Box sx={{ mr: 0.5, typography: 'body2', color: 'text.disabled' }}>
              {fNumber(progressValue)}%
            </Box>
            / 100%
          </>
        ) : (
          <>
            <Box sx={{ mr: 0.5, typography: 'body2', color: 'text.disabled' }}>
              {fNumber(value)}
            </Box>
            / {fNumber(total)}
          </>
        )}
      </Box>
    </Card>
  );
}
