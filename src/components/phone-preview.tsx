
'use client';

import React, { useState } from 'react';
import Image from 'next/image'; // Import next/image
import { cn } from '@/lib/utils';
import { Smartphone, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DroppedWidget } from '@/types/widget'; // Import the type

interface PhonePreviewProps {
  widgets: DroppedWidget[];
  setWidgets: React.Dispatch<React.SetStateAction<DroppedWidget[]>>;
  selectedWidgetId: string | null;
  setSelectedWidgetId: React.Dispatch<React.SetStateAction<string | null>>;
}

export function PhonePreview({
  widgets,
  setWidgets,
  selectedWidgetId,
  setSelectedWidgetId,
}: PhonePreviewProps) {
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const widgetType = event.dataTransfer.getData('widgetType');
    if (widgetType) {
      console.log('Dropped:', widgetType);
      const newWidget: DroppedWidget = {
        id: `${widgetType}-${Date.now()}`,
        type: widgetType,
        config: {}, // Initialize empty config
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

    switch (widget.type) {
      case 'grid':
        content = (
          <div className="grid grid-cols-2 gap-2 p-2 bg-muted/50 rounded">
            <div className="h-16 bg-muted rounded animate-pulse"></div>
            <div className="h-16 bg-muted rounded animate-pulse"></div>
            <div className="h-16 bg-muted rounded animate-pulse"></div>
            <div className="h-16 bg-muted rounded animate-pulse"></div>
          </div>
        );
        break;
      case 'banner':
        if (widget.config?.imageUrl) {
          content = (
             <div className="relative h-24 w-full rounded overflow-hidden bg-muted">
                <Image
                  src={widget.config.imageUrl}
                  alt={widget.config.altText || 'Banner image'}
                  layout="fill"
                  objectFit="cover"
                  data-ai-hint="banner image"
                />
             </div>
          );
        } else {
          content = (
            <div className="h-24 bg-muted rounded animate-pulse flex items-center justify-center text-muted-foreground text-xs">
              Banner
            </div>
          );
        }
        break;
      case 'list':
        content = (
          <div className="space-y-2 p-2 bg-muted/50 rounded">
            <div className="h-8 bg-muted rounded animate-pulse w-full"></div>
            <div className="h-8 bg-muted rounded animate-pulse w-5/6"></div>
            <div className="h-8 bg-muted rounded animate-pulse w-full"></div>
          </div>
        );
        break;
      case 'form':
        content = (
          <div className="space-y-2 p-2 border border-dashed rounded border-input">
            <div className="h-6 bg-muted rounded animate-pulse w-1/3"></div>
            <div className="h-8 bg-muted rounded animate-pulse w-full"></div>
            <div className="h-6 bg-muted rounded animate-pulse w-1/3"></div>
            <div className="h-16 bg-muted rounded animate-pulse w-full"></div>
            <div className="h-8 bg-primary/20 rounded animate-pulse w-1/4 ml-auto"></div>
          </div>
        );
        break;
      default:
        content = (
          <div className="p-2 bg-destructive/20 rounded text-destructive-foreground text-xs">
            Unknown Widget: {widget.type}
          </div>
        );
    }

    return (
      <div
        key={widget.id}
        onClick={(e) => handleWidgetClick(e, widget.id)}
        className={cn(
            "relative group border-2 p-1 rounded mb-2 cursor-pointer transition-colors",
            isSelected ? 'border-primary bg-primary/5' : 'border-transparent hover:border-accent'
        )}
      >
        {content}
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          onClick={() => removeWidget(widget.id)}
          aria-label={`Remove ${widget.type} widget`}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    );
  };

  return (
    <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[10px] rounded-[2.5rem] h-[700px] w-[350px] shadow-xl">
      {/* Phone Top Notch */}
      <div className="w-[140px] h-[18px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute z-10"></div>
      {/* Phone Side Buttons (visual only) */}
      <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[13px] top-[124px] rounded-l-lg"></div>
      <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[13px] top-[178px] rounded-l-lg"></div>
      <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[13px] top-[142px] rounded-r-lg"></div>

      {/* Phone Screen */}
      <div className="rounded-[2rem] overflow-hidden w-full h-full bg-background">
        {/* App Content Area */}
        <div
          className={cn(
            'w-full h-full p-4 overflow-y-auto transition-colors duration-200',
            isDraggingOver
              ? 'bg-accent/10 border-2 border-dashed border-accent'
              : 'bg-white dark:bg-neutral-900' // Adjusted background for light/dark
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {widgets.length === 0 && !isDraggingOver && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <Smartphone className="w-16 h-16 mb-4" />
              <p className="text-sm">
                Drag widgets from the left panel and drop them here. Click a widget to configure it.
              </p>
            </div>
          )}
          {isDraggingOver && widgets.length === 0 && ( // Show drop text only if area is empty
            <div className="flex flex-col items-center justify-center h-full text-center text-accent font-medium">
              <p>Drop widget here</p>
            </div>
          )}
          {/* Render widgets */}
          <div className={cn(isDraggingOver ? 'opacity-50' : '')}>
             {widgets.map(renderWidgetContent)}
          </div>
          {/* Show drop indicator at the bottom when dragging over existing widgets */}
           {isDraggingOver && widgets.length > 0 && (
             <div className="mt-4 p-4 border-2 border-dashed border-accent rounded text-center text-accent font-medium">
                Drop here to add
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
