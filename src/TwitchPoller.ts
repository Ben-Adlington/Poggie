import TwitchJs, { ApiVersions } from 'twitch-js';
import CacheHelper, { CacheKey } from './cache/CacheHelper';

export interface EmoteHistoryItem {
  emoteId: number;
  createdAt: number;
}

class TwitchPoller {
  private static Username = 'Nyohshi';
  private twitchJs: TwitchJs;

  constructor() {
    this.twitchJs = new TwitchJs({
      username: TwitchPoller.Username,
      token: process.env.API_KRAKEN_TOKEN || '',
    });
  }

  /**
   * Gets the pogchamp ID using the twitch APIs
   */
  public async getPogChampId(): Promise<number> {
    try {
      const emotesResponse = await this.twitchJs.api.get(`chat/emoticon_images?emotesets=0`, {
        version: ApiVersions.Kraken,
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      // Find it in the results
      const pogChampEmote = emotesResponse.emoticonSets[0].filter((x: any) => x.code === 'PogChamp')[0];
      let history = CacheHelper.get<EmoteHistoryItem[]>(CacheKey.EMOTE_HISTORY);

      // Populate the cache with an empty array if it does't exist
      if (history === undefined) {
        history = [];

        // Update the json file
        CacheHelper.set(CacheKey.EMOTE_HISTORY, history);

        return -1;
      }

      // Push in the latest emote if it doesn't exist
      if (history.findIndex((x) => x.emoteId === pogChampEmote.id) === -1) {
        history.push({ emoteId: pogChampEmote.id, createdAt: new Date().getTime() });

        // Update the json file
        CacheHelper.set(CacheKey.EMOTE_HISTORY, history);
      }

      // Return it
      return pogChampEmote.id;
    } catch {
      return -1;
    }
  }

  /**
   * Gets the previous pogchamp ids from the cache
   */
  public async getPogChamps(): Promise<EmoteHistoryItem[]> {
    try {
      const history = CacheHelper.get<EmoteHistoryItem[]>(CacheKey.EMOTE_HISTORY);

      // Parse it
      if (!history) {
        return [];
      }

      // Return it
      return history;
    } catch {
      return [];
    }
  }
}

export default TwitchPoller;
