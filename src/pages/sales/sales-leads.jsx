// src/pages/sales/sales-leads.jsx
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Container, Typography, Box, Stack, Alert, Button } from '@mui/material';
import { paths } from 'src/routes/paths';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { LoadingScreen } from 'src/components/loading-screen';

// Импорт компонентов
import { LeadInteractionTracker } from 'src/sections/sales/components';

// Импорт хуков для работы с данными
import { useLeadsData } from 'src/hooks/use-leads-data';

// ----------------------------------------------------------------------

export default function SalesLeadsPage() {
  const { 
    leadsData, 
    interactions, 
    loading, 
    error, 
    fetchLeadsData, 
    createInteraction, 
    updateLeadStatus 
  } = useLeadsData({
    fetchOnMount: true,
    mockDelay: 1000
  });
  
  // Функция для проигрывания записи звонка
  const handlePlayRecording = (recordingUrl) => {
    console.log('Проигрывание записи:', recordingUrl);
    // Здесь можно добавить логику проигрывания аудио
    window.open(recordingUrl, '_blank');
  };
  
  // Функция для добавления нового взаимодействия
  const handleAddInteraction = async (formData) => {
    try {
      const result = await createInteraction(formData.lead_id, formData);
      
      if (result.success) {
        console.log('Взаимодействие успешно добавлено:', result.data);
        // Можно добавить уведомление об успешном добавлении
      }
    } catch (err) {
      console.error('Ошибка при добавлении взаимодействия:', err);
      // Можно добавить уведомление об ошибке
    }
  };
  
  // Функция для удаления взаимодействия
  const handleDeleteInteraction = async (interactionId) => {
    console.log('Удаление взаимодействия:', interactionId);
    // Здесь будет логика удаления
    // После удаления обновляем данные
    fetchLeadsData();
  };
  
  // Функция для обновления взаимодействия
  const handleEditInteraction = async (interactionId, updatedData) => {
    console.log('Обновление взаимодействия:', interactionId, updatedData);
    // Здесь будет логика обновления
    // После обновления обновляем данные
    fetchLeadsData();
  };
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return (
    <>
      <Helmet>
        <title>Работа с лидами | Отдел продаж</title>
      </Helmet>
      
      <Container maxWidth="xl">
        <CustomBreadcrumbs
          heading="Работа с лидами"
          links={[
            { name: 'Главная', href: paths.dashboard.root },
            { name: 'Отдел продаж', href: paths.dashboard.sales?.root || '/dashboard/sales' },
            { name: 'Лиды' }
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Stack spacing={3}>
          {/* Компонент трекинга взаимодействий */}
          <LeadInteractionTracker
            interactions={interactions}
            isLoading={loading}
            onAddInteraction={handleAddInteraction}
            onEditInteraction={handleEditInteraction}
            onDeleteInteraction={handleDeleteInteraction}
            onPlayRecording={handlePlayRecording}
          />
          
          {/* Здесь могут быть дополнительные компоненты, такие как списки лидов,
              статистика по лидам, воронка продаж и т.д. */}
        </Stack>
      </Container>
    </>
  );
}