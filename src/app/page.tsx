
'use client';

import React, { useState, useEffect } from 'react';
import { WidgetPanel } from '@/components/widget-panel';
import { PhonePreview } from '@/components/phone-preview';
import { ConfigurationPanel } from '@/components/configuration-panel';
import type { DroppedWidget, AllWidgetConfigs } from '@/types/widget';
import { widgetDefaultValuesMap, appTemplateDefaults } from '@/lib/widget-defaults'; // Import templates as well

export default function Home() {
  const [widgets, setWidgets] = useState<DroppedWidget[]>([]);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [currentPreviewUrl, setCurrentPreviewUrl] = useState<string>('/'); // State for internal navigation

  // Load initial widgets from a default template
  useEffect(() => {
     // Load from local storage first, otherwise use template
     if (typeof window !== 'undefined') {
        const savedWidgets = localStorage.getItem('cmsAppStudioWidgets');
        const savedUrl = localStorage.getItem('cmsAppStudioPreviewUrl');

        if (savedWidgets) {
            try {
              const parsedWidgets = JSON.parse(savedWidgets);
              if (Array.isArray(parsedWidgets) && parsedWidgets.length > 0) { // Load only if not empty
                setWidgets(parsedWidgets);
                 // Select header if exists in saved data
                 const header = parsedWidgets.find((w: DroppedWidget) => w.type === 'header');
                 if (header) {
                     setSelectedWidgetId(header.id);
                 }
              } else {
                 // If saved data is empty, load default template
                  loadTemplate('store'); // Load 'store' template by default
              }
            } catch (e) {
              console.error("Failed to parse widgets from local storage, loading default:", e);
               loadTemplate('store');
            }
          } else {
            // No saved widgets, load default template
             loadTemplate('store');
          }

         if (savedUrl) {
             setCurrentPreviewUrl(savedUrl);
         } else {
             setCurrentPreviewUrl('/'); // Default to home if no saved URL
         }

     } else {
        // Fallback for SSR or environments without window (shouldn't happen in 'use client')
         loadTemplate('store');
     }

     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

    // Function to load template and set initial state
   const loadTemplate = (templateName: keyof typeof appTemplateDefaults) => {
        const templateWidgets = appTemplateDefaults[templateName] || [];
        const uniqueTemplateWidgets = templateWidgets.map(w => ({
            ...w,
            id: `${w.type}-${Date.now()}-${Math.random().toString(16).slice(2)}`
        }));
        setWidgets(uniqueTemplateWidgets);
        const header = uniqueTemplateWidgets.find(w => w.type === 'header');
        setSelectedWidgetId(header ? header.id : null);
        setCurrentPreviewUrl('/'); // Reset URL when loading template
   };


  // Save to local storage whenever widgets or URL change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cmsAppStudioWidgets', JSON.stringify(widgets));
      localStorage.setItem('cmsAppStudioPreviewUrl', currentPreviewUrl);
    }
  }, [widgets, currentPreviewUrl]);

  // Find the selected widget configuration
  const selectedWidget = widgets.find(w => w.id === selectedWidgetId) || null;

  // Function to update a specific widget's configuration
  const updateWidgetConfig = (widgetId: string, newConfig: Partial<AllWidgetConfigs>) => {
    console.log(`Updating widget ${widgetId} with config:`, newConfig);
    setWidgets(prevWidgets =>
      prevWidgets.map(widget =>
        widget.id === widgetId
          ? {
              ...widget,
              config: { ...(widget.config || {}), ...newConfig }, // Ensure proper merging
            }
          : widget
      )
    );
    setSelectedWidgetId(widgetId); // Keep selected
  };

  // Function to handle adding a new widget
  const addWidget = (newWidget: DroppedWidget) => {
    setWidgets((prevWidgets) => [...prevWidgets, newWidget]);
    setSelectedWidgetId(newWidget.id); // Select the newly added widget
    setCurrentPreviewUrl('/'); // Navigate back to home view when adding widget
  };

 // Function to handle reordering widgets (excluding header)
  const moveWidget = (draggedId: string, targetId: string) => {
    setWidgets((prevWidgets) => {
        const draggedIndex = prevWidgets.findIndex(w => w.id === draggedId && w.type !== 'header');
        const targetIndex = prevWidgets.findIndex(w => w.id === targetId && w.type !== 'header');

        if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) { return prevWidgets; }

        const newWidgets = [...prevWidgets];
        const [draggedWidget] = newWidgets.splice(draggedIndex, 1);
        const finalTargetIndex = draggedIndex < targetIndex ? targetIndex : targetIndex;
        newWidgets.splice(finalTargetIndex, 0, draggedWidget);

        console.log(`Moved widget ${draggedId} to index ${finalTargetIndex}`);
        return newWidgets;
    });
    setSelectedWidgetId(draggedId); // Keep selected
     setCurrentPreviewUrl('/'); // Ensure we are on home view after reorder
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
          setWidgets={setWidgets} // Pass setter for direct deletion/updates
          selectedWidgetId={selectedWidgetId}
          setSelectedWidgetId={setSelectedWidgetId}
          addWidget={addWidget}
          moveWidget={moveWidget}
          updateWidgetConfig={updateWidgetConfig} // Pass update function
          currentPreviewUrl={currentPreviewUrl} // Pass current URL
          setCurrentPreviewUrl={setCurrentPreviewUrl} // Pass URL setter
        />
      </main>

      {/* Right Panel: Configuration */}
      <aside className="w-1/4 max-w-sm border-l bg-secondary overflow-y-auto shadow-md z-10 flex flex-col">
        <ConfigurationPanel
          selectedWidget={selectedWidget}
          updateWidgetConfig={updateWidgetConfig}
          className="flex-grow"
          widgets={widgets} // Pass all widgets for context
          setWidgets={setWidgets} // Pass for template loading
          setSelectedWidgetId={setSelectedWidgetId} // Pass for template focus reset
          currentPreviewUrl={currentPreviewUrl} // Pass for context
          setCurrentPreviewUrl={setCurrentPreviewUrl} // Pass for context
        />
      </aside>
    </div>
  );
}
