const PIXABAY_API_KEY = "56388894-912dde6b2c2cfcf16a7c72594";
export class ImageService {
  static USE_TRANSLATOR = false;
  static async translate(text) {
    if (!this.USE_TRANSLATOR) {
      return text;
    }
    try {
      const response = await fetch(
        "https://translate.argosopentech.com/translate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            q: text,
            source: "pt",
            target: "en",
            format: "text"
          })
        }
      );
      if (!response.ok) {
        return text;
      }
      const data =
        await response.json();
      return data.translatedText || text;
    } catch {
      return text;
    }
  }
  static async fetchProductPhoto(productName) {
    if (!productName || !PIXABAY_API_KEY) {
      return null;
    }
    try {
      let searchTerm =
        productName.trim();
      if (this.USE_TRANSLATOR) {
        searchTerm =
          await this.translate(
            searchTerm
          );
      }
      const query =
        encodeURIComponent(
          searchTerm
        );
      const url =
        `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${query}&image_type=photo&per_page=5&safesearch=true`;
      const response =
        await fetch(url);
      if (!response.ok) {
        return null;
      }
      const data =
        await response.json();
      if (!data.hits?.length) {
        return null;
      }
      return (
        data.hits[0].webformatURL ||
        data.hits[0].largeImageURL ||
        null
      );
    } catch {
      return null;
    }
  }
  static async toBase64(file) {
    return new Promise((resolve) => {
      const reader =
        new FileReader();
      reader.onload =
        (event) =>
        resolve(
          event.target.result
        );
      reader.readAsDataURL(file);
    });
  }
  static async getProductPhoto(productName) {
    const image =
      await this.fetchProductPhoto(
        productName
      );
    return (
      image ||
      "./assets/images/default-product.png"
    );
  }
}
