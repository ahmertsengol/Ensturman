const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const logger = require('./logger');

/**
 * Audio Format Converter Utility
 * Converts WebM/other formats to mobile-compatible M4A/AAC
 */

/**
 * Detect audio format from file
 */
const detectAudioFormat = async (filePath) => {
  try {
    const { execSync } = require('child_process');
    const output = execSync(`file "${filePath}"`, { encoding: 'utf8' });
    
    const format = {
      isWebM: output.includes('WebM'),
      isM4A: output.includes('ISO Media') && (output.includes('M4A') || output.includes('AAC')),
      isMobileCompatible: false
    };
    
    format.isMobileCompatible = format.isM4A;
    
    logger.info('Audio format detected', {
      filePath: path.basename(filePath),
      output: output.trim(),
      format
    });
    
    return format;
  } catch (error) {
    logger.error('Failed to detect audio format', { 
      filePath: path.basename(filePath),
      error: error.message 
    });
    return { isWebM: false, isM4A: false, isMobileCompatible: false };
  }
};

/**
 * Convert audio file to mobile-compatible M4A format
 */
const convertToM4A = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    logger.info('Starting audio conversion', {
      input: path.basename(inputPath),
      output: path.basename(outputPath)
    });

    ffmpeg(inputPath)
      .audioCodec('aac')           // Use AAC codec (mobile compatible)
      .audioBitrate('128k')        // Same bitrate as mobile
      .audioChannels(1)            // Mono like mobile
      .audioFrequency(44100)       // Same sample rate as mobile
      .format('mp4')               // MP4 container for M4A
      .outputOptions([
        '-movflags', '+faststart',  // Optimize for streaming
        '-profile:a', 'aac_low'     // AAC-LC profile (mobile compatible)
      ])
      .on('start', (commandLine) => {
        logger.debug('FFmpeg conversion started', { commandLine });
      })
      .on('progress', (progress) => {
        logger.debug('Conversion progress', { 
          percent: progress.percent?.toFixed(2) + '%' || 'N/A',
          currentKbps: progress.currentKbps || 'N/A'
        });
      })
      .on('end', () => {
        logger.info('Audio conversion completed successfully', {
          input: path.basename(inputPath),
          output: path.basename(outputPath)
        });
        resolve(outputPath);
      })
      .on('error', (error) => {
        logger.error('Audio conversion failed', {
          input: path.basename(inputPath),
          output: path.basename(outputPath),
          error: error.message
        });
        reject(error);
      })
      .save(outputPath);
  });
};

/**
 * Process uploaded audio file and convert if necessary
 */
const processAudioFile = async (filePath) => {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }

    // Detect current format
    const format = await detectAudioFormat(filePath);
    
    if (format.isMobileCompatible) {
      logger.info('File is already mobile compatible', {
        file: path.basename(filePath)
      });
      return { 
        converted: false, 
        finalPath: filePath,
        originalFormat: 'M4A/AAC'
      };
    }

    if (format.isWebM) {
      logger.info('WebM detected, converting to M4A', {
        file: path.basename(filePath)
      });

      // Generate new filename with .m4a extension
      const originalDir = path.dirname(filePath);
      const originalName = path.basename(filePath, path.extname(filePath));
      const convertedPath = path.join(originalDir, `${originalName}_converted.m4a`);

      // Convert to M4A
      await convertToM4A(filePath, convertedPath);

      // Replace original file with converted one
      fs.unlinkSync(filePath); // Delete original WebM
      fs.renameSync(convertedPath, filePath); // Rename converted to original name
      
      logger.info('File conversion completed and replaced', {
        originalFile: path.basename(filePath),
        format: 'WebM -> M4A/AAC'
      });

      return { 
        converted: true, 
        finalPath: filePath,
        originalFormat: 'WebM'
      };
    }

    // For other formats, try to convert anyway
    logger.warn('Unknown format detected, attempting conversion', {
      file: path.basename(filePath)
    });

    const originalDir = path.dirname(filePath);
    const originalName = path.basename(filePath, path.extname(filePath));
    const convertedPath = path.join(originalDir, `${originalName}_converted.m4a`);

    try {
      await convertToM4A(filePath, convertedPath);
      fs.unlinkSync(filePath);
      fs.renameSync(convertedPath, filePath);
      
      return { 
        converted: true, 
        finalPath: filePath,
        originalFormat: 'Unknown'
      };
    } catch (conversionError) {
      logger.warn('Conversion failed, keeping original file', {
        file: path.basename(filePath),
        error: conversionError.message
      });
      
      return { 
        converted: false, 
        finalPath: filePath,
        originalFormat: 'Unknown (conversion failed)'
      };
    }

  } catch (error) {
    logger.error('Audio processing failed', {
      file: path.basename(filePath),
      error: error.message
    });
    throw error;
  }
};

module.exports = {
  detectAudioFormat,
  convertToM4A,
  processAudioFile
}; 