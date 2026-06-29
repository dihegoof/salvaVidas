export class Toast {
  static queue = [];
  static isShowing = false;
  static currentTimeout = null;
  static show(message, type = "success", duration = 3000) {
    this.queue.push({
      message,
      type,
      duration
    });
    if (!this.isShowing) this._showNext();
  }
  static _showNext() {
    if (this.queue.length === 0) {
      this.isShowing = false;
      return;
    }
    this.isShowing = true;
    const {
      message,
      type,
      duration
    } = this.queue.shift();
    const container = document.getElementById("toastContainer");
    if (!container) {
      this._showNext();
      return;
    }
    const existing = container.querySelector(".toast-item");
    if (existing) existing.remove();
    const el = document.createElement("div");
    el.className = `toast-item toast-${type}`;
    el.textContent = message;
    container.appendChild(el);
    requestAnimationFrame(() => el.classList.add("toast-visible"));
    clearTimeout(this.currentTimeout);
    this.currentTimeout = setTimeout(() => {
      el.classList.remove("toast-visible");
      el.classList.add("toast-hiding");
      setTimeout(() => {
        el.remove();
        this.isShowing = false;
        if (this.queue.length > 0) this._showNext();
      }, 350);
    }, duration);
  }
  static success(message) {
    this.show(message, "success");
  }
  static error(message) {
    this.show(message, "error");
  }
  static warning(message) {
    this.show(message, "warning");
  }
  static info(message) {
    this.show(message, "info");
  }
}
