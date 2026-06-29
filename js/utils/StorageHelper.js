export class StorageHelper {
  static saveUserName(name) {
    localStorage.setItem("userName", name);
  }
  static getUserName() {
    return localStorage.getItem("userName");
  }
  static save(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }
  static get(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }
}
