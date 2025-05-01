
'use client';

import React, { useState, useEffect } from 'react';
import { WidgetPanel } from '@/components/widget-panel';
import { PhonePreview } from '@/components/phone-preview';
import { ConfigurationPanel } from '@/components/configuration-panel'; // Import ConfigurationPanel
import type { DroppedWidget } from '@/types/widget'; // Import the type

export default function Home() {
  const [widgets, setWidgets] = useState<DroppedWidget[]>([]);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);

  // Add initial test widgets for easier debugging (can be removed later)
  useEffect(() => {
    // Comment out or remove this block for a clean start
    /*
    const initialWidgets: DroppedWidget[] = [
      { id: 'banner-1', type: 'banner', name: 'Banner Image', config: { imageUrl: 'https://picsum.photos/seed/banner1/600/200', altText: 'Test Banner 1', marginTop: 2, marginBottom: 4 } },
      { id: 'text-1', type: 'text', name: 'Text Block', config: { content: 'Welcome to the App Builder!', fontSize: 'lg', alignment: 'center', isBold: true, marginTop: 4, marginBottom: 4 } },
      { id: 'button-1', type: 'button', name: 'Button', config: { buttonText: 'Learn More', variant: 'primary', alignment: 'center', marginTop: 0, marginBottom: 4 } },
       { id: 'grid-1', type: 'grid', name: 'Product Grid', config: { columns: '2', gap: 4, marginTop: 4, marginBottom: 2 } },
    ];
    setWidgets(initialWidgets);
    */
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
              // Merge existing config with new partial config
              config: { ...(widget.config || {}), ...newConfig },
            }
          : widget
      )
    );
     // Keep the current widget selected after update
    setSelectedWidgetId(widgetId);
  };


  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Left Panel: Widget Selection */}
      <aside className="w-1/4 max-w-xs border-r bg-secondary overflow-y-auto shadow-md z-10">
        <WidgetPanel />
      </aside>

      {/* Center Panel: Phone Preview */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8 bg-muted/30"> {/* Added subtle background */}
        <PhonePreview
          widgets={widgets}
          setWidgets={setWidgets}
          selectedWidgetId={selectedWidgetId}
          setSelectedWidgetId={setSelectedWidgetId}
        />
      </main>

      {/* Right Panel: Configuration */}
      <aside className="w-1/4 max-w-sm border-l bg-secondary overflow-y-auto shadow-md z-10">
        <ConfigurationPanel
          selectedWidget={selectedWidget}
          updateWidgetConfig={updateWidgetConfig}
        />
      </aside>
    </div>
  );
}
