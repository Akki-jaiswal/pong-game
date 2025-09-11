export const themes = {
    default: {
        name: "Default",
        variables: {
            "--canvas-bg-gradient-1": "#f0f0f0",
            "--canvas-bg-gradient-2": "#dcdcdc",
            "--canvas-border-color": "#333",
            "--ball-color": "#ff0000",
            "--ball-glow": "rgba(255, 0, 0, 0.6)",
            "--control-bg": "#fff",
            "--control-border": "#ccc",
            "--control-glow": "rgba(0,0,0,0.2)",
        }
    },
    "neon-retro": {
        name: "Neon Retro",
        variables: {
            "--canvas-bg-gradient-1": "#0f0c29",
            "--canvas-bg-gradient-2": "#302b63",
            "--canvas-border-color": "#ff00ff",
            "--ball-color": "#00ffcc",
            "--ball-glow": "0 0 20px #00ffcc",
            "--control-bg": "#1a1a1a",
            "--control-border": "#ff00ff",
            "--control-glow": "rgba(255, 0, 255, 0.5)",
        }
    },
    "dark-mode": {
        name: "Dark Mode",
        variables: {
            "--canvas-bg-gradient-1": "#1c1c1c",
            "--canvas-bg-gradient-2": "#2c2c2c",
            "--canvas-border-color": "#fff",
            "--ball-color": "#ffcc00",
            "--ball-glow": "0 0 15px #ffcc00",
            "--control-bg": "#333",
            "--control-border": "#999",
            "--control-glow": "rgba(255, 255, 255, 0.3)",
        }
    },
    "ocean-blue": {
        name: "Ocean Blue",
        variables: {
            "--canvas-bg-gradient-1": "#2E8BC0",
            "--canvas-bg-gradient-2": "#145DA0",
            "--canvas-border-color": "#0C2D48",
            "--ball-color": "#B1D4E0",
            "--ball-glow": "0 0 15px #B1D4E0",
            "--control-bg": "#0C2D48",
            "--control-border": "#B1D4E0",
            "--control-glow": "rgba(177, 212, 224, 0.4)",
        }
    }
};

export class ThemeManager {
    constructor() {
        this.currentTheme = themes.default;
        this.applyTheme(this.currentTheme);
    }

    applyTheme(theme) {
        Object.entries(theme.variables).forEach(([key, value]) => {
            document.documentElement.style.setProperty(key, value);
        });
        this.currentTheme = theme;
        document.dispatchEvent(new CustomEvent("themeChanged", { 
            detail: { themeName: theme.name, theme }
        }));
    }

    setTheme(themeName) {
        if (themes[themeName]) {
            this.applyTheme(themes[themeName]);
        }
    }

    getCurrentTheme() {
        return this.currentTheme;
    }
}

export const themeManager = new ThemeManager();



