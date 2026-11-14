import { ApiError } from "../client";
import type { ProductsApi } from "../products";
import type { ProductDetail } from "../../types/product";

const rentalProduct = {
  productId: "product-keyboard",
  track: "RENTAL",
  title: "기계식 키보드 (저소음 적축)",
  categoryId: "keyboard",
  thumbnailUrl: null,
  neighborhoodName: "풍무동",
  distanceMeters: 500,
  isFirstExperience: true,
  depositAmount: 45_000,
  dailyFeeAmount: 2_000,
  description: "조용한 타건감의 키보드입니다.",
  imageUrls: [],
  publishedAt: "2026-11-14T03:30:00Z",
} satisfies ProductDetail;

const sealedProducts: ProductDetail[] = [
  ["product-softener", "섬유유연제 코튼 블루 미니 (미개봉)", 1500],
  ["product-shampoo", "허브 샴푸 여행용 1회분", 1200],
  ["product-detergent", "세탁세제 1회분", 1000],
  ["product-handwash", "핸드워시 1회분", 1200],
].map(([productId, title, salePriceAmount], index) => ({
  productId: String(productId), track: "SEALED_SALE", title: String(title), categoryId: "softener",
  thumbnailUrl: null, neighborhoodName: "사우동", distanceMeters: index === 0 ? 0 : 300,
  isFirstExperience: index !== 0, salePriceAmount: Number(salePriceAmount),
  description: index === 0 ? "뜯지 않은 여행용 제품입니다." : "가까운 이웃이 나누는 미개봉 생활용품이에요.",
  imageUrls: [], publishedAt: "2026-11-14T03:30:00Z",
}));
const catalog: ProductDetail[] = [rentalProduct, ...sealedProducts];

export const mockProductsApi: ProductsApi = {
  async list({ budgetAmount, rentalDays }, signal) {
    signal?.throwIfAborted();
    const items = catalog.filter(item => budgetAmount === null ||
      (item.track === "RENTAL" ? item.depositAmount + item.dailyFeeAmount * rentalDays : item.salePriceAmount) <= budgetAmount)
      .map(({ description: _description, imageUrls: _imageUrls, publishedAt: _publishedAt, ...summary }) => summary);
    return {
      items,
      nextCursor: null,
    };
  },
  async get(productId, signal) {
    signal?.throwIfAborted();
    const detail = catalog.find(item => item.productId === productId);
    if (!detail) {
      throw new ApiError(404, "PRODUCT_NOT_FOUND", "제품을 찾을 수 없어요.");
    }
    return { ...detail, imageUrls: [...detail.imageUrls] };
  },
};
