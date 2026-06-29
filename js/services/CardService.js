import {
  CardSupabaseService
} from "./CardSupabaseService.js";
export class CardService {
  static cards = [];
  static async loadAll() {
    this.cards = await CardSupabaseService.getAll();
  }
  static getAll() {
    return this.cards;
  }
  static async add(card) {
    const saved = await CardSupabaseService.add(card);
    if (saved) this.cards.push(saved);
    return saved;
  }
  static async update(id, updatedCard) {
    const ok = await CardSupabaseService.update(id, updatedCard);
    if (ok) {
      const idx = this.cards.findIndex(c => c.id === id);
      if (idx !== -1) this.cards[idx] = {
        ...this.cards[idx],
        ...updatedCard
      };
    }
    return ok;
  }
  static async remove(id) {
    const ok = await CardSupabaseService.remove(id);
    if (ok) this.cards = this.cards.filter(c => c.id !== id);
    return ok;
  }
}
