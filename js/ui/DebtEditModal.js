import {
  DebtService
} from "../services/DebtService.js";
import {
  DebtRenderer
} from "./DebtRenderer.js";
import {
  HistoryService
} from "../services/HistoryService.js";
import {
  Toast
} from "../modules/toast/Toast.js";
export class DebtEditModal {
  static debtId = null;
  static open(debtId) {
    const debt = DebtService.getAll().find(d => d.id === debtId);
    if (!debt) {
      Toast.warning("Dívida não encontrada");
      return;
    }
    this.debtId = debtId;
    document.getElementById("editDebtDescription").value = debt.description || "";
    if (document.getElementById("editDebtCreditor"))
      document.getElementById("editDebtCreditor").value = debt.creditor || "";
    document.getElementById("editDebtValue").value = Number(debt.totalValue || 0).toFixed(2).replace(".", ",");
    document.getElementById("editDebtInstallments").value = debt.totalInstallments || "";
    this.updatePreview();
    document.getElementById("editDebtModal").classList.remove("hidden");
  }
  static close() {
    document.getElementById("editDebtModal").classList.add("hidden");
    this.debtId = null;
  }
  static _parseValue(str) {
    if (!str) return 0;
    return Number(String(str).replace("R$", "").trim().replace(/\./g, "").replace(",", ".")) || 0;
  }
  static async save() {
    const debt = DebtService.getAll().find(d => d.id === this.debtId);
    if (!debt) {
      Toast.warning("Dívida não encontrada");
      return;
    }
    const description = document.getElementById("editDebtDescription").value.trim();
    if (!description) {
      Toast.warning("Informe a descrição");
      return;
    }
    const totalValue = this._parseValue(document.getElementById("editDebtValue").value);
    if (!totalValue || totalValue <= 0) {
      Toast.warning("Informe um valor válido");
      return;
    }
    const totalInstallments = Number(document.getElementById("editDebtInstallments").value);
    if (!totalInstallments || totalInstallments < 1) {
      Toast.warning("Informe o número de parcelas");
      return;
    }
    const creditor = document.getElementById("editDebtCreditor")?.value?.trim() || debt.creditor || "";
    const installmentValue = totalValue / totalInstallments;
    try {
      await DebtService.update(this.debtId, {
        ...debt,
        description,
        creditor,
        totalValue,
        totalInstallments,
        installmentValue
      });
      await HistoryService.add("editou dívida", description);
      Toast.success("Dívida atualizada");
      DebtRenderer.render();
      this.close();
    } catch {
      Toast.error("Erro ao atualizar dívida");
    }
  }
  static async delete() {
    if (!confirm("Excluir esta dívida permanentemente?")) return;
    const debt = DebtService.getAll().find(d => d.id === this.debtId);
    if (!debt) return;
    if (debt.paidInstallments > 0) {
      if (!confirm(`Esta dívida tem ${debt.paidInstallments} pagamento(s). Deseja excluir mesmo assim?`)) return;
    }
    try {
      await DebtService.remove(this.debtId);
      await HistoryService.add("excluiu dívida", debt.description);
      Toast.success("Dívida removida");
      DebtRenderer.render();
      this.close();
    } catch {
      Toast.error("Erro ao remover dívida");
    }
  }
  static updatePreview() {
    const installments = Number(document.getElementById("editDebtInstallments")?.value || 0);
    const totalValue = this._parseValue(document.getElementById("editDebtValue")?.value);
    const previewEl = document.getElementById("editDebtInstallmentPreview");
    if (!previewEl) return;
    if (!installments || !totalValue) {
      previewEl.innerHTML = "";
      return;
    }
    const fmt = v => v.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
    previewEl.innerHTML = `<div>Total: ${fmt(totalValue)}</div><div>${installments}x de ${fmt(totalValue / installments)}</div>`;
  }
}
