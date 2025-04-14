// middlewares/fonts.js - Font middleware to handle missing fonts
const path = require('path');
const fs = require('fs');
const logger = require('../config/logger');
const https = require('https');
const url = require('url');

// Fonts dizini kontrolü
const fontDirectory = path.join(__dirname, '../public/fonts/inter');
if (!fs.existsSync(fontDirectory)) {
  fs.mkdirSync(fontDirectory, { recursive: true });
  logger.info('Inter font directory created');
}

// Font URL'lerini tanımla - Google Fonts'a alternatif
const FONT_URLS = {
  'Inter-Regular.woff2': 'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2',
  'Inter-Medium.woff2': 'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2',
  'Inter-SemiBold.woff2': 'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2',
  'Inter-Bold.woff2': 'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2',
  'Inter-Regular.woff': 'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff',
  'Inter-Medium.woff': 'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff',
  'Inter-SemiBold.woff': 'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff',
  'Inter-Bold.woff': 'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff',
  'Inter-Light.woff2': 'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2',
  'Inter-Light.woff': 'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff'
};

// Google Fonts CSS'ini işle
function handleGoogleFontsCSS(req, res) {
  // İstek URL'sini parse et ve parametreleri al
  const parsedUrl = url.parse(req.url, true);
  const fontQuery = parsedUrl.query.family || 'Inter:wght@300;400;500;600;700';
  
  logger.info(`Handling Google Fonts request for: ${fontQuery}`);
  
  // Google Fonts CSS dosyasını oluştur
  const cssContent = `
/* Inter font - Local proxy to avoid MIME type issues */
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 300;
  font-display: swap;
  src: url('/fonts/inter/Inter-Light.woff2') format('woff2'),
       url('/fonts/inter/Inter-Light.woff') format('woff');
}
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/inter/Inter-Regular.woff2') format('woff2'),
       url('/fonts/inter/Inter-Regular.woff') format('woff');
}
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url('/fonts/inter/Inter-Medium.woff2') format('woff2'),
       url('/fonts/inter/Inter-Medium.woff') format('woff');
}
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url('/fonts/inter/Inter-SemiBold.woff2') format('woff2'),
       url('/fonts/inter/Inter-SemiBold.woff') format('woff');
}
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('/fonts/inter/Inter-Bold.woff2') format('woff2'),
       url('/fonts/inter/Inter-Bold.woff') format('woff');
}`;

  // CSS içeriğini gönder
  res.set('Content-Type', 'text/css');
  return res.send(cssContent);
}

/**
 * Font middleware - Google Fonts'tan eksik fontları yükleme ve önbelleğe alma
 */
module.exports = function(req, res, next) {
  // Google Fonts CSS isteklerini işle
  if (req.url.includes('fonts.googleapis.com')) {
    return handleGoogleFontsCSS(req, res);
  }
  
  // Fonts.gstatic.com isteklerini yerel fontlara yönlendir
  if (req.url.includes('fonts.gstatic.com')) {
    const fontFileName = path.basename(req.url);
    const fontFormat = fontFileName.endsWith('.woff2') ? 'woff2' : 'woff';
    
    // Uygun bir yerel font dosyasına yönlendir
    if (fontFileName.includes('inter') || fontFileName.includes('Inter')) {
      if (fontFileName.includes('300') || fontFileName.includes('Light')) {
        return res.redirect('/fonts/inter/Inter-Light.' + fontFormat);
      } else if (fontFileName.includes('400') || fontFileName.includes('Regular')) {
        return res.redirect('/fonts/inter/Inter-Regular.' + fontFormat);
      } else if (fontFileName.includes('500') || fontFileName.includes('Medium')) {
        return res.redirect('/fonts/inter/Inter-Medium.' + fontFormat);
      } else if (fontFileName.includes('600') || fontFileName.includes('SemiBold')) {
        return res.redirect('/fonts/inter/Inter-SemiBold.' + fontFormat);
      } else if (fontFileName.includes('700') || fontFileName.includes('Bold')) {
        return res.redirect('/fonts/inter/Inter-Bold.' + fontFormat);
      }
    }
  }
  
  // Eğer font talebi varsa ve local olarak mevcut değilse
  if (req.url.includes('/fonts/inter/')) {
    const fontPathParts = req.url.split('/');
    const fontFileName = fontPathParts[fontPathParts.length - 1];
    const filePath = path.join(__dirname, '../public', req.url);
    
    // Eğer dosya zaten mevcutsa, doğrudan sun
    if (fs.existsSync(filePath)) {
      const fontFormat = fontFileName.endsWith('.woff2') ? 'woff2' : 'woff';
      res.set('Content-Type', `font/${fontFormat}`);
      return fs.createReadStream(filePath).pipe(res);
    }
    
    // Dosya mevcut değilse, indir
    const fontUrl = FONT_URLS[fontFileName];
    if (!fontUrl) {
      logger.error(`Unknown font requested: ${fontFileName}`);
      return next();
    }
    
    logger.info(`Downloading missing font: ${fontFileName}`);
    const fileStream = fs.createWriteStream(filePath);
    
    https.get(fontUrl, (response) => {
      if (response.statusCode === 200) {
        response.pipe(fileStream);
        
        fileStream.on('finish', () => {
          fileStream.close();
          logger.info(`Font downloaded and saved: ${fontFileName}`);
          
          // Font dosyasını gönder
          const fontFormat = fontFileName.endsWith('.woff2') ? 'woff2' : 'woff';
          res.set('Content-Type', `font/${fontFormat}`);
          fs.createReadStream(filePath).pipe(res);
        });
      } else {
        logger.error(`Failed to download font: ${fontFileName}, status: ${response.statusCode}`);
        next(); // Bir sonraki middleware'e geç
      }
    }).on('error', (err) => {
      logger.error(`Error downloading font: ${err.message}`);
      next(); // Bir sonraki middleware'e geç
    });
  } else {
    next(); // Font talebi değilse bir sonraki middleware'e geç
  }
}; 