// src/pages/sales/sales-leads.jsx
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Container, Typography, Box, Stack, Alert, Button, CircularProgress } from '@mui/material';
import { paths } from 'src/routes/paths';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// Импорт компонентов
import { LeadInteractionTracker } from 'src/sections/sales/components';

// Импорт мок-данных
import { mockLeadInteractions } from 'src/sections/sales/_mock/sales-mock-data';

// ----------------------------------------------------------------------

export default function SalesLeadsPage() {
  const [loading, setLoading] = useState(true);
  const [interactions, setInteractions] = useState([]);
  
  // Прямая установка мок-данных
  useEffect(() => {
    const timer = setTimeout(() => {
      setInteractions(mockLeadInteractions);
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Функция для проигрывания записи звонка
  const handlePlayRecording = (recordingUrl) => {
    console.log('Проигрывание записи:', recordingUrl);
    // Здесь можно добавить логику проигрывания аудио
    window.open(recordingUrl, '_blank');
  };
  
  // Функция для добавления нового взаимодействия
  const handleAddInteraction = async (formData) => {
    try {
      console.log('Добавление взаимодействия:', formData);
      
      // Создаем новое взаимодействие с фиктивным ID
      const newInteraction = {
        id: Date.now(),
        ...formData,
        created_by: 12345,
      };
      
      // Обновляем локальное состояние
      setInteractions(prev => [...prev, newInteraction]);
      
      return { success: true, data: newInteraction };
    } catch (err) {
      console.error('Ошибка при добавлении взаимодействия:', err);
      return { success: false, error: err.message };
    }
  };
  
  // Функция для удаления взаимодействия
  const handleDeleteInteraction = async (interactionId) => {
    console.log('Удаление взаимодействия:', interactionId);
    
    // Обновляем локальное состояние, удаляя взаимодействие
    setInteractions(prev => prev.filter(item => item.id !== interactionId));
  };
  
  // Функция для обновления взаимодействия
  const handleEditInteraction = async (interactionId, updatedData) => {
    console.log('Обновление взаимодействия:', interactionId, updatedData);
    
    // Обновляем локальное состояние
    setInteractions(prev => prev.map(item => 
      item.id === interactionId ? { ...item, ...updatedData } : item
    ));
  };
  
  return (
    <>
      <Helmet>
        <title>Работа с лидами | Отдел продаж</title>
      </Helmet>
      
      <Container maxWidth="xl">
        <CustomBreadcrumbs
          heading="Работа с лидами"
          links={[
            { name: 'Мои показатели', href: paths.dashboard.sales.root },
            { name: 'Лиды' }
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={3}>
            {/* Компонент трекинга взаимодействий */}
            <LeadInteractionTracker
              interactions={interactions}
              isLoading={false}
              onAddInteraction={handleAddInteraction}
              onEditInteraction={handleEditInteraction}
              onDeleteInteraction={handleDeleteInteraction}
              onPlayRecording={handlePlayRecording}
            />
          </Stack>
        )}
      </Container>
    </>
  );
}