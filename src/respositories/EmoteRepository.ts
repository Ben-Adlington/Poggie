import { createConnection, Repository } from 'typeorm';
import { Emote } from '../entities/Emote';

class EmoteRepository {
  private _repo: Repository<Emote> | null = null;

  constructor() {
    createConnection().then((connection) => {
      this._repo = connection.manager.getRepository(Emote);
    });
  }

  /**
   * Gets all of the previous pog champs
   */
  public async getPogChamps(): Promise<Emote[]> {
    if (this._repo === null) {
      return [];
    }

    const emotes = await this._repo.find();

    const sortedEmotes = emotes.sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));

    return sortedEmotes;
  }

  /**
   * Gets the latest pog champ
   */
  public async getLatestPogChamp(): Promise<Emote | undefined | null> {
    if (this._repo === null) {
      return null;
    }

    const latestEmote = await this._repo.createQueryBuilder().take(1).orderBy('emote.createdAt', 'DESC').getOne();

    return latestEmote;
  }

  /**
   * Inserts the given emote
   */
  public async insert(twitchEmoteId: number): Promise<boolean> {
    if (this._repo === null) {
      return false;
    }

    try {
      await this._repo.insert({ twitchEmoteId, createdAt: new Date().getTime() });

      return true;
    } catch {
      return false;
    }
  }
}

export default new EmoteRepository();
