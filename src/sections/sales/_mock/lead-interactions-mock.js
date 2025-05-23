// src/sections/sales/_mock/lead-interactions-mock.js

/**
 * Мок-данные взаимодействий с лидами
 */
export const leadInteractionsMockData = [
    {
      id: 1,
      lead_id: 1001,
      type: 'Звонок',
      date: '2025-03-15T10:30:00',
      duration: 15, // в минутах
      result: 'Договорились о встрече на следующей неделе',
      notes: 'Клиент проявил интерес к нашей системе управления проектами. Задавал много вопросов о функционале и интеграциях.',
      quality_score: 85,
      ai_feedback: 'Звонок проведен хорошо. Менеджер продемонстрировал отличное знание продукта и уверенно ответил на вопросы. Однако можно улучшить работу с выявлением потребностей клиента, задавая больше открытых вопросов.',
      created_by: 12345,
      recording_url: 'https://example.com/recordings/call-12345'
    },
    {
      id: 2,
      lead_id: 1002,
      type: 'Встреча',
      date: '2025-03-14T14:00:00',
      duration: 60, // в минутах
      result: 'Презентация проведена, клиент запросил КП',
      notes: 'Клиента интересует интеграция с 1С и обучение сотрудников. Важно подчеркнуть в КП возможности интеграции и включить предложение по обучению.',
      quality_score: 92,
      ai_feedback: 'Отличная презентация! Менеджер грамотно выявил потребности и адаптировал презентацию под запросы клиента. Рекомендации: добавьте больше конкретных примеров успешных внедрений в похожих компаниях.',
      created_by: 12345,
      meeting_protocol: 'Обсуждались модули: аналитика, управление клиентами, документооборот'
    },
    {
      id: 3,
      lead_id: 1003,
      type: 'Email',
      date: '2025-03-13T09:15:00',
      duration: 10, // в минутах (время, затраченное на составление письма)
      result: 'Отправлено КП и ссылка на демо-доступ',
      notes: 'Клиент запросил информацию о сроках внедрения и стоимости. КП составлено с учетом запрошенных модулей.',
      quality_score: 78,
      ai_feedback: null, // Нет анализа ИИ пока
      created_by: 12346,
      email_thread_id: 'thread-987654'
    },
    {
      id: 4,
      lead_id: 1004,
      type: 'Звонок',
      date: '2025-03-12T16:45:00',
      duration: 8, // в минутах
      result: 'Клиент не заинтересован на данный момент',
      notes: 'Планируют рассмотреть вопрос автоматизации в следующем квартале. Договорились созвониться в начале июня.',
      quality_score: 65,
      ai_feedback: null,
      created_by: 12345,
      recording_url: 'https://example.com/recordings/call-12346'
    },
    {
      id: 5,
      lead_id: 1001,
      type: 'Встреча',
      date: '2025-03-10T11:00:00',
      duration: 45, // в минутах
      result: 'Клиент принял решение о покупке',
      notes: 'Подписан договор на базовую версию с опцией расширения через 3 месяца. Клиент заинтересован в быстром внедрении.',
      quality_score: 95,
      ai_feedback: 'Превосходное взаимодействие! Менеджер продемонстрировал глубокое понимание потребностей клиента, правильно использовал техники завершения сделки. Отличное решение предложить поэтапное внедрение с возможностью расширения.',
      created_by: 12347,
      meeting_protocol: 'Подписание договора, обсуждение этапов внедрения, назначен ответственный за внедрение'
    },
    {
      id: 6,
      lead_id: 1005,
      type: 'Сообщение',
      date: '2025-03-09T13:20:00',
      duration: 5, // в минутах
      result: 'Клиент запросил дополнительную информацию',
      notes: 'Отправлены информационные материалы и пример внедрения в компании из их индустрии.',
      quality_score: 70,
      ai_feedback: null,
      created_by: 12346,
      message_channel: 'WhatsApp'
    }
  ];
  
  /**
   * Функция для получения мок-данных взаимодействий с лидами
   * @param {number} delay - Задержка в мс
   * @returns {Promise<Array>} - Массив взаимодействий
   */
  export const fetchLeadInteractionsMock = (delay = 500) => 
    new Promise((resolve) => {
      setTimeout(() => {
        resolve(leadInteractionsMockData);
      }, delay);
    });
  
  /**
   * Функция для обработки ИИ-анализа взаимодействия
   * @param {number} interactionId - ID взаимодействия
   * @param {number} delay - Задержка в мс
   * @returns {Promise<Object>} - Результат анализа
   */
  export const processAIAnalysisMock = (interactionId, delay = 1500) => 
    new Promise((resolve) => {
      setTimeout(() => {
        const feedbacks = [
          'Взаимодействие проведено на хорошем уровне. Менеджер показал знание продукта и проявил внимание к потребностям клиента. Рекомендуется больше работать с возражениями и глубже выявлять скрытые потребности.',
          'Качество взаимодействия удовлетворительное. Менеджер достаточно хорошо представил продукт, но не полностью использовал возможности для выявления потребностей клиента. Рекомендуется улучшить навыки активного слушания.',
          'Отличное взаимодействие! Менеджер профессионально выявил потребности клиента, предложил подходящее решение и эффективно отработал возражения. Продемонстрировано высокое качество обслуживания.'
        ];
        
        resolve({
          success: true,
          interactionId,
          ai_feedback: feedbacks[Math.floor(Math.random() * feedbacks.length)],
          recommendations: [
            'Уделяйте больше внимания выявлению потребностей клиента',
            'Улучшите презентацию преимуществ продукта',
            'Работайте над техниками завершения сделки'
          ]
        });
      }, delay);
    });