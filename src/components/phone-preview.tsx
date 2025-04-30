
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image'; // Import next/image
import { cn } from '@/lib/utils';
import { Smartphone, Trash2, MapPin, Video, Type, MousePointerSquare, Space as SpacerIcon } from 'lucide-react';
import { Button as UiButton } from '@/components/ui/button'; // Renamed to avoid conflict
import { Card } from '@/components/ui/card';
import type { DroppedWidget, TextConfig, ButtonConfig, SpacerConfig, MapConfig, VideoConfig, GridConfig, ListConfig, BannerConfig, FormConfig } from '@/types/widget'; // Import the type

interface PhonePreviewProps {
  widgets: DroppedWidget[];
  setWidgets: React.Dispatch<React.SetStateAction<DroppedWidget[]>>;
  selectedWidgetId: string | null;
  setSelectedWidgetId: React.Dispatch<React.SetStateAction<string | null>>;
}

// Helper function to get Tailwind margin class (adjust multiplier as needed)
const getMarginClass = (value: number | undefined, prefix: 'mt' | 'mb'): string => {
    if (value === undefined || value <= 0) return '';
    // Simple mapping: 1 -> 0.25rem -> Tailwind's '1'
    return `${prefix}-${value}`;
};

// Helper function to get Tailwind alignment class
const getAlignmentClass = (alignment: string | undefined): string => {
    switch (alignment) {
        case 'left': return 'text-left justify-start';
        case 'center': return 'text-center justify-center';
        case 'right': return 'text-right justify-end';
        default: return 'text-left justify-start';
    }
};

// Helper function to get Tailwind font size class
const getFontSizeClass = (size: string | undefined): string => {
    switch (size) {
        case 'xs': return 'text-xs';
        case 'sm': return 'text-sm';
        case 'lg': return 'text-lg';
        case 'xl': return 'text-xl';
        case '2xl': return 'text-2xl';
        case 'base':
        default: return 'text-base';
    }
};

// Helper to get aspect ratio class
const getAspectRatioClass = (ratio: string | undefined): string => {
    switch (ratio) {
        case '16/9': return 'aspect-video';
        case '4/3': return 'aspect-[4/3]';
        case '1/1': return 'aspect-square';
        case '9/16': return 'aspect-[9/16]';
        default: return 'aspect-video';
    }
}


export function PhonePreview({
  widgets,
  setWidgets,
  selectedWidgetId,
  setSelectedWidgetId,
}: PhonePreviewProps) {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [browserSpecificRender, setBrowserSpecificRender] = useState(false);

  useEffect(() => {
        // Ensure map/video rendering happens client-side after mount
        // to avoid hydration issues with potential browser APIs they might use internally
        setBrowserSpecificRender(true);
    }, []);


  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const widgetType = event.dataTransfer.getData('widgetType');
    if (widgetType) {
      console.log('Dropped:', widgetType);
      // Get default config for the dropped type
      const defaultConfig = widgetDefaultValuesMap[widgetType as keyof typeof widgetDefaultValuesMap] || {};
      const newWidget: DroppedWidget = {
        id: `${widgetType}-${Date.now()}`, // Use Date.now() for simple unique ID
        type: widgetType,
        config: defaultConfig, // Initialize with default config
      };
      setWidgets((prevWidgets) => [...prevWidgets, newWidget]);
      setSelectedWidgetId(newWidget.id); // Select the newly dropped widget
    }
    setIsDraggingOver(false);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    setIsDraggingOver(false);
  };

  const handleWidgetClick = (
    event: React.MouseEvent<HTMLDivElement>,
    widgetId: string
  ) => {
    // Prevent click from triggering when delete button is clicked
    if ((event.target as HTMLElement).closest('button[aria-label^="Remove"]')) {
        return;
    }
    setSelectedWidgetId(widgetId);
  };


  const removeWidget = (idToRemove: string) => {
     if (selectedWidgetId === idToRemove) {
      setSelectedWidgetId(null); // Deselect if the removed widget was selected
    }
    setWidgets((prevWidgets) =>
      prevWidgets.filter((widget) => widget.id !== idToRemove)
    );

  };

  // Function to render a placeholder or configured widget
  const renderWidgetContent = (widget: DroppedWidget) => {
    let content;
    const isSelected = widget.id === selectedWidgetId;
    const config = widget.config || {};
    const marginTopClass = getMarginClass(config.marginTop, 'mt');
    const marginBottomClass = getMarginClass(config.marginBottom, 'mb');
    const commonClasses = cn(marginTopClass, marginBottomClass);

    switch (widget.type) {
      case 'grid':
        const gridConfig = config as GridConfig;
        const columns = gridConfig.columns || '2';
        const gap = gridConfig.gap ?? 2;
        content = (
          <div className={cn("p-2 bg-muted/30 rounded border border-dashed border-input", commonClasses)}>
              <div className={`grid grid-cols-${columns} gap-${gap}`}>
                {[...Array(parseInt(columns) * 2)].map((_, i) => ( // Show more items for grid
                     <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
                ))}
              </div>
              <span className="text-xs text-muted-foreground block text-center pt-1">Grid ({columns} cols, gap {gap})</span>
          </div>
        );
        break;
      case 'banner':
          const bannerConfig = config as BannerConfig;
          content = (
              <div className={cn("relative w-full rounded overflow-hidden bg-muted", commonClasses)}>
                  {bannerConfig.imageUrl ? (
                      <Image
                          src={bannerConfig.imageUrl}
                          alt={bannerConfig.altText || 'Banner image'}
                          layout="fill"
                          objectFit="cover"
                          data-ai-hint="banner image website"
                          onError={(e) => {
                              // Handle image loading errors, e.g., show placeholder
                              e.currentTarget.style.display = 'none'; // Hide broken image
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                  const placeholder = parent.querySelector('.banner-placeholder');
                                  if (placeholder) placeholder.classList.remove('hidden');
                              }
                          }}
                       />
                  ) : null}
                   <div className={cn(
                       "banner-placeholder h-24 flex items-center justify-center text-muted-foreground text-xs",
                       bannerConfig.imageUrl && "hidden" // Hide placeholder if URL exists (will be shown on error)
                   )}>
                       Banner (No Image)
                   </div>
              </div>
          );
        break;
      case 'list':
         const listConfig = config as ListConfig;
         const itemLayout = listConfig.itemLayout || 'simple';
         const showDividers = listConfig.showDividers ?? true;
         const layoutClasses = itemLayout === 'image-left' ? 'flex items-center space-x-2' : '';
        content = (
          <div className={cn("space-y-1 p-2 bg-muted/30 rounded border border-dashed border-input", commonClasses)}>
            {[...Array(3)].map((_, i) => (
               <div key={i} className={cn("h-8 bg-muted rounded animate-pulse", layoutClasses, showDividers && i < 2 ? 'border-b border-border pb-1 mb-1' : '')}>
                 {itemLayout === 'image-left' && <div className="h-8 w-8 bg-muted-foreground/20 rounded flex-shrink-0"></div>}
                 <div className={cn("w-full", i === 1 ? "w-5/6" : "w-full")}></div> {/* Simulate text */}
               </div>
            ))}
             <span className="text-xs text-muted-foreground block text-center pt-1">List ({itemLayout})</span>
          </div>
        );
        break;
      case 'form':
          const formConfig = config as FormConfig;
          content = (
          <div className={cn("space-y-2 p-3 border border-dashed rounded border-input bg-card", commonClasses)}>
            <div className="h-5 bg-muted rounded animate-pulse w-1/3"></div> {/* Label */}
            <div className="h-8 bg-muted rounded animate-pulse w-full"></div> {/* Input */}
            <div className="h-5 bg-muted rounded animate-pulse w-1/3"></div> {/* Label */}
            <div className="h-16 bg-muted rounded animate-pulse w-full"></div> {/* Textarea */}
            <div className="flex justify-end">
                <div className="h-8 bg-primary/20 rounded animate-pulse w-1/4 px-4 py-2 text-xs text-primary-foreground">
                    {formConfig.submitButtonText || 'Submit'}
                 </div>
             </div>
             <span className="text-xs text-muted-foreground block text-center pt-1">Form</span>
          </div>
        );
        break;
      case 'text':
          const textConfig = config as TextConfig;
          const alignmentClass = getAlignmentClass(textConfig.alignment);
          const fontSizeClass = getFontSizeClass(textConfig.fontSize);
          const fontWeightClass = textConfig.isBold ? 'font-bold' : 'font-normal';
          const fontStyleClass = textConfig.isItalic ? 'italic' : 'not-italic';
          content = (
              <div className={cn("p-1", commonClasses, alignmentClass)}>
                  <p className={cn(fontSizeClass, fontWeightClass, fontStyleClass)}>
                      {textConfig.content || "Text Block Placeholder"}
                  </p>
              </div>
          );
          break;
       case 'button':
          const buttonConfig = config as ButtonConfig;
          const btnAlignClass = getAlignmentClass(buttonConfig.alignment);
          content = (
              <div className={cn("flex", commonClasses, btnAlignClass)}>
                  <UiButton
                      variant={buttonConfig.variant || 'default'}
                      size="sm" // Keep buttons smaller in preview
                      onClick={(e) => e.preventDefault()} // Prevent navigation in preview
                      className="pointer-events-none" // Make non-interactive in preview
                  >
                      {buttonConfig.buttonText || "Button Text"}
                  </UiButton>
              </div>
          );
          break;
        case 'spacer':
            const spacerConfig = config as SpacerConfig;
            const height = spacerConfig.height || 4;
            content = (
                <div
                    className={cn(commonClasses, `h-${height}`, "bg-muted/20 border border-dashed border-input rounded flex items-center justify-center")}
                    aria-label={`Spacer (${height * 0.25}rem)`}
                 >
                     <span className="text-xs text-muted-foreground">Spacer ({height})</span>
                 </div>
            );
            break;
         case 'map':
            const mapConfig = config as MapConfig;
            content = (
                <div className={cn("relative h-40 bg-muted rounded border border-dashed border-input overflow-hidden", commonClasses)}>
                   {browserSpecificRender ? (
                    // Basic Map Placeholder - Replace with actual map component if available
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                        <MapPin className="w-8 h-8 mb-1" />
                        <p className="text-xs px-2 text-center">Map Placeholder</p>
                        <p className="text-[10px] px-2 text-center truncate w-full">{mapConfig.address}</p>
                     </div>
                    /* Example using iframe (requires careful security considerations & API keys)
                    <iframe
                        width="100%"
                        height="100%"
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(mapConfig.address || '')}&zoom=${mapConfig.zoomLevel || 15}`}
                        className="border-0"
                     ></iframe>
                     */
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs animate-pulse">Loading Map...</div>
                    )}

                </div>
            );
            break;
        case 'video':
             const videoConfig = config as VideoConfig;
             const aspectRatioClass = getAspectRatioClass(videoConfig.aspectRatio);
             content = (
                 <div className={cn("relative bg-muted rounded border border-dashed border-input overflow-hidden", commonClasses, aspectRatioClass)}>
                     {browserSpecificRender && videoConfig.videoUrl ? (
                         // Basic Video Placeholder - Replace with actual video player
                         <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-black">
                            <Video className="w-8 h-8 mb-1 text-white" />
                            <p className="text-xs px-2 text-center text-white">Video Placeholder</p>
                             <p className="text-[10px] px-2 text-center truncate w-full text-gray-400">{videoConfig.videoUrl}</p>
                         </div>
                         /* Example using iframe (YouTube example)
                         <iframe
                            className="w-full h-full border-0"
                            src={`https://www.youtube.com/embed/${extractYouTubeId(videoConfig.videoUrl)}?autoplay=${videoConfig.autoplay ? 1 : 0}`}
                            title="Video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                         ></iframe>
                         */
                     ) : (
                         <div className={cn("w-full h-full flex items-center justify-center text-muted-foreground text-xs", !browserSpecificRender && "animate-pulse")}>
                             {browserSpecificRender ? 'Video (No URL)' : 'Loading Video...'}
                         </div>
                     )}
                 </div>
             );
             break;
      default:
        content = (
          <div className={cn("p-2 bg-destructive/20 rounded text-destructive-foreground text-xs", commonClasses)}>
            Unknown Widget: {widget.type}
          </div>
        );
    }

    return (
      <div
        key={widget.id}
        onClick={(e) => handleWidgetClick(e, widget.id)}
        className={cn(
            "relative group border-2 p-1 rounded mb-1 cursor-pointer transition-all duration-150", // Reduced margin bottom
            isSelected ? 'border-primary bg-primary/10 shadow-md' : 'border-transparent hover:border-accent hover:bg-accent/5'
        )}
         style={{
            // Apply margins dynamically if needed, though classes preferred
            // marginTop: `${(widget.config?.marginTop ?? 0) * 0.25}rem`,
            // marginBottom: `${(widget.config?.marginBottom ?? 0) * 0.25}rem`,
        }}
      >
        {content}
        {/* Overlay and Delete Button */}
        <div className="absolute inset-0 bg-transparent group-hover:bg-black/5 transition-colors duration-150 rounded pointer-events-none"></div>
         <UiButton
          variant="destructive"
          size="icon"
          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity z-10 rounded-full shadow"
          onClick={(e) => {
             e.stopPropagation(); // Prevent widget selection when deleting
             removeWidget(widget.id);
          }}
          aria-label={`Remove ${widget.type} widget`}
        >
          <Trash2 className="h-3 w-3" />
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
            'w-full h-full p-3 overflow-y-auto scroll-smooth transition-colors duration-200', // Reduced padding slightly
            isDraggingOver
              ? 'bg-accent/10 ring-2 ring-accent ring-inset'
              : 'bg-white dark:bg-neutral-900' // Adjusted background for light/dark
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {widgets.length === 0 && !isDraggingOver && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-6">
              <Smartphone className="w-16 h-16 mb-4 opacity-70" />
              <p className="text-sm font-medium mb-1">App Preview Area</p>
              <p className="text-xs">
                Drag widgets from the left panel and drop them here. Click a widget to configure it on the right.
              </p>
            </div>
          )}
          {isDraggingOver && widgets.length === 0 && ( // Show drop text only if area is empty
            <div className="flex flex-col items-center justify-center h-full text-center text-accent font-medium">
              <p>Drop widget here</p>
            </div>
          )}
          {/* Render widgets */}
          <div className={cn("transition-opacity duration-150", isDraggingOver ? 'opacity-50' : 'opacity-100')}>
             {widgets.map(renderWidgetContent)}
          </div>
          {/* Show drop indicator at the bottom when dragging over existing widgets */}
           {isDraggingOver && widgets.length > 0 && (
             <div className="mt-2 p-3 border-2 border-dashed border-accent rounded text-center text-accent font-medium text-sm">
                Drop here to add
             </div>
          )}
        </div>
      </div>
    </div>
  );
}


// --- Default Config Values (Mirrors Configuration Panel Defaults) ---
// This ensures newly dropped widgets have initial settings
const widgetDefaultValuesMap = {
    banner: { imageUrl: '', altText: '', linkUrl: '', marginTop: 2, marginBottom: 2 },
    grid: { columns: '2', gap: 2, dataSource: '', marginTop: 2, marginBottom: 2 },
    list: { itemLayout: 'simple', showDividers: true, dataSource: '', marginTop: 2, marginBottom: 2 },
    form: { submitButtonText: 'Submit', recipientEmail: '', successMessage: 'Thank you!', marginTop: 2, marginBottom: 2 },
    text: { content: 'Enter text...', fontSize: 'base', alignment: 'left', isBold: false, isItalic: false, marginTop: 2, marginBottom: 2 },
    button: { buttonText: 'Click Me', linkUrl: '', variant: 'default', alignment: 'center', marginTop: 2, marginBottom: 2 },
    spacer: { height: 4, marginTop: 0, marginBottom: 0 },
    map: { address: '1600 Amphitheatre Parkway, Mountain View, CA', zoomLevel: 15, showMarker: true, marginTop: 2, marginBottom: 2 },
    video: { videoUrl: '', aspectRatio: '16/9', autoplay: false, marginTop: 2, marginBottom: 2 },
};

// --- Helper Functions ---
// Example: Extract YouTube ID (Needs robust error handling)
function extractYouTubeId(url: string | undefined): string | null {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

