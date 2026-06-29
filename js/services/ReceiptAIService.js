const BACKEND_URL = "https://superagent-2d98faf7.base44.app/functions/receiptParse";
export class ReceiptAIService {
  static async parse(receiptText) {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ receiptText })
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Erro na análise: ${response.status} ${err}`);
    }
    const result = await response.json();
    if (result.error) throw new Error(result.error);
    return result;
  }
}
