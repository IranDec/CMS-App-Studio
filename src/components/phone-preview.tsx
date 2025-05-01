

'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link'; // Import Link
import { cn } from '@/lib/utils';
import {
    Smartphone, Trash2, MapPin, Video as VideoIconLucide, Type as TypeIcon,
    Image as ImageIcon, LayoutGrid, Rows, MessageSquare,
    MousePointerSquareDashed, Space as SpacerIcon, GripVertical,
    PanelTop, // Header icon
    ArrowLeft, // Back button icon
    Menu, // Menu button icon
    ShoppingCart, // Cart icon
    User, // User/Auth icon
} from 'lucide-react';
import { Button as UiButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { DroppedWidget, TextConfig, ButtonConfig, SpacerConfig, MapConfig, VideoConfig, GridConfig, ListConfig, BannerConfig, FormConfig, HeaderConfig, BaseWidgetConfig, WidgetDefinition } from '@/types/widget';
import { widgetDefaultValuesMap } from '@/lib/widget-defaults';

interface PhonePreviewProps {
  widgets: DroppedWidget[];
  setWidgets: React.Dispatch<React.SetStateAction<DroppedWidget[]>>; // Keep for direct deletion
  selectedWidgetId: string | null;
  setSelectedWidgetId: React.Dispatch<React.SetStateAction<string | null>>;
  addWidget: (widget: DroppedWidget) => void; // Function to add a new widget
  moveWidget: (draggedId: string, targetId: string) => void; // Function to reorder widgets
}

// --- Helper Functions for Dynamic Classes (Keep existing helpers) ---
// getMarginClass, getAlignmentClass, getFontSizeClass, getTextColorClass,
// getAspectRatioClass, getImageFitClass, getGridColsClass, getGapClass,
// getButtonSizeClass, getButtonAlignmentClass, getImageSizeClass

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
  setWidgets, // Keep for delete action
  selectedWidgetId,
  setSelectedWidgetId,
  addWidget,
  moveWidget,
}: PhonePreviewProps) {
  const [isDraggingOverContainer, setIsDraggingOverContainer] = useState(false); // For overall drop zone
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null); // ID of the widget being dragged internally
  const [dropTargetId, setDropTargetId] = useState<string | null>(null); // ID of the widget being hovered over for dropping
  const [isClient, setIsClient] = useState(false);
  const widgetsContainerRef = useRef<HTMLDivElement>(null); // Ref for the widgets container

  useEffect(() => {
    setIsClient(true);
  }, []);

  // --- Drag and Drop Handlers ---

  // == Handling Drag Start (from Widget Panel) ==
  const handleContainerDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    // Check if the item being dragged is from the widget panel (not internal)
    if (event.dataTransfer.types.includes('widgettype')) {
        setIsDraggingOverContainer(true);
         // Clear internal drag state if dragging from panel
         setDraggedWidgetId(null);
         setDropTargetId(null);
    } else if (draggedWidgetId) {
         // If dragging internally, set container as potential drop zone only if no widget is targeted
         if (!dropTargetId) {
            setIsDraggingOverContainer(true);
         } else {
             setIsDraggingOverContainer(false);
         }
    }
  };

  const handleContainerDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
     // Check if leaving to outside the container or to a child
     if (!event.currentTarget.contains(event.relatedTarget as Node)) {
        setIsDraggingOverContainer(false);
        // Don't clear dropTargetId here, it's handled by widget drag leave
     }
  };

  const handleContainerDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingOverContainer(false);

    // == Handle Drop from Widget Panel (Add New Widget) ==
    const widgetType = event.dataTransfer.getData('widgetType');
    const widgetName = event.dataTransfer.getData('widgetName');
    if (widgetType && !draggedWidgetId) { // Ensure it's not an internal drag
      console.log('Dropped from panel:', widgetType, 'Name:', widgetName);
      const defaultConfig = widgetDefaultValuesMap[widgetType as keyof typeof widgetDefaultValuesMap] || {};
      const newWidget: DroppedWidget = {
        id: `${widgetType}-${Date.now()}`,
        type: widgetType,
        name: widgetName || widgetType.charAt(0).toUpperCase() + widgetType.slice(1),
        config: { ...defaultConfig } as DroppedWidget['config'],
      };

       // Special handling for header: only allow one and place it at the top
        if (widgetType === 'header') {
             // Check if a header already exists
            const headerExists = widgets.some(w => w.type === 'header');
            if (headerExists) {
                 console.log("Header already exists, cannot add another.");
                 // Maybe show a toast message here?
                 setDraggedWidgetId(null); // Reset drag state
                 setDropTargetId(null);
                 return;
             }
             // If no header exists, add it to the beginning of the array
             setWidgets(prev => [newWidget, ...prev]);
             setSelectedWidgetId(newWidget.id);
        } else {
            // For other widgets, add normally (handled by moveWidget or addWidget)
            // If there's a drop target, insert before it, otherwise add to end
            if (dropTargetId) {
                const targetIndex = widgets.findIndex(w => w.id === dropTargetId);
                if (targetIndex !== -1) {
                     setWidgets(prev => {
                         const newWidgets = [...prev];
                         newWidgets.splice(targetIndex, 0, newWidget);
                         return newWidgets;
                     });
                      setSelectedWidgetId(newWidget.id);
                 } else {
                     // Fallback if target disappears? Add to end.
                    addWidget(newWidget);
                 }
             } else {
                addWidget(newWidget); // Add to end if no specific target
             }

        }

        // Clear drop target highlighting
        document.querySelectorAll('.widget-wrapper.drop-target-hover').forEach(el => {
            el.classList.remove('drop-target-hover');
        });
        setDropTargetId(null);
        setDraggedWidgetId(null); // Reset internal drag state too
        return; // Stop processing if it was an external drop
    }


    // == Handle Internal Reorder Drop ==
    if (draggedWidgetId && dropTargetId) {
        console.log(`Internal drop: Dragged ${draggedWidgetId} onto ${dropTargetId}`);
         // Prevent dropping header anywhere other than the top (it should be moved via config perhaps?)
         const draggedWidget = widgets.find(w => w.id === draggedWidgetId);
         if (draggedWidget?.type === 'header') {
             console.log("Header cannot be moved via drag and drop.");
         } else {
             moveWidget(draggedWidgetId, dropTargetId);
         }
    } else if (draggedWidgetId && !dropTargetId && widgets.length > 0) {
         // Dropped onto the container background (not a specific widget), move to the end
         console.log(`Internal drop: Dragged ${draggedWidgetId} to end`);
         const nonHeaderWidgets = widgets.filter(w => w.type !== 'header');
         if (nonHeaderWidgets.length > 0) {
            const lastWidgetId = nonHeaderWidgets[nonHeaderWidgets.length - 1].id;
            const draggedWidget = widgets.find(w => w.id === draggedWidgetId);

            if (draggedWidget?.type === 'header') {
                console.log("Header cannot be moved via drag and drop.");
            } else if (draggedWidgetId !== lastWidgetId) {
                moveWidget(draggedWidgetId, lastWidgetId);
            }
         }
    }

    // Reset internal drag state
    setDraggedWidgetId(null);
    setDropTargetId(null);
     // Clear drop target highlighting
    document.querySelectorAll('.widget-wrapper.drop-target-hover').forEach(el => {
        el.classList.remove('drop-target-hover');
    });
  };


  // == Handling Internal Widget Drag and Drop (Reordering) ==
  const handleWidgetDragStart = (event: React.DragEvent<HTMLDivElement>, widgetId: string) => {
     const widget = widgets.find(w => w.id === widgetId);
      // Prevent dragging the header widget
     if (widget?.type === 'header') {
         console.log("Preventing drag start for header widget.");
         event.preventDefault();
         return;
     }

     // Check if dragging by the handle
     if (!(event.target as HTMLElement).closest('.widget-drag-handle')) {
         event.preventDefault(); // Prevent drag if not initiated from handle
         console.log("Drag prevented: Not initiated from handle.");
         return;
     }
    console.log(`Internal drag start: ${widgetId}`);
    event.dataTransfer.setData('widgetIdInternal', widgetId);
    event.dataTransfer.effectAllowed = 'move'; // Indicate a move operation
    setDraggedWidgetId(widgetId);
    // Make the dragged element slightly transparent
    event.currentTarget.style.opacity = '0.5';
  };

  const handleWidgetDragOver = (event: React.DragEvent<HTMLDivElement>, targetWidgetId: string) => {
    event.preventDefault();
    event.stopPropagation(); // Prevent container drag over from firing

    const targetWidget = widgets.find(w => w.id === targetWidgetId);
    // Prevent dropping onto the header widget
    if (targetWidget?.type === 'header') {
        setDropTargetId(null); // Clear potential target
        event.currentTarget.classList.remove('drop-target-hover');
        // maybe set drop effect to none? event.dataTransfer.dropEffect = "none";
        return;
    }

    if (draggedWidgetId && draggedWidgetId !== targetWidgetId) {
       // console.log(`Internal drag over: Target ${targetWidgetId}`);
       setDropTargetId(targetWidgetId);
       setIsDraggingOverContainer(false); // Ensure container highlight is off
        // Optionally add visual feedback to the target widget
        event.currentTarget.classList.add('drop-target-hover');
    }
  };

   const handleWidgetDragEnter = (event: React.DragEvent<HTMLDivElement>, targetWidgetId: string) => {
       event.preventDefault();
       event.stopPropagation();
        const targetWidget = widgets.find(w => w.id === targetWidgetId);
        if (targetWidget?.type === 'header') {
            return; // Do nothing if entering the header
        }
        if (draggedWidgetId && draggedWidgetId !== targetWidgetId) {
            setDropTargetId(targetWidgetId);
            setIsDraggingOverContainer(false);
            event.currentTarget.classList.add('drop-target-hover'); // Add visual cue on enter
        }
    };


  const handleWidgetDragLeave = (event: React.DragEvent<HTMLDivElement>, targetWidgetId: string) => {
     event.stopPropagation();
      // Only remove target state if leaving the specific widget element entirely
      // Check if relatedTarget (where the mouse is going) is outside this widget wrapper
      if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          // console.log(`Internal drag leave: Target ${targetWidgetId}`);
          if (dropTargetId === targetWidgetId) {
            setDropTargetId(null); // Clear target if leaving the current one
          }
          event.currentTarget.classList.remove('drop-target-hover');
      }

  };

   const handleWidgetDrop = (event: React.DragEvent<HTMLDivElement>, targetWidgetId: string) => {
        event.preventDefault();
        event.stopPropagation(); // Important to prevent container drop handler

         const targetWidget = widgets.find(w => w.id === targetWidgetId);
         if (targetWidget?.type === 'header') {
            console.log("Cannot drop onto header widget.");
            // Reset styles and state handled in handleWidgetDragEnd
             event.currentTarget.classList.remove('drop-target-hover'); // Remove visual cue
             handleContainerDrop(event); // Forward to container drop to reset states
             return;
         }


        if (draggedWidgetId && draggedWidgetId !== targetWidgetId) {
            console.log(`Internal drop onto widget: Dragged ${draggedWidgetId} onto ${targetWidgetId}`);
            moveWidget(draggedWidgetId, targetWidgetId);
        }
        // Reset styles and state handled in handleContainerDrop or handleWidgetDragEnd
         event.currentTarget.classList.remove('drop-target-hover'); // Remove visual cue
         // Let the container drop handle the final state reset
        handleContainerDrop(event); // Forward to container drop to reset states

    };


  const handleWidgetDragEnd = (event: React.DragEvent<HTMLDivElement>) => {
    console.log("Internal drag end");
    // Restore opacity
    event.currentTarget.style.opacity = '1';
    // Reset internal drag state if the drop wasn't successful or happened outside
     // Find all potential drop targets and remove hover class
    document.querySelectorAll('.widget-wrapper.drop-target-hover').forEach(el => {
        el.classList.remove('drop-target-hover');
    });
    // Reset state, ensuring dropTargetId is cleared if drag ends without a valid drop
    setDraggedWidgetId(null);
    setDropTargetId(null);
    setIsDraggingOverContainer(false);

  };


  // --- Other Handlers ---
  const handleWidgetClick = (
    event: React.MouseEvent<HTMLDivElement>,
    widgetId: string
  ) => {
    // Prevent selection if delete or drag handle was clicked
    if (
      (event.target as HTMLElement).closest('button[aria-label^="Remove"]') ||
      (event.target as HTMLElement).closest('.widget-drag-handle')
    ) {
      return;
    }
    setSelectedWidgetId(widgetId);
    console.log("Selected widget:", widgetId);
  };

  const removeWidget = (idToRemove: string) => {
    if (selectedWidgetId === idToRemove) {
      setSelectedWidgetId(null);
    }
    // Use the passed setWidgets for deletion
    setWidgets((prevWidgets) =>
      prevWidgets.filter((widget) => widget.id !== idToRemove)
    );
    console.log("Removed widget:", idToRemove);
  };


  // --- Render Widget Content ---
  const renderWidgetContent = (widget: DroppedWidget, index: number) => {
    let content;
    const isSelected = widget.id === selectedWidgetId;
    const isBeingDragged = widget.id === draggedWidgetId;
    const isDropTarget = widget.id === dropTargetId && !isBeingDragged; // Don't highlight self as target

     // Determine if margins should be applied (not for header)
    const applyMargins = widget.type !== 'header';
    const config: BaseWidgetConfig & Record<string, any> = {
        // Provide defaults only if margins apply
        marginTop: applyMargins ? (widgetDefaultValuesMap[widget.type as keyof typeof widgetDefaultValuesMap]?.marginTop ?? 2) : undefined,
        marginBottom: applyMargins ? (widgetDefaultValuesMap[widget.type as keyof typeof widgetDefaultValuesMap]?.marginBottom ?? 2) : undefined,
        ...(widget.config || {}),
    };

    const marginTopClass = applyMargins ? getMarginClass(config.marginTop, 'mt') : '';
    const marginBottomClass = applyMargins ? getMarginClass(config.marginBottom, 'mb') : '';

    const commonWrapperClasses = cn(
      "relative group border-2 p-1 rounded-lg transition-all duration-150 ease-in-out",
      "widget-wrapper", // Common class for targeting
       widget.type !== 'header' && 'mb-1', // Add margin bottom only if not header
       marginTopClass,
       marginBottomClass,
       isSelected ? 'border-primary bg-primary/10 shadow-md ring-2 ring-primary ring-offset-1 z-10' // Ensure selected is above others
                 : 'border-transparent hover:border-accent hover:bg-accent/5',
      isBeingDragged ? 'opacity-50 cursor-grabbing' : (widget.type !== 'header' ? 'cursor-pointer' : 'cursor-default'), // Header not clickable to select (yet)
      isDropTarget ? 'border-accent border-dashed bg-accent/10 ring-2 ring-accent ring-offset-1' : '',
      widget.type === 'header' && 'sticky top-0 bg-background z-20 rounded-b-none border-b', // Header specific styles
    );

     const renderPlaceholder = (icon: React.ElementType, name: string, details?: string, hint?: string) => (
        <div
            className={cn("relative w-full rounded overflow-hidden bg-muted flex items-center justify-center h-32 border border-dashed border-input", aspectRatioClassBanner || '')}
             data-ai-hint={hint || `${name} placeholder`}
        >
            <div className="flex flex-col items-center justify-center text-muted-foreground text-xs p-2 text-center">
                {React.createElement(icon, { className: "w-8 h-8 mb-1 opacity-50" })}
                <span>{name}</span>
                 {details && <span className="text-[10px] mt-0.5">{details}</span>}
            </div>
        </div>
    );

     // Get config safely with defaults
    const safeConfig = <T extends BaseWidgetConfig | HeaderConfig>(defaultConf: Partial<T>): T & Partial<BaseWidgetConfig> & Partial<HeaderConfig> => ({
        ...defaultConf,
        ...(widget.config || {}),
         // Ensure base margins are kept only if applicable
         marginTop: applyMargins ? config.marginTop : undefined,
         marginBottom: applyMargins ? config.marginBottom : undefined,
    }) as T & Partial<BaseWidgetConfig> & Partial<HeaderConfig>;


    switch (widget.type) {
         case 'header':
             const headerConfig = safeConfig<HeaderConfig>(widgetDefaultValuesMap.header);
             content = (
                 <div className="flex items-center justify-between h-12 px-3 bg-card text-card-foreground shadow-sm w-full">
                     <div className="flex items-center gap-1">
                         {headerConfig.showBackButton && (
                             <Link href="/previous-page" passHref>
                                <UiButton variant="ghost" size="icon" className="h-8 w-8 text-foreground" asChild>
                                    {/* Wrap fragment child in a span */}
                                    <span>
                                        <ArrowLeft className="h-5 w-5" />
                                    </span>
                                </UiButton>
                             </Link>
                         )}
                         {headerConfig.showMenuButton && (
                            <Link href="/menu" passHref>
                                <UiButton variant="ghost" size="icon" className="h-8 w-8 text-foreground" asChild>
                                     {/* Wrap fragment child in a span */}
                                     <span>
                                        <Menu className="h-5 w-5" />
                                     </span>
                                </UiButton>
                             </Link>
                         )}
                     </div>
                     <h1 className="text-lg font-semibold text-center flex-1 truncate px-2">
                         {headerConfig.title || 'App Name'}
                     </h1>
                     <div className="flex items-center gap-1">
                         {headerConfig.showCartIcon && (
                            <Link href="/cart" passHref>
                                <UiButton variant="ghost" size="icon" className="h-8 w-8 text-foreground relative" asChild>
                                    {/* Wrap fragment children in a single span */}
                                    <span>
                                        <ShoppingCart className="h-5 w-5" />
                                        {/* Basic badge simulation */}
                                        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-card bg-red-500" />
                                    </span>
                                </UiButton>
                            </Link>
                         )}
                          {headerConfig.showAuthButton && (
                             <Link href="/auth" passHref>
                                <UiButton variant="ghost" size="sm" className="h-8 px-2 text-sm text-foreground" asChild>
                                    {/* Wrap fragment children in a single span */}
                                    <span>
                                        <User className="h-4 w-4 mr-1" />
                                        {headerConfig.authButtonText || 'Login'}
                                    </span>
                                </UiButton>
                            </Link>
                         )}
                     </div>
                 </div>
             );
             break;

        case 'banner':
            const bannerConfig = safeConfig<BannerConfig>(widgetDefaultValuesMap.banner);
            const aspectRatioClassBanner = getAspectRatioClass(bannerConfig.aspectRatio);
            const imageFitClass = getImageFitClass(bannerConfig.imageFit);
            const BannerElement = bannerConfig.linkUrl ? Link : 'div';
            const bannerProps = bannerConfig.linkUrl ? { href: bannerConfig.linkUrl, target: '_blank', rel: 'noopener noreferrer' } : {};

            content = (
                <BannerElement
                    {...bannerProps}
                    className={cn(
                        "relative block w-full rounded overflow-hidden bg-muted",
                        aspectRatioClassBanner || 'h-40',
                        !bannerConfig.imageUrl && 'flex items-center justify-center'
                    )}
                    data-ai-hint="website banner placeholder"
                     {...(bannerConfig.linkUrl ? { passHref: true } : {})} // Needed for Link wrapping custom component/div
                >
                     {/* Conditional rendering for anchor tag if it's not a Link */}
                    {BannerElement === 'div' && bannerConfig.linkUrl ? (
                        <a href={bannerConfig.linkUrl} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-10" aria-label={bannerConfig.altText || 'Banner link'}></a>
                    ) : null}

                    {bannerConfig.imageUrl ? (
                        <Image
                            key={bannerConfig.imageUrl}
                            src={bannerConfig.imageUrl}
                            alt={bannerConfig.altText || 'Banner image'}
                            fill
                            className={cn("transition-opacity duration-300", imageFitClass)}
                            data-ai-hint="corporate banner sale"
                            priority={index < 2} // Prioritize loading first few images
                            sizes="(max-width: 768px) 100vw, 33vw"
                            onError={(e) => { console.error("Banner image failed:", bannerConfig.imageUrl); e.currentTarget.style.opacity = '0'; (e.currentTarget.nextElementSibling as HTMLElement)?.classList.remove('hidden'); }}
                            onLoad={(e) => { e.currentTarget.style.opacity = '1'; (e.currentTarget.nextElementSibling as HTMLElement)?.classList.add('hidden'); }}
                        />
                    ) : null}
                     <div className={cn(
                         "banner-placeholder absolute inset-0 flex flex-col items-center justify-center text-muted-foreground text-xs bg-muted/80 p-2 text-center pointer-events-none", // Make placeholder non-interactive
                         bannerConfig.imageUrl ? "hidden" : ""
                     )}>
                        <ImageIcon className="w-10 h-10 mb-1 opacity-50" />
                        <span>Banner</span>
                        {!bannerConfig.imageUrl && <span className="text-[10px] mt-0.5">No Image URL</span>}
                    </div>
                </BannerElement>
            );
            break;
        case 'grid':
             const gridConfig = safeConfig<GridConfig>(widgetDefaultValuesMap.grid);
             const gridColsClass = getGridColsClass(gridConfig.columns);
             const gapClass = getGapClass(gridConfig.gap);
             const itemAspectRatioClass = getAspectRatioClass(gridConfig.itemAspectRatio) || 'aspect-square';
             const numPlaceholders = parseInt(gridConfig.columns || '2') * 2; // Show 2 rows

            content = (
                 // Check if dataSource has a value to decide whether to show placeholder
                 gridConfig.dataSource ? (
                     <div className={cn("p-2 bg-muted/30 rounded border border-dashed border-input")} data-ai-hint="product grid display">
                         <div className={cn(`grid ${gridColsClass} ${gapClass}`)}>
                             {[...Array(numPlaceholders)].map((_, i) => (
                                 <div key={i} className={cn("bg-muted rounded animate-pulse flex flex-col items-center justify-center overflow-hidden p-2", itemAspectRatioClass)}>
                                      <ImageIcon size={24} className="text-muted-foreground/50 mb-1"/>
                                      <div className="h-2 w-10/12 bg-muted-foreground/20 rounded-full mt-1.5"></div>
                                      <div className="h-2 w-8/12 bg-muted-foreground/10 rounded-full mt-1"></div>
                                 </div>
                             ))}
                         </div>
                         <span className="text-xs text-muted-foreground block text-center pt-2">Grid ({gridConfig.columns} cols) - Loading...</span>
                     </div>
                 ) : (
                     renderPlaceholder(LayoutGrid, "Product Grid", `Configure Data Source`, "product grid setup")
                 )
             );
             break;
         case 'list':
             const listConfig = safeConfig<ListConfig>(widgetDefaultValuesMap.list);
             const itemLayout = listConfig.itemLayout || 'simple';
             const showDividers = listConfig.showDividers ?? true;
             const imgSizeClass = getImageSizeClass(listConfig.imageSize);

             content = (
                  // Check if dataSource has a value
                 listConfig.dataSource ? (
                     <div className={cn("p-2 bg-muted/30 rounded border border-dashed border-input")} data-ai-hint="ordered item list">
                          <div className="space-y-2">
                             {[...Array(3)].map((_, i) => (
                                <div
                                     key={i}
                                     className={cn(
                                         "bg-muted rounded animate-pulse flex items-center p-2 space-x-3",
                                          itemLayout === 'image-right' ? 'flex-row-reverse space-x-reverse' : 'flex-row',
                                         showDividers && i < 2 ? 'border-b border-border pb-2 mb-2' : ''
                                     )}
                                 >
                                     {(itemLayout === 'image-left' || itemLayout === 'image-right') &&
                                         <div className={cn("bg-muted-foreground/20 rounded flex-shrink-0", imgSizeClass)}></div>
                                     }
                                     <div className="flex-1 space-y-1.5">
                                          <div className={cn("h-2.5 bg-muted-foreground/20 rounded-full", itemLayout === 'simple' ? 'w-5/6' : 'w-full')}></div>
                                          {itemLayout !== 'simple' && <div className="h-2 bg-muted-foreground/10 rounded-full w-2/3"></div>}
                                     </div>
                                 </div>
                             ))}
                          </div>
                         <span className="text-xs text-muted-foreground block text-center pt-2">List ({itemLayout}) - Loading...</span>
                     </div>
                  ) : (
                     renderPlaceholder(Rows, "Item List", `Configure Data Source`, "item list setup")
                  )
             );
             break;
        case 'form':
            const formConfig = safeConfig<FormConfig>(widgetDefaultValuesMap.form);
            content = (
                <div className={cn("space-y-3 p-3 border border-dashed rounded border-input bg-card shadow-sm")}>
                    <div className="space-y-1 animate-pulse">
                        <div className="h-3 bg-muted rounded w-1/4"></div>
                        <div className="h-8 bg-muted rounded w-full"></div>
                    </div>
                     <div className="space-y-1 animate-pulse">
                        <div className="h-3 bg-muted rounded w-1/3"></div>
                        <div className="h-16 bg-muted rounded w-full"></div>
                    </div>
                     <div className="flex justify-end pt-2">
                         <UiButton variant="default" size="sm" disabled className="animate-pulse">
                            {formConfig.submitButtonText || 'Submit'}
                         </UiButton>
                    </div>
                    <span className="text-xs text-muted-foreground block text-center pt-1">Form Placeholder</span>
                </div>
            );
            break;
        case 'text':
            const textConfig = safeConfig<TextConfig>(widgetDefaultValuesMap.text);
            const textAlignClass = getAlignmentClass(textConfig.alignment);
            const textSizeClass = getFontSizeClass(textConfig.fontSize);
            const textColorClass = getTextColorClass(textConfig.textColor);
            const fontWeightClass = textConfig.isBold ? 'font-bold' : 'font-normal';
            const fontStyleClass = textConfig.isItalic ? 'italic' : 'not-italic';
            content = (
                <div className={cn("p-1 min-h-[2rem] w-full", textAlignClass.split(' ')[0])}>
                    <p className={cn(
                        textSizeClass,
                        textColorClass,
                        fontWeightClass,
                        fontStyleClass,
                        'break-words'
                    )}>
                        {textConfig.content || "Enter text..."}
                    </p>
                </div>
            );
            break;
         case 'button':
            const buttonConfig = safeConfig<ButtonConfig>(widgetDefaultValuesMap.button);
            const btnAlignClass = getButtonAlignmentClass(buttonConfig.alignment);
            const btnSizeClass = getButtonSizeClass(buttonConfig.size);
            const ButtonElement = buttonConfig.linkUrl ? Link : 'div'; // Use Link if linkUrl exists
            const buttonProps = buttonConfig.linkUrl ? { href: buttonConfig.linkUrl, passHref: true } : {};

            content = (
                <div className={cn("flex w-full py-1", btnAlignClass)}>
                    <ButtonElement {...buttonProps}>
                         {/* Use asChild if ButtonElement is Link */}
                        <UiButton
                            variant={buttonConfig.variant || 'default'}
                            size={buttonConfig.size || 'default'}
                             className={cn({'w-full': buttonConfig.alignment === 'full'})}
                            {...(buttonConfig.size === 'icon' ? { 'aria-label': buttonConfig.buttonText || 'Icon button' } : {})}
                             asChild={ButtonElement === Link} // Critical: Use asChild for Link wrapper
                        >
                             {/* Render content inside UiButton */}
                             {/* Wrap fragment child in a span for Link */}
                             <span>
                                {buttonConfig.size === 'icon' ? <ImageIcon className="h-4 w-4"/> : (buttonConfig.buttonText || "Button")}
                             </span>
                        </UiButton>
                    </ButtonElement>
                </div>
            );
            break;
        case 'spacer':
            const spacerConfig = safeConfig<SpacerConfig>(widgetDefaultValuesMap.spacer);
            const height = spacerConfig.height || 4;
            const heightClass = `h-${height}`;

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
            const mapConfig = safeConfig<MapConfig>(widgetDefaultValuesMap.map);
            const getMapStyleBg = (style: string | undefined) => { /* ... */ return 'bg-blue-200 dark:bg-blue-900'; } // Simplified for brevity
            content = (
                <div className={cn("relative h-48 bg-muted rounded border border-dashed border-input overflow-hidden", getMapStyleBg(mapConfig.mapStyle))}>
                   {isClient ? (
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
             const videoConfig = safeConfig<VideoConfig>(widgetDefaultValuesMap.video);
             const aspectRatioClassVideo = getAspectRatioClass(videoConfig.aspectRatio);
             content = (
                 <div className={cn("relative bg-black rounded border border-dashed border-input overflow-hidden", aspectRatioClassVideo || 'h-40')}>
                     {isClient ? (
                         videoConfig.videoUrl ? (
                             <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground ">
                                 <VideoIconLucide className="w-12 h-12 mb-2 text-white/80" />
                                 <p className="text-sm font-medium text-white/90">Video Preview</p>
                                 <p className="text-xs px-4 text-center mt-1 text-gray-400 truncate w-full">{videoConfig.videoUrl}</p>
                                 <div className="text-[10px] mt-1 space-x-2">
                                     {videoConfig.autoplay && <span className="text-yellow-500">(Autoplay)</span>}
                                     {videoConfig.showControls === false && <span className="text-gray-500">(Controls Hidden)</span>}
                                 </div>
                             </div>
                         ) : (
                             renderPlaceholder(VideoIconLucide, "Video Player", "Configure Video URL", "video player setup")
                         )
                     ) : (
                         <div className={cn("w-full h-full flex items-center justify-center text-muted-foreground text-xs animate-pulse bg-gray-800")}>
                             Loading Video...
                         </div>
                     )}
                 </div>
             );
             break;
      default:
        content = (
          <div className={cn("p-4 bg-destructive/10 rounded border border-dashed border-destructive text-destructive-foreground text-sm flex flex-col items-center justify-center h-24")}>
            <p className="font-semibold">Unknown Widget</p>
            <p className="text-xs mt-1">{widget.type}</p>
          </div>
        );
    }

    // For header, don't wrap in the full draggable/clickable div, just render content directly
     if (widget.type === 'header') {
         return (
             <div
                key={widget.id}
                id={`widget-${widget.id}`}
                onClick={(e) => handleWidgetClick(e, widget.id)} // Still allow selection
                className={commonWrapperClasses}
                role="button" // Make selectable
                tabIndex={0}
                aria-label={`Widget: ${widget.name || widget.type}. ${isSelected ? 'Selected.' : ''} Click to configure.`}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleWidgetClick(e as any, widget.id)}}
             >
                 {/* Header content */}
                  <div className="widget-content">
                     {content}
                  </div>
                   {/* Overlay and Delete Button for Header */}
                  <div className="absolute inset-0 bg-transparent group-hover:bg-black/10 dark:group-hover:bg-white/5 transition-colors duration-150 pointer-events-none"></div>
                  <UiButton
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 focus-within:opacity-100 group-focus:opacity-100 transition-opacity z-30 rounded-full shadow-md" // Higher z-index for header delete
                    onClick={(e) => { e.stopPropagation(); removeWidget(widget.id); }}
                    aria-label={`Remove ${widget.name || widget.type} widget`}
                    tabIndex={isSelected ? 0 : -1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </UiButton>
             </div>
         );
     }

    // Standard wrapper for all other widgets
    return (
      <div
        key={widget.id}
        id={`widget-${widget.id}`}
        onClick={(e) => handleWidgetClick(e, widget.id)}
        className={commonWrapperClasses}
        role="button"
        tabIndex={0}
        aria-label={`Widget: ${widget.name || widget.type}. ${isSelected ? 'Selected.' : ''} Click to configure, drag handle to reorder.`}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleWidgetClick(e as any, widget.id)}}
        draggable={widget.type !== 'header'} // Only draggable if NOT header
        onDragStart={(e) => handleWidgetDragStart(e, widget.id)}
        onDragOver={(e) => handleWidgetDragOver(e, widget.id)}
        onDragEnter={(e) => handleWidgetDragEnter(e, widget.id)}
        onDragLeave={(e) => handleWidgetDragLeave(e, widget.id)}
         onDrop={(e) => handleWidgetDrop(e, widget.id)} // Added drop handler
        onDragEnd={handleWidgetDragEnd}
      >

        {/* Drop Indicator (Top) - Not for header */}
        {isDropTarget && widget.type !== 'header' && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-accent -mt-1.5 z-20 pointer-events-none"></div>
        )}

        {/* Widget Content */}
        <div className="widget-content flex items-center">
             {/* Drag Handle - Only show if not header */}
             {widget.type !== 'header' && (
                 <div
                    className="widget-drag-handle mr-2 p-1 cursor-grab text-muted-foreground hover:text-foreground touch-none"
                    aria-label={`Drag handle for ${widget.name || widget.type} widget`}
                    // Drag is initiated on the parent, but handle provides visual cue and stops click propagation
                    onClick={(e) => e.stopPropagation()} // Prevent selection when clicking handle
                    onMouseDown={(e) => e.stopPropagation()} // Helps ensure parent drag takes precedence
                >
                    <GripVertical className="h-5 w-5" />
                 </div>
             )}
            {/* Actual widget content */}
            <div className="flex-1">
                {content}
            </div>
        </div>

        {/* Overlay and Delete Button - Not for header (handled above) */}
         {widget.type !== 'header' && (
            <>
                <div className="absolute inset-0 bg-transparent group-hover:bg-black/10 dark:group-hover:bg-white/5 transition-colors duration-150 rounded-lg pointer-events-none"></div>
                <UiButton
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 focus-within:opacity-100 group-focus:opacity-100 transition-opacity z-10 rounded-full shadow-md"
                  onClick={(e) => { e.stopPropagation(); removeWidget(widget.id); }}
                  aria-label={`Remove ${widget.name || widget.type} widget`}
                  tabIndex={isSelected ? 0 : -1}
                >
                  <Trash2 className="h-4 w-4" />
                </UiButton>
            </>
         )}

         {/* Drop Indicator (Bottom) - Alternative to top indicator if needed */}
         {/* {isDropTarget && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent -mb-1.5 z-20 pointer-events-none"></div>
        )} */}

      </div>
    );
  };


  return (
    <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[10px] rounded-[2.5rem] h-[700px] w-[350px] shadow-xl">
      {/* Phone Top Notch */}
      <div className="w-[140px] h-[18px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute z-30"></div> {/* Higher z-index */}
      {/* Phone Side Buttons */}
      <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[13px] top-[124px] rounded-l-lg z-0"></div>
      <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[13px] top-[178px] rounded-l-lg z-0"></div>
      <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[13px] top-[142px] rounded-r-lg z-0"></div>

      {/* Phone Screen */}
      <div
          className="rounded-[2rem] overflow-hidden w-full h-full bg-background relative z-10 flex flex-col" // Use flex-col
          onDragOver={handleContainerDragOver}
          onDragLeave={handleContainerDragLeave}
          onDrop={handleContainerDrop} // Container drop handles both external and internal drops
          id="phone-preview-dropzone-container"
      >
         {/* Header Widget Area (fixed at top if present) */}
          {widgets.find(w => w.type === 'header') && renderWidgetContent(widgets.find(w => w.type === 'header')!, 0)}

        {/* App Content Area (Scrollable below header) */}
        <div
          ref={widgetsContainerRef}
          className={cn(
            'w-full flex-1 p-2 overflow-y-auto scroll-smooth transition-colors duration-200', // flex-1 makes it take remaining space
             // Highlight container only when dragging from panel OR dragging internally without a widget target
             (isDraggingOverContainer || (draggedWidgetId && !dropTargetId))
              ? 'bg-accent/10 ring-2 ring-accent ring-inset'
              : 'bg-white dark:bg-neutral-900'
          )}
          id="phone-preview-widgets-area"
          aria-label="Phone preview area. Drag widgets here to add, or drag existing widgets to reorder."
        >
          {widgets.filter(w => w.type !== 'header').length === 0 && !isDraggingOverContainer && !draggedWidgetId && ( // Check non-header widgets
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-6 pointer-events-none">
              <Smartphone className="w-16 h-16 mb-4 opacity-70" />
              <p className="text-sm font-medium mb-1">App Preview</p>
              <p className="text-xs">
                Drag widgets from the left panel and drop them here. Click a widget to configure it. Drag widgets using the handle to reorder.
              </p>
            </div>
          )}
          {(isDraggingOverContainer || (draggedWidgetId && !dropTargetId)) && widgets.filter(w => w.type !== 'header').length === 0 && ( // Check non-header widgets
             <div className="flex flex-col items-center justify-center h-full text-center text-accent font-medium pointer-events-none">
              <p>Drop widget here</p>
            </div>
          )}

          {/* Render non-header widgets */}
          <div
            className={cn("transition-opacity duration-150", isDraggingOverContainer ? 'opacity-50' : 'opacity-100')}
            aria-live="polite"
            aria-label="App content widgets"
            >
             {widgets.filter(w => w.type !== 'header').map(renderWidgetContent)}
          </div>

          {/* Drop indicator at the bottom when dragging from panel over existing widgets */}
           {(isDraggingOverContainer || (draggedWidgetId && !dropTargetId)) && widgets.filter(w => w.type !== 'header').length > 0 && ( // Check non-header widgets
             <div className="mt-2 p-3 border-2 border-dashed border-accent rounded text-center text-accent font-medium text-sm bg-accent/5 pointer-events-none">
                Drop here to add to end
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Add CSS for drop target hover effect (optional but helpful)
// You can add this to your globals.css or use inline styles if preferred
/*
In globals.css:

.widget-wrapper.drop-target-hover {
  @apply border-accent border-dashed bg-accent/10 ring-2 ring-accent ring-offset-1;
}

.widget-drag-handle {
  touch-action: none; // Prevent scrolling on touch devices when grabbing handle
}

*/


    
