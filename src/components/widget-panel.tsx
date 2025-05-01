
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
    LayoutGrid,
    Image as ImageIcon,
    Rows,
    MessageSquare,
    Type as TypeIcon, // Correctly imported Type
    MousePointerSquareDashed, // Corrected icon import
    Space, // Spacer icon
    MapPin, // Map icon
    VideoIcon, // Video icon
} from 'lucide-react';
import { PlatformConnector } from './platform-connector'; // Import PlatformConnector
import { ScrollArea } from '@/components/ui/scroll-area'; // Import ScrollArea
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Import Card components

// Expanded widget data
const widgets = [
  { id: 'banner', name: 'Banner Image', icon: ImageIcon, description: 'Display a prominent image with an optional link.' },
  { id: 'grid', name: 'Product Grid', icon: LayoutGrid, description: 'Show products in a grid layout.' },
  { id: 'list', name: 'Product List', icon: Rows, description: 'Display products in a list format.' },
  { id: 'text', name: 'Text Block', icon: TypeIcon, description: 'Add formatted text content.' }, // Use TypeIcon
  { id: 'button', name: 'Button', icon: MousePointerSquareDashed, description: 'Add a clickable button with a link.' }, // Use correct icon
  { id: 'spacer', name: 'Spacer', icon: Space, description: 'Add vertical space between elements.' },
  { id: 'form', name: 'Contact Form', icon: MessageSquare, description: 'Collect user input via a form.' },
  { id: 'map', name: 'Map', icon: MapPin, description: 'Embed an interactive map.' },
  { id: 'video', name: 'Video', icon: VideoIcon, description: 'Embed a video player.' },
];

export function WidgetPanel() {
  const handleDragStart = (
    event: React.DragEvent<HTMLButtonElement>,
    widgetType: string
  ) => {
    event.dataTransfer.setData('widgetType', widgetType);
    console.log('Dragging:', widgetType);
    // Optional: Add visual feedback for dragging
    // event.currentTarget.style.opacity = '0.5';
  };

   const handleDragEnd = (event: React.DragEvent<HTMLButtonElement>) => {
    // Optional: Reset visual feedback
    // event.currentTarget.style.opacity = '1';
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
              className="w-full justify-start h-auto py-2 px-3 cursor-grab active:cursor-grabbing bg-card hover:bg-accent/10 border border-transparent hover:border-primary/20 shadow-sm text-left"
              draggable
              onDragStart={(e) => handleDragStart(e, widget.id)}
              onDragEnd={handleDragEnd}
              aria-label={`Drag ${widget.name} widget`}
              title={widget.description} // Add tooltip description
            >
              <widget.icon className="mr-3 h-5 w-5 text-accent flex-shrink-0" />
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
