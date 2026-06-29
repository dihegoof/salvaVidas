  const GROQ_KEY = "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";
  export class ReceiptAIService {
    static async parse(
      receiptText
    ) {
      const prompt = `

Você é um extrator de notas fiscais.

Retorne APENAS JSON válido.

Formato:

{
  "items":[
    {
      "name":"Arroz",
      "quantity":2
    }
  ],
  "total":0
}

Regras:

- Simplifique nomes.
- Ignore códigos de barras.
- Ignore peso e volume.
- Ignore marcas quando possível.

Exemplos:

ARROZ TIO JOAO 5KG -> Arroz
LEITE ITALAC INTEGRAL 1L -> Leite
OLEO DE SOJA LIZA 900ML -> Óleo de Soja

Texto OCR:

${receiptText}

`;
      const response =
        await fetch(
          "https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${GROQ_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: "llama-3.3-70b-versatile",
              messages: [{
                role: "user",
                content: prompt
              }],
              temperature: 0
            })
          }
        );
      const data =
        await response.json();
      console.log(
        "RESPOSTA IA:",
        data?.choices?.[0]?.message?.content
      );
      const content =
        data?.choices?.[0]?.message?.content;
      if (!content) {
        console.error(data);
        throw new Error(
          "Groq não retornou resposta"
        );
      }
      console.log(
        "RESPOSTA IA:",
        content
      );
      return JSON.parse(
        content
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim()
      );
    }
  }
