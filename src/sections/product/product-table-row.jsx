import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';
import LinearProgress from '@mui/material/LinearProgress';

import { RouterLink } from 'src/routes/components';

import { fCurrency } from 'src/utils/format-number';
import { fTime, fDate } from 'src/utils/format-time';

import { Label } from 'src/components/label';

// ----------------------------------------------------------------------

const formatRussianDate = (date) => {
  const months = [
    'янв', 'фев', 'мар', 'апр', 'май', 'июн',
    'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'
  ];
  
  const d = new Date(date);
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  
  return `${day} ${month} ${year}`;
};

const formatTime = (date) => {
  const d = new Date(date);
  return d.toLocaleTimeString('ru-RU', { 
    hour: '2-digit', 
    minute: '2-digit'
  });
};


const convertToUTC5 = (date) => {
  const utc = new Date(date);
  return new Date(utc.getTime() + (5 * 60 * 60 * 1000)); // Добавляем 5 часов
};


export function RenderCellPrice({ params }) {
  return fCurrency(params.row.price);
}

export function RenderCellPublish({ params }) {

  const statusLabels = {
    'published': 'Опубликовано',
    'draft': 'Черновик',

  };

  return (
<Label variant="soft" color={params.row.publish === 'published' ? 'info' : 'default'}>
      {statusLabels[params.row.publish] || params.row.publish}
    </Label>
  );
}

export function RenderCellCreatedAt({ params }) {
  const utc5Date = convertToUTC5(params.row.createdAt);
  
  return (
    <Box sx={{ gap: 0.5, display: 'flex', flexDirection: 'column' }}>
      <span>{formatRussianDate(utc5Date)}</span>
      <Box component="span" sx={{ typography: 'caption', color: 'text.secondary' }}>
        {formatTime(utc5Date)}
      </Box>
    </Box>
  );
}

export function RenderCellStock({ params }) {
  const inventoryLabels = {
    'out of so': 'Нет в наличии',
    'low stock': 'Мало',
    'в наличии': 'в наличии'
  };

  return (
    <Box sx={{ width: 1, typography: 'caption', color: 'text.secondary' }}>
      <LinearProgress
        value={(params.row.available * 100) / params.row.quantity}
        variant="determinate"
        color={
          (params.row.inventoryType === 'Out of Stock' && 'error') ||
          (params.row.inventoryType === 'Мало' && 'warning') ||
          'success'
        }
        sx={{ mb: 1, height: 6, width: 80 }}
      />
      {!!params.row.available && params.row.available} {inventoryLabels[params.row.inventoryType] || params.row.inventoryType}
    </Box>
  );
}

export function RenderCellProduct({ params, href }) {
  return (
    <Box
      sx={{
        py: 2,
        gap: 2,
        width: 1,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Avatar
        alt={params.row.name}
        src={params.row.coverUrl}
        variant="rounded"
        sx={{ width: 64, height: 64 }}
      />

      <ListItemText
        primary={
          <Link component={RouterLink} href={href} color="inherit">
            {params.row.name}
          </Link>
        }
        secondary={params.row.category}
        slotProps={{
          primary: { noWrap: true },
          secondary: { sx: { color: 'text.disabled' } },
        }}
      />
    </Box>
  );
}
