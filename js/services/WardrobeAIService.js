const BACKEND_URL = "https://app.base44.com/api/apps/6a3aba32b6b137e32d98faf7/functions/wardrobeAnalyze";

export class WardrobeAIService {
  static async analyze(imageDataUrl, occasionHint = "") {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        image: imageDataUrl,
        occasion: occasionHint
      })
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Erro na análise: ${response.status} ${err}`);
    }
    const result = await response.json();
    if (result.error) throw new Error(result.error);
    return {
      name: result.name || "Peça sem nome",
      type: result.type || "blusa",
      color: result.color || "preto",
      occasion: result.occasion || "casual"
    };
  }
}