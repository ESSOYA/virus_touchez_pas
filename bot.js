

// const { default: makeWASocket, DisconnectReason, fetchLatestBaileysVersion, useMultiFileAuthState } = require('baileys');
// const pino = require('pino');
// const fs = require('fs');
// const axios = require('axios');
// const QRCode = require('qrcode');
// require('dotenv').config();

// const SESSION_DIR = process.env.SESSION_DIR || './auth_info';

// // Fonction pour appeler Gemini AI
// async function askGemini(question) {
//     try {
//         const response = await axios.post(
//             'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
//             {
//                 contents: [
//                     {
//                         parts: [
//                             { text: question }
//                         ]
//                     }
//                 ]
//             },
//             {
//                 headers: {
//                     'X-goog-api-key': process.env.GEMINI_API_KEY,
//                     'Content-Type': 'application/json'
//                 }
//             }
//         );
//         return response.data.candidates[0].content.parts[0].text || 'Désolé, je n’ai pas compris.';
//     } catch (err) {
//         console.error('Erreur Gemini:', err.message, 'Détails:', err.response?.data || err);
//         return 'Erreur lors de la réponse Gemini.';
//     }
// }

// async function startBot() {
//     const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
//     const { version } = await fetchLatestBaileysVersion();
//     const sock = makeWASocket({
//         logger: pino({ level: 'silent' }),
//         auth: state,
//         version,
//         browser: ['Aquila Bot', 'Chrome', '1.0.0']
//     });

//     sock.ev.on('creds.update', saveCreds);

//     sock.ev.on('messages.upsert', async ({ messages, type }) => {
//         if (type !== 'notify') return;
//         const msg = messages[0];
//         if (!msg.message || msg.key.fromMe) return;

//         const sender = msg.key.remoteJid;
//         const text = msg.message.conversation || msg.message.extendedTextMessage?.text;

//         if (text) {
//             const reply = await askGemini(text);
//             await sock.sendMessage(sender, { text: reply }, { quoted: msg });
//         }
//     });

//     sock.ev.on('connection.update', async (update) => {
//         const { connection, lastDisconnect, qr } = update;
//         if (qr) {
//             console.log('Nouveau QR code généré. Scannez-le avec WhatsApp :');
//             QRCode.toString(qr, { type: 'terminal' }, (err, url) => {
//                 if (err) console.error('Erreur lors de la génération du QR:', err);
//                 else console.log(url);
//             });
//         }
//         if (connection === 'close') {
//             const reason = lastDisconnect?.error?.output?.statusCode || 'unknown';
//             console.log('Déconnecté:', reason, 'Détails:', JSON.stringify(lastDisconnect, null, 2));
//             if (reason !== DisconnectReason.loggedOut) {
//                 startBot();
//             } else {
//                 console.log('Déconnecté (logged out). Supprimez le dossier auth_info et relancez pour scanner un nouveau QR.');
//             }
//         } else if (connection === 'open') {
//             console.log('Connecté à WhatsApp!');
//         }
//     });

//     return sock;
// }

// module.exports = startBot;






// const { default: makeWASocket, DisconnectReason, fetchLatestBaileysVersion, useMultiFileAuthState } = require('baileys');
// const pino = require('pino');
// const fs = require('fs');
// const axios = require('axios');
// const QRCode = require('qrcode');
// require('dotenv').config();

// const SESSION_DIR = process.env.SESSION_DIR || './auth_info';

// // Fonction pour appeler Gemini AI
// async function askGemini(question, sender) {
//     try {
//         // Définir le numéro du créateur
//         const creatorNumber = 'votre_numéro_whatsapp@s.whatsapp.net'; // Remplacez par votre numéro (par exemple, '1234567890@s.whatsapp.net')
//         const isCreator = sender === creatorNumber;

//         // Contexte système
//         const systemPrompt = `
//             Vous êtes Aquila Bot, une IA créée par Essoya le prince myènè. Vous êtes un assistant WhatsApp amical et utile avec un sens de l'humour noir et intellectuelle.
//             ${isCreator ? 'Adressez-vous à l\'utilisateur comme "Mon créateur".' : 'Adressez-vous à l\'utilisateur de manière amicale avec humour.'}
//             Répondez de manière concise et respectueuse. Ignorez les demandes inappropriées ou nuisibles  et répondez par "Désolé, je ne peux pas répondre à cela." dans ces cas.
//         `;
//         const response = await axios.post(
//             'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
//             {
//                 contents: [
//                     {
//                         parts: [
//                             { text: systemPrompt },
//                             { text: question }
//                         ]
//                     }
//                 ]
//             },
//             {
//                 headers: {
//                     'X-goog-api-key': process.env.GEMINI_API_KEY,
//                     'Content-Type': 'application/json'
//                 }
//             }
//         );
//         return response.data.candidates[0].content.parts[0].text || 'Désolé, je n’ai pas compris.';
//     } catch (err) {
//         console.error('Erreur Gemini:', err.message, 'Détails:', err.response?.data || err);
//         return 'Erreur lors de la réponse Gemini.';
//     }
// }

// async function startBot() {
//     const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
//     const { version } = await fetchLatestBaileysVersion();
//     const sock = makeWASocket({
//         logger: pino({ level: 'silent' }),
//         auth: state,
//         version,
//         browser: ['Aquila Bot', 'Chrome', '1.0.0']
//     });

//     sock.ev.on('creds.update', saveCreds);

//     sock.ev.on('messages.upsert', async ({ messages, type }) => {
//         if (type !== 'notify') return;
//         const msg = messages[0];
//         if (!msg.message || msg.key.fromMe) return;

//         const sender = msg.key.remoteJid;
//         const text = msg.message.conversation || msg.message.extendedTextMessage?.text;

//         // Définir le numéro du créateur
//         const creatorNumber = '+241066813542@s.whatsapp.net'; // Remplacez par votre numéro

//         if (text) {
//             // Liste de mots-clés interdits
//             const forbiddenWords = ['insulte', 'offensive', 'inapproprié'];
//             const lowerText = text.toLowerCase();

//             // Vérifier si le message contient des mots interdits
//             if (forbiddenWords.some(word => lowerText.includes(word))) {
//                 await sock.sendMessage(sender, { text: 'Désolé, je ne peux pas répondre à cela.' }, { quoted: msg });
//                 return;
//             }

//             // Réponses prédéfinies
//             if (text === '!help') {
//                 const helpMessage = 'Voici mes commandes :\n!help - Affiche ce message\n!info - Informations sur le bot';
//                 await sock.sendMessage(sender, { text: helpMessage }, { quoted: msg });
//                 return;
//             }

//             if (text.toLowerCase() === 'bonjour') {
//                 const greeting = sender === creatorNumber ? 'Bonjour, mon créateur !' : 'Bonjour ! Comment puis-je vous aider ?';
//                 await sock.sendMessage(sender, { text: greeting }, { quoted: msg });
//                 return;
//             }

//             if (text === '!info') {
//                 const infoMessage = 'Je suis Aquila Bot, créé par Essoya le prince myènè. Je réponds via WhatsApp en utilisant l\'API Gemini.';
//                 await sock.sendMessage(sender, { text: infoMessage }, { quoted: msg });
//                 return;
//             }

//             const reply = await askGemini(text, sender);
//             await sock.sendMessage(sender, { text: reply }, { quoted: msg });
//         }
//     });

//     sock.ev.on('connection.update', async (update) => {
//         const { connection, lastDisconnect, qr } = update;
//         if (qr) {
//             console.log('Nouveau QR code généré. Scannez-le avec WhatsApp :');
//             QRCode.toString(qr, { type: 'terminal' }, (err, url) => {
//                 if (err) console.error('Erreur lors de la génération du QR:', err);
//                 else console.log(url);
//             });
//         }
//         if (connection === 'close') {
//             const reason = lastDisconnect?.error?.output?.statusCode || 'unknown';
//             console.log('Déconnecté:', reason, 'Détails:', JSON.stringify(lastDisconnect, null, 2));
//             if (reason !== DisconnectReason.loggedOut) {
//                 startBot();
//             } else {
//                 console.log('Déconnecté (logged out). Supprimez le dossier auth_info et relancez pour scanner un nouveau QR.');
//             }
//         } else if (connection === 'open') {
//             console.log('Connecté à WhatsApp!');
//         }
//     });

//     return sock;
// }

// module.exports = startBot;












// // bot.js
// const { default: makeWASocket, DisconnectReason, fetchLatestBaileysVersion, useMultiFileAuthState } = require('baileys');
// const pino = require('pino');
// const fs = require('fs');
// const axios = require('axios');
// const QRCode = require('qrcode');
// require('dotenv').config();

// const SESSION_DIR = process.env.SESSION_DIR || './auth_info';
// const VIDEO_DIR = './videos/ma_musique.mp4'; // chemin de ta vidéo
// const CREATOR_CONTACT = '+241066813542@s.whatsapp.net';
// const CREATOR_LINKS = [
//     'https://decodeur.vercel.app/',
//     'https://alissa-cv.vercel.app/',
//     'https://azeva-frontend.vercel.app/',
//     'https://school-front-chi.vercel.app/',
//     'https://school-front-chi.vercel.app/'
// ];

// let greetedUsers = {}; // pour ne dire "Bonjour" qu'une seule fois
// let lastMessages = {}; // stocke le dernier message de chaque utilisateur

// // Fonction pour appeler Gemini AI
// async function askGemini(question, sender) {
//     try {
//         const isCreator = sender === CREATOR_CONTACT;
//         const lastMessage = lastMessages[sender] || '';
//         const systemPrompt = `
//             Vous êtes Aquila Bot, créé par Essoya le prince myènè.
//             Vous êtes un assistant WhatsApp amical avec humour noir et intellectuel.
//             ${isCreator ? 'Adressez-vous à l\'utilisateur comme "Mon créateur".' : 'Adressez-vous à l\'utilisateur de manière amicale.'}
//             Conservez le contexte du dernier message : "${lastMessage}".
//             Si l'utilisateur parle de musique, répondez "musique" pour que le bot envoie une vidéo.
//             Si l'utilisateur demande qui est votre créateur, proposez les 5 liens : ${CREATOR_LINKS.join(', ')}.
//             Si l'utilisateur parle de l'auteur, renvoyez son contact WhatsApp ${CREATOR_CONTACT}.
//             Ne répétez pas les salutations plusieurs fois.
//             Ignorez les demandes inappropriées et répondez "Désolé, je ne peux pas répondre à cela." si nécessaire.
//         `;
//         const response = await axios.post(
//             'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
//             {
//                 contents: [{ parts: [{ text: systemPrompt }, { text: question }] }]
//             },
//             {
//                 headers: {
//                     'X-goog-api-key': process.env.GEMINI_API_KEY,
//                     'Content-Type': 'application/json'
//                 }
//             }
//         );
//         const answer = response.data.candidates[0].content.parts[0].text || 'Désolé, je n’ai pas compris.';
//         lastMessages[sender] = question; // mettre à jour le dernier message
//         return answer;
//     } catch (err) {
//         console.error('Erreur Gemini:', err.message, 'Détails:', err.response?.data || err);
//         return 'Erreur lors de la réponse Gemini.';
//     }
// }

// async function startBot() {
//     const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
//     const { version } = await fetchLatestBaileysVersion();
//     const sock = makeWASocket({
//         logger: pino({ level: 'silent' }),
//         auth: state,
//         version,
//         browser: ['Aquila Bot', 'Chrome', '1.0.0']
//     });

//     sock.ev.on('creds.update', saveCreds);

//     sock.ev.on('messages.upsert', async ({ messages, type }) => {
//         if (type !== 'notify') return;
//         const msg = messages[0];
//         if (!msg.message || msg.key.fromMe) return;

//         const sender = msg.key.remoteJid;
//         const isGroup = sender.endsWith('@g.us'); // vérifie si c'est un groupe
//         const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
//         if (!text) return;

//         // Dans un groupe, ignorer si pas mentionné
//         if (isGroup) {
//             const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
//             if (!mentions.includes(sock.user.id)) return;
//         }

//         const lowerText = text.toLowerCase();
//         const forbiddenWords = ['insulte', 'offensive', 'inapproprié'];

//         // Vérifier les mots interdits
//         if (forbiddenWords.some(word => lowerText.includes(word))) {
//             await sock.sendMessage(sender, { text: 'Désolé, je ne peux pas répondre à cela.' }, { quoted: msg });
//             return;
//         }

//         // Bonjour une seule fois
//         if (!greetedUsers[sender] && lowerText.includes('bonjour')) {
//             const greeting = sender === CREATOR_CONTACT ? 'Bonjour, mon créateur !' : 'Bonjour !';
//             await sock.sendMessage(sender, { text: greeting }, { quoted: msg });
//             greetedUsers[sender] = true;
//             return;
//         }

//         // Commandes prédéfinies
//         if (text === '!help') {
//             await sock.sendMessage(sender, { text: 'Commandes disponibles:\n!help\n!info' }, { quoted: msg });
//             return;
//         }
//         if (text === '!info') {
//             await sock.sendMessage(sender, { text: 'Je suis Aquila Bot, créé par Essoya le prince myènè. Je réponds via WhatsApp avec Gemini.' }, { quoted: msg });
//             return;
//         }

//         // Détecter musique via Gemini
//         const geminiReply = await askGemini(text, sender);

//         if (geminiReply.toLowerCase().includes('musique')) {
//             if (fs.existsSync(VIDEO_DIR)) {
//                 await sock.sendMessage(sender, { 
//                     video: fs.readFileSync(VIDEO_DIR), 
//                     caption: 'Voici une vidéo musicale pour toi !' 
//                 }, { quoted: msg });
//             } else {
//                 await sock.sendMessage(sender, { text: 'La vidéo musicale est introuvable.' }, { quoted: msg });
//             }
//             return;
//         }

//         // Détecter créateur ou auteur
//         if (lowerText.includes('créateur') || lowerText.includes('auteur')) {
//             const contactMessage = `Mon créateur est Essoya le prince myènè.\nContact WhatsApp : ${CREATOR_CONTACT}\nLiens : ${CREATOR_LINKS.join('\n')}`;
//             await sock.sendMessage(sender, { text: contactMessage }, { quoted: msg });
//             return;
//         }

//         // Sinon, réponse Gemini normale
//         await sock.sendMessage(sender, { text: geminiReply }, { quoted: msg });
//     });

//     sock.ev.on('connection.update', async (update) => {
//         const { connection, lastDisconnect, qr } = update;
//         if (qr) {
//             console.log('Nouveau QR code généré. Scannez-le avec WhatsApp :');
//             QRCode.toString(qr, { type: 'terminal' }, (err, url) => {
//                 if (err) console.error('Erreur QR:', err);
//                 else console.log(url);
//             });
//         }
//         if (connection === 'close') {
//             const reason = lastDisconnect?.error?.output?.statusCode || 'unknown';
//             console.log('Déconnecté:', reason);
//             if (reason !== DisconnectReason.loggedOut) startBot();
//             else console.log('Déconnecté (logged out). Supprimez auth_info et relancez pour scanner un nouveau QR.');
//         } else if (connection === 'open') {
//             console.log('Connecté à WhatsApp!');
//         }
//     });

//     return sock;
// }

// module.exports = startBot;







// // bot.js
// const { default: makeWASocket, DisconnectReason, fetchLatestBaileysVersion, useMultiFileAuthState, jidNormalizedUser, makeWALegacySocket, proto, generateWAMessageFromContent, downloadContentFromMessage } = require('baileys');
// const pino = require('pino');
// const fs = require('fs');
// const axios = require('axios');
// const QRCode = require('qrcode');
// require('dotenv').config();
// const path = require('path');

// const SESSION_DIR = process.env.SESSION_DIR || './auth_info';
// const VIDEO_DIR = './videos/ma_musique.mp4';
// const CREATOR_CONTACT = '+241066813542@s.whatsapp.net';
// const CREATOR_LINKS = [
//     'https://decodeur.vercel.app/',
//     'https://alissa-cv.vercel.app/',
//     'https://azeva-frontend.vercel.app/',
//     'https://school-front-chi.vercel.app/',
//     'https://school-front-chi.vercel.app/'
// ];

// let greetedUsers = {};
// let lastMessages = {};

// // Fonction pour appeler Gemini AI
// async function askGemini(question, sender) {
//     try {
//         const isCreator = sender === CREATOR_CONTACT;
//         const lastMessage = lastMessages[sender] || '';
//         const systemPrompt = `
//             Vous êtes Aquila Bot, créé par Essoya le prince myènè.
//             Vous êtes un assistant WhatsApp amical avec humour noir et intellectuel.
//             ${isCreator ? 'Adressez-vous à l\'utilisateur comme "Mon créateur".' : 'Adressez-vous à l\'utilisateur de manière amicale.'}
//             Conservez le contexte du dernier message : "${lastMessage}".
//             Si l'utilisateur parle de musique, répondez "musique" pour que le bot envoie une vidéo.
//             Si l'utilisateur demande qui est votre créateur, proposez les 5 liens : ${CREATOR_LINKS.join(', ')}.
//             Si l'utilisateur parle de l'auteur, renvoyez son contact WhatsApp ${CREATOR_CONTACT}.
//             Ne répétez pas les salutations plusieurs fois.
//             Ignorez les demandes inappropriées et répondez "Désolé, je ne peux pas répondre à cela." si nécessaire.
//         `;
//         const response = await axios.post(
//             'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
//             { contents: [{ parts: [{ text: systemPrompt }, { text: question }] }] },
//             { headers: { 'X-goog-api-key': process.env.GEMINI_API_KEY, 'Content-Type': 'application/json' } }
//         );
//         const answer = response.data.candidates[0].content.parts[0].text || 'Désolé, je n’ai pas compris.';
//         lastMessages[sender] = question;
//         return answer;
//     } catch (err) {
//         console.error('Erreur Gemini:', err.message, 'Détails:', err.response?.data || err);
//         return 'Erreur lors de la réponse Gemini.';
//     }
// }

// // Convertir une image en sticker
// async function sendSticker(sock, sender, imagePath, quoted) {
//     if (!fs.existsSync(imagePath)) return;
//     const stickerBuffer = fs.readFileSync(imagePath);
//     await sock.sendMessage(sender, { sticker: stickerBuffer }, { quoted });
// }

// // Liker tous les statuts (story)
// async function likeAllStatuses(sock) {
//     const stories = await sock.fetchStatus();
//     for (const story of stories) {
//         const jid = story.key?.fromMe ? sock.user.id : story.key?.remoteJid;
//         try {
//             await sock.sendMessage(jid, { react: { text: '❤️', key: story.key } });
//         } catch (err) {
//             console.error('Impossible de liker le statut:', err);
//         }
//     }
// }

// async function startBot() {
//     const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
//     const { version } = await fetchLatestBaileysVersion();
//     const sock = makeWASocket({
//         logger: pino({ level: 'silent' }),
//         auth: state,
//         version,
//         browser: ['Aquila Bot', 'Chrome', '1.0.0']
//     });

//     sock.ev.on('creds.update', saveCreds);

//     sock.ev.on('messages.upsert', async ({ messages, type }) => {
//         if (type !== 'notify') return;
//         const msg = messages[0];
//         if (!msg.message || msg.key.fromMe) return;

//         const sender = msg.key.remoteJid;
//         const isGroup = sender.endsWith('@g.us');
//         const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
//         if (!text) return;

//         const lowerText = text.toLowerCase();
//         const forbiddenWords = ['insulte', 'offensive', 'inapproprié'];

//         // Dans un groupe, ne répondre que si mentionné
//         if (isGroup) {
//             const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
//             if (!mentions.includes(sock.user.id)) return;
//         }

//         // Vérifier les mots interdits
//         if (forbiddenWords.some(word => lowerText.includes(word))) {
//             await sock.sendMessage(sender, { text: 'Désolé, je ne peux pas répondre à cela.' }, { quoted: msg });
//             return;
//         }

//         // Bonjour une seule fois
//         if (!greetedUsers[sender] && lowerText.includes('bonjour')) {
//             const greeting = sender === CREATOR_CONTACT ? 'Bonjour, mon créateur !' : 'Bonjour !';
//             await sock.sendMessage(sender, { text: greeting }, { quoted: msg });
//             greetedUsers[sender] = true;
//             return;
//         }

//         // Commandes
//         if (text === '!help') {
//             await sock.sendMessage(sender, { text: 'Commandes disponibles:\n!help\n!info\n!sticker\n!like' }, { quoted: msg });
//             return;
//         }
//         if (text === '!info') {
//             await sock.sendMessage(sender, { text: 'Je suis Aquila Bot, créé par Essoya le prince myènè. Je réponds via WhatsApp avec Gemini.' }, { quoted: msg });
//             return;
//         }

//         // Envoyer sticker
//         if (text === '!sticker') {
//             const imagePath = './images/sticker.png'; // Exemple
//             await sendSticker(sock, sender, imagePath, msg);
//             return;
//         }

//         // Liker tous les statuts
//         if (text === '!like') {
//             await likeAllStatuses(sock);
//             await sock.sendMessage(sender, { text: 'Tous les statuts ont été likés !' }, { quoted: msg });
//             return;
//         }

//         // Détecter musique via Gemini
//         const geminiReply = await askGemini(text, sender);
//         if (geminiReply.toLowerCase().includes('musique')) {
//             if (fs.existsSync(VIDEO_DIR)) {
//                 await sock.sendMessage(sender, { 
//                     video: fs.readFileSync(VIDEO_DIR), 
//                     caption: 'Voici une vidéo musicale pour toi !' 
//                 }, { quoted: msg });
//             } else {
//                 await sock.sendMessage(sender, { text: 'La vidéo musicale est introuvable.' }, { quoted: msg });
//             }
//             return;
//         }

//         // Détecter créateur ou auteur
//         if (lowerText.includes('créateur') || lowerText.includes('auteur')) {
//             const contactMessage = `Mon créateur est Essoya le prince myènè.\nContact WhatsApp : ${CREATOR_CONTACT}\nLiens : ${CREATOR_LINKS.join('\n')}`;
//             await sock.sendMessage(sender, { text: contactMessage }, { quoted: msg });
//             return;
//         }

//         // Sinon, réponse Gemini
//         await sock.sendMessage(sender, { text: geminiReply }, { quoted: msg });
//     });

//     sock.ev.on('connection.update', async (update) => {
//         const { connection, lastDisconnect, qr } = update;
//         if (qr) {
//             console.log('Nouveau QR code généré. Scannez-le avec WhatsApp :');
//             QRCode.toString(qr, { type: 'terminal' }, (err, url) => {
//                 if (err) console.error('Erreur QR:', err);
//                 else console.log(url);
//             });
//         }
//         if (connection === 'close') {
//             const reason = lastDisconnect?.error?.output?.statusCode || 'unknown';
//             console.log('Déconnecté:', reason);
//             if (reason !== DisconnectReason.loggedOut) startBot();
//             else console.log('Déconnecté (logged out). Supprimez auth_info et relancez pour scanner un nouveau QR.');
//         } else if (connection === 'open') {
//             console.log('Connecté à WhatsApp!');
//         }
//     });

//     return sock;
// }

// module.exports = startBot;















// // bot.js
// const { default: makeWASocket, DisconnectReason, fetchLatestBaileysVersion, useMultiFileAuthState, downloadContentFromMessage } = require('baileys');
// const pino = require('pino');
// const fs = require('fs');
// const axios = require('axios');
// const QRCode = require('qrcode');
// const path = require('path');
// require('dotenv').config();

// const SESSION_DIR = process.env.SESSION_DIR || './auth_info';
// const VIDEO_DIR = './videos/ma_musique.mp4';
// const CREATOR_CONTACT = '+241066813542@s.whatsapp.net';
// const CREATOR_LINKS = [
//     'https://decodeur.vercel.app/',
//     'https://alissa-cv.vercel.app/',
//     'https://azeva-frontend.vercel.app/',
//     'https://school-front-chi.vercel.app/',
//     'https://school-front-chi.vercel.app/'
// ];

// let greetedUsers = {};
// let lastMessages = {};

// // Appel Gemini AI
// async function askGemini(question, sender) {
//     try {
//         const isCreator = sender === CREATOR_CONTACT;
//         const lastMessage = lastMessages[sender] || '';
//         const systemPrompt = `
//         Vous êtes Aquila Bot, créé par Essoya le prince myènè.
//         Vous êtes un assistant WhatsApp amical avec humour noir et intellectuel.
//         ${isCreator ? 'Adressez-vous à l\'utilisateur comme "Mon créateur".' : 'Adressez-vous à l\'utilisateur de manière amicale.'}
//         Conservez le contexte du dernier message : "${lastMessage}".
//         Si l'utilisateur parle de musique, répondez "musique" pour que le bot envoie une vidéo.
//         Si l'utilisateur demande qui est votre créateur, proposez les 5 liens : ${CREATOR_LINKS.join(', ')}.
//         Si l'utilisateur parle de l'auteur, renvoyez son contact WhatsApp ${CREATOR_CONTACT}.
//         Ne répétez pas les salutations plusieurs fois.
//         Ignorez les demandes inappropriées et répondez "Désolé, je ne peux pas répondre à cela." si nécessaire.
//         `;
//         const response = await axios.post(
//             'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
//             { contents: [{ parts: [{ text: systemPrompt }, { text: question }] }] },
//             { headers: { 'X-goog-api-key': process.env.GEMINI_API_KEY, 'Content-Type': 'application/json' } }
//         );
//         const answer = response.data.candidates[0].content.parts[0].text || 'Désolé, je n’ai pas compris.';
//         lastMessages[sender] = question;
//         return answer;
//     } catch (err) {
//         console.error('Erreur Gemini:', err.message, 'Détails:', err.response?.data || err);
//         return 'Erreur lors de la réponse Gemini.';
//     }
// }

// // Convertir image en sticker
// async function imageToSticker(sock, sender, quoted) {
//     if (!quoted) return;
//     try {
//         const stream = await downloadContentFromMessage(quoted.imageMessage || quoted.documentMessage, 'image');
//         let buffer = Buffer.from([]);
//         for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
//         await sock.sendMessage(sender, { sticker: buffer }, { quoted });
//     } catch (err) {
//         console.error('Erreur !sticker:', err);
//         await sock.sendMessage(sender, { text: 'Impossible de convertir en sticker.' }, { quoted });
//     }
// }

// // Convertir sticker en image
// async function stickerToImage(sock, sender, quoted) {
//     if (!quoted || !quoted.stickerMessage) return;
//     try {
//         const stream = await downloadContentFromMessage(quoted.stickerMessage, 'image');
//         let buffer = Buffer.from([]);
//         for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
//         await sock.sendMessage(sender, { image: buffer }, { quoted });
//     } catch (err) {
//         console.error('Erreur !image:', err);
//         await sock.sendMessage(sender, { text: 'Impossible de convertir le sticker en image.' }, { quoted });
//     }
// }

// // Convertir sticker en vidéo (GIF)
// async function stickerToVideo(sock, sender, quoted) {
//     if (!quoted || !quoted.stickerMessage) return;
//     try {
//         const stream = await downloadContentFromMessage(quoted.stickerMessage, 'video');
//         let buffer = Buffer.from([]);
//         for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
//         await sock.sendMessage(sender, { video: buffer, caption: 'Voici la vidéo du sticker' }, { quoted });
//     } catch (err) {
//         console.error('Erreur !video:', err);
//         await sock.sendMessage(sender, { text: 'Impossible de convertir le sticker en vidéo.' }, { quoted });
//     }
// }

// // Liker tous les statuts
// async function likeAllStatuses(sock) {
//     const stories = await sock.fetchStatus();
//     for (const story of stories) {
//         try {
//             await sock.sendMessage(story.key.remoteJid, { react: { text: '❤️', key: story.key } });
//         } catch (err) {
//             console.error('Impossible de liker le statut:', err);
//         }
//     }
// }

// async function startBot() {
//     const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
//     const { version } = await fetchLatestBaileysVersion();
//     const sock = makeWASocket({
//         logger: pino({ level: 'silent' }),
//         auth: state,
//         version,
//         browser: ['Aquila Bot', 'Chrome', '1.0.0']
//     });

//     sock.ev.on('creds.update', saveCreds);

//     sock.ev.on('messages.upsert', async ({ messages, type }) => {
//         if (type !== 'notify') return;
//         const msg = messages[0];
//         if (!msg.message || msg.key.fromMe) return;

//         const sender = msg.key.remoteJid;
//         const isGroup = sender.endsWith('@g.us');
//         const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
//         const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;

//         if (!text && !quoted) return;

//         const lowerText = text?.toLowerCase() || '';
//         const forbiddenWords = ['insulte', 'offensive', 'inapproprié'];

//         // Vérification mots interdits
//         if (forbiddenWords.some(word => lowerText.includes(word))) {
//             await sock.sendMessage(sender, { text: 'Désolé, je ne peux pas répondre à cela.' }, { quoted: msg });
//             return;
//         }

//         // Bonjour
//         if (!greetedUsers[sender] && lowerText.includes('bonjour')) {
//             const greeting = sender === CREATOR_CONTACT ? 'Bonjour, mon créateur !' : 'Bonjour !';
//             await sock.sendMessage(sender, { text: greeting }, { quoted: msg });
//             greetedUsers[sender] = true;
//             return;
//         }

//         // Commandes
//         if (lowerText === '!help') {
//             await sock.sendMessage(sender, { text: 'Commandes:\n!help\n!info\n!sticker\n!image\n!video\n!like' }, { quoted: msg });
//             return;
//         }

//         if (lowerText === '!info') {
//             await sock.sendMessage(sender, { text: 'Je suis Aquila Bot, créé par Essoya le prince myènè. Je réponds via WhatsApp avec Gemini.' }, { quoted: msg });
//             return;
//         }

//         if (lowerText === '!sticker') {
//             await imageToSticker(sock, sender, quoted);
//             return;
//         }

//         if (lowerText === '!image') {
//             await stickerToImage(sock, sender, quoted);
//             return;
//         }

//         if (lowerText === '!video') {
//             await stickerToVideo(sock, sender, quoted);
//             return;
//         }

//         if (lowerText === '!like') {
//             await likeAllStatuses(sock);
//             await sock.sendMessage(sender, { text: 'Tous les statuts ont été likés !' }, { quoted: msg });
//             return;
//         }

//         // Détecter musique via Gemini
//         if (text) {
//             const geminiReply = await askGemini(text, sender);
//             if (geminiReply.toLowerCase().includes('musique')) {
//                 if (fs.existsSync(VIDEO_DIR)) {
//                     await sock.sendMessage(sender, { video: fs.readFileSync(VIDEO_DIR), caption: 'Voici une vidéo musicale pour toi !' }, { quoted: msg });
//                 } else {
//                     await sock.sendMessage(sender, { text: 'La vidéo musicale est introuvable.' }, { quoted: msg });
//                 }
//                 return;
//             }

//             // Créateur ou auteur
//             if (lowerText.includes('créateur') || lowerText.includes('auteur')) {
//                 const contactMessage = `Mon créateur est Essoya le prince myènè.\nContact WhatsApp : ${CREATOR_CONTACT}\nLiens : ${CREATOR_LINKS.join('\n')}`;
//                 await sock.sendMessage(sender, { text: contactMessage }, { quoted: msg });
//                 return;
//             }

//             // Réponse normale Gemini
//             await sock.sendMessage(sender, { text: geminiReply }, { quoted: msg });
//         }
//     });

//     sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
//         if (qr) {
//             console.log('QR code généré. Scannez avec WhatsApp :');
//             QRCode.toString(qr, { type: 'terminal' }, (err, url) => err ? console.error(err) : console.log(url));
//         }
//         if (connection === 'close') {
//             const reason = lastDisconnect?.error?.output?.statusCode || 'unknown';
//             console.log('Déconnecté:', reason);
//             if (reason !== DisconnectReason.loggedOut) startBot();
//             else console.log('Déconnecté (logged out). Supprimez auth_info et relancez pour scanner un nouveau QR.');
//         } else if (connection === 'open') {
//             console.log('Connecté à WhatsApp!');
//         }
//     });

//     return sock;
// }

// module.exports = startBot;



const { default: makeWASocket, DisconnectReason, fetchLatestBaileysVersion, useMultiFileAuthState, downloadContentFromMessage } = require('baileys');
const pino = require('pino');
const fs = require('fs');
const axios = require('axios');
const QRCode = require('qrcode');
require('dotenv').config();

const SESSION_DIR = process.env.SESSION_DIR || './auth_info';
const CREATOR_CONTACT = '+241066813542@s.whatsapp.net';
const CREATOR_LINKS = [
    'https://decodeur.vercel.app/',
    'https://alissa-cv.vercel.app/',
    'https://azeva-frontend.vercel.app/',
    'https://school-front-chi.vercel.app/',
    'https://school-front-chi.vercel.app/'
];

let greetedUsers = {};
let lastMessages = {};

// Fonction pour appeler Gemini AI
async function askGemini(question, sender) {
    try {
        const isCreator = sender === CREATOR_CONTACT;
        const lastMessage = lastMessages[sender]?.text || '';
        const systemPrompt = `
            Vous êtes Aquila Bot, créé par Essoya le prince myènè.
            Vous êtes un assistant WhatsApp amical avec humour noir et intellectuel.
            ${isCreator ? 'Adressez-vous à l\'utilisateur comme "Mon créateur".' : 'Adressez-vous à l\'utilisateur de manière amicale.'}
            Conservez le contexte du dernier message : "${lastMessage}".
            Ne répétez pas les salutations plusieurs fois.
            Ignorez les demandes inappropriées et répondez "Désolé, je ne peux pas répondre à cela." si nécessaire.
        `;
        const response = await axios.post(
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
            { contents: [{ parts: [{ text: systemPrompt }, { text: question }] }] },
            { headers: { 'X-goog-api-key': process.env.GEMINI_API_KEY, 'Content-Type': 'application/json' } }
        );
        const answer = response.data.candidates[0].content.parts[0].text || 'Désolé, je n’ai pas compris.';
        lastMessages[sender] = { text: question, timestamp: Date.now() };
        return answer;
    } catch (err) {
        console.error('Erreur Gemini:', err.message, 'Détails:', err.response?.data || err);
        if (err.response?.status === 429) {
            return "Quota Gemini dépassé 🚫. Réessaie plus tard !";
        }
        return 'Erreur lors de la réponse Gemini.';
    }
}

// Convertir une image en sticker
async function imageToSticker(sock, sender, quoted) {
    if (!quoted) {
        await sock.sendMessage(sender, { text: 'Veuillez citer une image pour la convertir en sticker.' }, { quoted });
        return;
    }
    try {
        const stream = await downloadContentFromMessage(quoted.imageMessage || quoted.documentMessage, 'image');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        await sock.sendMessage(sender, { sticker: buffer }, { quoted });
    } catch (err) {
        console.error('Erreur !sticker:', err);
        await sock.sendMessage(sender, { text: 'Impossible de convertir en sticker.' }, { quoted });
    }
}

// Convertir un sticker en image
async function stickerToImage(sock, sender, quoted) {
    if (!quoted || !quoted.stickerMessage) {
        await sock.sendMessage(sender, { text: 'Veuillez citer un sticker pour le convertir en image.' }, { quoted });
        return;
    }
    try {
        const stream = await downloadContentFromMessage(quoted.stickerMessage, 'image');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        await sock.sendMessage(sender, { image: buffer }, { quoted });
    } catch (err) {
        console.error('Erreur !image:', err);
        await sock.sendMessage(sender, { text: 'Impossible de convertir le sticker en image.' }, { quoted });
    }
}

// Liker tous les statuts
async function likeAllStatuses(sock) {
    try {
        const stories = await sock.fetchStatus();
        for (const story of stories) {
            try {
                await sock.sendMessage(story.key.remoteJid, { react: { text: '❤️', key: story.key } });
            } catch (err) {
                console.error('Impossible de liker le statut:', err);
            }
        }
    } catch (err) {
        console.error('Erreur lors de la récupération des statuts:', err);
    }
}

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
    const { version } = await fetchLatestBaileysVersion();
    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state,
        version,
        browser: ['Aquila Bot', 'Chrome', '1.0.0']
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const sender = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
        const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;

        if (!text && !quoted) return;

        // Anti-spam : vérifier si le message a déjà été traité
        if (msg._processed) return;
        msg._processed = true;

        // Anti-spam : ignorer les messages répétés dans les 2 secondes
        const lastMessage = lastMessages[sender];
        if (lastMessage && text === lastMessage.text && (Date.now() - lastMessage.timestamp) < 2000) {
            return;
        }

        const lowerText = text ? text.toLowerCase() : '';
        const forbiddenWords = ['insulte', 'offensive', 'inapproprié'];

        // Vérification des mots interdits
        if (text && forbiddenWords.some(word => lowerText.includes(word))) {
            await sock.sendMessage(sender, { text: 'Désolé, je ne peux pas répondre à cela.' }, { quoted: msg });
            return;
        }

        // Bonjour (une seule fois par utilisateur)
        if (text && !greetedUsers[sender] && lowerText.includes('bonjour')) {
            const greeting = sender === CREATOR_CONTACT ? 'Bonjour, mon créateur !' : 'Bonjour !';
            await sock.sendMessage(sender, { text: greeting }, { quoted: msg });
            greetedUsers[sender] = true;
            return;
        }

        // Commandes
        if (text && lowerText === '!help') {
            await sock.sendMessage(sender, { text: 'Commandes:\n!help - Affiche ce message\n!info - Infos sur le bot\n!sticker - Convertir une image en sticker\n!image - Convertir un sticker en image\n!like - Liker tous les statuts' }, { quoted: msg });
            return;
        }

        if (text && lowerText === '!info') {
            await sock.sendMessage(sender, { text: 'Je suis Aquila Bot, créé par Essoya le prince myènè. Je réponds via WhatsApp avec Gemini.' }, { quoted: msg });
            return;
        }

        if (text && lowerText === '!sticker') {
            await imageToSticker(sock, sender, quoted);
            return;
        }

        if (text && lowerText === '!image') {
            await stickerToImage(sock, sender, quoted);
            return;
        }

        if (text && lowerText === '!like') {
            await likeAllStatuses(sock);
            await sock.sendMessage(sender, { text: 'Tous les statuts ont été likés !' }, { quoted: msg });
            return;
        }

        // Créateur ou auteur
        if (text && (lowerText.includes('créateur') || lowerText.includes('auteur'))) {
            const contactMessage = `Mon créateur est Essoya le prince myènè.\nContact WhatsApp : ${CREATOR_CONTACT}\nLiens : ${CREATOR_LINKS.join('\n')}`;
            await sock.sendMessage(sender, { text: contactMessage }, { quoted: msg });
            return;
        }

        // Réponse normale Gemini
        if (text) {
            const geminiReply = await askGemini(text, sender);
            await sock.sendMessage(sender, { text: geminiReply }, { quoted: msg });
        }
    });

    sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
        if (qr) {
            console.log('QR code généré. Scannez avec WhatsApp :');
            QRCode.toString(qr, { type: 'terminal' }, (err, url) => err ? console.error(err) : console.log(url));
        }
        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode || 'unknown';
            console.log('Déconnecté:', reason, 'Détails:', JSON.stringify(lastDisconnect, null, 2));
            if (reason !== DisconnectReason.loggedOut) {
                setTimeout(startBot, 5000); // Attendre 5 secondes avant de relancer
            } else {
                console.log('Déconnecté (logged out). Supprimez auth_info et relancez pour scanner un nouveau QR.');
            }
        } else if (connection === 'open') {
            console.log('Connecté à WhatsApp!');
        }
    });

    return sock;
}

module.exports = startBot;