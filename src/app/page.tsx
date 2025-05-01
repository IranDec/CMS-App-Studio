
'use client';

import React, { useState, useEffect } from 'react';
import { WidgetPanel } from '@/components/widget-panel';
import { PhonePreview } from '@/components/phone-preview';
import { ConfigurationPanel } from '@/components/configuration-panel';
import type { DroppedWidget } from '@/types/widget';

export default function Home() {
  const [widgets, setWidgets] = useState<DroppedWidget[]>([]);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);

  // Load initial widgets or from storage (optional)
  useEffect(() => {
    // Example initial widgets (uncomment for testing)
    /*
    const initialWidgets: DroppedWidget[] = [
      { id: 'banner-1', type: 'banner', name: 'Hero Banner', config: { imageUrl: 'https://picsum.photos/seed/banner1/600/200', altText: 'Mountain Landscape', marginTop: 0, marginBottom: 0, aspectRatio: '16/9' } },
      { id: 'text-1', type: 'text', name: 'Welcome Text', config: { content: 'Build Your Mobile App Visually!', fontSize: 'xl', alignment: 'center', isBold: true, marginTop: 4, marginBottom: 2 } },
      { id: 'grid-1', type: 'grid', name: 'Featured Products', config: { columns: '2', gap: 3, marginTop: 2, marginBottom: 4, itemAspectRatio: '1/1' } },
      { id: 'button-1', type: 'button', name: 'Call to Action', config: { buttonText: 'Get Started', variant: 'primary', alignment: 'center', marginTop: 0, marginBottom: 4, size: 'lg' } },
      { id: 'spacer-1', type: 'spacer', name: 'Spacer', config: { height: 2 } },
      { id: 'list-1', type: 'list', name: 'News Feed', config: { itemLayout: 'image-left', showDividers: true, imageSize: 'sm', marginTop: 2, marginBottom: 2 } },
    ];
    setWidgets(initialWidgets);
    */
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
              config: { ...(widget.config || {}), ...newConfig },
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

  // Function to handle reordering widgets
  const moveWidget = (draggedId: string, targetId: string) => {
    setWidgets((prevWidgets) => {
        const draggedIndex = prevWidgets.findIndex(w => w.id === draggedId);
        const targetIndex = prevWidgets.findIndex(w => w.id === targetId);

        if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) {
            return prevWidgets; // No change needed
        }

        const newWidgets = [...prevWidgets];
        const [draggedWidget] = newWidgets.splice(draggedIndex, 1); // Remove dragged item

        // Insert dragged item at the target index
        // Note: If dragging down, the targetIndex remains correct after splice.
        // If dragging up, the targetIndex needs adjustment if it was after the dragged item.
        // However, inserting at targetIndex works for both cases here.
        newWidgets.splice(targetIndex, 0, draggedWidget);


        console.log(`Moved widget ${draggedId} to position ${targetIndex}`);
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
      <aside className="w-1/4 max-w-sm border-l bg-secondary overflow-y-auto shadow-md z-10 flex flex-col">
         {/* Configuration Panel takes remaining space */}
        <ConfigurationPanel
          selectedWidget={selectedWidget}
          updateWidgetConfig={updateWidgetConfig}
          className="flex-1 overflow-y-auto" // Ensure it scrolls independently
        />
      </aside>
    </div>
  );
}
