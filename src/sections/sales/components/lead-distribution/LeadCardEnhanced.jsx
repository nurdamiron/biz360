// src/sections/sales/components/lead-distribution/LeadCard.jsx
import { useState } from 'react';
import PropTypes from 'prop-types';
import { Draggable } from 'react-beautiful-dnd';
import {
  Box,
  Paper,
  Typography,
  Divider,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Tooltip,
  Stack,
  alpha
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { fCurrency } from 'src/utils/format-number';
import { motion } from 'framer-motion';

// Заглушки для иконок
const Icons = {
  DragHandle: '⋮⋮',
  MoreVert: '⋯',
  Company: '🏢',
  Money: '💰',
  Warning: '⚠️',
  Calendar: '📅',
  Phone: '📞',
  Email: '📧',
  EditPencil: '✏️',
  Close: '✕',
  Source: '📱',
};

// Анимации для карточки
const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      type: 'spring',
      stiffness: 300,
      damping: 20
    }
  },
  hover: { 
    y: -5,
    boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.1)'
  }
};

/**
 * Улучшенная карточка лида с анимацией и интерактивностью
 */
export default function LeadCard({ lead, index, isDragging, onAction }) {
  const theme = useTheme();
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  
  // Получение цвета для приоритета
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Высокий':
        return theme.palette.error.main;
      case 'Средний':
        return theme.palette.warning.main;
      case 'Низкий':
        return theme.palette.success.main;
      default:
        return theme.palette.info.main;
    }
  };
  
  // Получение цвета для источника
  const getSourceColor = (source) => {
    switch(source) {
      case 'Сайт':
        return theme.palette.primary.main;
      case 'Звонок':
        return theme.palette.info.main;
      case 'Email-рассылка':
        return theme.palette.success.main;
      case 'Выставка':
        return theme.palette.warning.main;
      case 'Рекомендация':
        return theme.palette.secondary.main;
      case 'Партнер':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[600];
    }
  };
  
  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  const handleToggleDetails = (event) => {
    event.stopPropagation();
    setShowDetails(!showDetails);
  };
  
  // Обработчики действий с карточкой
  const handleAction = (action) => (event) => {
    event.stopPropagation();
    if (onAction) {
      onAction(lead.id, action);
    }
    handleMenuClose();
  };
  
  const priorityColor = getPriorityColor(lead.priority);
  const sourceColor = getSourceColor(lead.source);
  
  return (
    <Draggable draggableId={`lead-${lead.id}`} index={index}>
      {(provided, snapshot) => (
        <Paper
          ref={provided.innerRef}
          {...provided.draggableProps}
          component={motion.div}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          sx={{
            p: 2,
            mb: 2,
            borderRadius: 2,
            boxShadow: theme.shadows[isDragging ? 8 : 1],
            border: `1px solid ${isDragging ? theme.palette.primary.main : theme.palette.divider}`,
            bgcolor: isDragging ? alpha(theme.palette.primary.main, 0.05) : 'background.paper',
            transition: 'all 0.2s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Цветовая полоса приоритета */}
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 4,
              bgcolor: priorityColor,
              borderTopLeftRadius: 2,
              borderBottomLeftRadius: 2
            }}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, pl: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', maxWidth: '80%' }}>
              <Box
                {...provided.dragHandleProps}
                sx={{ 
                  color: theme.palette.text.secondary,
                  cursor: 'grab',
                  mr: 1,
                  opacity: 0.6,
                  '&:hover': { opacity: 1 }
                }}
              >
                {Icons.DragHandle}
              </Box>
              <Tooltip title={lead.name} arrow>
                <Typography variant="subtitle2" noWrap sx={{ maxWidth: '90%' }}>
                  {lead.name}
                </Typography>
              </Tooltip>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Tooltip title={lead.source} arrow>
                <Box 
                  component="span"
                  sx={{ 
                    display: 'flex',
                    color: sourceColor,
                    fontSize: '1rem',
                    mr: 1
                  }}
                >
                  {Icons.Source}
                </Box>
              </Tooltip>
              <IconButton size="small" onClick={handleMenuOpen}>
                {Icons.MoreVert}
              </IconButton>
            </Box>
          </Box>
          
          <Divider sx={{ my: 1 }} />
          
          <Stack spacing={1} sx={{ mb: 1, pl: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box component="span" sx={{ color: theme.palette.text.secondary, mr: 0.5 }}>
                  {Icons.Company}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Контакт:
                </Typography>
              </Box>
              <Tooltip title={lead.contact} arrow>
                <Typography variant="body2" fontWeight="medium" noWrap sx={{ maxWidth: 130 }}>
                  {lead.contact}
                </Typography>
              </Tooltip>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box component="span" sx={{ color: theme.palette.text.secondary, mr: 0.5 }}>
                  {Icons.Money}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Сумма:
                </Typography>
              </Box>
              <Typography variant="body2" fontWeight="bold" color="success.main">
                {fCurrency(lead.potential_amount)}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box 
                  component="span" 
                  sx={{ 
                    color: priorityColor, 
                    mr: 0.5 
                  }}
                >
                  {Icons.Warning}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Приоритет:
                </Typography>
              </Box>
              <Chip
                label={lead.priority}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.75rem',
                  bgcolor: alpha(priorityColor, 0.1),
                  color: priorityColor
                }}
              />
            </Box>
          </Stack>
          
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Divider sx={{ my: 1 }} />
              <Box sx={{ pl: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Дополнительная информация:
                </Typography>
                
                <Stack spacing={0.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      Статус:
                    </Typography>
                    <Typography variant="caption" fontWeight="medium">
                      {lead.status}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      Создан:
                    </Typography>
                    <Typography variant="caption">
                      {new Date(lead.created_at).toLocaleDateString('ru-RU')}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      Источник:
                    </Typography>
                    <Typography variant="caption" fontWeight="medium">
                      {lead.source}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </motion.div>
          )}
          
          <Divider sx={{ my: 1 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pl: 1 }}>
            <Tooltip title="Срок первого контакта" arrow>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box component="span" sx={{ color: theme.palette.error.main, mr: 0.5 }}>
                  {Icons.Calendar}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  До {lead.contact_deadline || 'Не указано'}
                </Typography>
              </Box>
            </Tooltip>
            
            <Button
              variant="text"
              size="small"
              sx={{ 
                p: 0, 
                minWidth: 'auto', 
                color: theme.palette.primary.main,
                textTransform: 'none'
              }}
              onClick={handleToggleDetails}
            >
              {showDetails ? 'Скрыть' : 'Подробнее'}
            </Button>
          </Box>
          
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              elevation: 3,
              sx: { width: 200, mt: 1 }
            }}
          >
            <MenuItem onClick={handleAction('call')}>
              <Box component="span" sx={{ mr: 1.5 }}>
                {Icons.Phone}
              </Box>
              Позвонить
            </MenuItem>
            
            <MenuItem onClick={handleAction('email')}>
              <Box component="span" sx={{ mr: 1.5 }}>
                {Icons.Email}
              </Box>
              Отправить email
            </MenuItem>
            
            <MenuItem onClick={handleAction('edit')}>
              <Box component="span" sx={{ mr: 1.5 }}>
                {Icons.EditPencil}
              </Box>
              Редактировать
            </MenuItem>
            
            <Divider />
            
            <MenuItem onClick={handleAction('delete')} sx={{ color: theme.palette.error.main }}>
              <Box component="span" sx={{ mr: 1.5 }}>
                {Icons.Close}
              </Box>
              Удалить
            </MenuItem>
          </Menu>
        </Paper>
      )}
    </Draggable>
  );
}

LeadCard.propTypes = {
  lead: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  isDragging: PropTypes.bool,
  onAction: PropTypes.func
};