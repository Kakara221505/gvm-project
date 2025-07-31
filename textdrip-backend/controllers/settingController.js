const Settings = require("../models/Setting");

async function getUserSettings(req, res) {
  try {
    const userId = req.user.id;
    const { chatId = null, groupId = null, channelId = null } = req.query;

    if (!chatId && !groupId && !channelId) {
      return res.status(400).json({ error: "chatId, groupId or channelId is required" });
    }

    const filter = {
      userId,
      ...(chatId && { chatId }),
      ...(groupId && { groupId }),
      ...(channelId && { channelId }),
    };

    const settings = await Settings.findOne(filter);

    return res.status(200).json({
      data: settings || null,
      message: settings ? "Settings fetched successfully" : "No settings found",
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return res.status(500).json({ error: "Error fetching settings" });
  }
}

async function updateUserSettings(req, res) {
  try {
    const userId = req.user.id;
    const { chatId = null, groupId = null, channelId = null, muteNotification, background, chatColor } = req.body;

    if (!chatId && !groupId && !channelId) {
      return res.status(400).json({ error: "chatId, groupId or channelId is required" });
    }

    const filter = {
      userId,
      ...(chatId && { chatId }),
      ...(groupId && { groupId }),
      ...(channelId && { channelId }),
    };

    const update = {
      ...(muteNotification !== undefined && { muteNotification }),
      ...(background && { background }),
      ...(chatColor && { chatColor }),
    };

    const settings = await Settings.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });

    return res.status(200).json({
      data: settings,
      message: "Settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return res.status(500).json({ error: "Error updating settings" });
  }
}

module.exports = {
  getUserSettings,
  updateUserSettings,
};
