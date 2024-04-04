export class InvalidApiResponseStructure extends Error {
  constructor(message: string) {
    super(message || "Invalid API response structure");
    this.name = "InvalidApiResponseStructure";
  }
}
