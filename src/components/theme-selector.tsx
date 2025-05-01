
'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Paintbrush } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

// Define interfaces for theme properties
interface ThemeColors {
  background: string;
  foreground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  // Add other relevant colors if needed
}

interface ThemeDefinition {
  name: string;
  label: string;
  light: ThemeColors;
  dark: ThemeColors;
}

// Predefined themes (HSL values as strings without 'hsl()' or '%')
// Ensure these match the structure and keys used in globals.css
const themes: ThemeDefinition[] = [
  {
    name: 'default',
    label: 'Default (Blue/Teal)',
    light: {
      background: '0 0% 100%',
      foreground: '0 0% 3.9%',
      primary: '233 63% 30%', // Dark Blue
      primaryForeground: '0 0% 98%',
      secondary: '0 0% 96%',
      secondaryForeground: '0 0% 9%',
      accent: '187 100% 42%', // Teal
      accentForeground: '0 0% 100%',
    },
    dark: {
      background: '240 10% 3.9%',
      foreground: '0 0% 98%',
      primary: '233 63% 70%', // Lighter Blue
      primaryForeground: '0 0% 9%',
      secondary: '240 3.7% 15.9%',
      secondaryForeground: '0 0% 98%',
      accent: '187 100% 52%', // Brighter Teal
      accentForeground: '0 0% 9%',
    },
  },
  {
    name: 'zinc', // Matches shadcn theme name
    label: 'Zinc (Gray/Neutral)',
    light: {
      background: '0 0% 100%',
      foreground: '240 10% 3.9%',
      primary: '240 5.9% 10%', // Dark Zinc
      primaryForeground: '0 0% 98%',
      secondary: '240 4.8% 95.9%',
      secondaryForeground: '240 5.9% 10%',
      accent: '240 5.9% 10%', // Using primary as accent for neutral
      accentForeground: '0 0% 98%',
    },
    dark: {
      background: '240 10% 3.9%',
      foreground: '0 0% 98%',
      primary: '0 0% 98%', // Light Zinc
      primaryForeground: '240 5.9% 10%',
      secondary: '240 3.7% 15.9%',
      secondaryForeground: '0 0% 98%',
      accent: '0 0% 98%', // Using primary as accent for neutral
      accentForeground: '240 5.9% 10%',
    },
  },
    {
    name: 'rose', // Matches shadcn theme name
    label: 'Rose (Pink/Mauve)',
    light: {
      background: '0 0% 100%',
      foreground: '346.8 77.2% 11.8%', // Dark Rose
      primary: '346.8 77.2% 49.8%', // Rose Pink
      primaryForeground: '355.7 100% 97.3%', // Light Pink/White
      secondary: '346.8 18.2% 95.9%', // Very Light Rose
      secondaryForeground: '346.8 77.2% 11.8%',
      accent: '346.8 77.2% 49.8%',
      accentForeground: '355.7 100% 97.3%',
    },
    dark: {
      background: '346.8 77.2% 11.8%', // Dark Rose Background
      foreground: '0 0% 98%', // Almost White Text
      primary: '346.8 77.2% 59.8%', // Brighter Rose Pink
      primaryForeground: '346.8 77.2% 11.8%', // Dark Rose Text
      secondary: '346.8 18.2% 15.9%', // Darker Rose Secondary
      secondaryForeground: '0 0% 98%',
      accent: '346.8 77.2% 59.8%',
      accentForeground: '346.8 77.2% 11.8%',
    },
  },
   {
    name: 'green', // Matches shadcn theme name
    label: 'Green (Nature/Eco)',
    light: {
      background: "0 0% 100%",
      foreground: "142.1 70.6% 15.1%", // Dark Green
      primary: "142.1 76.2% 36.3%",    // Medium Green
      primaryForeground: "142.1 10% 96.3%",   // Very Light Green/White
      secondary: "142.1 10% 95.9%",     // Light Green Gray
      secondaryForeground: "142.1 70.6% 15.1%",
      accent: "142.1 76.2% 36.3%",
      accentForeground: "142.1 10% 96.3%",
    },
    dark: {
       background: "142.1 70.6% 10.1%", // Very Dark Green
      foreground: "0 0% 98%",
      primary: "142.1 76.2% 46.3%",    // Brighter Medium Green
      primaryForeground: "142.1 70.6% 10.1%", // Dark Green Text
      secondary: "142.1 10% 15.9%",     // Dark Green Gray
      secondaryForeground: "0 0% 98%",
      accent: "142.1 76.2% 46.3%",
      accentForeground: "142.1 70.6% 10.1%",
    },
  },
  // Add more themes here...
];

export function ThemeSelector() {
  const { setTheme } = useTheme();

  const applyTheme = (themeName: string) => {
    const selectedTheme = themes.find(t => t.name === themeName);
    if (!selectedTheme || typeof document === 'undefined') return;

    console.log(`Applying theme: ${themeName}`);

    const root = document.documentElement;
    const mode: 'light' | 'dark' = root.classList.contains('dark') ? 'dark' : 'light';
    const colors = selectedTheme[mode];

    // Dynamically update CSS variables
    Object.entries(colors).forEach(([key, value]) => {
      // Convert camelCase key to kebab-case CSS variable name
      const cssVarName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      console.log(`Setting ${cssVarName} to ${value}`);
      root.style.setProperty(cssVarName, value);
    });

     // Update the next-themes mode if needed (though usually handled by ThemeProvider)
     // setTheme(mode); // This might cause infinite loops if not careful
  };


  // Effect to apply the current theme when the component mounts or theme changes
   React.useEffect(() => {
    // Get the currently selected theme name from local storage or default
     const currentThemeName = localStorage.getItem('theme') || 'default'; // Assuming 'theme' is the key used by next-themes
     const themeExists = themes.some(t => t.name === currentThemeName);
     applyTheme(themeExists ? currentThemeName : 'default'); // Apply default if stored theme is invalid

     // Add listener for theme changes triggered elsewhere (e.g., system preference change)
     const observer = new MutationObserver((mutationsList) => {
       for (const mutation of mutationsList) {
         if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
             const newThemeName = localStorage.getItem('theme') || 'default';
              const themeExists = themes.some(t => t.name === newThemeName);
             applyTheme(themeExists ? newThemeName : 'default');
             break; // Only need to apply once per change
         }
       }
     });

     observer.observe(document.documentElement, { attributes: true });

     return () => observer.disconnect(); // Cleanup observer
   }, []); // Run only on mount


   const handleThemeChange = (value: string) => {
        setTheme(value); // Update next-themes state (stores in localStorage)
        applyTheme(value); // Apply the styles immediately
   };


  return (
    <Card className="shadow-md border-primary/20">
       <CardHeader className="pb-2">
           <CardTitle className="text-md flex items-center gap-2">
                <Paintbrush className="h-5 w-5 text-primary" />
                <span>Global Theme</span>
            </CardTitle>
       </CardHeader>
        <CardContent>
            <div className="space-y-2">
                <Label htmlFor="theme-select">Select Theme</Label>
                <Select onValueChange={handleThemeChange} defaultValue="default">
                    <SelectTrigger id="theme-select" className="w-full">
                        <SelectValue placeholder="Select a theme" />
                    </SelectTrigger>
                    <SelectContent>
                        {themes.map((theme) => (
                            <SelectItem key={theme.name} value={theme.name}>
                                {theme.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                    Changes apply instantly and affect the entire app preview.
                </p>
            </div>
         </CardContent>
    </Card>
  );
}
