const { makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const qrcode = require("qrcode");

let sock;
let qrCodeData = "";

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  // 🟢 Moved inside connect function
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;
    console.log("📩 New message:", msg.key.remoteJid, msg.message);
  });

  sock.ev.on("connection.update", (update) => {
    const { connection, qr } = update;

    if (qr) {
      qrcode.toDataURL(qr, (err, url) => {
        if (!err) qrCodeData = url;
      });
    }

    if (connection === "open") {
      console.log("✅ WhatsApp connected");
    } else if (connection === "close") {
      console.log("❌ Connection closed");
    }
  });

  sock.ev.on("creds.update", saveCreds);
}

function getQRCode() {
  return qrCodeData;
}

module.exports = {
  connectToWhatsApp,
  getQRCode,
};
