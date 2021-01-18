import Poggie from './Poggie';
import dotenv from 'dotenv';

// Configure dotenv
dotenv.config();

// Create the new
const poggie = new Poggie();
poggie.login();
poggie.bindEvents();
poggie.bindReminder();
