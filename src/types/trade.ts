import type { IsoDateTime, MoneyAmount } from "./api";

export type RentalStatus =
  | "REQUESTED" | "ACCEPTED" | "READY_FOR_PICKUP" | "IN_USE"
  | "RETURN_SUBMITTED" | "COMPLETED" | "REJECTED" | "CANCELED" | "DISPUTED";

export type SaleStatus =
  | "REQUESTED" | "ACCEPTED" | "READY_FOR_PICKUP"
  | "COMPLETED" | "REJECTED" | "CANCELED" | "DISPUTED";

export type Trade = {
  tradeId: string;
  productId: string;
  currentUserRole: "OWNER" | "REQUESTER";
  createdAt: IsoDateTime;
} & (
  | { track: "RENTAL"; status: RentalStatus; rentalDays: number; returnDueAt: IsoDateTime | null; depositAmount: MoneyAmount; usageFeeAmount: MoneyAmount }
  | { track: "SEALED_SALE"; status: SaleStatus; salePriceAmount: MoneyAmount }
);
