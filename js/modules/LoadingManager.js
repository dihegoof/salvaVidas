export class LoadingManager {
  static _count = 0;
  static show(message = "Carregando...") {
    this._count++;
    const overlay = document.getElementById("loadingOverlay");
    const text = document.getElementById("loadingText");
    if (!overlay) return;
    if (text) text.textContent = message;
    overlay.classList.remove("hidden");
    requestAnimationFrame(() => overlay.classList.add("loading-visible"));
  }
  static hide() {
    this._count = Math.max(0, this._count - 1);
    if (this._count > 0) return;
    const overlay = document.getElementById("loadingOverlay");
    if (!overlay) return;
    overlay.classList.remove("loading-visible");
    setTimeout(() => overlay.classList.add("hidden"), 300);
  }
  static forceHide() {
    this._count = 0;
    const overlay = document.getElementById("loadingOverlay");
    if (!overlay) return;
    overlay.classList.remove("loading-visible");
    overlay.classList.add("hidden");
  }
}
