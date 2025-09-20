const express = require('express');
const cors = require('cors');

const app = express();
const port = 4001;

app.use(cors());
app.use(express.json());

const logger = {
  debug: (message) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`);
    }
  },
  info: (message) => console.log(`[INFO] ${new Date().toISOString()} - ${message}`),
  warn: (message) => console.warn(`[WARN] ${new Date().toISOString()} - ${message}`),
  error: (message, error) => console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error)
};


app.listen(port, () => {
  logger.info(`🚀 OFFER-HUB server is live at http://localhost:${port}`);
  logger.debug("Server configuration loaded"); 
  logger.info("🌐 Connecting freelancers and clients around the world...");
  logger.debug("CORS and JSON middleware initialized");
  logger.info("✅ Working...");
});