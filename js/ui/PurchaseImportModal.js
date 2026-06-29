export class PurchaseImportModal {
  static open() {
    document
      .getElementById("purchaseImportModal")
      .classList.remove("hidden");
  }
  static close() {
    document
      .getElementById("purchaseImportModal")
      .classList.add("hidden");
    this.clear();
  }
  static clear() {
    document.getElementById("receiptText").value = "";
    document.getElementById("receiptImage").value = "";
  }
  static showPreview(data) {
    const preview =
      document.getElementById(
        "purchasePreview"
      );
    preview.innerHTML = `

    <h3>
      Produtos encontrados
    </h3>

    ${data.items
      .map(
        item => `

          <div>

            ${item.name}
            (${item.quantity})

          </div>

        `
      )
      .join("")}

    <hr>

    <strong>

      Total:
      R$ ${data.total.toFixed(2)}

    </strong>

  `;
    preview.classList.remove(
      "hidden"
    );
  }
}
