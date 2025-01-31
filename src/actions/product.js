import useSWR from 'swr';
import { useMemo } from 'react';
import { fetcher, endpoints } from 'src/lib/axios';

const SWR_OPTIONS = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

export function useGetProducts() {
  const url = endpoints.product.list;

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, SWR_OPTIONS);

  return useMemo(
    () => ({
      products: data?.data || [],
      productsLoading: isLoading,
      productsError: error,
      productsValidating: isValidating,
      productsEmpty: !isLoading && !isValidating && !data?.data?.length,
    }),
    [data?.data, error, isLoading, isValidating]
  );
}

export function useGetProduct(productId) {
  const url = productId ? endpoints.product.details(productId) : null;

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, SWR_OPTIONS);

  const transformProduct = (rawData) => {
    if (!rawData?.data) return null;

    return {
      ...rawData.data,
      id: rawData.data.id,
      name: rawData.data.name || '',
      description: rawData.data.description || '',
      sub_description: rawData.data.sub_description || '',
      code: rawData.data.code || '',
      sku: rawData.data.sku || '',
      images: Array.isArray(rawData.data.images) ? rawData.data.images : [],
      price: Number(rawData.data.price) || 0,
      price_sale: rawData.data.price_sale ? Number(rawData.data.price_sale) : null,
      quantity: Number(rawData.data.quantity) || 0,
      available: Number(rawData.data.available) || 0,
      taxes: rawData.data.taxes || null,
      category: rawData.data.category || '',
      colors: Array.isArray(rawData.data.colors) ? rawData.data.colors : [],
      sizes: Array.isArray(rawData.data.sizes) ? rawData.data.sizes : [],
      tags: Array.isArray(rawData.data.tags) ? rawData.data.tags : [],
      gender: Array.isArray(rawData.data.gender) ? rawData.data.gender : [],
      new_label: rawData.data.new_label || null,
      sale_label: rawData.data.sale_label || null,
      is_published: Boolean(rawData.data.is_published),
      publish: rawData.data.publish || 'draft',
      inventoryType: rawData.data.inventoryType || 'in stock',
      ratings: rawData.data.ratings || [],
      reviews: rawData.data.reviews || [],
      totalRatings: Number(rawData.data.totalRatings) || 0,
      totalReviews: Number(rawData.data.totalReviews) || 0,
    };
  };

  return useMemo(
    () => ({
      product: transformProduct(data),
      productLoading: isLoading,
      productError: error,
      productValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );
}

export function useSearchProducts(query) {
  const url = query ? [endpoints.product.search, { params: { query } }] : null;

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, {
    ...SWR_OPTIONS,
    keepPreviousData: true,
  });

  return useMemo(
    () => ({
      searchResults: data?.data || [],
      searchLoading: isLoading,
      searchError: error,
      searchValidating: isValidating,
      searchEmpty: !isLoading && !isValidating && !data?.data?.length,
    }),
    [data?.data, error, isLoading, isValidating]
  );
}