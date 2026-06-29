import {
  WardrobeManager
} from "./WardrobeManager.js";
import {
  WardrobeMontadorManager
} from "./WardrobeMontadorManager.js";
import {
  WardrobeRenderer
} from "../../ui/wardrobe/WardrobeRenderer.js";
import {
  WardrobeModal
} from "../../ui/wardrobe/WardrobeModal.js";
import {
  LoadingManager
} from "../LoadingManager.js";
import {
  Toast
} from "../toast/Toast.js";

export class WardrobeScreenManager {
  static _loaded = false;
  static _currentTab = "montador";

  static async open() {
    if (!this._loaded) {
      LoadingManager.show("Carregando guarda-roupa...");
      try {
        await WardrobeManager.loadAll();
        this._loaded = true;
      } catch {
        Toast.error("Erro ao carregar guarda-roupa");
      } finally {
        LoadingManager.hide();
      }
    }
    this._renderHeader();
    this._bindHeader();
    this._showTab(this._currentTab);
  }

  static _renderHeader() {
    const header = document.getElementById("wardrobeHeader");
    if (!header) return;
    const isMontador = this._currentTab === "montador";
    header.innerHTML = `
      <div class="wh-tabs-row">
        <button class="wh-tab${this._currentTab === 'montador' ? ' wh-tab--active' : ''}" data-tab="montador">Look do Dia</button>
        <button class="wh-tab${this._currentTab === 'armario'  ? ' wh-tab--active' : ''}" data-tab="armario">Armário</button>
        <button class="wh-tab${this._currentTab === 'stats'    ? ' wh-tab--active' : ''}" data-tab="stats">Estatísticas</button>
      </div>
      ${isMontador ? `
      <div class="wh-controls-row">
        <button class="wh-ctrl-btn" id="wRandomHeaderBtn">Aleatório</button>
        <button class="wh-ctrl-btn${WardrobeMontadorManager._visible.vestido ? ' wh-ctrl-btn--active' : ''}" id="wToggleDressHeaderBtn">Modo Vestido</button>
        <button class="wh-ctrl-btn${WardrobeMontadorManager._visible.sobreposicao ? ' wh-ctrl-btn--active' : ''}" id="wToggleLayerHeaderBtn">+ Sobreposição</button>
      </div>` : ""}`;
  }

  static _bindHeader() {
    document.querySelectorAll(".wh-tab").forEach(btn => {
      btn.addEventListener("click", () => {
        this._showTab(btn.dataset.tab);
        this._renderHeader();
        this._bindHeader();
      });
    });

    document.getElementById("wAddItemBtn")?.addEventListener("click", () => WardrobeModal.open());

    document.getElementById("wRandomHeaderBtn")?.addEventListener("click", () => {
      if (this._currentTab !== "montador") {
        this._showTab("montador");
        this._renderHeader();
        this._bindHeader();
      }
      const container = document.getElementById("wardrobeMontador");
      if (container) WardrobeMontadorManager._randomLook(container);
    });

    document.getElementById("wToggleDressHeaderBtn")?.addEventListener("click", () => {
      if (this._currentTab !== "montador") {
        this._showTab("montador");
        this._renderHeader();
        this._bindHeader();
      }
      const container = document.getElementById("wardrobeMontador");
      if (!container) return;

      const nowDress = !WardrobeMontadorManager._visible.vestido;
      WardrobeMontadorManager._visible.vestido     = nowDress;
      WardrobeMontadorManager._visible.blusa       = !nowDress;
      WardrobeMontadorManager._visible.calca       = !nowDress;
      WardrobeMontadorManager._selected.vestido    = null;
      WardrobeMontadorManager._selected.blusa      = null;
      WardrobeMontadorManager._selected.calca      = null;

      WardrobeMontadorManager._render(container);
      this._renderHeader();
      this._bindHeader();
    });

    document.getElementById("wToggleLayerHeaderBtn")?.addEventListener("click", () => {
      if (this._currentTab !== "montador") {
        this._showTab("montador");
        this._renderHeader();
        this._bindHeader();
      }
      const container = document.getElementById("wardrobeMontador");
      if (!container) return;

      WardrobeMontadorManager._visible.sobreposicao  = !WardrobeMontadorManager._visible.sobreposicao;
      WardrobeMontadorManager._selected.sobreposicao = null;

      WardrobeMontadorManager._render(container);
      this._renderHeader();
      this._bindHeader();
    });
  }

  static _showTab(tab) {
    if (this._currentTab === "montador" && tab !== "montador") {
      WardrobeMontadorManager.reset();
    }
    this._currentTab = tab;
    const ids = {
      montador: "wardrobeMontador",
      armario:  "wardrobeArmario",
      stats:    "wardrobeStats"
    };
    Object.entries(ids).forEach(([key, id]) => {
      document.getElementById(id)?.classList.toggle("hidden", key !== tab);
    });
    if (tab === "montador") WardrobeMontadorManager.init();
    if (tab === "armario")  WardrobeRenderer.renderArmario();
    if (tab === "stats")    WardrobeRenderer.renderStats();
  }

  static close() {
    WardrobeMontadorManager.reset();
    this._currentTab = "montador";
  }
}
