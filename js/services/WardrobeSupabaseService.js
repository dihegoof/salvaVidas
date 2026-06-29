import {
  supabase
} from "../config/SupabaseClient.js";
export class WardrobeSupabaseService {
  static _cachedUserId = null;
  static async _getUserId() {
    if (this._cachedUserId) return this._cachedUserId;
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    this._cachedUserId = user?.id || null;
    supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") this._cachedUserId = null;
    });
    return this._cachedUserId;
  }
  static async getAll() {
    const {
      data,
      error
    } = await supabase
      .from("wardrobe_items")
      .select("*")
      .order("created_at", {
        ascending: false
      });
    if (error) {
      console.error("WardrobeSupabaseService.getAll:", error);
      return [];
    }
    return data.map(this._normalize);
  }
  static async add(item) {
    const userId = await this._getUserId();
    if (!userId) {
      console.error("WardrobeSupabaseService.add: usuário não autenticado");
      return null;
    }
    const {
      data,
      error
    } = await supabase
      .from("wardrobe_items")
      .insert({
        ...this._denormalize(item),
        user_id: userId
      })
      .select()
      .single();
    if (error) {
      console.error("WardrobeSupabaseService.add:", error);
      return null;
    }
    return this._normalize(data);
  }
  static async update(id, item) {
    const {
      data,
      error
    } = await supabase
      .from("wardrobe_items")
      .update(this._denormalize(item))
      .eq("id", id)
      .select()
      .single();
    if (error) {
      console.error("WardrobeSupabaseService.update:", error);
      return null;
    }
    return this._normalize(data);
  }
  static async remove(id) {
    const {
      error
    } = await supabase.from("wardrobe_items").delete().eq("id", id);
    if (error) {
      console.error("WardrobeSupabaseService.remove:", error);
      return false;
    }
    return true;
  }
  static async getLooks() {
    const {
      data,
      error
    } = await supabase
      .from("wardrobe_looks")
      .select("*")
      .order("used_at", {
        ascending: false
      });
    if (error) {
      console.error("WardrobeSupabaseService.getLooks:", error);
      return [];
    }
    return data;
  }
  static async saveLook(look) {
    const userId = await this._getUserId();
    if (!userId) {
      console.error("WardrobeSupabaseService.saveLook: usuário não autenticado");
      return null;
    }
    const {
      data,
      error
    } = await supabase
      .from("wardrobe_looks")
      .insert({
        user_id: userId,
        item_ids: JSON.stringify(look.itemIds),
        item_names: JSON.stringify(look.itemNames),
        used_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) {
      console.error("WardrobeSupabaseService.saveLook:", error);
      return null;
    }
    const now = new Date().toISOString();
    const updatePromises = look.itemIds.map(id =>
      supabase.rpc("increment_times_used", {
        row_id: id,
        ts: now
      })
      .then(({
        error: rpcErr
      }) => {
        if (rpcErr) {
          return supabase
            .from("wardrobe_items")
            .update({
              last_used: now
            })
            .eq("id", id)
            .then(() => supabase.rpc ?
              null :
              supabase.from("wardrobe_items")
              .select("times_used")
              .eq("id", id)
              .maybeSingle()
              .then(({
                data: row
              }) => {
                if (row) {
                  return supabase
                    .from("wardrobe_items")
                    .update({
                      times_used: (row.times_used || 0) + 1,
                      last_used: now
                    })
                    .eq("id", id);
                }
              })
            );
        }
      })
    );
    Promise.all(updatePromises).catch(e => console.warn("saveLook increment:", e));
    return data;
  }
  static _normalize(r) {
    return {
      id: r.id,
      name: r.name,
      type: r.type,
      color: r.color,
      occasion: r.occasion,
      imageUrl: r.image_url,
      timesUsed: r.times_used || 0,
      lastUsed: r.last_used || null,
      createdAt: r.created_at,
    };
  }
  static _denormalize(item) {
    return {
      name: item.name || null,
      type: item.type || null,
      color: item.color || null,
      occasion: item.occasion || null,
      image_url: item.imageUrl || null,
      times_used: item.timesUsed || 0,
      last_used: item.lastUsed || null,
    };
  }
}
