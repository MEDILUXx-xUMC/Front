import { budgetDisplay } from "../constants/budget";
import { button, link, screen } from "./ui";

export const budgetDemo = {
  amount: budgetDisplay.illustratedAmount as number,
  custom: false,
};

export const budgetFrames = { "01": "예산 선택" } as const;

export const budgetPresets = [10_000, 30_000, 50_000, 100_000, 500_000] as const;
export const budgetRangeValues = [...budgetPresets, 1_000_000] as const;
const budgetPresetLabels = ["1만 원", "3만 원", "5만 원", "10만 원", "50만 원"] as const;

export function formatBudget(amount: number): string {
  return `${amount.toLocaleString("ko-KR")}원`;
}

export function budgetScreen(): string {
  const { amount, custom } = budgetDemo;
  const rangeIndex = budgetRangeValues.findIndex((value) => value >= amount);
  const selectedRangeIndex = rangeIndex < 0 ? budgetRangeValues.length - 1 : rangeIndex;
  const progress = selectedRangeIndex / (budgetRangeValues.length - 1) * 100;
  const presets = budgetPresets.map((preset, index) =>
    `<button type="button" class="budget-chip ${!custom && amount === preset ? "selected" : ""}"
      data-budget="${preset}" aria-pressed="${!custom && amount === preset}">${budgetPresetLabels[index]}</button>`,
  ).join("");

  return screen("한번만", `
    <div class="budget-heading">
      <h2>이번에 쓸 예산을 골라 주세요</h2>
      <p>예산 안에서 써 볼 수 있는 이웃의 제품만 보여 드려요.</p>
    </div>
    <div class="budget-choice">
      <span class="budget-label">선택한 예산</span>
      <strong id="budget-amount" aria-live="polite">${formatBudget(amount)}</strong>
      <span class="budget-caption">보증금 포함 금액</span>
      <input id="budget-range" type="range" min="0"
        max="${budgetRangeValues.length - 1}" step="1" value="${selectedRangeIndex}"
        style="--budget-progress: ${progress}%" aria-label="예산 선택" aria-valuetext="${formatBudget(amount)}">
      <div class="budget-range-labels"><span>1만 원</span><span>100만 원 이상</span></div>
      <div class="budget-presets" role="group" aria-label="빠른 예산 선택">
        ${presets}
        <button type="button" class="budget-chip ${custom ? "selected" : ""}"
          data-action="budget-custom" aria-pressed="${custom}">직접 입력</button>
      </div>
      ${custom ? `<label class="budget-custom-label" for="budget-custom-input">직접 입력할 예산</label>
        <input id="budget-custom-input" type="number" inputmode="numeric" min="10000" max="1000000"
          step="1000" value="${amount}" aria-describedby="budget-custom-hint">
        <small id="budget-custom-hint">1만 원부터 100만 원까지 입력할 수 있어요.</small>` : ""}
    </div>
    <aside class="budget-notice">
      <span class="budget-info" aria-hidden="true">i</span>
      <p>보증금은 결제 대기(카드 한도 묶기)로 설정돼요. 반납이 확인되면 보류가 풀리고 사용료만 결제돼요.</p>
    </aside>
  `, { className: "budget-screen", footer: `<footer class="footer">${button("이 예산으로 둘러보기", "budget-continue")}</footer>` });
}

export function budgetNextScreen(): string {
  return screen("제품 목록", `
    <div class="budget-next">
      <h2>${formatBudget(budgetDemo.amount)} 안에서 둘러볼게요</h2>
      <p>제품 목록 화면을 연결할 준비가 됐어요.</p>
    </div>
  `, { className: "budget-screen", footer: `<footer class="footer">${link("예산 다시 선택", "01", "secondary")}</footer>` });
}
