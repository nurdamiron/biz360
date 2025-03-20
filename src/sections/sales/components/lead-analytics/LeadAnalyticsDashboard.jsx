// src/sections/sales/components/lead-analytics/LeadAnalyticsDashboard.jsx
import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Card,
  Grid,
  Paper,
  Stack,
  Button,
  Divider,
  Typography,
  CardHeader,
  CardContent,
  Tab,
  Tabs,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  alpha,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Импорт необходимых аналитических компонентов
import ConversionFunnelChart from './ConversionFunnelChart';
import LeadSourcesPieChart from './LeadSourcesPieChart';
import LeadsByStatusChart from './LeadsByStatusChart';
import LeadValueByTimeChart from './LeadValueByTimeChart';
import LeadMetricsCards from './LeadMetricsCards';

// Заглушки для иконок
const Icons = {
  Calendar: '📅',
  Download: '📥',
  Filter: '🔍',
  Refresh: '🔄',
  Settings: '⚙️',
  Chart: '📊',
};

/**
 * Компонент дашборда аналитики по лидам
 */
export default function LeadAnalyticsDashboard({ 
  conversionData = [], 
  leadSources = [], 
  leadsByStatus = [],
  leadsByTime = [],
  metrics = {},
  isLoading = false,
  onRefresh,
  onPeriodChange,
  onDownloadReport
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeTab, setActiveTab] = useState(0);
  const [period, setPeriod] = useState('month');
  
  // Обработчик изменения вкладки
  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
  };
  
  // Обработчик изменения периода
  const handlePeriodChange = (event) => {
    const newPeriod = event.target.value;
    setPeriod(newPeriod);
    
    if (onPeriodChange) {
      onPeriodChange(newPeriod);
    }
  };
  
  // Обработчик обновления данных
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh(period);
    }
  };
  
  // Обработчик скачивания отчета
  const handleDownloadReport = () => {
    if (onDownloadReport) {
      onDownloadReport(period);
    }
  };
  
  return (
    <Box sx={{ mb: 3 }}>
      {/* Верхняя панель с фильтрами и действиями */}
      <Card
        sx={{
          mb: 3,
          borderRadius: 2,
          boxShadow: theme.shadows[8]
        }}
      >
        <Box
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'stretch' : 'center',
            gap: 2
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant={isMobile ? 'fullWidth' : 'standard'}
          >
            <Tab label="Общая статистика" />
            <Tab label="По источникам" />
            <Tab label="По статусам" />
            <Tab label="По времени" />
          </Tabs>
          
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="period-select-label">Период</InputLabel>
              <Select
                labelId="period-select-label"
                value={period}
                label="Период"
                onChange={handlePeriodChange}
              >
                <MenuItem value="day">День</MenuItem>
                <MenuItem value="week">Неделя</MenuItem>
                <MenuItem value="month">Месяц</MenuItem>
                <MenuItem value="quarter">Квартал</MenuItem>
                <MenuItem value="year">Год</MenuItem>
              </Select>
            </FormControl>
            
            <Button 
              variant="outlined" 
              size="small" 
              startIcon={Icons.Refresh}
              onClick={handleRefresh}
            >
              Обновить
            </Button>
            
            <Button 
              variant="outlined" 
              size="small" 
              startIcon={Icons.Download}
              onClick={handleDownloadReport}
            >
              Отчет
            </Button>
          </Box>
        </Box>
      </Card>
      
      {/* Карточки с ключевыми метриками */}
      <LeadMetricsCards metrics={metrics} />
      
      {/* Вкладка "Общая статистика" */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <ConversionFunnelChart 
              data={conversionData} 
              isLoading={isLoading} 
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <LeadSourcesPieChart 
              data={leadSources} 
              isLoading={isLoading} 
            />
          </Grid>
        </Grid>
      )}
      
      {/* Вкладка "По источникам" */}
      {activeTab === 1 && (
        <LeadSourcesPieChart 
          data={leadSources} 
          isLoading={isLoading} 
          showDetails
        />
      )}
      
      {/* Вкладка "По статусам" */}
      {activeTab === 2 && (
        <LeadsByStatusChart 
          data={leadsByStatus} 
          isLoading={isLoading} 
        />
      )}
      
      {/* Вкладка "По времени" */}
      {activeTab === 3 && (
        <LeadValueByTimeChart 
          data={leadsByTime} 
          isLoading={isLoading} 
          period={period}
        />
      )}
    </Box>
  );
}

LeadAnalyticsDashboard.propTypes = {
  conversionData: PropTypes.array,
  leadSources: PropTypes.array,
  leadsByStatus: PropTypes.array,
  leadsByTime: PropTypes.array,
  metrics: PropTypes.object,
  isLoading: PropTypes.bool,
  onRefresh: PropTypes.func,
  onPeriodChange: PropTypes.func,
  onDownloadReport: PropTypes.func
};