import {
  FinanceModal
} from "./FinanceModal.js";
import {
  CardModal
} from "./CardModal.js";
import {
  CardSupabaseService
} from "../services/CardSupabaseService.js";
import {
  CardListModal
} from "./CardListModal.js";
import {
  CardEditModal
} from "./CardEditModal.js";
import {
  FinanceService
} from "../services/FinanceService.js";
import {
  FinanceRenderer
} from "../ui/FinanceRenderer.js";
import {
  DebtModal
} from "../ui/DebtModal.js";
import {
  DebtPaymentModal
} from "./DebtPaymentModal.js";
import {
  DebtEditModal
} from "./DebtEditModal.js";
import {
  FinanceFilterRenderer
} from "../ui/FinanceFilterRenderer.js";
export class FinanceEvents {
  static async register() {
    document.getElementById("financeType")?.addEventListener("change", () => {
      FinanceEvents.toggleCardSelect();
    });
    document.addEventListener("click", (event) => {
      const card = event.target.closest(".open-finance");
      if (!card) return;
      FinanceModal.openEdit(card.dataset.id);
    });
    document.getElementById("addCardBtn")?.addEventListener("click", () => CardModal.open());
    document.getElementById("saveCardBtn")?.addEventListener("click", () => CardModal.save());
    document.getElementById("cancelCardBtn")?.addEventListener("click", () => CardModal.close());
    document.addEventListener("click", (event) => {
      if (!event.target.classList.contains("finance-filter-btn")) return;
      document.querySelectorAll(".finance-filter-btn").forEach(btn => btn.classList.remove("active"));
      event.target.classList.add("active");
      FinanceService.activeFilter = event.target.dataset.filter || "all";
      FinanceRenderer.render();
    });
    document.getElementById("installmentType")?.addEventListener("change", () => {
      const select = document.getElementById("installments");
      if (document.getElementById("installmentType").value === "yes") {
        select.classList.remove("hidden");
        FinanceEvents.loadInstallments();
      } else {
        select.classList.add("hidden");
      }
    });
    document.getElementById("installments")?.addEventListener("change", (event) => {
      if (event.target.value === "custom") {
        document.getElementById("installments").classList.add("hidden");
        document.getElementById("customInstallmentContainer").classList.remove("hidden");
      }
    });
    document.getElementById("cancelCustomInstallments")?.addEventListener("click", () => {
      document.getElementById("installmentPreview")?.classList.add("hidden");
      document.getElementById("customInstallments").value = "";
      document.getElementById("customInstallmentContainer").classList.add("hidden");
      const select = document.getElementById("installments");
      select.value = "";
      select.classList.remove("hidden");
    });
    document.getElementById("customInstallments")?.addEventListener("input", () => FinanceEvents.updateInstallmentPreview());
    document.getElementById("financeValue")?.addEventListener("input", () => FinanceEvents.updateInstallmentPreview());
    document.getElementById("deleteFinanceBtn")?.addEventListener("click", () => FinanceModal.delete());
    document.getElementById("viewCardsBtn")?.addEventListener("click", () => CardListModal.open());
    document.getElementById("closeCardsListBtn")?.addEventListener("click", () => CardListModal.close());
    document.addEventListener("click", (event) => {
      const card = event.target.closest(".open-card");
      if (!card) return;
      CardEditModal.open(card.dataset.id);
    });
    document.getElementById("cancelEditCardBtn")?.addEventListener("click", () => CardEditModal.close());
    document.getElementById("saveEditCardBtn")?.addEventListener("click", () => CardEditModal.save());
    document.getElementById("deleteCardBtn")?.addEventListener("click", () => CardEditModal.delete());
    document.addEventListener("click", (event) => {
      const btn = event.target.closest(".open-debt");
      if (!btn) return;
      DebtPaymentModal.open(btn.dataset.id);
    });
    document.getElementById("financeSearch")?.addEventListener("input", (event) => {
      FinanceService.search = event.target.value.toLowerCase();
      FinanceRenderer.render();
    });
    document.addEventListener("click", (event) => {
      if (event.target.id !== "mainFinanceFilter") return;
      FinanceService.filterMode++;
      if (FinanceService.filterMode > 2) FinanceService.filterMode = 0;
      FinanceFilterRenderer.render();
      FinanceRenderer.render();
    });
    document.getElementById("addDebtBtn")?.addEventListener("click", () => DebtModal.open());
    document.getElementById("cancelDebtBtn")?.addEventListener("click", () => DebtModal.close());
    document.getElementById("saveDebtBtn")?.addEventListener("click", () => DebtModal.save());
    document.getElementById("debtValue")?.addEventListener("input", () => {
      setTimeout(() => {
        DebtModal.loadInstallments();
        DebtModal.updateInstallmentPreview();
        document.getElementById("debtInstallments")?.classList.remove("hidden");
      }, 0);
    });
    document.getElementById("debtInstallments")?.addEventListener("change", (event) => {
      if (event.target.value === "custom") {
        document.getElementById("debtInstallments").classList.add("hidden");
        document.getElementById("debtCustomInstallmentContainer").classList.remove("hidden");
      }
    });
    document.getElementById("cancelDebtCustomInstallments")?.addEventListener("click", () => {
      document.getElementById("debtCustomInstallmentContainer").classList.add("hidden");
      document.getElementById("debtInstallmentPreview")?.classList.add("hidden");
      document.getElementById("debtCustomInstallments").value = "";
      const select = document.getElementById("debtInstallments");
      select.value = "";
      select.classList.remove("hidden");
    });
    document.getElementById("debtCustomInstallments")?.addEventListener("input", () => DebtModal.updateInstallmentPreview());
    document.addEventListener("click", (event) => {
      const btn = event.target.closest(".open-debt-edit");
      if (!btn) return;
      DebtEditModal.open(btn.dataset.id);
    });
    document.getElementById("cancelEditDebtBtn")?.addEventListener("click", () => DebtEditModal.close());
    document.getElementById("saveEditDebtBtn")?.addEventListener("click", () => DebtEditModal.save());
    document.getElementById("deleteDebtBtn")?.addEventListener("click", () => DebtEditModal.delete());
    document.getElementById("editDebtInstallments")?.addEventListener("input", () => DebtEditModal.updatePreview());
    document.getElementById("editDebtValue")?.addEventListener("input", () => DebtEditModal.updatePreview());
    document.getElementById("confirmPayDebtBtn")?.addEventListener("click", () => DebtPaymentModal.confirm());
    document.getElementById("cancelPayDebtBtn")?.addEventListener("click", () => DebtPaymentModal.close());
    document.getElementById("editDebtBtn")?.addEventListener("click", () => {
      const debtId = DebtPaymentModal.debtId;
      DebtPaymentModal.close();
      if (debtId) DebtEditModal.open(debtId);
    });
    document.addEventListener("click", (event) => {
      const btn = event.target.closest(".download-proof");
      if (!btn) return;
      DebtPaymentModal.downloadProof(Number(btn.dataset.index));
    });
    await FinanceFilterRenderer.render();
  }
  static async toggleCardSelect() {
    const type = document.getElementById("financeType").value;
    const cardSelect = document.getElementById("financeCard");
    const installmentContainer = document.getElementById("installmentContainer");
    if (type === "card") {
      cardSelect.classList.remove("hidden");
      installmentContainer?.classList.remove("hidden");
      const cards = await CardSupabaseService.getAll();
      cardSelect.innerHTML = cards.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
    } else {
      cardSelect.classList.add("hidden");
      installmentContainer?.classList.add("hidden");
    }
  }
  static loadInstallments() {
    const value = Number(
      document.getElementById("financeValue").value
      .replace("R$", "").replace(/\./g, "").replace(",", ".").trim()
    );
    const select = document.getElementById("installments");
    const fmt = v => v.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
    select.innerHTML = `<option value="">Selecione</option>`;
    for (let i = 1; i <= 24; i++) {
      select.innerHTML += `<option value="${i}">${i}x de ${fmt(value / i)}</option>`;
    }
    select.innerHTML += `<option value="custom">Mais de 24x</option>`;
  }
  static updateInstallmentPreview() {
    const value = Number(
      document.getElementById("financeValue")?.value
      .replace("R$", "").replace(/\./g, "").replace(",", ".").trim() || 0
    );
    const customInstallments = Number(document.getElementById("customInstallments")?.value || 0);
    const selectVal = document.getElementById("installments")?.value;
    const installments = selectVal === "custom" ? customInstallments : Number(selectVal || 0);
    const preview = document.getElementById("installmentPreview");
    if (!preview || !installments || !value) return;
    const fmt = v => v.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
    preview.innerHTML = `<div>${installments}x de ${fmt(value / installments)}</div>`;
    preview.classList.remove("hidden");
  }
}
