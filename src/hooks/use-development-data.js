// src/hooks/use-development-data.js
import { useState, useCallback } from 'react';
import axiosInstance from 'src/lib/axios';
import { 
  shouldUseMockData, 
  fetchMockData 
} from 'src/sections/sales/_mock/sales-mock-data';
import { useAuth } from 'src/auth/hooks/use-auth';

/**
 * Хук для работы с данными развития сотрудника
 * @param {Object} options - Настройки запроса
 * @returns {Object} - Данные и функции для управления
 */
export function useDevelopmentData(options = {}) {
  const { 
    employeeId = null, // ID сотрудника, если null - текущий пользователь
    initialData = null // Первоначальные данные, если есть
  } = options;
  
  const { user } = useAuth();
  const [developmentData, setDevelopmentData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(null);
  
  // Функция для загрузки данных развития
  const fetchDevelopmentData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Определяем ID сотрудника
      const targetId = employeeId || (user?.id || 'me');
      
      // Проверяем, нужно ли использовать мок-данные
      if (shouldUseMockData()) {
        // Загружаем мок-данные с искусственной задержкой
        const mockData = await fetchMockData('employee', 800);
        setDevelopmentData(mockData);
      } else {
        // Используем реальное API
        const response = await axiosInstance.get(`/api/employee/${targetId}/development`);
        setDevelopmentData(response.data);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Ошибка при загрузке данных развития:', err);
      setError('Не удалось загрузить данные развития. ' + (err.response?.data?.error || err.message || 'Неизвестная ошибка'));
      setLoading(false);
    }
  }, [employeeId, user]);
  
  // Функция для обновления статуса курса
  const updateCourseStatus = useCallback(async (courseId, completed) => {
    try {
      setLoading(true);
      
      // Определяем ID сотрудника
      const targetId = employeeId || (user?.id || 'me');
      
      // Проверяем, нужно ли использовать мок-данные
      if (shouldUseMockData()) {
        // Обновляем локальное состояние
        setDevelopmentData(prevData => {
          if (!prevData) return prevData;
          
          const updatedCourses = prevData.development_plan.required_courses.map(course => 
            course.id === courseId ? { ...course, completed } : course
          );
          
          return {
            ...prevData,
            development_plan: {
              ...prevData.development_plan,
              required_courses: updatedCourses,
              completed_courses: completed 
                ? prevData.development_plan.completed_courses + 1 
                : prevData.development_plan.completed_courses - 1
            }
          };
        });
        
        // Имитация задержки API
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        // Используем реальное API
        await axiosInstance.patch(`/api/employee/${targetId}/courses/${courseId}`, {
          completed
        });
        
        // Обновляем данные после успешного запроса
        await fetchDevelopmentData();
      }
      
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Ошибка при обновлении статуса курса:', err);
      setError('Не удалось обновить статус курса. ' + (err.response?.data?.error || err.message || 'Неизвестная ошибка'));
      setLoading(false);
      return false;
    }
  }, [employeeId, user, fetchDevelopmentData]);
  
  // Функция для обновления целевого уровня
  const updateTargetLevel = useCallback(async (targetLevel) => {
    try {
      setLoading(true);
      
      // Определяем ID сотрудника
      const targetId = employeeId || (user?.id || 'me');
      
      // Проверяем, нужно ли использовать мок-данные
      if (shouldUseMockData()) {
        // Обновляем локальное состояние
        setDevelopmentData(prevData => {
          if (!prevData) return prevData;
          
          return {
            ...prevData,
            next_level: targetLevel
          };
        });
        
        // Имитация задержки API
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        // Используем реальное API
        await axiosInstance.patch(`/api/employee/${targetId}/development`, {
          next_level: targetLevel
        });
        
        // Обновляем данные после успешного запроса
        await fetchDevelopmentData();
      }
      
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Ошибка при обновлении целевого уровня:', err);
      setError('Не удалось обновить целевой уровень. ' + (err.response?.data?.error || err.message || 'Неизвестная ошибка'));
      setLoading(false);
      return false;
    }
  }, [employeeId, user, fetchDevelopmentData]);
  
  // Загрузка данных при первом рендере, если нет initialData
  useState(() => {
    if (!initialData) {
      fetchDevelopmentData();
    }
  }, [initialData, fetchDevelopmentData]);
  
  return {
    developmentData,
    loading,
    error,
    fetchDevelopmentData,
    updateCourseStatus,
    updateTargetLevel,
    // Вспомогательные геттеры для удобного доступа к данным
    level: developmentData?.level || null,
    nextLevel: developmentData?.next_level || null,
    progressToNextLevel: developmentData?.progress_to_next_level || 0,
    competencies: developmentData?.competencies || {},
    developmentPlan: developmentData?.development_plan || { required_courses: [], completed_courses: 0, total_courses: 0 }
  };
}