export class ReceiptOCRService {
  static async extractText(file) {
    const result =
      await Tesseract.recognize(
        file,
        "por"
      );
    return result.data.text;
  }
}
