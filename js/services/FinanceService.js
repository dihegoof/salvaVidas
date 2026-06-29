import {
  FinanceSupabaseService
} from "./FinanceSupabaseService.js";
export class FinanceService {
  static editingIndex = null;
  static editingId = null;
  static activeFilter = "all";
  static search = "";
  static filterMode = 0;
  static transactions = [];
  static async loadAll() {
    this.transactions = await FinanceSupabaseService.getAll();
  }
  static getAll() {
    return this.transactions;
  }
  static async add(transaction) {
    const saved = await FinanceSupabaseService.add(transaction);
    if (saved && !this.transactions.find(t => t.id === saved.id))
      this.transactions.unshift(saved);
    return saved;
  }
  static async updateById(id, transaction) {
    const idx = this.transactions.findIndex(t => t.id === id);
    if (idx !== -1) this.transactions[idx] = {
      ...this.transactions[idx],
      ...transaction,
      id
    };
    FinanceSupabaseService.update(id, transaction).catch(console.error);
    return true;
  }
  static update(index, transaction) {
    const existing = this.transactions[index];
    if (!existing) return;
    return this.updateById(existing.id, transaction);
  }
  static async remove(id) {
    this.transactions = this.transactions.filter(t => t.id !== id);
    FinanceSupabaseService.remove(id).catch(console.error);
    return true;
  }
  static applyRealtimeEvent(payload) {
    const {
      eventType,
      new: n,
      old: o
    } = payload;
    if (eventType === "INSERT") {
      const norm = FinanceSupabaseService._normalize(n);
      if (!this.transactions.find(t => t.id === norm.id)) this.transactions.unshift(norm);
    }
    if (eventType === "UPDATE") {
      const norm = FinanceSupabaseService._normalize(n);
      const idx = this.transactions.findIndex(t => t.id === norm.id);
      if (idx !== -1) this.transactions[idx] = norm;
      else this.transactions.unshift(norm);
    }
    if (eventType === "DELETE") {
      this.transactions = this.transactions.filter(t => t.id !== o.id);
    }
  }
}
