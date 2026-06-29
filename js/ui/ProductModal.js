import {
  ProductService
} from "../services/ProductService.js";
import {
  ProductRenderer
} from "./ProductRenderer.js";
import {
  ImageService
} from "../services/ImageService.js";
import {
  HistoryService
} from "../services/HistoryService.js";
import {
  Toast
} from "../modules/toast/Toast.js";
import {
  AuthService
} from "../services/AuthService.js";
export class ProductModal {
  static open() {
    document.getElementById("productModal").classList.remove("hidden");
    const preview = document.getElementById("productImagePreview");
    if (preview) preview.style.display = "none";
  }
  static close() {
    document.getElementById("productModal").classList.add("hidden");
    document.querySelector("#productModal h2").textContent = "Novo Produto";
    document.getElementById("deleteProductBtn").classList.add("hidden");
    const uploadSection = document.getElementById("productImageSection");
    if (uploadSection) uploadSection.style.display = "none";
    ProductService.editingIndex = null;
  }
  static async save() {
    const name = document.getElementById("productName").value.trim();
    if (!name) {
      Toast.warning("Informe o nome do produto");
      return;
    }
    const btn = document.getElementById("saveProductBtn");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Salvando...";
    }
    try {
      const imageInput = document.getElementById("productImage");
      let imageUrl = null;
      if (imageInput && imageInput.files.length) {
        imageUrl = await ImageService.toBase64(imageInput.files[0]);
      }
      const product = {
        name,
        category: document.getElementById("productCategory").value,
        quantity: Number(document.getElementById("productQuantity").value) || 0,
        isEssential: document.getElementById("productEssential").checked,
        isNew: true,
        outOfStockSince: null,
        imageUrl: imageUrl || "./assets/images/default-product.png",
      };
      if (ProductService.editingIndex !== null) {
        if (ProductService.existsExceptIndex(name, ProductService.editingIndex)) {
          Toast.warning("Já existe um produto com este nome.");
          return;
        }
        const existing = ProductService.getAll()[ProductService.editingIndex];
        if (!imageInput?.files.length && existing?.imageUrl) {
          product.imageUrl = existing.imageUrl;
        }
        await ProductService.update(ProductService.editingIndex, product);
        await HistoryService.add("editou produto", product.name);
        ProductService.editingIndex = null;
        ProductRenderer.render();
        this.close();
        Toast.success("Produto atualizado");
        return;
      }
      if (ProductService.exists(name)) {
        Toast.warning("Este produto já existe.");
        return;
      }
      Toast.info("Buscando foto do produto...");
      if (!imageInput?.files.length) {
        const autoPhoto = await ImageService.getProductPhoto(name);
        product.imageUrl = autoPhoto;
      }
      const user = await AuthService.getUser();
      await ProductService.add({
        user_id: user?.id ?? null,
        name: product.name,
        category: product.category,
        quantity: product.quantity,
        is_essential: product.isEssential,
        is_new: product.isNew,
        out_of_stock_since: product.outOfStockSince,
        image_url: product.imageUrl,
      });
      await HistoryService.add("criou produto", product.name);
      ProductRenderer.render();
      this.clear();
      this.close();
      Toast.success("Produto criado");
    } catch (err) {
      console.error("Erro ao salvar produto:", err);
      Toast.error("Erro ao salvar produto");
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Salvar";
      }
    }
  }
  static clear() {
    document.getElementById("productName").value = "";
    document.getElementById("productCategory").value = "";
    document.getElementById("productQuantity").value = "";
    document.getElementById("productEssential").checked = false;
    const imageInput = document.getElementById("productImage");
    if (imageInput) imageInput.value = "";
    const preview = document.getElementById("productImagePreview");
    if (preview) {
      preview.src = "";
      preview.style.display = "none";
    }
  }
  static openEdit(index) {
    const product = ProductService.getAll()[index];
    if (!product) return;
    ProductService.editingIndex = index;
    document.getElementById("productName").value = product.name;
    document.getElementById("productCategory").value = product.category || "";
    document.getElementById("productQuantity").value = product.quantity;
    document.getElementById("productEssential").checked = product.isEssential;
    document.querySelector("#productModal h2").textContent = "Editar Produto";
    document.getElementById("deleteProductBtn").classList.remove("hidden");
    const uploadSection = document.getElementById("productImageSection");
    if (uploadSection) uploadSection.style.display = "block";
    const preview = document.getElementById("productImagePreview");
    if (preview && product.imageUrl) {
      preview.src = product.imageUrl;
      preview.style.display = "block";
    }
    const imageInput = document.getElementById("productImage");
    if (imageInput) imageInput.value = "";
    this.open();
  }
}
