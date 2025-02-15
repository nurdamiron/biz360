import { today } from 'src/utils/format-time';

import { CONFIG } from 'src/global-config';

import { _mock } from './_mock';

// APP
// ----------------------------------------------------------------------

export const _appRelated = [
  '一次性防护服', // Одноразовые защитные костюмы
  '防护手套', // Защитные перчатки
  '安全鞋', // Защитная обувь
  '头部防护', // Каски и защитные очки
  '防护口罩', // Медицинские маски и респираторы
].map((name, index) => ({
  id: _mock.id(index),
  name,
  downloaded: _mock.number.nativeL(index) * 50, // Продано штук
  ratingNumber: _mock.number.rating(index),
  size: _mock.number.nativeL(index) * 10, // Запас на складе
  totalReviews: _mock.number.nativeL(index),
  shortcut: `${CONFIG.assetsDir}/assets/icons/products/ic-product-${index + 1}.webp`,
  price: [2, 4].includes(index) ? _mock.number.price(index) : 0,
}));

export const _appInstalled = ['中国', '美国', '德国', '英国', '法国'].map(
  (country, index) => ({
    id: _mock.id(index),
    countryName: country,
    android: _mock.number.nativeL(index) * 500, // Продажи через онлайн-магазины
    windows: _mock.number.nativeL(index + 1) * 300, // Оптовые продажи
    apple: _mock.number.nativeL(index + 2) * 100, // Розничные продажи
    countryCode: ['cn', 'us', 'de', 'gb', 'fr'][index],
  })
);


export const _appAuthors = Array.from({ length: 3 }, (_, index) => ({
  id: _mock.id(index),
  name: _mock.fullName(index),
  avatarUrl: _mock.image.avatar(index),
  totalFavorites: _mock.number.nativeL(index) * 20, // Количество сделанных поставок
}));


export const _appInvoices = Array.from({ length: 5 }, (_, index) => {
  const category = ['工作服', '安全鞋', '防护手套', '头部防护', '防护口罩'][index];

  const status = ['已支付', '过期', '进行中', '已支付', '已支付'][index];

  return {
    id: _mock.id(index),
    invoiceNumber: `INV-20${index}45`,
    price: _mock.number.price(index) * 10, // Сумма заказа
    category,
    status,
  };
});


export const _appFeatured = Array.from({ length: 3 }, (_, index) => ({
  id: _mock.id(index + 3),
  title: _mock.postTitle(index + 3),
  description: _mock.sentence(index + 3),
  coverUrl: _mock.image.cover(index + 3),
}));


// ANALYTIC
// ----------------------------------------------------------------------
export const _analyticTasks = Array.from({ length: 5 }, (_, index) => ({
  id: _mock.id(index),
  name: `库存管理任务 ${index + 1}`, // Управление запасами
}));

export const _analyticPosts = Array.from({ length: 5 }, (_, index) => ({
  id: _mock.id(index),
  postedAt: _mock.time(index),
  title: `最新行业动态 ${index + 1}`,
  coverUrl: _mock.image.cover(index),
  description: _mock.sentence(index),
}));


export const _analyticOrderTimeline = Array.from({ length: 5 }, (_, index) => {
  const title = [
    '1,245 订单已完成',
    '客户付款 45 笔',
    '9 月订单 #37745',
    '新订单 #XF-2356',
    '新订单 #XF-2346',
  ][index];

  return {
    id: _mock.id(index),
    title,
    type: `order${index + 1}`,
    time: _mock.time(index),
  };
});


export const _analyticTraffic = [
  {
    value: 'online',
    label: '线上商店',
    total: _mock.number.nativeL(1) * 1000, // Продажи через онлайн-магазин
  },
  {
    value: 'wholesale',
    label: '批发市场',
    total: _mock.number.nativeL(2) * 500, // Оптовые продажи
  },
  {
    value: 'retail',
    label: '零售店',
    total: _mock.number.nativeL(3) * 300, // Розничные продажи
  },
  {
    value: 'corporate',
    label: '企业客户',
    total: _mock.number.nativeL(4) * 800, // Корпоративные клиенты
  },
];

// ECOMMERCE
// ----------------------------------------------------------------------

export const _ecommerceSalesOverview = ['Total profit', 'Total income', 'Total expenses'].map(
  (label, index) => ({
    label,
    totalAmount: _mock.number.price(index) * 100,
    value: _mock.number.percent(index),
  })
);

export const _ecommerceBestSalesman = Array.from({ length: 5 }, (_, index) => {
  const category = ['CAP', 'Branded shoes', 'Headphone', 'Cell phone', 'Earings'][index];

  return {
    id: _mock.id(index),
    category,
    rank: `Top ${index + 1}`,
    email: _mock.email(index),
    name: _mock.fullName(index),
    totalAmount: _mock.number.price(index),
    avatarUrl: _mock.image.avatar(index + 8),
    countryCode: ['de', 'gb', 'fr', 'kr', 'us'][index],
  };
});

export const _ecommerceLatestProducts = Array.from({ length: 5 }, (_, index) => {
  const colors = (index === 0 && ['#2EC4B6', '#E71D36', '#FF9F1C', '#011627']) ||
    (index === 1 && ['#92140C', '#FFCF99']) ||
    (index === 2 && ['#0CECDD', '#FFF338', '#FF67E7', '#C400FF', '#52006A', '#046582']) ||
    (index === 3 && ['#845EC2', '#E4007C', '#2A1A5E']) || ['#090088'];

  return {
    id: _mock.id(index),
    colors,
    name: _mock.productName(index),
    price: _mock.number.price(index),
    coverUrl: _mock.image.product(index),
    priceSale: [1, 3].includes(index) ? _mock.number.price(index) : 0,
  };
});

export const _ecommerceNewProducts = Array.from({ length: 4 }, (_, index) => ({
  id: _mock.id(index),
  name: _mock.productName(index),
  coverUrl: _mock.image.product(index),
}));

// BANKING
// ----------------------------------------------------------------------

export const _bankingContacts = Array.from({ length: 12 }, (_, index) => ({
  id: _mock.id(index),
  name: _mock.fullName(index),
  email: _mock.email(index),
  avatarUrl: _mock.image.avatar(index),
}));

export const _bankingCreditCard = [
  {
    id: _mock.id(2),
    balance: 23432.03,
    cardType: 'mastercard',
    cardHolder: _mock.fullName(2),
    cardNumber: '**** **** **** 3640',
    cardValid: '11/22',
  },
  {
    id: _mock.id(3),
    balance: 18000.23,
    cardType: 'visa',
    cardHolder: _mock.fullName(3),
    cardNumber: '**** **** **** 8864',
    cardValid: '11/25',
  },
  {
    id: _mock.id(4),
    balance: 2000.89,
    cardType: 'mastercard',
    cardHolder: _mock.fullName(4),
    cardNumber: '**** **** **** 7755',
    cardValid: '11/22',
  },
];

export const _bankingRecentTransitions = [
  {
    id: _mock.id(2),
    name: _mock.fullName(2),
    avatarUrl: _mock.image.avatar(2),
    type: 'Income',
    message: 'Receive money from',
    category: 'Annette black',
    date: _mock.time(2),
    status: 'progress',
    amount: _mock.number.price(2),
  },
  {
    id: _mock.id(3),
    name: _mock.fullName(3),
    avatarUrl: _mock.image.avatar(3),
    type: 'Expenses',
    message: 'Payment for',
    category: 'Courtney henry',
    date: _mock.time(3),
    status: 'completed',
    amount: _mock.number.price(3),
  },
  {
    id: _mock.id(4),
    name: _mock.fullName(4),
    avatarUrl: _mock.image.avatar(4),
    type: 'Receive',
    message: 'Payment for',
    category: 'Theresa webb',
    date: _mock.time(4),
    status: 'failed',
    amount: _mock.number.price(4),
  },
  {
    id: _mock.id(5),
    name: null,
    avatarUrl: null,
    type: 'Expenses',
    message: 'Payment for',
    category: 'Fast food',
    date: _mock.time(5),
    status: 'completed',
    amount: _mock.number.price(5),
  },
  {
    id: _mock.id(6),
    name: null,
    avatarUrl: null,
    type: 'Expenses',
    message: 'Payment for',
    category: 'Fitness',
    date: _mock.time(6),
    status: 'progress',
    amount: _mock.number.price(6),
  },
];

// BOOKING
// ----------------------------------------------------------------------

export const _bookings = Array.from({ length: 5 }, (_, index) => {
  const status = ['Paid', 'Paid', 'Pending', 'Cancelled', 'Paid'][index];

  const customer = {
    avatarUrl: _mock.image.avatar(index),
    name: _mock.fullName(index),
    phoneNumber: _mock.phoneNumber(index),
  };

  const destination = Array.from({ length: 5 }, (__, _index) => ({
    name: _mock.tourName(_index + 1),
    coverUrl: _mock.image.travel(_index + 1),
  }))[index];

  return {
    id: _mock.id(index),
    destination,
    status,
    customer,
    checkIn: _mock.time(index),
    checkOut: _mock.time(index),
  };
});

export const _bookingsOverview = Array.from({ length: 3 }, (_, index) => ({
  status: ['Pending', 'Canceled', 'Sold'][index],
  quantity: _mock.number.nativeL(index),
  value: _mock.number.percent(index + 5),
}));

export const _bookingReview = Array.from({ length: 5 }, (_, index) => ({
  id: _mock.id(index),
  name: _mock.fullName(index),
  postedAt: _mock.time(index),
  rating: _mock.number.rating(index),
  avatarUrl: _mock.image.avatar(index),
  description: _mock.description(index),
  tags: ['Great sevice', 'Recommended', 'Best price'],
}));

export const _bookingNew = Array.from({ length: 8 }, (_, index) => ({
  guests: '3-5',
  id: _mock.id(index),
  bookedAt: _mock.time(index),
  duration: '3 days 2 nights',
  isHot: _mock.boolean(index),
  name: _mock.fullName(index),
  price: _mock.number.price(index),
  avatarUrl: _mock.image.avatar(index),
  coverUrl: _mock.image.travel(index),
}));

// COURSE
// ----------------------------------------------------------------------

export const _coursesContinue = Array.from({ length: 4 }, (_, index) => ({
  id: _mock.id(index),
  title: _mock.courseNames(index),
  coverUrl: _mock.image.course(index),
  totalLesson: 12,
  currentLesson: index + 7,
}));

export const _coursesFeatured = Array.from({ length: 6 }, (_, index) => ({
  id: _mock.id(index),
  title: _mock.courseNames(index),
  coverUrl: _mock.image.course(index + 6),
  totalDuration: 220,
  totalStudents: _mock.number.nativeM(index),
  price: _mock.number.price(index),
}));

export const _coursesReminder = Array.from({ length: 4 }, (_, index) => ({
  id: _mock.id(index),
  title: _mock.courseNames(index),
  totalLesson: 12,
  reminderAt: today(),
  currentLesson: index + 7,
}));
