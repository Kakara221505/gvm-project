const messages = require('../utils/messages');
const commonFunctions = require('../utils/commonFunctions');
const fs = require('fs');
const path = require('path');

async function getDetailsOfZipCode(req, res, next) {
  const { zipCode } = req.body;
  try {
    const details = await commonFunctions.getZipCodeDetails(zipCode);
    return res.status(200).json({ data: details, status: messages.success.STATUS });
  } catch (error) {
    return next(error);
  }
}

async function getZipcodeAndAreaFromLatLong(req, res, next) {
  const { lat, lng } = req.body;
  try {
    const details = await commonFunctions.getZipcodeAndArea(lat, lng);
    return res.status(200).json({ data: details, status: messages.success.STATUS });
  } catch (error) {
    return next(error);
  }
}


async function getLogDetails(req, res, next) {
  try {
    const folderPath = process.env.LOG_PATH;

    // Read all files in the folder
    const files = fs.readdirSync(folderPath);

    // Filter out non-log files if needed
    const logFiles = files.filter(file => file.endsWith('.log'));

    // Sort files by modification time in descending order
    const sortedFiles = logFiles.sort((a, b) => {
      return fs.statSync(path.join(folderPath, b)).mtime.getTime() - fs.statSync(path.join(folderPath, a)).mtime.getTime();
    });

    if (sortedFiles.length > 0) {
      // Read the content of the latest file
      const latestFile = sortedFiles[0];
      const filePath = path.join(folderPath, latestFile);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const logEntries = fileContent.split(/\n(?=\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z \[ERROR\])/);

      if (logEntries && logEntries.length > 0) {
        const formattedLog = logEntries.map(entry => {
          const match = entry.match(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z) \[ERROR\]: (.*)/);
          if (match) {
            const [, timestamp, details] = match;
            return { timestamp, details: entry };
          }
          return null;
        }).filter(entry => entry !== null);

        formattedLog.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        return res.status(200).json({ data: formattedLog, status: messages.success.STATUS });
      } else {
        return res.status(404).json({ status: 'error', message: 'No log entries found in the specified file' });
      }
    } else {
      return res.status(404).json({ status: 'error', message: 'No log files found in the specified folder' });
    }
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getDetailsOfZipCode,
  getZipcodeAndAreaFromLatLong,
  getLogDetails
};