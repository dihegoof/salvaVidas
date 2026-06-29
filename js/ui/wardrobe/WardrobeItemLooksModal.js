import {
  WardrobeManager
} from "../../modules/wardrobe/WardrobeManager.js";
export class WardrobeItemLooksModal {
  static open(itemId) {
    const item = WardrobeManager.getById(itemId);
    if (!item) return;
    const looks = WardrobeManager.getLooksByItem(itemId);
    let overlay = document.getElementById("wItemLooksModal");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "wItemLooksModal";
      overlay.className = "modal-overlay wilm-overlay hidden";
      document.body.appendChild(overlay);
    }
    const formatDate = (dateStr) => {
      if (!dateStr) return "";
      try {
        return new Date(dateStr).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "short"
        });
      } catch {
        return "";
      }
    };
    const parseArr = (val) => {
      if (Array.isArray(val)) return val;
      try {
        return JSON.parse(val || "[]");
      } catch {
        return [];
      }
    };
    const emptyHtml = `
      <div class="wilm-empty">
        <div class="wilm-empty-icon">👗</div>
        <p>Essa peça ainda não foi usada<br>em nenhum look confirmado.</p>
      </div>`;
    const looksHtml = looks.map((look, idx) => {
      const ids = parseArr(look.item_ids);
      const items = ids.map(id => WardrobeManager.getById(id)).filter(Boolean);
      const cardsHtml = items.map(it => `
        <div class="wilm-card product-card">
          <div class="product-image">
            ${it.imageUrl
              ? `<img src="${it.imageUrl}" alt="${it.name || ''}" />`
              : `<div class="warm-img-empty"></div>`}
          </div>
          <div class="product-header">
            <h3 class="product-title" style="font-size:12px">${it.name || "Sem nome"}</h3>
          </div>
        </div>`).join("");
      return `
        <div class="wilm-look-col">
          <div class="wilm-look-header">
            <span class="wilm-look-num">Look ${looks.length - idx}</span>
            <span class="wilm-look-date">${formatDate(look.used_at)}</span>
          </div>
          <div class="wilm-cards-col">${cardsHtml}</div>
        </div>`;
    }).join("");
    overlay.innerHTML = `
      <div class="modal wilm-modal">
        <h2>Looks com "${item.name || 'esta peça'}"</h2>
        <div class="wilm-count-pill">
          <span class="product-pill">${looks.length} look${looks.length !== 1 ? "s" : ""}</span>
        </div>
        ${looks.length === 0
          ? emptyHtml
          : `<div class="wilm-scroll-area">${looksHtml}</div>`}
        <div class="modal-actions">
          <button class="secondary-btn" id="wItemLooksClose">Fechar</button>
        </div>
      </div>`;
    overlay.classList.remove("hidden");
    const close = () => overlay.classList.add("hidden");
    document.getElementById("wItemLooksClose")?.addEventListener("click", close);
    overlay.addEventListener("click", e => {
      if (e.target === overlay) close();
    });
  }
}
