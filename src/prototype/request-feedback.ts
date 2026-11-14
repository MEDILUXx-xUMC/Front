import { ApiError } from "../api/client";

const dialog = document.querySelector<HTMLDialogElement>("#request-loading")!;
const message = document.querySelector<HTMLElement>("#request-message")!;
const status = document.querySelector<HTMLElement>("#feedback")!;
const errorToast = document.querySelector<HTMLElement>("#request-error")!;
let toastTimer: ReturnType<typeof setTimeout>;
let pending: AbortController | undefined;

dialog.addEventListener("cancel", (event) => event.preventDefault());

export function notify(text: string, tone: "status" | "error" = "status"): void {
  clearTimeout(toastTimer);
  status.textContent = "";
  errorToast.textContent = "";
  const toast = tone === "error" ? errorToast : status;
  toast.textContent = text;
  toastTimer = setTimeout(() => { toast.textContent = ""; }, tone === "error" ? 5000 : 3500);
}

export function cancelRequest(): void {
  pending?.abort();
}

export async function runRequest<Result>(
  label: string,
  request: (signal: AbortSignal) => Promise<Result>,
  onSuccess: (result: Result) => void,
): Promise<void> {
  if (pending) return;
  const controller = new AbortController();
  pending = controller;
  status.textContent = "";
  errorToast.textContent = "";
  message.textContent = label;
  dialog.showModal();
  let result: Result;
  try {
    result = await request(controller.signal);
  } catch (error) {
    if (!controller.signal.aborted) {
      const text = error instanceof ApiError ? error.message : "요청을 처리하지 못했어요. 잠시 뒤 다시 시도해 주세요.";
      notify(text, "error");
    }
    return;
  } finally {
    pending = undefined;
    dialog.close();
  }
  if (!controller.signal.aborted) onSuccess(result);
}
