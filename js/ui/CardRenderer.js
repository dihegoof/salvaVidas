import {
  CardSupabaseService
}
from "../services/CardSupabaseService.js";
export class CardRenderer {
  static async render() {
    const container =
      document
      .getElementById(
        "cardsContainer"
      );
    if (!container) {
      return;
    }
    const cards =
      await CardSupabaseService.getAll();
    if (
      cards.length === 0
    ) {
      container.innerHTML =
        `
                <div class="empty-state">

                    Nenhum cartão cadastrado

                </div>
                `;
      return;
    }
    container.innerHTML =
      cards.map(
        (
          card,
          index
        ) =>
        `
                <div
                    class="finance-card-item"
                    data-index="${index}">

                    <h3>

                        ${card.name}

                    </h3>

                    <p>

                        Limite:
                        ${
                            card.limit
                            .toLocaleString(
                                "pt-BR",
                                {
                                    style:
                                        "currency",

                                    currency:
                                        "BRL"
                                }
                            )
                        }

                    </p>

                    <p>

                        Fecha:
                        ${card.closeDay}

                    </p>

                    <p>

                        Vence:
                        ${card.dueDay}

                    </p>

                </div>
                `
      )
      .join("");
  }
}
