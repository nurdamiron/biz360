import { _mock } from './_mock';

// ----------------------------------------------------------------------

export const JOB_DETAILS_TABS = [
  { label: 'Содержание', value: 'content' },
  { label: 'Кандидаты', value: 'candidates' },
];

export const JOB_SKILL_OPTIONS = [
  'Управление проектами',
  'Диагностика проблем',
  'Бизнес-анализ',
  'Техники продаж',
  'Ведение переговоров',
  'Исследование рынка',
  'Подготовка отчетности',
  'Работа с CRM',
  'Бюджетирование',
  'Оценка рисков',
  'Контроль качества',
  'Анализ эффективности',
  'Коммуникабельность',
  'Решение проблем',
  'Лидерские качества', 
  'Управление временем',
  'Адаптивность',
  'Командная работа',
  'Креативность',
  'Критическое мышление',
  'Клиентоориентированность',
];

export const JOB_WORKING_SCHEDULE_OPTIONS = [
  '5/2',
  'Выходные дни',
  'Дневная смена',
];

export const JOB_EMPLOYMENT_TYPE_OPTIONS = [
  { label: 'Полный день', value: 'Полный день' },
  { label: 'Полставки', value: 'Полставки' },
  { label: 'По требованию', value: 'По требованию' },
  { label: 'Договорный', value: 'Договорный' },
];

export const JOB_EXPERIENCE_OPTIONS = [
  { label: 'Без опыта', value: 'No experience' },
  { label: '1 год', value: '1 year exp' },
  { label: '2 года', value: '2 year exp' },
  { label: 'Больше 3 года', value: '> 3 year exp' },
];

export const JOB_BENEFIT_OPTIONS = [
  { label: 'Бесплатная парковка', value: 'Free parking' },
  { label: 'Бонусы', value: 'Bonus commission' },
  { label: 'Путешествовать', value: 'Travel' },
  { label: 'Поддержка устройствами', value: 'Device support' },
  { label: 'Здравоохранение', value: 'Health care' },
  { label: 'Обучение', value: 'Training' },
  { label: 'Медицинское страхование', value: 'Health insurance' },
  { label: 'Пенсионные планы', value: 'Retirement plans' },
  { label: 'Оплачиваемый отпуск', value: 'Paid time off' },
  { label: 'Гибкий график работы', value: 'Flexible work schedule' },
];

export const JOB_PUBLISH_OPTIONS = [
  { label: 'Опубликованный', value: 'published' },
  { label: 'Черновик', value: 'draft' },
];

export const JOB_SORT_OPTIONS = [
  { label: 'Последние', value: 'latest' },
  { label: 'Популярные', value: 'popular' },
  { label: 'Старые', value: 'oldest' },
];

const CANDIDATES = Array.from({ length: 12 }, (_, index) => ({
  id: _mock.id(index),
  role: _mock.role(index),
  name: _mock.fullName(index),
  avatarUrl: _mock.image.avatar(index),
}));

const CONTENT = `
<h6>Job description</h6>

<p>Мы ищем энергичного и целеустремленного менеджера по продажам, который станет частью нашей динамично развивающейся команды. Вы будете играть ключевую роль в развитии бизнеса, построении долгосрочных отношений с клиентами и достижении амбициозных целей по продажам.</p>

<h6>Ключевые обязанности</h6>

<ul>
  <li>Активный поиск и привлечение новых клиентов, развитие существующей клиентской базы.</li>
  <li>Проведение презентаций продукта, подготовка коммерческих предложений и ведение переговоров.</li>
  <li>Выполнение планов продаж и достижение установленных KPI.</li>
  <li>Ведение клиентской базы в CRM-системе и подготовка отчетности по продажам.</li>
  <li>Мониторинг рынка и конкурентной среды, предоставление аналитики по своему направлению.</li>
  <li>Контроль дебиторской задолженности и работа в рамках установленного бюджета.</li>
  <li>Взаимодействие с отделами компании для обеспечения качественного сервиса клиентам.</li>
</ul>

<h6>Почему вам понравится работать у нас</h6>
<ul>
  <li>Конкурентоспособная заработная плата: высокий оклад + прогрессивная система бонусов.</li>
  <li>Профессиональное развитие: регулярные тренинги и обучение новым техникам продаж.</li>
  <li>Карьерный рост: возможность развиваться как вертикально, так и горизонтально.</li>
  <li>Современный офис в центре города с комфортной рабочей атмосферой.</li>
  <li>Дружная команда профессионалов, готовых делиться опытом.</li>
  <li>Корпоративные мероприятия и командообразующие активности.</li>
  <li>Полный социальный пакет и медицинская страховка.</li>
</ul>
`;

export const _jobs = Array.from({ length: 12 }, (_, index) => {
  const publish = index % 3 ? 'published' : 'draft';

  const salary = {
    type: (index % 5 && 'Custom') || 'Hourly',
    price: _mock.number.price(index),
    negotiable: _mock.boolean(index),
  };

  const benefits = JOB_BENEFIT_OPTIONS.slice(0, 3).map((option) => option.label);

  const experience =
    JOB_EXPERIENCE_OPTIONS.map((option) => option.label)[index] || JOB_EXPERIENCE_OPTIONS[1].label;

  const employmentTypes = (index % 2 && ['Полставки']) ||
    (index % 3 && ['По требованию']) ||
    (index % 4 && ['Договорный']) || ['Полный день'];

  const company = {
    name: _mock.companyNames(index),
    logo: _mock.image.company(index),
    phoneNumber: _mock.phoneNumber(index),
    fullAddress: _mock.fullAddress(index),
  };

  return {
    id: _mock.id(index),
    salary,
    publish,
    company,
    benefits,
    experience,
    employmentTypes,
    content: CONTENT,
    candidates: CANDIDATES,
    role: _mock.role(index),
    title: _mock.jobTitle(index),
    createdAt: _mock.time(index),
    expiredDate: _mock.time(index),
    skills: JOB_SKILL_OPTIONS.slice(0, 3),
    totalViews: _mock.number.nativeL(index),
    locations: [_mock.countryNames(1), _mock.countryNames(2)],
    workingSchedule: JOB_WORKING_SCHEDULE_OPTIONS.slice(0, 2),
  };
});
