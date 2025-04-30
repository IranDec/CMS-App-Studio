
/**
 * @fileOverview Defines the types for widgets used in the application builder.
 */

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
   * The type of the widget (e.g., 'grid', 'banner', 'list', 'form').
   * This corresponds to the IDs in the `widgets` array in `WidgetPanel`.
   */
  type: string; // 'banner' | 'grid' | 'list' | 'form' | 'text' | 'button' | 'spacer' | 'map' | 'video'; // Union type for better type safety

  /**
   * Configuration options specific to this widget instance.
   * The structure of this object depends on the `type` of the widget.
   */
  config: BaseWidgetConfig & (BannerConfig | GridConfig | ListConfig | FormConfig | TextConfig | ButtonConfig | SpacerConfig | MapConfig | VideoConfig);
  // Using discriminated union for better type safety based on 'type' field would be ideal,
  // but for simplicity with react-hook-form, we'll keep it as a wider union for now.
  // A helper function could assert the correct config type based on widget.type if needed.
}

// --- Base Config ---
export interface BaseWidgetConfig {
    marginTop?: number;
    marginBottom?: number;
}


// --- Specific Widget Config Types ---

export interface BannerConfig extends BaseWidgetConfig {
  imageUrl?: string;
  altText?: string;
  linkUrl?: string;
}

export interface GridConfig extends BaseWidgetConfig {
    columns?: '2' | '3' | '4';
    gap?: number;
    dataSource?: string; // Example: identifier for data fetching
}

export interface ListConfig extends BaseWidgetConfig {
    itemLayout?: 'simple' | 'detailed' | 'image-left';
    showDividers?: boolean;
    dataSource?: string; // Example: identifier for data fetching
}

export interface FormConfig extends BaseWidgetConfig {
    submitButtonText?: string;
    recipientEmail?: string;
    successMessage?: string;
    // TODO: fields?: FormField[]; // Define structure for form fields
}

export interface TextConfig extends BaseWidgetConfig {
    content?: string;
    fontSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
    alignment?: 'left' | 'center' | 'right';
    isBold?: boolean;
    isItalic?: boolean;
}

export interface ButtonConfig extends BaseWidgetConfig {
    buttonText?: string;
    linkUrl?: string;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    alignment?: 'left' | 'center' | 'right';
}

export interface SpacerConfig extends BaseWidgetConfig {
    height?: number; // In Tailwind spacing units (e.g., 4 = 1rem)
}

export interface MapConfig extends BaseWidgetConfig {
    address?: string;
    zoomLevel?: number;
    showMarker?: boolean;
}

export interface VideoConfig extends BaseWidgetConfig {
    videoUrl?: string; // e.g., YouTube, Vimeo URL
    aspectRatio?: '16/9' | '4/3' | '1/1' | '9/16';
    autoplay?: boolean;
}
