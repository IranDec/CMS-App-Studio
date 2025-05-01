
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
    LayoutGrid,
    Image as ImageIcon,
    Rows,
    MessageSquare,
    Type, // Text icon
    MousePointerSquareDashed, // Button icon
    Space, // Spacer icon
    MapPin, // Map icon
    VideoIcon, // Video icon
    PanelTop, // Header icon
    ShoppingCart, // Added for potential use, though integrated into header
    User, // Added for potential use, though integrated into header
} from 'lucide-react';
import { PlatformConnector } from './platform-connector'; // Import PlatformConnector
import { ScrollArea } from '@/components/ui/scroll-area'; // Import ScrollArea
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Import Card components
import type { WidgetDefinition } from '@/types/widget'; // Import WidgetDefinition type

// Widget definitions conforming to the interface
const widgets: WidgetDefinition[] = [
  { id: 'header', name: 'App Header', icon: PanelTop, description: 'Configurable top navigation bar.' },
  { id: 'banner', name: 'Banner Image', icon: ImageIcon, description: 'Display a prominent image with an optional link.' },
  { id: 'grid', name: 'Product Grid', icon: LayoutGrid, description: 'Show products in a grid layout.' },
  { id: 'list', name: 'Product List', icon: Rows, description: 'Display products in a list format.' },
  { id: 'text', name: 'Text Block', icon: Type, description: 'Add formatted text content.' },
  { id: 'button', name: 'Button', icon: MousePointerSquareDashed, description: 'Add a clickable button with a link.' },
  { id: 'spacer', name: 'Spacer', icon: Space, description: 'Add vertical space between elements.' },
  { id: 'form', name: 'Contact Form', icon: MessageSquare, description: 'Collect user input via a form.' },
  { id: 'map', name: 'Map', icon: MapPin, description: 'Embed an interactive map.' },
  { id: 'video', name: 'Video', icon: VideoIcon, description: 'Embed a video player.' },
];

export function WidgetPanel() {
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

  return (
    <div className="p-4 space-y-4 h-full flex flex-col bg-secondary/50 border-r">
      <h2 className="text-xl font-semibold text-primary px-2">Widgets</h2>
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-2">
          {widgets.map((widget) => (
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
      </ScrollArea>
      <div className="mt-auto pt-4 border-t border-border px-2">
         <PlatformConnector />
      </div>

    </div>
  );
}
