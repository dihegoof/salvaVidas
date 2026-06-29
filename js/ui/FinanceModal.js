import {
  FinanceService
} from "../services/FinanceService.js";
import {
  FinanceRenderer
} from "./FinanceRenderer.js";
import {
  FinanceEvents
} from "../ui/FinanceEvents.js";
import {
  HistoryService
} from "../services/HistoryService.js";
import {
  Toast
} from "../modules/toast/Toast.js";
export class FinanceModal {
  static open() {
    document.getElementById("financeModal").classList.remove("hidden");
  }
  static close() {
    ["financeDescription", "financeValue", "financeCategory", "financeType", "financeDate"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.disabled = false;
    });
    document.getElementById("saveFinanceBtn")?.classList.remove("hidden");
    document.getElementById("financeModal").classList.add("hidden");
    document.getElementById("financeDescription").value = "";
    document.getElementById("financeValue").value = "";
    document.getElementById("financeType").value = "income";
    document.getElementById("financeCard")?.classList.add("hidden");
    document.getElementById("financeDate").value = "";
    document.querySelector("#financeModal h2").textContent = "Novo Lançamento";
    document.getElementById("deleteFinanceBtn")?.classList.add("hidden");
    document.getElementById("installmentType").value = "no";
    document.getElementById("installments").value = "";
    document.getElementById("customInstallments").value = "";
    document.getElementById("installmentPreview")?.classList.add("hidden");
    document.getElementById("customInstallmentContainer")?.classList.add("hidden");
    document.getElementById("installments")?.classList.add("hidden");
    FinanceService.editingIndex = null;
    FinanceService.editingId = null;
  }
  static async save() {
    const description = document.getElementById("financeDescription").value.trim();
    if (!description) {
      Toast.warning("Informe uma descrição");
      return;
    }
    const value = Number(
      document.getElementById("financeValue").value
      .replace("R$", "").replace(/\./g, "").replace(",", ".").trim()
    );
    if (isNaN(value) || value <= 0) {
      Toast.warning("Informe um valor válido");
      return;
    }
    const type = document.getElementById("financeType").value;
    const cardId = document.getElementById("financeCard")?.value || null;
    const category = document.getElementById("financeCategory").value;
    const date = document.getElementById("financeDate").value;
    const customInstallments = Number(document.getElementById("customInstallments")?.value || 0);
    const installmentsSelect = document.getElementById("installments")?.value;
    let totalInstallments = null;
    let installmentValue = null;
    if (installmentsSelect && installmentsSelect !== "custom" && installmentsSelect !== "") {
      totalInstallments = Number(installmentsSelect);
      installmentValue = value / totalInstallments;
    }
    if (customInstallments > 24) {
      totalInstallments = customInstallments;
      installmentValue = value / totalInstallments;
    }
    const transaction = {
      description,
      value,
      type,
      category,
      date: date || null,
      cardId: type === "card" ? cardId : null,
      totalValue: totalInstallments ? value : null,
      installmentValue,
      totalInstallments,
      currentInstallment: totalInstallments ? 1 : null,
    };
    try {
      if (FinanceService.editingId) {
        await FinanceService.updateById(FinanceService.editingId, transaction);
        await HistoryService.add("editou lançamento", description);
        Toast.success("Lançamento atualizado");
      } else {
        await FinanceService.add(transaction);
        const verb = type === "income" ? "registrou recebimento" : "registrou gasto";
        await HistoryService.add(verb, description);
        Toast.success("Lançamento registrado");
      }
      await FinanceRenderer.render();
      this.close();
    } catch (err) {
      console.error("Erro ao salvar lançamento:", err);
      Toast.error("Erro ao salvar lançamento");
    }
  }
  static openEdit(id) {
    const transaction = FinanceService.getAll().find(t => t.id === id);
    if (!transaction) {
      console.error("Lançamento não encontrado:", id);
      return;
    }
    if (transaction.category === "Dívidas") {
      document.querySelector("#financeModal h2").textContent = "Pagamento de Dívida";
      document.getElementById("financeDescription").value = transaction.description;
      document.getElementById("financeValue").value = transaction.value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
      });
      ["financeDescription", "financeValue", "financeCategory", "financeType", "financeDate"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = true;
      });
      document.getElementById("saveFinanceBtn")?.classList.add("hidden");
      document.getElementById("deleteFinanceBtn")?.classList.remove("hidden");
      FinanceService.editingId = id;
      this.open();
      return;
    }
    FinanceService.editingId = id;
    document.getElementById("financeDescription").value = transaction.description;
    document.getElementById("financeValue").value = transaction.value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
    document.getElementById("financeType").value = transaction.type;
    document.getElementById("financeCategory").value = transaction.category;
    document.getElementById("financeDate").value = transaction.date || "";
    document.querySelector("#financeModal h2").textContent = "Editar Lançamento";
    document.getElementById("deleteFinanceBtn")?.classList.remove("hidden");
    if (transaction.totalInstallments) {
      document.getElementById("installmentType").value = "yes";
      FinanceEvents.loadInstallments();
      if (transaction.totalInstallments <= 24) {
        document.getElementById("installments").classList.remove("hidden");
        document.getElementById("installments").value = transaction.totalInstallments;
      } else {
        document.getElementById("installments").classList.add("hidden");
        document.getElementById("customInstallmentContainer").classList.remove("hidden");
        document.getElementById("customInstallments").value = transaction.totalInstallments;
      }
      FinanceEvents.updateInstallmentPreview();
    }
    this.open();
  }
  static async delete() {
    const id = FinanceService.editingId;
    if (!id) return;
    const transaction = FinanceService.getAll().find(t => t.id === id);
    if (!transaction) return;
    if (!confirm(`Excluir "${transaction.description}"?`)) return;
    try {
      await FinanceService.remove(id);
      await HistoryService.add("excluiu lançamento", transaction.description);
      Toast.success("Lançamento removido");
      await FinanceRenderer.render();
      this.close();
    } catch {
      Toast.error("Erro ao remover lançamento");
    }
  }
}
