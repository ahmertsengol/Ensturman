// Console Filter for Browser Extension Errors
// Bu script'i browser console'da çalıştırın

// 1. SES Extension hatalarını filtrele
(function filterConsoleErrors() {
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;

  // SES extension hatalarını filtrele
  const filterSESErrors = (args) => {
    const message = args.join(' ');
    return message.includes('dateTaming') || 
           message.includes('mathTaming') || 
           message.includes('lockdown-install') ||
           message.includes('moz-extension://');
  };

  console.log = function(...args) {
    if (!filterSESErrors(args)) {
      originalLog.apply(console, args);
    }
  };

  console.warn = function(...args) {
    if (!filterSESErrors(args)) {
      originalWarn.apply(console, args);
    }
  };

  console.error = function(...args) {
    if (!filterSESErrors(args)) {
      originalError.apply(console, args);
    }
  };

  console.info('🧹 Console SES filter activated! Extension errors will be hidden.');
})();

// 2. EnsAI specific error tracker
window.EnsAI_ErrorTracker = {
  errors: [],
  track: function(error) {
    this.errors.push({
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      filename: error.filename,
      type: 'EnsAI'
    });
    console.group('🚨 EnsAI Error Detected');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.groupEnd();
  },
  getErrors: function() {
    return this.errors;
  },
  clear: function() {
    this.errors = [];
    console.info('🧹 EnsAI error log cleared');
  }
};

// 3. Global error listener sadece EnsAI hatalarını yakala
window.addEventListener('error', (e) => {
  // Extension hatalarını filtrele
  if (e.filename && e.filename.includes('moz-extension://')) {
    return; // Extension hatası, görmezden gel
  }
  
  // EnsAI hatalarını track et
  window.EnsAI_ErrorTracker.track(e);
});

// 4. Promise rejection'ları yakala
window.addEventListener('unhandledrejection', (e) => {
  // Extension hatalarını filtrele
  if (e.reason && e.reason.stack && e.reason.stack.includes('moz-extension://')) {
    return;
  }
  
  console.group('🚨 EnsAI Promise Rejection');
  console.error('Reason:', e.reason);
  console.groupEnd();
});

// 5. Console helper fonksiyonları
window.EnsAI_Debug = {
  clearAll: () => {
    console.clear();
    window.EnsAI_ErrorTracker.clear();
    console.info('🧹 Console and error log cleared');
  },
  
  showStats: () => {
    console.group('📊 EnsAI Debug Stats');
    console.info('Total EnsAI Errors:', window.EnsAI_ErrorTracker.errors.length);
    console.info('Last Error:', window.EnsAI_ErrorTracker.errors[window.EnsAI_ErrorTracker.errors.length - 1]);
    console.groupEnd();
  },
  
  testError: () => {
    throw new Error('🧪 Test EnsAI Error');
  }
};

console.info('🎯 EnsAI Debug tools loaded!');
console.info('Usage: EnsAI_Debug.clearAll(), EnsAI_Debug.showStats(), EnsAI_Debug.testError()'); 