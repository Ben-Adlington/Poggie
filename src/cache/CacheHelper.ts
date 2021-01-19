import fs from 'fs';

export enum CacheKey {
  EMOTE_HISTORY = 'EMOTE_HISTORY',
  LAST_EMOTE = 'LAST_EMOTE',
}

class CacheHelper {
  private cachePath = 'src/cache/index.json';

  constructor() {}

  /**
   * Sets an item in the cache using the given Key
   * @param key Unique cache key to identify the given data.
   * @param data Data to set.
   */
  set<T>(key: CacheKey, data: T) {
    let cachedData: Record<string, unknown>;

    // Try and get the data from the cache
    try {
      cachedData = JSON.parse(fs.readFileSync(this.cachePath).toString());
    } catch {
      cachedData = {};
    }

    // Update the field we passed in
    cachedData[`${key}`] = data;

    // Update the file
    fs.writeFileSync(this.cachePath, JSON.stringify(cachedData));

    // Return the updated cache
    return cachedData[key] as T;
  }

  /**
   * Gets data from the cache using the given key.
   * @param key
   */
  get<T>(key: CacheKey): T | undefined {
    let cachedData: Record<string, unknown>;

    // Get the data from the cache
    try {
      cachedData = JSON.parse(fs.readFileSync(this.cachePath).toString());
    } catch {
      return undefined;
    }

    // Do a lookup using the given key
    const lookup = cachedData[key];

    // Return undefined if we can't find it
    if (lookup === undefined) {
      return undefined;
    }

    // Otherwise we can safely return it as T
    return lookup as T;
  }
}

export default new CacheHelper();
