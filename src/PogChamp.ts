import Discord, { Channel, MessageEmbed, MessageOptions, TextChannel } from 'discord.js';
import PogChampTwitchBot from './PogChampTwitchBot';

class PogChamp {
  private static Url: string = `https://static-cdn.jtvnw.net/emoticons/v2/[X]/default/dark/3.0`;
  private static UrlToken: string = '[X]';
  private static WhoopsUrl: string = 'https://static-cdn.jtvnw.net/emoticons/v2/33/default/dark/1.0';
  private static Token: string = process.env.DISCORD_TOKEN || '';
  private client: Discord.Client;
  private twitchBot: PogChampTwitchBot;
  private isDev: boolean = process.env.NODE_ENV !== 'production';

  private lastPogChampId: number | undefined;
  private reminderChannelId: string = '800370191279325185';
  private testChannelId: string = '800140034627338280';

  constructor() {
    this.client = new Discord.Client();
    this.twitchBot = new PogChampTwitchBot();
  }

  /**
   * Logs in as the discord user
   */
  public login() {
    this.client.on('ready', () => {
      console.log(`Logged in as ${this.client.user?.tag}`);
    });

    this.client.login(PogChamp.Token);
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
      const pogChampId = await this.twitchBot.getPogChampId();

      if (this.lastPogChampId !== pogChampId && pogChampId !== -1) {
        // Update the last reminder date
        this.lastPogChampId = pogChampId;

        // Get the discord channel
        const channel = (await this.client.channels.fetch(
          process.env.NODE_ENV === 'production' ? this.reminderChannelId : this.testChannelId
        )) as TextChannel;

        // Get the pogchamp message
        const message = await this.getPogChamp();

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
        return message.channel.send('champ');
      }

      case '!pogchamp': {
        const pogChampResponse = await this.getPogChamp();
        const discordMessage = await message.channel.send(pogChampResponse);
        discordMessage.react(':x:');
        discordMessage.react(':ballot_box_with_check:');
      }

      case '!pogchamps': {
        const pogChampsResponse = await this.getPogChamps();
        return message.channel.send(pogChampsResponse);
      }
    }
  };

  /**
   * Gets pogchamp as a formatted message
   */
  private getPogChamp = async (): Promise<Discord.MessageEmbed> => {
    const latestPogchampId = await this.twitchBot.getPogChampId();

    if (latestPogchampId === -1) {
      return new Discord.MessageEmbed().setImage(PogChamp.WhoopsUrl).setTitle('Whops! something went wrong');
    }

    const url = PogChamp.Url.replace(PogChamp.UrlToken, latestPogchampId.toString());
    return new Discord.MessageEmbed().setImage(url).setTitle("Today's PogChamp");
  };

  /**
   * Gets pogchamp as a formatted message
   */
  private getPogChamps = async (): Promise<Discord.MessageEmbed> => {
    const history = await this.twitchBot.getPogChamps();

    let message = '';

    for (const historyItem of history) {
      const createdAt = new Date(historyItem.createdAt);
      message += `${createdAt.toDateString()} - ${PogChamp.Url.replace(PogChamp.UrlToken, historyItem.emoteId.toString())} \n`;
    }

    return new Discord.MessageEmbed().setTitle('Previous PogChamps').setDescription(message);
  };
}

export default PogChamp;
