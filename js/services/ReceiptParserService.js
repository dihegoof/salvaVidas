export class ReceiptParserService {
  static parse(text) {
    const lines =
      text
      .split("\n")
      .map(
        line =>
        line.trim()
      )
      .filter(Boolean);
    const items = [];
    let total = 0;
    for (const line of lines) {
      if (
        line
        .toUpperCase()
        .startsWith("TOTAL")
      ) {
        total =
          Number(
            line
            .split(";")[1]
            ?.replace(",", ".")
          ) || 0;
        continue;
      }
      const parts =
        line.split(";");
      if (parts.length < 2) {
        continue;
      }
      items.push({
        name: parts[0].trim(),
        quantity: Number(parts[1])
      });
    }
    return {
      items,
      total
    };
  }
  static parseOCR(text) {
    const lines =
      text
      .split("\n")
      .map(line => line.trim())
      .filter(Boolean);
    const items = [];
    let total = 0;
    for (const line of lines) {
      if (
        /\d+,\d+\s+UN/i.test(line)
      ) {
        const match =
          line.match(
            /^\d+\s+\d+\s+(.+?)\s+(\d+),\d+\s+UN/i
          );
        if (match) {
          items.push({
            name: match[1]
              .trim(),
            quantity: Number(match[2])
          });
        }
      }
      if (
        line.toUpperCase()
        .includes(
          "VALOR TOTAL"
        )
      ) {
        const nextLine =
          lines[
            lines.indexOf(line) + 1
          ];
        if (nextLine) {
          total =
            Number(
              nextLine
              .replace(",", ".")
              .replace(/[^\d.]/g, "")
            ) || 0;
        }
      }
    }
    return {
      items,
      total
    };
  }
}
