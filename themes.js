// themes.js - Multi-Theme Support System for Pong Game

// Theme definitions with CSS custom properties
export const themes = {
    default: {
        name: "Default Neon",
        description: "Original neon aesthetic with animated gradients",
        properties: {
            // Background gradients
            '--bg-gradient': 'linear-gradient(-45deg, #1a1a2e, #16213e, #0f3460, #533483)',
            '--canvas-gradient': 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #1e3c72 100%)',
            '--title-gradient': 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4)',
            '--welcome-title-gradient': 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1)',
            '--gameover-title-gradient': 'linear-gradient(45deg, #ffd700, #ffed4e, #ff6b6b)',
            
            // Glass morphism effects
            '--glass-bg': 'rgba(255, 255, 255, 0.1)',
            '--glass-border': 'rgba(255, 255, 255, 0.2)',
            '--glass-hover': 'rgba(255, 255, 255, 0.25)',
            '--glass-shadow': 'rgba(31, 38, 135, 0.37)',
            
            // Particle effects
            '--particle-color': 'rgba(255,255,255,0.1)',
            '--particle-opacity': '1',
            
            // Game elements
            '--paddle-color': 'rgba(255, 255, 255, 0.9)',
            '--ball-color': 'rgba(255, 255, 255, 0.95)',
            '--centerline-color': 'rgba(255, 255, 255, 0.3)',
            
            // Text colors
            '--text-primary': 'white',
            '--text-shadow': 'rgba(255, 255, 255, 0.5)',
            '--placeholder-color': 'rgba(255, 255, 255, 0.7)'
        }
    },
    
    neonRetro: {
        name: "Neon Retro",
        description: "80s cyberpunk vibes with electric colors",
        properties: {
            '--bg-gradient': 'linear-gradient(-45deg, #2d1b69, #0c0c0c, #ff006e, #8338ec)',
            '--canvas-gradient': 'linear-gradient(135deg, #ff006e 0%, #8338ec 50%, #3a86ff 100%)',
            '--title-gradient': 'linear-gradient(45deg, #ff006e, #8338ec, #3a86ff, #06ffa5)',
            '--welcome-title-gradient': 'linear-gradient(45deg, #ff006e, #8338ec, #06ffa5)',
            '--gameover-title-gradient': 'linear-gradient(45deg, #06ffa5, #8338ec, #ff006e)',
            
            '--glass-bg': 'rgba(255, 0, 110, 0.15)',
            '--glass-border': 'rgba(131, 56, 236, 0.3)',
            '--glass-hover': 'rgba(255, 0, 110, 0.25)',
            '--glass-shadow': 'rgba(255, 0, 110, 0.4)',
            
            '--particle-color': 'rgba(131, 56, 236, 0.2)',
            '--particle-opacity': '1',
            
            '--paddle-color': 'rgba(6, 255, 165, 0.9)',
            '--ball-color': 'rgba(255, 0, 110, 0.95)',
            '--centerline-color': 'rgba(131, 56, 236, 0.5)',
            
            '--text-primary': '#06ffa5',
            '--text-shadow': 'rgba(6, 255, 165, 0.8)',
            '--placeholder-color': 'rgba(6, 255, 165, 0.7)'
        }
    },
    
    darkMode: {
        name: "Dark Mode",
        description: "Sleek dark theme with subtle accents",
        properties: {
            '--bg-gradient': 'linear-gradient(-45deg, #0d1117, #161b22, #21262d, #30363d)',
            '--canvas-gradient': 'linear-gradient(135deg, #21262d 0%, #30363d 50%, #21262d 100%)',
            '--title-gradient': 'linear-gradient(45deg, #f0f6fc, #7c3aed, #06b6d4, #10b981)',
            '--welcome-title-gradient': 'linear-gradient(45deg, #f0f6fc, #7c3aed, #06b6d4)',
            '--gameover-title-gradient': 'linear-gradient(45deg, #fbbf24, #f59e0b, #ef4444)',
            
            '--glass-bg': 'rgba(240, 246, 252, 0.05)',
            '--glass-border': 'rgba(240, 246, 252, 0.1)',
            '--glass-hover': 'rgba(240, 246, 252, 0.1)',
            '--glass-shadow': 'rgba(0, 0, 0, 0.3)',
            
            '--particle-color': 'rgba(240, 246, 252, 0.05)',
            '--particle-opacity': '0.7',
            
            '--paddle-color': 'rgba(240, 246, 252, 0.8)',
            '--ball-color': 'rgba(124, 58, 237, 0.9)',
            '--centerline-color': 'rgba(240, 246, 252, 0.2)',
            
            '--text-primary': '#f0f6fc',
            '--text-shadow': 'rgba(124, 58, 237, 0.5)',
            '--placeholder-color': 'rgba(240, 246, 252, 0.6)'
        }
    },
    
    minimalist: {
        name: "Minimalist",
        description: "Clean and simple design with subtle gradients",
        properties: {
            '--bg-gradient': 'linear-gradient(-45deg, #f8fafc, #e2e8f0, #cbd5e1, #94a3b8)',
            '--canvas-gradient': 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 50%, #e2e8f0 100%)',
            '--title-gradient': 'linear-gradient(45deg, #1e293b, #475569, #64748b, #334155)',
            '--welcome-title-gradient': 'linear-gradient(45deg, #1e293b, #475569, #64748b)',
            '--gameover-title-gradient': 'linear-gradient(45deg, #dc2626, #ea580c, #d97706)',
            
            '--glass-bg': 'rgba(30, 41, 59, 0.05)',
            '--glass-border': 'rgba(30, 41, 59, 0.1)',
            '--glass-hover': 'rgba(30, 41, 59, 0.1)',
            '--glass-shadow': 'rgba(30, 41, 59, 0.1)',
            
            '--particle-color': 'rgba(30, 41, 59, 0.03)',
            '--particle-opacity': '0.5',
            
            '--paddle-color': 'rgba(30, 41, 59, 0.8)',
            '--ball-color': 'rgba(71, 85, 105, 0.9)',
            '--centerline-color': 'rgba(30, 41, 59, 0.3)',
            
            '--text-primary': '#1e293b',
            '--text-shadow': 'rgba(30, 41, 59, 0.3)',
            '--placeholder-color': 'rgba(30, 41, 59, 0.6)'
        }
    },
    
    oceanBlue: {
        name: "Ocean Blue",
        description: "Calming ocean depths with aquatic colors",
        properties: {
            '--bg-gradient': 'linear-gradient(-45deg, #0c4a6e, #075985, #0369a1, #0284c7)',
            '--canvas-gradient': 'linear-gradient(135deg, #164e63 0%, #155e75 50%, #0891b2 100%)',
            '--title-gradient': 'linear-gradient(45deg, #67e8f9, #22d3ee, #06b6d4, #0891b2)',
            '--welcome-title-gradient': 'linear-gradient(45deg, #67e8f9, #22d3ee, #06b6d4)',
            '--gameover-title-gradient': 'linear-gradient(45deg, #fbbf24, #f59e0b, #22d3ee)',
            
            '--glass-bg': 'rgba(103, 232, 249, 0.1)',
            '--glass-border': 'rgba(34, 211, 238, 0.2)',
            '--glass-hover': 'rgba(103, 232, 249, 0.2)',
            '--glass-shadow': 'rgba(34, 211, 238, 0.3)',
            
            '--particle-color': 'rgba(103, 232, 249, 0.15)',
            '--particle-opacity': '1',
            
            '--paddle-color': 'rgba(103, 232, 249, 0.9)',
            '--ball-color': 'rgba(34, 211, 238, 0.95)',
            '--centerline-color': 'rgba(103, 232, 249, 0.4)',
            
            '--text-primary': '#cffafe',
            '--text-shadow': 'rgba(103, 232, 249, 0.6)',
            '--placeholder-color': 'rgba(207, 250, 254, 0.7)'
        }
    }
};

// Theme management class
export class ThemeManager {
    constructor() {
        this.currentTheme = 'default';
        this.root = document.documentElement;
        this.initializeTheme();
    }
    
    // Initialize theme system
    initializeTheme() {
        // Apply default theme on initialization
        this.applyTheme(this.currentTheme);
        
        // Try to load saved theme from localStorage
        const savedTheme = localStorage.getItem('pongGameTheme');
        if (savedTheme && themes[savedTheme]) {
            this.applyTheme(savedTheme);
        }
    }
    
    // Apply a theme by setting CSS custom properties
    applyTheme(themeKey) {
        if (!themes[themeKey]) {
            console.warn(`Theme '${themeKey}' not found. Using default theme.`);
            themeKey = 'default';
        }
        
        const theme = themes[themeKey];
        this.currentTheme = themeKey;
        
        // Apply all CSS custom properties for the selected theme
        Object.entries(theme.properties).forEach(([property, value]) => {
            this.root.style.setProperty(property, value);
        });
        
        // Save theme preference to localStorage
        localStorage.setItem('pongGameTheme', themeKey);
        
        // Trigger custom event for theme change
        const event = new CustomEvent('themeChanged', { 
            detail: { 
                themeKey, 
                themeName: theme.name,
                themeDescription: theme.description 
            } 
        });
        document.dispatchEvent(event);
    }
    
    // Get current theme information
    getCurrentTheme() {
        return {
            key: this.currentTheme,
            ...themes[this.currentTheme]
        };
    }
    
    // Get all available themes
    getAllThemes() {
        return themes;
    }
    
    // Switch to next theme (useful for cycling through themes)
    nextTheme() {
        const themeKeys = Object.keys(themes);
        const currentIndex = themeKeys.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themeKeys.length;
        this.applyTheme(themeKeys[nextIndex]);
    }
    
    // Switch to previous theme
    previousTheme() {
        const themeKeys = Object.keys(themes);
        const currentIndex = themeKeys.indexOf(this.currentTheme);
        const prevIndex = (currentIndex - 1 + themeKeys.length) % themeKeys.length;
        this.applyTheme(themeKeys[prevIndex]);
    }
}

// Create and export a global theme manager instance
export const themeManager = new ThemeManager();
