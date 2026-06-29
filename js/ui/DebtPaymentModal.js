import {
  DebtService
} from "../services/DebtService.js";
import {
  DebtRenderer
} from "./DebtRenderer.js";
import {
  FinanceService
} from "../services/FinanceService.js";
import {
  FinanceRenderer
} from "./FinanceRenderer.js";
import {
  HistoryService
} from "../services/HistoryService.js";
import {
  Toast
} from "../modules/toast/Toast.js";
export class DebtPaymentModal {
  static debtId = null;
  static open(debtId) {
    const debt = DebtService.getAll().find(d => d.id === debtId);
    if (!debt) return;
    if (debt.paidInstallments >= debt.totalInstallments) {
      Toast.info("Esta dívida já foi quitada");
      return;
    }
    this.debtId = debtId;
    const history = document.getElementById("debtProofHistory");
    if (!debt.paymentHistory?.length) {
      history.innerHTML = `<div class="empty-state">Nenhum comprovante</div>`;
    } else {
      history.innerHTML = debt.paymentHistory.map((p, i) => `
<div class="proof-item download-proof" data-index="${i}" style="cursor:pointer;padding:6px;border-radius:6px;background:#f3f4f6;margin-bottom:4px">
  Parcela ${p.installment} — ${p.fileName}${p.fileData ? " (clique para baixar)" : ""}
</div>`).join("");
    }
    document.getElementById("payDebtTitle").value = debt.description;
    document.getElementById("payDebtInstallment").value = `${debt.paidInstallments + 1}/${debt.totalInstallments}`;
    document.getElementById("payDebtValue").value = debt.installmentValue.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
    document.getElementById("debtProofFile").value = "";
    document.getElementById("payDebtModal").classList.remove("hidden");
  }
  static close() {
    document.getElementById("payDebtModal").classList.add("hidden");
    this.debtId = null;
  }
  static async confirm() {
    const debt = DebtService.getAll().find(d => d.id === this.debtId);
    if (!debt) {
      Toast.warning("Dívida não encontrada");
      return;
    }
    const file = document.getElementById("debtProofFile").files[0];
    if (!file) {
      Toast.warning("Anexe um comprovante");
      return;
    }
    const btn = document.getElementById("confirmPayDebtBtn");
    if (btn) btn.disabled = true;
    try {
      const fileData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      debt.paymentHistory = debt.paymentHistory ?? [];
      debt.paymentHistory.push({
        installment: debt.paidInstallments + 1,
        fileName: file.name,
        fileData,
        paidAt: new Date().toISOString(),
      });
      debt.paidInstallments++;
      await DebtService.save(debt);
      await FinanceService.add({
        description: `${debt.description} ${debt.paidInstallments}/${debt.totalInstallments}`,
        category: "Dívidas",
        value: debt.installmentValue,
        type: "expense",
        date: new Date().toISOString().split("T")[0],
      });
      await HistoryService.add(
        "pagou parcela",
        `${debt.description} (${debt.paidInstallments}/${debt.totalInstallments})`
      );
      DebtRenderer.render();
      FinanceRenderer.render();
      this.close();
      Toast.success("Parcela registrada");
    } catch (err) {
      console.error("Erro ao registrar pagamento:", err);
      Toast.error("Erro ao registrar pagamento");
    } finally {
      if (btn) btn.disabled = false;
    }
  }
  static downloadProof(index) {
    const debt = DebtService.getAll().find(d => d.id === this.debtId);
    if (!debt) return;
    const payment = debt.paymentHistory?.[index];
    if (!payment?.fileData) {
      Toast.warning("Arquivo não disponível");
      return;
    }
    const link = document.createElement("a");
    link.href = payment.fileData;
    link.download = payment.fileName;
    link.click();
  }
}
