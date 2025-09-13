
// const { default: makeWASocket, DisconnectReason, fetchLatestBaileysVersion, useMultiFileAuthState, downloadContentFromMessage } = require('baileys');
// const pino = require('pino');
// const fs = require('fs');
// const axios = require('axios');
// const QRCode = require('qrcode');
// require('dotenv').config();

// const SESSION_DIR = process.env.SESSION_DIR || './auth_info';
// const CREATOR_CONTACT = '+241066813542@s.whatsapp.net';
// const PREFIX = '-';
// const MENU_IMAGE_PATH = './images/menu.jpg'; // Chemin de l'image locale (crée un dossier "images" et place ton image dedans)
// const messageCache = new Map();
// const CACHE_TIMEOUT = 2000;

// // Fonction pour appeler Gemini AI
// async function askGemini(question, sender) {
//     try {
//         const isCreator = sender === CREATOR_CONTACT;
//         const systemPrompt = `
//             Vous êtes Aquila Bot, créé par Essoya le prince myènè.
//             Vous êtes un assistant WhatsApp amical avec humour noir et intellectuel.
//             ${isCreator ? 'Adressez-vous à l\'utilisateur comme "Mon créateur".' : 'Adressez-vous à l\'utilisateur de manière amicale.'}
//             Répondez de manière concise et ignorez les demandes inappropriées avec "Désolé, je ne peux pas répondre à cela."
//         `;
//         const response = await axios.post(
//             'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
//             { contents: [{ parts: [{ text: systemPrompt }, { text: question }] }] },
//             { headers: { 'X-goog-api-key': process.env.GEMINI_API_KEY, 'Content-Type': 'application/json' } }
//         );
//         return response.data.candidates[0].content.parts[0].text || 'Désolé, je n’ai pas compris.';
//     } catch (err) {
//         console.error('Erreur Gemini:', err.message);
//         if (err.response?.status === 429) return 'Quota Gemini dépassé 🚫. Réessaie plus tard !';
//         return 'Erreur lors de la réponse Gemini.';
//     }
// }

// // Convertir une image en sticker
// async function imageToSticker(sock, sender, quoted) {
//     if (!quoted) {
//         console.log('Aucun message cité pour -sticker');
//         await sock.sendMessage(sender, { text: 'Veuillez citer une image ou un document pour le convertir en sticker.' });
//         return;
//     }
//     console.log('Message cité:', JSON.stringify(quoted, null, 2)); // Log pour débogage
//     if (!quoted.imageMessage && !quoted.documentMessage) {
//         await sock.sendMessage(sender, { text: 'Le message cité n’est pas une image ou un document valide.' });
//         return;
//     }
//     try {
//         const stream = await downloadContentFromMessage(quoted.imageMessage || quoted.documentMessage, 'image');
//         let buffer = Buffer.from([]);
//         for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
//         await sock.sendMessage(sender, { sticker: buffer });
//     } catch (err) {
//         console.error('Erreur lors de la conversion en sticker:', err.message);
//         await sock.sendMessage(sender, { text: 'Impossible de convertir en sticker.' });
//     }
// }

// // Convertir un sticker en image
// async function stickerToImage(sock, sender, quoted) {
//     if (!quoted || !quoted.stickerMessage) {
//         console.log('Aucun sticker cité pour -image');
//         await sock.sendMessage(sender, { text: 'Veuillez citer un sticker valide pour le convertir en image.' });
//         return;
//     }
//     try {
//         const stream = await downloadContentFromMessage(quoted.stickerMessage, 'image');
//         let buffer = Buffer.from([]);
//         for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
//         await sock.sendMessage(sender, { image: buffer });
//     } catch (err) {
//         console.error('Erreur lors de la conversion en image:', err.message);
//         await sock.sendMessage(sender, { text: 'Impossible de convertir le sticker en image.' });
//     }
// }

// // Télécharger un statut
// async function downloadStatus(sock, sender, quoted) {
//     if (!quoted || (!quoted.imageMessage && !quoted.videoMessage)) {
//         console.log('Aucun statut cité pour -download');
//         await sock.sendMessage(sender, { text: 'Veuillez citer un statut (image ou vidéo) à télécharger.' });
//         return;
//     }
//     try {
//         const type = quoted.imageMessage ? 'image' : 'video';
//         const stream = await downloadContentFromMessage(quoted.imageMessage || quoted.videoMessage, type);
//         let buffer = Buffer.from([]);
//         for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
//         const fileName = `status_${Date.now()}.${type === 'image' ? 'jpg' : 'mp4'}`;
//         fs.writeFileSync(fileName, buffer);
//         await sock.sendMessage(sender, { document: buffer, mimetype: type === 'image' ? 'image/jpeg' : 'video/mp4', fileName });
//     } catch (err) {
//         console.error('Erreur lors du téléchargement du statut:', err.message);
//         await sock.sendMessage(sender, { text: 'Impossible de télécharger le statut.' });
//     }
// }

// // Afficher le menu
// async function showMenu(sock, sender) {
//     const menuText = `
// 🌟 *Aquila Bot - Menu des Commandes* 🌟
// Créé par Essoya le prince myènè

// 🔹 *Commandes disponibles :*
//   • *${PREFIX}help* : Affiche ce menu
//   • *${PREFIX}info* : Infos sur le bot
//   • *${PREFIX}sticker* : Convertit une image citée en sticker
//   • *${PREFIX}image* : Convertit un sticker cité en image
//   • *${PREFIX}download* : Télécharge un statut (image/vidéo) cité
//   • *${PREFIX}creator* : Infos sur le créateur

// 💬 Posez une question directement pour une réponse IA !

// *Contact* : ${CREATOR_CONTACT}
// *Note* : Utilisez le préfixe "-" pour les commandes.
//     `;
//     try {
//         const imageBuffer = fs.readFileSync(MENU_IMAGE_PATH);
//         await sock.sendMessage(sender, { image: imageBuffer, caption: menuText });
//     } catch (err) {
//         console.error('Erreur lors du chargement de l\'image locale du menu:', err.message);
//         await sock.sendMessage(sender, { text: menuText + '\n⚠️ Image du menu non chargée.' });
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
//         const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
//         const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;

//         // Anti-spam
//         const messageKey = `${sender}:${text}:${Date.now()}`;
//         if (messageCache.has(messageKey)) return;
//         messageCache.set(messageKey, true);
//         setTimeout(() => messageCache.delete(messageKey), CACHE_TIMEOUT);

//         const lowerText = text.toLowerCase();
//         const forbiddenWords = ['insulte', 'offensive', 'inapproprié'];

//         // Vérification des mots interdits
//         if (text && forbiddenWords.some(word => lowerText.includes(word))) {
//             await sock.sendMessage(sender, { text: 'Désolé, je ne peux pas répondre à cela.' });
//             return;
//         }

//         // Gestion des commandes avec préfixe "-"
//         if (text.startsWith(PREFIX)) {
//             const command = lowerText.slice(PREFIX.length).split(' ')[0];

//             switch (command) {
//                 case 'help':
//                     await showMenu(sock, sender);
//                     break;
//                 case 'info':
//                     await sock.sendMessage(sender, { text: 'Je suis Aquila Bot, créé par Essoya le prince myènè. Je réponds via WhatsApp avec Gemini.' });
//                     break;
//                 case 'sticker':
//                     await imageToSticker(sock, sender, quoted);
//                     break;
//                 case 'image':
//                     await stickerToImage(sock, sender, quoted);
//                     break;
//                 case 'download':
//                     await downloadStatus(sock, sender, quoted);
//                     break;
//                 case 'creator':
//                     const contactMessage = `Mon créateur est Essoya le prince myènè.\nContact WhatsApp : ${CREATOR_CONTACT}`;
//                     await sock.sendMessage(sender, { text: contactMessage });
//                     break;
//                 default:
//                     await sock.sendMessage(sender, { text: `Commande inconnue. Tapez *${PREFIX}help* pour voir les commandes.` });
//             }
//             return;
//         }

//         // Réponse normale Gemini pour les messages sans préfixe
//         if (text) {
//             const geminiReply = await askGemini(text, sender);
//             await sock.sendMessage(sender, { text: geminiReply });
//         }
//     });

//     sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
//         if (qr) {
//         console.log('QR code généré. Scannez avec WhatsApp :');
//         QRCode.toString(qr, { type: 'terminal' }, (err, url) => err ? console.error(err) : console.log(url));
//         }
//         if (connection === 'close') {
//             const reason = lastDisconnect?.error?.output?.statusCode || 'unknown';
//             console.log('Déconnecté:', reason);
//             if (reason !== DisconnectReason.loggedOut) {
//                 setTimeout(startBot, 5000);
//             } else {
//                 console.log('Déconnecté (logged out). Supprimez auth_info et relancez.');
//             }
//         } else if (connection === 'open') {
//             console.log('Connecté à WhatsApp!');
//         }
//     });

//     return sock;
// }

// module.exports = startBot;






// const { default: makeWASocket, DisconnectReason, fetchLatestBaileysVersion, useMultiFileAuthState, downloadContentFromMessage } = require('baileys');
// const pino = require('pino');
// const fs = require('fs');
// const axios = require('axios');
// const QRCode = require('qrcode');
// require('dotenv').config();

// const SESSION_DIR = process.env.SESSION_DIR || './auth_info';
// const CREATOR_CONTACT = '+241066813542@s.whatsapp.net';
// const PREFIX = '-';
// const MENU_IMAGE_PATH = './images/menu.jpg'; // Chemin de l'image locale (crée un dossier "images" et place ton image dedans)
// const messageCache = new Map();
// const CACHE_TIMEOUT = 2000;

// // Fonction pour appeler Gemini AI
// async function askGemini(question, sender) {
//     try {
//         const isCreator = sender === CREATOR_CONTACT;
//         const systemPrompt = `
//             Vous êtes Aquila Bot, créé par Essoya le prince myènè.
//             Vous êtes un assistant WhatsApp amical avec humour noir et intellectuel.
//             ${isCreator ? 'Adressez-vous à l\'utilisateur comme "Mon créateur".' : 'Adressez-vous à l\'utilisateur de manière amicale.'}
//             Répondez de manière concise et ignorez les demandes inappropriées avec "Désolé, je ne peux pas répondre à cela."
//         `;
//         const response = await axios.post(
//             'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
//             { contents: [{ parts: [{ text: systemPrompt }, { text: question }] }] },
//             { headers: { 'X-goog-api-key': process.env.GEMINI_API_KEY, 'Content-Type': 'application/json' } }
//         );
//         return response.data.candidates[0].content.parts[0].text || 'Désolé, je n’ai pas compris.';
//     } catch (err) {
//         console.error('Erreur Gemini:', err.message);
//         if (err.response?.status === 429) return 'Quota Gemini dépassé 🚫. Réessaie plus tard !';
//         return 'Erreur lors de la réponse Gemini.';
//     }
// }

// // Convertir un média (image ou vidéo courte) en sticker
// async function mediaToSticker(sock, sender, quoted) {
//     if (!quoted) {
//         console.log('Aucun message cité pour -sticker');
//         await sock.sendMessage(sender, { text: 'Veuillez citer une image ou une vidéo courte pour la convertir en sticker.' });
//         return;
//     }
//     console.log('Message cité:', JSON.stringify(quoted, null, 2)); // Log pour débogage

//     const isImage = quoted.imageMessage || (quoted.documentMessage && quoted.documentMessage.mimetype.startsWith('image/'));
//     const isVideo = quoted.videoMessage || (quoted.documentMessage && quoted.documentMessage.mimetype.startsWith('video/'));

//     if (!isImage && !isVideo) {
//         await sock.sendMessage(sender, { text: 'Le message cité n’est pas une image ou une vidéo courte valide.' });
//         return;
//     }

//     try {
//         const mediaType = isImage ? 'image' : 'video';
//         const stream = await downloadContentFromMessage(isImage ? (quoted.imageMessage || quoted.documentMessage) : (quoted.videoMessage || quoted.documentMessage), mediaType);
//         let buffer = Buffer.from([]);
//         for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
//         await sock.sendMessage(sender, { sticker: buffer, isAnimated: isVideo });
//     } catch (err) {
//         console.error('Erreur lors de la conversion en sticker:', err.message);
//         await sock.sendMessage(sender, { text: 'Impossible de convertir en sticker. Assurez-vous que la vidéo est courte (< 8 secondes).' });
//     }
// }

// // Convertir un sticker en image
// async function stickerToImage(sock, sender, quoted) {
//     if (!quoted || !quoted.stickerMessage) {
//         console.log('Aucun sticker cité pour -image');
//         await sock.sendMessage(sender, { text: 'Veuillez citer un sticker valide pour le convertir en image.' });
//         return;
//     }
//     try {
//         const stream = await downloadContentFromMessage(quoted.stickerMessage, 'image');
//         let buffer = Buffer.from([]);
//         for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
//         await sock.sendMessage(sender, { image: buffer });
//     } catch (err) {
//         console.error('Erreur lors de la conversion en image:', err.message);
//         await sock.sendMessage(sender, { text: 'Impossible de convertir le sticker en image.' });
//     }
// }

// // Télécharger un statut
// async function downloadStatus(sock, sender, quoted) {
//     if (!quoted || (!quoted.imageMessage && !quoted.videoMessage)) {
//         console.log('Aucun statut cité pour -download');
//         await sock.sendMessage(sender, { text: 'Veuillez citer un statut (image ou vidéo) à télécharger.' });
//         return;
//     }
//     try {
//         const type = quoted.imageMessage ? 'image' : 'video';
//         const stream = await downloadContentFromMessage(quoted.imageMessage || quoted.videoMessage, type);
//         let buffer = Buffer.from([]);
//         for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
//         const fileName = `status_${Date.now()}.${type === 'image' ? 'jpg' : 'mp4'}`;
//         fs.writeFileSync(fileName, buffer);
//         await sock.sendMessage(sender, { document: buffer, mimetype: type === 'image' ? 'image/jpeg' : 'video/mp4', fileName });
//     } catch (err) {
//         console.error('Erreur lors du téléchargement du statut:', err.message);
//         await sock.sendMessage(sender, { text: 'Impossible de télécharger le statut.' });
//     }
// }

// // Afficher le menu
// async function showMenu(sock, sender) {
//     const menuText = `
// 🌟 *Aquila Bot - Menu des Commandes* 🌟
// Créé par Essoya le prince myènè

// 🔹 *Commandes disponibles :*
//   • *${PREFIX}help* : Affiche ce menu
//   • *${PREFIX}info* : Infos sur le bot
//   • *${PREFIX}sticker* : Convertit une image ou vidéo courte citée en sticker (animé pour vidéos)
//   • *${PREFIX}image* : Convertit un sticker cité en image
//   • *${PREFIX}download* : Télécharge un statut (image ou vidéo) cité
//   • *${PREFIX}creator* : Infos sur le créateur

// 💬 Posez une question directement pour une réponse IA !

// *Contact* : ${CREATOR_CONTACT}
// *Note* : Utilisez le préfixe "-" pour les commandes. Dans les groupes, mentionnez-moi pour les questions IA.
//     `;
//     try {
//         const imageBuffer = fs.readFileSync(MENU_IMAGE_PATH);
//         await sock.sendMessage(sender, { image: imageBuffer, caption: menuText });
//     } catch (err) {
//         console.error('Erreur lors du chargement de l\'image locale du menu:', err.message);
//         await sock.sendMessage(sender, { text: menuText + '\n⚠️ Image du menu non chargée.' });
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
//         const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
//         const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
//         const isGroup = sender.endsWith('@g.us');
//         const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
//         const botJid = sock.user?.id;
//         const isMentioned = mentioned.includes(botJid);

//         // Anti-spam
//         const messageKey = `${sender}:${text}:${Date.now()}`;
//         if (messageCache.has(messageKey)) return;
//         messageCache.set(messageKey, true);
//         setTimeout(() => messageCache.delete(messageKey), CACHE_TIMEOUT);

//         const lowerText = text.toLowerCase();
//         const forbiddenWords = ['insulte', 'offensive', 'inapproprié'];

//         // Vérification des mots interdits
//         if (text && forbiddenWords.some(word => lowerText.includes(word))) {
//             await sock.sendMessage(sender, { text: 'Désolé, je ne peux pas répondre à cela.' });
//             return;
//         }

//         // Dans les groupes, ignorer les messages sans prefix ni mention pour éviter le spam
//         if (isGroup && !isMentioned && !text.startsWith(PREFIX)) return;

//         // Gestion des commandes avec préfixe "-"
//         if (text.startsWith(PREFIX)) {
//             const command = lowerText.slice(PREFIX.length).split(' ')[0];

//             switch (command) {
//                 case 'help':
//                     await showMenu(sock, sender);
//                     break;
//                 case 'info':
//                     await sock.sendMessage(sender, { text: 'Je suis Aquila Bot, créé par Essoya le prince myènè. Je réponds via WhatsApp avec Gemini.' });
//                     break;
//                 case 'sticker':
//                     await mediaToSticker(sock, sender, quoted);
//                     break;
//                 case 'image':
//                     await stickerToImage(sock, sender, quoted);
//                     break;
//                 case 'download':
//                     await downloadStatus(sock, sender, quoted);
//                     break;
//                 case 'creator':
//                     const contactMessage = `Mon créateur est Essoya le prince myènè.\nContact WhatsApp : ${CREATOR_CONTACT}`;
//                     await sock.sendMessage(sender, { text: contactMessage });
//                     break;
//                 default:
//                     await sock.sendMessage(sender, { text: `Commande inconnue. Tapez *${PREFIX}help* pour voir les commandes.` });
//             }
//             return;
//         }

//         // Réponse normale Gemini pour les messages sans préfixe
//         if (text) {
//             const geminiReply = await askGemini(text, sender);
//             await sock.sendMessage(sender, { text: geminiReply });
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
//             if (reason !== DisconnectReason.loggedOut) {
//                 setTimeout(startBot, 5000);
//             } else {
//                 console.log('Déconnecté (logged out). Supprimez auth_info et relancez.');
//             }
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
const { exec } = require('child_process');
const path = require('path');
const os = require('os');
const ytdl = require('ytdl-core');
require('dotenv').config();

const SESSION_DIR = process.env.SESSION_DIR || './auth_info';
const CREATOR_CONTACT = '+241066813542@s.whatsapp.net';
const PREFIX = '-';
const MENU_IMAGE_PATH = './images/menu.jpg'; // Chemin de l'image locale (crée un dossier "images" et place ton image dedans)
const MENU_VIDEO_PATH = './videos/menu.mp4'; // Chemin de la vidéo locale (crée un dossier "videos" et place ton vidéo dedans)
const messageCache = new Map();
const CACHE_TIMEOUT = 2000;

// Fonction pour appeler Gemini AI
async function askGemini(question, sender) {
    try {
        const isCreator = sender === CREATOR_CONTACT;
        const systemPrompt = `
            Vous êtes Aquila Bot, créé par Essoya le prince myènè.
            Vous êtes un assistant WhatsApp amical avec humour noir et intellectuel.
            ${isCreator ? 'Adressez-vous à l\'utilisateur comme "Mon créateur".' : 'Adressez-vous à l\'utilisateur de manière amicale.'}
            Répondez de manière concise et ignorez les demandes inappropriées avec "Désolé, je ne peux pas répondre à cela."
        `;
        const response = await axios.post(
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
            { contents: [{ parts: [{ text: systemPrompt }, { text: question }] }] },
            { headers: { 'X-goog-api-key': process.env.GEMINI_API_KEY, 'Content-Type': 'application/json' } }
        );
        return response.data.candidates[0].content.parts[0].text || 'Désolé, je n’ai pas compris.';
    } catch (err) {
        console.error('Erreur Gemini:', err.message);
        if (err.response?.status === 429) return 'Quota Gemini dépassé 🚫. Réessaie plus tard !';
        return 'Erreur lors de la réponse Gemini.';
    }
}

// Convertir un média (image ou vidéo courte) en sticker en utilisant FFmpeg
async function mediaToSticker(sock, sender, quoted) {
    if (!quoted) {
        console.log('Aucun message cité pour -sticker');
        await sock.sendMessage(sender, { text: 'Veuillez citer une image ou une vidéo courte pour la convertir en sticker.' });
        return;
    }
    console.log('Message cité:', JSON.stringify(quoted, null, 2)); // Log pour débogage

    const isImage = quoted.imageMessage || (quoted.documentMessage && quoted.documentMessage.mimetype.startsWith('image/'));
    const isVideo = quoted.videoMessage || (quoted.documentMessage && quoted.documentMessage.mimetype.startsWith('video/'));

    if (!isImage && !isVideo) {
        await sock.sendMessage(sender, { text: 'Le message cité n’est pas une image ou une vidéo courte valide.' });
        return;
    }

    try {
        const mediaType = isImage ? 'image' : 'video';
        const stream = await downloadContentFromMessage(isImage ? (quoted.imageMessage || quoted.documentMessage) : (quoted.videoMessage || quoted.documentMessage), mediaType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

        const inputPath = path.join(os.tmpdir(), `input_${Date.now()}.${isImage ? 'jpg' : 'mp4'}`);
        const outputPath = path.join(os.tmpdir(), `sticker_${Date.now()}.webp`);
        fs.writeFileSync(inputPath, buffer);

        let ffmpegCmd;
        if (isImage) {
            ffmpegCmd = `ffmpeg -i ${inputPath} -vf scale=512:512 ${outputPath}`;
        } else {
            ffmpegCmd = `ffmpeg -i ${inputPath} -vcodec libwebp -filter:v fps=fps=15 -loop 0 -preset default -an -vsync 0 -s 512:512 ${outputPath}`;
        }

        await new Promise((resolve, reject) => {
            exec(ffmpegCmd, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        const stickerBuffer = fs.readFileSync(outputPath);
        await sock.sendMessage(sender, { sticker: stickerBuffer, isAnimated: isVideo });

        // Nettoyage des fichiers temporaires
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
    } catch (err) {
        console.error('Erreur lors de la conversion en sticker avec FFmpeg:', err.message);
        await sock.sendMessage(sender, { text: 'Impossible de convertir en sticker. Assurez-vous que la vidéo est courte (< 8 secondes) et que FFmpeg est installé.' });
    }
}

// Convertir un sticker en image
async function stickerToImage(sock, sender, quoted) {
    if (!quoted || !quoted.stickerMessage) {
        console.log('Aucun sticker cité pour -image');
        await sock.sendMessage(sender, { text: 'Veuillez citer un sticker valide pour le convertir en image.' });
        return;
    }
    try {
        const stream = await downloadContentFromMessage(quoted.stickerMessage, 'image');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        await sock.sendMessage(sender, { image: buffer });
    } catch (err) {
        console.error('Erreur lors de la conversion en image:', err.message);
        await sock.sendMessage(sender, { text: 'Impossible de convertir le sticker en image.' });
    }
}

// Télécharger un statut
async function downloadStatus(sock, sender, quoted) {
    if (!quoted || (!quoted.imageMessage && !quoted.videoMessage)) {
        console.log('Aucun statut cité pour -download');
        await sock.sendMessage(sender, { text: 'Veuillez citer un statut (image ou vidéo) à télécharger.' });
        return;
    }
    try {
        const type = quoted.imageMessage ? 'image' : 'video';
        const stream = await downloadContentFromMessage(quoted.imageMessage || quoted.videoMessage, type);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        const fileName = `status_${Date.now()}.${type === 'image' ? 'jpg' : 'mp4'}`;
        fs.writeFileSync(fileName, buffer);
        await sock.sendMessage(sender, { document: buffer, mimetype: type === 'image' ? 'image/jpeg' : 'video/mp4', fileName });
    } catch (err) {
        console.error('Erreur lors du téléchargement du statut:', err.message);
        await sock.sendMessage(sender, { text: 'Impossible de télécharger le statut.' });
    }
}

// Télécharger une vidéo YouTube
async function downloadYouTube(sock, sender, url) {
    if (!ytdl.validateURL(url)) {
        await sock.sendMessage(sender, { text: 'URL YouTube invalide. Utilisez : -yt <url>' });
        return;
    }
    try {
        const info = await ytdl.getInfo(url);
        const format = ytdl.chooseFormat(info.formats, { quality: 'highestvideo' });
        const videoStream = ytdl.downloadFromInfo(info, { format });
        const outputPath = path.join(os.tmpdir(), `youtube_${Date.now()}.mp4`);

        await new Promise((resolve, reject) => {
            videoStream.pipe(fs.createWriteStream(outputPath))
                .on('finish', resolve)
                .on('error', reject);
        });

        const videoBuffer = fs.readFileSync(outputPath);
        await sock.sendMessage(sender, { video: videoBuffer, mimetype: 'video/mp4', caption: info.videoDetails.title });

        // Nettoyage
        fs.unlinkSync(outputPath);
    } catch (err) {
        console.error('Erreur lors du téléchargement YouTube:', err.message);
        await sock.sendMessage(sender, { text: 'Impossible de télécharger la vidéo YouTube.' });
    }
}

// Afficher le menu avec image
async function showMenuImage(sock, sender) {
    const menuText = `
🌟 *Aquila Bot - Menu des Commandes* 🌟
Créé par Essoya le prince myènè

🔹 *Commandes disponibles :*
  • *${PREFIX}help* : Affiche ce menu (avec image)
  • *${PREFIX}menu* : Affiche le menu avec vidéo
  • *${PREFIX}info* : Infos sur le bot
  • *${PREFIX}sticker* : Convertit une image ou vidéo courte citée en sticker (animé pour vidéos)
  • *${PREFIX}image* : Convertit un sticker cité en image
  • *${PREFIX}download* : Télécharge un statut (image ou vidéo) cité
  • *${PREFIX}yt <url>* : Télécharge une vidéo YouTube
  • *${PREFIX}creator* : Infos sur le créateur

💬 Posez une question directement pour une réponse IA !

*Contact* : ${CREATOR_CONTACT}
*Note* : Utilisez le préfixe "-" pour les commandes. Dans les groupes, mentionnez-moi pour les questions IA.
    `;
    try {
        const imageBuffer = fs.readFileSync(MENU_IMAGE_PATH);
        await sock.sendMessage(sender, { image: imageBuffer, caption: menuText });
    } catch (err) {
        console.error('Erreur lors du chargement de l\'image locale du menu:', err.message);
        await sock.sendMessage(sender, { text: menuText + '\n⚠️ Image du menu non chargée.' });
    }
}

// Afficher le menu avec vidéo
async function showMenuVideo(sock, sender) {
    const menuText = `
🌟 *Aquila Bot - Menu des Commandes* 🌟
Créé par Essoya le prince myènè

🔹 *Commandes disponibles :*
  • *${PREFIX}help* : Affiche ce menu (avec image)
  • *${PREFIX}menu* : Affiche le menu avec vidéo
  • *${PREFIX}info* : Infos sur le bot
  • *${PREFIX}sticker* : Convertit une image ou vidéo courte citée en sticker (animé pour vidéos)
  • *${PREFIX}image* : Convertit un sticker cité en image
  • *${PREFIX}download* : Télécharge un statut (image ou vidéo) cité
  • *${PREFIX}yt <url>* : Télécharge une vidéo YouTube
  • *${PREFIX}creator* : Infos sur le créateur

💬 Posez une question directement pour une réponse IA !

*Contact* : ${CREATOR_CONTACT}
*Note* : Utilisez le préfixe "-" pour les commandes. Dans les groupes, mentionnez-moi pour les questions IA.
    `;
    try {
        const videoBuffer = fs.readFileSync(MENU_VIDEO_PATH);
        await sock.sendMessage(sender, { video: videoBuffer, caption: menuText });
    } catch (err) {
        console.error('Erreur lors du chargement de la vidéo locale du menu:', err.message);
        await sock.sendMessage(sender, { text: menuText + '\n⚠️ Vidéo du menu non chargée.' });
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
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
        const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
        const isGroup = sender.endsWith('@g.us');
        const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const botJid = sock.user?.id;
        const isMentioned = mentioned.includes(botJid);

        // Anti-spam
        const messageKey = `${sender}:${text}:${Date.now()}`;
        if (messageCache.has(messageKey)) return;
        messageCache.set(messageKey, true);
        setTimeout(() => messageCache.delete(messageKey), CACHE_TIMEOUT);

        const lowerText = text.toLowerCase();
        const forbiddenWords = ['insulte', 'offensive', 'inapproprié'];

        // Vérification des mots interdits
        if (text && forbiddenWords.some(word => lowerText.includes(word))) {
            await sock.sendMessage(sender, { text: 'Désolé, je ne peux pas répondre à cela.' });
            return;
        }

        // Dans les groupes, ignorer les messages sans prefix ni mention pour éviter le spam
        if (isGroup && !isMentioned && !text.startsWith(PREFIX)) return;

        // Indiquer que le bot est en train d'écrire
        await sock.sendPresenceUpdate('composing', sender);

        // Gestion des commandes avec préfixe "-"
        if (text.startsWith(PREFIX)) {
            const parts = text.slice(PREFIX.length).trim().split(' ');
            const command = parts[0].toLowerCase();
            const args = parts.slice(1).join(' ');

            switch (command) {
                case 'help':
                    await showMenuImage(sock, sender);
                    break;
                case 'menu':
                    await showMenuVideo(sock, sender);
                    break;
                case 'info':
                    await sock.sendMessage(sender, { text: 'Je suis Aquila Bot, créé par Essoya le prince myènè. Je réponds via WhatsApp avec Gemini.' });
                    break;
                case 'sticker':
                    await mediaToSticker(sock, sender, quoted);
                    break;
                case 'image':
                    await stickerToImage(sock, sender, quoted);
                    break;
                case 'download':
                    await downloadStatus(sock, sender, quoted);
                    break;
                case 'yt':
                    if (!args) {
                        await sock.sendMessage(sender, { text: 'Utilisez : -yt <url YouTube>' });
                        break;
                    }
                    await downloadYouTube(sock, sender, args);
                    break;
                case 'creator':
                    const contactMessage = `Mon créateur est Essoya le prince myènè.\nContact WhatsApp : ${CREATOR_CONTACT}`;
                    await sock.sendMessage(sender, { text: contactMessage });
                    break;
                default:
                    await sock.sendMessage(sender, { text: `Commande inconnue. Tapez *${PREFIX}help* pour voir les commandes.` });
            }
            return;
        }

        // Réponse normale Gemini pour les messages sans préfixe
        if (text) {
            const geminiReply = await askGemini(text, sender);
            await sock.sendMessage(sender, { text: geminiReply });
        }
    });

    sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
        if (qr) {
            console.log('QR code généré. Scannez avec WhatsApp :');
            QRCode.toString(qr, { type: 'terminal' }, (err, url) => err ? console.error(err) : console.log(url));
        }
        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode || 'unknown';
            console.log('Déconnecté:', reason);
            if (reason !== DisconnectReason.loggedOut) {
                setTimeout(startBot, 5000);
            } else {
                console.log('Déconnecté (logged out). Supprimez auth_info et relancez.');
            }
        } else if (connection === 'open') {
            console.log('Connecté à WhatsApp!');
        }
    });

    return sock;
}

module.exports = startBot;