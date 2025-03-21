// src/sections/sales/components/lead-distribution/DistributionStats.jsx
import PropTypes from 'prop-types';
import {
  Box,
  Card,
  Grid,
  Stack,
  Typography,
  CardContent,
  Skeleton,
  alpha
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';

// Анимации для элементов
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24
    }
  }
};

/**
 * Компонент для отображения статистики распределения
 */
export default function DistributionStats({ stats, isLoading }) {
  const theme = useTheme();
  
  if (isLoading) {
    return (
      <Card
        component={motion.div}
        variants={itemVariants}
        sx={{
          borderRadius: 2,
          boxShadow: theme.customShadows?.z8 || '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
          mb: 3,
          overflow: 'hidden'
        }}
      >
        <CardContent sx={{ py: 2 }}>
          <Grid container spacing={3}>
            {[...Array(4)].map((_, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Skeleton variant="rectangular" width="100%" height={60} sx={{ borderRadius: 1 }} />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  }
  
  if (!stats) return null;
  
  return (
    <Card
      component={motion.div}
      variants={itemVariants}
      sx={{
        borderRadius: 2,
        boxShadow: theme.customShadows?.z8 || '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
        mb: 3,
        overflow: 'hidden'
      }}
    >
      <CardContent sx={{ py: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={6} md={3}>
            <Stack spacing={0.5} alignItems="center">
              <Typography variant="subtitle1" color="text.secondary">
                Всего лидов
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {stats.total}
              </Typography>
            </Stack>
          </Grid>
          
          <Grid item xs={6} md={3}>
            <Stack spacing={0.5} alignItems="center">
              <Typography variant="subtitle1" color="text.secondary">
                Распределено
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                {stats.assigned}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stats.total > 0 ? `${Math.round((stats.assigned / stats.total) * 100)}%` : '0%'}
              </Typography>
            </Stack>
          </Grid>
          
          <Grid item xs={6} md={3}>
            <Stack spacing={0.5} alignItems="center">
              <Typography variant="subtitle1" color="text.secondary">
                Не распределено
              </Typography>
              <Typography 
                variant="h4" 
                fontWeight="bold"
                color={stats.unassigned > 0 ? 'warning.main' : 'success.main'}
              >
                {stats.unassigned}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stats.total > 0 ? `${Math.round((stats.unassigned / stats.total) * 100)}%` : '0%'}
              </Typography>
            </Stack>
          </Grid>
          
          <Grid item xs={6} md={3}>
            <Stack spacing={0.5} alignItems="center">
              <Typography variant="subtitle1" color="text.secondary">
                Высокий приоритет
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="error.main">
                {stats.byPriority.high}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stats.total > 0 ? `${Math.round((stats.byPriority.high / stats.total) * 100)}%` : '0%'}
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

DistributionStats.propTypes = {
  stats: PropTypes.object,
  isLoading: PropTypes.bool
};