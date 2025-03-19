// src/hooks/use-employee-metrics.js
import { useState, useEffect } from 'react';
import axiosInstance from 'src/lib/axios';
import { useAuthContext } from 'src/auth/hooks';

/**
 * Хук для получения метрик сотрудника
 * @param {string} employeeId - ID сотрудника (если не указан, используется текущий пользователь)
 * @returns {Object} - Данные метрик и состояние загрузки
 */
export function useEmployeeMetrics(employeeId) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { employee } = useAuthContext();

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Используем ID из параметра или текущего пользователя, или 'me'
        const targetId = employeeId || (employee?.id || 'me');
        
        // Запрос к API
        const response = await axiosInstance.get(`/api/metrics/employee/${targetId}`);
        
        if (response.data.success) {
          setMetrics(response.data);
        } else {
          setError(response.data.error || 'Не удалось загрузить метрики');
        }
      } catch (err) {
        console.error('Ошибка при загрузке метрик:', err);
        setError('Не удалось загрузить метрики. ' + (err.response?.data?.error || err.message || 'Неизвестная ошибка'));
      } finally {
        setLoading(false);
      }
    };

    // Запускаем загрузку метрик только если есть employee или указан employeeId
    if (employee || employeeId) {
      fetchMetrics();
    } else {
      setLoading(false);
    }
  }, [employeeId, employee]);

  return {
    metrics,
    loading,
    error,
    // Включаем отдельные поля для удобства доступа
    employeeMetrics: metrics?.metrics || null,
    employeeData: metrics?.employee || null,
    bonuses: metrics?.bonuses || null,
    history: metrics?.history || [],
    departmentComparison: metrics?.department_comparison || null,
  };
}