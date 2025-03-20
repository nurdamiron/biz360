// src/sections/sales/components/LeadInteractionTracker.jsx
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Stack,
  Button,
  Menu,
  MenuItem,
  Typography,
  useTheme
} from '@mui/material';

// Импорт подкомпонентов
import InteractionTable from './lead-interaction/InteractionTable';
import InteractionFilters from './lead-interaction/InteractionFilters';
import AddInteractionDialog from './lead-interaction/AddInteractionDialog';
import InteractionDetailsDialog from './lead-interaction/InteractionDetailsDialog';

// Заглушки для иконок
const Icons = {
  Add: '➕',
  Filter: '🔍',
};

/**
 * Компонент для трекинга и оценки взаимодействий с лидами
 */
export default function LeadInteractionTracker({ 
  interactions = [], 
  isLoading = false, 
  onAddInteraction, 
  onEditInteraction, 
  onDeleteInteraction,
  onPlayRecording 
}) {
  const theme = useTheme();
  const [filteredInteractions, setFilteredInteractions] = useState(interactions);
  const [filterType, setFilterType] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [currentInteraction, setCurrentInteraction] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  
  // Обновление отфильтрованных взаимодействий при изменении основных данных
  useEffect(() => {
    filterAndSortInteractions(filterType, sortOrder);
  }, [interactions, filterType, sortOrder]);
  
  // Функция для фильтрации и сортировки взаимодействий
  const filterAndSortInteractions = (type, order) => {
    let filtered = [...interactions];
    
    // Применение фильтра по типу
    if (type !== 'all') {
      filtered = filtered.filter(interaction => interaction.type === type);
    }
    
    // Применение сортировки
    filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      
      return order === 'newest' ? dateB - dateA : dateA - dateB;
    });
    
    setFilteredInteractions(filtered);
  };
  
  // Обработчик открытия меню действий
  const handleOpenActionMenu = (event, interaction) => {
    setActionMenuAnchor(event.currentTarget);
    setCurrentInteraction(interaction);
  };
  
  // Обработчик закрытия меню действий
  const handleCloseActionMenu = () => {
    setActionMenuAnchor(null);
  };
  
  // Обработчик открытия диалога с деталями
  const handleOpenDetails = (interaction) => {
    setCurrentInteraction(interaction);
    setDetailsOpen(true);
    handleCloseActionMenu();
  };
  
  // Обработчик закрытия диалога с деталями
  const handleCloseDetails = () => {
    setDetailsOpen(false);
  };
  
  // Обработчик открытия диалога добавления взаимодействия
  const handleOpenAddDialog = () => {
    setAddDialogOpen(true);
  };
  
  // Обработчик закрытия диалога добавления взаимодействия
  const handleCloseAddDialog = () => {
    setAddDialogOpen(false);
  };
  
  // Обработчик удаления взаимодействия
  const handleDeleteInteraction = () => {
    if (currentInteraction && onDeleteInteraction) {
      onDeleteInteraction(currentInteraction.id);
      handleCloseActionMenu();
    }
  };
  
  // Обработчик изменения фильтра по типу
  const handleTypeFilterChange = (type) => {
    setFilterType(type);
    filterAndSortInteractions(type, sortOrder);
  };
  
  // Обработчик изменения порядка сортировки
  const handleSortOrderChange = (order) => {
    setSortOrder(order);
    filterAndSortInteractions(filterType, order);
  };
  
  // Обработчик добавления нового взаимодействия
  const handleAddInteraction = (formData) => {
    if (onAddInteraction) {
      onAddInteraction(formData);
      handleCloseAddDialog();
    }
  };

  return (
    <Card sx={{ 
      width: '100%', 
      mb: 3, 
      boxShadow: theme.shadows[8],
      borderRadius: 2
    }}>
      <CardHeader
        title="Взаимодействия с лидами"
        subheader={`Всего: ${interactions.length} (${filteredInteractions.length} отображается)`}
        action={
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={Icons.Filter}
              onClick={() => {}} // Добавить обработчик для модального окна с фильтрами
              size="small"
            >
              Фильтры
            </Button>
            <Button
              variant="contained"
              startIcon={Icons.Add}
              onClick={handleOpenAddDialog}
              size="small"
            >
              Добавить
            </Button>
          </Stack>
        }
      />
      
      <Divider />
      
      <CardContent sx={{ p: 0 }}>
        {/* Фильтры по типу взаимодействия */}
        <InteractionFilters
          filterType={filterType}
          sortOrder={sortOrder}
          onTypeFilterChange={handleTypeFilterChange}
          onSortOrderChange={handleSortOrderChange}
        />
        
        <Divider />
        
        {/* Таблица взаимодействий */}
        <InteractionTable
          interactions={filteredInteractions}
          isLoading={isLoading}
          onOpenDetails={handleOpenDetails}
          onOpenActionMenu={handleOpenActionMenu}
          onPlayRecording={onPlayRecording}
          onAddClick={handleOpenAddDialog}
        />
      </CardContent>
      
      {/* Меню действий */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleCloseActionMenu}
        PaperProps={{
          elevation: 3,
          sx: { width: 200, mt: 1 }
        }}
      >
        <MenuItem onClick={() => handleOpenDetails(currentInteraction)}>
          <Box component="span" sx={{ mr: 1.5 }}>📊</Box>
          Детали и анализ
        </MenuItem>
        
        <MenuItem onClick={handleCloseActionMenu}>
          <Box component="span" sx={{ mr: 1.5 }}>✏️</Box>
          Редактировать
        </MenuItem>
        
        <Divider />
        
        <MenuItem 
          onClick={handleDeleteInteraction}
          sx={{ color: theme.palette.error.main }}
        >
          <Box component="span" sx={{ mr: 1.5 }}>🗑️</Box>
          Удалить
        </MenuItem>
      </Menu>
      
      {/* Диалог с деталями взаимодействия */}
      <InteractionDetailsDialog 
        open={detailsOpen}
        interaction={currentInteraction}
        onClose={handleCloseDetails}
      />
      
      {/* Диалог добавления взаимодействия */}
      <AddInteractionDialog
        open={addDialogOpen}
        onClose={handleCloseAddDialog}
        onSubmit={handleAddInteraction}
      />
    </Card>
  );
}

LeadInteractionTracker.propTypes = {
  interactions: PropTypes.array,
  isLoading: PropTypes.bool,
  onAddInteraction: PropTypes.func,
  onEditInteraction: PropTypes.func,
  onDeleteInteraction: PropTypes.func,
  onPlayRecording: PropTypes.func
};