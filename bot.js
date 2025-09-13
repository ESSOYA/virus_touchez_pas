
// const { default: makeWASocket, DisconnectReason, fetchLatestBaileysVersion, useMultiFileAuthState, downloadContentFromMessage } = require('baileys');
// const pino = require('pino');
// const fs = require('fs');
// const axios = require('axios');
// const QRCode = require('qrcode');
// const { exec } = require('child_process');
// const path = require('path');
// const os = require('os');
// const ytdl = require('ytdl-core');
// require('dotenv').config();

// const SESSION_DIR = process.env.SESSION_DIR || './auth_info';
// const CREATOR_CONTACT = '+241066813542@s.whatsapp.net';
// const PREFIX = '-';
// const MENU_IMAGE_PATH = './images/menu.jpg'; // Chemin de l'image locale (crée un dossier "images" et place ton image dedans)
// const MENU_VIDEO_PATH = './videos/menu.mp4'; // Chemin de la vidéo locale (crée un dossier "videos" et place ton vidéo dedans)
// const messageCache = new Map();
// const CACHE_TIMEOUT = 2000;

// // Fonction pour appeler Gemini AI, avec support audio
// async function askGemini(question, sender, audioData = null) {
//     try {
//         const isCreator = sender === CREATOR_CONTACT;
//         const systemPrompt = `
//             Vous êtes Aquila Bot, créé par Essoya le prince myènè.
//             Vous êtes un assistant WhatsApp amical avec humour noir et intellectuel.
//             ${isCreator ? 'Adressez-vous à l\'utilisateur comme "Mon créateur".' : 'Adressez-vous à l\'utilisateur de manière amicale.'}
//             Répondez de manière concise et ignorez les demandes inappropriées avec "Désolé, je ne peux pas répondre à cela."
//         `;
//         const parts = [{ text: systemPrompt }];
//         if (audioData) {
//             parts.push({ text: 'Transcrivez l\'audio suivant et répondez à la transcription comme si c\'était la question de l\'utilisateur.' });
//             parts.push({ inline_data: { mime_type: 'audio/ogg', data: audioData.toString('base64') } });
//         } else {
//             parts.push({ text: question });
//         }
//         const response = await axios.post(
//             'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
//             { contents: [{ parts }] },
//             { headers: { 'X-goog-api-key': process.env.GEMINI_API_KEY, 'Content-Type': 'application/json' } }
//         );
//         return response.data.candidates[0].content.parts[0].text || 'Désolé, je n’ai pas compris.';
//     } catch (err) {
//         console.error('Erreur Gemini:', err.message);
//         if (err.response?.status === 429) return 'Quota Gemini dépassé 🚫. Réessaie plus tard !';
//         return 'Erreur lors de la réponse Gemini.';
//     }
// }

// // Fonction pour convertir texte en audio avec Google TTS
// async function textToAudio(text) {
//     try {
//         const response = await axios.post(
//             `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GEMINI_API_KEY}`,
//             {
//                 input: { text },
//                 voice: { languageCode: 'fr-FR', ssmlGender: 'NEUTRAL' },
//                 audioConfig: { audioEncoding: 'OGG_OPUS' }
//             }
//         );
//         return Buffer.from(response.data.audioContent, 'base64');
//     } catch (err) {
//         console.error('Erreur TTS:', err.message);
//         return null;
//     }
// }

// // Convertir un média (image ou vidéo courte) en sticker en utilisant FFmpeg
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

//         const inputPath = path.join(os.tmpdir(), `input_${Date.now()}.${isImage ? 'jpg' : 'mp4'}`);
//         const outputPath = path.join(os.tmpdir(), `sticker_${Date.now()}.webp`);
//         fs.writeFileSync(inputPath, buffer);

//         let ffmpegCmd;
//         if (isImage) {
//             ffmpegCmd = `ffmpeg -i ${inputPath} -vf scale=512:512 ${outputPath}`;
//         } else {
//             ffmpegCmd = `ffmpeg -i ${inputPath} -vcodec libwebp -filter:v fps=fps=15 -loop 0 -preset default -an -vsync 0 -s 512:512 ${outputPath}`;
//         }

//         await new Promise((resolve, reject) => {
//             exec(ffmpegCmd, (err) => {
//                 if (err) reject(err);
//                 else resolve();
//             });
//         });

//         const stickerBuffer = fs.readFileSync(outputPath);
//         await sock.sendMessage(sender, { sticker: stickerBuffer, isAnimated: isVideo });

//         // Nettoyage des fichiers temporaires
//         fs.unlinkSync(inputPath);
//         fs.unlinkSync(outputPath);
//     } catch (err) {
//         console.error('Erreur lors de la conversion en sticker avec FFmpeg:', err.message);
//         await sock.sendMessage(sender, { text: 'Impossible de convertir en sticker. Assurez-vous que la vidéo est courte (< 8 secondes) et que FFmpeg est installé.' });
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

// // Convertir un sticker animé en vidéo
// async function stickerToVideo(sock, sender, quoted) {
//     if (!quoted || !quoted.stickerMessage || !quoted.stickerMessage.isAnimated) {
//         console.log('Aucun sticker animé cité pour -video');
//         await sock.sendMessage(sender, { text: 'Veuillez citer un sticker animé pour le convertir en vidéo.' });
//         return;
//     }
//     try {
//         const stream = await downloadContentFromMessage(quoted.stickerMessage, 'image');
//         let buffer = Buffer.from([]);
//         for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

//         const inputPath = path.join(os.tmpdir(), `sticker_${Date.now()}.webp`);
//         const outputPath = path.join(os.tmpdir(), `video_${Date.now()}.mp4`);
//         fs.writeFileSync(inputPath, buffer);

//         const ffmpegCmd = `ffmpeg -i ${inputPath} -vcodec libx264 -pix_fmt yuv420p ${outputPath}`;

//         await new Promise((resolve, reject) => {
//             exec(ffmpegCmd, (err) => {
//                 if (err) reject(err);
//                 else resolve();
//             });
//         });

//         const videoBuffer = fs.readFileSync(outputPath);
//         await sock.sendMessage(sender, { video: videoBuffer, mimetype: 'video/mp4' });

//         // Nettoyage
//         fs.unlinkSync(inputPath);
//         fs.unlinkSync(outputPath);
//     } catch (err) {
//         console.error('Erreur lors de la conversion en vidéo:', err.message);
//         await sock.sendMessage(sender, { text: 'Impossible de convertir le sticker en vidéo.' });
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

// // Télécharger une vidéo YouTube avec audio
// async function downloadYouTube(sock, sender, url) {
//     if (!ytdl.validateURL(url)) {
//         await sock.sendMessage(sender, { text: 'URL YouTube invalide. Utilisez : -yt <url>' });
//         return;
//     }
//     try {
//         const info = await ytdl.getInfo(url);
//         const videoFormat = ytdl.chooseFormat(info.formats, { filter: 'videoonly', quality: 'highestvideo' });
//         const audioFormat = ytdl.chooseFormat(info.formats, { filter: 'audioonly', quality: 'highestaudio' });

//         const videoPath = path.join(os.tmpdir(), `yt_video_${Date.now()}.mp4`);
//         const audioPath = path.join(os.tmpdir(), `yt_audio_${Date.now()}.m4a`);
//         const outputPath = path.join(os.tmpdir(), `youtube_${Date.now()}.mp4`);

//         await new Promise((resolve, reject) => {
//             ytdl.downloadFromInfo(info, { format: videoFormat })
//                 .pipe(fs.createWriteStream(videoPath))
//                 .on('finish', resolve)
//                 .on('error', reject);
//         });

//         await new Promise((resolve, reject) => {
//             ytdl.downloadFromInfo(info, { format: audioFormat })
//                 .pipe(fs.createWriteStream(audioPath))
//                 .on('finish', resolve)
//                 .on('error', reject);
//         });

//         const ffmpegCmd = `ffmpeg -i ${videoPath} -i ${audioPath} -c copy -map 0:v:0 -map 1:a:0 ${outputPath}`;
//         await new Promise((resolve, reject) => {
//             exec(ffmpegCmd, (err) => {
//                 if (err) reject(err);
//                 else resolve();
//             });
//         });

//         const videoBuffer = fs.readFileSync(outputPath);
//         await sock.sendMessage(sender, { video: videoBuffer, mimetype: 'video/mp4', caption: info.videoDetails.title });

//         // Nettoyage
//         fs.unlinkSync(videoPath);
//         fs.unlinkSync(audioPath);
//         fs.unlinkSync(outputPath);
//     } catch (err) {
//         console.error('Erreur lors du téléchargement YouTube:', err.message);
//         await sock.sendMessage(sender, { text: 'Impossible de télécharger la vidéo YouTube. Assurez-vous que FFmpeg est installé.' });
//     }
// }

// // Afficher le menu avec image
// async function showMenuImage(sock, sender) {
//     const menuText = `
// 🌟 *Aquila Bot - Menu des Commandes* 🌟
// Créé par Essoya le prince myènè

// 🔹 *Commandes disponibles :*
//   • *${PREFIX}help* : Affiche ce menu (avec image)
//   • *${PREFIX}menu* : Affiche le menu avec GIF
//   • *${PREFIX}info* : Infos sur le bot
//   • *${PREFIX}sticker* : Convertit une image ou vidéo courte citée en sticker (animé pour vidéos)
//   • *${PREFIX}image* : Convertit un sticker cité en image
//   • *${PREFIX}video* : Convertit un sticker animé cité en vidéo
//   • *${PREFIX}download* : Télécharge un statut (image ou vidéo) cité
//   • *${PREFIX}yt <url>* : Télécharge une vidéo YouTube
//   • *${PREFIX}creator* : Infos sur le créateur

// 💬 Posez une question directement pour une réponse IA ! (Supporte les notes vocales)

// *Contact* : ${CREATOR_CONTACT}
// *Note* : Utilisez le préfixe "-" pour les commandes. Dans les groupes, mentionnez-moi ou répondez à mes messages pour les questions IA.
//     `;
//     try {
//         const imageBuffer = fs.readFileSync(MENU_IMAGE_PATH);
//         await sock.sendMessage(sender, { image: imageBuffer, caption: menuText });
//     } catch (err) {
//         console.error('Erreur lors du chargement de l\'image locale du menu:', err.message);
//         await sock.sendMessage(sender, { text: menuText + '\n⚠️ Image du menu non chargée.' });
//     }
// }

// // Afficher le menu avec GIF (vidéo envoyée comme GIF pour lecture automatique)
// async function showMenuVideo(sock, sender) {
//     const menuText = `
// 🌟 *Aquila Bot - Menu des Commandes* 🌟
// Créé par Essoya le prince myènè

// 🔹 *Commandes disponibles :*
//   • *${PREFIX}help* : Affiche ce menu (avec image)
//   • *${PREFIX}menu* : Affiche le menu avec GIF
//   • *${PREFIX}info* : Infos sur le bot
//   • *${PREFIX}sticker* : Convertit une image ou vidéo courte citée en sticker (animé pour vidéos)
//   • *${PREFIX}image* : Convertit un sticker cité en image
//   • *${PREFIX}video* : Convertit un sticker animé cité en vidéo
//   • *${PREFIX}download* : Télécharge un statut (image ou vidéo) cité
//   • *${PREFIX}yt <url>* : Télécharge une vidéo YouTube
//   • *${PREFIX}creator* : Infos sur le créateur

// 💬 Posez une question directement pour une réponse IA ! (Supporte les notes vocales)

// *Contact* : ${CREATOR_CONTACT}
// *Note* : Utilisez le préfixe "-" pour les commandes. Dans les groupes, mentionnez-moi ou répondez à mes messages pour les questions IA.
//     `;
//     try {
//         const videoBuffer = fs.readFileSync(MENU_VIDEO_PATH);
//         await sock.sendMessage(sender, { video: videoBuffer, gifPlayback: true, caption: menuText });
//     } catch (err) {
//         console.error('Erreur lors du chargement du GIF local du menu:', err.message);
//         await sock.sendMessage(sender, { text: menuText + '\n⚠️ GIF du menu non chargé.' });
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
//         const isQuotedBot = msg.message.extendedTextMessage?.contextInfo?.participant === botJid;
//         const contextInfo = msg.message.audioMessage?.contextInfo || msg.message.extendedTextMessage?.contextInfo;
//         const isAudioQuotedBot = contextInfo?.participant === botJid;
//         const isAudioMentioned = contextInfo?.mentionedJid?.includes(botJid) || false;

//         // Anti-spam (pour messages texte seulement)
//         if (text) {
//             const messageKey = `${sender}:${text}:${Date.now()}`;
//             if (messageCache.has(messageKey)) return;
//             messageCache.set(messageKey, true);
//             setTimeout(() => messageCache.delete(messageKey), CACHE_TIMEOUT);
//         }

//         const lowerText = text.toLowerCase();
//         const forbiddenWords = ['insulte', 'offensive', 'inapproprié'];

//         // Vérification des mots interdits pour texte
//         if (text && forbiddenWords.some(word => lowerText.includes(word))) {
//             await sock.sendMessage(sender, { text: 'Désolé, je ne peux pas répondre à cela.' });
//             return;
//         }

//         // Dans les groupes, ignorer si pas mentionné, pas préfixé, et pas réponse au bot
//         if (isGroup && !isMentioned && !text.startsWith(PREFIX) && !isQuotedBot && !msg.message.audioMessage) return;
//         if (isGroup && msg.message.audioMessage && !isAudioMentioned && !isAudioQuotedBot) return;

//         // Indiquer que le bot est en train d'écrire ou d'enregistrer
//         if (msg.message.audioMessage) {
//             await sock.sendPresenceUpdate('recording', sender);
//         } else {
//             await sock.sendPresenceUpdate('composing', sender);
//         }

//         // Gestion des notes vocales
//         if (msg.message.audioMessage && msg.message.audioMessage.ptt) {
//             try {
//                 const stream = await downloadContentFromMessage(msg.message.audioMessage, 'audio');
//                 let buffer = Buffer.from([]);
//                 for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

//                 const geminiReply = await askGemini(null, sender, buffer);

//                 // Vérification des mots interdits dans la réponse (ou transcription implicite)
//                 if (forbiddenWords.some(word => geminiReply.toLowerCase().includes(word))) {
//                     await sock.sendMessage(sender, { text: 'Désolé, je ne peux pas répondre à cela.' });
//                     return;
//                 }

//                 const audioBuffer = await textToAudio(geminiReply);
//                 if (audioBuffer) {
//                     await sock.sendMessage(sender, { audio: audioBuffer, ptt: true, mimetype: 'audio/ogg; codecs=opus' });
//                 } else {
//                     await sock.sendMessage(sender, { text: geminiReply }); // Fallback texte
//                 }
//             } catch (err) {
//                 console.error('Erreur lors du traitement de la note vocale:', err.message);
//                 await sock.sendMessage(sender, { text: 'Erreur lors du traitement de la note vocale.' });
//             }
//             return;
//         }

//         // Gestion des commandes avec préfixe "-"
//         if (text.startsWith(PREFIX)) {
//             const parts = text.slice(PREFIX.length).trim().split(' ');
//             const command = parts[0].toLowerCase();
//             const args = parts.slice(1).join(' ');

//             switch (command) {
//                 case 'help':
//                     await showMenuImage(sock, sender);
//                     break;
//                 case 'menu':
//                     await showMenuVideo(sock, sender);
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
//                 case 'video':
//                     await stickerToVideo(sock, sender, quoted);
//                     break;
//                 case 'download':
//                     await downloadStatus(sock, sender, quoted);
//                     break;
//                 case 'yt':
//                     if (!args) {
//                         await sock.sendMessage(sender, { text: 'Utilisez : -yt <url YouTube>' });
//                         break;
//                     }
//                     await downloadYouTube(sock, sender, args);
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

//         // Réponse normale Gemini pour les messages texte sans préfixe
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















// const { default: makeWASocket, DisconnectReason, fetchLatestBaileysVersion, useMultiFileAuthState, downloadContentFromMessage } = require('baileys');
// const pino = require('pino');
// const fs = require('fs');
// const axios = require('axios');
// const QRCode = require('qrcode');
// const { exec } = require('child_process');
// const path = require('path');
// const os = require('os');
// const ytdl = require('ytdl-core');
// require('dotenv').config();

// const SESSION_DIR = process.env.SESSION_DIR || './auth_info';
// const CREATOR_CONTACT = '+241066813542@s.whatsapp.net';
// const PREFIX = '-';
// const MENU_IMAGE_PATH = './images/menu.jpg'; // Chemin de l'image locale
// const MENU_VIDEO_PATH = './videos/menu.mp4'; // Chemin de la vidéo locale (sera envoyée comme GIF)
// const messageCache = new Map();
// const CACHE_TIMEOUT = 2000;

// // Fonction pour appeler Gemini AI, avec support audio
// async function askGemini(question, sender, audioData = null) {
//     try {
//         const isCreator = sender === CREATOR_CONTACT;
//         const systemPrompt = `
//             Vous êtes Aquila Bot, créé par Essoya le prince myènè.
//             Vous êtes un assistant WhatsApp amical avec humour noir et intellectuel.
//             ${isCreator ? 'Adressez-vous à l\'utilisateur comme "Mon créateur".' : 'Adressez-vous à l\'utilisateur de manière amicale.'}
//             Répondez de manière concise, sans dire "bonjour" ou salutations similaires à moins que ce ne soit explicitement demandé.
//             Ignorez les demandes inappropriées avec "Désolé, je ne peux pas répondre à cela."
//         `;
//         const parts = [{ text: systemPrompt }];
//         if (audioData) {
//             parts.push({ text: 'Transcrivez l\'audio suivant et répondez à la transcription comme si c\'était la question de l\'utilisateur.' });
//             parts.push({ inline_data: { mime_type: 'audio/ogg', data: audioData.toString('base64') } });
//         } else {
//             parts.push({ text: question });
//         }
//         const response = await axios.post(
//             'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
//             { contents: [{ parts }] },
//             { headers: { 'X-goog-api-key': process.env.GEMINI_API_KEY, 'Content-Type': 'application/json' } }
//         );
//         return response.data.candidates[0].content.parts[0].text || 'Désolé, je n’ai pas compris.';
//     } catch (err) {
//         console.error('Erreur Gemini:', err.message);
//         if (err.response?.status === 429) return 'Quota Gemini dépassé 🚫. Réessaie plus tard !';
//         return 'Erreur lors de la réponse Gemini.';
//     }
// }

// // Fonction pour convertir texte en audio avec Google TTS
// async function textToAudio(text) {
//     try {
//         const response = await axios.post(
//             `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GEMINI_API_KEY}`,
//             {
//                 input: { text },
//                 voice: { languageCode: 'fr-FR', ssmlGender: 'NEUTRAL' },
//                 audioConfig: { audioEncoding: 'OGG_OPUS' }
//             }
//         );
//         return Buffer.from(response.data.audioContent, 'base64');
//     } catch (err) {
//         console.error('Erreur TTS:', err.message);
//         return null;
//     }
// }

// // Convertir un média (image ou vidéo courte) en sticker avec FFmpeg
// async function mediaToSticker(sock, sender, quoted) {
//     if (!quoted) {
//         console.log('Aucun message cité pour -sticker');
//         await sock.sendMessage(sender, { text: 'Veuillez citer une image ou une vidéo courte pour la convertir en sticker.' });
//         return;
//     }
//     console.log('Message cité:', JSON.stringify(quoted, null, 2));

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

//         const inputPath = path.join(os.tmpdir(), `input_${Date.now()}.${isImage ? 'jpg' : 'mp4'}`);
//         const outputPath = path.join(os.tmpdir(), `sticker_${Date.now()}.webp`);
//         fs.writeFileSync(inputPath, buffer);

//         let ffmpegCmd;
//         if (isImage) {
//             ffmpegCmd = `ffmpeg -i ${inputPath} -vf scale=512:512 ${outputPath}`;
//         } else {
//             ffmpegCmd = `ffmpeg -i ${inputPath} -vcodec libwebp -filter:v fps=fps=15 -loop 0 -preset default -an -vsync 0 -s 512:512 ${outputPath}`;
//         }

//         await new Promise((resolve, reject) => {
//             exec(ffmpegCmd, (err) => {
//                 if (err) reject(err);
//                 else resolve();
//             });
//         });

//         const stickerBuffer = fs.readFileSync(outputPath);
//         await sock.sendMessage(sender, { sticker: stickerBuffer, isAnimated: isVideo });

//         // Nettoyage
//         fs.unlinkSync(inputPath);
//         fs.unlinkSync(outputPath);
//     } catch (err) {
//         console.error('Erreur lors de la conversion en sticker:', err.message);
//         await sock.sendMessage(sender, { text: 'Impossible de convertir en sticker. Assurez-vous que la vidéo est courte (< 8 secondes) et que FFmpeg est installé.' });
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

// // Convertir un sticker animé en vidéo
// async function stickerToVideo(sock, sender, quoted) {
//     if (!quoted || !quoted.stickerMessage || !quoted.stickerMessage.isAnimated) {
//         console.log('Aucun sticker animé cité pour -video');
//         await sock.sendMessage(sender, { text: 'Veuillez citer un sticker animé pour le convertir en vidéo.' });
//         return;
//     }
//     try {
//         const stream = await downloadContentFromMessage(quoted.stickerMessage, 'image');
//         let buffer = Buffer.from([]);
//         for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

//         const inputPath = path.join(os.tmpdir(), `sticker_${Date.now()}.webp`);
//         const outputPath = path.join(os.tmpdir(), `video_${Date.now()}.mp4`);
//         fs.writeFileSync(inputPath, buffer);

//         const ffmpegCmd = `ffmpeg -i ${inputPath} -vcodec libx264 -pix_fmt yuv420p ${outputPath}`;

//         await new Promise((resolve, reject) => {
//             exec(ffmpegCmd, (err) => {
//                 if (err) reject(err);
//                 else resolve();
//             });
//         });

//         const videoBuffer = fs.readFileSync(outputPath);
//         await sock.sendMessage(sender, { video: videoBuffer, mimetype: 'video/mp4' });

//         // Nettoyage
//         fs.unlinkSync(inputPath);
//         fs.unlinkSync(outputPath);
//     } catch (err) {
//         console.error('Erreur lors de la conversion en vidéo:', err.message);
//         await sock.sendMessage(sender, { text: 'Impossible de convertir le sticker en vidéo.' });
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

// // Télécharger une vidéo YouTube avec audio
// async function downloadYouTube(sock, sender, url) {
//     if (!ytdl.validateURL(url)) {
//         await sock.sendMessage(sender, { text: 'URL YouTube invalide. Utilisez : -yt <url>' });
//         return;
//     }
//     try {
//         const info = await ytdl.getInfo(url);
//         const videoFormat = ytdl.chooseFormat(info.formats, { filter: 'videoonly', quality: 'highestvideo' });
//         const audioFormat = ytdl.chooseFormat(info.formats, { filter: 'audioonly', quality: 'highestaudio' });

//         const videoPath = path.join(os.tmpdir(), `yt_video_${Date.now()}.mp4`);
//         const audioPath = path.join(os.tmpdir(), `yt_audio_${Date.now()}.m4a`);
//         const outputPath = path.join(os.tmpdir(), `youtube_${Date.now()}.mp4`);

//         await new Promise((resolve, reject) => {
//             ytdl.downloadFromInfo(info, { format: videoFormat })
//                 .pipe(fs.createWriteStream(videoPath))
//                 .on('finish', resolve)
//                 .on('error', reject);
//         });

//         await new Promise((resolve, reject) => {
//             ytdl.downloadFromInfo(info, { format: audioFormat })
//                 .pipe(fs.createWriteStream(audioPath))
//                 .on('finish', resolve)
//                 .on('error', reject);
//         });

//         const ffmpegCmd = `ffmpeg -i ${videoPath} -i ${audioPath} -c copy -map 0:v:0 -map 1:a:0 ${outputPath}`;
//         await new Promise((resolve, reject) => {
//             exec(ffmpegCmd, (err) => {
//                 if (err) reject(err);
//                 else resolve();
//             });
//         });

//         const videoBuffer = fs.readFileSync(outputPath);
//         await sock.sendMessage(sender, { video: videoBuffer, mimetype: 'video/mp4', caption: info.videoDetails.title });

//         // Nettoyage
//         fs.unlinkSync(videoPath);
//         fs.unlinkSync(audioPath);
//         fs.unlinkSync(outputPath);
//     } catch (err) {
//         console.error('Erreur lors du téléchargement YouTube:', err.message);
//         await sock.sendMessage(sender, { text: 'Impossible de télécharger la vidéo YouTube. Assurez-vous que FFmpeg est installé.' });
//     }
// }

// // Partager le contact du créateur
// async function shareCreatorContact(sock, sender) {
//     try {
//         const vcard = `BEGIN:VCARD
// VERSION:3.0
// FN:Essoya le prince myènè
// TEL;TYPE=CELL:+241066813542
// END:VCARD`;
//         await sock.sendMessage(sender, {
//             contacts: {
//                 displayName: 'Essoya le prince myènè',
//                 contacts: [{ vcard }]
//             }
//         });
//     } catch (err) {
//         console.error('Erreur lors du partage du contact:', err.message);
//         await sock.sendMessage(sender, { text: 'Erreur lors du partage du contact.' });
//     }
// }

// // Afficher le menu avec image
// async function showMenuImage(sock, sender) {
//     const menuText = `
// 🌟 *Aquila Bot - Menu des Commandes* 🌟
// Créé par Essoya le prince myènè

// 🔹 *Commandes disponibles :*
//   • *${PREFIX}help* : Affiche ce menu (avec image)
//   • *${PREFIX}menu* : Affiche le menu avec GIF
//   • *${PREFIX}info* : Infos sur le bot
//   • *${PREFIX}sticker* : Convertit une image ou vidéo courte citée en sticker (animé pour vidéos)
//   • *${PREFIX}image* : Convertit un sticker cité en image
//   • *${PREFIX}video* : Convertit un sticker animé cité en vidéo
//   • *${PREFIX}download* : Télécharge un statut (image ou vidéo) cité
//   • *${PREFIX}yt <url>* : Télécharge une vidéo YouTube
//   • *${PREFIX}creator* : Partage le contact du créateur

// 💬 Posez une question directement pour une réponse IA ! (Supporte les notes vocales)

// *Contact* : ${CREATOR_CONTACT}
// *Note* : Utilisez le préfixe "-" pour les commandes. Dans les groupes, mentionnez-moi (@AquilaBot) ou répondez à mes messages pour les questions IA.
//     `;
//     try {
//         const imageBuffer = fs.readFileSync(MENU_IMAGE_PATH);
//         await sock.sendMessage(sender, { image: imageBuffer, caption: menuText });
//     } catch (err) {
//         console.error('Erreur lors du chargement de l\'image locale du menu:', err.message);
//         await sock.sendMessage(sender, { text: menuText + '\n⚠️ Image du menu non chargée.' });
//     }
// }

// // Afficher le menu avec GIF
// async function showMenuVideo(sock, sender) {
//     const menuText = `
// 🌟 *Aquila Bot - Menu des Commandes* 🌟
// Créé par Essoya le prince myènè

// 🔹 *Commandes disponibles :*
//   • *${PREFIX}help* : Affiche ce menu (avec image)
//   • *${PREFIX}menu* : Affiche le menu avec GIF
//   • *${PREFIX}info* : Infos sur le bot
//   • *${PREFIX}sticker* : Convertit une image ou vidéo courte citée en sticker (animé pour vidéos)
//   • *${PREFIX}image* : Convertit un sticker cité en image
//   • *${PREFIX}video* : Convertit un sticker animé cité en vidéo
//   • *${PREFIX}download* : Télécharge un statut (image ou vidéo) cité
//   • *${PREFIX}yt <url>* : Télécharge une vidéo YouTube
//   • *${PREFIX}creator* : Partage le contact du créateur

// 💬 Posez une question directement pour une réponse IA ! (Supporte les notes vocales)

// *Contact* : ${CREATOR_CONTACT}
// *Note* : Utilisez le préfixe "-" pour les commandes. Dans les groupes, mentionnez-moi (@AquilaBot) ou répondez à mes messages pour les questions IA.
//     `;
//     try {
//         const videoBuffer = fs.readFileSync(MENU_VIDEO_PATH);
//         await sock.sendMessage(sender, { video: videoBuffer, gifPlayback: true, caption: menuText });
//     } catch (err) {
//         console.error('Erreur lors du chargement du GIF local du menu:', err.message);
//         await sock.sendMessage(sender, { text: menuText + '\n⚠️ GIF du menu non chargé.' });
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
//         const isQuotedBot = msg.message.extendedTextMessage?.contextInfo?.participant === botJid;
//         const contextInfo = msg.message.audioMessage?.contextInfo || msg.message.extendedTextMessage?.contextInfo;
//         const isAudioQuotedBot = contextInfo?.participant === botJid;
//         const isAudioMentioned = contextInfo?.mentionedJid?.includes(botJid) || false;

//         // Anti-spam pour messages texte
//         if (text) {
//             const messageKey = `${sender}:${text}:${Date.now()}`;
//             if (messageCache.has(messageKey)) return;
//             messageCache.set(messageKey, true);
//             setTimeout(() => messageCache.delete(messageKey), CACHE_TIMEOUT);
//         }

//         const lowerText = text.toLowerCase();
//         const forbiddenWords = ['insulte', 'offensive', 'inapproprié'];

//         // Vérification des mots interdits pour texte
//         if (text && forbiddenWords.some(word => lowerText.includes(word))) {
//             await sock.sendMessage(sender, { text: 'Désolé, je ne peux pas répondre à cela.' });
//             return;
//         }

//         // Dans les groupes, répondre si mentionné, réponse au bot, ou commande avec préfixe
//         if (isGroup && !isMentioned && !isQuotedBot && !text.startsWith(PREFIX) && !msg.message.audioMessage) return;
//         if (isGroup && msg.message.audioMessage && !isAudioMentioned && !isAudioQuotedBot) return;

//         // Indiquer que le bot est en train d'écrire ou d'enregistrer
//         if (msg.message.audioMessage) {
//             await sock.sendPresenceUpdate('recording', sender);
//         } else {
//             await sock.sendPresenceUpdate('composing', sender);
//         }

//         // Gestion des notes vocales
//         if (msg.message.audioMessage && msg.message.audioMessage.ptt) {
//             try {
//                 const stream = await downloadContentFromMessage(msg.message.audioMessage, 'audio');
//                 let buffer = Buffer.from([]);
//                 for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

//                 const geminiReply = await askGemini(null, sender, buffer);

//                 // Vérification des mots interdits dans la réponse
//                 if (forbiddenWords.some(word => geminiReply.toLowerCase().includes(word))) {
//                     await sock.sendMessage(sender, { text: 'Désolé, je ne peux pas répondre à cela.' });
//                     return;
//                 }

//                 const audioBuffer = await textToAudio(geminiReply);
//                 if (audioBuffer) {
//                     await sock.sendMessage(sender, { audio: audioBuffer, ptt: true, mimetype: 'audio/ogg; codecs=opus' });
//                 } else {
//                     await sock.sendMessage(sender, { text: geminiReply });
//                 }
//             } catch (err) {
//                 console.error('Erreur lors du traitement de la note vocale:', err.message);
//                 await sock.sendMessage(sender, { text: 'Erreur lors du traitement de la note vocale.' });
//             }
//             return;
//         }

//         // Gestion des commandes avec préfixe "-"
//         if (text.startsWith(PREFIX)) {
//             const parts = text.slice(PREFIX.length).trim().split(' ');
//             const command = parts[0].toLowerCase();
//             const args = parts.slice(1).join(' ');

//             switch (command) {
//                 case 'help':
//                     await showMenuImage(sock, sender);
//                     break;
//                 case 'menu':
//                     await showMenuVideo(sock, sender);
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
//                 case 'video':
//                     await stickerToVideo(sock, sender, quoted);
//                     break;
//                 case 'download':
//                     await downloadStatus(sock, sender, quoted);
//                     break;
//                 case 'yt':
//                     if (!args) {
//                         await sock.sendMessage(sender, { text: 'Utilisez : -yt <url YouTube>' });
//                         break;
//                     }
//                     await downloadYouTube(sock, sender, args);
//                     break;
//                 case 'creator':
//                     await shareCreatorContact(sock, sender);
//                     break;
//                 default:
//                     await sock.sendMessage(sender, { text: `Commande inconnue. Tapez *${PREFIX}help* pour voir les commandes.` });
//             }
//             return;
//         }

//         // Réponse normale Gemini pour les messages texte sans préfixe
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








// const { default: makeWASocket, DisconnectReason, fetchLatestBaileysVersion, useMultiFileAuthState, downloadContentFromMessage } = require('baileys');
// const pino = require('pino');
// const fs = require('fs');
// const axios = require('axios');
// const QRCode = require('qrcode');
// const { exec } = require('child_process');
// const path = require('path');
// const os = require('os');
// const ytdl = require('ytdl-core');
// require('dotenv').config();

// const SESSION_DIR = process.env.SESSION_DIR || './auth_info';
// const CREATOR_CONTACT = '+241066813542@s.whatsapp.net';
// const PREFIX = '-';
// const MENU_IMAGE_PATH = './images/menu.jpg';
// const MENU_VIDEO_PATH = './videos/menu.mp4';
// const messageCache = new Set(); // Changé en Set pour une gestion plus simple
// const CACHE_TIMEOUT = 5000;

// // Fonction pour appeler Gemini AI, avec support audio
// async function askGemini(question, sender, audioData = null) {
//     try {
//         const isCreator = sender === CREATOR_CONTACT;
//         const systemPrompt = `
//             Vous êtes Aquila Bot, créé par Essoya le prince myènè.
//             Vous êtes un assistant WhatsApp amical avec humour noir et intellectuel.
//             ${isCreator ? 'Adressez-vous à l\'utilisateur comme "Mon créateur".' : 'Adressez-vous à l\'utilisateur de manière amicale.'}
//             Répondez de manière concise, sans dire "bonjour" ou salutations similaires à moins que ce ne soit explicitement demandé.
//             Ignorez les demandes inappropriées avec "Désolé, je ne peux pas répondre à cela."
//         `;
//         const parts = [{ text: systemPrompt }];
//         if (audioData) {
//             parts.push({ text: 'Transcrivez l\'audio suivant et répondez à la transcription comme si c\'était la question de l\'utilisateur.' });
//             parts.push({ inline_data: { mime_type: 'audio/ogg', data: audioData.toString('base64') } });
//         } else {
//             parts.push({ text: question });
//         }
//         const response = await axios.post(
//             'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
//             { contents: [{ parts }] },
//             { headers: { 'X-goog-api-key': process.env.GEMINI_API_KEY, 'Content-Type': 'application/json' } }
//         );
//         return response.data.candidates[0].content.parts[0].text || 'Désolé, je n’ai pas compris.';
//     } catch (err) {
//         console.error('Erreur Gemini:', err.message);
//         if (err.response?.status === 429) return 'Quota Gemini dépassé 🚫. Réessaie plus tard !';
//         return 'Erreur lors de la réponse Gemini.';
//     }
// }

// // Fonction pour convertir texte en audio avec Google TTS
// async function textToAudio(text) {
//     try {
//         const response = await axios.post(
//             `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GEMINI_API_KEY}`,
//             {
//                 input: { text },
//                 voice: { languageCode: 'fr-FR', ssmlGender: 'NEUTRAL' },
//                 audioConfig: { audioEncoding: 'OGG_OPUS' }
//             }
//         );
//         return Buffer.from(response.data.audioContent, 'base64');
//     } catch (err) {
//         console.error('Erreur TTS:', err.message);
//         return null;
//     }
// }

// // Convertir un média (image ou vidéo courte) en sticker avec FFmpeg
// async function mediaToSticker(sock, sender, quoted) {
//     if (!quoted) {
//         console.log('Aucun message cité pour -sticker');
//         await sock.sendMessage(sender, { text: 'Veuillez citer une image ou une vidéo courte pour la convertir en sticker.' });
//         return;
//     }
//     console.log('Message cité:', JSON.stringify(quoted, null, 2));

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

//         const inputPath = path.join(os.tmpdir(), `input_${Date.now()}.${isImage ? 'jpg' : 'mp4'}`);
//         const outputPath = path.join(os.tmpdir(), `sticker_${Date.now()}.webp`);
//         fs.writeFileSync(inputPath, buffer);

//         let ffmpegCmd;
//         if (isImage) {
//             ffmpegCmd = `ffmpeg -i ${inputPath} -vf scale=512:512 ${outputPath}`;
//         } else {
//             ffmpegCmd = `ffmpeg -i ${inputPath} -vcodec libwebp -filter:v fps=fps=15 -loop 0 -preset default -an -vsync 0 -s 512:512 ${outputPath}`;
//         }

//         await new Promise((resolve, reject) => {
//             exec(ffmpegCmd, (err) => {
//                 if (err) reject(err);
//                 else resolve();
//             });
//         });

//         const stickerBuffer = fs.readFileSync(outputPath);
//         await sock.sendMessage(sender, { sticker: stickerBuffer, isAnimated: isVideo });

//         // Nettoyage
//         fs.unlinkSync(inputPath);
//         fs.unlinkSync(outputPath);
//     } catch (err) {
//         console.error('Erreur lors de la conversion en sticker:', err.message);
//         await sock.sendMessage(sender, { text: 'Impossible de convertir en sticker. Assurez-vous que la vidéo est courte (< 8 secondes) et que FFmpeg est installé.' });
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

// // Convertir un sticker animé en vidéo
// async function stickerToVideo(sock, sender, quoted) {
//     if (!quoted || !quoted.stickerMessage || !quoted.stickerMessage.isAnimated) {
//         console.log('Aucun sticker animé cité pour -video');
//         await sock.sendMessage(sender, { text: 'Veuillez citer un sticker animé pour le convertir en vidéo.' });
//         return;
//     }
//     try {
//         const stream = await downloadContentFromMessage(quoted.stickerMessage, 'image');
//         let buffer = Buffer.from([]);
//         for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

//         const inputPath = path.join(os.tmpdir(), `sticker_${Date.now()}.webp`);
//         const outputPath = path.join(os.tmpdir(), `video_${Date.now()}.mp4`);
//         fs.writeFileSync(inputPath, buffer);

//         const ffmpegCmd = `ffmpeg -i ${inputPath} -vcodec libx264 -pix_fmt yuv420p ${outputPath}`;

//         await new Promise((resolve, reject) => {
//             exec(ffmpegCmd, (err) => {
//                 if (err) reject(err);
//                 else resolve();
//             });
//         });

//         const videoBuffer = fs.readFileSync(outputPath);
//         await sock.sendMessage(sender, { video: videoBuffer, mimetype: 'video/mp4' });

//         // Nettoyage
//         fs.unlinkSync(inputPath);
//         fs.unlinkSync(outputPath);
//     } catch (err) {
//         console.error('Erreur lors de la conversion en vidéo:', err.message);
//         await sock.sendMessage(sender, { text: 'Impossible de convertir le sticker en vidéo.' });
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

// // Télécharger une vidéo YouTube avec audio
// async function downloadYouTube(sock, sender, url) {
//     if (!ytdl.validateURL(url)) {
//         await sock.sendMessage(sender, { text: 'URL YouTube invalide. Utilisez : -yt <url>' });
//         return;
//     }
//     try {
//         const info = await ytdl.getInfo(url);
//         const videoFormat = ytdl.chooseFormat(info.formats, { filter: 'videoonly', quality: 'highestvideo' });
//         const audioFormat = ytdl.chooseFormat(info.formats, { filter: 'audioonly', quality: 'highestaudio' });

//         const videoPath = path.join(os.tmpdir(), `yt_video_${Date.now()}.mp4`);
//         const audioPath = path.join(os.tmpdir(), `yt_audio_${Date.now()}.m4a`);
//         const outputPath = path.join(os.tmpdir(), `youtube_${Date.now()}.mp4`);

//         await new Promise((resolve, reject) => {
//             ytdl.downloadFromInfo(info, { format: videoFormat })
//                 .pipe(fs.createWriteStream(videoPath))
//                 .on('finish', resolve)
//                 .on('error', reject);
//         });

//         await new Promise((resolve, reject) => {
//             ytdl.downloadFromInfo(info, { format: audioFormat })
//                 .pipe(fs.createWriteStream(audioPath))
//                 .on('finish', resolve)
//                 .on('error', reject);
//         });

//         const ffmpegCmd = `ffmpeg -i ${videoPath} -i ${audioPath} -c copy -map 0:v:0 -map 1:a:0 ${outputPath}`;
//         await new Promise((resolve, reject) => {
//             exec(ffmpegCmd, (err) => {
//                 if (err) reject(err);
//                 else resolve();
//             });
//         });

//         const videoBuffer = fs.readFileSync(outputPath);
//         await sock.sendMessage(sender, { video: videoBuffer, mimetype: 'video/mp4', caption: info.videoDetails.title });

//         // Nettoyage
//         fs.unlinkSync(videoPath);
//         fs.unlinkSync(audioPath);
//         fs.unlinkSync(outputPath);
//     } catch (err) {
//         console.error('Erreur lors du téléchargement YouTube:', err.message);
//         await sock.sendMessage(sender, { text: 'Impossible de télécharger la vidéo YouTube. Assurez-vous que FFmpeg est installé.' });
//     }
// }

// // Partager le contact du créateur
// async function shareCreatorContact(sock, sender) {
//     try {
//         const vcard = `BEGIN:VCARD
// VERSION:3.0
// FN:Essoya le prince myènè
// TEL;TYPE=CELL:+241066813542
// END:VCARD`;
//         await sock.sendMessage(sender, {
//             contacts: {
//                 displayName: 'Essoya le prince myènè',
//                 contacts: [{ vcard }]
//             }
//         });
//     } catch (err) {
//         console.error('Erreur lors du partage du contact:', err.message);
//         await sock.sendMessage(sender, { text: 'Erreur lors du partage du contact.' });
//     }
// }

// // Afficher le menu avec image
// async function showMenuImage(sock, sender) {
//     const menuText = `
// 🌟 *Aquila Bot - Menu des Commandes* 🌟
// Créé par Essoya le prince myènè

// 🔹 *Commandes disponibles :*
//   • *${PREFIX}help* : Affiche ce menu (avec image)
//   • *${PREFIX}menu* : Affiche le menu avec GIF
//   • *${PREFIX}info* : Infos sur le bot
//   • *${PREFIX}sticker* : Convertit une image ou vidéo courte citée en sticker (animé pour vidéos)
//   • *${PREFIX}image* : Convertit un sticker cité en image
//   • *${PREFIX}video* : Convertit un sticker animé cité en vidéo
//   • *${PREFIX}download* : Télécharge un statut (image ou vidéo) cité
//   • *${PREFIX}yt <url>* : Télécharge une vidéo YouTube
//   • *${PREFIX}creator* : Partage le contact du créateur

// 💬 Posez une question directement pour une réponse IA ! (Supporte les notes vocales)

// *Contact* : ${CREATOR_CONTACT}
// *Note* : Utilisez le préfixe "-" pour les commandes. Dans les groupes, mentionnez-moi (@AquilaBot) ou répondez à mes messages pour les questions IA.
//     `;
//     try {
//         const imageBuffer = fs.readFileSync(MENU_IMAGE_PATH);
//         await sock.sendMessage(sender, { image: imageBuffer, caption: menuText });
//     } catch (err) {
//         console.error('Erreur lors du chargement de l\'image locale du menu:', err.message);
//         await sock.sendMessage(sender, { text: menuText + '\n⚠️ Image du menu non chargée.' });
//     }
// }

// // Afficher le menu avec GIF
// async function showMenuVideo(sock, sender) {
//     const menuText = `
// 🌟 *Aquila Bot - Menu des Commandes* 🌟
// Créé par Essoya le prince myènè

// 🔹 *Commandes disponibles :*
//   • *${PREFIX}help* : Affiche ce menu (avec image)
//   • *${PREFIX}menu* : Affiche le menu avec GIF
//   • *${PREFIX}info* : Infos sur le bot
//   • *${PREFIX}sticker* : Convertit une image ou vidéo courte citée en sticker (animé pour vidéos)
//   • *${PREFIX}image* : Convertit un sticker cité en image
//   • *${PREFIX}video* : Convertit un sticker animé cité en vidéo
//   • *${PREFIX}download* : Télécharge un statut (image ou vidéo) cité
//   • *${PREFIX}yt <url>* : Télécharge une vidéo YouTube
//   • *${PREFIX}creator* : Partage le contact du créateur

// 💬 Posez une question directement pour une réponse IA ! (Supporte les notes vocales)

// *Contact* : ${CREATOR_CONTACT}
// *Note* : Utilisez le préfixe "-" pour les commandes. Dans les groupes, mentionnez-moi (@AquilaBot) ou répondez à mes messages pour les questions IA.
//     `;
//     try {
//         const videoBuffer = fs.readFileSync(MENU_VIDEO_PATH);
//         await sock.sendMessage(sender, { video: videoBuffer, gifPlayback: true, caption: menuText });
//     } catch (err) {
//         console.error('Erreur lors du chargement du GIF local du menu:', err.message);
//         await sock.sendMessage(sender, { text: menuText + '\n⚠️ GIF du menu non chargé.' });
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
//         const messageId = msg.key.id;
//         const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
//         const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
//         const isGroup = sender.endsWith('@g.us');
//         const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
//         const botJid = sock.user?.id;
//         const isMentioned = mentioned.includes(botJid);
//         const isQuotedBot = msg.message.extendedTextMessage?.contextInfo?.participant === botJid;
//         const contextInfo = msg.message.audioMessage?.contextInfo || msg.message.extendedTextMessage?.contextInfo;
//         const isAudioQuotedBot = contextInfo?.participant === botJid;
//         const isAudioMentioned = contextInfo?.mentionedJid?.includes(botJid) || false;

//         // Anti-spam basé sur l'ID du message
//         if (messageCache.has(messageId)) {
//             console.log(`Message ${messageId} déjà traité, ignoré.`);
//             return;
//         }
//         messageCache.add(messageId);
//         setTimeout(() => messageCache.delete(messageId), CACHE_TIMEOUT);

//         const lowerText = text.toLowerCase();
//         const forbiddenWords = ['insulte', 'offensive', 'inapproprié'];

//         // Vérification des mots interdits pour texte
//         if (text && forbiddenWords.some(word => lowerText.includes(word))) {
//             await sock.sendMessage(sender, { text: 'Désolé, je ne peux pas répondre à cela.' });
//             return;
//         }

//         // Dans les groupes, ignorer si pas mentionné, pas réponse au bot, pas commande, et pas note vocale pertinente
//         if (isGroup && !isMentioned && !isQuotedBot && !text.startsWith(PREFIX) && !msg.message.audioMessage) {
//             console.log('Message ignoré dans le groupe : pas de mention, pas de réponse au bot, pas de commande.');
//             return;
//         }
//         if (isGroup && msg.message.audioMessage && !isAudioMentioned && !isAudioQuotedBot) {
//             console.log('Note vocale ignorée dans le groupe : pas de mention ni réponse au bot.');
//             return;
//         }

//         // Indiquer que le bot est en train d'écrire ou d'enregistrer
//         if (msg.message.audioMessage) {
//             await sock.sendPresenceUpdate('recording', sender);
//         } else {
//             await sock.sendPresenceUpdate('composing', sender);
//         }

//         // Gestion des notes vocales
//         if (msg.message.audioMessage && msg.message.audioMessage.ptt) {
//             try {
//                 const stream = await downloadContentFromMessage(msg.message.audioMessage, 'audio');
//                 let buffer = Buffer.from([]);
//                 for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

//                 const geminiReply = await askGemini(null, sender, buffer);

//                 // Vérification des mots interdits dans la réponse
//                 if (forbiddenWords.some(word => geminiReply.toLowerCase().includes(word))) {
//                     await sock.sendMessage(sender, { text: 'Désolé, je ne peux pas répondre à cela.' });
//                     return;
//                 }

//                 const audioBuffer = await textToAudio(geminiReply);
//                 if (audioBuffer) {
//                     await sock.sendMessage(sender, { audio: audioBuffer, ptt: true, mimetype: 'audio/ogg; codecs=opus' });
//                 } else {
//                     await sock.sendMessage(sender, { text: geminiReply });
//                 }
//             } catch (err) {
//                 console.error('Erreur lors du traitement de la note vocale:', err.message);
//                 await sock.sendMessage(sender, { text: 'Erreur lors du traitement de la note vocale.' });
//             }
//             return;
//         }

//         // Gestion des commandes avec préfixe "-"
//         if (text.startsWith(PREFIX)) {
//             const parts = text.slice(PREFIX.length).trim().split(' ');
//             const command = parts[0].toLowerCase();
//             const args = parts.slice(1).join(' ');

//             switch (command) {
//                 case 'help':
//                     await showMenuImage(sock, sender);
//                     break;
//                 case 'menu':
//                     await showMenuVideo(sock, sender);
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
//                 case 'video':
//                     await stickerToVideo(sock, sender, quoted);
//                     break;
//                 case 'download':
//                     await downloadStatus(sock, sender, quoted);
//                     break;
//                 case 'yt':
//                     if (!args) {
//                         await sock.sendMessage(sender, { text: 'Utilisez : -yt <url YouTube>' });
//                         break;
//                     }
//                     await downloadYouTube(sock, sender, args);
//                     break;
//                 case 'creator':
//                     await shareCreatorContact(sock, sender);
//                     break;
//                 default:
//                     await sock.sendMessage(sender, { text: `Commande inconnue. Tapez *${PREFIX}help* pour voir les commandes.` });
//             }
//             return;
//         }

//         // Réponse Gemini pour les messages texte sans préfixe (en inbox ou si mentionné/réponse au bot dans les groupes)
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




// const { default: makeWASocket, DisconnectReason, fetchLatestBaileysVersion, useMultiFileAuthState, downloadContentFromMessage } = require('baileys');
// const pino = require('pino');
// const fs = require('fs');
// const axios = require('axios');
// const QRCode = require('qrcode');
// const { exec } = require('child_process');
// const path = require('path');
// const os = require('os');
// const ytdl = require('ytdl-core');
// const google = require('googlethis');
// require('dotenv').config();

// const SESSION_DIR = process.env.SESSION_DIR || './auth_info';
// const CREATOR_CONTACT = '+24106813542@s.whatsapp.net';
// const PREFIX = '-';
// const MENU_IMAGE_PATH = './images/menu.jpg';
// const MENU_VIDEO_PATH = './videos/menu.mp4';
// const messageCache = new Map(); // Changé en Map pour stocker timestamps et mieux gérer
// const CACHE_TIMEOUT = 10000; // Augmenté à 10 secondes pour éviter les doublons

// // Fonction pour appeler Gemini AI, avec support audio
// async function askGemini(question, sender, audioData = null) {
//     try {
//         const isCreator = sender === CREATOR_CONTACT;
//         const systemPrompt = `
//             Vous êtes Aquila Bot, créé par Essoya le prince myènè.
//             Vous êtes un assistant WhatsApp amical avec humour noir et intellectuel.
//             ${isCreator ? 'Adressez-vous à l\'utilisateur comme "Mon créateur".' : 'Adressez-vous à l\'utilisateur de manière amicale.'}
//             Répondez de manière concise, sans dire "bonjour" ou salutations similaires à moins que ce ne soit explicitement demandé.
//             Ignorez les demandes inappropriées avec "Désolé, je ne peux pas répondre à cela."
//         `;
//         const parts = [{ text: systemPrompt }];
//         if (audioData) {
//             parts.push({ text: 'Transcrivez l\'audio suivant et répondez à la transcription comme si c\'était la question de l\'utilisateur.' });
//             parts.push({ inline_data: { mime_type: 'audio/ogg', data: audioData.toString('base64') } });
//         } else {
//             parts.push({ text: question });
//         }
//         const response = await axios.post(
//             'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
//             { contents: [{ parts }] },
//             { headers: { 'X-goog-api-key': process.env.GEMINI_API_KEY, 'Content-Type': 'application/json' } }
//         );
//         return response.data.candidates[0].content.parts[0].text || 'Désolé, je n’ai pas compris.';
//     } catch (err) {
//         console.error('Erreur Gemini:', err.message);
//         if (err.response?.status === 429) return 'Quota Gemini dépassé 🚫. Réessaie plus tard !';
//         return 'Erreur lors de la réponse Gemini.';
//     }
// }

// // Fonction pour convertir texte en audio avec Google TTS
// async function textToAudio(text) {
//     try {
//         const response = await axios.post(
//             `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GEMINI_API_KEY}`,
//             {
//                 input: { text },
//                 voice: { languageCode: 'fr-FR', ssmlGender: 'NEUTRAL' },
//                 audioConfig: { audioEncoding: 'OGG_OPUS' }
//             }
//         );
//         return Buffer.from(response.data.audioContent, 'base64');
//     } catch (err) {
//         console.error('Erreur TTS:', err.message);
//         return null;
//     }
// }

// // Convertir un média (image ou vidéo courte) en sticker avec FFmpeg
// async function mediaToSticker(sock, sender, quoted) {
//     if (!quoted) {
//         console.log('Aucun message cité pour -sticker');
//         await sock.sendMessage(sender, { text: 'Veuillez citer une image ou une vidéo courte pour la convertir en sticker.' });
//         return;
//     }
//     console.log('Message cité:', JSON.stringify(quoted, null, 2));

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

//         const inputPath = path.join(os.tmpdir(), `input_${Date.now()}.${isImage ? 'jpg' : 'mp4'}`);
//         const outputPath = path.join(os.tmpdir(), `sticker_${Date.now()}.webp`);
//         fs.writeFileSync(inputPath, buffer);

//         let ffmpegCmd;
//         if (isImage) {
//             ffmpegCmd = `ffmpeg -i ${inputPath} -vf scale=512:512 ${outputPath}`;
//         } else {
//             ffmpegCmd = `ffmpeg -i ${inputPath} -vcodec libwebp -filter:v fps=fps=15 -loop 0 -preset default -an -vsync 0 -s 512:512 ${outputPath}`;
//         }

//         await new Promise((resolve, reject) => {
//             exec(ffmpegCmd, (err) => {
//                 if (err) reject(err);
//                 else resolve();
//             });
//         });

//         const stickerBuffer = fs.readFileSync(outputPath);
//         await sock.sendMessage(sender, { sticker: stickerBuffer, isAnimated: isVideo });

//         // Nettoyage
//         fs.unlinkSync(inputPath);
//         fs.unlinkSync(outputPath);
//     } catch (err) {
//         console.error('Erreur lors de la conversion en sticker:', err.message);
//         await sock.sendMessage(sender, { text: 'Impossible de convertir en sticker. Assurez-vous que la vidéo est courte (< 8 secondes) et que FFmpeg est installé.' });
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

// // Convertir un sticker animé en vidéo
// async function stickerToVideo(sock, sender, quoted) {
//     if (!quoted || !quoted.stickerMessage || !quoted.stickerMessage.isAnimated) {
//         console.log('Aucun sticker animé cité pour -video');
//         await sock.sendMessage(sender, { text: 'Veuillez citer un sticker animé pour le convertir en vidéo.' });
//         return;
//     }
//     try {
//         const stream = await downloadContentFromMessage(quoted.stickerMessage, 'image');
//         let buffer = Buffer.from([]);
//         for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

//         const inputPath = path.join(os.tmpdir(), `sticker_${Date.now()}.webp`);
//         const outputPath = path.join(os.tmpdir(), `video_${Date.now()}.mp4`);
//         fs.writeFileSync(inputPath, buffer);

//         const ffmpegCmd = `ffmpeg -i ${inputPath} -vcodec libx264 -pix_fmt yuv420p ${outputPath}`;

//         await new Promise((resolve, reject) => {
//             exec(ffmpegCmd, (err) => {
//                 if (err) reject(err);
//                 else resolve();
//             });
//         });

//         const videoBuffer = fs.readFileSync(outputPath);
//         await sock.sendMessage(sender, { video: videoBuffer, mimetype: 'video/mp4' });

//         // Nettoyage
//         fs.unlinkSync(inputPath);
//         fs.unlinkSync(outputPath);
//     } catch (err) {
//         console.error('Erreur lors de la conversion en vidéo:', err.message);
//         await sock.sendMessage(sender, { text: 'Impossible de convertir le sticker en vidéo.' });
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

// // Télécharger une vidéo YouTube avec audio
// async function downloadYouTube(sock, sender, url) {
//     if (!ytdl.validateURL(url)) {
//         await sock.sendMessage(sender, { text: 'URL YouTube invalide. Utilisez : -yt <url>' });
//         return;
//     }
//     try {
//         const info = await ytdl.getInfo(url);
//         const videoFormat = ytdl.chooseFormat(info.formats, { filter: 'videoonly', quality: 'highestvideo' });
//         const audioFormat = ytdl.chooseFormat(info.formats, { filter: 'audioonly', quality: 'highestaudio' });

//         const videoPath = path.join(os.tmpdir(), `yt_video_${Date.now()}.mp4`);
//         const audioPath = path.join(os.tmpdir(), `yt_audio_${Date.now()}.m4a`);
//         const outputPath = path.join(os.tmpdir(), `youtube_${Date.now()}.mp4`);

//         await new Promise((resolve, reject) => {
//             ytdl.downloadFromInfo(info, { format: videoFormat })
//                 .pipe(fs.createWriteStream(videoPath))
//                 .on('finish', resolve)
//                 .on('error', reject);
//         });

//         await new Promise((resolve, reject) => {
//             ytdl.downloadFromInfo(info, { format: audioFormat })
//                 .pipe(fs.createWriteStream(audioPath))
//                 .on('finish', resolve)
//                 .on('error', reject);
//         });

//         const ffmpegCmd = `ffmpeg -i ${videoPath} -i ${audioPath} -c copy -map 0:v:0 -map 1:a:0 ${outputPath}`;
//         await new Promise((resolve, reject) => {
//             exec(ffmpegCmd, (err) => {
//                 if (err) reject(err);
//                 else resolve();
//             });
//         });

//         const videoBuffer = fs.readFileSync(outputPath);
//         await sock.sendMessage(sender, { video: videoBuffer, mimetype: 'video/mp4', caption: info.videoDetails.title });

//         // Nettoyage
//         fs.unlinkSync(videoPath);
//         fs.unlinkSync(audioPath);
//         fs.unlinkSync(outputPath);
//     } catch (err) {
//         console.error('Erreur lors du téléchargement YouTube:', err.message);
//         await sock.sendMessage(sender, { text: 'Impossible de télécharger la vidéo YouTube. Assurez-vous que FFmpeg est installé.' });
//     }
// }

// // Partager le contact du créateur
// async function shareCreatorContact(sock, sender) {
//     try {
//         const vcard = `BEGIN:VCARD
// VERSION:3.0
// FN:Essoya le prince myènè
// TEL;TYPE=CELL:066813542
// END:VCARD`;
//         await sock.sendMessage(sender, {
//             contacts: {
//                 displayName: 'Essoya le prince myènè',
//                 contacts: [{ vcard }]
//             }
//         });
//     } catch (err) {
//         console.error('Erreur lors du partage du contact:', err.message);
//         await sock.sendMessage(sender, { text: 'Erreur lors du partage du contact.' });
//     }
// }

// // Recherche sur Google
// async function googleSearch(query) {
//     try {
//         const response = await google.search(query, { page: 0, safe: false, additional_params: { hl: 'fr' } });
//         if (response.results.length > 0) {
//             const topResult = response.results[0];
//             return `${topResult.title}\n${topResult.description}\nSource: ${topResult.url}`;
//         }
//         return 'Aucun résultat trouvé.';
//     } catch (err) {
//         console.error('Erreur lors de la recherche Google:', err.message);
//         return 'Erreur lors de la recherche.';
//     }
// }

// // Recherche d'images sur Google
// async function googleImageSearch(query) {
//     try {
//         const images = await google.image(query, { safe: false });
//         if (images.length > 0) {
//             return images[0].url;
//         }
//         return null;
//     } catch (err) {
//         console.error('Erreur lors de la recherche d\'images Google:', err.message);
//         return null;
//     }
// }

// // Afficher le menu avec image
// async function showMenuImage(sock, sender) {
//     const menuText = `
// 🌟 *Aquila Bot - Menu des Commandes* 🌟
// Créé par Essoya le prince myènè

// 🔹 *Commandes disponibles :*
//   • *${PREFIX}help* : Affiche ce menu (avec image)
//   • *${PREFIX}menu* : Affiche le menu avec GIF
//   • *${PREFIX}info* : Infos sur le bot
//   • *${PREFIX}sticker* : Convertit une image ou vidéo courte citée en sticker (animé pour vidéos)
//   • *${PREFIX}image* : Convertit un sticker cité en image
//   • *${PREFIX}video* : Convertit un sticker animé cité en vidéo
//   • *${PREFIX}download* : Télécharge un statut (image ou vidéo) cité
//   • *${PREFIX}yt <url>* : Télécharge une vidéo YouTube
//   • *${PREFIX}find <query>* : Recherche des infos sur Google
//   • *${PREFIX}gimage <query>* : Recherche et envoie une image depuis Google
//   • *${PREFIX}creator* : Partage le contact du créateur

// 💬 Posez une question directement pour une réponse IA ! (Supporte les notes vocales)

// *Contact* : ${CREATOR_CONTACT}
// *Note* : Utilisez le préfixe "-" pour les commandes. Dans les groupes, mentionnez-moi (@AquilaBot) ou répondez à mes messages pour les questions IA.
//     `;
//     try {
//         const imageBuffer = fs.readFileSync(MENU_IMAGE_PATH);
//         await sock.sendMessage(sender, { image: imageBuffer, caption: menuText });
//     } catch (err) {
//         console.error('Erreur lors du chargement de l\'image locale du menu:', err.message);
//         await sock.sendMessage(sender, { text: menuText + '\n⚠️ Image du menu non chargée.' });
//     }
// }

// // Afficher le menu avec GIF
// async function showMenuVideo(sock, sender) {
//     const menuText = `
// 🌟 *Aquila Bot - Menu des Commandes* 🌟
// Créé par Essoya le prince myènè

// 🔹 *Commandes disponibles :*
//   • *${PREFIX}help* : Affiche ce menu (avec image)
//   • *${PREFIX}menu* : Affiche le menu avec GIF
//   • *${PREFIX}info* : Infos sur le bot
//   • *${PREFIX}sticker* : Convertit une image ou vidéo courte citée en sticker (animé pour vidéos)
//   • *${PREFIX}image* : Convertit un sticker cité en image
//   • *${PREFIX}video* : Convertit un sticker animé cité en vidéo
//   • *${PREFIX}download* : Télécharge un statut (image ou vidéo) cité
//   • *${PREFIX}yt <url>* : Télécharge une vidéo YouTube
//   • *${PREFIX}find <query>* : Recherche des infos sur Google
//   • *${PREFIX}gimage <query>* : Recherche et envoie une image depuis Google
//   • *${PREFIX}creator* : Partage le contact du créateur

// 💬 Posez une question directement pour une réponse IA ! (Supporte les notes vocales)

// *Contact* : ${CREATOR_CONTACT}
// *Note* : Utilisez le préfixe "-" pour les commandes. Dans les groupes, mentionnez-moi (@AquilaBot) ou répondez à mes messages pour les questions IA.
//     `;
//     try {
//         const videoBuffer = fs.readFileSync(MENU_VIDEO_PATH);
//         await sock.sendMessage(sender, { video: videoBuffer, gifPlayback: true, caption: menuText });
//     } catch (err) {
//         console.error('Erreur lors du chargement du GIF local du menu:', err.message);
//         await sock.sendMessage(sender, { text: menuText + '\n⚠️ GIF du menu non chargé.' });
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
//         const messageId = msg.key.id;
//         const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
//         const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
//         const isGroup = sender.endsWith('@g.us');
//         const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
//         const botJid = sock.user.id.replace(/:\d+/, ''); // Correction pour le JID (enlever :version si présent)
//         const isMentioned = mentioned.includes(botJid);
//         const isQuotedBot = msg.message.extendedTextMessage?.contextInfo?.participant === botJid;
//         const contextInfo = msg.message.audioMessage?.contextInfo || msg.message.extendedTextMessage?.contextInfo;
//         const isAudioQuotedBot = contextInfo?.participant === botJid;
//         const isAudioMentioned = contextInfo?.mentionedJid?.includes(botJid) || false;

//         // Anti-spam amélioré avec Map et timestamp
//         const now = Date.now();
//         if (messageCache.has(messageId)) {
//             const cachedTime = messageCache.get(messageId);
//             if (now - cachedTime < CACHE_TIMEOUT) {
//                 console.log(`Message ${messageId} déjà traité récemment, ignoré.`);
//                 return;
//             }
//         }
//         messageCache.set(messageId, now);
//         setTimeout(() => messageCache.delete(messageId), CACHE_TIMEOUT * 2); // Double timeout pour nettoyage

//         const lowerText = text.toLowerCase();
//         const forbiddenWords = ['insulte', 'offensive', 'inapproprié'];

//         // Vérification des mots interdits pour texte
//         if (text && forbiddenWords.some(word => lowerText.includes(word))) {
//             await sock.sendMessage(sender, { text: 'Désolé, je ne peux pas répondre à cela.' });
//             return;
//         }

//         // Dans les groupes, ignorer si pas mentionné, pas réponse au bot, pas commande, et pas note vocale pertinente
//         if (isGroup && !isMentioned && !isQuotedBot && !text.startsWith(PREFIX) && !msg.message.audioMessage) {
//             console.log('Message ignoré dans le groupe : pas de mention, pas de réponse au bot, pas de commande.');
//             return;
//         }
//         if (isGroup && msg.message.audioMessage && !isAudioMentioned && !isAudioQuotedBot) {
//             console.log('Note vocale ignorée dans le groupe : pas de mention ni réponse au bot.');
//             return;
//         }

//         // Indiquer que le bot est en train d'écrire ou d'enregistrer
//         if (msg.message.audioMessage) {
//             await sock.sendPresenceUpdate('recording', sender);
//         } else {
//             await sock.sendPresenceUpdate('composing', sender);
//         }

//         // Gestion des notes vocales
//         if (msg.message.audioMessage && msg.message.audioMessage.ptt) {
//             try {
//                 const stream = await downloadContentFromMessage(msg.message.audioMessage, 'audio');
//                 let buffer = Buffer.from([]);
//                 for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

//                 const geminiReply = await askGemini(null, sender, buffer);

//                 // Vérification des mots interdits dans la réponse
//                 if (forbiddenWords.some(word => geminiReply.toLowerCase().includes(word))) {
//                     await sock.sendMessage(sender, { text: 'Désolé, je ne peux pas répondre à cela.' });
//                     return;
//                 }

//                 const audioBuffer = await textToAudio(geminiReply);
//                 if (audioBuffer) {
//                     await sock.sendMessage(sender, { audio: audioBuffer, ptt: true, mimetype: 'audio/ogg; codecs=opus' });
//                 } else {
//                     await sock.sendMessage(sender, { text: geminiReply });
//                 }
//             } catch (err) {
//                 console.error('Erreur lors du traitement de la note vocale:', err.message);
//                 await sock.sendMessage(sender, { text: 'Erreur lors du traitement de la note vocale.' });
//             }
//             return;
//         }

//         // Gestion des commandes avec préfixe "-"
//         if (text.startsWith(PREFIX)) {
//             const parts = text.slice(PREFIX.length).trim().split(' ');
//             const command = parts[0].toLowerCase();
//             const args = parts.slice(1).join(' ');

//             switch (command) {
//                 case 'help':
//                     await showMenuImage(sock, sender);
//                     break;
//                 case 'menu':
//                     await showMenuVideo(sock, sender);
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
//                 case 'video':
//                     await stickerToVideo(sock, sender, quoted);
//                     break;
//                 case 'download':
//                     await downloadStatus(sock, sender, quoted);
//                     break;
//                 case 'yt':
//                     if (!args) {
//                         await sock.sendMessage(sender, { text: 'Utilisez : -yt <url YouTube>' });
//                         break;
//                     }
//                     await downloadYouTube(sock, sender, args);
//                     break;
//                 case 'find':
//                     if (!args) {
//                         await sock.sendMessage(sender, { text: 'Utilisez : -find <requête>' });
//                         break;
//                     }
//                     const searchResult = await googleSearch(args);
//                     await sock.sendMessage(sender, { text: searchResult });
//                     break;
//                 case 'gimage':
//                     if (!args) {
//                         await sock.sendMessage(sender, { text: 'Utilisez : -gimage <requête>' });
//                         break;
//                     }
//                     const imageUrl = await googleImageSearch(args);
//                     if (imageUrl) {
//                         try {
//                             const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
//                             await sock.sendMessage(sender, { image: Buffer.from(response.data) });
//                         } catch (err) {
//                             await sock.sendMessage(sender, { text: 'Erreur lors du téléchargement de l\'image.' });
//                         }
//                     } else {
//                         await sock.sendMessage(sender, { text: 'Aucune image trouvée.' });
//                     }
//                     break;
//                 case 'creator':
//                     await shareCreatorContact(sock, sender);
//                     break;
//                 default:
//                     await sock.sendMessage(sender, { text: `Commande inconnue. Tapez *${PREFIX}help* pour voir les commandes.` });
//             }
//             return;
//         }

//         // Réponse Gemini pour les messages texte sans préfixe (en inbox ou si mentionné/réponse au bot dans les groupes)
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
//             // Envoyer un message toutes les 10 minutes au créateur
//             setInterval(async () => {
//                 try {
//                     await sock.sendMessage(CREATOR_CONTACT, { text: 'Bot status: Online et opérationnel !' });
//                     console.log('Message périodique envoyé au créateur.');
//                 } catch (err) {
//                     console.error('Erreur lors de l\'envoi du message périodique:', err.message);
//                 }
//             }, 600000); // 10 minutes = 600000 ms
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
const google = require('googlethis');
require('dotenv').config();

const SESSION_DIR = process.env.SESSION_DIR || './auth_info';
const CREATOR_CONTACT = '24106813542@s.whatsapp.net';
const PREFIX = '-';
const MENU_IMAGE_PATH = './images/menu.jpg';
const MENU_VIDEO_PATH = './videos/menu.mp4';
const messageCache = new Map(); // Changé en Map pour stocker timestamps et mieux gérer
const CACHE_TIMEOUT = 10000; // Augmenté à 10 secondes pour éviter les doublons

// Fonction pour appeler Gemini AI, avec support audio
async function askGemini(question, sender, audioData = null) {
    try {
        const isCreator = sender === CREATOR_CONTACT;
        const systemPrompt = `
            Vous êtes Aquila Bot, créé par Essoya le prince myènè.
            Vous êtes un assistant WhatsApp amical avec humour noir et intellectuel.
            ${isCreator ? 'Adressez-vous à l\'utilisateur comme "Mon créateur".' : 'Adressez-vous à l\'utilisateur de manière amicale.'}
            Répondez de manière concise, sans dire "bonjour" ou salutations similaires à moins que ce ne soit explicitement demandé.
            Ignorez les demandes inappropriées avec "Désolé, je ne peux pas répondre à cela."
        `;
        const parts = [{ text: systemPrompt }];
        if (audioData) {
            parts.push({ text: 'Transcrivez l\'audio suivant et répondez à la transcription comme si c\'était la question de l\'utilisateur.' });
            parts.push({ inline_data: { mime_type: 'audio/ogg', data: audioData.toString('base64') } });
        } else {
            parts.push({ text: question });
        }
        const response = await axios.post(
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
            { contents: [{ parts }] },
            { headers: { 'X-goog-api-key': process.env.GEMINI_API_KEY, 'Content-Type': 'application/json' } }
        );
        return response.data.candidates[0].content.parts[0].text || 'Désolé, je n’ai pas compris.';
    } catch (err) {
        console.error('Erreur Gemini:', err.message);
        if (err.response?.status === 429) return 'Quota Gemini dépassé 🚫. Réessaie plus tard !';
        return 'Erreur lors de la réponse Gemini.';
    }
}

// Fonction pour convertir texte en audio avec Google TTS
async function textToAudio(text) {
    try {
        const response = await axios.post(
            `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GEMINI_API_KEY}`,
            {
                input: { text },
                voice: { languageCode: 'fr-FR', ssmlGender: 'NEUTRAL' },
                audioConfig: { audioEncoding: 'OGG_OPUS' }
            }
        );
        return Buffer.from(response.data.audioContent, 'base64');
    } catch (err) {
        console.error('Erreur TTS:', err.message);
        return null;
    }
}

// Convertir un média (image ou vidéo courte) en sticker avec FFmpeg
async function mediaToSticker(sock, sender, quoted) {
    if (!quoted) {
        console.log('Aucun message cité pour -sticker');
        await sock.sendMessage(sender, { text: 'Veuillez citer une image ou une vidéo courte pour la convertir en sticker.' });
        return;
    }
    console.log('Message cité:', JSON.stringify(quoted, null, 2));

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

        // Nettoyage
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
    } catch (err) {
        console.error('Erreur lors de la conversion en sticker:', err.message);
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

// Convertir un sticker animé en vidéo
async function stickerToVideo(sock, sender, quoted) {
    if (!quoted || !quoted.stickerMessage || !quoted.stickerMessage.isAnimated) {
        console.log('Aucun sticker animé cité pour -video');
        await sock.sendMessage(sender, { text: 'Veuillez citer un sticker animé pour le convertir en vidéo.' });
        return;
    }
    try {
        const stream = await downloadContentFromMessage(quoted.stickerMessage, 'image');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

        const inputPath = path.join(os.tmpdir(), `sticker_${Date.now()}.webp`);
        const outputPath = path.join(os.tmpdir(), `video_${Date.now()}.mp4`);
        fs.writeFileSync(inputPath, buffer);

        const ffmpegCmd = `ffmpeg -i ${inputPath} -vcodec libx264 -pix_fmt yuv420p ${outputPath}`;

        await new Promise((resolve, reject) => {
            exec(ffmpegCmd, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        const videoBuffer = fs.readFileSync(outputPath);
        await sock.sendMessage(sender, { video: videoBuffer, mimetype: 'video/mp4' });

        // Nettoyage
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
    } catch (err) {
        console.error('Erreur lors de la conversion en vidéo:', err.message);
        await sock.sendMessage(sender, { text: 'Impossible de convertir le sticker en vidéo.' });
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

// Télécharger une vidéo YouTube avec audio
async function downloadYouTube(sock, sender, url) {
    if (!ytdl.validateURL(url)) {
        await sock.sendMessage(sender, { text: 'URL YouTube invalide. Utilisez : -yt <url>' });
        return;
    }
    try {
        const info = await ytdl.getInfo(url);
        const videoFormat = ytdl.chooseFormat(info.formats, { filter: 'videoonly', quality: 'highestvideo' });
        const audioFormat = ytdl.chooseFormat(info.formats, { filter: 'audioonly', quality: 'highestaudio' });

        const videoPath = path.join(os.tmpdir(), `yt_video_${Date.now()}.mp4`);
        const audioPath = path.join(os.tmpdir(), `yt_audio_${Date.now()}.m4a`);
        const outputPath = path.join(os.tmpdir(), `youtube_${Date.now()}.mp4`);

        await new Promise((resolve, reject) => {
            ytdl.downloadFromInfo(info, { format: videoFormat })
                .pipe(fs.createWriteStream(videoPath))
                .on('finish', resolve)
                .on('error', reject);
        });

        await new Promise((resolve, reject) => {
            ytdl.downloadFromInfo(info, { format: audioFormat })
                .pipe(fs.createWriteStream(audioPath))
                .on('finish', resolve)
                .on('error', reject);
        });

        const ffmpegCmd = `ffmpeg -i ${videoPath} -i ${audioPath} -c copy -map 0:v:0 -map 1:a:0 ${outputPath}`;
        await new Promise((resolve, reject) => {
            exec(ffmpegCmd, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        const videoBuffer = fs.readFileSync(outputPath);
        await sock.sendMessage(sender, { video: videoBuffer, mimetype: 'video/mp4', caption: info.videoDetails.title });

        // Nettoyage
        fs.unlinkSync(videoPath);
        fs.unlinkSync(audioPath);
        fs.unlinkSync(outputPath);
    } catch (err) {
        console.error('Erreur lors du téléchargement YouTube:', err.message);
        await sock.sendMessage(sender, { text: 'Impossible de télécharger la vidéo YouTube. Assurez-vous que FFmpeg est installé.' });
    }
}

// Partager le contact du créateur
async function shareCreatorContact(sock, sender) {
    try {
        const vcard = `BEGIN:VCARD
VERSION:3.0
FN:Essoya le prince myènè
TEL;TYPE=CELL:+241 06 81 35 42
END:VCARD`;
        await sock.sendMessage(sender, {
            contacts: {
                displayName: 'Essoya le prince myènè',
                contacts: [{ vcard }]
            }
        });
    } catch (err) {
        console.error('Erreur lors du partage du contact:', err.message);
        await sock.sendMessage(sender, { text: 'Erreur lors du partage du contact.' });
    }
}

// Recherche sur Google
async function googleSearch(query) {
    try {
        const options = {
            page: 0,
            safe: false,
            additional_params: { hl: 'fr' }
        };
        const response = await google.search(query, options);
        if (response.results && response.results.length > 0) {
            const topResult = response.results[0];
            return `${topResult.title}\n${topResult.description}\nSource: ${topResult.url}`;
        }
        return 'Aucun résultat trouvé.';
    } catch (err) {
        console.error('Erreur lors de la recherche Google:', err.message);
        return 'Erreur lors de la recherche. Vérifiez si la bibliothèque googlethis est à jour et fonctionnelle.';
    }
}

// Recherche d'images sur Google
async function googleImageSearch(query) {
    try {
        const images = await google.image(query, { safe: false });
        if (images.length > 0) {
            return images[0].url;
        }
        return null;
    } catch (err) {
        console.error('Erreur lors de la recherche d\'images Google:', err.message);
        return null;
    }
}

// Afficher le menu avec image
async function showMenuImage(sock, sender) {
    const menuText = `
🌟 *Aquila Bot - Menu des Commandes* 🌟
Créé par Essoya le prince myènè

🔹 *Commandes disponibles :*
  • *${PREFIX}help* : Affiche ce menu (avec image)
  • *${PREFIX}menu* : Affiche le menu avec GIF
  • *${PREFIX}info* : Infos sur le bot
  • *${PREFIX}sticker* : Convertit une image ou vidéo courte citée en sticker (animé pour vidéos)
  • *${PREFIX}image* : Convertit un sticker cité en image
  • *${PREFIX}video* : Convertit un sticker animé cité en vidéo
  • *${PREFIX}download* : Télécharge un statut (image ou vidéo) cité
  • *${PREFIX}yt <url>* : Télécharge une vidéo YouTube
  • *${PREFIX}find <query>* : Recherche des infos sur Google
  • *${PREFIX}gimage <query>* : Recherche et envoie une image depuis Google
  • *${PREFIX}join <lien>* : Rejoindre un groupe via lien d'invitation
  • *${PREFIX}promote @user* : Promouvoir un membre en admin (admins seulement)
  • *${PREFIX}demote @user* : Rétrograder un admin (admins seulement)
  • *${PREFIX}kick @user* : Retirer un membre du groupe (admins seulement)
  • *${PREFIX}add <numero>* : Ajouter un membre au groupe (admins seulement, format international sans +)
  • *${PREFIX}tagall [message]* : Taguer tous les membres (admins seulement)
  • *${PREFIX}hidetag [message]* : Taguer tous les membres de manière cachée (admins seulement)
  • *${PREFIX}kickall* : Retirer tous les non-admins (admins seulement)
  • *${PREFIX}creator* : Partage le contact du créateur

💬 Posez une question directement pour une réponse IA ! (Supporte les notes vocales)

*Contact* : ${CREATOR_CONTACT}
*Note* : Utilisez le préfixe "-" pour les commandes. Dans les groupes, mentionnez-moi (@AquilaBot) ou répondez à mes messages pour les questions IA.
    `;
    try {
        const imageBuffer = fs.readFileSync(MENU_IMAGE_PATH);
        await sock.sendMessage(sender, { image: imageBuffer, caption: menuText });
    } catch (err) {
        console.error('Erreur lors du chargement de l\'image locale du menu:', err.message);
        await sock.sendMessage(sender, { text: menuText + '\n⚠️ Image du menu non chargée.' });
    }
}

// Afficher le menu avec GIF
async function showMenuVideo(sock, sender) {
    const menuText = `
🌟 *Aquila Bot - Menu des Commandes* 🌟
Créé par Essoya le prince myènè

🔹 *Commandes disponibles :*
  • *${PREFIX}help* : Affiche ce menu (avec image)
  • *${PREFIX}menu* : Affiche le menu avec GIF
  • *${PREFIX}info* : Infos sur le bot
  • *${PREFIX}sticker* : Convertit une image ou vidéo courte citée en sticker (animé pour vidéos)
  • *${PREFIX}image* : Convertit un sticker cité en image
  • *${PREFIX}video* : Convertit un sticker animé cité en vidéo
  • *${PREFIX}download* : Télécharge un statut (image ou vidéo) cité
  • *${PREFIX}yt <url>* : Télécharge une vidéo YouTube
  • *${PREFIX}find <query>* : Recherche des infos sur Google
  • *${PREFIX}gimage <query>* : Recherche et envoie une image depuis Google
  • *${PREFIX}join <lien>* : Rejoindre un groupe via lien d'invitation
  • *${PREFIX}promote @user* : Promouvoir un membre en admin (admins seulement)
  • *${PREFIX}demote @user* : Rétrograder un admin (admins seulement)
  • *${PREFIX}kick @user* : Retirer un membre du groupe (admins seulement)
  • *${PREFIX}add <numero>* : Ajouter un membre au groupe (admins seulement, format international sans +)
  • *${PREFIX}tagall [message]* : Taguer tous les membres (admins seulement)
  • *${PREFIX}hidetag [message]* : Taguer tous les membres de manière cachée (admins seulement)
  • *${PREFIX}kickall* : Retirer tous les non-admins (admins seulement)
  • *${PREFIX}creator* : Partage le contact du créateur

💬 Posez une question directement pour une réponse IA ! (Supporte les notes vocales)

*Contact* : ${CREATOR_CONTACT}
*Note* : Utilisez le préfixe "-" pour les commandes. Dans les groupes, mentionnez-moi (@AquilaBot) ou répondez à mes messages pour les questions IA.
    `;
    try {
        const videoBuffer = fs.readFileSync(MENU_VIDEO_PATH);
        await sock.sendMessage(sender, { video: videoBuffer, gifPlayback: true, caption: menuText });
    } catch (err) {
        console.error('Erreur lors du chargement du GIF local du menu:', err.message);
        await sock.sendMessage(sender, { text: menuText + '\n⚠️ GIF du menu non chargé.' });
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
        const messageId = msg.key.id;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
        const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
        const isGroup = sender.endsWith('@g.us');
        const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const botJid = sock.user.id.replace(/:\d+/, ''); // Correction pour le JID (enlever :version si présent)
        const isMentioned = mentioned.includes(botJid);
        const isQuotedBot = msg.message.extendedTextMessage?.contextInfo?.participant === botJid;
        const contextInfo = msg.message.audioMessage?.contextInfo || msg.message.extendedTextMessage?.contextInfo;
        const isAudioQuotedBot = contextInfo?.participant === botJid;
        const isAudioMentioned = contextInfo?.mentionedJid?.includes(botJid) || false;
        const participant = msg.key.participant || sender;

        // Anti-spam amélioré avec Map et timestamp
        const now = Date.now();
        if (messageCache.has(messageId)) {
            const cachedTime = messageCache.get(messageId);
            if (now - cachedTime < CACHE_TIMEOUT) {
                console.log(`Message ${messageId} déjà traité récemment, ignoré.`);
                return;
            }
        }
        messageCache.set(messageId, now);
        setTimeout(() => messageCache.delete(messageId), CACHE_TIMEOUT * 2); // Double timeout pour nettoyage

        const lowerText = text.toLowerCase();
        const forbiddenWords = ['insulte', 'offensive', 'inapproprié'];

        // Vérification des mots interdits pour texte
        if (text && forbiddenWords.some(word => lowerText.includes(word))) {
            await sock.sendMessage(sender, { text: 'Désolé, je ne peux pas répondre à cela.' });
            return;
        }

        // Dans les groupes, ignorer si pas mentionné, pas réponse au bot, pas commande, et pas note vocale pertinente
        if (isGroup && !isMentioned && !isQuotedBot && !text.startsWith(PREFIX) && !msg.message.audioMessage) {
            console.log('Message ignoré dans le groupe : pas de mention, pas de réponse au bot, pas de commande.');
            return;
        }
        if (isGroup && msg.message.audioMessage && !isAudioMentioned && !isAudioQuotedBot) {
            console.log('Note vocale ignorée dans le groupe : pas de mention ni réponse au bot.');
            return;
        }

        // Indiquer que le bot est en train d'écrire ou d'enregistrer
        if (msg.message.audioMessage) {
            await sock.sendPresenceUpdate('recording', sender);
        } else {
            await sock.sendPresenceUpdate('composing', sender);
        }

        // Gestion des notes vocales
        if (msg.message.audioMessage && msg.message.audioMessage.ptt) {
            try {
                const stream = await downloadContentFromMessage(msg.message.audioMessage, 'audio');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

                const geminiReply = await askGemini(null, sender, buffer);

                // Vérification des mots interdits dans la réponse
                if (forbiddenWords.some(word => geminiReply.toLowerCase().includes(word))) {
                    await sock.sendMessage(sender, { text: 'Désolé, je ne peux pas répondre à cela.' });
                    return;
                }

                const audioBuffer = await textToAudio(geminiReply);
                if (audioBuffer) {
                    await sock.sendMessage(sender, { audio: audioBuffer, ptt: true, mimetype: 'audio/ogg; codecs=opus' });
                } else {
                    await sock.sendMessage(sender, { text: geminiReply });
                }
            } catch (err) {
                console.error('Erreur lors du traitement de la note vocale:', err.message);
                await sock.sendMessage(sender, { text: 'Erreur lors du traitement de la note vocale.' });
            }
            return;
        }

        // Gestion des commandes avec préfixe "-"
        if (text.startsWith(PREFIX)) {
            const parts = text.slice(PREFIX.length).trim().split(' ');
            const command = parts[0].toLowerCase();
            const args = parts.slice(1).join(' ');

            let metadata;
            let isAdmin = false;
            let isBotAdmin = false;
            if (isGroup) {
                metadata = await sock.groupMetadata(sender);
                const adminParticipant = metadata.participants.find(p => p.id === participant);
                isAdmin = adminParticipant && (adminParticipant.admin === 'admin' || adminParticipant.admin === 'superadmin');
                const botParticipant = metadata.participants.find(p => p.id === botJid);
                isBotAdmin = botParticipant && (botParticipant.admin === 'admin' || botParticipant.admin === 'superadmin');
            }

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
                case 'video':
                    await stickerToVideo(sock, sender, quoted);
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
                case 'find':
                    if (!args) {
                        await sock.sendMessage(sender, { text: 'Utilisez : -find <requête>' });
                        break;
                    }
                    const searchResult = await googleSearch(args);
                    await sock.sendMessage(sender, { text: searchResult });
                    break;
                case 'gimage':
                    if (!args) {
                        await sock.sendMessage(sender, { text: 'Utilisez : -gimage <requête>' });
                        break;
                    }
                    const imageUrl = await googleImageSearch(args);
                    if (imageUrl) {
                        try {
                            const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
                            await sock.sendMessage(sender, { image: Buffer.from(response.data) });
                        } catch (err) {
                            await sock.sendMessage(sender, { text: 'Erreur lors du téléchargement de l\'image.' });
                        }
                    } else {
                        await sock.sendMessage(sender, { text: 'Aucune image trouvée.' });
                    }
                    break;
                case 'join':
                    if (!args) {
                        await sock.sendMessage(sender, { text: 'Utilisez : -join <lien d\'invitation>' });
                        break;
                    }
                    try {
                        const inviteCode = args.split('https://chat.whatsapp.com/')[1];
                        await sock.groupAcceptInvite(inviteCode);
                        await sock.sendMessage(sender, { text: 'Groupe rejoint avec succès !' });
                    } catch (err) {
                        console.error('Erreur lors de la jointure du groupe:', err.message);
                        await sock.sendMessage(sender, { text: 'Impossible de rejoindre le groupe.' });
                    }
                    break;
                case 'promote':
                case 'demote':
                case 'kick':
                    if (!isGroup) {
                        await sock.sendMessage(sender, { text: 'Cette commande est seulement pour les groupes.' });
                        break;
                    }
                    if (!isAdmin) {
                        await sock.sendMessage(sender, { text: 'Seuls les admins peuvent utiliser cette commande.' });
                        break;
                    }
                    if (!isBotAdmin) {
                        await sock.sendMessage(sender, { text: 'Je dois être admin pour effectuer cette action.' });
                        break;
                    }
                    let target = mentioned[0] || (contextInfo && contextInfo.participant);
                    if (!target) {
                        await sock.sendMessage(sender, { text: 'Veuillez mentionner ou citer l\'utilisateur.' });
                        break;
                    }
                    const action = command === 'promote' ? 'promote' : command === 'demote' ? 'demote' : 'remove';
                    try {
                        await sock.groupParticipantsUpdate(sender, [target], action);
                        await sock.sendMessage(sender, { text: `Utilisateur ${action === 'remove' ? 'retiré' : action === 'promote' ? 'promu admin' : 'rétrogradé'}.` });
                    } catch (err) {
                        console.error(`Erreur lors de ${command}:`, err.message);
                        await sock.sendMessage(sender, { text: `Impossible d'exécuter ${command}.` });
                    }
                    break;
                case 'add':
                    if (!isGroup) {
                        await sock.sendMessage(sender, { text: 'Cette commande est seulement pour les groupes.' });
                        break;
                    }
                    if (!isAdmin) {
                        await sock.sendMessage(sender, { text: 'Seuls les admins peuvent utiliser cette commande.' });
                        break;
                    }
                    if (!isBotAdmin) {
                        await sock.sendMessage(sender, { text: 'Je dois être admin pour effectuer cette action.' });
                        break;
                    }
                    if (!args) {
                        await sock.sendMessage(sender, { text: 'Utilisez : -add <numéro> (format international sans +)' });
                        break;
                    }
                    const number = args.replace(/\D/g, '') + '@s.whatsapp.net';
                    try {
                        await sock.groupParticipantsUpdate(sender, [number], 'add');
                        await sock.sendMessage(sender, { text: 'Membre ajouté.' });
                    } catch (err) {
                        console.error('Erreur lors de l\'ajout:', err.message);
                        await sock.sendMessage(sender, { text: 'Impossible d\'ajouter le membre.' });
                    }
                    break;
                case 'tagall':
                    if (!isGroup) {
                        await sock.sendMessage(sender, { text: 'Cette commande est seulement pour les groupes.' });
                        break;
                    }
                    if (!isAdmin) {
                        await sock.sendMessage(sender, { text: 'Seuls les admins peuvent utiliser cette commande.' });
                        break;
                    }
                    const participants = metadata.participants.map(p => p.id);
                    await sock.sendMessage(sender, { text: args || 'Tag all !', mentions: participants });
                    break;
                case 'hidetag':
                    if (!isGroup) {
                        await sock.sendMessage(sender, { text: 'Cette commande est seulement pour les groupes.' });
                        break;
                    }
                    if (!isAdmin) {
                        await sock.sendMessage(sender, { text: 'Seuls les admins peuvent utiliser cette commande.' });
                        break;
                    }
                    const participantsHide = metadata.participants.map(p => p.id);
                    await sock.sendMessage(sender, { text: args || '', mentions: participantsHide });
                    break;
                case 'kickall':
                    if (!isGroup) {
                        await sock.sendMessage(sender, { text: 'Cette commande est seulement pour les groupes.' });
                        break;
                    }
                    if (!isAdmin) {
                        await sock.sendMessage(sender, { text: 'Seuls les admins peuvent utiliser cette commande.' });
                        break;
                    }
                    if (!isBotAdmin) {
                        await sock.sendMessage(sender, { text: 'Je dois être admin pour effectuer cette action.' });
                        break;
                    }
                    const nonAdmins = metadata.participants.filter(p => !p.admin).map(p => p.id);
                    if (nonAdmins.length > 0) {
                        try {
                            // Pour éviter les bans, kicker par batches si nécessaire, mais pour simplicité
                            await sock.groupParticipantsUpdate(sender, nonAdmins, 'remove');
                            await sock.sendMessage(sender, { text: 'Tous les non-admins ont été retirés.' });
                        } catch (err) {
                            console.error('Erreur lors du kickall:', err.message);
                            await sock.sendMessage(sender, { text: 'Erreur lors du retrait des membres.' });
                        }
                    } else {
                        await sock.sendMessage(sender, { text: 'Aucun non-admin à retirer.' });
                    }
                    break;
                case 'creator':
                    await shareCreatorContact(sock, sender);
                    break;
                default:
                    await sock.sendMessage(sender, { text: `Commande inconnue. Tapez *${PREFIX}help* pour voir les commandes.` });
            }
            return;
        }

        // Réponse Gemini pour les messages texte sans préfixe (en inbox ou si mentionné/réponse au bot dans les groupes)
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
            // Envoyer un message toutes les 10 minutes au créateur
            setInterval(async () => {
                try {
                    await sock.sendMessage(CREATOR_CONTACT, { text: 'Bot status: Online et opérationnel !' });
                    console.log('Message périodique envoyé au créateur.');
                } catch (err) {
                    console.error('Erreur lors de l\'envoi du message périodique:', err.message);
                }
            }, 600000); // 10 minutes = 600000 ms
        }
    });

    return sock;
}

module.exports = startBot;