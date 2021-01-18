import PogChamp from './PogChamp';
import PogChampTwitchBot from './PogChampTwitchBot';
import dotenv from 'dotenv';

dotenv.config();

const bot = new PogChamp();
bot.login();
bot.bindEvents();
bot.bindReminder();
