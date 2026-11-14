export type MoneyAmount = number;
export type IsoDateTime = string;

export interface CursorPage<Item> {
  items: Item[];
  nextCursor: string | null;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  fieldErrors?: Record<string, string>;
}
