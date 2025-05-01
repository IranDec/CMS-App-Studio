
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Smartphone, Trash2, MapPin, Video, Type as TypeIcon, Image as ImageIcon, LayoutGrid, Rows, MessageSquare, MousePointerSquareDashed, Space as SpacerIcon } from 'lucide-react';
import { Button as UiButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { DroppedWidget, TextConfig, ButtonConfig, SpacerConfig, MapConfig, VideoConfig, GridConfig, ListConfig, BannerConfig, FormConfig, BaseWidgetConfig } from '@/types/widget';
import { widgetDefaultValuesMap } from '@/lib/widget-defaults'; // Import defaults

interface PhonePreviewProps {
  widgets: DroppedWidget[];
  setWidgets: React.Dispatch<React.SetStateAction<DroppedWidget[]>>;
  selectedWidgetId: string | null;
  setSelectedWidgetId: React.Dispatch<React.SetStateAction<string | null>>;
}

// --- Helper Functions for Dynamic Classes ---

// Tailwind margin class
const getMarginClass = (value: number | undefined, prefix: 'mt' | 'mb'): string => {
    const defaultValue = 2; // Default margin from base config
    const val = value ?? defaultValue;
    if (val < 0 || val > 20) return `${prefix}-${defaultValue}`; // Fallback to default if out of range
    return `${prefix}-${val}`;
};

// Tailwind text alignment class
const getAlignmentClass = (alignment: string | undefined): string => {
    switch (alignment) {
        case 'left': return 'text-left justify-start';
        case 'center': return 'text-center justify-center';
        case 'right': return 'text-right justify-end';
        case 'justify': return 'text-justify justify-between'; // Added justify
        default: return 'text-left justify-start';
    }
};

// Tailwind font size class
const getFontSizeClass = (size: string | undefined): string => {
    const validSizes = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl'];
    if (size && validSizes.includes(size)) {
        return `text-${size}`;
    }
    return 'text-base'; // Default
};

// Tailwind text color class
const getTextColorClass = (color: string | undefined): string => {
     switch (color) {
        case 'primary': return 'text-primary';
        case 'secondary': return 'text-secondary-foreground'; // Use foreground for secondary bg
        case 'accent': return 'text-accent';
        case 'muted': return 'text-muted-foreground';
        case 'default':
        default: return 'text-foreground';
     }
};

// Aspect ratio class
const getAspectRatioClass = (ratio: string | undefined): string => {
    switch (ratio) {
        case '16/9': return 'aspect-video';
        case '4/3': return 'aspect-[4/3]';
        case '1/1': return 'aspect-square';
        case '9/16': return 'aspect-[9/16]';
        case '21/9': return 'aspect-[21/9]'; // Added 21/9
        case 'auto': return ''; // No aspect ratio class for auto
        default: return 'aspect-video'; // Default
    }
};

// Image fit class
const getImageFitClass = (fit: string | undefined): string => {
    switch (fit) {
        case 'contain': return 'object-contain';
        case 'cover':
        default: return 'object-cover';
    }
};

// Grid columns class
const getGridColsClass = (cols: string | undefined): string => {
    const validCols = ['1', '2', '3', '4'];
    if (cols && validCols.includes(cols)) {
        return `grid-cols-${cols}`;
    }
    return 'grid-cols-2'; // Default
};

// Grid gap class
const getGapClass = (gap: number | undefined): string => {
    const defaultValue = 4;
    const val = gap ?? defaultValue;
    if (val < 0 || val > 10) return `gap-${defaultValue}`;
    return `gap-${val}`;
};

// Button size class
const getButtonSizeClass = (size: string | undefined): string => {
    switch (size) {
        case 'sm': return 'h-9 px-3'; // Corresponds to buttonVariants 'sm'
        case 'lg': return 'h-11 px-8'; // Corresponds to buttonVariants 'lg'
        case 'icon': return 'h-10 w-10'; // Corresponds to buttonVariants 'icon'
        case 'default':
        default: return 'h-10 px-4 py-2'; // Corresponds to buttonVariants 'default'
    }
};

// Button alignment/width class
const getButtonAlignmentClass = (alignment: string | undefined): string => {
    switch (alignment) {
        case 'left': return 'justify-start';
        case 'center': return 'justify-center';
        case 'right': return 'justify-end';
        case 'full': return 'justify-center w-full'; // Use w-full for full width
        default: return 'justify-center';
    }
};

// List image size class
const getImageSizeClass = (size: string | undefined): string => {
    switch(size) {
        case 'sm': return 'w-10 h-10';
        case 'lg': return 'w-20 h-20';
        case 'md':
        default: return 'w-16 h-16';
    }
}

// --- Phone Preview Component ---

export function PhonePreview({
  widgets,
  setWidgets,
  selectedWidgetId,
  setSelectedWidgetId,
}: PhonePreviewProps) {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
        // Component did mount, safe to access window/document
        setIsClient(true);
    }, []);


  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingOver(false);
    const widgetType = event.dataTransfer.getData('widgetType');
    const widgetName = event.dataTransfer.getData('widgetName'); // Get the name

    if (widgetType) {
      console.log('Dropped:', widgetType, 'Name:', widgetName);
      const defaultConfig = widgetDefaultValuesMap[widgetType as keyof typeof widgetDefaultValuesMap] || {};
      const newWidget: DroppedWidget = {
        id: `${widgetType}-${Date.now()}`, // Unique ID
        type: widgetType,
        name: widgetName || widgetType.charAt(0).toUpperCase() + widgetType.slice(1), // Use transferred name or generate default
        config: { ...defaultConfig } as DroppedWidget['config'],
      };
      setWidgets((prevWidgets) => [...prevWidgets, newWidget]);
      setSelectedWidgetId(newWidget.id); // Select the newly added widget
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    // Check if leaving to a child element (like the delete button)
     if (!event.currentTarget.contains(event.relatedTarget as Node)) {
        setIsDraggingOver(false);
    }
  };

  const handleWidgetClick = (
    event: React.MouseEvent<HTMLDivElement>,
    widgetId: string
  ) => {
    // Prevent click propagation if delete button was clicked
    if ((event.target as HTMLElement).closest('button[aria-label^="Remove"]')) {
        return;
    }
    setSelectedWidgetId(widgetId);
     console.log("Selected widget:", widgetId);
  };


  const removeWidget = (idToRemove: string) => {
     // Deselect if the removed widget was selected
     if (selectedWidgetId === idToRemove) {
        setSelectedWidgetId(null);
     }
     setWidgets((prevWidgets) =>
        prevWidgets.filter((widget) => widget.id !== idToRemove)
     );
      console.log("Removed widget:", idToRemove);
  };


  // --- Render Widget Content ---
  const renderWidgetContent = (widget: DroppedWidget) => {
    let content;
    const isSelected = widget.id === selectedWidgetId;
    // Ensure config exists, provide default BaseWidgetConfig if not
    const config: BaseWidgetConfig & Record<string, any> = {
        marginTop: 2,
        marginBottom: 2,
        ...(widget.config || {}), // Spread existing config, potentially overriding defaults
    };
    const marginTopClass = getMarginClass(config.marginTop, 'mt');
    const marginBottomClass = getMarginClass(config.marginBottom, 'mb');

    const commonWrapperClasses = cn(
        "relative group border-2 p-1 rounded-lg mb-1 cursor-pointer transition-all duration-150 ease-in-out", // Slightly larger rounding and padding
        marginTopClass,
        marginBottomClass,
        isSelected ? 'border-primary bg-primary/10 shadow-md ring-2 ring-primary ring-offset-1' : 'border-transparent hover:border-accent hover:bg-accent/5',
        'widget-wrapper' // Add a common class for easier selection if needed
    );


    switch (widget.type) {
        case 'banner':
            const bannerConfig = config as BannerConfig;
            const aspectRatioClassBanner = getAspectRatioClass(bannerConfig.aspectRatio);
            const imageFitClass = getImageFitClass(bannerConfig.imageFit);
            content = (
                 // Use 'a' tag if linkUrl exists, otherwise use 'div'
                React.createElement(bannerConfig.linkUrl ? 'a' : 'div', {
                    href: bannerConfig.linkUrl || undefined,
                    target: bannerConfig.linkUrl ? '_blank' : undefined,
                    rel: bannerConfig.linkUrl ? 'noopener noreferrer' : undefined,
                    className: cn(
                        "relative block w-full rounded overflow-hidden bg-muted", // Use block display for 'a' tag
                         aspectRatioClassBanner || 'h-40', // Fallback height if 'auto'
                         !bannerConfig.imageUrl && 'flex items-center justify-center' // Center placeholder if no image
                    ),
                     'data-ai-hint': "website banner placeholder"
                },
                    bannerConfig.imageUrl ? (
                        <Image
                            key={bannerConfig.imageUrl} // Add key to force re-render on URL change
                            src={bannerConfig.imageUrl}
                            alt={bannerConfig.altText || 'Banner image'}
                            fill
                            className={cn("transition-opacity duration-300", imageFitClass)}
                             data-ai-hint="corporate banner sale" // More specific hint
                             priority={widgets.findIndex(w => w.id === widget.id) < 2} // Prioritize loading first few images
                             sizes="(max-width: 768px) 100vw, 33vw" // Example sizes
                             onError={(e) => {
                                 console.error("Banner image failed to load:", bannerConfig.imageUrl);
                                 // Hide broken image and show placeholder
                                 const imgElement = e.currentTarget;
                                 imgElement.style.opacity = '0';
                                 imgElement.nextElementSibling?.classList.remove('hidden');
                             }}
                             onLoad={(e) => {
                                 // Ensure placeholder is hidden
                                 const imgElement = e.currentTarget;
                                 imgElement.style.opacity = '1';
                                 imgElement.nextElementSibling?.classList.add('hidden');
                             }}
                        />
                    ) : null,
                     // Placeholder is always rendered but hidden if image loads
                     <div className={cn(
                         "banner-placeholder absolute inset-0 flex flex-col items-center justify-center text-muted-foreground text-xs bg-muted/80", // Slightly dimmed bg
                         bannerConfig.imageUrl ? "hidden" : "" // Hidden by default if URL exists
                     )}>
                        <ImageIcon className="w-10 h-10 mb-1 opacity-50" />
                        <span>Banner</span>
                        {!bannerConfig.imageUrl && <span className="text-[10px] mt-0.5">No Image URL</span>}
                    </div>
                )
            );
            break;
        case 'grid':
            const gridConfig = config as GridConfig;
            const gridColsClass = getGridColsClass(gridConfig.columns);
            const gapClass = getGapClass(gridConfig.gap);
            const itemAspectRatioClass = getAspectRatioClass(gridConfig.itemAspectRatio) || 'aspect-square'; // Default to square
            const numPlaceholders = parseInt(gridConfig.columns || '2') * 2; // Show 2 rows

            content = (
                <div className={cn("p-2 bg-muted/30 rounded border border-dashed border-input")} data-ai-hint="product grid display">
                    <div className={cn(`grid ${gridColsClass} ${gapClass}`)}>
                        {[...Array(numPlaceholders)].map((_, i) => (
                            <div key={i} className={cn("bg-muted rounded animate-pulse flex flex-col items-center justify-center overflow-hidden", itemAspectRatioClass)}>
                                 <ImageIcon size={24} className="text-muted-foreground/50 mb-1"/>
                                 <div className="h-2 w-10/12 bg-muted-foreground/20 rounded-full mt-1"></div>
                            </div>
                        ))}
                    </div>
                    <span className="text-xs text-muted-foreground block text-center pt-2">Grid ({gridConfig.columns} cols)</span>
                </div>
            );
            break;
        case 'list':
            const listConfig = config as ListConfig;
            const itemLayout = listConfig.itemLayout || 'simple';
            const showDividers = listConfig.showDividers ?? true;
            const imgSizeClass = getImageSizeClass(listConfig.imageSize);

            content = (
                <div className={cn("p-2 bg-muted/30 rounded border border-dashed border-input")} data-ai-hint="ordered item list">
                     <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                           <div
                                key={i}
                                className={cn(
                                    "bg-muted rounded animate-pulse flex items-center p-2 space-x-3", // Added padding to items
                                     itemLayout === 'image-right' ? 'flex-row-reverse space-x-reverse' : 'flex-row', // Handle image right
                                    showDividers && i < 2 ? 'border-b border-border pb-2 mb-2' : ''
                                )}
                            >
                                {(itemLayout === 'image-left' || itemLayout === 'image-right') &&
                                    <div className={cn("bg-muted-foreground/20 rounded flex-shrink-0", imgSizeClass)}></div>
                                }
                                <div className="flex-1 space-y-1.5"> {/* Increased spacing */}
                                     <div className={cn("h-2.5 bg-muted-foreground/20 rounded-full", itemLayout === 'simple' ? 'w-5/6' : 'w-full')}></div>
                                     {itemLayout !== 'simple' && <div className="h-2 bg-muted-foreground/10 rounded-full w-2/3"></div>}
                                </div>
                            </div>
                        ))}
                     </div>
                    <span className="text-xs text-muted-foreground block text-center pt-2">List ({itemLayout})</span>
                </div>
            );
            break;
        case 'form':
            const formConfig = config as FormConfig;
            content = (
                <div className={cn("space-y-3 p-3 border border-dashed rounded border-input bg-card shadow-sm")}>
                    {/* Simulate Labels and Inputs */}
                    <div className="space-y-1 animate-pulse">
                        <div className="h-3 bg-muted rounded w-1/4"></div>
                        <div className="h-8 bg-muted rounded w-full"></div>
                    </div>
                     <div className="space-y-1 animate-pulse">
                        <div className="h-3 bg-muted rounded w-1/3"></div>
                        <div className="h-16 bg-muted rounded w-full"></div>
                    </div>
                    {/* Simulate Submit Button */}
                    <div className="flex justify-end pt-2">
                         {/* Use UiButton for styling consistency */}
                         <UiButton variant="default" size="sm" disabled className="animate-pulse">
                            {formConfig.submitButtonText || 'Submit'}
                         </UiButton>
                    </div>
                    <span className="text-xs text-muted-foreground block text-center pt-1">Form Placeholder</span>
                </div>
            );
            break;
        case 'text':
            const textConfig = config as TextConfig;
            const textAlignClass = getAlignmentClass(textConfig.alignment);
            const textSizeClass = getFontSizeClass(textConfig.fontSize);
            const textColorClass = getTextColorClass(textConfig.textColor);
            const fontWeightClass = textConfig.isBold ? 'font-bold' : 'font-normal';
            const fontStyleClass = textConfig.isItalic ? 'italic' : 'not-italic';
            content = (
                 // Added min-h for empty text blocks
                <div className={cn("p-1 min-h-[2rem] w-full", textAlignClass.split(' ')[0])}>
                    <p className={cn(
                        textSizeClass,
                        textColorClass,
                        fontWeightClass,
                        fontStyleClass,
                        'break-words' // Ensure long words wrap
                    )}>
                        {textConfig.content || "Enter text..."}
                    </p>
                </div>
            );
            break;
         case 'button':
            const buttonConfig = config as ButtonConfig;
            const btnAlignClass = getButtonAlignmentClass(buttonConfig.alignment);
            const btnSizeClass = getButtonSizeClass(buttonConfig.size); // Use helper for dynamic size class

            content = (
                 // Flex container for alignment
                <div className={cn("flex w-full py-1", btnAlignClass)}>
                    {/* Render an actual button, but disable pointer events */}
                    <UiButton
                        variant={buttonConfig.variant || 'default'}
                        // size prop now directly uses the config value
                        size={buttonConfig.size || 'default'}
                        className={cn("pointer-events-none", {'w-full': buttonConfig.alignment === 'full'})} // Make non-interactive and handle full width
                         // If size is 'icon', add specific styling or icon
                        {...(buttonConfig.size === 'icon' ? { 'aria-label': buttonConfig.buttonText || 'Icon button' } : {})}
                    >
                         {/* Conditionally render icon if size is icon, otherwise text */}
                        {buttonConfig.size === 'icon' ? <ImageIcon className="h-4 w-4"/> : (buttonConfig.buttonText || "Button")}
                    </UiButton>
                </div>
            );
            break;
        case 'spacer':
            const spacerConfig = config as SpacerConfig;
            const height = spacerConfig.height || 4;
            const heightClass = `h-${height}`; // Assumes safelist includes h-1 to h-40

            content = (
                <div
                    className={cn(heightClass, "bg-purple-100/50 dark:bg-purple-900/20 border border-dashed border-purple-300 dark:border-purple-700 rounded flex items-center justify-center overflow-hidden")}
                    aria-label={`Spacer (${height * 0.25}rem)`}
                 >
                     <SpacerIcon className="w-4 h-4 text-purple-500/70 dark:text-purple-400/60" />
                     <span className="text-xs text-purple-600 dark:text-purple-300 ml-1">Spacer ({height})</span>
                 </div>
            );
            break;
         case 'map':
            const mapConfig = config as MapConfig;
             // Simulate different map styles with background colors/patterns
            const getMapStyleBg = (style: string | undefined) => {
                switch(style) {
                    case 'satellite': return 'bg-emerald-900';
                    case 'hybrid': return 'bg-emerald-700';
                    case 'terrain': return 'bg-yellow-800';
                    case 'roadmap':
                    default: return 'bg-blue-200 dark:bg-blue-900';
                }
            }
            content = (
                <div className={cn("relative h-48 bg-muted rounded border border-dashed border-input overflow-hidden", getMapStyleBg(mapConfig.mapStyle))}>
                   {isClient ? ( // Only render map content on the client
                    <div className="w-full h-full flex flex-col items-center justify-center text-white/90 p-2">
                        <MapPin className="w-10 h-10 mb-2 text-red-500" />
                        <p className="text-sm font-medium">Map Preview</p>
                        <p className="text-xs px-2 text-center mt-1 text-white/80 truncate w-full">{mapConfig.address || "No address set"}</p>
                        {mapConfig.showMarker === false && <p className="text-[10px] text-yellow-400 mt-0.5">(Marker Hidden)</p>}
                        <p className="text-[10px] text-white/60 mt-1 capitalize">Style: {mapConfig.mapStyle || 'roadmap'}, Zoom: {mapConfig.zoomLevel || 15}</p>
                     </div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs animate-pulse bg-muted">Loading Map...</div>
                    )}
                </div>
            );
            break;
        case 'video':
             const videoConfig = config as VideoConfig;
             const aspectRatioClassVideo = getAspectRatioClass(videoConfig.aspectRatio);
             content = (
                 <div className={cn("relative bg-black rounded border border-dashed border-input overflow-hidden", aspectRatioClassVideo || 'h-40')}>
                     {isClient ? ( // Only render video content on the client
                         <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground ">
                            <Video className="w-12 h-12 mb-2 text-white/80" />
                            <p className="text-sm font-medium text-white/90">Video Preview</p>
                             {videoConfig.videoUrl ? (
                                <p className="text-xs px-4 text-center mt-1 text-gray-400 truncate w-full">{videoConfig.videoUrl}</p>
                             ): (
                                <p className="text-xs px-2 text-center mt-1 text-gray-500">No Video URL</p>
                             )}
                             <div className="text-[10px] mt-1 space-x-2">
                                {videoConfig.autoplay && <span className="text-yellow-500">(Autoplay)</span>}
                                {videoConfig.showControls === false && <span className="text-gray-500">(Controls Hidden)</span>}
                             </div>
                         </div>
                     ) : (
                         <div className={cn("w-full h-full flex items-center justify-center text-muted-foreground text-xs animate-pulse bg-gray-800")}>
                             Loading Video...
                         </div>
                     )}
                 </div>
             );
             break;
      default:
        // Render a generic placeholder for unknown types
        content = (
          <div className={cn("p-4 bg-destructive/10 rounded border border-dashed border-destructive text-destructive-foreground text-sm flex flex-col items-center justify-center h-24")}>
            <p className="font-semibold">Unknown Widget</p>
            <p className="text-xs mt-1">{widget.type}</p>
          </div>
        );
    }

    return (
      <div
        key={widget.id}
        id={`widget-${widget.id}`} // Add an ID for potential targeting
        onClick={(e) => handleWidgetClick(e, widget.id)}
        className={commonWrapperClasses}
        role="button" // Make it accessible as a clickable element
        tabIndex={0} // Make it focusable
        aria-label={`Widget: ${widget.name || widget.type}. ${isSelected ? 'Selected.' : ''} Click to configure.`}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleWidgetClick(e as any, widget.id)}} // Allow selection with keyboard
      >
        {/* Render the actual widget content */}
        <div className="widget-content">
             {content}
        </div>

        {/* Overlay and Delete Button - Improved Visibility & Accessibility */}
        <div className="absolute inset-0 bg-transparent group-hover:bg-black/10 dark:group-hover:bg-white/5 transition-colors duration-150 rounded-lg pointer-events-none"></div>
         <UiButton
          variant="destructive"
          size="icon"
          className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 focus-within:opacity-100 group-focus:opacity-100 transition-opacity z-10 rounded-full shadow-md" // Increased size, always visible on focus
          onClick={(e) => {
             e.stopPropagation(); // Prevent triggering widget selection
             removeWidget(widget.id);
          }}
          aria-label={`Remove ${widget.name || widget.type} widget`}
          tabIndex={isSelected ? 0 : -1} // Only focusable when widget is selected
        >
          <Trash2 className="h-4 w-4" />
        </UiButton>
      </div>
    );
  };


  return (
    <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[10px] rounded-[2.5rem] h-[700px] w-[350px] shadow-xl">
      {/* Phone Top Notch */}
      <div className="w-[140px] h-[18px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute z-20"></div>
      {/* Phone Side Buttons (visual only) */}
      <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[13px] top-[124px] rounded-l-lg z-0"></div>
      <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[13px] top-[178px] rounded-l-lg z-0"></div>
      <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[13px] top-[142px] rounded-r-lg z-0"></div>

      {/* Phone Screen */}
      <div className="rounded-[2rem] overflow-hidden w-full h-full bg-background relative z-10">
        {/* App Content Area */}
        <div
          className={cn(
            'w-full h-full p-2 overflow-y-auto scroll-smooth transition-colors duration-200', // Adjusted padding
            isDraggingOver
              ? 'bg-accent/10 ring-2 ring-accent ring-inset'
              : 'bg-white dark:bg-neutral-900'
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          id="phone-preview-dropzone"
          aria-label="Phone preview area. Drag widgets here."
        >
          {widgets.length === 0 && !isDraggingOver && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-6 pointer-events-none"> {/* Disable pointer events */}
              <Smartphone className="w-16 h-16 mb-4 opacity-70" />
              <p className="text-sm font-medium mb-1">App Preview</p>
              <p className="text-xs">
                Drag widgets from the left panel and drop them here. Click a widget to configure it.
              </p>
            </div>
          )}
          {isDraggingOver && widgets.length === 0 && (
             <div className="flex flex-col items-center justify-center h-full text-center text-accent font-medium pointer-events-none"> {/* Disable pointer events */}
              <p>Drop widget here</p>
            </div>
          )}
          {/* Render widgets */}
           {/* Use a div container for widgets for potential future layout needs */}
          <div
            className={cn("transition-opacity duration-150", isDraggingOver ? 'opacity-50' : 'opacity-100')}
            aria-live="polite" // Announce changes when widgets are added/removed
            aria-label="App content widgets"
            >
             {widgets.map(renderWidgetContent)}
          </div>

          {/* Show drop indicator at the bottom when dragging over existing widgets */}
           {isDraggingOver && widgets.length > 0 && (
             <div className="mt-2 p-3 border-2 border-dashed border-accent rounded text-center text-accent font-medium text-sm bg-accent/5 pointer-events-none"> {/* Disable pointer events */}
                Drop here to add
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
