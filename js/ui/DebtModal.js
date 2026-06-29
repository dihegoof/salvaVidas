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
export class DebtModal {
  static open() {
    document.getElementById("debtModal").classList.remove("hidden");
  }
  static close() {
    document.getElementById("debtModal").classList.add("hidden");
    this.reset();
  }
  static reset() {
    document.getElementById("debtDescription").value = "";
    document.getElementById("debtCreditor").value = "";
    document.getElementById("debtValue").value = "";
    const select = document.getElementById("debtInstallments");
    if (select) select.innerHTML = `<option value="">Selecione</option>`;
    document.getElementById("debtInstallmentPreview")?.classList.add("hidden");
    document.getElementById("debtCustomInstallmentContainer")?.classList.add("hidden");
    const custom = document.getElementById("debtCustomInstallments");
    if (custom) custom.value = "";
  }
  static async save() {
    const description = document.getElementById("debtDescription").value.trim();
    const creditor = document.getElementById("debtCreditor").value.trim();
    const totalValue = Number(
      document.getElementById("debtValue").value
      .replace("R$", "").replace(/\./g, "").replace(",", ".").trim()
    );
    let installments = document.getElementById("debtInstallments").value;
    if (installments === "custom") {
      installments = document.getElementById("debtCustomInstallments").value;
      if (Number(installments) <= 24) {
        Toast.warning("Use parcelas personalizadas apenas acima de 24x");
        return;
      }
    }
    installments = Number(installments);
    if (!description) {
      Toast.warning("Informe a descrição");
      return;
    }
    if (!totalValue || totalValue <= 0) {
      Toast.warning("Informe um valor válido");
      return;
    }
    if (!installments || installments < 1) {
      Toast.warning("Selecione o número de parcelas");
      return;
    }
    const debt = {
      description,
      creditor,
      totalValue,
      totalInstallments: installments,
      installmentValue: totalValue / installments,
      paidInstallments: 0,
      paymentHistory: [],
    };
    try {
      await DebtService.add(debt);
      await HistoryService.add("cadastrou dívida", `${description} (${creditor})`);
      Toast.success("Dívida cadastrada");
      await DebtRenderer.render();
      this.close();
    } catch {
      Toast.error("Erro ao cadastrar dívida");
    }
  }
  static loadInstallments() {
    const select = document.getElementById("debtInstallments");
    const totalValue = Number(
      document.getElementById("debtValue").value
      .replace("R$", "").replace(/\./g, "").replace(",", ".").trim()
    );
    const fmt = v => v.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
    select.innerHTML = `<option value="">Selecione</option>`;
    for (let i = 1; i <= 24; i++) {
      select.innerHTML += `<option value="${i}">${i}x de ${fmt(totalValue / i)}</option>`;
    }
    select.innerHTML += `<option value="custom">Mais de 24x (personalizado)</option>`;
  }
  static updateInstallmentPreview() {
    const installmentsEl = document.getElementById("debtInstallments");
    const customEl = document.getElementById("debtCustomInstallments");
    const previewEl = document.getElementById("debtInstallmentPreview");
    let installments = Number(installmentsEl?.value);
    if (installmentsEl?.value === "custom") installments = Number(customEl?.value || 0);
    const totalValue = Number(
      document.getElementById("debtValue").value
      .replace("R$", "").replace(/\./g, "").replace(",", ".").trim()
    );
    if (!installments || !totalValue || !previewEl) return;
    const fmt = v => v.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
    previewEl.innerHTML = `
      <div>Total: ${fmt(totalValue)}</div>
      <div>${installments}x de ${fmt(totalValue / installments)}</div>`;
    previewEl.classList.remove("hidden");
  }
}
