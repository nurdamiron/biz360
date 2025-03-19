// src/hooks/use-employee-data.js
import { useState, useEffect } from 'react';
import { useAuthContext } from 'src/auth/hooks';

/**
 * Хук для получения и управления данными текущего сотрудника
 * @param {Object} defaultData - Данные по умолчанию, если нет данных в authContext
 * @returns {Object} - Данные сотрудника и функции для управления ими
 */
export function useEmployeeData(defaultData = {}) {
  const { employee, refreshUserData, loading } = useAuthContext();
  const [employeeData, setEmployeeData] = useState(employee || defaultData);

  // Обновление данных при изменении контекста аутентификации
  useEffect(() => {
    if (employee) {
      setEmployeeData(employee);
    }
  }, [employee]);

  /**
   * Обновление данных сотрудника
   * @param {Object} updatedData - Обновленные данные
   * @returns {Promise} - Результат обновления
   */
  const updateEmployeeData = async (updatedData) => {
    try {
      console.log('Обновление данных сотрудника:', updatedData);
      
      // Здесь должен быть запрос к API для обновления данных
      // const response = await axios.put('/api/employee/update', updatedData);
      
      // Временное решение - обновляем локальные данные
      setEmployeeData({ ...employeeData, ...updatedData });
      
      // Обновляем данные в контексте, если есть функция refreshUserData
      if (refreshUserData) {
        await refreshUserData();
      }
      
      return { success: true };
    } catch (error) {
      console.error('Ошибка при обновлении данных сотрудника:', error);
      return { success: false, error };
    }
  };

  return {
    employeeData,
    updateEmployeeData,
    isLoading: loading,
  };
}