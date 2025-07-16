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

  sock.ev.on("connection.update", (update) => {
    const { connection, qr } = update;

    if (qr) {
      qrcode.toDataURL(qr, (err, url) => {
        if (!err) {
          qrCodeData = url;
          console.log("✅ QR Code generated");
        }
      });
    }

    if (connection === "open") {
      console.log("✅ WhatsApp connected");
    } else if (connection === "close") {
      console.log("❌ WhatsApp connection closed");
    }
  });

  sock.ev.on("creds.update", saveCreds);
}

function getQRCode() {
  return qrCodeData;
}

module.exports = { connectToWhatsApp, getQRCode };
