import {
  CardSupabaseService
} from "../services/CardSupabaseService.js";
import {
  FinanceService
} from "../services/FinanceService.js";
export class FinanceFilterRenderer {
  static async render() {
    const container = document.getElementById("financeFilters");
    const cards = await CardSupabaseService.getAll();
    let mainFilterText = "Todos";
    if (FinanceService.filterMode === 1) mainFilterText = "Entradas";
    if (FinanceService.filterMode === 2) mainFilterText = "Saídas";
    let html = `<button id="mainFinanceFilter" class="finance-filter-btn active">${mainFilterText}</button>`;
    cards.forEach(card => {
      html += `<button class="finance-filter-btn" data-filter="${card.id}">${card.name}</button>`;
    });
    container.innerHTML = html;
  }
}
