import { supabase } from "../config/SupabaseClient.js";

export class ProductSupabaseService {
  static async _retry(fn, retries = 2) {
    for (let i = 0; i <= retries; i++) {
      try {
        return await fn();
      } catch (e) {
        if (i === retries) throw e;
        await new Promise(r => setTimeout(r, 800 * (i + 1)));
      }
    }
  }

  static async getAll() {
    try {
      const { data, error } = await this._retry(() =>
        supabase
          .from("products")
          .select("*")
          .order("name", { ascending: true })
          .limit(500)
      );
      if (error) {
        console.error("ProductSupabaseService.getAll:", error);
        return [];
      }
      return data || [];
    } catch (e) {
      console.error("ProductSupabaseService.getAll timeout:", e);
      return [];
    }
  }

  static async add(product) {
    try {
      const { data, error } = await this._retry(() =>
        supabase
          .from("products")
          .insert({
            user_id: product.user_id,
            name: product.name,
            category: product.category,
            quantity: product.quantity,
            is_essential: product.is_essential ?? product.isEssential ?? false,
            is_new: product.is_new ?? product.isNew ?? true,
            out_of_stock_since: product.out_of_stock_since ?? product.outOfStockSince ?? null,
            image_url: product.image_url ?? product.imageUrl ?? null,
          })
          .select()
          .single()
      );
      if (error) {
        console.error("ProductSupabaseService.add:", error);
        return null;
      }
      return data;
    } catch (e) {
      console.error("ProductSupabaseService.add timeout:", e);
      return null;
    }
  }

  static async update(id, product) {
    const payload = {};
    if (product.name !== undefined) payload.name = product.name;
    if (product.category !== undefined) payload.category = product.category;
    if (product.quantity !== undefined) payload.quantity = product.quantity;
    if (product.is_essential !== undefined) payload.is_essential = product.is_essential;
    if (product.isEssential !== undefined) payload.is_essential = product.isEssential;
    if (product.is_new !== undefined) payload.is_new = product.is_new;
    if (product.isNew !== undefined) payload.is_new = product.isNew;
    if (product.out_of_stock_since !== undefined) payload.out_of_stock_since = product.out_of_stock_since;
    if (product.outOfStockSince !== undefined) payload.out_of_stock_since = product.outOfStockSince;
    if (product.image_url !== undefined) payload.image_url = product.image_url;
    if (product.imageUrl !== undefined) payload.image_url = product.imageUrl;

    try {
      const { error } = await this._retry(() =>
        supabase.from("products").update(payload).eq("id", id)
      );
      if (error) {
        console.error("ProductSupabaseService.update:", error);
        return false;
      }
      return true;
    } catch (e) {
      console.error("ProductSupabaseService.update timeout:", e);
      return false;
    }
  }

  static async remove(id) {
    try {
      const { error } = await this._retry(() =>
        supabase.from("products").delete().eq("id", id)
      );
      if (error) {
        console.error("ProductSupabaseService.remove:", error);
        return false;
      }
      return true;
    } catch (e) {
      console.error("ProductSupabaseService.remove timeout:", e);
      return false;
    }
  }

  static async getById(id) {
    try {
      const { data, error } = await this._retry(() =>
        supabase.from("products").select("*").eq("id", id).single()
      );
      if (error) {
        console.error("ProductSupabaseService.getById:", error);
        return null;
      }
      return data;
    } catch (e) {
      console.error("ProductSupabaseService.getById timeout:", e);
      return null;
    }
  }
}
