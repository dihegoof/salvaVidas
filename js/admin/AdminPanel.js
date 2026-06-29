import {
  Toast
} from "../modules/toast/Toast.js";
export class AdminPanel {
  static _tapCount = 0;
  static _tapTimer = null;
  static _sequence = "";
  static SECRET_KBD = "admin";
  static TAP_TARGET = 5;
  static init() {
    this._inject();
    this._bindColors();
    this._loadSaved();
    this._setupTriggers();
  }
  static _inject() {
    if (document.getElementById("adminPanel")) return;
    const el = document.createElement("div");
    el.id = "adminPanel";
    el.innerHTML = `
      <div class="adm-sheet" id="admSheet">
        <div class="adm-handle"></div>
        <div class="adm-header">
          <span class="adm-title">Painel de Cor</span>
          <button class="adm-close" id="admCloseBtn" type="button">Fechar</button>
        </div>
        <div class="adm-body">
          ${this._colorRow("primary",    "Cor Primária",    "#3a7d5a")}
          ${this._colorRow("success",    "Cor de Sucesso",  "#34c759")}
          ${this._colorRow("danger",     "Cor de Perigo",   "#ff3b30")}
          ${this._colorRow("warning",    "Cor de Aviso",    "#ffcc00")}
          ${this._colorRow("text",       "Cor de Texto",    "#1a2e22")}
          ${this._colorRow("background","Fundo",            "#f4f7f4")}
          ${this._colorRow("card",       "Fundo do Card",   "#ffffff")}
          <div class="adm-actions">
            <button class="adm-btn adm-reset" id="admResetBtn">Restaurar</button>
            <button class="adm-btn adm-export" id="admExportBtn">Exportar CSS</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(el);
    document.getElementById("admCloseBtn").onclick = () => this.close();
    document.getElementById("admResetBtn").onclick = () => this._reset();
    document.getElementById("admExportBtn").onclick = () => this._export();
    el.addEventListener("click", e => {
      if (e.target === el) this.close();
    });
  }
  static _colorRow(key, label, def) {
    return `
      <div class="adm-row">
        <label class="adm-label">${label}</label>
        <div class="adm-input-wrap">
          <input type="color" id="adm_${key}" value="${def}" data-var="--${key}"/>
          <span class="adm-hex" id="adm_${key}_hex">${def}</span>
          <div class="adm-preview" id="adm_${key}_prev" style="background:${def}"></div>
        </div>
      </div>`;
  }
  static _bindColors() {
    document.querySelectorAll("#adminPanel input[type=color]").forEach(inp => {
      inp.addEventListener("input", () => {
        const cssVar = inp.dataset.var;
        const hex = inp.value;
        document.documentElement.style.setProperty(cssVar, hex);
        const hexSpan = document.getElementById(inp.id + "_hex");
        const prev = document.getElementById(inp.id + "_prev");
        if (hexSpan) hexSpan.textContent = hex;
        if (prev) prev.style.background = hex;
        this._persist();
      });
    });
  }
  static _persist() {
    const data = {};
    document.querySelectorAll("#adminPanel input[type=color]").forEach(inp => {
      data[inp.dataset.var] = inp.value;
    });
    localStorage.setItem("sv_adm_colors", JSON.stringify(data));
  }
  static _loadSaved() {
    const raw = localStorage.getItem("sv_adm_colors");
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      Object.entries(data).forEach(([cssVar, hex]) => {
        document.documentElement.style.setProperty(cssVar, hex);
        const key = cssVar.replace("--", "");
        const inp = document.getElementById(`adm_${key}`);
        const hexS = document.getElementById(`adm_${key}_hex`);
        const prev = document.getElementById(`adm_${key}_prev`);
        if (inp) inp.value = hex;
        if (hexS) hexS.textContent = hex;
        if (prev) prev.style.background = hex;
      });
    } catch {}
  }
  static _DEFAULTS = {
    "--primary": "#3a7d5a",
    "--success": "#34c759",
    "--danger": "#ff3b30",
    "--warning": "#ffcc00",
    "--text": "#1a2e22",
    "--background": "#f4f7f4",
    "--card": "#ffffff",
  };
  static _reset() {
    Object.entries(this._DEFAULTS).forEach(([cssVar, hex]) => {
      document.documentElement.style.setProperty(cssVar, hex);
      const key = cssVar.replace("--", "");
      const inp = document.getElementById(`adm_${key}`);
      const hexS = document.getElementById(`adm_${key}_hex`);
      const prev = document.getElementById(`adm_${key}_prev`);
      if (inp) inp.value = hex;
      if (hexS) hexS.textContent = hex;
      if (prev) prev.style.background = hex;
    });
    localStorage.removeItem("sv_adm_colors");
    Toast.success("Cor restauradas");
  }
  static _export() {
    const lines = Object.entries(this._DEFAULTS).map(([cssVar]) => {
      const key = cssVar.replace("--", "");
      const inp = document.getElementById(`adm_${key}`);
      return `  ${cssVar}: ${inp ? inp.value : this._DEFAULTS[cssVar]};`;
    });
    const css = `:root {\n${lines.join("\n")}\n}`;
    const blob = new Blob([css], {
      type: "text/plain"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cores.css";
    a.click();
    URL.revokeObjectURL(url);
    Toast.success("CSS exportado");
  }
  static _setupTriggers() {
    document.addEventListener("click", e => {
      if (!e.target.closest("h1, h2, .app-header, .auth-title")) return;
      this._tapCount++;
      clearTimeout(this._tapTimer);
      if (this._tapCount >= this.TAP_TARGET) {
        this._tapCount = 0;
        this.open();
        return;
      }
      this._tapTimer = setTimeout(() => {
        this._tapCount = 0;
      }, 600);
    });
    document.addEventListener("keydown", e => {
      const ch = e.key.length === 1 ? e.key.toLowerCase() : "";
      if (!ch) {
        this._sequence = "";
        return;
      }
      this._sequence += ch;
      if (this._sequence.endsWith(this.SECRET_KBD)) {
        this._sequence = "";
        this.open();
      }
      if (this._sequence.length > 20) this._sequence = this._sequence.slice(-20);
    });
  }
  static open() {
    const panel = document.getElementById("adminPanel");
    if (!panel) return;
    panel.classList.add("adm-open");
    requestAnimationFrame(() => {
      document.getElementById("admSheet")?.classList.add("adm-sheet-up");
    });
  }
  static close() {
    const sheet = document.getElementById("admSheet");
    const panel = document.getElementById("adminPanel");
    if (!sheet || !panel) return;
    sheet.classList.remove("adm-sheet-up");
    setTimeout(() => panel.classList.remove("adm-open"), 320);
  }
}
