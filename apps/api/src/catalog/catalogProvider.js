export class CatalogProviderError extends Error {
  constructor({ code, message, status = 502, retryAfter = undefined }) {
    super(message);
    this.name = 'CatalogProviderError';
    this.code = code;
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

export class CatalogProvider {
  async discover(_input) {
    throw new Error('CatalogProvider.discover must be implemented.');
  }

  async search(_input) {
    throw new Error('CatalogProvider.search must be implemented.');
  }

  async getMedia(_input) {
    throw new Error('CatalogProvider.getMedia must be implemented.');
  }

  async getReleaseSchedule(_input) {
    throw new Error('CatalogProvider.getReleaseSchedule must be implemented.');
  }
}
