// Designed by Mohammad Babaei (adschi.com)
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { WidgetPanel } from '@/components/widget-panel';
import { PhonePreview } from '@/components/phone-preview';
import { ConfigurationPanel } from '@/components/configuration-panel';
import type { DroppedWidget, AllWidgetConfigs } from '@/types/widget';
import { widgetDefaultValuesMap, appTemplateDefaults } from '@/lib/widget-defaults'; // Import templates as well
import { useAuthContext } from '@/context/auth-context'; // Import auth context
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton for loading state

export default function StudioPage() {
  const [widgets, setWidgets] = useState<DroppedWidget[]>([]);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [currentPreviewUrl, setCurrentPreviewUrl] = useState<string>('/'); // State for internal navigation
  const [isLoading, setIsLoading] = useState(true); // Add loading state for initialization

  const { user, loading: authLoading } = useAuthContext(); // Get auth state
  const router = useRouter();

  // --- Authentication Check ---
  useEffect(() => {
      if (!authLoading && !user) {
          console.log("User not authenticated, redirecting to landing page.");
          router.push('/'); // Redirect to landing page if not logged in
      }
  }, [user, authLoading, router]);


  // --- Load initial widgets or from local storage ---
  useEffect(() => {
    // Only proceed if user is authenticated (or auth is still loading)
    if (authLoading) return; // Wait for auth state to resolve
    if (!user) return; // Don't load if user is not authenticated

    let loaded = false;
    if (typeof window !== 'undefined') {
      const savedWidgets = localStorage.getItem('cmsAppStudioWidgets');
      const savedUrl = localStorage.getItem('cmsAppStudioPreviewUrl');

      if (savedWidgets) {
        try {
          const parsedWidgets = JSON.parse(savedWidgets);
          if (Array.isArray(parsedWidgets) && parsedWidgets.length > 0) {
            setWidgets(parsedWidgets);
            const header = parsedWidgets.find((w: DroppedWidget) => w.type === 'header');
            if (header) {
              setSelectedWidgetId(header.id);
            }
             loaded = true; // Mark as loaded from storage
          }
        } catch (e) {
          console.error("Failed to parse widgets from local storage:", e);
           // Fall through to load default template if parsing fails
        }
      }

      if (!loaded) {
           loadTemplate('store'); // Load 'store' template by default if nothing in storage or parsing failed
      }

      if (savedUrl) {
        setCurrentPreviewUrl(savedUrl);
      } else {
        setCurrentPreviewUrl('/');
      }
    } else {
       // Fallback for SSR (though unlikely with 'use client')
       loadTemplate('store');
    }
    setIsLoading(false); // Mark loading as complete

     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]); // Depend on user and authLoading


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


  // --- Save to local storage ---
  useEffect(() => {
    // Only save if user is authenticated and loading is complete
    if (!isLoading && user && typeof window !== 'undefined') {
      localStorage.setItem('cmsAppStudioWidgets', JSON.stringify(widgets));
      localStorage.setItem('cmsAppStudioPreviewUrl', currentPreviewUrl);
    }
  }, [widgets, currentPreviewUrl, isLoading, user]);

  // --- Widget Management Functions ---
  const selectedWidget = widgets.find(w => w.id === selectedWidgetId) || null;

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

  const addWidget = (newWidget: DroppedWidget) => {
    setWidgets((prevWidgets) => [...prevWidgets, newWidget]);
    setSelectedWidgetId(newWidget.id); // Select the newly added widget
    setCurrentPreviewUrl('/'); // Navigate back to home view when adding widget
  };

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


   // --- Render Loading State ---
   if (authLoading || isLoading) {
       return (
         <div className="flex h-screen w-screen overflow-hidden bg-background items-center justify-center">
            <div className="flex items-center space-x-2">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                   <Skeleton className="h-4 w-[250px]" />
                   <Skeleton className="h-4 w-[200px]" />
                 </div>
             </div>
         </div>
       );
     }


   // --- Render Main Studio UI ---
   // Check again in case redirect hasn't happened yet
   if (!user) {
      return null; // Or a placeholder indicating redirection
   }


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
          setSelectedWidgetId={setSelectedWidgetId} // Pass for template loading focus
          currentPreviewUrl={currentPreviewUrl} // Pass for context
          setCurrentPreviewUrl={setCurrentPreviewUrl} // Pass for context
        />
      </aside>
    </div>
  );
}
