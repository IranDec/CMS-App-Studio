

/**
 * @fileOverview Defines the types for widgets used in the application builder.
 */
import type React from 'react';

/**
 * Represents a widget definition available in the panel.
 */
 export interface WidgetDefinition {
    id: string;
    name: string;
    icon: React.ElementType; // Lucide icon component
    description: string;
}


/**
 * Represents a widget that has been dropped onto the phone preview area.
 */
export interface DroppedWidget {
  /**
   * A unique identifier for this specific instance of the widget.
   * Format: `${type}-${timestamp}`
   */
  id: string;

  /**
   * The type of the widget (e.g., 'grid', 'banner', 'list', 'form', 'header').
   * This corresponds to the `id` in `WidgetDefinition`.
   */
  type: string; // Should match WidgetDefinition['id']

   /**
   * The display name of the widget (used in configuration panel title).
   * Inherited from WidgetDefinition during drop.
   */
    name: string;

  /**
   * Configuration options specific to this widget instance.
   * The structure of this object depends on the `type` of the widget.
   */
  config: Partial<BaseWidgetConfig & HeaderConfig & BannerConfig & GridConfig & ListConfig & FormConfig & TextConfig & ButtonConfig & SpacerConfig & MapConfig & VideoConfig>;
  // Using Partial allows gradual building of the config object.
  // The specific config type is enforced by the Zod schema in the ConfigurationPanel.
}

// --- Base Config ---
export interface BaseWidgetConfig {
    marginTop: number; // Default: 2
    marginBottom: number; // Default: 2
}


// --- Specific Widget Config Types (Interface merging for better structure) ---

export interface HeaderConfig { // No BaseWidgetConfig, header is usually fixed
  title: string; // Default: 'App Name'
  showBackButton: boolean; // Default: false
  showMenuButton: boolean; // Default: true (for potential sidebar)
  showCartIcon: boolean; // Default: true
  showAuthButton: boolean; // Default: true
  authButtonText: string; // Default: 'Login'
  // Future: backgroundColor, textColor, etc.
}

export interface BannerConfig extends BaseWidgetConfig {
  imageUrl: string; // Optional handled by Zod schema
  altText: string; // Optional handled by Zod schema
  linkUrl: string; // Optional handled by Zod schema
  imageFit: 'cover' | 'contain'; // Default: 'cover'
  aspectRatio: '16/9' | '4/3' | '1/1' | '21/9' | 'auto'; // Default: '16/9'
}

export interface GridConfig extends BaseWidgetConfig {
    columns: '1' | '2' | '3' | '4'; // Default: '2'
    gap: number; // Default: 4
    dataSource: string; // Optional handled by Zod schema
    itemAspectRatio: '1/1' | '4/3' | '3/4' | '16/9'; // Default: '1/1'
}

export interface ListConfig extends BaseWidgetConfig {
    itemLayout: 'simple' | 'detailed' | 'image-left' | 'image-right'; // Default: 'simple'
    showDividers: boolean; // Default: true
    dataSource: string; // Optional handled by Zod schema
    imageSize: 'sm' | 'md' | 'lg'; // Default: 'md'
}

export interface FormConfig extends BaseWidgetConfig {
    submitButtonText: string; // Default: 'Submit'
    recipientEmail: string; // Optional handled by Zod schema
    successMessage: string; // Default: 'Thank you...'
    // TODO: fields?: FormField[]; // Define structure for form fields
}

export interface TextConfig extends BaseWidgetConfig {
    content: string; // Default: 'Enter text...'
    fontSize: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl'; // Default: 'base'
    alignment: 'left' | 'center' | 'right' | 'justify'; // Default: 'left'
    isBold: boolean; // Default: false
    isItalic: boolean; // Default: false
    textColor: 'default' | 'primary' | 'secondary' | 'accent' | 'muted'; // Default: 'default'
}

export interface ButtonConfig extends BaseWidgetConfig {
    buttonText: string; // Default: 'Click Me'
    linkUrl: string; // Optional handled by Zod schema
    variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'; // Default: 'default'
    size: 'default' | 'sm' | 'lg' | 'icon'; // Default: 'default'
    alignment: 'left' | 'center' | 'right' | 'full'; // Default: 'center'
    // icon?: string; // Optional Lucide icon name
}

export interface SpacerConfig extends BaseWidgetConfig {
    height: number; // Default: 4 (In Tailwind spacing units, 1 = 0.25rem)
}

export interface MapConfig extends BaseWidgetConfig {
    address: string; // Default: '1600 Amphitheatre...'
    zoomLevel: number; // Default: 15
    showMarker: boolean; // Default: true
    mapStyle: 'roadmap' | 'satellite' | 'hybrid' | 'terrain'; // Default: 'roadmap'
}

export interface VideoConfig extends BaseWidgetConfig {
    videoUrl: string; // Optional handled by Zod schema
    aspectRatio: '16/9' | '4/3' | '1/1' | '9/16' | 'auto'; // Default: '16/9'
    autoplay: boolean; // Default: false
    showControls: boolean; // Default: true
}

