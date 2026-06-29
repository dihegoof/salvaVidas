import {
  ProductSupabaseService
} from "./ProductSupabaseService.js";
export class ProductService {
  static editingIndex = null;
  static products = [];
  static async loadAll() {
    const raw = await ProductSupabaseService.getAll();
    this.products = raw.map(ProductService._normalize);
  }
  static getAll() {
    return this.products;
  }
  static async add(product) {
    const saved = await ProductSupabaseService.add(product);
    if (saved) {
      if (!this.products.find(p => p.id === saved.id))
        this.products.push(ProductService._normalize(saved));
    }
    return saved;
  }
  static async remove(indexOrId) {
    const product = typeof indexOrId === "number" ?
      this.products[indexOrId] :
      this.products.find(p => p.id === indexOrId);
    if (!product) return false;
    this.products = this.products.filter(p => p.id !== product.id);
    ProductSupabaseService.remove(product.id).catch(console.error);
    return true;
  }
  static async update(indexOrId, updatedProduct) {
    const product = typeof indexOrId === "number" ?
      this.products[indexOrId] :
      this.products.find(p => p.id === indexOrId);
    if (!product) return false;
    const idx = this.products.findIndex(p => p.id === product.id);
    if (idx !== -1)
      this.products[idx] = {
        ...this.products[idx],
        ...ProductService._normalize(updatedProduct)
      };
    ProductSupabaseService.update(product.id, updatedProduct).catch(console.error);
    return true;
  }
  static async increase(index) {
    const p = this.products[index];
    if (!p) return;
    p.quantity++;
    p.isNew = false;
    if (p.quantity > 0) p.outOfStockSince = null;
    ProductSupabaseService.update(p.id, {
      quantity: p.quantity,
      is_new: false,
      out_of_stock_since: p.outOfStockSince
    }).catch(console.error);
  }
  static async decrease(index) {
    const p = this.products[index];
    if (!p || p.quantity <= 0) return;
    p.quantity--;
    p.isNew = false;
    if (p.quantity === 0 && !p.outOfStockSince) p.outOfStockSince = new Date().toISOString();
    ProductSupabaseService.update(p.id, {
      quantity: p.quantity,
      is_new: false,
      out_of_stock_since: p.outOfStockSince
    }).catch(console.error);
  }
  static applyRealtimeEvent(payload) {
    const {
      eventType,
      new: n,
      old: o
    } = payload;
    if (eventType === "INSERT") {
      const norm = ProductService._normalize(n);
      if (!this.products.find(p => p.id === norm.id)) this.products.push(norm);
    }
    if (eventType === "UPDATE") {
      const norm = ProductService._normalize(n);
      const idx = this.products.findIndex(p => p.id === norm.id);
      if (idx !== -1) this.products[idx] = norm;
      else this.products.push(norm);
    }
    if (eventType === "DELETE") {
      this.products = this.products.filter(p => p.id !== o.id);
    }
  }
  static exists(name) {
    return this.products.some(p => p.name.trim().toLowerCase() === name.trim().toLowerCase());
  }
  static existsExceptIndex(name, currentIndex) {
    return this.products.some((p, idx) =>
      idx !== currentIndex && p.name.trim().toLowerCase() === name.trim().toLowerCase()
    );
  }
  static _normalize(p) {
    if (!p) return null;
    return {
      ...p,
      isEssential: p.is_essential ?? p.isEssential ?? false,
      isNew: p.is_new ?? p.isNew ?? false,
      outOfStockSince: p.out_of_stock_since ?? p.outOfStockSince ?? null,
      imageUrl: p.image_url ?? p.imageUrl ?? "./assets/images/default-product.png",
    };
  }
}
