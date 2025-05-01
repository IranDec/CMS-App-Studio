// Designed by Mohammad Babaei (adschi.com)
'use client';

import React, { useState, useEffect, useRef, memo, useCallback } from 'react'; // Import useCallback
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
    Minus, // Divider icon
    Clock, // Countdown icon
    GalleryHorizontalEnd, // Carousel icon
    Volume2, // Audio icon
    Share2, // Social Feed icon
    Camera, // Camera icon
    UploadCloud, // Upload Icon
    Palette, // For Rich Text placeholder
    LocateFixed, // Geolocation icon
    Bell, // Push Notification placeholder
    ChevronLeft, // Carousel arrow
    ChevronRight, // Carousel arrow
} from 'lucide-react';
import { Button as UiButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { DroppedWidget, AllWidgetConfigs, BaseWidgetConfig, HeaderConfig, BannerConfig, GridConfig, ListConfig, FormConfig, TextConfig, ButtonConfig, SpacerConfig, MapConfig, VideoConfig, CarouselConfig, AudioConfig, CountdownConfig, SocialFeedConfig, DividerConfig, AuthState, CarouselItem } from '@/types/widget'; // Import AllWidgetConfigs and others
import { widgetDefaultValuesMap } from '@/lib/widget-defaults';
import { useToast } from '@/hooks/use-toast'; // For geolocation/camera errors

// Placeholder for auth context/state management
const useAuth = (): AuthState => {
  // In a real app, this would come from React Context, Zustand, Redux, etc.
  // For now, simulate logged-out state. Toggle to test conditional display.
  return {
    isAuthenticated: false, // CHANGE THIS TO `true` TO SIMULATE LOGGED IN
    user: null, // Or { id: '123', role: 'admin' }
  };
};


interface PhonePreviewProps {
  widgets: DroppedWidget[];
  setWidgets: React.Dispatch<React.SetStateAction<DroppedWidget[]>>; // Keep for direct deletion/updates
  selectedWidgetId: string | null;
  setSelectedWidgetId: React.Dispatch<React.SetStateAction<string | null>>;
  addWidget: (widget: DroppedWidget) => void; // Function to add a new widget
  moveWidget: (draggedId: string, targetId: string) => void; // Function to reorder widgets
  updateWidgetConfig: (widgetId: string, newConfig: Partial<AllWidgetConfigs>) => void; // To update config (e.g., location)
  currentPreviewUrl: string; // Represents the currently viewed "page" within the preview
  setCurrentPreviewUrl: (url: string) => void; // Function to change the previewed "page"
}


// --- Helper Functions for Dynamic Classes (Keep existing helpers) ---
const getMarginClass = (value: number | undefined, prefix: 'mt' | 'mb'): string => {
    const defaultValue = 2;
    const val = value ?? defaultValue;
    if (val < 0 || val > 20) return `${prefix}-${defaultValue}`;
    return `${prefix}-${val}`;
};
const getAlignmentClass = (alignment: string | undefined): string => {
    switch (alignment) {
        case 'left': return 'text-left justify-start';
        case 'center': return 'text-center justify-center';
        case 'right': return 'text-right justify-end';
        case 'justify': return 'text-justify justify-between';
        default: return 'text-left justify-start';
    }
};
const getFontSizeClass = (size: string | undefined): string => {
    const validSizes = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl'];
    if (size && validSizes.includes(size)) return `text-${size}`;
    return 'text-base';
};
const getTextColorClass = (color: string | undefined): string => {
     switch (color) {
        case 'primary': return 'text-primary';
        case 'secondary': return 'text-secondary-foreground';
        case 'accent': return 'text-accent';
        case 'muted': return 'text-muted-foreground';
        case 'default': default: return 'text-foreground';
     }
};
const getAspectRatioClass = (ratio: string | undefined): string => {
    switch (ratio) {
        case '16/9': return 'aspect-video';
        case '4/3': return 'aspect-[4/3]';
        case '1/1': return 'aspect-square';
        case '9/16': return 'aspect-[9/16]';
        case '21/9': return 'aspect-[21/9]';
        case 'auto': return '';
        default: return 'aspect-video';
    }
};
const getImageFitClass = (fit: string | undefined): string => {
    switch (fit) { case 'contain': return 'object-contain'; case 'cover': default: return 'object-cover'; }
};
const getGridColsClass = (cols: string | undefined): string => {
    const validCols = ['1', '2', '3', '4'];
    if (cols && validCols.includes(cols)) return `grid-cols-${cols}`;
    return 'grid-cols-2';
};
const getGapClass = (gap: number | undefined): string => {
    const defaultValue = 4;
    const val = gap ?? defaultValue;
    if (val < 0 || val > 10) return `gap-${defaultValue}`;
    return `gap-${val}`;
};
const getButtonSizeClass = (size: string | undefined): string => {
    switch (size) {
        case 'sm': return 'h-9 px-3'; case 'lg': return 'h-11 px-8'; case 'icon': return 'h-10 w-10'; case 'default': default: return 'h-10 px-4 py-2';
    }
};
const getButtonAlignmentClass = (alignment: string | undefined): string => {
    switch (alignment) {
        case 'left': return 'justify-start'; case 'center': return 'justify-center'; case 'right': return 'justify-end'; case 'full': return 'justify-center w-full'; default: return 'justify-center';
    }
};
const getImageSizeClass = (size: string | undefined): string => {
    switch(size) { case 'sm': return 'w-10 h-10'; case 'lg': return 'w-20 h-20'; case 'md': default: return 'w-16 h-16'; }
};

// NEW: Animation classes
const getAnimationClass = (animation: string | undefined): string => {
  switch (animation) {
    case 'fadeIn': return 'animate-fade-in'; // Needs definition in globals.css or tailwind.config
    case 'slideInUp': return 'animate-slide-in-up'; // Needs definition
    case 'slideInLeft': return 'animate-slide-in-left'; // Needs definition
    case 'zoomIn': return 'animate-zoom-in'; // Needs definition
    case 'none':
    default: return '';
  }
};

// --- Component-Specific Hooks and State ---

// Simple Carousel Logic Hook (Example) - Call this hook *inside* CarouselWidget
const useCarousel = (itemsCount: number, autoplay: boolean, delay: number) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Use useCallback for stable function references if needed, though likely not critical here
    const nextSlide = useCallback(() => setCurrentIndex((prev) => (prev + 1) % itemsCount), [itemsCount]);
    const prevSlide = useCallback(() => setCurrentIndex((prev) => (prev - 1 + itemsCount) % itemsCount), [itemsCount]);
    const goToSlide = useCallback((index: number) => setCurrentIndex(index), []);


    useEffect(() => {
        if (!autoplay || itemsCount <= 1) return;
        const interval = setInterval(nextSlide, delay);
        return () => clearInterval(interval);
        // Add nextSlide to dependencies if not using useCallback, otherwise it's stable
    }, [autoplay, delay, itemsCount, nextSlide]);

    return { currentIndex, nextSlide, prevSlide, goToSlide };
};

// Countdown Timer Logic Hook - Call this hook *inside* the Countdown widget's render logic
const useCountdown = (targetDateISO: string | undefined) => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        if (!targetDateISO) {
            setIsExpired(true); // Consider target date missing as expired/invalid
            setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            return;
        }

        let targetTime: number;
        try {
            targetTime = new Date(targetDateISO).getTime();
             if (isNaN(targetTime)) {
                 throw new Error("Invalid date");
             }
        } catch (e) {
            console.error("Invalid targetDateISO:", targetDateISO, e);
            setIsExpired(true);
            setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            return;
        }

        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const difference = targetTime - now;

            if (difference <= 0) {
                setIsExpired(true);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return false; // Indicate timer should stop
            } else {
                 setIsExpired(false);
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);
                setTimeLeft({ days, hours, minutes, seconds });
                return true; // Indicate timer should continue
            }
        };

         // Initial calculation
         if (!calculateTimeLeft()) {
             return; // Don't start interval if already expired
         }

        const interval = setInterval(() => {
            if (!calculateTimeLeft()) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [targetDateISO]);

    return { timeLeft, isExpired };
};

// --- NEW: Dedicated Carousel Widget Component ---
interface CarouselWidgetProps {
    config: CarouselConfig;
    handleNavigation: (event: React.MouseEvent, targetUrl: string) => void;
}

const CarouselWidget: React.FC<CarouselWidgetProps> = memo(({ config, handleNavigation }) => {
     // --- Call the hook here ---
     // Only call the hook if there are items to avoid unnecessary state/effects
    const hasItems = config.items && config.items.length > 0;
    // Conditionally call the hook
    const hookData = hasItems
        ? useCarousel(config.items.length, config.autoplay ?? false, config.delay ?? 3000)
        : null; // Or provide a default state object if needed when no items

    // Safely destructure hookData only if it exists
    const { currentIndex, nextSlide, prevSlide, goToSlide } = hookData ?? {
        currentIndex: 0,
        nextSlide: () => {},
        prevSlide: () => {},
        goToSlide: () => {},
    }; // Default object when no items or hook is null

    const { items, showArrows = true, showDots = true, aspectRatio } = config;
    const aspectRatioClassCarousel = getAspectRatioClass(aspectRatio);

    if (!items || items.length === 0) {
        return (
            <div
                className={cn("relative w-full rounded overflow-hidden bg-muted flex items-center justify-center min-h-[8rem] h-auto border border-dashed border-input p-4")}
                data-ai-hint="carousel placeholder"
            >
                <div className="flex flex-col items-center justify-center text-muted-foreground text-xs text-center">
                    {React.createElement(GalleryHorizontalEnd, { className: "w-8 h-8 mb-2 opacity-50" })}
                    <span className="font-medium">Image Carousel</span>
                    <span className="text-[10px] mt-1">Add items in configuration</span>
                    <span className="text-[10px] mt-2 italic">Configure in panel</span>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("relative w-full overflow-hidden rounded bg-muted", aspectRatioClassCarousel || 'h-48')}>
            {/* Slides */}
            <div className="relative h-full w-full">
                {items.map((item, index) => (
                    <div
                        key={item.id}
                        className={cn(
                            "absolute inset-0 transition-opacity duration-700 ease-in-out",
                            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        )}
                    >
                        {item.imageUrl ? (
                             <Image
                                src={item.imageUrl}
                                alt={item.altText || `Slide ${index + 1}`}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 33vw"
                                priority={index < 2}
                                onError={(e) => { console.error("Carousel image failed:", item.imageUrl); e.currentTarget.style.opacity = '0'; /* Optionally show placeholder */ }}
                                onLoad={(e) => { e.currentTarget.style.opacity = '1'; }}
                            />
                         ) : (
                             <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground">No Image</div>
                         )}
                        {/* Optional Link Overlay */}
                        {item.linkUrl && (
                            <a onClick={(e) => handleNavigation(e, item.linkUrl!)} className="absolute inset-0 cursor-pointer" aria-label={item.altText || 'Carousel link'}></a>
                        )}
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            {(showArrows && items.length > 1) && (
                <>
                    <UiButton variant="secondary" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full opacity-70 hover:opacity-100" onClick={prevSlide}> <ChevronLeft className="h-5 w-5" /> </UiButton>
                    <UiButton variant="secondary" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full opacity-70 hover:opacity-100" onClick={nextSlide}> <ChevronRight className="h-5 w-5" /> </UiButton>
                </>
            )}

            {/* Dots Indicator */}
            {(showDots && items.length > 1) && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
                    {items.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={cn(
                                "h-2 w-2 rounded-full transition-colors",
                                index === currentIndex ? 'bg-primary' : 'bg-white/50 hover:bg-white/80'
                            )}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
});
CarouselWidget.displayName = 'CarouselWidget';


// --- Phone Preview Component ---

export function PhonePreview({
  widgets,
  setWidgets, // Keep for delete action
  selectedWidgetId,
  setSelectedWidgetId,
  addWidget,
  moveWidget,
  updateWidgetConfig, // Added prop
  currentPreviewUrl, // Added prop
  setCurrentPreviewUrl, // Added prop
}: PhonePreviewProps) {
  const [isDraggingOverContainer, setIsDraggingOverContainer] = useState(false); // For overall drop zone
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null); // ID of the widget being dragged internally
  const [dropTargetId, setDropTargetId] = useState<string | null>(null); // ID of the widget being hovered over for dropping
  const [isClient, setIsClient] = useState(false);
  const widgetsContainerRef = useRef<HTMLDivElement>(null); // Ref for the widgets container
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for the hidden file input
  const [widgetIdForUpload, setWidgetIdForUpload] = useState<string | null>(null); // Track which widget triggers upload
  const { toast } = useToast();
  const authState = useAuth(); // Get current auth state

  useEffect(() => {
    setIsClient(true);
     // Add listener for messages from iframes (e.g., embedded social feeds)
    // window.addEventListener('message', handleIframeMessage);
    // return () => window.removeEventListener('message', handleIframeMessage);
  }, []);

 // const handleIframeMessage = (event: MessageEvent) => {
    // // Basic security check: ensure the message is from an expected origin
    // const allowedOrigins = ["https://twitframe.com", "https://instagram.com", /* ... others */];
    // if (!allowedOrigins.includes(event.origin)) {
    //     console.warn("Message received from disallowed origin:", event.origin);
    //     return;
    // }
    // console.log("Message from iframe:", event.data);
    // // Handle iframe messages here (e.g., resize requests, errors)
 // };


  // --- Local Storage Sync --- Moved to page.tsx to avoid hydration issues here
  // useEffect(() => {
  //   // Load widgets from local storage on initial mount
  //   if (typeof window !== 'undefined') {
  //     const savedWidgets = localStorage.getItem('cmsAppStudioWidgets');
  //     if (savedWidgets) {
  //       try {
  //         const parsedWidgets = JSON.parse(savedWidgets);
  //         if (Array.isArray(parsedWidgets)) {
  //           setWidgets(parsedWidgets);
  //         }
  //       } catch (e) {
  //         console.error("Failed to parse widgets from local storage:", e);
  //       }
  //     }
  //      // Load last viewed URL
  //      const savedUrl = localStorage.getItem('cmsAppStudioPreviewUrl');
  //      if (savedUrl) {
  //          setCurrentPreviewUrl(savedUrl);
  //      }

  //   }
  // }, [setWidgets, setCurrentPreviewUrl]);

  // useEffect(() => {
  //   // Save widgets to local storage whenever they change
  //   if (typeof window !== 'undefined') {
  //     localStorage.setItem('cmsAppStudioWidgets', JSON.stringify(widgets));
  //      // Save current preview URL
  //      localStorage.setItem('cmsAppStudioPreviewUrl', currentPreviewUrl);
  //   }
  // }, [widgets, currentPreviewUrl]);


  // --- Drag and Drop Handlers (Keep existing logic) ---
  const handleContainerDragOver = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (event.dataTransfer.types.includes('widgettype')) {
          setIsDraggingOverContainer(true);
          setDraggedWidgetId(null); setDropTargetId(null);
      } else if (draggedWidgetId) {
          if (!dropTargetId) { setIsDraggingOverContainer(true); } else { setIsDraggingOverContainer(false); }
      }
   };
  const handleContainerDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node)) {
         setIsDraggingOverContainer(false);
      }
  };
  const handleContainerDrop = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDraggingOverContainer(false);

      const widgetType = event.dataTransfer.getData('widgetType');
      const widgetName = event.dataTransfer.getData('widgetName');
      const droppedId = event.dataTransfer.getData('widgetIdInternal');

      if (widgetType && !droppedId) { // Dropped from panel
        console.log('Dropped from panel:', widgetType, 'Name:', widgetName);
        const defaultConfig = widgetDefaultValuesMap[widgetType as keyof typeof widgetDefaultValuesMap] || {};
        const newWidget: DroppedWidget = {
          id: `${widgetType}-${Date.now()}-${Math.random().toString(16).slice(2)}`, // Ensure unique ID
          type: widgetType,
          name: widgetName || widgetType.charAt(0).toUpperCase() + widgetType.slice(1),
          config: { ...defaultConfig } as AllWidgetConfigs,
        };

          if (widgetType === 'header') {
               const headerExists = widgets.some(w => w.type === 'header');
               if (headerExists) { toast({title: "Action Denied", description: "Only one Header widget is allowed.", variant: "destructive"}); return; }
               setWidgets(prev => [newWidget, ...prev.filter(w => w.type !== 'header')]); // Replace existing header if somehow present
               setSelectedWidgetId(newWidget.id);
          } else {
              // Drop into specific position or at the end
              const targetId = dropTargetId || null; // Use the ID of the element being hovered over
              const nonHeaderWidgets = widgets.filter(w => w.type !== 'header');
              const targetIndex = nonHeaderWidgets.findIndex(w => w.id === targetId);
              const header = widgets.find(w => w.type === 'header');
              const newWidgets = header ? [header] : [];

              if (targetId && targetIndex !== -1) {
                  // Insert before the target
                   const before = nonHeaderWidgets.slice(0, targetIndex);
                   const after = nonHeaderWidgets.slice(targetIndex);
                   newWidgets.push(...before, newWidget, ...after);
                   setWidgets(newWidgets);
              } else {
                   // Append to the end
                   newWidgets.push(...nonHeaderWidgets, newWidget);
                   setWidgets(newWidgets);
              }
               setSelectedWidgetId(newWidget.id);
               setCurrentPreviewUrl('/'); // Navigate home after adding
          }
          setDropTargetId(null);
          setDraggedWidgetId(null);
          document.querySelectorAll('.widget-wrapper.drop-target-hover').forEach(el => el.classList.remove('drop-target-hover'));
          return;
      }

      if (draggedWidgetId && dropTargetId) { // Reordering existing widgets
           const draggedWidget = widgets.find(w => w.id === draggedWidgetId);
           if (draggedWidget?.type === 'header') { console.log("Header cannot be moved via drag"); }
           else { moveWidget(draggedWidgetId, dropTargetId); }
      } else if (draggedWidgetId && isDraggingOverContainer) { // Dragged to container end
           const nonHeaderWidgets = widgets.filter(w => w.type !== 'header');
           if (nonHeaderWidgets.length > 0) {
              const lastWidgetId = nonHeaderWidgets[nonHeaderWidgets.length - 1].id;
              const draggedWidget = widgets.find(w => w.id === draggedWidgetId);
              if (draggedWidget?.type === 'header') { console.log("Header cannot be moved via drag"); }
              else if (draggedWidgetId !== lastWidgetId) { moveWidget(draggedWidgetId, lastWidgetId); }
           }
      }
      setDraggedWidgetId(null);
      setDropTargetId(null);
      document.querySelectorAll('.widget-wrapper.drop-target-hover').forEach(el => el.classList.remove('drop-target-hover'));
   };

  const handleWidgetDragStart = (event: React.DragEvent<HTMLDivElement>, widgetId: string) => {
       const widget = widgets.find(w => w.id === widgetId);
       if (widget?.type === 'header') { event.preventDefault(); return; }
       // Allow drag only if grabbing the handle
       if (!(event.target as HTMLElement).closest('.widget-drag-handle')) {
           // Maybe show a tooltip "Use drag handle to move"
           event.preventDefault();
           return;
        }
      console.log(`Internal drag start: ${widgetId}`);
      event.dataTransfer.setData('widgetIdInternal', widgetId);
      event.dataTransfer.effectAllowed = 'move';
      setDraggedWidgetId(widgetId);
      // event.currentTarget.style.opacity = '0.5'; // Opacity managed by state/CSS now
   };
  const handleWidgetDragOver = (event: React.DragEvent<HTMLDivElement>, targetWidgetId: string) => {
      event.preventDefault(); event.stopPropagation(); // Necessary to allow drop
      const targetWidget = widgets.find(w => w.id === targetWidgetId);
      if (targetWidget?.type === 'header') { setDropTargetId(null); /* Remove class below */ return; }
      if (draggedWidgetId && draggedWidgetId !== targetWidgetId) {
         setDropTargetId(targetWidgetId);
         setIsDraggingOverContainer(false);
         // document.querySelectorAll('.widget-wrapper.drop-target-hover').forEach(el => el.classList.remove('drop-target-hover'));
         // event.currentTarget.classList.add('drop-target-hover'); // Handled by state now
      } else {
          setDropTargetId(null); // Hovering over itself
      }
   };
   const handleWidgetDragEnter = (event: React.DragEvent<HTMLDivElement>, targetWidgetId: string) => {
       event.preventDefault(); event.stopPropagation();
       const targetWidget = widgets.find(w => w.id === targetWidgetId);
       if (targetWidget?.type === 'header') { return; }
       if (draggedWidgetId && draggedWidgetId !== targetWidgetId) {
            setDropTargetId(targetWidgetId);
            setIsDraggingOverContainer(false);
            // event.currentTarget.classList.add('drop-target-hover'); // Handled by state now
        }
    };
  const handleWidgetDragLeave = (event: React.DragEvent<HTMLDivElement>, targetWidgetId: string) => {
       event.stopPropagation();
       // Check if the mouse is truly leaving the element or just moving over a child
       if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            if (dropTargetId === targetWidgetId) { setDropTargetId(null); }
            // event.currentTarget.classList.remove('drop-target-hover'); // Handled by state now
        }
   };
   const handleWidgetDrop = (event: React.DragEvent<HTMLDivElement>, targetWidgetId: string) => {
       event.preventDefault(); event.stopPropagation();
       const targetWidget = widgets.find(w => w.id === targetWidgetId);
       if (targetWidget?.type === 'header') { handleContainerDrop(event); return; } // Drop on header acts like container drop
       if (draggedWidgetId && draggedWidgetId !== targetWidgetId) { moveWidget(draggedWidgetId, targetWidgetId); }
       else { handleContainerDrop(event); } // Also handle drops from panel onto a widget
       // Cleanup is now handled in handleContainerDrop
    };
  const handleWidgetDragEnd = (event: React.DragEvent<HTMLDivElement>) => {
      console.log("Internal drag end");
      // event.currentTarget.style.opacity = '1'; // Handled by state/CSS
      // document.querySelectorAll('.widget-wrapper.drop-target-hover').forEach(el => el.classList.remove('drop-target-hover')); // Handled by state/CSS
      setDraggedWidgetId(null); setDropTargetId(null); setIsDraggingOverContainer(false);
   };


  // --- Other Handlers ---
  const handleWidgetClick = ( event: React.MouseEvent<HTMLDivElement>, widgetId: string ) => {
      // Prevent selection if clicking delete button or drag handle
      if ((event.target as HTMLElement).closest('button[aria-label^="Remove"]') || (event.target as HTMLElement).closest('.widget-drag-handle')) {
          return;
      }
      setSelectedWidgetId(widgetId);
      console.log("Selected widget:", widgetId);
  };
  const removeWidget = (idToRemove: string) => {
      if (selectedWidgetId === idToRemove) { setSelectedWidgetId(null); }
      setWidgets((prevWidgets) => prevWidgets.filter((widget) => widget.id !== idToRemove));
      console.log("Removed widget:", idToRemove);
  };

  // --- NEW: Navigation Handler ---
  const handleNavigation = (event: React.MouseEvent, targetUrl: string) => {
    event.preventDefault(); // Prevent default link behavior
    event.stopPropagation(); // Prevent widget selection
    console.log(`Navigating preview to: ${targetUrl}`);
    setCurrentPreviewUrl(targetUrl);
  };

   // --- NEW: Image Upload Handler ---
   const handleImageUploadClick = (event: React.MouseEvent, widgetId: string) => {
       event.stopPropagation(); // Prevent widget selection
       setWidgetIdForUpload(widgetId);
       fileInputRef.current?.click(); // Trigger hidden file input
   };

   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
       if (!widgetIdForUpload || !event.target.files || event.target.files.length === 0) {
           return;
       }
       const file = event.target.files[0];
       // Basic type check
       if (!file.type.startsWith('image/')) {
           toast({ variant: 'destructive', title: 'Upload Failed', description: 'Please select an image file.' });
           return;
       }

       const reader = new FileReader();
       reader.onloadend = () => {
           const dataUrl = reader.result as string;
           // Find the widget and update its imageUrl config
           const widgetToUpdate = widgets.find(w => w.id === widgetIdForUpload);
           if (widgetToUpdate && (widgetToUpdate.type === 'banner' || widgetToUpdate.type === 'carousel')) { // Add other types if needed
              if (widgetToUpdate.type === 'banner') {
                   updateWidgetConfig(widgetIdForUpload, { imageUrl: dataUrl });
              }
              // TODO: Handle image upload for Carousel items (requires identifying which item)
              toast({ title: 'Image Uploaded', description: `Updated image for ${widgetToUpdate.name}.` });
           } else {
                toast({ variant: 'destructive', title: 'Upload Error', description: 'Could not apply image to the selected widget.' });
           }
           setWidgetIdForUpload(null); // Reset tracker
           if (event.target) event.target.value = ''; // Reset file input safely
       };
       reader.onerror = () => {
           toast({ variant: 'destructive', title: 'Upload Error', description: 'Failed to read the image file.' });
           setWidgetIdForUpload(null);
           if (event.target) event.target.value = '';
       };
       reader.readAsDataURL(file);
   };

   // --- NEW: Geolocation Handler ---
    const handleGetCurrentLocation = async (widgetId: string) => {
        if (typeof window === 'undefined' || !navigator.geolocation) {
            toast({ variant: 'destructive', title: 'Geolocation Error', description: 'Geolocation is not supported by your browser.' });
            return;
        }

        toast({ title: 'Fetching Location...', description: 'Please wait.' });

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                // Attempt to reverse geocode (requires Google Maps API key or another service)
                 // For now, just display coordinates
                 const address = `Coords: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
                 console.log(`Got location for ${widgetId}:`, latitude, longitude);
                updateWidgetConfig(widgetId, { address: address, useCurrentLocation: false }); // Update address and reset flag
                 toast({ title: 'Location Found', description: `Map address updated to coordinates.` });

                // Example using a hypothetical geocoding service (replace with actual implementation)
                /*
                fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=YOUR_API_KEY`)
                  .then(response => response.json())
                  .then(data => {
                    if (data.results && data.results[0]) {
                      const formattedAddress = data.results[0].formatted_address;
                      updateWidgetConfig(widgetId, { address: formattedAddress, useCurrentLocation: false });
                      toast({ title: 'Location Found', description: `Map address updated.` });
                    } else {
                      throw new Error('No address found for coordinates.');
                    }
                  })
                  .catch(error => {
                    console.error("Geocoding error:", error);
                    updateWidgetConfig(widgetId, { address: `Coords: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`, useCurrentLocation: false }); // Fallback to coords
                    toast({ variant: 'destructive', title: 'Geocoding Error', description: 'Could not find address. Displaying coordinates.' });
                  });
                */
            },
            (error) => {
                 console.error("Geolocation error:", error);
                 updateWidgetConfig(widgetId, { useCurrentLocation: false }); // Reset flag on error
                 let message = 'Could not get your location.';
                 if (error.code === error.PERMISSION_DENIED) {
                     message = 'Geolocation permission denied. Please enable it in your browser settings.';
                 } else if (error.code === error.POSITION_UNAVAILABLE) {
                     message = 'Location information is unavailable.';
                 } else if (error.code === error.TIMEOUT) {
                     message = 'The request to get user location timed out.';
                 }
                toast({ variant: 'destructive', title: 'Geolocation Error', description: message });
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // Options
        );
    };


  // --- Render Widget Content ---
  const renderWidgetContent = (widget: DroppedWidget, index: number) => {
    let content;
    const isSelected = widget.id === selectedWidgetId;
    const isBeingDragged = widget.id === draggedWidgetId;
    const isDropTarget = widget.id === dropTargetId && !isBeingDragged;

     // --- NEW: Conditional Display Check ---
    const shouldDisplay = () => {
        const condition = widget.config?.displayCondition || 'always';
        if (condition === 'always') return true;
        if (condition === 'loggedIn' && authState.isAuthenticated) return true;
        if (condition === 'loggedOut' && !authState.isAuthenticated) return true;
        return false; // Don't display if conditions not met
    };

    // --- Conditional Rendering based on client-side mount and display condition ---
     if (!isClient) {
         // Render nothing or a basic placeholder on the server
         return <div key={widget.id} className="h-10 animate-pulse bg-muted rounded mb-1"></div>; // Simple SSR placeholder
     }

     if (!shouldDisplay()) {
        // Render hidden placeholder on client during edit mode
         return (
            <div
                key={widget.id}
                id={`widget-${widget.id}`}
                onClick={(e) => handleWidgetClick(e, widget.id)} // Still allow selection
                className={cn(
                    "relative group border-2 p-2 rounded-lg transition-all duration-150 ease-in-out",
                    "border-dashed border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400",
                     isSelected ? 'ring-2 ring-primary ring-offset-1 z-10' : 'hover:border-accent',
                     "mb-1" // Basic margin
                )}
                 role="button" tabIndex={0} aria-label={`Widget: ${widget.name || widget.type}. Hidden (${widget.config.displayCondition}). Click to configure.`}
                 onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleWidgetClick(e as any, widget.id)}}
             >
                <p className="text-xs italic text-center">
                    Widget "{widget.name || widget.type}" is hidden (Condition: {widget.config.displayCondition})
                </p>
                {/* Keep delete button accessible */}
                <UiButton variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-50 group-hover:opacity-100 z-10 rounded-full shadow-md" onClick={(e) => { e.stopPropagation(); removeWidget(widget.id); }} aria-label={`Remove ${widget.name || widget.type} widget`} tabIndex={isSelected ? 0 : -1}>
                    <Trash2 className="h-3 w-3" />
                </UiButton>
            </div>
        );
     }

    const config: AllWidgetConfigs & BaseWidgetConfig = {
      ...(widgetDefaultValuesMap[widget.type as keyof typeof widgetDefaultValuesMap] as any), // Apply defaults first
      ...(widget.config || {}), // Override with specific instance config
    };

    // Apply base config styles
    const applyMargins = widget.type !== 'header';
    const marginTopClass = applyMargins ? getMarginClass(config.marginTop, 'mt') : '';
    const marginBottomClass = applyMargins ? getMarginClass(config.marginBottom, 'mb') : '';
    const animationClass = getAnimationClass(config.animation);
    const customClasses = config.customCssClasses || '';


    const commonWrapperClasses = cn(
      "relative group border-2 p-1 rounded-lg transition-all duration-150 ease-in-out",
      "widget-wrapper",
       widget.type !== 'header' && 'mb-1',
       marginTopClass,
       marginBottomClass,
       animationClass, // Add animation class
       customClasses, // Add custom CSS classes
       isSelected ? 'border-primary bg-primary/10 shadow-md ring-2 ring-primary ring-offset-1 z-10'
                 : 'border-transparent hover:border-accent hover:bg-accent/5',
      isBeingDragged ? 'opacity-50 cursor-grabbing' : (widget.type !== 'header' ? 'cursor-pointer' : 'cursor-default'),
      isDropTarget ? 'border-accent border-dashed bg-accent/10 ring-2 ring-accent ring-offset-1' : '',
      widget.type === 'header' && 'sticky top-0 bg-background z-20 rounded-b-none border-b',
    );

     const renderPlaceholder = (icon: React.ElementType, name: string, details?: string, hint?: string) => (
        <div
            className={cn("relative w-full rounded overflow-hidden bg-muted flex items-center justify-center min-h-[8rem] h-auto border border-dashed border-input p-4")}
             data-ai-hint={hint || `${name} placeholder`}
        >
            <div className="flex flex-col items-center justify-center text-muted-foreground text-xs text-center">
                {React.createElement(icon, { className: "w-8 h-8 mb-2 opacity-50" })}
                <span className="font-medium">{name}</span>
                 {details && <span className="text-[10px] mt-1">{details}</span>}
                 <span className="text-[10px] mt-2 italic">Configure in panel</span>
            </div>
        </div>
    );

     // Get config safely with defaults (already done above with merging)
     // const safeConfig = <T extends AllWidgetConfigs>(defaultConf: Partial<T>): T => ({ ...defaultConf, ...(widget.config || {}) }) as T;

    switch (widget.type) {
         case 'header':
             const headerConfig = config as HeaderConfig; // Type assertion
             content = (
                 <div className="flex items-center justify-between h-12 px-3 bg-card text-card-foreground shadow-sm w-full">
                     <div className="flex items-center gap-1">
                         {headerConfig.showBackButton && (
                             <UiButton variant="ghost" size="icon" className="h-8 w-8 text-foreground" onClick={(e) => handleNavigation(e, '/previous-page')}>
                                 <ArrowLeft className="h-5 w-5" />
                             </UiButton>
                         )}
                         {headerConfig.showMenuButton && (
                             <UiButton variant="ghost" size="icon" className="h-8 w-8 text-foreground" onClick={(e) => handleNavigation(e, '/menu')}>
                                <Menu className="h-5 w-5" />
                             </UiButton>
                         )}
                     </div>
                     <h1 className="text-lg font-semibold text-center flex-1 truncate px-2">
                         {headerConfig.title || 'App Name'}
                     </h1>
                     <div className="flex items-center gap-1">
                         {headerConfig.showCartIcon && (
                             <Link href="/cart" passHref legacyBehavior>
                                 <UiButton variant="ghost" size="icon" className="h-8 w-8 text-foreground relative" asChild>
                                     {/* Remove Fragment, directly use the icon and span */}
                                     <a onClick={(e) => handleNavigation(e, '/cart')}> {/* Added onClick for consistency */}
                                         <ShoppingCart className="h-5 w-5" />
                                         {/* Basic badge simulation */}
                                         <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-card bg-red-500" />
                                     </a>
                                 </UiButton>
                             </Link>
                         )}
                          {headerConfig.showAuthButton && (
                             <UiButton variant="ghost" size="sm" className="h-8 px-2 text-sm text-foreground" onClick={(e) => handleNavigation(e, '/auth')}>
                                <User className="h-4 w-4 mr-1" />
                                {authState.isAuthenticated ? (authState.user?.role || 'User') : (headerConfig.authButtonText || 'Login')}
                            </UiButton>
                         )}
                     </div>
                 </div>
             );
             break;

        case 'banner':
            const bannerConfig = config as BannerConfig;
            const aspectRatioClassBanner = getAspectRatioClass(bannerConfig.aspectRatio);
            const imageFitClass = getImageFitClass(bannerConfig.imageFit);
            const BannerElement = bannerConfig.linkUrl ? 'a' : 'div'; // Use anchor for navigation
            const bannerProps = bannerConfig.linkUrl ? { href: bannerConfig.linkUrl, onClick: (e: React.MouseEvent) => handleNavigation(e, bannerConfig.linkUrl!) } : {};

            content = (
                <div className="relative">
                 <BannerElement
                    {...bannerProps}
                    className={cn(
                        "relative block w-full rounded overflow-hidden bg-muted group/banner", // Add group for upload button
                        aspectRatioClassBanner || 'h-40',
                        !bannerConfig.imageUrl && 'flex items-center justify-center',
                        bannerConfig.linkUrl && 'cursor-pointer'
                    )}
                    data-ai-hint="website banner placeholder"
                 >
                    {bannerConfig.imageUrl ? (
                        <Image
                            key={bannerConfig.imageUrl} // Re-render if URL changes
                            src={bannerConfig.imageUrl}
                            alt={bannerConfig.altText || 'Banner image'}
                            fill
                            className={cn("transition-opacity duration-300", imageFitClass)}
                            data-ai-hint="corporate banner sale"
                            priority={index < 2}
                            sizes="(max-width: 768px) 100vw, 33vw"
                            onError={(e) => { console.error("Banner image failed:", bannerConfig.imageUrl); e.currentTarget.style.opacity = '0'; (e.currentTarget.nextElementSibling as HTMLElement)?.classList.remove('hidden'); }}
                            onLoad={(e) => { e.currentTarget.style.opacity = '1'; (e.currentTarget.nextElementSibling as HTMLElement)?.classList.add('hidden'); }}
                        />
                    ) : null}
                     <div className={cn(
                         "banner-placeholder absolute inset-0 flex flex-col items-center justify-center text-muted-foreground text-xs bg-muted/80 p-2 text-center pointer-events-none",
                         bannerConfig.imageUrl ? "hidden" : ""
                     )}>
                        <ImageIcon className="w-10 h-10 mb-1 opacity-50" />
                        <span>Banner</span>
                        {!bannerConfig.imageUrl && <span className="text-[10px] mt-0.5">No Image URL</span>}
                    </div>
                     {/* --- NEW: Image Upload Button --- */}
                     {/* Check for imageUploadEnabled flag before rendering */}
                     {bannerConfig.imageUploadEnabled && (
                         <UiButton
                            variant="secondary"
                            size="sm"
                            className="absolute bottom-2 right-2 z-20 opacity-0 group-hover/banner:opacity-100 transition-opacity"
                            onClick={(e) => handleImageUploadClick(e, widget.id)}
                            aria-label="Upload banner image"
                        >
                            <UploadCloud className="h-4 w-4 mr-2" /> Upload
                        </UiButton>
                     )}
                 </BannerElement>
                 {/* Hidden file input - Moved outside the BannerElement for simplicity */}
                 <input
                     type="file"
                     ref={fileInputRef}
                     onChange={handleFileChange}
                     className="hidden"
                     accept="image/*"
                     id={`fileInput-${widget.id}`} // Unique ID might be useful
                 />
                </div>
            );
            break;
        case 'grid':
             const gridConfig = config as GridConfig;
             const gridColsClass = getGridColsClass(gridConfig.columns);
             const gapClass = getGapClass(gridConfig.gap);
             const itemAspectRatioClass = getAspectRatioClass(gridConfig.itemAspectRatio) || 'aspect-square';
             const numPlaceholders = parseInt(gridConfig.columns || '2') * 2;

            content = (
                 gridConfig.dataSource ? (
                     <div className={cn("p-2 bg-muted/30 rounded border border-dashed border-input")} data-ai-hint="product grid display">
                         <div className={cn(`grid ${gridColsClass} ${gapClass}`)}>
                             {[...Array(numPlaceholders)].map((_, i) => (
                                 <div key={i} className={cn("bg-muted rounded flex flex-col items-center justify-center overflow-hidden p-2 cursor-pointer hover:opacity-80 transition-opacity", itemAspectRatioClass)} onClick={(e) => handleNavigation(e, `/product/${i + 1}`)}>
                                      {/* Simulate Image */}
                                      <div className={cn("w-full bg-muted-foreground/10 mb-1.5", itemAspectRatioClass)}>
                                            <Image src={`https://picsum.photos/seed/grid${i}/200/200`} alt={`Product ${i+1}`} width={200} height={200} className="w-full h-full object-cover"/>
                                      </div>
                                      {/* Simulate Text */}
                                      <div className="h-2 w-10/12 bg-muted-foreground/20 rounded-full mt-1"></div>
                                      <div className="h-2 w-8/12 bg-muted-foreground/10 rounded-full mt-1"></div>
                                 </div>
                             ))}
                         </div>
                         <span className="text-xs text-muted-foreground block text-center pt-2">Grid ({gridConfig.columns} cols) - Data from: {gridConfig.dataSource}</span>
                     </div>
                 ) : (
                     renderPlaceholder(LayoutGrid, "Product Grid", `Configure Data Source`)
                 )
             );
             break;
         case 'list':
             const listConfig = config as ListConfig;
             const itemLayout = listConfig.itemLayout || 'simple';
             const showDividers = listConfig.showDividers ?? true;
             const imgSizeClass = getImageSizeClass(listConfig.imageSize);

             content = (
                 listConfig.dataSource ? (
                     <div className={cn("p-2 bg-muted/30 rounded border border-dashed border-input")} data-ai-hint="ordered item list">
                          <div className="space-y-2">
                             {[...Array(3)].map((_, i) => (
                                <div
                                     key={i}
                                     className={cn(
                                         "bg-card rounded flex items-center p-2 space-x-3 cursor-pointer hover:bg-accent/10 transition-colors",
                                          itemLayout === 'image-right' ? 'flex-row-reverse space-x-reverse' : 'flex-row',
                                         showDividers && i < 2 ? 'border-b border-border pb-2 mb-2' : ''
                                     )}
                                     onClick={(e) => handleNavigation(e, `/item/${i + 1}`)} // Example navigation
                                 >
                                     {(itemLayout === 'image-left' || itemLayout === 'image-right') &&
                                         <div className={cn("bg-muted rounded flex-shrink-0 overflow-hidden", imgSizeClass)}>
                                            <Image src={`https://picsum.photos/seed/list${i}/100/100`} alt={`Item ${i+1}`} width={100} height={100} className="w-full h-full object-cover"/>
                                         </div>
                                     }
                                     <div className="flex-1 space-y-1 min-w-0"> {/* Added min-w-0 */}
                                          <div className={cn("h-3 bg-muted-foreground/80 rounded-full font-medium truncate", itemLayout === 'simple' ? 'w-5/6' : 'w-full')}>Item Title {i + 1} - Very Long Title That Might Overflow Otherwise</div>
                                          {itemLayout !== 'simple' && <div className={cn("h-2.5 bg-muted-foreground/50 rounded-full text-xs truncate", 'w-2/3')}>Short description that could also be long...</div>}
                                     </div>
                                      {itemLayout === 'detailed' && <UiButton variant="ghost" size="icon" className="h-6 w-6 ml-auto flex-shrink-0"><ChevronRight className="h-4 w-4"/></UiButton>}
                                 </div>
                             ))}
                          </div>
                         <span className="text-xs text-muted-foreground block text-center pt-2">List ({itemLayout}) - Data from: {listConfig.dataSource}</span>
                     </div>
                  ) : (
                     renderPlaceholder(Rows, "Item List", `Configure Data Source`)
                  )
             );
             break;
        case 'form':
            const formConfig = config as FormConfig;
            content = (
                <form className={cn("space-y-3 p-3 border border-dashed rounded border-input bg-card shadow-sm")} onSubmit={(e) => e.preventDefault()}>
                    {/* Simulate form fields */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground block" htmlFor={`form-${widget.id}-name`}>Name</label>
                        <input id={`form-${widget.id}-name`} type="text" className="block w-full h-8 rounded border border-input bg-background px-2 text-sm" placeholder="Your Name" />
                    </div>
                     <div className="space-y-1">
                         <label className="text-xs font-medium text-muted-foreground block" htmlFor={`form-${widget.id}-email`}>Email</label>
                        <input id={`form-${widget.id}-email`} type="email" className="block w-full h-8 rounded border border-input bg-background px-2 text-sm" placeholder="your@email.com" />
                    </div>
                     <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground block" htmlFor={`form-${widget.id}-message`}>Message</label>
                         <textarea id={`form-${widget.id}-message`} rows={3} className="block w-full rounded border border-input bg-background px-2 py-1 text-sm" placeholder="Your message..."></textarea>
                    </div>
                     <div className="flex justify-end pt-2">
                         {/* Simulate sending state later */}
                         <UiButton type="submit" variant="default" size="sm">
                            {formConfig.submitButtonText || 'Submit'}
                         </UiButton>
                    </div>
                    <span className="text-xs text-muted-foreground block text-center pt-1">Form Preview (Non-functional)</span>
                </form>
            );
            break;
        case 'text':
            const textConfig = config as TextConfig;
            const textAlignClass = getAlignmentClass(textConfig.alignment);
            const textSizeClass = getFontSizeClass(textConfig.fontSize);
            const textColorClass = getTextColorClass(textConfig.textColor);
            const fontWeightClass = textConfig.isBold ? 'font-bold' : 'font-normal';
            const fontStyleClass = textConfig.isItalic ? 'italic' : 'not-italic';

             // Basic handling for rich text (replace with actual editor rendering later)
             const renderContent = () => {
                 if (textConfig.enableRichText) {
                     // In a real app, use a library like react-quill or tiptap to render HTML
                     // For now, just render as text, but indicate it's rich text enabled.
                     return (
                         <>
                            <p className="text-[10px] text-muted-foreground italic mb-1">(Rich Text Enabled)</p>
                             <p className={cn( textSizeClass, textColorClass, fontWeightClass, fontStyleClass, 'break-words whitespace-pre-wrap' )}>
                                {textConfig.content || "Enter text..."}
                            </p>
                         </>
                     );
                 }
                 // Plain text rendering
                 return (
                      <p className={cn( textSizeClass, textColorClass, fontWeightClass, fontStyleClass, 'break-words whitespace-pre-wrap' )}>
                         {textConfig.content || "Enter text..."}
                     </p>
                 );
             };

            content = (
                <div className={cn("p-1 min-h-[2rem] w-full", textAlignClass.split(' ')[0])}>
                   {renderContent()}
                </div>
            );
            break;
         case 'button':
            const buttonConfig = config as ButtonConfig;
            const btnAlignClass = getButtonAlignmentClass(buttonConfig.alignment);
            const btnSizeClass = getButtonSizeClass(buttonConfig.size);
            // Use anchor tag for navigation within preview
            const ButtonElement = buttonConfig.linkUrl ? 'a' : 'div';
            const buttonProps = buttonConfig.linkUrl ? { href: buttonConfig.linkUrl, onClick: (e: React.MouseEvent) => handleNavigation(e, buttonConfig.linkUrl!) } : {};

            content = (
                <div className={cn("flex w-full py-1", btnAlignClass)}>
                    {/* Prevent interaction if button is just a placeholder div */}
                    <ButtonElement {...buttonProps} className={cn({'w-full': buttonConfig.alignment === 'full', 'pointer-events-none': ButtonElement === 'div'})}>
                        <UiButton
                            variant={buttonConfig.variant || 'default'}
                            size={buttonConfig.size || 'default'}
                             className={cn({'w-full': buttonConfig.alignment === 'full'}, buttonConfig.linkUrl ? 'cursor-pointer' : 'cursor-default')} // Adjust cursor based on link
                             aria-disabled={ButtonElement === 'div'} // Indicate non-interactive if it's a div
                             tabIndex={ButtonElement === 'div' ? -1 : 0} // Remove from tab order if non-interactive
                            {...(buttonConfig.size === 'icon' ? { 'aria-label': buttonConfig.buttonText || 'Icon button' } : {})}
                        >
                             {buttonConfig.size === 'icon' ? <ImageIcon className="h-4 w-4"/> : (buttonConfig.buttonText || "Button")}
                        </UiButton>
                    </ButtonElement>
                </div>
            );
            break;
        case 'spacer':
            const spacerConfig = config as SpacerConfig;
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
            const mapConfig = config as MapConfig;
            const getMapStyleBg = (style: string | undefined) => { return 'bg-blue-200 dark:bg-blue-900'; } // Simplified

             // Effect to handle 'useCurrentLocation' - Trigger only when flag is true
            useEffect(() => {
                // Ensure this effect runs only for the specific map widget instance
                if (mapConfig.useCurrentLocation && widget.id === selectedWidgetId) { // Trigger only if selected or based on some logic
                     // Check if address is already coordinates, maybe don't refetch
                     if (!mapConfig.address?.startsWith('Coords:')) {
                         handleGetCurrentLocation(widget.id);
                     } else {
                         console.log("Address is already coordinates, skipping refetch for", widget.id);
                         // Optionally reset the flag if needed, or handle in config panel
                         // updateWidgetConfig(widget.id, { useCurrentLocation: false });
                     }
                 }
                 // Intentionally limiting dependencies to avoid loops. handleGetCurrentLocation dependency might be needed if it changes.
                 // eslint-disable-next-line react-hooks/exhaustive-deps
            }, [mapConfig.useCurrentLocation, widget.id, selectedWidgetId /*, handleGetCurrentLocation */]);


            content = (
                <div className={cn("relative h-48 bg-muted rounded border border-dashed border-input overflow-hidden", getMapStyleBg(mapConfig.mapStyle))}>
                   {/* Client-side only rendering for map to avoid hydration errors */}
                   {isClient ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white/90 p-2 relative">
                        <MapPin className="w-10 h-10 mb-2 text-red-500" />
                        <p className="text-sm font-medium">Map Preview</p>
                        <p className="text-xs px-2 text-center mt-1 text-white/80 truncate w-full">{mapConfig.address || "No address set"}</p>
                        {mapConfig.showMarker === false && <p className="text-[10px] text-yellow-400 mt-0.5">(Marker Hidden)</p>}
                        <p className="text-[10px] text-white/60 mt-1 capitalize">Style: {mapConfig.mapStyle || 'roadmap'}, Zoom: {mapConfig.zoomLevel || 15}</p>
                        {/* Geolocation Button */}
                        <UiButton
                            variant="secondary"
                            size="icon"
                            className="absolute bottom-2 right-2 z-10 h-7 w-7"
                            onClick={(e) => {e.stopPropagation(); updateWidgetConfig(widget.id, {useCurrentLocation: true})}} // Set flag to true on click
                            aria-label="Get current location"
                            title="Use Current Location"
                        >
                            <LocateFixed className="h-4 w-4" />
                        </UiButton>
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
                     {/* Client-side only rendering */}
                     {isClient ? (
                         videoConfig.videoUrl ? (
                             // Basic iframe for common video platforms (YouTube, Vimeo)
                             <iframe
                                src={videoConfig.videoUrl.includes('youtube.com') || videoConfig.videoUrl.includes('youtu.be') ? `https://www.youtube.com/embed/${videoConfig.videoUrl.split('v=')[1]?.split('&')[0] || videoConfig.videoUrl.split('/').pop()}` : videoConfig.videoUrl} // Simple URL parsing
                                title="Video Player Preview"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                className="w-full h-full"
                                frameBorder="0"
                                sandbox="allow-scripts allow-same-origin allow-presentation" // Security sandbox
                             ></iframe>
                         ) : (
                             renderPlaceholder(VideoIconLucide, "Video Player", "Configure Video URL")
                         )
                     ) : (
                         <div className={cn("w-full h-full flex items-center justify-center text-muted-foreground text-xs animate-pulse bg-gray-800")}> Loading Video... </div>
                     )}
                     {/* Controls/Autoplay indicators (could be added as overlay if needed) */}
                 </div>
             );
             break;

         // --- NEW WIDGET RENDERING ---
        case 'carousel':
             // Render the dedicated CarouselWidget component
             content = <CarouselWidget config={config as CarouselConfig} handleNavigation={handleNavigation} />;
             break;

        case 'audio':
            const audioConfig = config as AudioConfig;
            content = (
                 audioConfig.audioUrl ? (
                     <div className="p-2 bg-card border rounded shadow-sm">
                        {isClient ? (
                             <audio
                                key={audioConfig.audioUrl} // Re-render if URL changes
                                 src={audioConfig.audioUrl}
                                 controls={audioConfig.showControls}
                                 autoPlay={audioConfig.autoplay}
                                 loop={audioConfig.loop}
                                 className="w-full"
                             >
                                 Your browser does not support the audio element.
                             </audio>
                         ) : (
                             <div className="h-10 w-full bg-muted rounded animate-pulse"></div> // SSR Placeholder
                         )}
                         <p className="text-xs text-muted-foreground truncate mt-1 px-1" title={audioConfig.audioUrl}>{audioConfig.audioUrl.split('/').pop()}</p>
                     </div>
                 ) : (
                     renderPlaceholder(Volume2, "Audio Player", "Configure Audio URL")
                 )
            );
            break;

        case 'countdown':
             const countdownConfig = config as CountdownConfig;
             // --- Call the hook here ---
             const { timeLeft, isExpired } = useCountdown(countdownConfig.targetDate);
             const displayStyle = countdownConfig.displayStyle || 'blocks';

             content = (
                 <div className={cn("p-3 border border-dashed rounded border-input text-center", isExpired ? 'bg-muted' : 'bg-card')}>
                    {/* Client-side only rendering for timer values */}
                    {isClient ? (
                         isExpired ? (
                            <p className="font-medium text-muted-foreground">{countdownConfig.expiredMessage || 'Event has started!'}</p>
                         ) : (
                             displayStyle === 'blocks' ? (
                                <div className="flex justify-center space-x-1 sm:space-x-2 text-center">
                                    <div className="flex flex-col items-center p-1 min-w-[35px] sm:min-w-[40px]">
                                        <span className="text-base sm:text-lg font-bold text-primary">{String(timeLeft.days).padStart(2, '0')}</span>
                                        <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase">{countdownConfig.labelDays || 'Days'}</span>
                                    </div>
                                    <div className="flex flex-col items-center p-1 min-w-[35px] sm:min-w-[40px]">
                                        <span className="text-base sm:text-lg font-bold text-primary">{String(timeLeft.hours).padStart(2, '0')}</span>
                                        <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase">{countdownConfig.labelHours || 'Hours'}</span>
                                    </div>
                                    <div className="flex flex-col items-center p-1 min-w-[35px] sm:min-w-[40px]">
                                        <span className="text-base sm:text-lg font-bold text-primary">{String(timeLeft.minutes).padStart(2, '0')}</span>
                                        <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase">{countdownConfig.labelMinutes || 'Mins'}</span>
                                    </div>
                                    <div className="flex flex-col items-center p-1 min-w-[35px] sm:min-w-[40px]">
                                        <span className="text-base sm:text-lg font-bold text-primary">{String(timeLeft.seconds).padStart(2, '0')}</span>
                                        <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase">{countdownConfig.labelSeconds || 'Secs'}</span>
                                    </div>
                                </div>
                             ) : ( // Inline style
                                <p className="font-medium text-primary">
                                     {timeLeft.days > 0 && `${timeLeft.days}d `}
                                     {timeLeft.hours > 0 && `${timeLeft.hours}h `}
                                     {timeLeft.minutes > 0 && `${timeLeft.minutes}m `}
                                     {timeLeft.seconds}s
                                 </p>
                             )
                         )
                     ) : (
                         <div className="h-10 w-full bg-muted rounded animate-pulse"></div> // SSR Placeholder
                     )}
                 </div>
             );
             break;

        case 'social':
             const socialConfig = config as SocialFeedConfig;
             // Note: Embedding actual social feeds often requires backend proxies or complex client-side SDKs due to CORS and API limitations.
             // This is a simplified placeholder using basic iframes where possible (like Twitter).
             const getEmbedUrl = () => {
                if (!socialConfig.profileUrlOrHandle) return null;
                switch(socialConfig.platform) {
                    case 'twitter':
                        const handle = socialConfig.profileUrlOrHandle.split('/').pop() || socialConfig.profileUrlOrHandle;
                         // Using a third-party service like Twitframe for simplicity - REPLACE with official methods or backend if needed
                         return `https://twitframe.com/show?url=https%3A%2F%2Ftwitter.com%2F${handle}`;
                     // Instagram/Facebook embedding is much more restricted, often requiring official SDKs or backend calls.
                     case 'instagram': return `https://www.instagram.com/${socialConfig.profileUrlOrHandle.split('/').pop()}/embed/`; // Often blocked
                     case 'facebook': return `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(socialConfig.profileUrlOrHandle)}&tabs=timeline&width=340&height=500&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=true&appId`; // Requires App ID, likely blocked
                     case 'linkedin': return null; // LinkedIn embedding is generally not straightforward for profiles/feeds
                    default: return null;
                 }
             }
             const embedUrl = getEmbedUrl();

             content = (
                embedUrl && isClient ? ( // Render iframe only on client
                    <div className="h-64 w-full border rounded overflow-hidden bg-muted">
                         <iframe
                            key={embedUrl} // Re-render iframe if URL changes
                            src={embedUrl}
                            title={`${socialConfig.platform} Feed Preview`}
                            className="w-full h-full border-0"
                             // Sandbox for security, adjust permissions as needed by the embed provider
                            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms"
                            loading="lazy" // Lazy load iframe
                         />
                    </div>
                 ) : (
                    renderPlaceholder(Share2, `${socialConfig.platform} Feed`, `Configure ${socialConfig.platform} Profile URL/Handle${socialConfig.platform !== 'twitter' ? ' (Embedding might be limited)' : ''}`)
                 )
             );
             break;

        case 'divider':
             const dividerConfig = config as DividerConfig;
             const borderStyle = `border-${dividerConfig.style || 'solid'}`;
             // Use arbitrary value syntax for thickness
             const thicknessClass = `border-t-[${dividerConfig.thickness || 1}px]`;
             const colorClass = `border-${dividerConfig.color === 'border' ? 'border' : dividerConfig.color || 'border'}`;

            content = (
                 // The divider itself doesn't need margins in its own content div, margins are handled by the wrapper
                 <div className={cn("w-full")}>
                     <hr className={cn("w-full", borderStyle, thicknessClass, colorClass)} />
                </div>
            );
            break;

      default:
         // Fallback for any unhandled widget types
         const unknownWidget = widget as DroppedWidget; // Cast for accessing type
        content = (
          <div className={cn("p-4 bg-destructive/10 rounded border border-dashed border-destructive text-destructive-foreground text-sm flex flex-col items-center justify-center h-24")}>
            <p className="font-semibold">Unknown Widget</p>
            <p className="text-xs mt-1">{unknownWidget.type}</p>
          </div>
        );
    }

    // --- Wrapper Rendering (Handles Drag/Drop, Selection, Deletion) ---
     if (widget.type === 'header') {
         return (
             <div
                key={widget.id} id={`widget-${widget.id}`} onClick={(e) => handleWidgetClick(e, widget.id)}
                className={commonWrapperClasses} role="button" tabIndex={0} aria-label={`Widget: ${widget.name || widget.type}. ${isSelected ? 'Selected.' : ''} Click to configure.`}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleWidgetClick(e as any, widget.id)}}
             >
                  <div className="widget-content"> {content} </div>
                  {/* Overlay for hover effect */}
                  <div className="absolute inset-0 bg-transparent group-hover:bg-black/5 dark:group-hover:bg-white/5 transition-colors duration-150 pointer-events-none rounded-lg"></div>
                  <UiButton variant="destructive" size="icon" className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 focus-within:opacity-100 group-focus:opacity-100 transition-opacity z-30 rounded-full shadow-md" onClick={(e) => { e.stopPropagation(); removeWidget(widget.id); }} aria-label={`Remove ${widget.name || widget.type} widget`} tabIndex={isSelected ? 0 : -1}>
                    <Trash2 className="h-4 w-4" />
                  </UiButton>
             </div>
         );
     }

    // Standard wrapper for all other widgets
    return (
      <div
        key={widget.id} id={`widget-${widget.id}`} onClick={(e) => handleWidgetClick(e, widget.id)}
        className={commonWrapperClasses} role="button" tabIndex={0} aria-label={`Widget: ${widget.name || widget.type}. ${isSelected ? 'Selected.' : ''} Click to configure, drag handle to reorder.`}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleWidgetClick(e as any, widget.id)}}
        draggable={widget.type !== 'header'} // Only non-header widgets are draggable
        onDragStart={(e) => handleWidgetDragStart(e, widget.id)}
        onDragOver={(e) => handleWidgetDragOver(e, widget.id)}
        onDragEnter={(e) => handleWidgetDragEnter(e, widget.id)}
        onDragLeave={(e) => handleWidgetDragLeave(e, widget.id)}
        onDrop={(e) => handleWidgetDrop(e, widget.id)}
        onDragEnd={handleWidgetDragEnd}
      >
        {/* Drop indicator line */}
        {isDropTarget && widget.type !== 'header' && (
             <div className="absolute top-0 left-0 right-0 h-1 bg-accent -mt-1.5 z-20 pointer-events-none rounded-full animate-pulse"></div>
         )}
        <div className="widget-content flex items-start"> {/* Changed to items-start */}
             {widget.type !== 'header' && (
                 <div
                     className="widget-drag-handle mr-1 p-1 cursor-grab text-muted-foreground hover:text-foreground touch-none opacity-60 hover:opacity-100 transition-opacity"
                     aria-label={`Drag handle for ${widget.name || widget.type} widget`}
                     onClick={(e) => e.stopPropagation()} // Prevent selection when clicking handle
                     onMouseDown={(e) => e.stopPropagation()} // Helps with text selection prevention
                     draggable // Make handle itself draggable to initiate widget drag
                     onDragStart={(e) => {
                        // Need to proxy the drag start to the parent wrapper
                        const parentWrapper = (e.target as HTMLElement).closest('.widget-wrapper');
                        if (parentWrapper instanceof HTMLDivElement) {
                            handleWidgetDragStart(e as any, parentWrapper.id.replace('widget-', ''));
                        }
                     }}
                     onDragEnd={(e) => handleWidgetDragEnd(e as any)} // Need drag end here too
                    >
                    <GripVertical className="h-5 w-5" />
                 </div>
             )}
            <div className="flex-1 min-w-0"> {/* Added min-w-0 to prevent content overflow issues */}
                {content}
            </div>
        </div>
         {widget.type !== 'header' && (
            <>
                 {/* Overlay for hover effect */}
                 <div className="absolute inset-0 bg-transparent group-hover:bg-black/5 dark:group-hover:bg-white/5 transition-colors duration-150 rounded-lg pointer-events-none"></div>
                <UiButton variant="destructive" size="icon" className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 focus-within:opacity-100 group-focus:opacity-100 transition-opacity z-10 rounded-full shadow-md" onClick={(e) => { e.stopPropagation(); removeWidget(widget.id); }} aria-label={`Remove ${widget.name || widget.type} widget`} tabIndex={isSelected ? 0 : -1}>
                  <Trash2 className="h-4 w-4" />
                </UiButton>
            </>
         )}
      </div>
    );
  };


  // --- Main Phone Preview Structure ---
  return (
    <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[10px] rounded-[2.5rem] h-[700px] w-[350px] shadow-xl">
      {/* Phone Top Notch */}
      <div className="w-[140px] h-[18px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute z-30"></div>
      {/* Phone Side Buttons */}
      <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[13px] top-[124px] rounded-l-lg z-0"></div>
      <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[13px] top-[178px] rounded-l-lg z-0"></div>
      <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[13px] top-[142px] rounded-r-lg z-0"></div>

      {/* Phone Screen */}
      <div
          className="rounded-[2rem] overflow-hidden w-full h-full bg-background relative z-10 flex flex-col"
          onDragOver={handleContainerDragOver}
          onDragLeave={handleContainerDragLeave}
          onDrop={handleContainerDrop}
          id="phone-preview-dropzone-container"
      >
         {/* --- RENDER BASED ON currentPreviewUrl --- */}
         {currentPreviewUrl === '/' ? (
            <>
              {/* Header Widget Area (fixed at top if present) */}
              {widgets.find(w => w.type === 'header') && renderWidgetContent(widgets.find(w => w.type === 'header')!, 0)}

              {/* App Content Area (Scrollable below header) */}
              <div
                ref={widgetsContainerRef}
                className={cn(
                  'w-full flex-1 p-2 overflow-y-auto scroll-smooth transition-colors duration-200',
                   (isDraggingOverContainer || (draggedWidgetId && !dropTargetId))
                    ? 'bg-accent/10 ring-2 ring-accent ring-inset'
                    : 'bg-white dark:bg-neutral-900' // Use a slightly off-white/dark background
                )}
                id="phone-preview-widgets-area"
                aria-label="Phone preview area. Drag widgets here to add, or drag existing widgets to reorder."
              >
                {widgets.filter(w => w.type !== 'header').length === 0 && !isDraggingOverContainer && !draggedWidgetId && (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-6 pointer-events-none">
                    <Smartphone className="w-16 h-16 mb-4 opacity-70" />
                    <p className="text-sm font-medium mb-1">App Preview</p>
                    <p className="text-xs"> Drag widgets from the left panel and drop them here. </p>
                  </div>
                )}
                {(isDraggingOverContainer || (draggedWidgetId && !dropTargetId)) && widgets.filter(w => w.type !== 'header').length === 0 && (
                   <div className="flex flex-col items-center justify-center h-full text-center text-accent font-medium pointer-events-none"> <p>Drop widget here</p> </div>
                )}

                {/* Render widgets only on client */}
                 {isClient && (
                     <div className={cn("transition-opacity duration-150", isDraggingOverContainer ? 'opacity-50' : 'opacity-100')} aria-live="polite" aria-label="App content widgets">
                         {widgets.filter(w => w.type !== 'header').map(renderWidgetContent)}
                     </div>
                 )}

                 {/* Drop zone indicator at the end */}
                 {(isDraggingOverContainer || (draggedWidgetId && !dropTargetId)) && widgets.filter(w => w.type !== 'header').length > 0 && (
                   <div className="mt-2 p-3 border-2 border-dashed border-accent rounded text-center text-accent font-medium text-sm bg-accent/5 pointer-events-none"> Drop here to add to end </div>
                )}
              </div>
            </>
         ) : (
            // Render specific page content based on URL
            <div className="flex-1 overflow-y-auto">
                {/* Use PreviewPagePlaceholder for all internal navigation targets */}
                <PreviewPagePlaceholder
                    title={getPageTitle(currentPreviewUrl)}
                    icon={getPageIcon(currentPreviewUrl)}
                    backAction={() => setCurrentPreviewUrl('/')}
                    currentUrl={currentPreviewUrl} // Pass URL for potential context
                />
            </div>
         )}
      </div>
    </div>
  );
}


// --- Placeholder Component for Internal Pages ---
interface PreviewPagePlaceholderProps {
    title: string;
    icon: React.ElementType;
    backAction: () => void;
    currentUrl: string; // Add current URL for context
}
const PreviewPagePlaceholder: React.FC<PreviewPagePlaceholderProps> = ({ title, icon: Icon, backAction, currentUrl }) => {
    return (
         <div className="flex flex-col h-full bg-background">
             {/* Simple Header Simulation */}
             <div className="flex items-center h-12 px-3 border-b bg-card shadow-sm sticky top-0 z-10">
                 <UiButton variant="ghost" size="icon" className="h-8 w-8" onClick={backAction}>
                     <ArrowLeft className="h-5 w-5" />
                 </UiButton>
                 <h2 className="text-base font-semibold text-center flex-1 truncate px-2">{title}</h2>
                 <div className="w-8"></div> {/* Spacer */}
            </div>
            {/* Content Area */}
             <div className="flex flex-col items-center justify-center flex-1 p-6 text-center text-muted-foreground">
                <Icon className="w-16 h-16 mb-4 opacity-30" />
                <p className="text-sm font-medium mb-1">{title}</p>
                <p className="text-xs">This is a preview of the "{title}" page.</p>
                 <p className="text-xs mt-2">Content and customization for this page type would be configured separately.</p>
                 {/* Example: Show dynamic content based on URL */}
                 {currentUrl.startsWith('/product/') && (
                    <p className="text-xs mt-2 italic">Loading details for Product ID: {currentUrl.split('/').pop()}</p>
                 )}
                 {currentUrl.startsWith('/item/') && (
                    <p className="text-xs mt-2 italic">Loading details for Item ID: {currentUrl.split('/').pop()}</p>
                 )}
                 <UiButton variant="outline" size="sm" className="mt-4" onClick={backAction}>
                     Go Back
                 </UiButton>
             </div>
        </div>
     );
 };

 // Helper functions to determine page title and icon based on URL
 const getPageTitle = (url: string): string => {
    if (url === '/menu') return 'Menu';
    if (url === '/cart') return 'Shopping Cart';
    if (url === '/auth') return 'Login / Sign Up';
    if (url === '/previous-page') return 'Previous Page';
    if (url.startsWith('/product/')) return `Product Details`;
    if (url.startsWith('/item/')) return `Item Details`;
    if (url === '/products') return 'All Products';
    if (url === '/categories') return 'Categories';
    return 'Page Preview'; // Default
 };

 const getPageIcon = (url: string): React.ElementType => {
    if (url === '/menu') return Menu;
    if (url === '/cart') return ShoppingCart;
    if (url === '/auth') return User;
    if (url === '/previous-page') return ArrowLeft;
    if (url.startsWith('/product/')) return LayoutGrid;
    if (url.startsWith('/item/')) return Rows;
     if (url === '/products') return LayoutGrid;
    if (url === '/categories') return Rows;
    return Smartphone; // Default icon
 };

