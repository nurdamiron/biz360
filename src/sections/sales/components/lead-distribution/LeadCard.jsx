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
};

// Компонент для отображения карточки лида
const LeadCard = ({ lead, index, isDragging }) => {
  const theme = useTheme();
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  
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
  
  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  return (
    <Draggable draggableId={`lead-${lead.id}`} index={index}>
      {(provided) => (
        <Paper
          ref={provided.innerRef}
          {...provided.draggableProps}
          sx={{
            p: 2,
            mb: 2,
            borderRadius: 2,
            boxShadow: theme.shadows[isDragging ? 8 : 1],
            border: `1px solid ${isDragging ? theme.palette.primary.main : theme.palette.divider}`,
            bgcolor: isDragging ? alpha(theme.palette.primary.main, 0.05) : 'background.paper',
            transition: 'all 0.2s ease',
            '&:hover': {
              boxShadow: theme.shadows[3],
              borderColor: alpha(theme.palette.primary.main, 0.3)
            }
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                {...provided.dragHandleProps}
                sx={{ 
                  color: theme.palette.text.secondary,
                  cursor: 'grab',
                  mr: 1,
                  '&:hover': { color: theme.palette.text.primary }
                }}
              >
                {Icons.DragHandle}
              </Box>
              <Typography variant="subtitle2" noWrap sx={{ maxWidth: 180 }}>
                {lead.name}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Chip
                label={lead.status}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.75rem',
                  mr: 0.5,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main
                }}
              />
              <IconButton size="small" onClick={handleMenuOpen}>
                {Icons.MoreVert}
              </IconButton>
            </Box>
          </Box>
          
          <Divider sx={{ my: 1 }} />
          
          <Stack spacing={1} sx={{ mb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box component="span" sx={{ color: theme.palette.text.secondary, mr: 0.5 }}>
                  {Icons.Company}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Контакт:
                </Typography>
              </Box>
              <Typography variant="body2" fontWeight="medium" noWrap sx={{ maxWidth: 150 }}>
                {lead.contact}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box component="span" sx={{ color: theme.palette.text.secondary, mr: 0.5 }}>
                  {Icons.Money}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Потенц. сумма:
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
                    color: getPriorityColor(lead.priority), 
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
                  bgcolor: alpha(getPriorityColor(lead.priority), 0.1),
                  color: getPriorityColor(lead.priority)
                }}
              />
            </Box>
          </Stack>
          
          <Divider sx={{ my: 1 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
            >
              Подробнее
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
            <MenuItem onClick={handleMenuClose}>
              <Box component="span" sx={{ mr: 1.5 }}>
                {Icons.Phone}
              </Box>
              Позвонить
            </MenuItem>
            
            <MenuItem onClick={handleMenuClose}>
              <Box component="span" sx={{ mr: 1.5 }}>
                {Icons.Email}
              </Box>
              Отправить email
            </MenuItem>
            
            <MenuItem onClick={handleMenuClose}>
              <Box component="span" sx={{ mr: 1.5 }}>
                {Icons.EditPencil}
              </Box>
              Редактировать
            </MenuItem>
            
            <Divider />
            
            <MenuItem 
              onClick={handleMenuClose}
              sx={{ color: theme.palette.error.main }}
            >
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
};

LeadCard.propTypes = {
  lead: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  isDragging: PropTypes.bool
};

export default LeadCard;