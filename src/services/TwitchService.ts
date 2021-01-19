import TwitchJs, { ApiVersions } from 'twitch-js';

export interface EmoteHistoryItem {
  emoteId: number;
  createdAt: number;
}

export enum TwitchEmoteNames {
  PogChamp = 'PogChamp',
}

class TwitchService {
  private static Username = 'Nyohshi';
  private twitchJs: TwitchJs;

  constructor() {
    this.twitchJs = new TwitchJs({
      username: TwitchService.Username,
      token: process.env.API_KRAKEN_TOKEN || '',
      log: {
        level: 'silent',
      },
    });
  }

  /**
   * Gets the twitch emote using the given name
   */
  public async getEmoteIdByName(emoteName: TwitchEmoteNames): Promise<number> {
    try {
      // Query the twitch API for the base emotes
      const emotesResponse = await this.twitchJs.api.get(`chat/emoticon_images?emotesets=0`, {
        version: ApiVersions.Kraken,
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      // Find it in the results
      const pogChampEmote = emotesResponse.emoticonSets[0].filter((x: any) => x.code === emoteName)[0];

      // Return it
      return pogChampEmote.id;
    } catch {
      return -1;
    }
  }
}

export default new TwitchService();
