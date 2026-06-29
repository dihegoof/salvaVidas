import {
  supabase
} from "../config/SupabaseClient.js";
const PENDING_NAME_KEY = "pendingProfileName";
export class AuthService {
  static async signUp(name, email, password) {
    const {
      data,
      error
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name.trim()
        }
      }
    });
    if (error) throw error;
    localStorage.setItem(PENDING_NAME_KEY, name.trim());
    if (data.session) {
      await AuthService._saveProfile(data.user.id, email, name);
    }
    return data;
  }
  static async signIn(nameOrEmail, password) {
    let email = nameOrEmail.trim();
    if (!email.includes("@")) {
      const {
        data: profiles,
        error: profileError
      } = await supabase
        .from("profiles")
        .select("email")
        .ilike("name", email)
        .limit(1);
      if (profileError || !profiles?.length) {
        throw new Error("Nenhum usuário encontrado com esse nome. Verifique e tente novamente.");
      }
      email = profiles[0].email;
    }
    const {
      data,
      error
    } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    await AuthService._ensureProfile(data.user, email);
    return data;
  }
  static async _ensureProfile(user, email) {
    const {
      data: existing
    } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();
    if (existing) return;
    const pendingName = localStorage.getItem(PENDING_NAME_KEY);
    const name = pendingName || email.split("@")[0];
    await AuthService._saveProfile(user.id, email, name);
  }
  static async _saveProfile(id, email, name) {
    const {
      error
    } = await supabase
      .from("profiles")
      .upsert({
        id,
        email,
        name: name.trim()
      });
    if (error) {
      console.error("AuthService._saveProfile:", error);
      return;
    }
    localStorage.removeItem(PENDING_NAME_KEY);
  }
  static async signOut() {
    await supabase.auth.signOut();
  }
  static async getUser() {
    try {
      const {
        data
      } = await supabase.auth.getUser();
      return data?.user ?? null;
    } catch (e) {
      console.error("Erro getUser:", e);
      return null;
    }
  }
  static async getProfile() {
    const user = await this.getUser();
    if (!user) return null;
    const {
      data
    } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    return data;
  }
  static async isLogged() {
    const user = await this.getUser();
    return !!user;
  }
}