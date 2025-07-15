// settings.js
let settings = {
  savageMode: true,
  autoReply: true,
};

function getSettings(req, res) {
  res.json(settings);
}

function updateSettings(req, res) {
  const { savageMode, autoReply } = req.body;

  if (typeof savageMode === "boolean") settings.savageMode = savageMode;
  if (typeof autoReply === "boolean") settings.autoReply = autoReply;

  res.json({ message: "Settings updated", settings });
}

module.exports = { getSettings, updateSettings };
