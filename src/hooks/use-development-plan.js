// src/hooks/use-development-plan.js
import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { shouldUseMockData } from '../utils/mock-data-utils';
import { fetchMockData } from '../sections/sales/_mock/sales-mock-data';

/**
 * Хук для работы с планом развития сотрудника
 * @param {Object} options - Настройки хука
 * @returns {Object} - Данные и функции для управления планом развития
 */
export function useDevelopmentPlan(options = {}) {
  const {
    employeeId = null, // ID сотрудника (если null - текущий пользователь)
    initialData = null, // Начальные данные (если есть)
    fetchOnMount = true, // Загружать ли данные при монтировании
    apiUrl = '/api', // Базовый URL API
    mockDelay = 800, // Задержка мок-данных
  } = options;
  
  const [planData, setPlanData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData && fetchOnMount);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);
  
  // Функция для получения ID сотрудника
  const getEmployeeId = useCallback(() => {
    // Если ID передан явно, используем его
    if (employeeId) return employeeId;
    
    // Пытаемся получить ID из хранилища
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      return storedUser?.id || 'me';
    } catch (err) {
      console.error('Ошибка при получении ID сотрудника из хранилища:', err);
      return 'me';
    }
  }, [employeeId]);
  
  // Функция для загрузки данных плана развития
  const fetchPlanData = useCallback(async () => {
    if (!isMounted.current) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const targetId = getEmployeeId();
      console.log('useDevelopmentPlan: загрузка данных для сотрудника', { targetId });
      
      // Проверяем, нужно ли использовать мок-данные
      if (shouldUseMockData()) {
        console.log('useDevelopmentPlan: используем мок-данные');
        
        // Загружаем мок-данные сотрудника
        const mockData = await fetchMockData('employee', mockDelay);
        
        if (isMounted.current) {
          setPlanData(mockData);
          setLoading(false);
        }
      } else {
        console.log('useDevelopmentPlan: используем реальный API');
        
        // Запрос к API для получения данных плана развития
        const endpoint = `${apiUrl}/employee/${targetId}/development`;
        console.log('useDevelopmentPlan: запрос к API', { endpoint });
        
        const response = await axios.get(endpoint);
        
        if (isMounted.current) {
          setPlanData(response.data);
          setLoading(false);
        }
      }
    } catch (err) {
      console.error('Ошибка при загрузке данных плана развития:', err);
      
      if (isMounted.current) {
        setError('Не удалось загрузить данные плана развития. ' + 
          (err.response?.data?.error || err.message || 'Неизвестная ошибка'));
        setLoading(false);
      }
    }
  }, [getEmployeeId, mockDelay, apiUrl]);
  
  // Функция для обновления статуса курса
  const updateCourseStatus = useCallback(async (courseId, completed) => {
    if (!isMounted.current) return false;
    
    try {
      setLoading(true);
      
      const targetId = getEmployeeId();
      console.log('useDevelopmentPlan: обновление статуса курса', { 
        targetId, courseId, completed 
      });
      
      // Проверяем, нужно ли использовать мок-данные
      if (shouldUseMockData()) {
        console.log('useDevelopmentPlan: имитация обновления статуса курса в мок-данных');
        
        // Обновляем локальное состояние для имитации API запроса
        setPlanData(prevData => {
          if (!prevData || !prevData.development_plan) {
            console.warn('useDevelopmentPlan: нет данных для обновления');
            return prevData;
          }
          
          // Находим курс и обновляем его статус
          const updatedCourses = prevData.development_plan.required_courses.map(course => 
            course.id === courseId ? { ...course, completed } : course
          );
          
          // Обновляем счетчик завершенных курсов
          const oldComplete = prevData.development_plan.required_courses.find(c => c.id === courseId)?.completed || false;
          const completeDelta = completed ? (oldComplete ? 0 : 1) : (oldComplete ? -1 : 0);
          
          return {
            ...prevData,
            development_plan: {
              ...prevData.development_plan,
              required_courses: updatedCourses,
              completed_courses: Math.max(0, (prevData.development_plan.completed_courses || 0) + completeDelta)
            }
          };
        });
        
        // Имитация задержки API запроса
        await new Promise(resolve => setTimeout(resolve, mockDelay / 2));
        
        if (isMounted.current) {
          setLoading(false);
        }
        
        return true;
      } else {
        console.log('useDevelopmentPlan: используем реальный API для обновления статуса курса');
        
        // Формируем URL для API запроса
        const endpoint = `${apiUrl}/employee/${targetId}/courses/${courseId}`;
        console.log('useDevelopmentPlan: запрос к API', { endpoint, completed });
        
        // Отправляем запрос на обновление статуса курса
        await axios.patch(endpoint, { completed });
        
        // Загружаем обновленные данные
        await fetchPlanData();
        
        return true;
      }
    } catch (err) {
      console.error('Ошибка при обновлении статуса курса:', err);
      
      if (isMounted.current) {
        setError('Не удалось обновить статус курса. ' + 
          (err.response?.data?.error || err.message || 'Неизвестная ошибка'));
        setLoading(false);
      }
      
      return false;
    }
  }, [getEmployeeId, fetchPlanData, mockDelay, apiUrl]);
  
  // Функция для редактирования целевого уровня
  const updateTargetLevel = useCallback(async (nextLevel) => {
    if (!isMounted.current) return false;
    
    try {
      setLoading(true);
      
      const targetId = getEmployeeId();
      console.log('useDevelopmentPlan: обновление целевого уровня', { 
        targetId, nextLevel 
      });
      
      // Проверяем, нужно ли использовать мок-данные
      if (shouldUseMockData()) {
        console.log('useDevelopmentPlan: имитация обновления целевого уровня в мок-данных');
        
        // Обновляем локальное состояние для имитации API запроса
        setPlanData(prevData => {
          if (!prevData) {
            console.warn('useDevelopmentPlan: нет данных для обновления');
            return prevData;
          }
          
          return {
            ...prevData,
            next_level: nextLevel
          };
        });
        
        // Имитация задержки API запроса
        await new Promise(resolve => setTimeout(resolve, mockDelay / 2));
        
        if (isMounted.current) {
          setLoading(false);
        }
        
        return true;
      } else {
        console.log('useDevelopmentPlan: используем реальный API для обновления целевого уровня');
        
        // Формируем URL для API запроса
        const endpoint = `${apiUrl}/employee/${targetId}/development`;
        console.log('useDevelopmentPlan: запрос к API', { endpoint, nextLevel });
        
        // Отправляем запрос на обновление целевого уровня
        await axios.patch(endpoint, { next_level: nextLevel });
        
        // Загружаем обновленные данные
        await fetchPlanData();
        
        return true;
      }
    } catch (err) {
      console.error('Ошибка при обновлении целевого уровня:', err);
      
      if (isMounted.current) {
        setError('Не удалось обновить целевой уровень. ' + 
          (err.response?.data?.error || err.message || 'Неизвестная ошибка'));
        setLoading(false);
      }
      
      return false;
    }
  }, [getEmployeeId, fetchPlanData, mockDelay, apiUrl]);
  
  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Загрузка данных при монтировании
  useEffect(() => {
    if (fetchOnMount && !initialData) {
      fetchPlanData();
    }
  }, [fetchOnMount, initialData, fetchPlanData]);
  
  // Извлекаем поля для удобного доступа
  const level = planData?.level || null;
  const nextLevel = planData?.next_level || null;
  const progressToNextLevel = planData?.progress_to_next_level || 0;
  const competencies = planData?.competencies || {};
  const developmentPlan = planData?.development_plan || {
    required_courses: [],
    completed_courses: 0,
    total_courses: 0
  };
  
  return {
    // Состояние
    planData,
    loading,
    error,
    
    // Действия
    fetchPlanData,
    updateCourseStatus,
    updateTargetLevel,
    
    // Данные
    level,
    nextLevel,
    progressToNextLevel,
    competencies,
    developmentPlan
  };
}