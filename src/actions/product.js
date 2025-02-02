import useSWR from 'swr';
import { useMemo } from 'react';
import { fetcher, endpoints } from 'src/lib/axios';

const SWR_OPTIONS = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

/**
 * Хук для получения списка продуктов.
 * Ожидается, что API возвращает объект:
 * {
 *   "products": [ ... ],
 *   "pagination": { ... }
 * }
 */
export function useGetProducts() {
  const url = endpoints.product.list;

  const {
    data,
    error,
    mutate,
    isLoading,
    isValidating,
  } = useSWR(url, fetcher, SWR_OPTIONS);

  // Сформируем удобный объект.
  const { products = [], pagination = {} } = data || {};

  // Для удобства можно заодно вернуть метод refetch = mutate
  return useMemo(() => {
    const productsEmpty = !isLoading && !isValidating && products.length === 0;
    return {
      products,
      pagination,
      productsLoading: isLoading,
      productsError: error,
      productsValidating: isValidating,
      productsEmpty,
      refetchProducts: mutate, // если нужно вручную обновить
    };
  }, [products, pagination, error, isLoading, isValidating, mutate]);
}
/**
 * Функция для трансформации данных продукта.
 * Поддерживает ситуации, когда данные продукта могут приходить либо напрямую,
 * либо быть вложены в свойство "data" (как в getProductById).
 */
function transformProduct(rawData) {
  // Если данные обернуты в { success: true, data: { ... } }
  const productData = rawData?.data ? rawData.data : rawData;
  if (!productData) return null;

  return {
    id: productData.id,
    name: productData.name || '',
    description: productData.description || '',
    sub_description: productData.sub_description || '',
    code: productData.code || '',
    images: Array.isArray(productData.images) ? productData.images : [],
    price: Number(productData.price) || 0,
    price_sale: productData.price_sale ? Number(productData.price_sale) : null,
    quantity: Number(productData.quantity) || 0,
    available: Number(productData.available) || 0,
    taxes: productData.taxes || null,
    category: productData.category || '',
    colors: Array.isArray(productData.colors) ? productData.colors : [],
    sizes: Array.isArray(productData.sizes) ? productData.sizes : [],
    tags: Array.isArray(productData.tags) ? productData.tags : [],
    gender: Array.isArray(productData.gender) ? productData.gender : [],
    new_label: productData.new_label || null,
    sale_label: productData.sale_label || null,
    is_published: Boolean(productData.is_published),
    publish: productData.publish || (productData.is_published ? 'published' : 'draft'),
    inventoryType: productData.inventoryType || 'в наличии',
    ratings: productData.ratings || [],
    reviews: productData.reviews || [],
    totalRatings: Number(productData.totalRatings) || 0,
    totalReviews: Number(productData.totalReviews) || 0,
    createdAt: productData.createdAt || productData.created_at
  };
}

/**
 * Хук для получения деталей одного продукта.
 * Если productId не передан, запрос не выполняется.
 */
export function useGetProduct(productId) {
  const url = productId ? endpoints.product.details(productId) : null;
  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, SWR_OPTIONS);

  return useMemo(() => ({
    product: transformProduct(data),
    productLoading: isLoading,
    productError: error,
    productValidating: isValidating,
  }), [data, error, isLoading, isValidating]);
}

/**
 * Хук для поиска продуктов.
 * Ожидается, что API возвращает объект:
 * {
 *   "success": true,
 *   "products": [ ... ],
 *   "pagination": { ... }
 * }
 */
export function useSearchProducts(query) {
  // Если query отсутствует, запрос не отправляется
  const url = query ? [endpoints.product.search, { params: { query } }] : null;
  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, {
    ...SWR_OPTIONS,
    keepPreviousData: true,
  });

  return useMemo(() => ({
    searchResults: data?.products || [],
    pagination: data?.pagination || {},
    searchLoading: isLoading,
    searchError: error,
    searchValidating: isValidating,
    searchEmpty: !isLoading && !isValidating && !(data?.products?.length),
  }), [data?.products, data?.pagination, error, isLoading, isValidating]);
}
