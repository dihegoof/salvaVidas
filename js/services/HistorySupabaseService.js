import {
  supabase
} from "../config/SupabaseClient.js";
export class HistorySupabaseService {
  static async getAll() {
    const {
      data,
      error
    } = await supabase
      .from("history")
      .select("*")
      .order("created_at", {
        ascending: false
      });
    if (error) {
      console.error("HistorySupabaseService.getAll:", error);
      return [];
    }
    return data.map(HistorySupabaseService._normalize);
  }
  static async add(entry) {
    const {
      data,
      error
    } = await supabase
      .from("history")
      .insert({
        user_name: entry.userName ?? entry.user_name,
        action: entry.action,
        product_name: entry.productName ?? entry.product_name,
      })
      .select()
      .single();
    if (error) {
      console.error("HistorySupabaseService.add:", error);
      return null;
    }
    return HistorySupabaseService._normalize(data);
  }
  static async clear() {
    const {
      error
    } = await supabase.from("history").delete().not("id", "is", null);
    if (error) {
      console.error("HistorySupabaseService.clear:", error);
      return false;
    }
    return true;
  }
  static _normalize(h) {
    if (!h) return null;
    return {
      ...h,
      userName: h.user_name ?? h.userName,
      productName: h.product_name ?? h.productName,
      createdAt: h.created_at ?? h.createdAt,
    };
  }
}
