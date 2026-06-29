import {
  WardrobeSupabaseService
} from "../../services/WardrobeSupabaseService.js";
export class WardrobeManager {
  static _items = [];
  static _looks = [];
  static async loadAll() {
    [this._items, this._looks] = await Promise.all([
      WardrobeSupabaseService.getAll(),
      WardrobeSupabaseService.getLooks(),
    ]);
  }
  static getAll() {
    return this._items;
  }
  static getLooks() {
    return this._looks;
  }
  static getByType(type) {
    return this._items.filter(i => i.type === type);
  }
  static getById(id) {
    return this._items.find(i => i.id === id) || null;
  }
  static getLooksByItem(itemId) {
    return this._looks.filter(look => {
      try {
        const ids = Array.isArray(look.item_ids) ?
          look.item_ids :
          JSON.parse(look.item_ids || "[]");
        return ids.includes(itemId);
      } catch {
        return false;
      }
    });
  }
  static async add(item) {
    const saved = await WardrobeSupabaseService.add(item);
    if (saved) this._items.unshift(saved);
    return saved;
  }
  static async update(id, item) {
    const saved = await WardrobeSupabaseService.update(id, item);
    if (saved) {
      const idx = this._items.findIndex(i => i.id === id);
      if (idx !== -1) this._items[idx] = saved;
    }
    return saved;
  }
  static async remove(id) {
    const ok = await WardrobeSupabaseService.remove(id);
    if (ok) this._items = this._items.filter(i => i.id !== id);
    return ok;
  }
  static async saveLook(itemIds) {
    const itemNames = itemIds.map(id => this.getById(id)?.name || "?");
    const look = await WardrobeSupabaseService.saveLook({
      itemIds,
      itemNames
    });
    const now = new Date().toISOString();
    itemIds.forEach(id => {
      const item = this.getById(id);
      if (item) {
        item.timesUsed = (item.timesUsed || 0) + 1;
        item.lastUsed = now;
      }
    });
    if (look) this._looks.unshift(look);
    return look;
  }
  static COLOR_RULES = {
    preto: ["branco", "cinza", "azul", "rosa", "bege", "vermelho", "nude"],
    branco: ["preto", "cinza", "azul", "rosa", "bege", "verde", "nude", "jeans"],
    azul: ["branco", "preto", "bege", "cinza", "rosa", "nude", "jeans"],
    cinza: ["preto", "branco", "azul", "rosa", "vinho", "bege"],
    bege: ["preto", "branco", "azul", "marrom", "nude", "verde"],
    rosa: ["branco", "preto", "cinza", "azul", "nude", "jeans"],
    vermelho: ["preto", "branco", "jeans", "bege"],
    verde: ["branco", "bege", "nude", "jeans", "preto"],
    amarelo: ["branco", "preto", "jeans", "azul"],
    laranja: ["preto", "branco", "jeans", "bege"],
    vinho: ["preto", "cinza", "bege", "nude"],
    marrom: ["bege", "branco", "nude", "jeans"],
    nude: ["preto", "branco", "azul", "bege", "vinho", "marrom"],
    jeans: ["branco", "preto", "rosa", "vermelho", "azul", "cinza", "bege"],
  };
  static colorMatches(c1 = "", c2 = "") {
    const a = c1.toLowerCase(),
      b = c2.toLowerCase();
    if (a === b) return true;
    return (this.COLOR_RULES[a] || []).includes(b);
  }
  static generateRandomLook() {
    const by = t => this.getByType(t);
    const shuf = arr => [...arr].sort(() => Math.random() - 0.5);
    const tops = by("blusa"),
      bottoms = by("calca"),
      dresses = by("vestido"),
      shoes = by("sapato"),
      layers = by("sobreposicao");
    const useDress = dresses.length > 0 && Math.random() < 0.3;
    if (useDress) {
      const dress = shuf(dresses)[0];
      const shoe = shuf(shoes).find(s => this.colorMatches(dress.color, s.color)) || shuf(shoes)[0] || null;
      const layer = shuf(layers).find(l => this.colorMatches(dress.color, l.color)) || null;
      return {
        dress,
        top: null,
        bottom: null,
        shoe,
        layer
      };
    }
    const top = shuf(tops)[0];
    if (!top) return null;
    const bottom = shuf(bottoms).find(b => this.colorMatches(top.color, b.color)) || shuf(bottoms)[0] || null;
    const shoe = shuf(shoes).find(s => this.colorMatches(top.color, s.color)) || shuf(shoes)[0] || null;
    const layer = shuf(layers).find(l => this.colorMatches(top.color, l.color)) || null;
    return {
      dress: null,
      top,
      bottom,
      shoe,
      layer
    };
  }
}
