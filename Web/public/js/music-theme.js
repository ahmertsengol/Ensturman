// public/js/music-theme.js - Music theme functionality

document.addEventListener('DOMContentLoaded', function() {
  // Add music theme class to body
  document.body.classList.add('music-theme');
  
  // Create music notes container
  const musicNotesContainer = document.createElement('div');
  musicNotesContainer.className = 'music-notes-container';
  document.body.appendChild(musicNotesContainer);
  
  // Add fast note animation style and set background opacity
  addCustomStyles();
  
  // Create floating music notes
  createMusicNotes(musicNotesContainer, 15);
  
  // Add new notes periodically - more frequently (every 1.5 seconds instead of 3)
  setInterval(() => {
    if (document.hasFocus() && !isMobileDevice()) {
      createMusicNotes(musicNotesContainer, 2); // Create 2 notes at a time
    }
  }, 1500);
  
  // Update app logo and title
  updateAppLogo();
  
  // Enhance footer with additional elements
  enhanceFooter();
  
  // Add Montserrat font for the music theme
  addGoogleFont('Montserrat', '400,500,600,700');
  
  // Update website title
  if (document.title.includes('Voice Recorder')) {
    document.title = document.title.replace('Voice Recorder', 'Music Recorder');
  }
  
  // Highlight active navigation item
  highlightActiveNav();
});

// Function to update app logo with music note
function updateAppLogo() {
  const appTitle = document.querySelector('.app-title');
  if (appTitle) {
    // Create logo container
    const logoContainer = document.createElement('div');
    logoContainer.className = 'app-logo';
    
    // Create music note SVG
    logoContainer.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="music-logo-svg">
        <path d="M9 18V5l12-2v13"></path>
        <circle cx="6" cy="18" r="3"></circle>
        <circle cx="18" cy="16" r="3"></circle>
      </svg>
    `;
    
    // Get the text content
    const titleText = appTitle.textContent || 'Music Recorder';
    
    // Clear and rebuild the app title
    appTitle.innerHTML = '';
    appTitle.appendChild(logoContainer);
    
    // Add text element
    const textSpan = document.createElement('span');
    textSpan.textContent = titleText;
    appTitle.appendChild(textSpan);
  }
}

// Function to enhance footer with additional elements
function enhanceFooter() {
  const footer = document.querySelector('footer');
  if (!footer) return;
  
  // Add footer content container if it doesn't exist
  let footerContainer = footer.querySelector('.footer-content');
  if (!footerContainer) {
    footerContainer = document.createElement('div');
    footerContainer.className = 'footer-content';
    
    // Move existing content into the new container
    const existingContent = footer.querySelector('.container');
    if (existingContent) {
      // Clone existing content
      while (existingContent.firstChild) {
        footerContainer.appendChild(existingContent.firstChild);
      }
      // Replace with enhanced container
      existingContent.appendChild(footerContainer);
    } else {
      // Create new container structure
      const container = document.createElement('div');
      container.className = 'container';
      container.appendChild(footerContainer);
      footer.appendChild(container);
      
      // Add copyright text if none exists
      const copyright = document.createElement('p');
      copyright.innerHTML = '&copy; 2025 Music Recorder';
      footerContainer.appendChild(copyright);
    }
    
    // Add music icon decoration to footer
    const musicIcon = document.createElement('div');
    musicIcon.className = 'footer-music-icon';
    musicIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>';
    footerContainer.appendChild(musicIcon);
  }
}

// Function to add custom styles for all pages
function addCustomStyles() {
  // Create style element
  const style = document.createElement('style');
  
  // Define styles for faster animation and uniform background opacity
  style.textContent = `
    /* Make content fill the page for proper footer positioning */
    html, body.music-theme {
      height: 100%;
      min-height: 100%;
      margin: 0;
      padding: 0;
    }
    
    /* Main content should take available space to push footer down */
    body.music-theme {
      display: flex;
      flex-direction: column;
      background-color: var(--music-light);
      background-image: none;
      color: var(--music-gray-800);
      font-family: var(--music-font);
      transition: all 0.3s ease;
    }
    
    /* Fixed header styling */
    body.music-theme header {
      flex-shrink: 0;
      width: 100%;
      z-index: 100;
      position: relative;
      background: var(--music-gradient);
      box-shadow: var(--music-shadow);
      padding: 1rem 0;
      overflow: visible; /* Allow overflow for elements */
    }

    /* Container inside header */
    body.music-theme header .container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: 0 1rem;
      position: relative;
      z-index: 101;
    }

    /* Header buttons container */
    body.music-theme .header-buttons {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }
    
    /* Header Navigation */
    body.music-theme .header-nav {
      display: flex;
      gap: 1rem;
      align-items: center;
    }
    
    body.music-theme .header-nav a {
      color: white;
      text-decoration: none;
      font-weight: 500;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      transition: all 0.2s ease;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
      position: relative;
      z-index: 1;
    }
    
    body.music-theme .header-nav a:hover {
      background-color: rgba(255, 255, 255, 0.15);
      transform: translateY(-2px);
    }
    
    body.music-theme .header-nav a.active {
      background-color: rgba(255, 255, 255, 0.2);
      position: relative;
    }
    
    body.music-theme .header-nav a.active::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 50%;
      transform: translateX(-50%);
      width: 20px;
      height: 2px;
      background-color: white;
      border-radius: 1px;
    }
    
    /* Main content should grow to push footer */
    body.music-theme main {
      flex: 1 0 auto;
      display: flex;
      flex-direction: column;
      padding-top: 1rem;
    }
    
    /* Ensure container inside main also grows */
    body.music-theme main .container {
      flex: 1 0 auto;
      padding-bottom: 2rem;
    }
    
    /* Footer should not grow but stay at bottom */
    body.music-theme footer {
      flex-shrink: 0;
      width: 100%;
      background: var(--music-gradient);
    }
    
    /* Remove default gray logo from navbar */
    body.music-theme .app-title::before {
      display: none !important; /* Completely hide the gray logo */
    }
    
    /* Improved Button Styling */
    body.music-theme .btn {
      background: var(--music-gradient);
      border-radius: 50px;
      box-shadow: 0 4px 12px rgba(61, 44, 141, 0.3);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      font-weight: 700;
      letter-spacing: 0.3px;
      padding: 12px 24px;
      font-size: 0.95rem;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
      color: #f0f0f0 !important;
    }
    
    body.music-theme .btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 16px rgba(61, 44, 141, 0.4);
      filter: brightness(1.1);
    }
    
    body.music-theme .btn-primary {
      background: var(--music-gradient);
      color: #f0f0f0 !important;
      border: none;
    }
    
    body.music-theme .btn-accent {
      background-color: var(--music-accent);
      color: #f0f0f0 !important;
      border: none;
    }
    
    body.music-theme .btn-secondary {
      background-color: var(--music-secondary);
      color: #f0f0f0 !important;
      border: none;
    }
    
    body.music-theme .btn-outline {
      background: transparent;
      border: 2px solid rgba(255, 255, 255, 0.8);
      color: white !important;
    }
    
    body.music-theme .btn-outline:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: white;
      color: white !important;
    }
    
    /* Edit buttons specific styling */
    body.music-theme .btn-sm {
      padding: 8px 16px;
      font-size: 0.9rem;
      font-weight: 600;
    }
    
    body.music-theme .recording-actions .btn {
      min-width: 80px;
      text-align: center;
      display: inline-flex;
      justify-content: center;
      align-items: center;
    }
    
    body.music-theme .btn-danger {
      background-color: var(--music-error);
      border-color: var(--music-error);
    }
    
    body.music-theme .btn-danger:hover {
      background-color: #b30000;
      border-color: #b30000;
      box-shadow: 0 4px 12px rgba(213, 0, 0, 0.3);
    }
    
    /* Faster animation for notes */
    @keyframes fastFloatNote {
      0% {
        transform: translateY(100vh) rotate(0deg);
        opacity: 0.15;
      }
      50% {
        opacity: 0.25;
      }
      100% {
        transform: translateY(-100px) rotate(360deg);
        opacity: 0;
      }
    }
    
    /* App Logo Styling */
    .app-title {
      display: flex;
      align-items: center;
      gap: 12px;
      color: white;
      margin: 0; /* Remove any margin */
      padding: 0; /* Remove any padding */
      white-space: nowrap; /* Prevent wrapping */
    }
    
    .app-logo {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      min-width: 40px; /* Ensure logo doesn't shrink */
      background: linear-gradient(135deg, var(--music-secondary), var(--music-accent));
      border-radius: 50%;
      box-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
      overflow: hidden;
      animation: float 3s ease-in-out infinite;
    }
    
    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-5px); }
      100% { transform: translateY(0px); }
    }
    
    .music-logo-svg {
      width: 24px;
      height: 24px;
      color: white;
      filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.3));
      transition: transform 0.3s ease;
    }
    
    .app-logo:hover .music-logo-svg {
      transform: scale(1.1) rotate(5deg);
    }
    
    /* Consistent background opacity for all pages */
    body.music-theme::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(rgba(255, 255, 255, 0.85), rgba(243, 240, 255, 0.88));
      z-index: -1;
    }
    
    /* Override body background to remove SVG pattern */
    body.music-theme {
      background-color: var(--music-light);
      background-image: none;
    }
    
    /* Override loading overlay background to remove SVG pattern */
    body.music-theme .loading-overlay {
      background-color: var(--music-light);
      background-image: none;
    }
    
    /* Override button background to remove piano pattern */
    body.music-theme .btn::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: none;
      opacity: 0.05;
      z-index: 0;
    }
    
    /* Enhance music notes container position */
    .music-notes-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 0;
      overflow: hidden;
    }
    
    /* Semi-transparent content container */
    .container {
      position: relative;
      z-index: 1;
    }
    
    /* Enhanced Footer Styling */
    body.music-theme footer {
      background: linear-gradient(to right, var(--music-primary-dark), var(--music-primary));
      color: white;
      padding: 2rem 0;
      position: relative;
      overflow: hidden;
      margin-top: auto; /* Auto margin to push footer to bottom */
      box-shadow: 0 -4px 20px rgba(98, 0, 234, 0.15);
    }
    
    body.music-theme footer::before {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 5px;
      background: linear-gradient(to right, var(--music-secondary), var(--music-accent));
    }
    
    body.music-theme footer::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: none; /* Removed piano-keys-pattern.svg */
      opacity: 0.05;
      z-index: 0;
    }
    
    body.music-theme footer .container {
      position: relative;
      z-index: 1;
    }
    
    body.music-theme footer .footer-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
    }
    
    body.music-theme footer p {
      margin: 0;
      font-size: 0.9rem;
      letter-spacing: 0.5px;
    }
    
    body.music-theme .footer-music-icon {
      animation: pulse 2s infinite;
      color: rgba(255, 255, 255, 0.8);
    }
    
    /* Login and similar pages with little content */
    body.music-theme .form-container {
      margin-bottom: 2rem;
    }
    
    @media (max-width: 768px) {
      .app-logo {
        width: 36px;
        height: 36px;
        min-width: 36px;
      }
      
      .music-logo-svg {
        width: 20px;
        height: 20px;
      }
      
      body.music-theme .app-title {
        font-size: 1.2rem;
      }
      
      body.music-theme header .container {
        flex-wrap: wrap;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.5rem;
      }
      
      body.music-theme .header-buttons {
        gap: 0.3rem;
        flex-wrap: wrap;
        justify-content: center;
      }
      
      body.music-theme .btn {
        padding: 10px 16px;
        font-size: 0.95rem;
      }
      
      body.music-theme .btn-sm {
        padding: 8px 14px;
        font-size: 0.9rem;
      }
      
      body.music-theme footer .footer-content {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
      }
      
      body.music-theme footer {
        padding: 1.5rem 0;
      }
    }
  `;
  
  // Add style to document head
  document.head.appendChild(style);
}

// Function to highlight the active navigation link
function highlightActiveNav() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.header-nav a');
  
  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href');
    
    // Remove active class from all links
    link.classList.remove('active');
    
    // Add active class if the link path matches the current path
    if (currentPath === linkPath) {
      link.classList.add('active');
    }
  });
}

// Function to create floating music notes
function createMusicNotes(container, count) {
  for (let i = 0; i < count; i++) {
    const note = document.createElement('div');
    note.className = 'music-note';
    
    // Position note randomly
    note.style.left = `${Math.random() * 100}%`;
    note.style.top = `${100 + Math.random() * 20}%`;
    
    // Random size between 20px and 30px
    const size = 20 + Math.random() * 10;
    note.style.width = `${size}px`;
    note.style.height = `${size}px`;
    
    // Random animation duration between 12 and 20 seconds
    note.style.animationDuration = `${12 + Math.random() * 8}s`;
    
    // Random animation delay
    note.style.animationDelay = `${Math.random() * 5}s`;
    
    // Apply random color
    const colorIndex = Math.floor(Math.random() * 5);
    const colors = ['#3d2c8d', '#916bbf', '#c996cc', '#d38ba3', '#ea4f6d'];
    note.style.filter = `drop-shadow(0 0 3px ${colors[colorIndex]})`;
    
    // Add to container
    container.appendChild(note);
    
    // Remove after animation ends
    setTimeout(() => {
      if (note.parentNode === container) {
        container.removeChild(note);
      }
    }, 25000); // Slightly longer than the max animation duration
  }
}

// Function to detect mobile devices
function isMobileDevice() {
  return (window.innerWidth <= 768) || 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Function to add Google Font
function addGoogleFont(fontFamily, fontWeights) {
  if (!document.querySelector(`link[href*="fonts.googleapis.com/css2?family=${fontFamily}"]`)) {
    const fontLink = document.createElement('link');
    fontLink.rel = 'preconnect';
    fontLink.href = 'https://fonts.googleapis.com';
    document.head.appendChild(fontLink);
    
    const gstaticLink = document.createElement('link');
    gstaticLink.rel = 'preconnect';
    gstaticLink.href = 'https://fonts.gstatic.com';
    gstaticLink.crossOrigin = 'anonymous';
    document.head.appendChild(gstaticLink);
    
    const font = document.createElement('link');
    font.rel = 'stylesheet';
    font.href = `https://fonts.googleapis.com/css2?family=${fontFamily}:wght@${fontWeights}&display=swap`;
    document.head.appendChild(font);
  }
} 