import PogChamp from './PogChamp';
import PogChampTwitchBot from './PogChampTwitchBot';

const bot = new PogChamp();
bot.login();
bot.bindEvents();
bot.bindReminder();
