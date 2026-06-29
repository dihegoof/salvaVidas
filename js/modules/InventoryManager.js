import {
  ProductService
} from "../services/ProductService.js";
export class InventoryManager {
  static searchTerm = "";
  static filter = "all";
  static getFilteredProducts() {
    let products = ProductService.getAll().filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesFilter =
        this.filter === "all" ||
        this.filter === "asc" ||
        this.filter === "desc" ||
        (this.filter === "essential" && product.isEssential) ||
        (this.filter === "nonEssential" && !product.isEssential) ||
        (this.filter === "buy" && product.quantity <= 0);
      return matchesSearch && matchesFilter;
    });
    if (this.filter === "asc") {
      products.sort((a, b) => a.name.localeCompare(b.name));
    }
    if (this.filter === "desc") {
      products.sort((a, b) => b.name.localeCompare(a.name));
    }
    return products;
  }
}
