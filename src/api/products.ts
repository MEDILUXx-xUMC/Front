import type { CursorPage } from "../types/api";
import type { Product, ProductDetail, ProductQuery } from "../types/product";
import type { createApiClient } from "./client";

export interface ProductsApi {
  list(query: ProductQuery, signal?: AbortSignal): Promise<CursorPage<Product>>;
  get(productId: string, signal?: AbortSignal): Promise<ProductDetail>;
}

export function createProductsApi(request: ReturnType<typeof createApiClient>): ProductsApi {
  return {
    list({ budgetAmount, rentalDays, cursor }, signal) {
      const params = new URLSearchParams({ rentalDays: String(rentalDays) });
      if (budgetAmount !== null) params.set("budgetAmount", String(budgetAmount));
      if (cursor !== undefined) params.set("cursor", cursor);

      return request<CursorPage<Product>>(`/products?${params}`, signal && { signal });
    },
    get(productId, signal) {
      return request<ProductDetail>(`/products/${encodeURIComponent(productId)}`, signal && { signal });
    },
  };
}
