import Discord, { Channel, MessageEmbed, MessageOptions, TextChannel } from 'discord.js';
import TwitchService, { EmoteHistoryItem, TwitchEmoteNames } from './services/TwitchService';
import EmoteRepository from './respositories/EmoteRepository';

class Poggie {
  private static Url: string = `https://static-cdn.jtvnw.net/emoticons/v2/[X]/default/dark/3.0`;
  private static UrlToken: string = '[X]';
  private static WhoopsUrl: string = 'https://static-cdn.jtvnw.net/emoticons/v2/33/default/dark/1.0';
  private token: string = process.env.DISCORD_TOKEN || '';
  private client: Discord.Client;
  private isDev: boolean = process.env.NODE_ENV !== 'production';
  private reminderChannelId: string = '800370191279325185';
  private testChannelId: string = '800140034627338280';

  constructor() {
    this.client = new Discord.Client();
  }

  /**
   * Logs in as the discord user
   */
  public login() {
    this.client.on('ready', () => {
      console.log(`Logged in as ${this.client.user?.tag}`);
    });

    this.client.login(this.token);
  }

  /**
   * Binds the events to the discord server
   */
  public bindEvents() {
    this.client.on('message', this.handleMessage);
  }

  /**
   * Handles sending a reminder pogchamp every day at 5gmt ish
   */
  public bindReminder = () => {
    setInterval(async () => {
      const latestPogChampId = await TwitchService.getEmoteIdByName(TwitchEmoteNames.PogChamp);
      const lastPogChamp = await EmoteRepository.getLatestPogChamp();

      if (latestPogChampId === -1 || lastPogChamp === null) {
        return;
      }

      if (lastPogChamp === undefined || lastPogChamp.twitchEmoteId !== latestPogChampId) {
        // Get the discord channel
        const channel = (await this.client.channels.fetch(
          process.env.NODE_ENV === 'production' ? this.reminderChannelId : this.testChannelId
        )) as TextChannel;

        // Add the new pogchamp into the DB
        await EmoteRepository.insert(latestPogChampId);

        // Get the pogchamp message
        const message = await this.getPogChamp('⛑🔥 New PogChamp Alert 🔥⛑');

        // Send it in discord channel
        channel.send(message);
      }
    }, 10000);
  };

  /**
   * Handles any messages / commands
   */
  private handleMessage = async (message: Discord.Message) => {
    // Don't send messages from the dev bot in non-testing channels
    if (this.isDev && message.channel.id !== this.testChannelId) {
      return;
    }

    // Don't send messages from the production bot in the testing channel
    if (!this.isDev && message.channel.id === this.testChannelId) {
      return;
    }

    switch (message.content) {
      case 'pog': {
        await message.channel.send('champ');
        break;
      }

      case '!pogchamp': {
        const pogChampResponse = await this.getPogChamp("Today's PogChamp");
        await message.channel.send(pogChampResponse);
        break;
      }

      case '!pogchamps': {
        const pogChampsResponse = await this.getPogChamps();
        await message.channel.send(pogChampsResponse);
        break;
      }
    }
  };

  /**
   * Gets pogchamp as a formatted message
   */
  private getPogChamp = async (title: string): Promise<Discord.MessageEmbed> => {
    const latestPogchampId = await TwitchService.getEmoteIdByName(TwitchEmoteNames.PogChamp);

    if (latestPogchampId === -1) {
      return new Discord.MessageEmbed().setImage(Poggie.WhoopsUrl).setTitle('Whops! something went wrong');
    }

    const url = Poggie.Url.replace(Poggie.UrlToken, latestPogchampId.toString());
    return new Discord.MessageEmbed().setImage(url).setTitle(title);
  };

  /**
   * Gets pogchamp as a formatted message
   */
  private getPogChamps = async (): Promise<Discord.MessageEmbed> => {
    const emotes = await EmoteRepository.getPogChamps();

    let message = '';

    for (const emote of emotes) {
      const createdAt = new Date(emote.createdAt * 1000);

      message += `${createdAt.toDateString()} - ${Poggie.Url.replace(Poggie.UrlToken, emote.twitchEmoteId.toString())} \n`;
    }

    return new Discord.MessageEmbed().setTitle('Previous PogChamps').setDescription(message);
  };
}

export default Poggie;
