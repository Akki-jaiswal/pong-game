// theme.js - Theme Management System for Pong Game
// This module handles dynamic theme switching and persistence

/**
 * Available themes configuration
 */
const THEMES = {
    'default': {
        name: 'Default',
        class: '' // No class needed for default theme
    },
    'neon-retro': {
        name: 'Neon Retro',
        class: 'theme-neon-retro'
    },
    'dark-mode': {
        name: 'Dark Mode',
        class: 'theme-dark-mode'
    },
    'ocean-blue': {
        name: 'Ocean Blue',
        class: 'theme-ocean-blue'
    }
};

/**
 * Theme Manager Class
 * Handles theme switching, persistence, and canvas element updates
 */
class ThemeManager {
    constructor() {
        this.currentTheme = 'default';
        this.themeSelector = null;
        this.canvas = null;
        this.body = document.body;
        
        // Initialize theme manager
        this.init();
    }

    /**
     * Initialize the theme manager
     */
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    /**
     * Setup theme manager after DOM is ready
     */
    setup() {
        this.themeSelector = document.getElementById('themeSelector');
        this.canvas = document.getElementById('gameCanvas');
        
        if (!this.themeSelector) {
            console.warn('Theme selector not found. Theme switching will not be available.');
            return;
        }

        // Load saved theme from localStorage
        this.loadSavedTheme();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Apply initial theme
        this.applyTheme(this.currentTheme);
    }

    /**
     * Setup event listeners for theme selection
     */
    setupEventListeners() {
        if (this.themeSelector) {
            this.themeSelector.addEventListener('change', (event) => {
                const selectedTheme = event.target.value;
                this.switchTheme(selectedTheme);
            });
        }
    }

    /**
     * Load saved theme from localStorage
     */
    loadSavedTheme() {
        try {
            const savedTheme = localStorage.getItem('pong-game-theme');
            if (savedTheme && THEMES[savedTheme]) {
                this.currentTheme = savedTheme;
                if (this.themeSelector) {
                    this.themeSelector.value = savedTheme;
                }
            }
        } catch (error) {
            console.warn('Could not load saved theme:', error);
        }
    }

    /**
     * Save current theme to localStorage
     */
    saveTheme() {
        try {
            localStorage.setItem('pong-game-theme', this.currentTheme);
        } catch (error) {
            console.warn('Could not save theme:', error);
        }
    }

    /**
     * Switch to a new theme
     * @param {string} themeKey - The theme key to switch to
     */
    switchTheme(themeKey) {
        if (!THEMES[themeKey]) {
            console.warn(`Theme "${themeKey}" not found. Available themes:`, Object.keys(THEMES));
            return;
        }

        // Remove current theme class
        if (THEMES[this.currentTheme] && THEMES[this.currentTheme].class) {
            this.body.classList.remove(THEMES[this.currentTheme].class);
        }

        // Update current theme
        this.currentTheme = themeKey;

        // Apply new theme
        this.applyTheme(themeKey);

        // Save to localStorage
        this.saveTheme();

        // Trigger custom event for other parts of the app to listen to
        this.dispatchThemeChangeEvent(themeKey);
    }

    /**
     * Apply a theme to the document
     * @param {string} themeKey - The theme key to apply
     */
    applyTheme(themeKey) {
        const theme = THEMES[themeKey];
        if (!theme) return;

        // Apply theme class to body
        if (theme.class) {
            this.body.classList.add(theme.class);
        }

        // Update canvas rendering context if needed
        this.updateCanvasTheming();

        // Add subtle transition effect for smoother theme switching
        this.addTransitionEffect();
    }

    /**
     * Update canvas-specific theming if needed
     * This method can be extended to update canvas rendering colors
     */
    updateCanvasTheming() {
        if (!this.canvas) return;

        // Get computed styles for the current theme
        const computedStyles = getComputedStyle(document.documentElement);
        
        // Store theme colors that might be needed by the game rendering
        this.currentThemeColors = {
            paddleColor: computedStyles.getPropertyValue('--paddle-color').trim(),
            ballColor: computedStyles.getPropertyValue('--ball-color').trim(),
            paddleGlow: computedStyles.getPropertyValue('--paddle-glow').trim(),
            ballGlow: computedStyles.getPropertyValue('--ball-glow').trim(),
            centerLineColor: computedStyles.getPropertyValue('--center-line-color').trim()
        };
    }

    /**
     * Add transition effect for smoother theme switching
     */
    addTransitionEffect() {
        this.body.style.transition = 'background 0.5s ease';
        
        // Remove transition after animation completes
        setTimeout(() => {
            this.body.style.transition = '';
        }, 500);
    }

    /**
     * Dispatch custom theme change event
     * @param {string} themeKey - The new theme key
     */
    dispatchThemeChangeEvent(themeKey) {
        const event = new CustomEvent('themeChanged', {
            detail: {
                theme: themeKey,
                themeName: THEMES[themeKey].name,
                colors: this.currentThemeColors
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * Get current theme information
     * @returns {Object} Current theme info
     */
    getCurrentTheme() {
        return {
            key: this.currentTheme,
            name: THEMES[this.currentTheme].name,
            class: THEMES[this.currentTheme].class,
            colors: this.currentThemeColors
        };
    }

    /**
     * Get all available themes
     * @returns {Object} All themes configuration
     */
    getAvailableThemes() {
        return { ...THEMES };
    }

    /**
     * Reset to default theme
     */
    resetToDefault() {
        this.switchTheme('default');
    }
}

// Create and export theme manager instance
const themeManager = new ThemeManager();

// Export for use in other modules
export default themeManager;
export { THEMES, ThemeManager };
