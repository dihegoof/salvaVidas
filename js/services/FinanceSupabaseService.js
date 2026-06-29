import {
  supabase
} from "../config/SupabaseClient.js";
export class FinanceSupabaseService {
  static async getAll() {
    const {
      data,
      error
    } = await supabase
      .from("finances")
      .select("*")
      .order("date", {
        ascending: false
      });
    if (error) {
      console.error("FinanceSupabaseService.getAll:", error);
      return [];
    }
    return data.map(FinanceSupabaseService._normalize);
  }
  static async add(transaction) {
    const {
      data,
      error
    } = await supabase
      .from("finances")
      .insert({
        description: transaction.description,
        value: transaction.value,
        type: transaction.type,
        category: transaction.category,
        date: transaction.date || null,
        card_id: transaction.cardId ?? transaction.card_id ?? null,
        total_value: transaction.totalValue ?? transaction.total_value ?? null,
        installment_value: transaction.installmentValue ?? transaction.installment_value ?? null,
        total_installments: transaction.totalInstallments ?? transaction.total_installments ?? null,
        current_installment: transaction.currentInstallment ?? transaction.current_installment ?? null,
      })
      .select()
      .single();
    if (error) {
      console.error("FinanceSupabaseService.add:", error);
      return null;
    }
    return FinanceSupabaseService._normalize(data);
  }
  static async update(id, transaction) {
    const {
      error
    } = await supabase
      .from("finances")
      .update({
        description: transaction.description,
        value: transaction.value,
        type: transaction.type,
        category: transaction.category,
        date: transaction.date || null,
        card_id: transaction.cardId ?? transaction.card_id ?? null,
        total_value: transaction.totalValue ?? transaction.total_value ?? null,
        installment_value: transaction.installmentValue ?? transaction.installment_value ?? null,
        total_installments: transaction.totalInstallments ?? transaction.total_installments ?? null,
        current_installment: transaction.currentInstallment ?? transaction.current_installment ?? null,
      })
      .eq("id", id);
    if (error) {
      console.error("FinanceSupabaseService.update:", error);
      return false;
    }
    return true;
  }
  static async remove(id) {
    const {
      error
    } = await supabase
      .from("finances")
      .delete()
      .eq("id", id);
    if (error) {
      console.error("FinanceSupabaseService.remove:", error);
      return false;
    }
    return true;
  }
  static async getById(id) {
    const {
      data,
      error
    } = await supabase
      .from("finances")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      console.error("FinanceSupabaseService.getById:", error);
      return null;
    }
    return FinanceSupabaseService._normalize(data);
  }
  static _normalize(t) {
    if (!t) return null;
    return {
      ...t,
      cardId: t.card_id ?? t.cardId ?? null,
      totalValue: t.total_value ?? t.totalValue ?? null,
      installmentValue: t.installment_value ?? t.installmentValue ?? null,
      totalInstallments: t.total_installments ?? t.totalInstallments ?? null,
      currentInstallment: t.current_installment ?? t.currentInstallment ?? null,
    };
  }
}
