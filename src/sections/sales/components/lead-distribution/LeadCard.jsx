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
import { motion } from 'framer-motion';

// Material UI иконки
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import BusinessIcon from '@mui/icons-material/Business';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import EventIcon from '@mui/icons-material/Event';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SourceIcon from '@mui/icons-material/Source';

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
export default function LeadCard({ lead, index, isDragging, compactView = false, onAction }) {
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
  
  // Форматирование суммы
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
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
            boxShadow: theme.shadows[snapshot.isDragging ? 4 : 1],
            border: `1px solid ${snapshot.isDragging ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.1)}`,
            bgcolor: snapshot.isDragging ? alpha(theme.palette.primary.main, 0.05) : 'background.paper',
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
            <Box sx={{ display: 'flex', alignItems: 'center', maxWidth: '75%' }}>
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
                <DragIndicatorIcon />
              </Box>
              <Tooltip title={lead.name} arrow>
                <Typography variant="subtitle2" noWrap sx={{ maxWidth: compactView ? '120px' : '180px' }}>
                  {lead.name}
                </Typography>
              </Tooltip>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Tooltip title={`Источник: ${lead.source}`} arrow>
                <Box 
                  sx={{ 
                    display: 'flex',
                    color: sourceColor,
                    mr: 1
                  }}
                >
                  <SourceIcon fontSize="small" />
                </Box>
              </Tooltip>
              <IconButton size="small" onClick={handleMenuOpen}>
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
          
          <Divider sx={{ my: 1 }} />
          
          {compactView ? (
            // Компактный вид для оптимизации пространства
            <Box sx={{ pl: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Tooltip title={`Контакт: ${lead.contact}`} arrow>
                  <Typography variant="body2" noWrap color="text.secondary" sx={{ maxWidth: '120px' }}>
                    {lead.contact}
                  </Typography>
                </Tooltip>
                <Chip
                  label={lead.priority}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.6rem',
                    bgcolor: alpha(priorityColor, 0.1),
                    color: priorityColor
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" fontWeight="bold" color="success.main">
                  {formatCurrency(lead.potential_amount)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  До {lead.contact_deadline}
                </Typography>
              </Box>
            </Box>
          ) : (
            // Полный вид с детализацией
            <Stack spacing={1} sx={{ mb: 1, pl: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <BusinessIcon fontSize="small" sx={{ color: theme.palette.text.secondary, mr: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    Контакт:
                  </Typography>
                </Box>
                <Tooltip title={lead.contact} arrow>
                  <Typography variant="body2" fontWeight="medium" noWrap sx={{ maxWidth: 150 }}>
                    {lead.contact}
                  </Typography>
                </Tooltip>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AttachMoneyIcon fontSize="small" sx={{ color: theme.palette.text.secondary, mr: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    Сумма:
                  </Typography>
                </Box>
                <Typography variant="body2" fontWeight="bold" color="success.main">
                  {formatCurrency(lead.potential_amount)}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PriorityHighIcon fontSize="small" sx={{ color: priorityColor, mr: 0.5 }} />
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
          )}
          
          {showDetails && !compactView && (
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
                      Отрасль:
                    </Typography>
                    <Typography variant="caption" fontWeight="medium">
                      {lead.industry || 'Не указана'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      Размер бизнеса:
                    </Typography>
                    <Typography variant="caption" fontWeight="medium">
                      {lead.business_size || 'Не указан'}
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
                <EventIcon fontSize="small" sx={{ color: theme.palette.error.main, mr: 0.5 }} />
                <Typography variant="caption" color="text.secondary">
                  До {lead.contact_deadline}
                </Typography>
              </Box>
            </Tooltip>
            
            {!compactView && (
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
            )}
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
              <PhoneIcon fontSize="small" sx={{ mr: 1.5 }} />
              Позвонить
            </MenuItem>
            
            <MenuItem onClick={handleAction('email')}>
              <EmailIcon fontSize="small" sx={{ mr: 1.5 }} />
              Отправить email
            </MenuItem>
            
            <MenuItem onClick={handleAction('edit')}>
              <EditIcon fontSize="small" sx={{ mr: 1.5 }} />
              Редактировать
            </MenuItem>
            
            <Divider />
            
            <MenuItem onClick={handleAction('delete')} sx={{ color: theme.palette.error.main }}>
              <DeleteIcon fontSize="small" sx={{ mr: 1.5 }} />
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
  compactView: PropTypes.bool,
  onAction: PropTypes.func
};