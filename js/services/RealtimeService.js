import {
  supabase
} from "../config/SupabaseClient.js";
export class RealtimeService {
  static _channels = {};
  static subscribe(table, onChange) {
    if (this._channels[table]) {
      this._channels[table].unsubscribe();
    }
    const channel = supabase
      .channel(`rt_${table}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table
      }, onChange)
      .subscribe();
    this._channels[table] = channel;
  }
  static unsubscribeAll() {
    Object.keys(this._channels).forEach(t => {
      this._channels[t].unsubscribe();
    });
    this._channels = {};
  }
}
