import {
  supabase
} from "../config/SupabaseClient.js";
export class DebtSupabaseService {
  static async getAll() {
    const {
      data,
      error
    } = await supabase
      .from("debts")
      .select("*")
      .order("created_at", {
        ascending: false
      });
    if (error) {
      console.error("DebtSupabaseService.getAll:", error);
      return [];
    }
    return data.map(DebtSupabaseService._normalize);
  }
  static async add(debt) {
    const {
      data,
      error
    } = await supabase
      .from("debts")
      .insert({
        description: debt.description,
        creditor: debt.creditor ?? null,
        total_value: debt.totalValue ?? debt.total_value,
        total_installments: debt.totalInstallments ?? debt.total_installments,
        installment_value: debt.installmentValue ?? debt.installment_value,
        paid_installments: debt.paidInstallments ?? debt.paid_installments ?? 0,
        payment_history: debt.paymentHistory ?? debt.payment_history ?? [],
      })
      .select()
      .single();
    if (error) {
      console.error("DebtSupabaseService.add:", error);
      return null;
    }
    return DebtSupabaseService._normalize(data);
  }
  static async update(id, debt) {
    const payload = {
      description: debt.description,
      creditor: debt.creditor ?? null,
      total_value: debt.totalValue ?? debt.total_value,
      total_installments: debt.totalInstallments ?? debt.total_installments,
      installment_value: debt.installmentValue ?? debt.installment_value,
      paid_installments: debt.paidInstallments ?? debt.paid_installments,
      payment_history: debt.paymentHistory ?? debt.payment_history ?? [],
    };
    const {
      error
    } = await supabase
      .from("debts")
      .update(payload)
      .eq("id", id);
    if (error) {
      console.error("DebtSupabaseService.update:", error);
      return false;
    }
    return true;
  }
  static async remove(id) {
    const {
      error
    } = await supabase
      .from("debts")
      .delete()
      .eq("id", id);
    if (error) {
      console.error("DebtSupabaseService.remove:", error);
      return false;
    }
    return true;
  }
  static async getById(id) {
    const {
      data,
      error
    } = await supabase
      .from("debts")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      console.error("DebtSupabaseService.getById:", error);
      return null;
    }
    return DebtSupabaseService._normalize(data);
  }
  static _normalize(d) {
    if (!d) return null;
    return {
      ...d,
      totalValue: d.total_value ?? d.totalValue,
      totalInstallments: d.total_installments ?? d.totalInstallments,
      installmentValue: d.installment_value ?? d.installmentValue,
      paidInstallments: d.paid_installments ?? d.paidInstallments ?? 0,
      paymentHistory: d.payment_history ?? d.paymentHistory ?? [],
    };
  }
}
