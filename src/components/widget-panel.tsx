// Designed by Mohammad Babaei (adschi.com)
'use client';

import React, { useState, useMemo } from 'react'; // Added useState and useMemo
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Import Input
import {
    LayoutGrid,
    Image as ImageIcon,
    Rows,
    MessageSquare,
    Type, // Text icon
    MousePointerSquareDashed, // Button icon (Corrected)
    Space, // Spacer icon
    MapPin, // Map icon
    VideoIcon, // Video icon
    PanelTop, // Header icon
    Minus, // Divider icon
    Clock, // Countdown icon
    GalleryHorizontalEnd, // Carousel icon
    Volume2, // Audio icon
    Share2, // Social Feed icon
    Camera, // Camera Icon
    Bell, // Push Notification Icon
    Search, // Search Icon
} from 'lucide-react';
// Removed PlatformConnector import
import { ScrollArea } from '@/components/ui/scroll-area'; // Import ScrollArea
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Import Card components
import type { WidgetDefinition } from '@/types/widget'; // Import WidgetDefinition type

// Widget definitions conforming to the interface
const availableWidgets: WidgetDefinition[] = [
  { id: 'header', name: 'App Header', icon: PanelTop, description: 'Configurable top navigation bar.' },
  { id: 'banner', name: 'Banner Image', icon: ImageIcon, description: 'Display a prominent image with an optional link.' },
  { id: 'carousel', name: 'Image Carousel', icon: GalleryHorizontalEnd, description: 'Sliding gallery of images.' },
  { id: 'grid', name: 'Product Grid', icon: LayoutGrid, description: 'Show items in a grid layout.' },
  { id: 'list', name: 'Item List', icon: Rows, description: 'Display items in a list format.' },
  { id: 'text', name: 'Text Block', icon: Type, description: 'Add formatted text content.' },
  { id: 'button', name: 'Button', icon: MousePointerSquareDashed, description: 'Add a clickable button with a link.' },
  { id: 'spacer', name: 'Spacer', icon: Space, description: 'Add vertical space between elements.' },
  { id: 'divider', name: 'Divider', icon: Minus, description: 'Visual line to separate sections.' },
  { id: 'form', name: 'Contact Form', icon: MessageSquare, description: 'Collect user input via a form.' },
  { id: 'map', name: 'Map', icon: MapPin, description: 'Embed an interactive map.' },
  { id: 'video', name: 'Video', icon: VideoIcon, description: 'Embed a video player.' },
  { id: 'audio', name: 'Audio Player', icon: Volume2, description: 'Embed an audio player.' },
  { id: 'countdown', name: 'Countdown Timer', icon: Clock, description: 'Display a timer for events/sales.' },
  { id: 'social', name: 'Social Feed', icon: Share2, description: 'Embed feeds from social platforms.' },
  // --- NEW WIDGETS ---
  { id: 'camera', name: 'Camera View', icon: Camera, description: 'Access and display the device camera.' },
  { id: 'pushNotification', name: 'Push Notifications', icon: Bell, description: 'Configure and manage push notifications (Setup).' },
];

export function WidgetPanel() {
   const [searchTerm, setSearchTerm] = useState(''); // State for search term

  const handleDragStart = (
    event: React.DragEvent<HTMLButtonElement>,
    widget: WidgetDefinition // Use the specific type here
  ) => {
    event.dataTransfer.setData('widgetType', widget.id);
    event.dataTransfer.setData('widgetName', widget.name); // Pass the name
    console.log('Dragging:', widget.name);
    try {
         // Optional: Add a visual cue like a semi-transparent ghost image
         const ghost = event.currentTarget.cloneNode(true) as HTMLElement;
         ghost.style.position = "absolute";
         ghost.style.top = "-1000px"; // Position off-screen initially
         ghost.style.width = "150px"; // Fixed width for ghost
         ghost.style.opacity = "0.6";
         document.body.appendChild(ghost);
         // Set the drag image (use the cloned node)
         // Adjust offsets to center the ghost image under the cursor
         event.dataTransfer.setDragImage(ghost, ghost.offsetWidth / 2, ghost.offsetHeight / 2);
         // Clean up the ghost element after drag operation ends (in dragend or similar)
          event.currentTarget.addEventListener('dragend', () => {
            ghost.remove();
         }, { once: true });

     } catch (error) {
         console.warn("Could not set drag image:", error);
     }
    // event.currentTarget.style.opacity = '0.5'; // Make original semi-transparent
  };

   const handleDragEnd = (event: React.DragEvent<HTMLButtonElement>) => {
    // event.currentTarget.style.opacity = '1'; // Restore opacity
  };

   // Filter widgets based on search term
   const filteredWidgets = useMemo(() => {
       if (!searchTerm) {
           return availableWidgets;
       }
       const lowerCaseSearchTerm = searchTerm.toLowerCase();
       return availableWidgets.filter(widget =>
           widget.name.toLowerCase().includes(lowerCaseSearchTerm) ||
           widget.description.toLowerCase().includes(lowerCaseSearchTerm)
       );
   }, [searchTerm]);


  return (
    <div className="p-4 space-y-4 h-full flex flex-col bg-secondary/50 border-r">
      <h2 className="text-xl font-semibold text-primary px-2">Widgets</h2>

      {/* Search Input */}
      <div className="relative px-2">
         <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
         <Input
           type="text"
           placeholder="Search widgets..."
           className="pl-8 h-9 text-sm" // Add padding for icon
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
         />
      </div>


      <ScrollArea className="flex-1 px-2">
        {filteredWidgets.length > 0 ? (
         <div className="space-y-2">
           {filteredWidgets.map((widget) => (
             <Button
               key={widget.id}
               variant="ghost" // Use ghost variant for a cleaner look
               className="w-full justify-start h-auto py-2 px-3 cursor-grab active:cursor-grabbing bg-card hover:bg-accent/10 border border-transparent hover:border-primary/20 shadow-sm text-left flex items-start space-x-3" // Ensure items start at top
               draggable
               onDragStart={(e) => handleDragStart(e, widget)} // Pass the whole widget object
               onDragEnd={handleDragEnd}
               aria-label={`Drag ${widget.name} widget`}
               title={widget.description} // Add tooltip description
             >
               <widget.icon className="mt-0.5 h-5 w-5 text-accent flex-shrink-0" aria-hidden="true" />
               <div className="flex flex-col">
                  <span className="font-medium text-sm">{widget.name}</span>
                  <span className="text-xs text-muted-foreground">{widget.description}</span>
               </div>

             </Button>
           ))}
         </div>
         ) : (
           <p className="text-center text-sm text-muted-foreground mt-4">No widgets found matching "{searchTerm}"</p>
         )}
      </ScrollArea>
      {/* Removed PlatformConnector from here */}
      <div className="mt-auto pt-4 border-t border-border px-2">
         <Card className="bg-card/50 shadow-none border-0">
            <CardHeader className="p-3 pb-1">
                <CardTitle className="text-base">App Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 text-xs text-muted-foreground">
                Configure global app settings, integrations, and publishing options here (coming soon).
                 {/* PlatformConnector removed from here */}
            </CardContent>
         </Card>
      </div>

    </div>
  );
}
