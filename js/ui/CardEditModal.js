import {
  CardSupabaseService
} from "../services/CardSupabaseService.js";
import {
  FinanceService
} from "../services/FinanceService.js";
import {
  CardListModal
} from "./CardListModal.js";
import {
  FinanceFilterRenderer
} from "./FinanceFilterRenderer.js";
import {
  HistoryService
} from "../services/HistoryService.js";
import {
  Toast
} from "../modules/toast/Toast.js";
export class CardEditModal {
  static editingId = null;
  static async open(cardId) {
    const card = await CardSupabaseService.getById(cardId);
    if (!card) return;
    this.editingId = cardId;
    document.getElementById("editCardName").value = card.name;
    document.getElementById("editCardLimit").value = card.limit.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
    document.getElementById("editCardCloseDay").value = card.closeDay ?? card.close_day;
    document.getElementById("editCardDueDay").value = card.dueDay ?? card.due_day;
    document.getElementById("editCardModal").classList.remove("hidden");
  }
  static close() {
    document.getElementById("editCardModal").classList.add("hidden");
  }
  static async save() {
    const card = {
      name: document.getElementById("editCardName").value.trim(),
      limit: Number(document.getElementById("editCardLimit").value.replace("R$", "").replace(/\./g, "").replace(",", ".").trim()),
      closeDay: Number(document.getElementById("editCardCloseDay").value),
      dueDay: Number(document.getElementById("editCardDueDay").value),
    };
    try {
      await CardSupabaseService.update(this.editingId, card);
      await HistoryService.add("editou cartão", card.name);
      Toast.success("Cartão atualizado");
      await CardListModal.render();
      await FinanceFilterRenderer.render();
      this.close();
    } catch {
      Toast.error("Erro ao atualizar cartão");
    }
  }
  static async delete() {
    const hasTransactions = FinanceService.getAll().some(t => t.cardId === this.editingId);
    if (hasTransactions) {
      Toast.warning("Remova os lançamentos deste cartão antes de excluí-lo");
      return;
    }
    if (!confirm("Excluir cartão?")) return;
    try {
      const card = await CardSupabaseService.getById(this.editingId);
      await CardSupabaseService.remove(this.editingId);
      await HistoryService.add("excluiu cartão", card?.name || "Cartão");
      Toast.success("Cartão removido");
      await CardListModal.render();
      await FinanceFilterRenderer.render();
      this.close();
    } catch {
      Toast.error("Erro ao remover cartão");
    }
  }
}
