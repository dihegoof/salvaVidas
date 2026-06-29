import {
  HistorySupabaseService
} from "./HistorySupabaseService.js";
import {
  StorageHelper
} from "../utils/StorageHelper.js";
export class HistoryService {
  static history = [];
  static async loadAll() {
    this.history = await HistorySupabaseService.getAll();
  }
  static getAll() {
    return this.history;
  }
  static getPage(page, limit) {
    return this.history.slice(0, page * limit);
  }
  static async add(action, productName) {
    const userName = StorageHelper.getUserName() || "Usuário";
    const saved = await HistorySupabaseService.add({
      userName,
      action,
      productName
    });
    if (saved) this.history.unshift(saved);
    return saved;
  }
  static async clear() {
    const ok = await HistorySupabaseService.clear();
    if (ok) this.history = [];
    return ok;
  }
  static applyRealtimeEvent(payload) {
    const {
      eventType,
      new: n
    } = payload;
    if (eventType === "INSERT") {
      const norm = HistorySupabaseService._normalize(n);
      if (!this.history.find(h => h.id === norm.id)) this.history.unshift(norm);
    }
    if (eventType === "DELETE") {
      this.history = [];
    }
  }
}
