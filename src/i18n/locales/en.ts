export default {
  // App title
  appTitle: 'EVADE',

  // Common
  common: {
    back: 'Back',
    play: 'Play',
    retry: 'Retry',
    menu: 'Menu',
    cancel: 'Cancel',
    clear: 'Clear',
  },

  // Main Menu
  mainMenu: {
    highScores: 'High Scores',
    howToPlay: 'How to Play',
    settings: 'Settings',
    shop: 'Shop',
  },

  // Play Screen
  play: {
    touchToStart: 'TOUCH TO START',
    gameOver: 'GAME OVER',
  },

  // Continue Modal
  continue: {
    title: 'Continue?',
    watchAd: 'Watch Ad to Continue',
    decline: 'No Thanks',
  },

  // Settings Screen
  settings: {
    title: 'Settings',
    audio: 'Audio',
    backgroundMusic: 'Background Music',
    soundEffects: 'Sound Effects',
    vibration: 'Vibration',
    controls: 'Controls',
    handedness: 'Handedness',
    left: 'Left',
    right: 'Right',
    handednessHelp: "Enemies won't spawn where your palm blocks the screen",
    purchases: 'Purchases',
    removeAds: 'Remove Ads',
    adsRemoved: 'Ads Removed',
    restorePurchases: 'Restore Purchases',
    resetAll: 'Reset All',
    resetConfirmTitle: 'Reset All Data',
    resetConfirmMessage:
      'This will reset all settings, high scores, cosmetics, and shards to their default values. Purchases will not be affected. This cannot be undone.',
  },

  // High Scores Screen
  highScores: {
    title: 'High Scores',
    clearAllScores: 'Clear All Scores',
    clearConfirmTitle: 'Clear All Scores',
    clearConfirmMessage: 'Are you sure you want to delete all high scores? This cannot be undone.',
    noScoresYet: 'No scores yet!',
    playToSetScore: 'Play a game to set your first high score.',
    rank: '#',
    score: 'Score',
    date: 'Date',
  },

  // Instructions Screen
  instructions: {
    title: 'HOW TO PLAY',
    goal: 'GOAL',
    goalText: 'Survive as long as possible by evading enemies.',
    controlsTitle: 'CONTROLS',
    controlsText:
      'Touch and drag to move your player (green dot). Keep your finger on the screen - lifting it ends the game!',
    enemies: 'ENEMIES',
    shapeShowsSpeed: 'Shape shows speed:',
    slow: 'Slow',
    medium: 'Medium',
    fast: 'Fast',
    colorShowsLifetime: 'Color shows remaining lifetime:',
    new: 'New',
    half: 'Half',
    fading: 'Fading',
    boosters: 'BOOSTERS',
    boostersText: 'Green octagons appear periodically. Collect them for power-ups:',
    bonusPoints: '+10 bonus points',
    shield: 'Shield - survive one hit',
    multiplier: '3x points for 5 seconds',
    tips: 'TIPS',
    tip1: 'Stay near the center for more escape routes',
    tip2: 'Yellow enemies are about to disappear',
    tip3: 'Prioritize shield boosters when surrounded',
    tip4: 'Faster enemies give more points',
    startPlaying: 'START PLAYING',
    gotIt: 'GOT IT',
  },

  // Shop Screen
  shop: {
    title: 'Shop',
    equipped: 'Equipped',
    owned: 'Owned',
    free: 'Free',
    buy: 'Buy',
    insufficientShards: 'Not Enough Shards',
    needMoreShards: 'You need {{amount}} more shards.',
    confirmPurchase: 'Confirm Purchase',
    purchaseMessage: 'Buy {{name}} for {{price}} shards?',
    earnShards: 'Earn Shards',
    watchAd: 'Watch Ad (+10 💎)',
    adsRemaining: '{{count}} ads remaining today',
    noAdsLeft: 'Come back tomorrow for more!',
    buyShards: 'Buy Shards',
    adFailed: 'Ad not available. Please try again later.',
  },
};
