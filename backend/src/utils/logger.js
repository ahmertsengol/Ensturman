const fs = require('fs');
const path = require('path');

// Loglama seviyeleri
const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

// Log dosyasının yolu
const LOG_DIR = path.join(__dirname, '../../logs');
const LOG_FILE = path.join(LOG_DIR, 'audio-app.log');
const ERROR_FILE = path.join(LOG_DIR, 'error.log');
const USER_ACTIVITY_FILE = path.join(LOG_DIR, 'user-activity.log');

// Logs klasörünü oluştur
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  console.log(`Created logs directory at: ${LOG_DIR}`);
}

/**
 * Tarih-saat bilgisini formatlı string olarak döndürür
 * @returns {string} ISO formatında tarih-saat bilgisi
 */
const getTimestamp = () => {
  return new Date().toISOString();
};

/**
 * Mesajı log dosyasına yazar
 * @param {string} level - Log seviyesi
 * @param {string} message - Log mesajı
 * @param {Object} details - İlave detaylar (opsiyonel)
 */
const writeToFile = (level, message, details = null) => {
  const timestamp = getTimestamp();
  let logMessage = `[${timestamp}] [${level}] ${message}`;
  
  if (details) {
    try {
      // Detaylı objeleri JSON formatında logla
      if (typeof details === 'object') {
        logMessage += `\n${JSON.stringify(details, null, 2)}`;
      } else {
        logMessage += ` - ${details}`;
      }
    } catch (err) {
      logMessage += ` - [Detaylar serileştirilemedi: ${err.message}]`;
    }
  }
  
  logMessage += '\n';
  
  try {
    // Ana log dosyasına yaz
    fs.appendFileSync(LOG_FILE, logMessage);
    
    // Hata durumunda error log dosyasına da yaz
    if (level === LOG_LEVELS.ERROR) {
      fs.appendFileSync(ERROR_FILE, logMessage);
    }
  } catch (err) {
    console.error(`Log dosyasına yazılamadı: ${err.message}`);
    console.error(logMessage); // Yedek olarak konsola yaz
  }
};

/**
 * Konsola ve log dosyasına error log yazar
 * @param {string} message - Log mesajı
 * @param {Object} details - İlave detaylar (opsiyonel)
 */
const error = (message, details = null) => {
  console.error(`[ERROR] ${message}`);
  writeToFile(LOG_LEVELS.ERROR, message, details);
};

/**
 * Konsola ve log dosyasına uyarı log yazar
 * @param {string} message - Log mesajı
 * @param {Object} details - İlave detaylar (opsiyonel)
 */
const warn = (message, details = null) => {
  console.warn(`[WARN] ${message}`);
  writeToFile(LOG_LEVELS.WARN, message, details);
};

/**
 * Konsola ve log dosyasına bilgi log yazar
 * @param {string} message - Log mesajı
 * @param {Object} details - İlave detaylar (opsiyonel)
 */
const info = (message, details = null) => {
  console.log(`[INFO] ${message}`);
  writeToFile(LOG_LEVELS.INFO, message, details);
};

/**
 * Sadece geliştirme ortamında konsola ve log dosyasına debug log yazar
 * @param {string} message - Log mesajı
 * @param {Object} details - İlave detaylar (opsiyonel)
 */
const debug = (message, details = null) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEBUG] ${message}`);
    writeToFile(LOG_LEVELS.DEBUG, message, details);
  }
};

/**
 * Ses dosyası işlemlerini loglar
 * @param {string} operation - İşlem tipi
 * @param {Object} fileInfo - Dosya bilgileri
 */
const audioFile = (operation, fileInfo) => {
  const message = `Audio file ${operation}`;
  
  // Hassas bilgileri temizle
  const cleanedInfo = { ...fileInfo };
  if (cleanedInfo.path) {
    // Tam disk yolunu gizle, sadece dosya adını göster
    cleanedInfo.filename = path.basename(cleanedInfo.path);
    delete cleanedInfo.path;
  }
  
  info(message, cleanedInfo);
};

/**
 * Kullanıcı aktivitelerini özel olarak loglar
 * @param {string} action - Kullanıcı aksiyonu (login, logout, vs.)
 * @param {Object} userData - Kullanıcı bilgileri
 * @param {Object} extraInfo - İlave bilgiler (ip, tarayıcı, vs.)
 */
const userActivity = (action, userData, extraInfo = {}) => {
  const timestamp = getTimestamp();
  
  try {
    // Hassas verileri temizle
    const cleanedUserData = { ...userData };
    delete cleanedUserData.password;
    delete cleanedUserData.token;
    
    const logEntry = {
      timestamp,
      action,
      user: cleanedUserData,
      ...extraInfo
    };
    
    // Kullanıcı aktivitesini özel dosyaya yaz
    fs.appendFileSync(
      USER_ACTIVITY_FILE, 
      JSON.stringify(logEntry) + '\n'
    );
    
    // Genel loga da ekle
    info(`User ${action}`, { userId: userData.id, username: userData.username, ...extraInfo });
  } catch (err) {
    error(`Failed to log user activity`, { 
      error: err.message, 
      action, 
      userId: userData?.id
    });
  }
};

/**
 * HTTP isteklerini loglar
 * @param {Object} req - Express request objesi
 * @param {Object} res - Express response objesi
 * @param {Function} next - Express next middleware fonksiyonu
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // İstek tamamlandığında çalışacak
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('user-agent'),
      ip: req.ip || req.connection.remoteAddress
    };
    
    // Status koduna göre loglama seviyesini belirle
    if (res.statusCode >= 500) {
      error(`HTTP ${res.statusCode} ${req.method} ${req.originalUrl}`, logData);
    } else if (res.statusCode >= 400) {
      warn(`HTTP ${res.statusCode} ${req.method} ${req.originalUrl}`, logData);
    } else {
      info(`HTTP ${res.statusCode} ${req.method} ${req.originalUrl}`, logData);
    }
  });
  
  next();
};

module.exports = {
  error,
  warn,
  info,
  debug,
  audioFile,
  userActivity,
  requestLogger
}; 