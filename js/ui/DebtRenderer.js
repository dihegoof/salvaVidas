import {
  DebtService
} from "../services/DebtService.js";

export class DebtRenderer {
  static render() {
    const container = document.getElementById("debtContainer");
    if (!container) return;

    const debts = DebtService.getAll();

    if (!debts.length) {
      container.innerHTML = `<div class="empty-state">Nenhuma dívida cadastrada</div>`;
      return;
    }

    const fmt = v => Number(v || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });

    const ativas   = debts.filter(d => d.paidInstallments < d.totalInstallments);
    const quitadas = debts.filter(d => d.paidInstallments >= d.totalInstallments);

    const renderCard = (debt, isQuitada) => {
      const remaining = debt.totalInstallments - debt.paidInstallments;
      const progress  = Math.round((debt.paidInstallments / debt.totalInstallments) * 100);

      return `
<div class="finance-card open-debt" data-id="${debt.id}" style="cursor:pointer${isQuitada ? ";opacity:0.7" : ""}">
  <div class="finance-info">
    <strong>${debt.description}</strong>
    ${debt.creditor ? `<small>${debt.creditor}</small>` : ""}
    <div class="finance-pills">
      <span class="finance-pill">${debt.paidInstallments}/${debt.totalInstallments} parcelas</span>
      <span class="finance-pill">${progress}% pago</span>
      ${isQuitada ? `<span class="finance-pill" style="background:var(--success);color:#fff">Quitada ✓</span>` : ""}
    </div>
    ${isQuitada ? `
    <div style="margin-top:8px">
      <button class="delete-debt-btn danger-btn" data-id="${debt.id}"
        style="width:auto;padding:6px 14px;font-size:13px;border-radius:8px">
        Excluir
      </button>
    </div>` : ""}
  </div>
  <div class="finance-right">
    <div class="finance-value expense">${fmt(debt.installmentValue)}/mês</div>
    <small>${isQuitada ? "Quitada" : `Restante: ${fmt(remaining * debt.installmentValue)}`}</small>
  </div>
</div>`;
    };

    let html = ativas.map(d => renderCard(d, false)).join("");

    if (quitadas.length) {
      html += `
<div class="debt-section-label" style="margin:14px 0 8px;font-size:12px;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.4px">
  Quitadas (${quitadas.length})
</div>`;
      html += quitadas.map(d => renderCard(d, true)).join("");
    }

    container.innerHTML = html;

    container.querySelectorAll(".delete-debt-btn").forEach(btn => {
      btn.addEventListener("click", async e => {
        e.stopPropagation();
        const id = btn.dataset.id;
        if (!confirm("Excluir esta dívida quitada permanentemente?")) return;
        try {
          await DebtService.remove(id);
          DebtRenderer.render();
        } catch {
          alert("Erro ao excluir dívida");
        }
      });
    });
  }
}
