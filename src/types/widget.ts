
/**
 * @fileOverview Defines the types for widgets used in the application builder.
 */
import type React from 'react';

/**
 * Represents a widget definition available in the panel.
 */
 export interface WidgetDefinition {
    id: string; // Unique type identifier (e.g., 'banner', 'grid')
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
  type: WidgetDefinition['id']; // Use ID from WidgetDefinition

   /**
   * The display name of the widget (used in configuration panel title).
   * Inherited from WidgetDefinition during drop.
   */
    name: string;

  /**
   * Configuration options specific to this widget instance.
   * The structure of this object depends on the `type` of the widget.
   */
  config: Partial<AllWidgetConfigs>; // Union of all possible config types
}

// --- Base Config (Applied to most content widgets) ---
export interface BaseWidgetConfig {
    marginTop: number; // Default: 2
    marginBottom: number; // Default: 2
    animation: 'none' | 'fadeIn' | 'slideInUp' | 'slideInLeft' | 'zoomIn'; // Default: 'none'
    displayCondition: 'always' | 'loggedIn' | 'loggedOut'; // Default: 'always'
    customCssClasses: string; // Optional custom Tailwind classes
    // Add other common fields if needed
}


// --- Specific Widget Config Types ---

// Header doesn't use BaseWidgetConfig for margins/animation usually
export interface HeaderConfig {
  type: 'header';
  title: string; // Default: 'App Name'
  showBackButton: boolean; // Default: false
  showMenuButton: boolean; // Default: true (for potential sidebar)
  showCartIcon: boolean; // Default: true
  showAuthButton: boolean; // Default: true
  authButtonText: string; // Default: 'Login'
}

export interface BannerConfig extends BaseWidgetConfig {
  type: 'banner';
  imageUrl: string; // Optional handled by Zod schema
  altText: string; // Optional handled by Zod schema
  linkUrl: string; // Optional handled by Zod schema
  imageFit: 'cover' | 'contain'; // Default: 'cover'
  aspectRatio: '16/9' | '4/3' | '1/1' | '21/9' | 'auto'; // Default: '16/9'
  aiPrompt?: string; // Optional prompt for generating alt text or finding images
  imageUploadEnabled?: boolean; // Placeholder for future upload feature
}

export interface GridConfig extends BaseWidgetConfig {
    type: 'grid';
    columns: '1' | '2' | '3' | '4'; // Default: '2'
    gap: number; // Default: 4
    dataSource: string; // Optional handled by Zod schema
    itemAspectRatio: '1/1' | '4/3' | '3/4' | '16/9'; // Default: '1/1'
}

export interface ListConfig extends BaseWidgetConfig {
    type: 'list';
    itemLayout: 'simple' | 'detailed' | 'image-left' | 'image-right'; // Default: 'simple'
    showDividers: boolean; // Default: true
    dataSource: string; // Optional handled by Zod schema
    imageSize: 'sm' | 'md' | 'lg'; // Default: 'md'
}

export interface FormConfig extends BaseWidgetConfig {
    type: 'form';
    submitButtonText: string; // Default: 'Submit'
    recipientEmail: string; // Optional handled by Zod schema
    successMessage: string; // Default: 'Thank you...'
    // TODO: fields?: FormField[]; // Define structure for form fields
}

export interface TextConfig extends BaseWidgetConfig {
    type: 'text';
    content: string; // Default: 'Enter text...'
    fontSize: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl'; // Default: 'base'
    alignment: 'left' | 'center' | 'right' | 'justify'; // Default: 'left'
    isBold: boolean; // Default: false
    isItalic: boolean; // Default: false
    textColor: 'default' | 'primary' | 'secondary' | 'accent' | 'muted'; // Default: 'default'
    aiPrompt?: string; // Optional prompt for generating content
    enableRichText?: boolean; // Placeholder for future editor
}

export interface ButtonConfig extends BaseWidgetConfig {
    type: 'button';
    buttonText: string; // Default: 'Click Me'
    linkUrl: string; // Optional handled by Zod schema
    variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'; // Default: 'default'
    size: 'default' | 'sm' | 'lg' | 'icon'; // Default: 'default'
    alignment: 'left' | 'center' | 'right' | 'full'; // Default: 'center'
    // icon?: string; // Optional Lucide icon name
}

export interface SpacerConfig extends BaseWidgetConfig {
    type: 'spacer';
    height: number; // Default: 4 (In Tailwind spacing units, 1 = 0.25rem)
}

export interface MapConfig extends BaseWidgetConfig {
    type: 'map';
    address: string; // Default: '1600 Amphitheatre...'
    zoomLevel: number; // Default: 15
    showMarker: boolean; // Default: true
    mapStyle: 'roadmap' | 'satellite' | 'hybrid' | 'terrain'; // Default: 'roadmap'
    useCurrentLocation?: boolean; // Option to use device location
}

export interface VideoConfig extends BaseWidgetConfig {
    type: 'video';
    videoUrl: string; // Optional handled by Zod schema
    aspectRatio: '16/9' | '4/3' | '1/1' | '9/16' | 'auto'; // Default: '16/9'
    autoplay: boolean; // Default: false
    showControls: boolean; // Default: true
}

// --- NEW WIDGET CONFIGS ---

export interface CarouselItem {
    id: string;
    imageUrl: string;
    altText?: string;
    linkUrl?: string;
}
export interface CarouselConfig extends BaseWidgetConfig {
    type: 'carousel';
    items: CarouselItem[]; // Default: []
    autoplay: boolean; // Default: false
    delay: number; // Default: 3000 (ms)
    showArrows: boolean; // Default: true
    showDots: boolean; // Default: true
    aspectRatio: '16/9' | '4/3' | '1/1' | '21/9' | 'auto'; // Default: '16/9'
}

export interface AudioConfig extends BaseWidgetConfig {
    type: 'audio';
    audioUrl: string; // Optional handled by Zod schema
    autoplay: boolean; // Default: false
    showControls: boolean; // Default: true
    loop: boolean; // Default: false
}

export interface CountdownConfig extends BaseWidgetConfig {
    type: 'countdown';
    targetDate: string; // ISO string format date/time. Default: Future date
    expiredMessage: string; // Default: 'Event has started!'
    labelDays: string; // Default: 'Days'
    labelHours: string; // Default: 'Hours'
    labelMinutes: string; // Default: 'Minutes'
    labelSeconds: string; // Default: 'Seconds'
    displayStyle: 'blocks' | 'inline'; // Default: 'blocks'
}

export interface SocialFeedConfig extends BaseWidgetConfig {
    type: 'social';
    platform: 'twitter' | 'instagram' | 'facebook' | 'linkedin'; // Default: 'twitter'
    profileUrlOrHandle: string; // Optional handled by Zod schema
    numberOfPosts: number; // Default: 5
    layout: 'grid' | 'list'; // Default: 'list'
}

export interface DividerConfig extends BaseWidgetConfig {
    type: 'divider';
    style: 'solid' | 'dashed' | 'dotted'; // Default: 'solid'
    thickness: number; // Default: 1 (px)
    color: 'border' | 'primary' | 'accent'; // Default: 'border'
}

// --- Other Placeholder Types ---

// Placeholder for user/auth state (replace with actual context/library)
export interface AuthState {
    isAuthenticated: boolean;
    user?: {
        id: string;
        role: 'admin' | 'editor' | 'viewer'; // Example roles
    } | null;
}

// Placeholder for version history entry
export interface VersionHistoryEntry {
    id: string;
    timestamp: number;
    widgetsSnapshot: DroppedWidget[];
    // Add user info, description, etc.
}


// --- Union type for all possible widget configs ---
export type AllWidgetConfigs =
    | HeaderConfig
    | BannerConfig
    | GridConfig
    | ListConfig
    | FormConfig
    | TextConfig
    | ButtonConfig
    | SpacerConfig
    | MapConfig
    | VideoConfig
    | CarouselConfig
    | AudioConfig
    | CountdownConfig
    | SocialFeedConfig
    | DividerConfig;
