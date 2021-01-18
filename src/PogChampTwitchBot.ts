import TwitchJs, { ApiVersions } from 'twitch-js';
import fs from 'fs';

interface EmoteHistoryItem {
  emoteId: number;
  createdAt: number;
}

class PogChampTwitchBot {
  private static Username = 'Nyohshi';
  private twitchJs: TwitchJs;

  constructor() {
    this.twitchJs = new TwitchJs({
      username: PogChampTwitchBot.Username,
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

      console.log(pogChampEmote);

      // Get the cache
      const data = fs.readFileSync('src/cache/index.json').toString();
      let history: EmoteHistoryItem[] = [];

      // Parse it
      if (data.length > 0) {
        history = JSON.parse(data);
      }

      // Push in the latest emote if it doesn't exist
      if (history.findIndex((x) => x.emoteId === pogChampEmote.id) === -1) {
        history.push({ emoteId: pogChampEmote.id, createdAt: new Date().getTime() });
      }

      // Update the json file
      fs.writeFileSync('src/cache/index.json', JSON.stringify(history));

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
      // Get ids from the cache
      const data = fs.readFileSync('src/cache/index.json').toString();
      let history: EmoteHistoryItem[] = [];

      // Parse it
      if (data.length > 0) {
        history = JSON.parse(data);
      }

      // Return it
      return history;
    } catch {
      return [];
    }
  }
}

export default PogChampTwitchBot;
