require('dotenv').config();
const express = require('express');
const startBot = require('./bot');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.get('/', (req, res) => res.send('Bot WhatsApp avec Gemini actif !'));

// Lancer le bot
startBot();

app.listen(port, () => console.log(`Serveur démarré sur http://localhost:${port}`));