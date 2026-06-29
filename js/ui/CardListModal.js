import {
  CardSupabaseService
} from "../services/CardSupabaseService.js";
import {
  FinanceService
} from "../services/FinanceService.js";
export class CardListModal {
  static async open() {
    await this.render();
    document.getElementById("cardsListModal").classList.remove("hidden");
  }
  static close() {
    document.getElementById("cardsListModal").classList.add("hidden");
  }
  static async render() {
    const container = document.getElementById("cardsListContainer");
    const cards = await CardSupabaseService.getAll();
    if (!cards.length) {
      container.innerHTML = `<div class="empty-state">Nenhum cartão cadastrado</div>`;
      return;
    }
    container.innerHTML = cards.map(card => {
      const spent = FinanceService.getAll()
        .filter(t => t.cardId === card.id)
        .reduce((total, t) => total + (t.installmentValue || t.value), 0);
      const available = card.limit - spent;
      const fmt = v => v.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
      });
      return `
<div class="card-list-item open-card" data-id="${card.id}">
  <strong>${card.name}</strong>
  <div class="card-pills"><span class="finance-pill">Limite ${fmt(card.limit)}</span></div>
  <div class="card-pills"><span class="finance-pill">Gasto ${fmt(spent)}</span></div>
  <div class="card-pills"><span class="available-pill">Disponível ${fmt(available)}</span></div>
</div>`;
    }).join("");
  }
}
