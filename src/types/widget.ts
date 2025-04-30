
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
  type: string;

  /**
   * Configuration options specific to this widget instance.
   * The structure of this object depends on the `type` of the widget.
   * Example for 'banner': { imageUrl: string; altText: string; linkUrl?: string }
   * Use Partial or specific types based on the widget type.
   */
  config: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  // Using `any` for now, can be refined with discriminated unions later if needed.
  // e.g., config: BannerConfig | GridConfig | ListConfig | FormConfig;
}

// Example specific config types (can be expanded)
export interface BannerConfig {
  imageUrl?: string;
  altText?: string;
  linkUrl?: string;
}

export interface GridConfig {
    columns?: '2' | '3' | '4';
    gap?: number;
    // ... other grid specific config
}

export interface ListConfig {
    itemLayout?: 'simple' | 'detailed' | 'image-left';
    showDividers?: boolean;
    // ... other list specific config
}

export interface FormConfig {
    submitButtonText?: string;
    recipientEmail?: string;
    // ... other form specific config
}
