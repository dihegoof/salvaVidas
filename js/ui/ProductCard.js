export class ProductCard {
  static render(product, index) {
    return `
            <div
    class="product-card"
    data-index="${index}">
                <div
    class="product-image open-product"
    data-index="${index}">  
                    <img src="${product.imageUrl}"
                         alt="${product.name}">
                </div>

                <div class="product-header">
                    <h3 class="product-title">

    ${product.name}

    ${
      product.outOfStockSince
        ? `
            <span
                class="stock-info-btn"
                data-index="${index}">
i</span>
        `
        : ""
    }

</h3>

                    <div class="product-tags">
                        ${
                          product.category
                            ? `
                                    <span class="product-pill">
                                        ${product.category}
                                    </span>
                                `
                            : ""
                        }

                        ${
                          product.isEssential
                            ? `
                                    <span class="product-pill essential-pill">
                                        Essencial
                                    </span>
                                `
                            : ""
                        }
                        ${
                          product.isNew
                            ? `
        <span
            class="product-pill new-pill">

            NOVO

        </span>
    `
                            : ""
                        }

                        ${
                          product.quantity <= 0
                            ? `
        <span class="product-pill need-buy-pill">
            Precisa Comprar
        </span>
    `
                            : ""
                        }
                    </div>
                </div>

                <div class="product-quantity">
                    <button
                        class="qty-btn decrease-btn"
                        data-index="${index}"
                    >
                        -
                    </button>

                    <span class="quantity-value">
                        ${product.quantity}
                    </span>

                    <button
                        class="qty-btn increase-btn"
                        data-index="${index}"
                    >
                        +
                    </button>
                </div>
            </div>
        `;
  }
}
