const GROQ_KEY = "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";
const GROQ_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";
export class WardrobeAIService {
  static async analyze(imageDataUrl, occasionHint = "") {
    const base64 = imageDataUrl.split(",")[1];
    const mimeMatch = imageDataUrl.match(/data:(image\/[^;]+);/);
    const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
    const occasionLine = occasionHint ?
      `O usuário informou que a ocasião é: "${occasionHint}". Use isso para confirmar ou refinar o campo occasion.` :
      "";
    const prompt = `Você é um especialista em moda. Analise a foto de uma peça de roupa e retorne APENAS JSON válido, sem markdown, sem explicação.

Formato obrigatório:
{
  "name": "nome curto e descritivo da peça (ex: Blusa Floral Rosa, Calça Jeans Slim, Tênis Branco)",
  "type": "um de: blusa | calca | vestido | sapato | sobreposicao",
  "color": "um de: preto | branco | cinza | azul | jeans | rosa | vermelho | verde | amarelo | laranja | bege | vinho | marrom | nude",
  "occasion": "um de: casual | trabalho | faculdade | festa | esporte | praia"
}

Regras:
- type "sobreposicao" é para blazer, jaqueta, casaco, cardigan, jaleco.
- Escolha SEMPRE a cor mais dominante da peça.
- Se a peça for estampada, escolha a cor de fundo.
- Se for jeans (qualquer tom de azul denim), use "jeans".
- Retorne SOMENTE o JSON, nada mais.
${occasionLine}`;
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{
          role: "user",
          content: [{
            type: "image_url",
            image_url: {
              url: `data:${mime};base64,${base64}`,
            },
          }, {
            type: "text",
            text: prompt,
          }, ],
        }, ],
        temperature: 0,
        max_tokens: 200,
      }),
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Groq Vision error ${response.status}: ${err}`);
    }
    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error("Groq não retornou resposta");
    const json = JSON.parse(
      content.replace(/```json/g, "").replace(/```/g, "").trim()
    );
    return {
      name: json.name || "Peça sem nome",
      type: json.type || "blusa",
      color: json.color || "preto",
      occasion: json.occasion || "casual",
    };
  }
}
