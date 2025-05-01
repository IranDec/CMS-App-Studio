
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Smartphone, Trash2, MapPin, Video, Type as TypeIcon, Image as ImageIcon, LayoutGrid, Rows, MessageSquare, MousePointerSquareDashed, Space as SpacerIcon } from 'lucide-react';
import { Button as UiButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { DroppedWidget, TextConfig, ButtonConfig, SpacerConfig, MapConfig, VideoConfig, GridConfig, ListConfig, BannerConfig, FormConfig } from '@/types/widget';

interface PhonePreviewProps {
  widgets: DroppedWidget[];
  setWidgets: React.Dispatch<React.SetStateAction<DroppedWidget[]>>;
  selectedWidgetId: string | null;
  setSelectedWidgetId: React.Dispatch<React.SetStateAction<string | null>>;
}

// Helper function to get Tailwind margin class
const getMarginClass = (value: number | undefined, prefix: 'mt' | 'mb'): string => {
    if (value === undefined || value <= 0) return '';
    // Simple mapping: 1 -> 0.25rem -> Tailwind's '1'
    // Ensure the generated class exists in Tailwind's default config or is generated.
    // Max value corresponds to `max-w-xs` in ConfigurationPanel slider.
    const validMarginValues = Array.from({ length: 21 }, (_, i) => i); // 0 to 20
    if (validMarginValues.includes(value)) {
        return `${prefix}-${value}`;
    }
    return ''; // Return empty string for invalid values
};


// Helper function to get Tailwind alignment class for text/flex justify
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
        setBrowserSpecificRender(true);
    }, []);


  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const widgetType = event.dataTransfer.getData('widgetType');
    if (widgetType) {
      console.log('Dropped:', widgetType);
      const defaultConfig = widgetDefaultValuesMap[widgetType as keyof typeof widgetDefaultValuesMap] || {};
      const newWidget: DroppedWidget = {
        id: `${widgetType}-${Date.now()}`,
        type: widgetType,
        config: { ...defaultConfig } as DroppedWidget['config'], // Add type assertion
      };
      setWidgets((prevWidgets) => [...prevWidgets, newWidget]);
      setSelectedWidgetId(newWidget.id);
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
      setSelectedWidgetId(null);
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
    // Apply common classes to the wrapper div that contains the specific widget content
    const commonWrapperClasses = cn("relative group border-2 p-1 rounded mb-1 cursor-pointer transition-all duration-150",
        marginTopClass,
        marginBottomClass, // Apply margin bottom here
        isSelected ? 'border-primary bg-primary/10 shadow-md' : 'border-transparent hover:border-accent hover:bg-accent/5'
    );

    switch (widget.type) {
        case 'banner':
            const bannerConfig = config as BannerConfig;
            content = (
                <div className={cn("relative w-full rounded overflow-hidden bg-muted", getAspectRatioClass('16/9'))} data-ai-hint="website banner placeholder">
                    {bannerConfig.imageUrl ? (
                        <Image
                            src={bannerConfig.imageUrl}
                            alt={bannerConfig.altText || 'Banner image'}
                            fill // Use fill instead of layout
                            style={{ objectFit: 'cover' }} // Use style for objectFit
                            data-ai-hint="corporate banner"
                            className="transition-opacity duration-300"
                            onError={(e) => {
                                // Handle image loading errors, show placeholder
                                const img = e.currentTarget;
                                img.style.opacity = '0'; // Hide broken image smoothly
                                const placeholder = img.nextElementSibling; // Assume placeholder is the next sibling
                                if (placeholder) placeholder.classList.remove('hidden');
                            }}
                            onLoad={(e) => {
                                // Ensure placeholder is hidden on successful load
                                const img = e.currentTarget;
                                img.style.opacity = '1';
                                const placeholder = img.nextElementSibling;
                                if (placeholder) placeholder.classList.add('hidden');
                            }}
                        />
                    ) : null}
                     {/* Placeholder is always rendered but hidden if imageUrl exists and loads */}
                     <div className={cn(
                         "banner-placeholder absolute inset-0 flex flex-col items-center justify-center text-muted-foreground text-xs bg-muted",
                         bannerConfig.imageUrl ? "hidden" : "" // Initially hidden if URL exists
                     )}>
                        <ImageIcon className="w-8 h-8 mb-1 opacity-50" />
                        <span>Banner</span>
                        {!bannerConfig.imageUrl && <span className="text-[10px]">No Image URL</span>}
                    </div>
                </div>
            );
            break;
        case 'grid':
            const gridConfig = config as GridConfig;
            const columns = gridConfig.columns || '2';
            const gap = gridConfig.gap ?? 2;
            const numColumns = parseInt(columns);
            const colClass = `grid-cols-${columns}`; // Ensure this class exists or is generated
            const gapClass = `gap-${gap}`; // Ensure this class exists or is generated
            content = (
                <div className={cn("p-2 bg-muted/30 rounded border border-dashed border-input")} data-ai-hint="product grid layout">
                    <div className={cn(`grid ${colClass} ${gapClass}`)}>
                        {[...Array(numColumns * 2)].map((_, i) => (
                            <div key={i} className="h-20 bg-muted rounded animate-pulse flex flex-col items-center justify-center">
                                 <ImageIcon size={24} className="text-muted-foreground/50 mb-1"/>
                                 <div className="h-2 w-10/12 bg-muted-foreground/20 rounded-full mt-1"></div>
                            </div>
                        ))}
                    </div>
                    <span className="text-xs text-muted-foreground block text-center pt-2">Product Grid ({columns} cols)</span>
                </div>
            );
            break;
        case 'list':
            const listConfig = config as ListConfig;
            const itemLayout = listConfig.itemLayout || 'simple';
            const showDividers = listConfig.showDividers ?? true;
            content = (
                <div className={cn("p-2 bg-muted/30 rounded border border-dashed border-input")} data-ai-hint="item list view">
                     <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                           <div
                                key={i}
                                className={cn(
                                    "h-12 bg-muted rounded animate-pulse flex items-center px-2 space-x-2",
                                    itemLayout === 'image-left' ? 'justify-start' : '',
                                    showDividers && i < 2 ? 'border-b border-border pb-2 mb-2' : ''
                                )}
                            >
                                {itemLayout === 'image-left' && <div className="h-8 w-8 bg-muted-foreground/20 rounded flex-shrink-0"></div>}
                                <div className="flex-1 space-y-1">
                                     <div className={cn("h-2 bg-muted-foreground/20 rounded-full", i === 1 ? "w-5/6" : "w-full")}></div>
                                      <div className="h-2 bg-muted-foreground/10 rounded-full w-2/3"></div>
                                </div>
                            </div>
                        ))}
                     </div>
                    <span className="text-xs text-muted-foreground block text-center pt-2">Product List ({itemLayout})</span>
                </div>
            );
            break;
        case 'form':
            const formConfig = config as FormConfig;
            content = (
                <div className={cn("space-y-3 p-3 border border-dashed rounded border-input bg-card")}>
                    {/* Simulate Labels and Inputs */}
                    <div className="space-y-1">
                        <div className="h-3 bg-muted rounded animate-pulse w-1/4"></div>
                        <div className="h-8 bg-muted rounded animate-pulse w-full"></div>
                    </div>
                     <div className="space-y-1">
                        <div className="h-3 bg-muted rounded animate-pulse w-1/3"></div>
                        <div className="h-16 bg-muted rounded animate-pulse w-full"></div>
                    </div>
                    {/* Simulate Submit Button */}
                    <div className="flex justify-end pt-2">
                        <div className="h-9 bg-primary/80 rounded animate-pulse w-1/4 px-4 py-2 text-sm font-medium text-primary-foreground flex items-center justify-center">
                            {formConfig.submitButtonText || 'Submit'}
                        </div>
                    </div>
                    <span className="text-xs text-muted-foreground block text-center pt-1">Contact Form</span>
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
                <div className={cn("p-1 min-h-[2rem]", alignmentClass)}>
                    <p className={cn(fontSizeClass, fontWeightClass, fontStyleClass, 'text-foreground break-words')}>
                        {textConfig.content || "Enter your text here..."}
                    </p>
                </div>
            );
            break;
         case 'button':
            const buttonConfig = config as ButtonConfig;
            const btnAlignClass = getAlignmentClass(buttonConfig.alignment);
            content = (
                // Ensure the container takes full width and uses flex for alignment
                <div className={cn("flex w-full py-1", btnAlignClass)}>
                    {/* Render an actual button, but disable pointer events */}
                    <UiButton
                        variant={buttonConfig.variant || 'default'}
                        size="sm"
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
            // Generate height class dynamically, ensure it exists. Max height 40 * 0.25rem = 10rem
            const validHeights = Array.from({ length: 41 }, (_, i) => i); // 0 to 40
            const heightClass = validHeights.includes(height) ? `h-${height}` : 'h-4'; // Default to h-4 if invalid

            content = (
                <div
                    className={cn(heightClass, "bg-muted/20 border border-dashed border-input rounded flex items-center justify-center overflow-hidden")}
                    aria-label={`Spacer (${height * 0.25}rem)`}
                 >
                     <SpacerIcon className="w-4 h-4 text-muted-foreground/50" />
                     <span className="text-xs text-muted-foreground ml-1">Spacer ({height})</span>
                 </div>
            );
            break;
         case 'map':
            const mapConfig = config as MapConfig;
            content = (
                <div className={cn("relative h-40 bg-muted rounded border border-dashed border-input overflow-hidden")}>
                   {browserSpecificRender ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-gray-200 dark:bg-gray-700">
                        <MapPin className="w-10 h-10 mb-2 text-primary" />
                        <p className="text-sm font-medium">Map Preview</p>
                        <p className="text-xs px-2 text-center mt-1">{mapConfig.address || "No address set"}</p>
                        {mapConfig.showMarker === false && <p className="text-[10px] text-muted-foreground/70">(Marker Hidden)</p>}
                     </div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs animate-pulse bg-muted">Loading Map...</div>
                    )}
                </div>
            );
            break;
        case 'video':
             const videoConfig = config as VideoConfig;
             const aspectRatioClass = getAspectRatioClass(videoConfig.aspectRatio);
             content = (
                 <div className={cn("relative bg-black rounded border border-dashed border-input overflow-hidden", aspectRatioClass)}>
                     {browserSpecificRender ? (
                         <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground ">
                            <Video className="w-10 h-10 mb-2 text-white/80" />
                            <p className="text-sm font-medium text-white/90">Video Preview</p>
                             {videoConfig.videoUrl ? (
                                <p className="text-xs px-2 text-center mt-1 text-gray-400 truncate w-full">{videoConfig.videoUrl}</p>
                             ): (
                                <p className="text-xs px-2 text-center mt-1 text-gray-500">No Video URL</p>
                             )}
                            {videoConfig.autoplay && <p className="text-[10px] text-yellow-500 mt-0.5">(Autoplay Enabled)</p>}
                         </div>
                     ) : (
                         <div className={cn("w-full h-full flex items-center justify-center text-muted-foreground text-xs animate-pulse bg-muted")}>
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
        onClick={(e) => handleWidgetClick(e, widget.id)}
        className={commonWrapperClasses} // Apply wrapper classes here
        // style={{
        //      Apply inline margins only if absolutely necessary and Tailwind classes aren't sufficient
        //      marginTop: `${(widget.config?.marginTop ?? 0) * 0.25}rem`,
        //      marginBottom: `${(widget.config?.marginBottom ?? 0) * 0.25}rem`,
        // }}
      >
        {/* Content does not need margins applied again */}
        <div className="widget-content">
             {content}
        </div>

        {/* Overlay and Delete Button */}
        <div className="absolute inset-0 bg-transparent group-hover:bg-black/5 transition-colors duration-150 rounded pointer-events-none"></div>
         <UiButton
          variant="destructive"
          size="icon"
          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity z-10 rounded-full shadow"
          onClick={(e) => {
             e.stopPropagation();
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
            'w-full h-full p-2 overflow-y-auto scroll-smooth transition-colors duration-200', // Adjusted padding
            isDraggingOver
              ? 'bg-accent/10 ring-2 ring-accent ring-inset'
              : 'bg-white dark:bg-neutral-900'
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {widgets.length === 0 && !isDraggingOver && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-6">
              <Smartphone className="w-16 h-16 mb-4 opacity-70" />
              <p className="text-sm font-medium mb-1">App Preview</p>
              <p className="text-xs">
                Drag widgets from the left panel and drop them here. Click a widget to configure it.
              </p>
            </div>
          )}
          {isDraggingOver && widgets.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center text-accent font-medium">
              <p>Drop widget here</p>
            </div>
          )}
          {/* Render widgets */}
          <div className={cn("space-y-1 transition-opacity duration-150", isDraggingOver ? 'opacity-50' : 'opacity-100')}>
             {widgets.map(renderWidgetContent)}
          </div>
          {/* Show drop indicator at the bottom when dragging over existing widgets */}
           {isDraggingOver && widgets.length > 0 && (
             <div className="mt-2 p-3 border-2 border-dashed border-accent rounded text-center text-accent font-medium text-sm bg-accent/5">
                Drop here to add
             </div>
          )}
        </div>
      </div>
    </div>
  );
}


// --- Default Config Values (Mirrors Configuration Panel Defaults) ---
const widgetDefaultValuesMap: { [key: string]: Partial<DroppedWidget['config']> } = {
    banner: { imageUrl: '', altText: '', linkUrl: '', marginTop: 2, marginBottom: 2 },
    grid: { columns: '2', gap: 2, dataSource: '', marginTop: 2, marginBottom: 2 },
    list: { itemLayout: 'simple', showDividers: true, dataSource: '', marginTop: 2, marginBottom: 2 },
    form: { submitButtonText: 'Submit', recipientEmail: '', successMessage: 'Thank you!', marginTop: 2, marginBottom: 2 },
    text: { content: 'Text Block', fontSize: 'base', alignment: 'left', isBold: false, isItalic: false, marginTop: 2, marginBottom: 2 },
    button: { buttonText: 'Click Me', linkUrl: '', variant: 'default', alignment: 'center', marginTop: 2, marginBottom: 2 },
    spacer: { height: 4, marginTop: 0, marginBottom: 0 },
    map: { address: '1600 Amphitheatre Parkway, Mountain View, CA', zoomLevel: 15, showMarker: true, marginTop: 2, marginBottom: 2 },
    video: { videoUrl: '', aspectRatio: '16/9', autoplay: false, marginTop: 2, marginBottom: 2 },
};

// --- Helper Functions ---
// Removed unused extractYouTubeId function
