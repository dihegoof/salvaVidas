import {
  HistoryService
} from "../../services/HistoryService.js";
import {
  HistoryManager
} from "../../modules/history/HistoryManager.js";
import {
  LoadingManager
} from "../../modules/LoadingManager.js";
export class HistoryRenderer {
  static render() {
    const container = document.getElementById("historyContainer");
    if (!container) return;
    const history = HistoryService.getPage(HistoryManager.page, HistoryManager.ITEMS_PER_PAGE);
    if (!history.length) {
      container.innerHTML = `<div class="empty-state">Nenhum histórico disponível</div>`;
      return;
    }
    let html = "";
    let currentDate = "";
    history.forEach(item => {
      let dateObj;
      try {
        dateObj = new Date(item.createdAt);
      } catch {
        dateObj = new Date();
      }
      const isValid = !isNaN(dateObj.getTime());
      const recordDate = isValid ?
        dateObj.toLocaleDateString("pt-BR") :
        String(item.createdAt).split(",")[0];
      const today = new Date().toLocaleDateString("pt-BR");
      const yesterday = new Date(Date.now() - 86400000).toLocaleDateString("pt-BR");
      const dayBefore = new Date(Date.now() - 172800000).toLocaleDateString("pt-BR");
      let dateLabel;
      if (recordDate === today) dateLabel = "Hoje";
      else if (recordDate === yesterday) dateLabel = "Ontem";
      else if (recordDate === dayBefore) dateLabel = "Anteontem";
      else dateLabel = recordDate;
      if (currentDate !== dateLabel) {
        currentDate = dateLabel;
        html += `<div class="history-day">${dateLabel}</div>`;
      }
      const timeStr = isValid ?
        dateObj.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit"
        }) :
        "";
      html += `
<div class="history-item">
  <strong>${item.userName || "Usuário"}</strong>
  ${item.action || ""}
  <strong>${item.productName || ""}</strong>
  <div class="history-time">${recordDate}${timeStr ? " " + timeStr : ""}</div>
</div>`;
    });
    const total = HistoryService.getAll().length;
    if (total > history.length) {
      html += `<button id="loadMoreHistoryBtn" style="margin-top:12px">Carregar Mais</button>`;
    }
    container.innerHTML = html;
    document.getElementById("loadMoreHistoryBtn")?.addEventListener("click", async () => {
      LoadingManager.show("Carregando histórico...");
      try {
        HistoryManager.page++;
        HistoryRenderer.render();
      } finally {
        LoadingManager.hide();
      }
    });
  }
}
