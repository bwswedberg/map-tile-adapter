interface SourceTileCacheOptions<Item = any> {
  fetchItem: (key: string) => Promise<Item>;
  maxCache: number;
}

const defaultOptions: Partial<SourceTileCacheOptions> = {
  maxCache: 10,
}

export class SourceTileCache<Item = any> {
  private options: SourceTileCacheOptions;
  private items: Record<string, Item | null> = {};
  private lru: string[] = []; // order by [least recently used, ..., most recently used]
  private subscriptions: Record<string, ((item: Item | null) => void)[]> = {};

  constructor(options: SourceTileCacheOptions) {
    this.options = { 
      ...defaultOptions,
      ...options, 
    };
  }

  async getTile(key: string): Promise<Item | null> {
    return new Promise((resolve) => {
      this.subscribe(key, resolve);
    });
  }

  private removeItem() {
    const oldKey = this.lru.shift();
    if (oldKey) {
      delete this.items[oldKey];
    }
  }

  private touchItem(key: string) {
    const tileIndex = this.lru.indexOf(key);
    if (tileIndex > -1) {
      this.lru.splice(tileIndex, 1);
      this.lru.push(key);
    }
  }

  private pushItem(key: string, item: Item | null) {
    this.items[key] = item;
    this.lru.push(key);
    while (this.lru.length > this.options.maxCache) {
      this.removeItem();
    }
  }

  private subscribe(key: string, listener: (item: Item | null) => void) {
    if (this.items[key] !== undefined) {
      this.touchItem(key);
      listener(this.items[key]);
    } else {
      if (this.subscriptions[key]) {
        this.subscriptions[key].push(listener);
      } else {
        this.subscriptions[key] = [listener];
        this.options.fetchItem(key)
          .then(value => this.publish(key, value))
          .catch(error => this.publish(key, null, error));
      }
    }
  }

  private publish(key: string, item: Item | null, error?: unknown) {
    this.pushItem(key, item);
    if (this.subscriptions[key]) {
      this.subscriptions[key].forEach(listener => listener(item));
      delete this.subscriptions[key];
    }
  }
}
