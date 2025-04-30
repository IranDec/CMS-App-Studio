
'use client';

import React, { useState } from 'react';
import { WidgetPanel } from '@/components/widget-panel';
import { PhonePreview } from '@/components/phone-preview';
import { ConfigurationPanel } from '@/components/configuration-panel'; // Import ConfigurationPanel
import type { DroppedWidget } from '@/types/widget'; // Import the type

export default function Home() {
  const [widgets, setWidgets] = useState<DroppedWidget[]>([]);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);

  // Find the selected widget configuration
  const selectedWidget = widgets.find(w => w.id === selectedWidgetId) || null;

  // Function to update a specific widget's configuration
  const updateWidgetConfig = (widgetId: string, newConfig: Partial<DroppedWidget['config']>) => {
    setWidgets(prevWidgets =>
      prevWidgets.map(widget =>
        widget.id === widgetId
          ? {
              ...widget,
              config: { ...widget.config, ...newConfig },
            }
          : widget
      )
    );
  };


  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Left Panel: Widget Selection */}
      <aside className="w-1/4 max-w-xs border-r bg-secondary overflow-y-auto shadow-md z-10">
        <WidgetPanel />
      </aside>

      {/* Center Panel: Phone Preview */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
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

