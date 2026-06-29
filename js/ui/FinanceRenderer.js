import {
  FinanceService
} from "../services/FinanceService.js";
import {
  LoadingManager
} from "../modules/LoadingManager.js";
export class FinanceRenderer {
  static async render() {
    const container = document.getElementById("financeContainer");
    if (!container) return;
    LoadingManager.show("Carregando finanças...");
    try {
      let transactions = [...FinanceService.getAll()];
      if (FinanceService.filterMode === 1) transactions = transactions.filter(t => t.type === "income");
      if (FinanceService.filterMode === 2) transactions = transactions.filter(t => t.type === "expense" || t.type === "card");
      const filter = FinanceService.activeFilter;
      if (filter && filter !== "all") transactions = transactions.filter(t => t.cardId === filter);
      if (FinanceService.search) {
        const s = FinanceService.search.toLowerCase();
        transactions = transactions.filter(t =>
          t.description?.toLowerCase().includes(s) ||
          t.category?.toLowerCase().includes(s)
        );
      }
      if (!transactions.length) {
        container.innerHTML = `<div class="empty-state">Nenhum lançamento cadastrado</div>`;
        this.updateSummary();
        return;
      }
      container.innerHTML = transactions.map(t => this.renderCard(t)).join("");
      this.updateSummary();
    } finally {
      LoadingManager.hide();
    }
  }
  static renderCard(t) {
    const fmt = v => Number(v || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
    return `
<div class="finance-card open-finance" data-id="${t.id}" style="cursor:pointer">
  <div class="finance-info">
    <strong>${t.description}</strong>
    <div class="finance-pills"><span class="category-pill">${t.category || ""}</span></div>
  </div>
  <div class="finance-right">
    <div class="finance-value ${t.type === "income" ? "income" : "expense"}">
      ${fmt(t.installmentValue || t.value)}
    </div>
    ${t.totalInstallments ? `<span class="finance-pill">${t.currentInstallment}/${t.totalInstallments}</span>` : ""}
  </div>
</div>`;
  }
  static updateSummary() {
    const all = FinanceService.getAll();
    const fmt = v => v.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
    const income = all.filter(t => t.type === "income").reduce((s, t) => s + (t.installmentValue || t.value || 0), 0);
    const expense = all.filter(t => t.type !== "income").reduce((s, t) => s + (t.installmentValue || t.value || 0), 0);
    const incomeEl = document.getElementById("incomeTotal");
    const expenseEl = document.getElementById("expenseTotal");
    const balanceEl = document.getElementById("balanceTotal");
    if (incomeEl) incomeEl.textContent = fmt(income);
    if (expenseEl) expenseEl.textContent = fmt(expense);
    if (balanceEl) balanceEl.textContent = fmt(income - expense);
  }
}
