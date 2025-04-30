'use client';

import type React from 'react'; // Corrected import syntax
import { Button } from '@/components/ui/button';
import { LayoutGrid, Image as ImageIcon, Rows, MessageSquare } from 'lucide-react';
import { PlatformConnector } from './platform-connector'; // Import PlatformConnector

// Placeholder widget data
const widgets = [
  { id: 'grid', name: 'Product Grid', icon: LayoutGrid },
  { id: 'banner', name: 'Banner Image', icon: ImageIcon },
  { id: 'list', name: 'Product List', icon: Rows },
  { id: 'form', name: 'Contact Form', icon: MessageSquare },
];

export function WidgetPanel() {
  const handleDragStart = (
    event: React.DragEvent<HTMLButtonElement>,
    widgetType: string
  ) => {
    event.dataTransfer.setData('widgetType', widgetType);
    console.log('Dragging:', widgetType);
  };

  return (
    <div className="p-4 space-y-4 h-full flex flex-col">
      <h2 className="text-xl font-semibold text-primary">Widgets</h2>
      <div className="flex-1 space-y-3 overflow-y-auto pr-2">
        {widgets.map((widget) => (
          <Button
            key={widget.id}
            variant="outline"
            className="w-full justify-start cursor-grab active:cursor-grabbing bg-card hover:bg-accent/10 border shadow-sm"
            draggable
            onDragStart={(e) => handleDragStart(e, widget.id)}
            aria-label={`Drag ${widget.name} widget`}
          >
            <widget.icon className="mr-2 h-4 w-4 text-accent" />
            {widget.name}
          </Button>
        ))}
      </div>
      {/* Replace placeholder with the actual PlatformConnector component */}
      <PlatformConnector />
    </div>
  );
}
