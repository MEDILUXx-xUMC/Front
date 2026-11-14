import type { IsoDateTime, MoneyAmount } from "./api";

interface ProductSummary {
  productId: string;
  title: string;
  categoryId: string;
  thumbnailUrl: string | null;
  neighborhoodName: string;
  distanceMeters: number;
  isFirstExperience: boolean;
}

export type Product = ProductSummary & (
  | { track: "RENTAL"; depositAmount: MoneyAmount; dailyFeeAmount: MoneyAmount }
  | { track: "SEALED_SALE"; salePriceAmount: MoneyAmount }
);

export type ProductDetail = Product & {
  description: string;
  imageUrls: string[];
  publishedAt: IsoDateTime;
};

export interface ProductQuery {
  budgetAmount: MoneyAmount | null;
  rentalDays: number;
  cursor?: string;
}
