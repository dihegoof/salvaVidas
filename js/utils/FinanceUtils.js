export class FinanceUtils {
  static getInvoiceMonth(purchaseDate, closeDay) {
    const date = new Date(purchaseDate);
    if (date.getDate() > closeDay) {
      date.setMonth(date.getMonth() + 1);
    }
    return date.getMonth() + 1;
  }
  static format(value) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }
  static registerCurrencyMask(
    inputId
  ) {
    const input =
      document.getElementById(
        inputId
      );
    if (!input) {
      return;
    }
    input.addEventListener(
      "keyup",
      (event) => {
        let value =
          event.target.value
          .replace(/\D/g, "");
        if (!value) {
          event.target.value = "";
          return;
        }
        const number =
          Number(value) / 100;
        event.target.value =
          number.toLocaleString(
            "pt-BR", {
              style: "currency",
              currency: "BRL"
            }
          );
      }
    );
  }
  static formatCurrency(value) {
    return Number(value)
      .toLocaleString(
        "pt-BR", {
          style: "currency",
          currency: "BRL"
        }
      );
  }
}
