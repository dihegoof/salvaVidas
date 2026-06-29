import {
  WardrobeManager
} from "../../modules/wardrobe/WardrobeManager.js";
export class WardrobeRenderer {
  static renderArmario() {
    const container = document.getElementById("wardrobeArmario");
    if (!container) return;
    const items = WardrobeManager.getAll();
    if (!items.length) {
      container.innerHTML = `<div class="empty-state">Nenhuma peça cadastrada ainda.<br>Toque em <strong>Cadastrar Peça</strong> para comecar.</div>`;
      return;
    }
    const TYPES = [{
      key: "blusa",
      label: "Blusas, Camisetas"
    }, {
      key: "calca",
      label: "Calças, Shorts e Saias"
    }, {
      key: "vestido",
      label: "Vestidos, Macacoes"
    }, {
      key: "sapato",
      label: "Sapatos, Tenis e Sandalias"
    }, {
      key: "sobreposicao",
      label: "Sobreposições"
    }, ];
    let html = "";
    TYPES.forEach(({
      key,
      label
    }) => {
      const group = items.filter(i => i.type === key);
      if (!group.length) return;
      html += `<div class="warm-group-label">${label}</div>
        <div class="products-container">
          ${group.map(item => `
            <div class="product-card warm-card" data-id="${item.id}">
              <div class="product-image">
                ${item.imageUrl
                  ? `<img src="${item.imageUrl}" alt="${item.name || ''}" />`
                  : `<div class="warm-img-empty"></div>`}
              </div>
              <div class="product-header">
                <h3 class="product-title">${item.name || "Sem nome"}</h3>
                <div class="product-tags">
                  ${item.occasion ? `<span class="product-pill">${item.occasion}</span>` : ""}
                  ${item.color    ? `<span class="product-pill warm-color-pill"><span class="warm-color-dot" style="background:${this._colorHex(item.color)}"></span>${item.color}</span>` : ""}
                </div>
              </div>
            </div>`).join("")}
        </div>`;
    });
    container.innerHTML = html;
    container.querySelectorAll(".warm-card").forEach(el => {
      el.addEventListener("click", () => {
        import("./WardrobeModal.js").then(m => m.WardrobeModal.open(el.dataset.id));
      });
    });
  }
  static renderStats() {
    const container = document.getElementById("wardrobeStats");
    if (!container) return;
    const items = WardrobeManager.getAll();
    const looks = WardrobeManager.getLooks();
    if (!items.length) {
      container.innerHTML = `<div class="empty-state">Nenhuma estatistica ainda</div>`;
      return;
    }
    const sorted = [...items].sort((a, b) => b.timesUsed - a.timesUsed);
    const mostUsed = sorted.filter(i => i.timesUsed > 0).slice(0, 3);
    const forgotten = items
      .filter(i => i.timesUsed === 0 || (i.lastUsed && this._daysSince(i.lastUsed) > 30))
      .sort((a, b) => (a.timesUsed - b.timesUsed))
      .slice(0, 3);
    container.innerHTML = `
      <div class="wstat-summary">
        <div class="wstat-tile">
          <div class="wstat-num">${items.length}</div>
          <div class="wstat-lbl">Peças</div>
        </div>
        <div class="wstat-tile">
          <div class="wstat-num">${looks.length}</div>
          <div class="wstat-lbl">Looks</div>
        </div>
      </div>

      ${mostUsed.length ? `
        <div class="wstat-section">
          <div class="wstat-title">Mais usadas</div>
          ${mostUsed.map(i => this._statRow(i, `${i.timesUsed} vezes`)).join("")}
        </div>` : ""}

      ${forgotten.length ? `
        <div class="wstat-section">
          <div class="wstat-title">Esquecidas</div>
          ${forgotten.map(i => this._statRow(i,
            i.lastUsed ? `${this._daysSince(i.lastUsed)} dias atras` : "Nunca usada"
          )).join("")}
        </div>` : ""}`;
  }
  static _statRow(item, sub) {
    return `
      <div class="wstat-row">
        ${item.imageUrl
          ? `<img src="${item.imageUrl}" class="wstat-thumb" />`
          : `<div class="wstat-thumb-empty"></div>`}
        <div class="wstat-info">
          <div class="wstat-name">${item.name || "Sem nome"}</div>
          <div class="wstat-sub">${sub}</div>
        </div>
      </div>`;
  }
  static renderMontadorSlot(key, label, item) {
    const img = item?.imageUrl ?
      `<img src="${item.imageUrl}" alt="${item.name || label}" class="wmont-img" />` :
      `<div class="wmont-empty-tap">
           <span class="wmont-tap-icon">+</span>
           <span class="wmont-tap-label">${label}</span>
         </div>`;
    const filledClass = item ? " wmont-slot-area--filled" : "";
    return `
      <div class="wmont-slot">
        <div class="wmont-slot-area${filledClass}" data-slot="${key}">
          ${img}
          <div class="wmont-item-name">${item?.name || "Toque para escolher"}</div>
        </div>
      </div>`;
  }
  static _colorHex(name = "") {
    const MAP = {
      preto: "#1c1c1e",
      branco: "#f4f7f4",
      cinza: "#8e8e93",
      azul: "#3a7d5a",
      jeans: "#3a7d5a",
      rosa: "#ff6b9d",
      vermelho: "#ff3b30",
      verde: "#34c759",
      amarelo: "#ffcc00",
      laranja: "#ff9500",
      bege: "#e8d5b0",
      vinho: "#7c2a3a",
      marrom: "#8b5e3c",
      nude: "#d4b896",
    };
    return MAP[name.toLowerCase()] || "#c7c7cc";
  }
  static _daysSince(dateStr) {
    if (!dateStr) return 999;
    return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  }
}
