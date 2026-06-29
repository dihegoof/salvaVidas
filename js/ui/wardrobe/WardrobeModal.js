import {
  WardrobeManager
} from "../../modules/wardrobe/WardrobeManager.js";
import {
  WardrobeItemLooksModal
} from "./WardrobeItemLooksModal.js";
import {
  WardrobeMontadorManager
} from "../../modules/wardrobe/WardrobeMontadorManager.js";
import {
  WardrobeRenderer
} from "./WardrobeRenderer.js";
import {
  WardrobeAIService
} from "../../services/WardrobeAIService.js";
import {
  Toast
} from "../../modules/toast/Toast.js";
export class WardrobeModal {
  static _editingId = null;
  static _imageBase64 = null;
  static _analyzed = false;
  static open(itemId = null) {
    this._editingId = itemId || null;
    this._imageBase64 = null;
    this._analyzed = false;
    const modal = document.getElementById("wardrobeItemModal");
    if (!modal) return;
    const isEdit = !!itemId;
    modal.querySelector(".wm-title").textContent = isEdit ? "Editar Peça" : "Nova Peça";
    document.getElementById("wmDeleteBtn")?.classList.toggle("hidden", !isEdit);
    document.getElementById("wmLooksBtn")?.classList.toggle("hidden", !isEdit);
    const analyzeBtn = document.getElementById("wmAnalyzeBtn");
    if (analyzeBtn) analyzeBtn.textContent = isEdit ? "Validar novamente" : "Validar";
    this._setFieldsLocked(true);
    if (isEdit) {
      const item = WardrobeManager.getById(itemId);
      if (!item) return;
      this._fillFields(item.name, item.type, item.color, item.occasion);
      const preview = document.getElementById("wmImagePreview");
      if (preview && item.imageUrl) {
        preview.src = item.imageUrl;
        preview.classList.remove("hidden");
      }
      this._setFieldsLocked(false);
    } else {
      this._clearFields();
      this._setFieldsLocked(true);
    }
    modal.classList.remove("hidden");
  }
  static close() {
    document.getElementById("wardrobeItemModal")?.classList.add("hidden");
    this._editingId = null;
    this._imageBase64 = null;
    this._analyzed = false;
  }
  static async analyze() {
    const occasion = document.getElementById("wmOccasion")?.value.trim() || "";
    let imageToSend = this._imageBase64;
    if (!imageToSend && this._editingId) {
      const item = WardrobeManager.getById(this._editingId);
      imageToSend = item?.imageUrl || null;
    }
    if (!imageToSend) {
      Toast.warning("Escolha uma foto primeiro");
      return;
    }
    const analyzeBtn = document.getElementById("wmAnalyzeBtn");
    const saveBtn = document.getElementById("wmSaveBtn");
    if (analyzeBtn) {
      analyzeBtn.disabled = true;
      analyzeBtn.textContent = "Validando...";
    }
    if (saveBtn) {
      saveBtn.disabled = true;
    }
    this._setFieldsLocked(true);
    try {
      const result = await WardrobeAIService.analyze(imageToSend, occasion);
      this._fillFields(result.name, result.type, result.color, result.occasion);
      this._analyzed = true;
      this._setFieldsLocked(false);
      Toast.success("IA identificou a peça");
    } catch (err) {
      console.error("WardrobeModal.analyze:", err);
      Toast.error("Erro ao analisar imagem. Preencha manualmente.");
      this._setFieldsLocked(false);
    } finally {
      if (analyzeBtn) {
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = "Analisar novamente";
      }
      if (saveBtn) saveBtn.disabled = false;
    }
  }
  static async save() {
    const name = document.getElementById("wmName")?.value.trim() || "";
    const type = document.getElementById("wmType")?.value || "";
    const color = document.getElementById("wmColor")?.value || "";
    const occasion = document.getElementById("wmOccasion")?.value.trim() || "";
    if (!type) {
      Toast.warning("Selecione o tipo da peça");
      return;
    }
    const btn = document.getElementById("wmSaveBtn");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Salvando...";
    }
    try {
      let imageUrl = this._imageBase64 || null;
      if (!imageUrl && this._editingId) {
        imageUrl = WardrobeManager.getById(this._editingId)?.imageUrl || null;
      }
      const item = {
        name,
        type,
        color,
        occasion,
        imageUrl
      };
      if (this._editingId) {
        await WardrobeManager.update(this._editingId, item);
        Toast.success("Peça atualizada");
      } else {
        await WardrobeManager.add(item);
        Toast.success("Peça adicionada ao guarda-roupa");
      }
      WardrobeMontadorManager.init();
      WardrobeRenderer.renderArmario();
      WardrobeRenderer.renderStats();
      this.close();
    } catch (err) {
      console.error("WardrobeModal.save:", err);
      Toast.error("Erro ao salvar peça");
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Salvar";
      }
    }
  }
  static async remove() {
    if (!this._editingId) return;
    const item = WardrobeManager.getById(this._editingId);
    if (!confirm(`Excluir "${item?.name || "esta peça"}"?`)) return;
    try {
      await WardrobeManager.remove(this._editingId);
      Toast.success("Peça removida");
      WardrobeMontadorManager.init();
      WardrobeRenderer.renderArmario();
      WardrobeRenderer.renderStats();
      this.close();
    } catch {
      Toast.error("Erro ao remover peça");
    }
  }
  static onImageChange(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      this._imageBase64 = e.target.result;
      const preview = document.getElementById("wmImagePreview");
      if (preview) {
        preview.src = e.target.result;
        preview.classList.remove("hidden");
      }
      if (!this._editingId) {
        this._analyzed = false;
        this._clearFields(true);
        this._setFieldsLocked(true);
        Toast.info("Foto selecionada. Toque em Analisar com IA.");
      }
    };
    reader.readAsDataURL(file);
  }
  static _fillFields(name, type, color, occasion) {
    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val || "";
    };
    set("wmName", name);
    set("wmType", type);
    set("wmColor", color);
    set("wmOccasion", occasion);
  }
  static _clearFields(keepOccasion = false) {
    const set = (id) => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    };
    set("wmName");
    set("wmType");
    set("wmColor");
    if (!keepOccasion) set("wmOccasion");
    const preview = document.getElementById("wmImagePreview");
    if (preview) {
      preview.src = "";
      preview.classList.add("hidden");
    }
    const fileInput = document.getElementById("wmImageFile");
    if (fileInput) fileInput.value = "";
  }
  static _setFieldsLocked(locked) {
    const ids = ["wmName", "wmType", "wmColor"];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.disabled = locked;
    });
    const saveBtn = document.getElementById("wmSaveBtn");
    if (saveBtn) saveBtn.disabled = locked;
  }
}
