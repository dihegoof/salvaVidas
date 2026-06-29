import {
  DebtSupabaseService
} from "./DebtSupabaseService.js";
export class DebtService {
  static debts = [];
  static async loadAll() {
    this.debts = await DebtSupabaseService.getAll();
  }
  static getAll() {
    return this.debts;
  }
  static async add(debt) {
    const saved = await DebtSupabaseService.add(debt);
    if (saved && !this.debts.find(d => d.id === saved.id)) this.debts.push(saved);
    return saved;
  }
  static async update(id, updatedDebt) {
    const idx = this.debts.findIndex(d => d.id === id);
    if (idx !== -1) this.debts[idx] = {
      ...this.debts[idx],
      ...updatedDebt
    };
    DebtSupabaseService.update(id, updatedDebt).catch(console.error);
    return true;
  }
  static async remove(id) {
    this.debts = this.debts.filter(d => d.id !== id);
    DebtSupabaseService.remove(id).catch(console.error);
    return true;
  }
  static async save(debt) {
    if (!debt?.id) return false;
    return this.update(debt.id, debt);
  }
  static applyRealtimeEvent(payload) {
    const {
      eventType,
      new: n,
      old: o
    } = payload;
    if (eventType === "INSERT") {
      const norm = DebtSupabaseService._normalize(n);
      if (!this.debts.find(d => d.id === norm.id)) this.debts.push(norm);
    }
    if (eventType === "UPDATE") {
      const norm = DebtSupabaseService._normalize(n);
      const idx = this.debts.findIndex(d => d.id === norm.id);
      if (idx !== -1) this.debts[idx] = norm;
      else this.debts.push(norm);
    }
    if (eventType === "DELETE") {
      this.debts = this.debts.filter(d => d.id !== o.id);
    }
  }
}
