import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import { Chart, useChart } from 'src/components/chart';

// Допишем наш helper
function getColorByScore(score) {
  if (score < 20) return ['#FF4842', '#FFA48D']; 
  if (score < 40) return ['#FFA000', '#FFC107']; 
  if (score < 60) return ['#FBC02D', '#FFEE58']; 
  if (score < 80) return ['#00AB55', '#B5F2E5']; 
  return ['#00894A', '#3ADF95'];
}

export function FileStorageOverview({ data, chart, sx, ...other }) {
  const theme = useTheme();

  // 1) Определяем, какой у нас score
  const score = chart.series || 0; // напр. 76

  // 2) Получаем подходящие 2 цвета
  const dynamicColors = getColorByScore(score);

  // 3) Если chart.colors явно не передан, используем `dynamicColors`:
  const chartColors = chart.colors ?? dynamicColors;

  // Далее, всё как раньше
  const chartOptions = useChart({
    chart: { sparkline: { enabled: true } },
    stroke: { width: 0 },
    fill: {
      type: 'gradient',
      gradient: {
        colorStops: [
          { offset: 0, color: chartColors[0], opacity: 1 },
          { offset: 100, color: chartColors[1], opacity: 1 },
        ],
      },
    },
    plotOptions: {
      radialBar: {
        offsetY: 40,
        startAngle: -90,
        endAngle: 90,
        hollow: { margin: -24 },
        track: { margin: -24 },
        dataLabels: {
          name: {
            offsetY: 8,
            formatter: () => 'Эффективность', // или другое
          },
          value: {
            offsetY: -36,
            formatter: (val) => `${val}%`,
          },
          total: {
            show: true,
            label: '100%',
            color: theme.palette.text.disabled,
            fontSize: theme.typography.caption.fontSize,
            fontWeight: theme.typography.caption.fontWeight,
          },
        },
      },
    },
    ...chart.options,
  });
  
  return (
    <Card sx={sx} {...other}>
      {/* Собственно диаграмма */}
      <Chart
        type="radialBar"
        series={[chart.series]} // напр. 76 => 76%
        options={chartOptions}
        slotProps={{ loading: { p: 3 } }}
        sx={{ mx: 'auto', width: 240, height: 240 }}
      />

      {/* Секция со списком категорий (data) */}
      <Stack
        spacing={3}
        sx={{
          px: 3,
          pb: 5,
          mt: -4,
          zIndex: 1,
          position: 'relative',
          bgcolor: 'background.paper',
        }}
      >
        {data.map((category) => (
          <Box
            key={category.name}
            sx={{
              gap: 2,
              display: 'flex',
              alignItems: 'center',
              typography: 'subtitle2',
            }}
          >
            {/* Иконка категории */}
            <Box sx={{ width: 36, height: 36 }}>{category.icon}</Box>

            {/* Название и подпись */}
            <Stack flex="1 1 auto">
              <div>{category.name}</div>
              {/* Вместо "223 files" можно показывать "20% вклада" или "какой-то KPI" */}
              <Box
                component="span"
                sx={{ typography: 'caption', color: 'text.disabled' }}
              >
                {category.subtitle}
              </Box>
            </Stack>

            {/* Доп. значение (например, процент) */}
            <Box component="span" sx={{ typography: 'body2' }}>
              {category.value}%
            </Box>
          </Box>
        ))}
      </Stack>
    </Card>
  );
}
