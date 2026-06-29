import {
  WardrobeManager
} from "./WardrobeManager.js";
import {
  WardrobeRenderer
} from "../../ui/wardrobe/WardrobeRenderer.js";
import {
  WardrobeModal
} from "../../ui/wardrobe/WardrobeModal.js";
import {
  Toast
} from "../toast/Toast.js";
import {
  HistoryService
} from "../../services/HistoryService.js";

export class WardrobeMontadorManager {
  static _selected = {
    blusa: null,
    calca: null,
    vestido: null,
    sapato: null,
    sobreposicao: null,
  };

  static _visible = {
    blusa: true,
    calca: true,
    vestido: false,
    sapato: true,
    sobreposicao: false,
  };

  static _SLOT_META = [
    { key: "blusa",       label: "Blusa" },
    { key: "calca",       label: "Calça" },
    { key: "vestido",     label: "Vestido" },
    { key: "sapato",      label: "Sapato" },
    { key: "sobreposicao",label: "Sobreposição" },
  ];

  static init() {
    const container = document.getElementById("wardrobeMontador");
    if (!container) return;
    this._render(container);
  }

  static reset() {
    for (const key of Object.keys(this._selected)) {
      this._selected[key] = null;
    }
    this._visible = {
      blusa: true,
      calca: true,
      vestido: false,
      sapato: true,
      sobreposicao: false,
    };
  }

  static _render(container) {
    const slotsHtml = this._SLOT_META
      .map(({ key, label }) => {
        if (!this._visible[key]) return "";
        const item = this._getSelectedItem(key);
        return WardrobeRenderer.renderMontadorSlot(key, label, item);
      })
      .join("");

    container.innerHTML = `
      <div class="wmont-slots">${slotsHtml}</div>
      <div class="wmont-actions">
        <button class="wmont-btn wmont-add"     id="wAddItemBtnMont">Cadastrar Peça</button>
        <button class="wmont-btn wmont-confirm" id="wConfirmBtn">Confirmar Look</button>
      </div>`;

    this._bindEvents(container);
  }

  static _getSelectedItem(key) {
    const id = this._selected[key];
    if (!id) return null;
    return WardrobeManager.getById(id) || null;
  }

  static _bindEvents(container) {
    container.querySelectorAll(".wmont-slot-area").forEach(area => {
      area.addEventListener("click", () => {
        const key = area.dataset.slot;
        this._openPicker(key, container);
      });
    });

    container.querySelector("#wConfirmBtn")?.addEventListener("click", () => this._confirmLook());
    container.querySelector("#wAddItemBtnMont")?.addEventListener("click", () => WardrobeModal.open());
  }

  static _openPicker(slotKey, container) {
    const meta = this._SLOT_META.find(m => m.key === slotKey);
    const items = WardrobeManager.getByType(slotKey);

    let overlay = document.getElementById("wSlotPickerModal");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "wSlotPickerModal";
      overlay.className = "modal-overlay hidden";
      document.body.appendChild(overlay);
    }

    const makeCard = (id, imageUrl, name, extraClass = "") => {
      const imgHtml = imageUrl
        ? `<img src="${imageUrl}" alt="${name || ''}" />`
        : `<div class="warm-img-empty"></div>`;
      const sel = this._selected[slotKey] === (id || null);
      return `
        <div class="wslot-item${sel ? " wslot-item-selected" : ""}${extraClass}" data-id="${id || ""}">
          <div class="product-card">
            <div class="product-image">${imgHtml}</div>
            <div class="product-header">
              <h3 class="product-title" style="font-size:11px">${name || "Sem nome"}</h3>
            </div>
          </div>
        </div>`;
    };

    const noneCard = `
      <div class="wslot-item wslot-item-none${this._selected[slotKey] === null ? " wslot-item-selected" : ""}" data-id="">
        <div class="product-card" style="align-items:center;justify-content:center;min-height:80px">
          <div class="wslot-img-empty wslot-none-icon">—</div>
          <div class="product-header"><h3 class="product-title" style="font-size:11px;text-align:center">Nenhuma</h3></div>
        </div>
      </div>`;

    const gridItems = [noneCard, ...items.map(i => makeCard(i.id, i.imageUrl, i.name))].join("");

    overlay.innerHTML = `
      <div class="modal">
        <h2>Escolher ${meta?.label || slotKey}</h2>
        ${items.length === 0
          ? `<div class="wslot-empty">
              Nenhuma peça cadastrada nessa categoria.<br>
              Adicione pelo botão <strong>Cadastrar Peça</strong>.
             </div>`
          : `<div class="wslot-picker-grid">${gridItems}</div>`}
        <div class="modal-actions">
          <button class="secondary-btn" id="wSlotPickerClose">Cancelar</button>
        </div>
      </div>`;

    overlay.classList.remove("hidden");

    const closePicker = () => overlay.classList.add("hidden");
    document.getElementById("wSlotPickerClose")?.addEventListener("click", closePicker);
    overlay.addEventListener("click", e => {
      if (e.target === overlay) closePicker();
    });

    overlay.querySelectorAll(".wslot-item[data-id]").forEach(el => {
      el.addEventListener("click", e => {
        e.stopPropagation();
        const id = el.dataset.id || null;
        this._selected[slotKey] = id;
        closePicker();
        this._render(container);
      });
    });
  }

  static _randomLook(container) {
    const look = WardrobeManager.generateRandomLook();
    if (!look) {
      Toast.warning("Adicione peças ao guarda-roupa primeiro");
      return;
    }
    if (look.dress) {
      this._visible.vestido = true;
      this._visible.blusa   = false;
      this._visible.calca   = false;
      this._selected.vestido = look.dress?.id || null;
      this._selected.blusa   = null;
      this._selected.calca   = null;
    } else {
      this._visible.vestido = false;
      this._visible.blusa   = true;
      this._visible.calca   = true;
      this._selected.blusa  = look.top?.id    || null;
      this._selected.calca  = look.bottom?.id || null;
    }
    this._selected.sapato       = look.shoe?.id  || null;
    this._visible.sobreposicao  = !!look.layer;
    this._selected.sobreposicao = look.layer?.id || null;
    this._render(container);
    Toast.info("Look gerado aleatoriamente");
  }

  static async _confirmLook() {
    const ids = [];
    for (const { key } of this._SLOT_META) {
      if (!this._visible[key]) continue;
      const id = this._selected[key];
      if (id) ids.push(id);
    }
    if (!ids.length) {
      Toast.warning("Selecione ao menos uma peça antes de confirmar");
      return;
    }
    const btn = document.getElementById("wConfirmBtn");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Salvando...";
    }
    try {
      await WardrobeManager.saveLook(ids);
      const names = ids.map(id => WardrobeManager.getById(id)?.name).filter(Boolean);
      await HistoryService.add("confirmou look", names.join(", "));
      Toast.success("Look do dia confirmado!");
      this.reset();
      const container = document.getElementById("wardrobeMontador");
      if (container) this._render(container);
      const statsEl = document.getElementById("wardrobeStats");
      if (statsEl && !statsEl.classList.contains("hidden")) {
        import("../../ui/wardrobe/WardrobeRenderer.js").then(m => m.WardrobeRenderer.renderStats());
      }
    } catch {
      Toast.error("Erro ao confirmar look");
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Confirmar Look";
      }
    }
  }
}
