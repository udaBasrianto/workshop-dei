import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSettings } from '../services/api';

type ThemeColor = 'Sky' | 'Indigo' | 'Red' | 'Green' | 'Amber';

interface ThemeContextType {
    themeColor: ThemeColor;
    themeClass: string;
    refreshSettings: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [themeColor, setThemeColor] = useState<ThemeColor>('Sky');

    const refreshSettings = async () => {
        try {
            const res = await getSettings();
            if (res.data?.theme_color) {
                setThemeColor(res.data.theme_color as ThemeColor);
            }
            if (res.data?.logo_path) {
                const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
                if (link) {
                    link.href = res.data.logo_path;
                }
            }
        } catch (error) {
            console.error('Failed to fetch theme settings:', error);
        }
    };

    useEffect(() => {
        refreshSettings();
    }, []);

    const colors: Record<ThemeColor, string> = {
        'Sky': 'blue', // For simple cases
        'Indigo': 'indigo',
        'Red': 'red',
        'Green': 'green',
        'Amber': 'amber',
    };

    // Helper to get class names dynamically
    // Using simple mapping but we could also inject CSS variables
    const themeClass = `bg-${(colors[themeColor] || 'blue')}-500`;

    return (
        <ThemeContext.Provider value={{ themeColor, themeClass, refreshSettings }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
