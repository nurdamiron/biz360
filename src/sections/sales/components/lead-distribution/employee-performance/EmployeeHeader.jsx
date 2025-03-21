// src/sections/sales/components/lead-distribution/employee-performance/EmployeeHeader.jsx
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  alpha
} from '@mui/material';
import { motion } from 'framer-motion';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

/**
 * Компонент для отображения уровня в виде звезд
 */
const LevelStars = ({ level, max = 4, theme }) => {
  const stars = [];
  
  // Определение количества звезд на основе уровня
  const getStarsCount = (level) => {
    switch(level) {
      case 'Senior':
        return 3;
      case 'Middle':
        return 2;
      case 'Junior':
        return 1;
      case 'Team Lead':
        return 4;
      default:
        return 1;
    }
  };
  
  const starsCount = getStarsCount(level);
  
  // Генерация звезд
  for (let i = 0; i < max; i++) {
    stars.push(
      <Box key={i} component="span">
        {i < starsCount ? (
          <StarIcon color="warning" />
        ) : (
          <StarBorderIcon sx={{ color: alpha(theme.palette.warning.main, 0.3) }} />
        )}
      </Box>
    );
  }
  
  return <Box sx={{ display: 'flex' }}>{stars}</Box>;
};

LevelStars.propTypes = {
  level: PropTypes.string.isRequired,
  max: PropTypes.number,
  theme: PropTypes.object.isRequired
};

/**
 * Компонент заголовка профиля сотрудника
 */
export default function EmployeeHeader({ employee, theme }) {
  return (
    <>
      {/* Декоративное фоновое изображение */}
      <Box 
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 120,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.8)} 0%, ${alpha(theme.palette.secondary.main, 0.8)} 100%)`,
          zIndex: 0
        }}
      />
      
      <Box sx={{ pt: 12, pb: 2, px: 3, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'center', md: 'flex-start' }, gap: 3 }}>
          {/* Аватар */}
          <Avatar
            src={employee.avatar}
            alt={employee.name}
            sx={{ 
              width: 120, 
              height: 120, 
              border: `4px solid white`,
              boxShadow: theme.shadows[3],
              bgcolor: employee.color || theme.palette.primary.main,
              fontSize: '3rem'
            }}
          >
            {employee.name?.charAt(0) || 'U'}
          </Avatar>
          
          {/* Информация */}
          <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            <Typography variant="h5" fontWeight="bold">
              {employee.name}
            </Typography>
            
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {employee.role}
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'center', sm: 'flex-start' }, gap: 1, mt: 1 }}>
              <LevelStars level={employee.level} theme={theme} />
              
              <Chip 
                label={employee.level} 
                color="primary" 
                variant="outlined"
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}

EmployeeHeader.propTypes = {
  employee: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired
};