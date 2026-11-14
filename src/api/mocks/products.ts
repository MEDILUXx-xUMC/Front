import { ApiError } from "../client";
import type { ProductsApi } from "../products";
import type { ProductDetail } from "../../types/product";

const rentalProduct = {
  productId: "product-keyboard",
  track: "RENTAL",
  title: "기계식 키보드 (저소음 적축)",
  categoryId: "keyboard",
  thumbnailUrl: null,
  neighborhoodName: "사우동",
  distanceMeters: 400,
  isFirstExperience: true,
  depositAmount: 45_000,
  dailyFeeAmount: 2_000,
  description: "조용한 타건감의 키보드입니다.",
  imageUrls: [],
  publishedAt: "2026-11-14T03:30:00Z",
} satisfies ProductDetail;

export const mockProductsApi: ProductsApi = {
  async list({ budgetAmount, rentalDays }, signal) {
    signal?.throwIfAborted();
    const { description: _description, imageUrls: _imageUrls, publishedAt: _publishedAt, ...summary } = rentalProduct;
    const cost = summary.depositAmount + summary.dailyFeeAmount * rentalDays;
    return {
      items: budgetAmount === null || cost <= budgetAmount ? [summary] : [],
      nextCursor: null,
    };
  },
  async get(productId, signal) {
    signal?.throwIfAborted();
    if (productId !== rentalProduct.productId) {
      throw new ApiError(404, "PRODUCT_NOT_FOUND", "제품을 찾을 수 없어요.");
    }
    return { ...rentalProduct, imageUrls: [...rentalProduct.imageUrls] };
  },
};
