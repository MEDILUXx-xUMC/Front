import { ApiError } from "../client";

export async function submitPrototypeRequest(signal: AbortSignal): Promise<void> {
  signal.throwIfAborted();
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", abort);
      resolve();
    }, 650);
    function abort(): void {
      clearTimeout(timer);
      reject(signal.reason);
    }
    signal.addEventListener("abort", abort, { once: true });
  });
  if (new URLSearchParams(location.search).get("api") === "error") {
    throw new ApiError(503, "SERVICE_UNAVAILABLE", "지금은 요청을 처리할 수 없어요. 잠시 뒤 다시 시도해 주세요.");
  }
}
