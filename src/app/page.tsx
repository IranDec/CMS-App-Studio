
'use client';

import React, { useState, useEffect } from 'react';
import { WidgetPanel } from '@/components/widget-panel';
import { PhonePreview } from '@/components/phone-preview';
import { ConfigurationPanel } from '@/components/configuration-panel';
import type { DroppedWidget } from '@/types/widget';
import { widgetDefaultValuesMap } from '@/lib/widget-defaults'; // Import defaults for initial state

export default function Home() {
  const [widgets, setWidgets] = useState<DroppedWidget[]>([]);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);

  // Load initial widgets (optional, for demonstration)
  useEffect(() => {
    const initialWidgets: DroppedWidget[] = [
        // Start with a header by default
      { id: `header-${Date.now()}`, type: 'header', name: 'App Header', config: widgetDefaultValuesMap.header },
      { id: 'banner-1', type: 'banner', name: 'Hero Banner', config: { ...widgetDefaultValuesMap.banner, imageUrl: 'https://picsum.photos/seed/proj_banner1/600/200', altText: 'Mountain Landscape', marginTop: 0, marginBottom: 0, aspectRatio: '16/9' } }, // Banner usually has no top margin
      { id: 'text-1', type: 'text', name: 'Welcome Text', config: { ...widgetDefaultValuesMap.text, content: 'Build Your Mobile App Visually!', fontSize: 'xl', alignment: 'center', isBold: true, marginTop: 4, marginBottom: 2 } },
      { id: 'grid-1', type: 'grid', name: 'Featured Products', config: { ...widgetDefaultValuesMap.grid, columns: '2', gap: 3, marginTop: 2, marginBottom: 4, itemAspectRatio: '1/1', dataSource:'api/products' } }, // Example with data source
      { id: 'button-1', type: 'button', name: 'Call to Action', config: { ...widgetDefaultValuesMap.button, buttonText: 'Get Started', variant: 'primary', alignment: 'center', marginTop: 0, marginBottom: 4, size: 'lg' } },
      { id: 'spacer-1', type: 'spacer', name: 'Spacer', config: { ...widgetDefaultValuesMap.spacer, height: 2 } },
      { id: 'list-1', type: 'list', name: 'News Feed', config: { ...widgetDefaultValuesMap.list, itemLayout: 'image-left', showDividers: true, imageSize: 'sm', marginTop: 2, marginBottom: 2, dataSource:'api/news' } }, // Example with data source
    ];
    setWidgets(initialWidgets);
     // Select the header initially if it exists
     const header = initialWidgets.find(w => w.type === 'header');
     if (header) {
         setSelectedWidgetId(header.id);
     }
    // Consider loading from localStorage here if needed
  }, []);

  // Find the selected widget configuration
  const selectedWidget = widgets.find(w => w.id === selectedWidgetId) || null;

  // Function to update a specific widget's configuration
  const updateWidgetConfig = (widgetId: string, newConfig: Partial<DroppedWidget['config']>) => {
    console.log(`Updating widget ${widgetId} with config:`, newConfig);
    setWidgets(prevWidgets =>
      prevWidgets.map(widget =>
        widget.id === widgetId
          ? {
              ...widget,
              // Ensure preservation of existing config keys not present in newConfig
               config: { ...widget.config, ...newConfig },
            }
          : widget
      )
    );
    // Keep the current widget selected after update
    setSelectedWidgetId(widgetId);
  };

  // Function to handle adding a new widget
  const addWidget = (newWidget: DroppedWidget) => {
    setWidgets((prevWidgets) => [...prevWidgets, newWidget]);
    setSelectedWidgetId(newWidget.id); // Select the newly added widget
  };

 // Function to handle reordering widgets (excluding header)
  const moveWidget = (draggedId: string, targetId: string) => {
    setWidgets((prevWidgets) => {
        const draggedIndex = prevWidgets.findIndex(w => w.id === draggedId && w.type !== 'header'); // Don't find header
        const targetIndex = prevWidgets.findIndex(w => w.id === targetId && w.type !== 'header'); // Don't target header

        // Don't allow moving if header is involved or indices are invalid/same
        if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) {
            return prevWidgets;
        }

        const newWidgets = [...prevWidgets];
        const [draggedWidget] = newWidgets.splice(draggedIndex, 1); // Remove dragged item

        // Adjust target index if dragging downwards over the original position
        const finalTargetIndex = draggedIndex < targetIndex ? targetIndex : targetIndex;

        // Insert dragged item at the target index (adjusting for potential header)
        newWidgets.splice(finalTargetIndex, 0, draggedWidget);

        console.log(`Moved widget ${draggedId} to index ${finalTargetIndex}`);
        return newWidgets;
    });
     // Keep the dragged widget selected after move
    setSelectedWidgetId(draggedId);
  };


  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Left Panel: Widget Selection */}
      <aside className="w-1/4 max-w-xs border-r bg-secondary overflow-y-auto shadow-md z-10">
        <WidgetPanel />
      </aside>

      {/* Center Panel: Phone Preview */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8 bg-muted/30">
        <PhonePreview
          widgets={widgets}
          setWidgets={setWidgets} // Pass the setter for direct deletion
          selectedWidgetId={selectedWidgetId}
          setSelectedWidgetId={setSelectedWidgetId}
          addWidget={addWidget} // Pass addWidget function
          moveWidget={moveWidget} // Pass moveWidget function
        />
      </main>

      {/* Right Panel: Configuration & Theme */}
       {/* Use flex-col to stack ConfigurationPanel and ThemeSelector */}
      <aside className="w-1/4 max-w-sm border-l bg-secondary overflow-y-auto shadow-md z-10 flex flex-col">
         {/* Configuration Panel takes most space */}
        <ConfigurationPanel
          selectedWidget={selectedWidget}
          updateWidgetConfig={updateWidgetConfig}
          className="flex-grow" // Use flex-grow to take available space
        />
         {/* Theme Selector is fixed at the bottom - removed from here, now inside ConfigPanel */}
         {/*
           <div className="mt-auto p-4 border-t border-border">
              <ThemeSelector />
           </div>
         */}
      </aside>
    </div>
  );
}
