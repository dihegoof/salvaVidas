import {
  CardSupabaseService
} from "../services/CardSupabaseService.js";
import {
  FinanceFilterRenderer
} from "./FinanceFilterRenderer.js";
import {
  HistoryService
} from "../services/HistoryService.js";
import {
  Toast
} from "../modules/toast/Toast.js";
export class CardModal {
  static open() {
    document.getElementById("cardModal").classList.remove("hidden");
  }
  static close() {
    document.getElementById("cardModal").classList.add("hidden");
    document.getElementById("cardName").value = "";
    document.getElementById("cardLimit").value = "";
    document.getElementById("cardCloseDay").value = "";
    document.getElementById("cardDueDay").value = "";
  }
  static async save() {
    const name = document.getElementById("cardName").value.trim();
    const limit = Number(document.getElementById("cardLimit").value.replace("R$", "").replace(/\./g, "").replace(",", ".").trim());
    const closeDay = Number(document.getElementById("cardCloseDay").value);
    const dueDay = Number(document.getElementById("cardDueDay").value);
    if (!name) {
      Toast.warning("Informe o nome do cartão");
      return;
    }
    if (!limit || limit <= 0) {
      Toast.warning("Informe um limite válido");
      return;
    }
    if (closeDay < 1 || closeDay > 31) {
      Toast.warning("Dia de fechamento inválido");
      return;
    }
    if (dueDay < 1 || dueDay > 31) {
      Toast.warning("Dia de vencimento inválido");
      return;
    }
    if (closeDay === dueDay) {
      Toast.warning("Fechamento e vencimento não podem ser iguais");
      return;
    }
    const allCards = await CardSupabaseService.getAll();
    if (allCards.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      Toast.warning("Cartão já cadastrado");
      return;
    }
    try {
      await CardSupabaseService.add({
        name,
        limit,
        closeDay,
        dueDay
      });
      await HistoryService.add("cadastrou cartão", name);
      Toast.success("Cartão cadastrado");
      await FinanceFilterRenderer.render();
      this.close();
    } catch {
      Toast.error("Erro ao cadastrar cartão");
    }
  }
}
