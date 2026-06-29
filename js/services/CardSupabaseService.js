import {
  supabase
} from "../config/SupabaseClient.js";
export class CardSupabaseService {
  static async getAll() {
    const {
      data,
      error
    } = await supabase
      .from("cards")
      .select("*")
      .order("name", {
        ascending: true
      });
    if (error) {
      console.error("CardSupabaseService.getAll:", error);
      return [];
    }
    return data;
  }
  static async add(card) {
    const {
      data,
      error
    } = await supabase
      .from("cards")
      .insert({
        name: card.name,
        limit: card.limit,
        close_day: card.closeDay ?? card.close_day,
        due_day: card.dueDay ?? card.due_day,
      })
      .select()
      .single();
    if (error) {
      console.error("CardSupabaseService.add:", error);
      return null;
    }
    return CardSupabaseService._normalize(data);
  }
  static async update(id, card) {
    const {
      error
    } = await supabase
      .from("cards")
      .update({
        name: card.name,
        limit: card.limit,
        close_day: card.closeDay ?? card.close_day,
        due_day: card.dueDay ?? card.due_day,
      })
      .eq("id", id);
    if (error) {
      console.error("CardSupabaseService.update:", error);
      return false;
    }
    return true;
  }
  static async remove(id) {
    const {
      error
    } = await supabase
      .from("cards")
      .delete()
      .eq("id", id);
    if (error) {
      console.error("CardSupabaseService.remove:", error);
      return false;
    }
    return true;
  }
  static async getById(id) {
    const {
      data,
      error
    } = await supabase
      .from("cards")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      console.error("CardSupabaseService.getById:", error);
      return null;
    }
    return CardSupabaseService._normalize(data);
  }
  static _normalize(card) {
    if (!card) return null;
    return {
      ...card,
      closeDay: card.close_day ?? card.closeDay,
      dueDay: card.due_day ?? card.dueDay,
    };
  }
}
