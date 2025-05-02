// Designed by Mohammad Babaei (adschi.com)
 'use client';

 import React, { useEffect, useState, useCallback } from 'react';
 import { zodResolver } from '@hookform/resolvers/zod';
 import { useForm, Controller, useFieldArray } from 'react-hook-form';
 import { z } from 'zod';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Button, buttonVariants } from '@/components/ui/button'; // Import buttonVariants
 import { Textarea } from '@/components/ui/textarea';
 import { Checkbox } from '@/components/ui/checkbox';
 import { Slider } from '@/components/ui/slider';
 import {
     Select,
     SelectContent,
     SelectItem,
     SelectTrigger,
     SelectValue,
 } from '@/components/ui/select';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Separator } from '@/components/ui/separator'; // Import Separator
 import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'; // Import Accordion
 import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'; // Import Tooltip
 import type { DroppedWidget, AllWidgetConfigs, CarouselItem, TextConfig, BannerConfig } from '@/types/widget'; // Import AllWidgetConfigs
 import { widgetDefaultValuesMap } from '@/lib/widget-defaults'; // Import defaults
 import { cn } from '@/lib/utils'; // Import cn utility
 import { ThemeSelector } from './theme-selector'; // Import ThemeSelector
 import { FileImage, X, Plus, GripVertical, Wand2, Text, Eye, EyeOff, ChevronRight, Loader2, Lightbulb, UploadCloud, Camera, Bell } from 'lucide-react'; // Import icons (Removed Css3, added Loader2, Lightbulb, Camera, Bell)
 import { Css3 } from '@/components/ui/css3'; // Import custom Css3 icon
 import { appTemplateDefaults } from '@/lib/widget-defaults'; // Import templates
 import {
     Dialog,
     DialogContent,
     DialogDescription,
     DialogFooter,
     DialogHeader,
     DialogTitle,
     DialogTrigger,
     DialogClose,
   } from "@/components/ui/dialog" // Import Dialog
 import { useToast } from '@/hooks/use-toast'; // Import useToast
 import { generateWidgetContent } from '@/ai/flows/generate-content-flow'; // Import AI flow
 import { suggestWidgetLayout } from '@/ai/flows/suggest-layout-flow'; // Import AI layout flow


 interface ConfigurationPanelProps {
   selectedWidget: DroppedWidget | null;
   updateWidgetConfig: (widgetId: string, newConfig: Partial<AllWidgetConfigs>) => void;
   className?: string;
   widgets: DroppedWidget[]; // Pass all widgets for context if needed (e.g., AI)
   setWidgets: React.Dispatch<React.SetStateAction<DroppedWidget[]>>; // For template loading and AI layout
   setSelectedWidgetId: React.Dispatch<React.SetStateAction<string | null>>; // For template loading focus
   currentPreviewUrl: string;
   setCurrentPreviewUrl: (url: string) => void;
 }

 // --- Define Zod schemas for each widget type ---

 // Base schema for common properties (margins, animation, condition, css)
 const BaseWidgetSchema = z.object({
     marginTop: z.number().min(0).max(20).default(2).describe("Margin top (spacing units)"),
     marginBottom: z.number().min(0).max(20).default(2).describe("Margin bottom (spacing units)"),
     animation: z.enum(['none', 'fadeIn', 'slideInUp', 'slideInLeft', 'zoomIn']).default('none').describe("Entrance animation"),
     displayCondition: z.enum(['always', 'loggedIn', 'loggedOut']).default('always').describe("When to show this widget"),
     customCssClasses: z.string().optional().describe("Custom Tailwind CSS classes (advanced)"),
 });

 // Header (No BaseWidgetSchema margins/animation usually)
 const HeaderConfigSchema = z.object({
     type: z.literal('header'),
     title: z.string().default('App Name').describe("Text displayed in the header title"),
     showBackButton: z.boolean().default(false).describe("Show a back arrow button"),
     showMenuButton: z.boolean().default(true).describe("Show a menu button (for sidebar)"),
     showCartIcon: z.boolean().default(true).describe("Show a shopping cart icon"),
     showAuthButton: z.boolean().default(true).describe("Show a login/user button"),
     authButtonText: z.string().default('Login').describe("Text for the login/user button"),
      // Keep optional fields for schema merging consistency, although not directly used by BaseWidgetSchema defaults
      marginTop: z.number().optional(), marginBottom: z.number().optional(),
      animation: z.string().optional(), displayCondition: z.string().optional(), customCssClasses: z.string().optional(),
 });

 // Banner
 const BannerConfigSchema = BaseWidgetSchema.extend({
     type: z.literal('banner'),
     imageUrl: z.string().url({ message: "Must be a valid URL" }).optional().or(z.literal('')).describe("URL of the banner image"),
     altText: z.string().optional().describe("Alternative text for accessibility"),
     linkUrl: z.string().url({ message: "Must be a valid URL" }).optional().or(z.literal('')).describe("Optional URL to link the banner"),
     imageFit: z.enum(['cover', 'contain']).default('cover').describe("How the image should fit"),
     aspectRatio: z.enum(['16/9', '4/3', '1/1', '21/9', 'auto']).default('16/9').describe("Aspect ratio of the banner"),
     aiPrompt: z.string().optional().describe("AI prompt for alt text or image search"), // AI field
     imageUploadEnabled: z.boolean().default(true).describe("Enable direct image upload"), // Enable upload by default
 });

 // Grid
 const GridConfigSchema = BaseWidgetSchema.extend({
     type: z.literal('grid'),
     columns: z.enum(['1', '2', '3', '4']).default('2').describe("Number of columns"),
     gap: z.number().min(0).max(10).default(4).describe("Gap between items (spacing units)"),
     dataSource: z.string().optional().describe("API Endpoint or identifier for data"),
     itemAspectRatio: z.enum(['1/1', '4/3', '3/4', '16/9']).default('1/1').describe("Aspect ratio for each item"),
 });

 // List
 const ListConfigSchema = BaseWidgetSchema.extend({
     type: z.literal('list'),
     itemLayout: z.enum(['simple', 'detailed', 'image-left', 'image-right']).default('simple').describe("Layout style for list items"),
     showDividers: z.boolean().default(true).describe("Show lines between items"),
     dataSource: z.string().optional().describe("API Endpoint or identifier for data"),
     imageSize: z.enum(['sm', 'md', 'lg']).default('md').describe("Size of images in image layouts"),
 });

 // Form
 const FormConfigSchema = BaseWidgetSchema.extend({
     type: z.literal('form'),
     submitButtonText: z.string().default('Submit').describe("Text on the submit button"),
     recipientEmail: z.string().email({ message: "Invalid email address" }).optional().or(z.literal('')).describe("Email to send submissions"),
     successMessage: z.string().default('Thank you!').describe("Message after submission"),
     // TODO: Define form fields structure
 });

 // Text Block
 const TextConfigSchema = BaseWidgetSchema.extend({
     type: z.literal('text'),
     content: z.string().default('Enter your text...').describe("The text content"),
     fontSize: z.enum(['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl']).default('base').describe("Font size"),
     alignment: z.enum(['left', 'center', 'right', 'justify']).default('left').describe("Text alignment"),
     isBold: z.boolean().default(false).describe("Make text bold"),
     isItalic: z.boolean().default(false).describe("Make text italic"),
     textColor: z.enum(['default', 'primary', 'secondary', 'accent', 'muted']).default('default').describe("Text color (theme-based)"),
     aiPrompt: z.string().optional().describe("AI prompt to generate text content"), // AI field
     enableRichText: z.boolean().default(false).describe("Enable rich text editor (future)"), // Rich text flag
 });

 // Button
 const ButtonConfigSchema = BaseWidgetSchema.extend({
     type: z.literal('button'),
     buttonText: z.string().default('Click Me').describe("Text on the button"),
     linkUrl: z.string().url({ message: "Must be a valid URL" }).optional().or(z.literal('')).describe("URL the button links to"),
     variant: z.enum(['default', 'destructive', 'outline', 'secondary', 'ghost', 'link']).default('default').describe("Visual style"),
     size: z.enum(['default', 'sm', 'lg', 'icon']).default('default').describe("Button size"),
     alignment: z.enum(['left', 'center', 'right', 'full']).default('center').describe("Horizontal alignment / full width"),
 });

 // Spacer (Override base schema margins)
 const SpacerConfigSchema = BaseWidgetSchema.extend({
     type: z.literal('spacer'),
     height: z.number().min(1).max(40).default(4).describe("Vertical space (spacing units)"),
 }).omit({ marginTop: true, marginBottom: true }).extend({ // Omit base margins...
      marginTop: z.number().min(0).max(20).default(0).optional(), // ...and add them back as optional with default 0
      marginBottom: z.number().min(0).max(20).default(0).optional(),
 });


 // Map
 const MapConfigSchema = BaseWidgetSchema.extend({
     type: z.literal('map'),
     address: z.string().default('1600 Amphitheatre Parkway, Mountain View, CA').describe("Address or location"),
     zoomLevel: z.number().min(1).max(20).default(15).describe("Initial map zoom level"),
     showMarker: z.boolean().default(true).describe("Display a marker"),
     mapStyle: z.enum(['roadmap', 'satellite', 'hybrid', 'terrain']).default('roadmap').describe("Map visual style"),
     useCurrentLocation: z.boolean().default(false).describe("Attempt to use device location"), // Geolocation flag
 });

 // Video
 const VideoConfigSchema = BaseWidgetSchema.extend({
     type: z.literal('video'),
     videoUrl: z.string().url({ message: "Must be a valid video URL" }).optional().or(z.literal('')).describe("URL of the video (e.g., YouTube, Vimeo)"),
     aspectRatio: z.enum(['16/9', '4/3', '1/1', '9/16', 'auto']).default('16/9').describe("Video player aspect ratio"),
     autoplay: z.boolean().default(false).describe("Autoplay video (use with caution)"),
     showControls: z.boolean().default(true).describe("Show video player controls"),
 });

 // Carousel Item Schema (for array)
 const CarouselItemSchema = z.object({
     id: z.string(), // Unique ID for the item within the carousel
     imageUrl: z.string().url({ message: "Must be a valid URL" }).optional().or(z.literal('')).describe("Image URL for the slide"),
     altText: z.string().optional().describe("Alt text for the slide image"),
     linkUrl: z.string().url({ message: "Must be a valid URL" }).optional().or(z.literal('')).describe("Optional link for the slide"),
     // Add upload flag for individual items if needed
     imageUploadEnabled: z.boolean().default(true).describe("Enable image upload for this slide"),
 });

 // Carousel
 const CarouselConfigSchema = BaseWidgetSchema.extend({
     type: z.literal('carousel'),
     items: z.array(CarouselItemSchema).default([]).describe("Slides in the carousel"),
     autoplay: z.boolean().default(false).describe("Automatically cycle slides"),
     delay: z.number().min(1000).default(3000).describe("Delay between slides (ms)"),
     showArrows: z.boolean().default(true).describe("Show next/previous arrows"),
     showDots: z.boolean().default(true).describe("Show dot indicators"),
     aspectRatio: z.enum(['16/9', '4/3', '1/1', '21/9', 'auto']).default('16/9').describe("Carousel aspect ratio"),
 });

 // Audio
 const AudioConfigSchema = BaseWidgetSchema.extend({
     type: z.literal('audio'),
     audioUrl: z.string().url({ message: "Must be a valid audio URL" }).optional().or(z.literal('')).describe("URL of the audio file"),
     autoplay: z.boolean().default(false).describe("Autoplay audio (use with caution)"),
     showControls: z.boolean().default(true).describe("Show audio player controls"),
     loop: z.boolean().default(false).describe("Loop audio playback"),
 });

 // Countdown
 const CountdownConfigSchema = BaseWidgetSchema.extend({
     type: z.literal('countdown'),
     // Use string for targetDate in form, convert to Date object on use
     targetDate: z.string().datetime({ message: "Invalid date/time format" }).default(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()).describe("Target date and time (YYYY-MM-DDTHH:mm)"),
     expiredMessage: z.string().default('Event has started!').describe("Message when timer expires"),
     labelDays: z.string().default('Days').describe("Label for days"),
     labelHours: z.string().default('Hours').describe("Label for hours"),
     labelMinutes: z.string().default('Mins').describe("Label for minutes"),
     labelSeconds: z.string().default('Secs').describe("Label for seconds"),
     displayStyle: z.enum(['blocks', 'inline']).default('blocks').describe("Timer display style"),
 });

 // Social Feed
 const SocialFeedConfigSchema = BaseWidgetSchema.extend({
     type: z.literal('social'),
     platform: z.enum(['twitter', 'instagram', 'facebook', 'linkedin']).default('twitter').describe("Social media platform"),
     profileUrlOrHandle: z.string().optional().describe("Profile URL or username/handle"),
     numberOfPosts: z.number().min(1).max(20).default(5).describe("Number of posts to attempt showing"),
     layout: z.enum(['grid', 'list']).default('list').describe("Layout for embedded feed (if supported)"),
 });

 // Divider
 const DividerConfigSchema = BaseWidgetSchema.extend({
     type: z.literal('divider'),
     style: z.enum(['solid', 'dashed', 'dotted']).default('solid').describe("Line style"),
     thickness: z.number().min(1).max(10).default(1).describe("Line thickness (px)"),
     color: z.enum(['border', 'primary', 'accent']).default('border').describe("Line color (theme-based)"),
     // Override base margins if needed, though often controlled by adjacent elements
 });

 // --- NEW WIDGET SCHEMAS ---
 const CameraConfigSchema = BaseWidgetSchema.extend({
     type: z.literal('camera'),
     // Add any camera-specific settings if needed, e.g., default facing mode
     facingMode: z.enum(['user', 'environment']).default('environment').describe("Default camera (front or back)"),
     captureButtonText: z.string().default('Capture').describe("Text for the capture button"),
 });

 const PushNotificationConfigSchema = BaseWidgetSchema.extend({
     type: z.literal('pushNotification'),
     // Configuration for setting up push notifications (placeholders)
     serverKey: z.string().optional().describe("Firebase Server Key (or similar)"),
     senderId: z.string().optional().describe("Firebase Sender ID (or similar)"),
     optInPromptText: z.string().default('Enable notifications?').describe("Text for the opt-in prompt"),
 });


 // --- Union type for validation ---
 const AnyWidgetConfigSchema = z.union([
     HeaderConfigSchema, BannerConfigSchema, GridConfigSchema, ListConfigSchema,
     FormConfigSchema, TextConfigSchema, ButtonConfigSchema, SpacerConfigSchema,
     MapConfigSchema, VideoConfigSchema, CarouselConfigSchema, AudioConfigSchema,
     CountdownConfigSchema, SocialFeedConfigSchema, DividerConfigSchema,
     CameraConfigSchema, PushNotificationConfigSchema, // Add new schemas
     // Add schemas for future widgets here
 ]);


 // --- Configuration Panel Component ---

 export function ConfigurationPanel({
     selectedWidget,
     updateWidgetConfig,
     className,
     widgets,
     setWidgets,
     setSelectedWidgetId,
     currentPreviewUrl,
     setCurrentPreviewUrl,
  }: ConfigurationPanelProps) {
     const [activeAccordionItem, setActiveAccordionItem] = useState<string>("specific-settings");
     const [isGeneratingContent, setIsGeneratingContent] = useState(false); // State for AI content generation loading
     const [isSuggestingLayout, setIsSuggestingLayout] = useState(false); // State for AI layout suggestion loading
     const fileInputRef = useRef<HTMLInputElement>(null); // Ref for hidden file input (used by multiple places now)
     const [widgetIdForUpload, setWidgetIdForUpload] = useState<string | null>(null); // Track which widget triggers upload
     const [carouselItemIndexForUpload, setCarouselItemIndexForUpload] = useState<number | null>(null); // Track which carousel item


     const { toast } = useToast(); // Initialize toast hook

     // Determine the correct schema based on the selected widget type
     const getSchemaForType = (type: string | undefined) => {
         if (!type) return BaseWidgetSchema; // Fallback or schema for "no selection"
         switch (type) {
             case 'header': return HeaderConfigSchema;
             case 'banner': return BannerConfigSchema;
             case 'grid': return GridConfigSchema;
             case 'list': return ListConfigSchema;
             case 'form': return FormConfigSchema;
             case 'text': return TextConfigSchema;
             case 'button': return ButtonConfigSchema;
             case 'spacer': return SpacerConfigSchema;
             case 'map': return MapConfigSchema;
             case 'video': return VideoConfigSchema;
             case 'carousel': return CarouselConfigSchema;
             case 'audio': return AudioConfigSchema;
             case 'countdown': return CountdownConfigSchema;
             case 'social': return SocialFeedConfigSchema;
             case 'divider': return DividerConfigSchema;
             case 'camera': return CameraConfigSchema;
             case 'pushNotification': return PushNotificationConfigSchema;
             default: return BaseWidgetSchema; // Fallback for unknown types
         }
     };

     const currentSchema = getSchemaForType(selectedWidget?.type);
     const currentDefaults = selectedWidget ? widgetDefaultValuesMap[selectedWidget.type as keyof typeof widgetDefaultValuesMap] : {};

     const form = useForm({
         resolver: zodResolver(currentSchema),
         defaultValues: selectedWidget?.config || currentDefaults,
         mode: 'onBlur', // Keep onBlur for explicit submissions on text fields etc.
     });

     // Hook for managing carousel items array
      const { fields: carouselItems, append: appendCarouselItem, remove: removeCarouselItem, move: moveCarouselItem } = useFieldArray({
         control: form.control,
         name: "items" as any, // Cast as any because 'items' only exists on CarouselConfigSchema
         keyName: "arrayId", // Use a different key name than the default 'id'
      });


      // Reset form when selected widget changes or config updates externally
      useEffect(() => {
         if (selectedWidget) {
             const defaultsForType = widgetDefaultValuesMap[selectedWidget.type as keyof typeof widgetDefaultValuesMap] || {};
             const mergedConfig = { ...defaultsForType, ...(selectedWidget.config || {}) };
             console.log("Resetting form with config:", mergedConfig);
             form.reset(mergedConfig);
              // Ensure accordion is open for the specific settings
              setActiveAccordionItem("specific-settings");
         } else {
             form.reset({});
             setActiveAccordionItem(""); // Collapse accordion if no widget selected
         }
      }, [selectedWidget, form]);


     // --- Handle Form Submission (on blur or specific interactions) ---
      const handleBlurUpdate = (fieldName: string) => async () => {
          if (!selectedWidget) return;
          // Trigger validation for the specific field first
          const fieldResult = await form.trigger(fieldName as any);
          if (!fieldResult) {
              console.log(`Validation failed on blur for ${fieldName}:`, form.formState.errors);
              // Optionally show toast or specific error message near the field
              return; // Stop if the blurred field is invalid
          }

           // If blurred field is valid, try validating the whole form silently
           // This ensures dependent fields or complex rules are also checked.
          const fullResult = await form.trigger();
          if (fullResult) {
               const data = form.getValues();
               console.log(`Updating widget config (on blur: ${fieldName}, validated):`, selectedWidget.id, data);
               updateWidgetConfig(selectedWidget.id, data);
           } else {
               // If full validation fails after a single field was valid, it indicates
               // an issue elsewhere in the form. Log it but maybe don't block the update
               // based on the single field (or decide based on strictness needed).
               console.warn(`Full validation failed after ${fieldName} blur, but field was valid. Check other errors:`, form.formState.errors);
               // Decide if you still want to update with partial data (use form.getValues(fieldName))
               // or block until the whole form is valid. For now, let's update with full data if the specific field passed.
               const data = form.getValues(); // Get potentially partially invalid data
               updateWidgetConfig(selectedWidget.id, data); // Update cautiously
           }
      };

     // --- Watch form changes and auto-submit for controls like sliders, checkboxes, selects ---
     useEffect(() => {
         const subscription = form.watch((value, { name, type }) => {
              const instantUpdateFields = [
                 // Base fields (Numbers/Enums/Booleans)
                 'marginTop', 'marginBottom', 'gap', 'height', 'zoomLevel', 'thickness', 'numberOfPosts', 'delay',
                 'animation', 'displayCondition', 'imageFit', 'aspectRatio', 'imageUploadEnabled',
                 'columns', 'itemAspectRatio', 'itemLayout', 'showDividers', 'imageSize',
                 'fontSize', 'alignment', 'textColor', 'isBold', 'isItalic', 'enableRichText',
                 'variant', 'size', // Renamed 'alignment' for button below
                 'showMarker', 'mapStyle', 'useCurrentLocation',
                 // Field names with widget type prefixes for clarity
                 'bannerImageUploadEnabled',
                 'videoAutoplay', 'showControls',
                 'carouselAutoplay', 'showArrows', 'showDots', 'carouselAspectRatio',
                 'audioAutoplay', 'audioShowControls', 'loop',
                 'countdownDisplayStyle', 'socialPlatform', 'socialLayout',
                 'dividerStyle', 'dividerColor',
                 'cameraFacingMode',
                 'buttonAlignment', // Ensure this is the correct field name for button alignment

                 // Header specific booleans
                 'showBackButton', 'showMenuButton', 'showCartIcon', 'showAuthButton',
             ];

             // Check if the changed field is one that should trigger instant update
              // or if it's part of the carousel items array
             if (name && (instantUpdateFields.includes(name) || name.startsWith("items["))) {
                  if (selectedWidget && currentSchema) {
                      // Use safeParseAsync for non-blocking validation
                      currentSchema.safeParseAsync(form.getValues())
                          .then(result => {
                              if (result.success) {
                                  // Only update if the ENTIRE form is valid according to the current schema
                                  console.log(`Updating widget config (instant: ${name}, validated):`, selectedWidget.id, result.data);
                                  updateWidgetConfig(selectedWidget.id, result.data);
                              } else {
                                  // Log validation errors but don't update if the form is invalid
                                  // This prevents sending inconsistent data during rapid changes (like slider drag)
                                  console.warn(`Instant update validation failed for ${name}:`, result.error.flatten().fieldErrors);
                                  // Optionally: Show a subtle indicator that the form has errors
                              }
                          });
                  }
             }
         });
         return () => subscription.unsubscribe();
          // Ensure dependencies cover all necessary values
      }, [form, selectedWidget, updateWidgetConfig, currentSchema]); // Added currentSchema


      // --- AI Content Generation Handler ---
     const handleGenerateContent = useCallback(async () => {
        if (!selectedWidget || (selectedWidget.type !== 'text' && selectedWidget.type !== 'banner')) {
             toast({ title: 'Cannot Generate', description: 'AI content generation is only available for Text and Banner widgets currently.', variant: 'destructive'});
             return;
        }

         const currentConfig = form.getValues();
         const promptValue = currentConfig.aiPrompt; // Get prompt from form state

         if (!promptValue) {
             toast({ title: 'Missing Prompt', description: 'Please enter a prompt for the AI.', variant: 'destructive'});
             return;
        }

        setIsGeneratingContent(true);
        try {
             const result = await generateWidgetContent({
                 widgetType: selectedWidget.type,
                 prompt: promptValue,
                 existingContent: selectedWidget.type === 'text' ? (currentConfig as TextConfig).content : (currentConfig as BannerConfig).altText,
             });

             if (result && result.generatedContent) {
                // Update the relevant field in the form state
                 if (selectedWidget.type === 'text') {
                     form.setValue('content', result.generatedContent);
                 } else if (selectedWidget.type === 'banner') {
                    form.setValue('altText', result.generatedContent);
                 }
                 // Trigger an update to the main state after setting form value
                 // Use a slight delay to ensure form state is updated before triggering main update
                 setTimeout(() => {
                     updateWidgetConfig(selectedWidget!.id, form.getValues());
                 }, 50);

                toast({ title: 'Content Generated!', description: 'AI has updated the content.' });
             } else {
                throw new Error('No content generated.');
             }
        } catch (error) {
             console.error("AI content generation failed:", error);
             toast({ title: 'Generation Failed', description: 'Could not generate content. Please try again.', variant: 'destructive'});
        } finally {
            setIsGeneratingContent(false);
        }
     }, [selectedWidget, form, updateWidgetConfig, toast]); // Add dependencies


     // --- AI Layout Suggestion Handler ---
     const handleSuggestLayout = useCallback(async (appType: 'blog' | 'store' | 'portfolio' | 'event' | 'other') => {
         setIsSuggestingLayout(true);
         try {
             const existingWidgetSummary = widgets.map(w => ({ type: w.type, id: w.id }));
             const result = await suggestWidgetLayout({
                 appType: appType,
                 existingWidgets: existingWidgetSummary,
             });

             if (result && result.suggestedLayout && result.suggestedLayout.length > 0) {
                 // Convert suggested layout to DroppedWidget structure
                 const newWidgets: DroppedWidget[] = result.suggestedLayout.map((suggestion, index) => {
                    const defaultConfig = widgetDefaultValuesMap[suggestion.type as keyof typeof widgetDefaultValuesMap] || {};
                     return {
                         id: `${suggestion.type}-${Date.now()}-${index}-${Math.random().toString(16).slice(2)}`,
                         type: suggestion.type,
                         name: suggestion.name,
                         config: { ...defaultConfig } as AllWidgetConfigs,
                     };
                 });

                 // Replace current widgets with the suggestion
                 setWidgets(newWidgets);
                 setSelectedWidgetId(null); // Deselect any widget
                 setCurrentPreviewUrl('/'); // Reset preview
                 toast({ title: 'Layout Suggested!', description: `AI suggested a new layout for a ${appType} app. ${result.reasoning || ''}` });
             } else {
                 throw new Error('No layout suggested.');
             }
         } catch (error) {
             console.error("AI layout suggestion failed:", error);
             toast({ title: 'Suggestion Failed', description: 'Could not suggest a layout. Please try again.', variant: 'destructive' });
         } finally {
             setIsSuggestingLayout(false);
         }
     }, [widgets, setWidgets, setSelectedWidgetId, setCurrentPreviewUrl, toast]); // Dependencies


    // --- Image Upload Handlers ---
    const handleImageUploadClick = (widgetId: string, itemIndex: number | null = null) => {
        setWidgetIdForUpload(widgetId);
        setCarouselItemIndexForUpload(itemIndex); // Store item index if applicable
        fileInputRef.current?.click();
    };

     const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!widgetIdForUpload || !event.target.files || event.target.files.length === 0) {
            return;
        }
        const file = event.target.files[0];
        if (!file.type.startsWith('image/')) {
            toast({ variant: 'destructive', title: 'Upload Failed', description: 'Please select an image file.' });
            return;
        }
        const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSizeInBytes) {
             toast({ variant: 'destructive', title: 'Upload Failed', description: `Image size exceeds ${maxSizeInBytes / 1024 / 1024}MB limit.` });
             return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUrl = reader.result as string;
             const widget = widgets.find(w => w.id === widgetIdForUpload); // Find widget from main state
             if (!widget) return; // Should not happen

             if (widget.type === 'banner') {
                form.setValue('imageUrl', dataUrl); // Update form directly
             } else if (widget.type === 'carousel' && carouselItemIndexForUpload !== null) {
                 // Update the specific item in the form's array field
                form.setValue(`items.${carouselItemIndexForUpload}.imageUrl`, dataUrl);
             } else {
                  toast({ variant: 'destructive', title: 'Upload Error', description: 'Cannot upload image for this widget type or item.' });
             }

            // Trigger main state update after setting form value
             setTimeout(() => {
                 updateWidgetConfig(widgetIdForUpload, form.getValues());
                 toast({ title: 'Image Uploaded', description: `Updated image for ${widget.name}.` });
             }, 50);

            setWidgetIdForUpload(null);
            setCarouselItemIndexForUpload(null);
            if (event.target) event.target.value = '';
        };
        reader.onerror = () => {
            toast({ variant: 'destructive', title: 'Upload Error', description: 'Failed to read the image file.' });
            setWidgetIdForUpload(null);
            setCarouselItemIndexForUpload(null);
            if (event.target) event.target.value = '';
        };
        reader.readAsDataURL(file);
    };


    // --- Render Helper for Common Fields ---
    const renderCommonFields = (omitFields: string[] = []) => (
        <Accordion type="single" collapsible defaultValue="common-settings" className="w-full">
            <AccordionItem value="common-settings">
                 <AccordionTrigger className="text-sm font-medium px-2 hover:no-underline">Layout & Display</AccordionTrigger>
                 <AccordionContent className="pt-2 space-y-3 px-2">
                     {/* Margins */}
                    {!omitFields.includes('margins') && (
                         <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                            <div className="space-y-2">
                                <Label htmlFor="marginTop" className="text-xs">Margin Top ({form.watch('marginTop') ?? 2})</Label>
                                <Controller name="marginTop" control={form.control} defaultValue={2}
                                    render={({ field }) => ( <Slider id="marginTop" min={0} max={20} step={1} value={[field.value ?? 2]} onValueChange={(value) => field.onChange(value[0])} aria-label="Margin Top" /> )} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="marginBottom" className="text-xs">Margin Bottom ({form.watch('marginBottom') ?? 2})</Label>
                                <Controller name="marginBottom" control={form.control} defaultValue={2}
                                    render={({ field }) => ( <Slider id="marginBottom" min={0} max={20} step={1} value={[field.value ?? 2]} onValueChange={(value) => field.onChange(value[0])} aria-label="Margin Bottom" /> )} />
                            </div>
                        </div>
                    )}
                     {/* Animation */}
                     {!omitFields.includes('animation') && (
                         <div className="space-y-2">
                             <Label htmlFor="animation" className="text-xs">Animation</Label>
                             <Controller name="animation" control={form.control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value ?? 'none'}>
                                        <SelectTrigger id="animation" className="h-9"><SelectValue placeholder="Select animation" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            <SelectItem value="fadeIn">Fade In</SelectItem>
                                            <SelectItem value="slideInUp">Slide In Up</SelectItem>
                                            <SelectItem value="slideInLeft">Slide In Left</SelectItem>
                                            <SelectItem value="zoomIn">Zoom In</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )} />
                         </div>
                    )}
                     {/* Display Condition */}
                     {!omitFields.includes('displayCondition') && (
                         <div className="space-y-2">
                            <Label htmlFor="displayCondition" className="text-xs flex items-center gap-1">
                                <TooltipProvider delayDuration={100}>
                                     <Tooltip>
                                        <TooltipTrigger asChild>
                                             <Eye className="h-3 w-3" />
                                        </TooltipTrigger>
                                         <TooltipContent side="top" align="start">
                                             <p className="text-xs max-w-[200px]">Control visibility based on user login status.</p>
                                         </TooltipContent>
                                     </Tooltip>
                                </TooltipProvider>
                                Display Condition
                            </Label>
                             <Controller name="displayCondition" control={form.control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value ?? 'always'}>
                                        <SelectTrigger id="displayCondition" className="h-9"><SelectValue placeholder="Select condition" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="always">Always Show</SelectItem>
                                            <SelectItem value="loggedIn">Only Logged In Users</SelectItem>
                                            <SelectItem value="loggedOut">Only Logged Out Users</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )} />
                         </div>
                     )}
                     {/* Custom CSS */}
                      {!omitFields.includes('customCssClasses') && (
                          <div className="space-y-2">
                             <Label htmlFor="customCssClasses" className="text-xs flex items-center gap-1">
                                <TooltipProvider delayDuration={100}>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                              <Css3 className="h-3 w-3" />
                                         </TooltipTrigger>
                                          <TooltipContent side="top" align="start">
                                              <p className="text-xs max-w-[200px]">Apply custom Tailwind classes (e.g., 'bg-red-100 border-red-500'). Use with caution.</p>
                                          </TooltipContent>
                                      </Tooltip>
                                 </TooltipProvider>
                                Custom CSS Classes (Advanced)
                            </Label>
                              <Controller
                                name="customCssClasses"
                                control={form.control}
                                render={({ field }) => <Input id="customCssClasses" className="h-9 text-xs font-mono" placeholder="e.g., rotate-3 hover:scale-105" {...field} onBlur={handleBlurUpdate('customCssClasses')} />}
                            />
                          </div>
                      )}
                 </AccordionContent>
            </AccordionItem>
        </Accordion>
    );


     // --- Render Specific Fields Based on Widget Type ---
     const renderSpecificFields = () => {
         if (!selectedWidget) return null;
         const errors = form.formState.errors;

         switch (selectedWidget.type) {
             case 'header':
                const headerErrors = errors as typeof HeaderConfigSchema._input; // Type assertion
                 return (
                     <>
                         <div className="space-y-2"> <Label htmlFor="title">Header Title</Label> <Controller name="title" control={form.control} render={({ field }) => <Input id="title" {...field} onBlur={handleBlurUpdate('title')} />} /> {headerErrors?.title && <p className="text-sm text-destructive">{headerErrors.title.message}</p>} </div>
                         <Separator className="my-3" />
                         <h4 className="text-sm font-medium mb-2">Button Visibility</h4>
                         <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                             <div className="flex items-center space-x-2"> <Controller name="showBackButton" control={form.control} render={({ field }) => <Checkbox id="showBackButton" checked={field.value ?? false} onCheckedChange={field.onChange} />} /> <Label htmlFor="showBackButton" className="text-sm">Back Button</Label> </div>
                             <div className="flex items-center space-x-2"> <Controller name="showMenuButton" control={form.control} render={({ field }) => <Checkbox id="showMenuButton" checked={field.value ?? true} onCheckedChange={field.onChange} />} /> <Label htmlFor="showMenuButton" className="text-sm">Menu Button</Label> </div>
                             <div className="flex items-center space-x-2"> <Controller name="showCartIcon" control={form.control} render={({ field }) => <Checkbox id="showCartIcon" checked={field.value ?? true} onCheckedChange={field.onChange} />} /> <Label htmlFor="showCartIcon" className="text-sm">Cart Icon</Label> </div>
                             <div className="flex items-center space-x-2"> <Controller name="showAuthButton" control={form.control} render={({ field }) => <Checkbox id="showAuthButton" checked={field.value ?? true} onCheckedChange={field.onChange} />} /> <Label htmlFor="showAuthButton" className="text-sm">Auth Button</Label> </div>
                         </div>
                          <div className="space-y-2 mt-3"> <Label htmlFor="authButtonText">Auth Button Text</Label> <Controller name="authButtonText" control={form.control} render={({ field }) => <Input id="authButtonText" {...field} onBlur={handleBlurUpdate('authButtonText')} disabled={!form.watch('showAuthButton')} />} /> {headerErrors?.authButtonText && <p className="text-sm text-destructive">{headerErrors.authButtonText.message}</p>} </div>
                          <p className="text-xs text-muted-foreground mt-3">Header appearance is controlled by the global theme.</p>
                     </>
                 );
              case 'banner':
                 const bannerErrors = errors as typeof BannerConfigSchema._input;
                 return (
                     <>
                          <div className="space-y-2 relative group/img-upload">
                             <Label htmlFor="imageUrl">Image URL</Label>
                             <Controller name="imageUrl" control={form.control} render={({ field }) => <Input id="imageUrl" placeholder="https://..." {...field} onBlur={handleBlurUpdate('imageUrl')} />} />
                             {bannerErrors?.imageUrl && <p className="text-sm text-destructive">{bannerErrors.imageUrl.message}</p>}
                            {/* Upload Button Overlay */}
                            {form.watch('imageUploadEnabled') && (
                                <Button
                                    variant="outline" size="icon"
                                    className="absolute right-1 top-[calc(50%_+_4px)] transform -translate-y-1/2 h-7 w-7 z-10 opacity-50 group-hover/img-upload:opacity-100 transition-opacity"
                                    onClick={() => handleImageUploadClick(selectedWidget.id)}
                                    title="Upload Banner Image"
                                >
                                    <UploadCloud className="h-4 w-4" />
                                </Button>
                            )}
                         </div>
                         <div className="flex items-center space-x-2 pt-1">
                             <Controller name="imageUploadEnabled" control={form.control} render={({ field }) => <Checkbox id="imageUploadEnabled" checked={field.value ?? true} onCheckedChange={field.onChange} />} />
                             <Label htmlFor="imageUploadEnabled" className="text-xs">Enable Image Upload</Label>
                         </div>

                         <div className="space-y-2"> <Label htmlFor="altText">Alt Text</Label> <Controller name="altText" control={form.control} render={({ field }) => <Input id="altText" placeholder="Descriptive text" {...field} onBlur={handleBlurUpdate('altText')} />} /> {bannerErrors?.altText && <p className="text-sm text-destructive">{bannerErrors.altText.message}</p>} </div>
                         <div className="space-y-2"> <Label htmlFor="linkUrl">Link URL (Optional)</Label> <Controller name="linkUrl" control={form.control} render={({ field }) => <Input id="linkUrl" placeholder="https://..." {...field} onBlur={handleBlurUpdate('linkUrl')} />} /> {bannerErrors?.linkUrl && <p className="text-sm text-destructive">{bannerErrors.linkUrl.message}</p>} </div>
                         <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2"> <Label htmlFor="imageFit">Image Fit</Label> <Controller name="imageFit" control={form.control} render={({ field }) => ( <Select onValueChange={field.onChange} value={field.value}><SelectTrigger id="imageFit"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="cover">Cover</SelectItem><SelectItem value="contain">Contain</SelectItem></SelectContent></Select> )} /> </div>
                             <div className="space-y-2"> <Label htmlFor="aspectRatio">Aspect Ratio</Label> <Controller name="aspectRatio" control={form.control} render={({ field }) => ( <Select onValueChange={field.onChange} value={field.value}><SelectTrigger id="aspectRatio"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="16/9">16:9</SelectItem><SelectItem value="4/3">4:3</SelectItem><SelectItem value="1/1">1:1</SelectItem><SelectItem value="21/9">21:9</SelectItem><SelectItem value="auto">Auto</SelectItem></SelectContent></Select> )} /> </div>
                         </div>
                         {/* AI Prompt Field */}
                         <div className="space-y-2 mt-3">
                            <Label htmlFor="aiPrompt" className="flex items-center gap-1"><Wand2 className="h-4 w-4 text-purple-500"/>AI Prompt (for Alt Text)</Label>
                            <div className="flex gap-2 items-end">
                                <Controller name="aiPrompt" control={form.control} render={({ field }) => <Textarea id="aiPrompt" rows={2} className="flex-1" placeholder="e.g., Describe a modern office space" {...field} onBlur={handleBlurUpdate('aiPrompt')} />} />
                                <Button variant="outline" size="icon" onClick={handleGenerateContent} disabled={isGeneratingContent} title="Generate Alt Text">
                                     {isGeneratingContent ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                                </Button>
                             </div>
                             <p className="text-xs text-muted-foreground">Enter a prompt and click the wand to generate alt text.</p>
                         </div>

                     </>
                 );
             case 'grid':
                 const gridErrors = errors as typeof GridConfigSchema._input;
                  return (
                     <>
                         <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2"> <Label htmlFor="columns">Columns</Label> <Controller name="columns" control={form.control} render={({ field }) => ( <Select onValueChange={field.onChange} value={field.value}><SelectTrigger id="columns"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1">1</SelectItem><SelectItem value="2">2</SelectItem><SelectItem value="3">3</SelectItem><SelectItem value="4">4</SelectItem></SelectContent></Select> )} /> </div>
                             <div className="space-y-2"> <Label htmlFor="itemAspectRatio">Item Aspect Ratio</Label> <Controller name="itemAspectRatio" control={form.control} render={({ field }) => ( <Select onValueChange={field.onChange} value={field.value}><SelectTrigger id="itemAspectRatio"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1/1">1:1</SelectItem><SelectItem value="4/3">4:3</SelectItem><SelectItem value="3/4">3:4</SelectItem><SelectItem value="16/9">16:9</SelectItem></SelectContent></Select> )} /> </div>
                         </div>
                         <div className="space-y-2"> <Label htmlFor="gap">Gap ({form.watch('gap') ?? 4})</Label> <Controller name="gap" control={form.control} defaultValue={4} render={({ field }) => <Slider id="gap" min={0} max={10} step={1} value={[field.value ?? 4]} onValueChange={val => field.onChange(val[0])} />} /> {gridErrors?.gap && <p className="text-sm text-destructive">{gridErrors.gap.message}</p>} </div>
                         <div className="space-y-2"> <Label htmlFor="dataSource">Data Source</Label> <Controller name="dataSource" control={form.control} render={({ field }) => <Input id="dataSource" placeholder="API endpoint or ID" {...field} onBlur={handleBlurUpdate('dataSource')} />} /> <p className="text-xs text-muted-foreground">Identifier for fetching data (e.g., api/products).</p> {gridErrors?.dataSource && <p className="text-sm text-destructive">{gridErrors.dataSource.message}</p>} </div>
                     </>
                 );
              case 'list':
                 const listErrors = errors as typeof ListConfigSchema._input;
                  return (
                     <>
                          <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2"> <Label htmlFor="itemLayout">Item Layout</Label> <Controller name="itemLayout" control={form.control} render={({ field }) => ( <Select onValueChange={field.onChange} value={field.value}><SelectTrigger id="itemLayout"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="simple">Simple</SelectItem><SelectItem value="detailed">Detailed</SelectItem><SelectItem value="image-left">Image Left</SelectItem><SelectItem value="image-right">Image Right</SelectItem></SelectContent></Select> )} /> </div>
                              <div className="space-y-2"> <Label htmlFor="imageSize">Image Size</Label> <Controller name="imageSize" control={form.control} render={({ field }) => ( <Select onValueChange={field.onChange} value={field.value} disabled={!['image-left', 'image-right'].includes(form.watch('itemLayout') ?? '')}><SelectTrigger id="imageSize"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="sm">Small</SelectItem><SelectItem value="md">Medium</SelectItem><SelectItem value="lg">Large</SelectItem></SelectContent></Select> )} /> </div>
                          </div>
                          <div className="flex items-center space-x-2 pt-2"> <Controller name="showDividers" control={form.control} defaultValue={true} render={({ field }) => <Checkbox id="showDividers" checked={field.value ?? true} onCheckedChange={field.onChange} />} /> <Label htmlFor="showDividers">Show Dividers</Label> </div>
                          <div className="space-y-2 pt-2"> <Label htmlFor="dataSource">Data Source</Label> <Controller name="dataSource" control={form.control} render={({ field }) => <Input id="dataSource" placeholder="API endpoint or ID" {...field} onBlur={handleBlurUpdate('dataSource')} />} /> <p className="text-xs text-muted-foreground">Identifier for fetching data (e.g., api/categories).</p> {listErrors?.dataSource && <p className="text-sm text-destructive">{listErrors.dataSource.message}</p>} </div>
                     </>
                 );
              case 'form':
                 const formErrors = errors as typeof FormConfigSchema._input;
                  return (
                     <>
                          <div className="space-y-2"> <Label htmlFor="submitButtonText">Submit Button Text</Label> <Controller name="submitButtonText" control={form.control} render={({ field }) => <Input id="submitButtonText" {...field} onBlur={handleBlurUpdate('submitButtonText')} />} /> {formErrors?.submitButtonText && <p className="text-sm text-destructive">{formErrors.submitButtonText.message}</p>} </div>
                           <div className="space-y-2"> <Label htmlFor="recipientEmail">Recipient Email</Label> <Controller name="recipientEmail" control={form.control} render={({ field }) => <Input id="recipientEmail" type="email" placeholder="your@email.com" {...field} onBlur={handleBlurUpdate('recipientEmail')} />} /> {formErrors?.recipientEmail && <p className="text-sm text-destructive">{formErrors.recipientEmail.message}</p>} </div>
                            <div className="space-y-2"> <Label htmlFor="successMessage">Success Message</Label> <Controller name="successMessage" control={form.control} render={({ field }) => <Textarea id="successMessage" {...field} onBlur={handleBlurUpdate('successMessage')} />} /> {formErrors?.successMessage && <p className="text-sm text-destructive">{formErrors.successMessage.message}</p>} </div>
                          <p className="text-sm text-muted-foreground pt-2">Form fields configuration coming soon...</p>
                     </>
                 );
             case 'text':
                 const textErrors = errors as typeof TextConfigSchema._input;
                  return (
                     <>
                          <div className="space-y-2"> <Label htmlFor="content">Text Content</Label> <Controller name="content" control={form.control} render={({ field }) => <Textarea id="content" {...field} rows={4} onBlur={handleBlurUpdate('content')} />} /> {textErrors?.content && <p className="text-sm text-destructive">{textErrors.content.message}</p>} </div>
                           {/* TODO: Add Rich Text Editor Toggle/Component Here */}
                            <div className="flex items-center space-x-2 pt-1"> <Controller name="enableRichText" control={form.control} render={({ field }) => <Checkbox id="enableRichText" checked={field.value ?? false} onCheckedChange={field.onChange} />} /> <Label htmlFor="enableRichText" className="text-xs">Enable Rich Text (Future)</Label> </div>
                           <div className="grid grid-cols-3 gap-4">
                             <div className="space-y-2"> <Label htmlFor="fontSize">Size</Label> <Controller name="fontSize" control={form.control} render={({ field }) => ( <Select onValueChange={field.onChange} value={field.value}><SelectTrigger id="fontSize"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="xs">XS</SelectItem><SelectItem value="sm">SM</SelectItem><SelectItem value="base">Base</SelectItem><SelectItem value="lg">LG</SelectItem><SelectItem value="xl">XL</SelectItem><SelectItem value="2xl">2XL</SelectItem><SelectItem value="3xl">3XL</SelectItem></SelectContent></Select> )} /> </div>
                             <div className="space-y-2"> <Label htmlFor="alignment">Align</Label> <Controller name="alignment" control={form.control} render={({ field }) => ( <Select onValueChange={field.onChange} value={field.value}><SelectTrigger id="alignment"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="left">Left</SelectItem><SelectItem value="center">Center</SelectItem><SelectItem value="right">Right</SelectItem><SelectItem value="justify">Justify</SelectItem></SelectContent></Select> )} /> </div>
                             <div className="space-y-2"> <Label htmlFor="textColor">Color</Label> <Controller name="textColor" control={form.control} render={({ field }) => ( <Select onValueChange={field.onChange} value={field.value}><SelectTrigger id="textColor"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="default">Default</SelectItem><SelectItem value="primary">Primary</SelectItem><SelectItem value="secondary">Secondary</SelectItem><SelectItem value="accent">Accent</SelectItem><SelectItem value="muted">Muted</SelectItem></SelectContent></Select> )} /> </div>
                           </div>
                           <div className="flex items-center space-x-4 pt-2">
                                 <div className="flex items-center space-x-2"> <Controller name="isBold" control={form.control} defaultValue={false} render={({ field }) => <Checkbox id="isBold" checked={field.value ?? false} onCheckedChange={field.onChange} />} /> <Label htmlFor="isBold">Bold</Label> </div>
                                 <div className="flex items-center space-x-2"> <Controller name="isItalic" control={form.control} defaultValue={false} render={({ field }) => <Checkbox id="isItalic" checked={field.value ?? false} onCheckedChange={field.onChange} />} /> <Label htmlFor="isItalic">Italic</Label> </div>
                           </div>
                           {/* AI Prompt Field */}
                         <div className="space-y-2 mt-3">
                             <Label htmlFor="aiPrompt" className="flex items-center gap-1"><Wand2 className="h-4 w-4 text-purple-500"/>AI Prompt (for Text)</Label>
                             <div className="flex gap-2 items-end">
                                 <Controller name="aiPrompt" control={form.control} render={({ field }) => <Textarea id="aiPrompt" rows={2} className="flex-1" placeholder="e.g., Write a short welcome message" {...field} onBlur={handleBlurUpdate('aiPrompt')} />} />
                                 <Button variant="outline" size="icon" onClick={handleGenerateContent} disabled={isGeneratingContent} title="Generate Text Content">
                                     {isGeneratingContent ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                                </Button>
                             </div>
                              <p className="text-xs text-muted-foreground">Enter a prompt and click the wand to generate text content.</p>
                         </div>
                     </>
                 );
              case 'button':
                 const buttonErrors = errors as typeof ButtonConfigSchema._input;
                  return (
                     <>
                         <div className="space-y-2"> <Label htmlFor="buttonText">Button Text</Label> <Controller name="buttonText" control={form.control} render={({ field }) => <Input id="buttonText" {...field} onBlur={handleBlurUpdate('buttonText')}/>} /> {buttonErrors?.buttonText && <p className="text-sm text-destructive">{buttonErrors.buttonText.message}</p>} </div>
                         <div className="space-y-2"> <Label htmlFor="linkUrl">Link URL</Label> <Controller name="linkUrl" control={form.control} render={({ field }) => <Input id="linkUrl" placeholder="e.g., /products or https://..." {...field} onBlur={handleBlurUpdate('linkUrl')} />} /> {buttonErrors?.linkUrl && <p className="text-sm text-destructive">{buttonErrors.linkUrl.message}</p>} </div>
                          <div className="grid grid-cols-3 gap-4">
                             <div className="space-y-2"> <Label htmlFor="variant">Variant</Label> <Controller name="variant" control={form.control} render={({ field }) => ( <Select onValueChange={field.onChange} value={field.value}><SelectTrigger id="variant"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="default">Default</SelectItem><SelectItem value="destructive">Destructive</SelectItem><SelectItem value="outline">Outline</SelectItem><SelectItem value="secondary">Secondary</SelectItem><SelectItem value="ghost">Ghost</SelectItem><SelectItem value="link">Link</SelectItem></SelectContent></Select> )} /> </div>
                             <div className="space-y-2"> <Label htmlFor="size">Size</Label> <Controller name="size" control={form.control} render={({ field }) => ( <Select onValueChange={field.onChange} value={field.value}><SelectTrigger id="size"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="default">Default</SelectItem><SelectItem value="sm">Small</SelectItem><SelectItem value="lg">Large</SelectItem><SelectItem value="icon">Icon</SelectItem></SelectContent></Select> )} /> </div>
                              <div className="space-y-2"> <Label htmlFor="buttonAlignment">Align</Label> <Controller name="alignment" control={form.control} render={({ field }) => ( <Select onValueChange={field.onChange} value={field.value}><SelectTrigger id="buttonAlignment"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="left">Left</SelectItem><SelectItem value="center">Center</SelectItem><SelectItem value="right">Right</SelectItem><SelectItem value="full">Full Width</SelectItem></SelectContent></Select> )} /> </div>
                         </div>
                     </>
                  );
              case 'spacer':
                 const spacerErrors = errors as typeof SpacerConfigSchema._input;
                  return (
                     <div className="space-y-2"> <Label htmlFor="height">Height ({form.watch('height') ?? 4})</Label> <Controller name="height" control={form.control} defaultValue={4} render={({ field }) => <Slider id="height" min={1} max={40} step={1} value={[field.value ?? 4]} onValueChange={val => field.onChange(val[0])} />} /> <p className="text-xs text-muted-foreground">Adjust the vertical space (1 unit ≈ 0.25rem).</p> {spacerErrors?.height && <p className="text-sm text-destructive">{spacerErrors.height.message}</p>} </div>
                  );
             case 'map':
                 const mapErrors = errors as typeof MapConfigSchema._input;
                  return (
                    <>
                        <div className="space-y-2"> <Label htmlFor="address">Address or Location</Label> <Controller name="address" control={form.control} render={({ field }) => <Textarea id="address" {...field} rows={2} placeholder="e.g., 1 Infinite Loop, Cupertino, CA" onBlur={handleBlurUpdate('address')} />} /> {mapErrors?.address && <p className="text-sm text-destructive">{mapErrors.address.message}</p>} </div>
                         <div className="space-y-2"> <Label htmlFor="zoomLevel">Zoom Level ({form.watch('zoomLevel') ?? 15})</Label> <Controller name="zoomLevel" control={form.control} defaultValue={15} render={({ field }) => <Slider id="zoomLevel" min={1} max={20} step={1} value={[field.value ?? 15]} onValueChange={val => field.onChange(val[0])} />} /> {mapErrors?.zoomLevel && <p className="text-sm text-destructive">{mapErrors.zoomLevel.message}</p>} </div>
                         <div className="grid grid-cols-2 gap-4 items-center"> {/* Use items-center */}
                              <div className="flex items-center space-x-2 pt-2"> <Controller name="showMarker" control={form.control} defaultValue={true} render={({ field }) => <Checkbox id="showMarker" checked={field.value ?? true} onCheckedChange={field.onChange} />} /> <Label htmlFor="showMarker">Show Marker</Label> </div>
                              <div className="space-y-2"> <Label htmlFor="mapStyle">Map Style</Label> <Controller name="mapStyle" control={form.control} render={({ field }) => ( <Select onValueChange={field.onChange} value={field.value}><SelectTrigger id="mapStyle"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="roadmap">Roadmap</SelectItem><SelectItem value="satellite">Satellite</SelectItem><SelectItem value="hybrid">Hybrid</SelectItem><SelectItem value="terrain">Terrain</SelectItem></SelectContent></Select> )} /> </div>
                         </div>
                         {/* Geolocation Toggle */}
                        <div className="flex items-center space-x-2 pt-3"> <Controller name="useCurrentLocation" control={form.control} defaultValue={false} render={({ field }) => <Checkbox id="useCurrentLocation" checked={field.value ?? false} onCheckedChange={field.onChange} />} /> <Label htmlFor="useCurrentLocation">Use Current Location</Label> </div>
                         <p className="text-xs text-muted-foreground pt-1">Toggles automatically off after fetching location.</p>
                    </>
                  );
              case 'video':
                 const videoErrors = errors as typeof VideoConfigSchema._input;
                  return (
                     <>
                         <div className="space-y-2"> <Label htmlFor="videoUrl">Video URL</Label> <Controller name="videoUrl" control={form.control} render={({ field }) => <Input id="videoUrl" placeholder="https://youtube.com/watch?v=..." {...field} onBlur={handleBlurUpdate('videoUrl')} />} /> {videoErrors?.videoUrl && <p className="text-sm text-destructive">{videoErrors.videoUrl.message}</p>} </div>
                         <div className="space-y-2"> <Label htmlFor="videoAspectRatio">Aspect Ratio</Label> <Controller name="aspectRatio" control={form.control} render={({ field }) => ( <Select onValueChange={field.onChange} value={field.value}><SelectTrigger id="videoAspectRatio"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="16/9">16:9</SelectItem><SelectItem value="4/3">4:3</SelectItem><SelectItem value="1/1">1:1</SelectItem><SelectItem value="9/16">9:16</SelectItem><SelectItem value="auto">Auto</SelectItem></SelectContent></Select> )} /> </div>
                         <div className="flex items-center space-x-4 pt-2">
                             <div className="flex items-center space-x-2"> <Controller name="autoplay" control={form.control} defaultValue={false} render={({ field }) => <Checkbox id="videoAutoplay" checked={field.value ?? false} onCheckedChange={field.onChange} />} /> <Label htmlFor="videoAutoplay">Autoplay</Label> </div>
                               <div className="flex items-center space-x-2"> <Controller name="showControls" control={form.control} defaultValue={true} render={({ field }) => <Checkbox id="showControls" checked={field.value ?? true} onCheckedChange={field.onChange} />} /> <Label htmlFor="showControls">Show Controls</Label> </div>
                          </div>
                     </>
                  );
             // --- NEW WIDGET CONFIG FORMS ---
             case 'carousel':
                const carouselErrors = errors as typeof CarouselConfigSchema._input;
                 return (
                     <>
                         <h4 className="text-sm font-medium mb-2">Carousel Items</h4>
                         <div className="space-y-3 max-h-60 overflow-y-auto border rounded p-2 bg-muted/50">
                            {carouselItems.map((item, index) => (
                                 <div key={item.arrayId} className="flex items-start space-x-2 p-2 border bg-card rounded shadow-sm relative group">
                                     <TooltipProvider><Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6 cursor-grab flex-shrink-0" {...form.register(`items.${index}.dragHandle` as any)}><GripVertical className="h-4 w-4 text-muted-foreground" /></Button></TooltipTrigger><TooltipContent>Drag to reorder</TooltipContent></Tooltip></TooltipProvider>
                                     <div className="flex-1 space-y-2">
                                        <div className="flex items-center space-x-2 relative group/img-upload">
                                             <FileImage className="h-4 w-4 text-muted-foreground flex-shrink-0"/>
                                             <Controller name={`items.${index}.imageUrl`} control={form.control} render={({ field }) => <Input className="h-8 text-xs" placeholder="Image URL" {...field} onBlur={handleBlurUpdate(`items.${index}.imageUrl`)} />} />
                                             {carouselErrors?.items?.[index]?.imageUrl && <p className="text-xs text-destructive">{carouselErrors.items[index]?.imageUrl?.message}</p>}
                                              {/* Upload Button */}
                                              {form.watch(`items.${index}.imageUploadEnabled`) && (
                                                 <Button
                                                    variant="outline" size="icon"
                                                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 z-10 opacity-0 group-hover/img-upload:opacity-100 transition-opacity"
                                                    onClick={() => handleImageUploadClick(selectedWidget.id, index)}
                                                    title={`Upload Image for Slide ${index + 1}`}
                                                > <UploadCloud className="h-3 w-3" /> </Button>
                                             )}
                                        </div>
                                         <div className="flex items-center space-x-2 pt-1">
                                              <Controller name={`items.${index}.imageUploadEnabled`} control={form.control} render={({ field }) => <Checkbox id={`item-upload-${index}`} checked={field.value ?? true} onCheckedChange={field.onChange} />} />
                                              <Label htmlFor={`item-upload-${index}`} className="text-xs">Enable Upload</Label>
                                          </div>
                                        <Controller name={`items.${index}.altText`} control={form.control} render={({ field }) => <Input className="h-8 text-xs" placeholder="Alt Text (Optional)" {...field} onBlur={handleBlurUpdate(`items.${index}.altText`)} />} />
                                        <Controller name={`items.${index}.linkUrl`} control={form.control} render={({ field }) => <Input className="h-8 text-xs" placeholder="Link URL (Optional)" {...field} onBlur={handleBlurUpdate(`items.${index}.linkUrl`)} />} />
                                         {/* Add hidden ID field - IMPORTANT for react-hook-form array management */}
                                         <Controller name={`items.${index}.id`} control={form.control} render={({ field }) => <input type="hidden" {...field} />} />
                                     </div>
                                     <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 text-destructive opacity-50 group-hover:opacity-100" onClick={() => removeCarouselItem(index)}><X className="h-4 w-4" /></Button>
                                 </div>
                            ))}
                         </div>
                         <Button variant="outline" size="sm" className="mt-2" onClick={() => appendCarouselItem({ id: `new-${Date.now()}`, imageUrl: '', altText: '', linkUrl: '', imageUploadEnabled: true })}> <Plus className="h-4 w-4 mr-1" /> Add Slide </Button>
                          {/* Hidden file input */}
                          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

                         <Separator className="my-4" />
                         <h4 className="text-sm font-medium mb-2">Carousel Settings</h4>
                         <div className="grid grid-cols-2 gap-4">
                             <div className="flex items-center space-x-2 pt-2"> <Controller name="autoplay" control={form.control} defaultValue={false} render={({ field }) => <Checkbox id="carouselAutoplay" checked={field.value ?? false} onCheckedChange={field.onChange} />} /> <Label htmlFor="carouselAutoplay">Autoplay</Label> </div>
                             <div className="space-y-2"> <Label htmlFor="delay">Delay (ms)</Label> <Controller name="delay" control={form.control} defaultValue={3000} render={({ field }) => <Input id="delay" type="number" min="1000" step="100" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))} onBlur={handleBlurUpdate('delay')} disabled={!form.watch('autoplay')} />} /> {carouselErrors?.delay && <p className="text-sm text-destructive">{carouselErrors.delay.message}</p>} </div>
                             <div className="flex items-center space-x-2 pt-2"> <Controller name="showArrows" control={form.control} defaultValue={true} render={({ field }) => <Checkbox id="showArrows" checked={field.value ?? true} onCheckedChange={field.onChange} />} /> <Label htmlFor="showArrows">Show Arrows</Label> </div>
                             <div className="flex items-center space-x-2 pt-2"> <Controller name="showDots" control={form.control} defaultValue={true} render={({ field }) => <Checkbox id="showDots" checked={field.value ?? true} onCheckedChange={field.onChange} />} /> <Label htmlFor="showDots">Show Dots</Label> </div>
                         </div>
                          <div className="space-y-2 mt-3"> <Label htmlFor="carouselAspectRatio">Aspect Ratio</Label> <Controller name="aspectRatio" control={form.control} render={({ field }) => ( <Select onValueChange={field.onChange} value={field.value}><SelectTrigger id="carouselAspectRatio"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="16/9">16:9</SelectItem><SelectItem value="4/3">4:3</SelectItem><SelectItem value="1/1">1:1</SelectItem><SelectItem value="21/9">21:9</SelectItem><SelectItem value="auto">Auto</SelectItem></SelectContent></Select> )} /> </div>
                     </>
                 );
             case 'audio':
                 const audioErrors = errors as typeof AudioConfigSchema._input;
                 return (
                    <>
                        <div className="space-y-2"> <Label htmlFor="audioUrl">Audio File URL</Label> <Controller name="audioUrl" control={form.control} render={({ field }) => <Input id="audioUrl" placeholder="https://.../track.mp3" {...field} onBlur={handleBlurUpdate('audioUrl')} />} /> {audioErrors?.audioUrl && <p className="text-sm text-destructive">{audioErrors.audioUrl.message}</p>} </div>
                         <div className="grid grid-cols-3 gap-4 pt-2">
                             <div className="flex items-center space-x-2"> <Controller name="autoplay" control={form.control} defaultValue={false} render={({ field }) => <Checkbox id="audioAutoplay" checked={field.value ?? false} onCheckedChange={field.onChange} />} /> <Label htmlFor="audioAutoplay">Autoplay</Label> </div>
                             <div className="flex items-center space-x-2"> <Controller name="showControls" control={form.control} defaultValue={true} render={({ field }) => <Checkbox id="audioShowControls" checked={field.value ?? true} onCheckedChange={field.onChange} />} /> <Label htmlFor="audioShowControls">Controls</Label> </div>
                             <div className="flex items-center space-x-2"> <Controller name="loop" control={form.control} defaultValue={false} render={({ field }) => <Checkbox id="loop" checked={field.value ?? false} onCheckedChange={field.onChange} />} /> <Label htmlFor="loop">Loop</Label> </div>
                         </div>
                    </>
                 );
             case 'countdown':
                  const countdownErrors = errors as typeof CountdownConfigSchema._input;
                 return (
                    <>
                        <div className="space-y-2"> <Label htmlFor="targetDate">Target Date & Time</Label> <Controller name="targetDate" control={form.control} render={({ field }) => <Input id="targetDate" type="datetime-local" {...field} onBlur={handleBlurUpdate('targetDate')} />} /> {countdownErrors?.targetDate && <p className="text-sm text-destructive">{countdownErrors.targetDate.message}</p>} </div>
                        <div className="space-y-2"> <Label htmlFor="expiredMessage">Expired Message</Label> <Controller name="expiredMessage" control={form.control} render={({ field }) => <Input id="expiredMessage" {...field} onBlur={handleBlurUpdate('expiredMessage')} />} /> {countdownErrors?.expiredMessage && <p className="text-sm text-destructive">{countdownErrors.expiredMessage.message}</p>} </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"> <Label htmlFor="labelDays">Days Label</Label> <Controller name="labelDays" control={form.control} render={({ field }) => <Input id="labelDays" {...field} onBlur={handleBlurUpdate('labelDays')} />} /> </div>
                             <div className="space-y-2"> <Label htmlFor="labelHours">Hours Label</Label> <Controller name="labelHours" control={form.control} render={({ field }) => <Input id="labelHours" {...field} onBlur={handleBlurUpdate('labelHours')} />} /> </div>
                              <div className="space-y-2"> <Label htmlFor="labelMinutes">Minutes Label</Label> <Controller name="labelMinutes" control={form.control} render={({ field }) => <Input id="labelMinutes" {...field} onBlur={handleBlurUpdate('labelMinutes')} />} /> </div>
                               <div className="space-y-2"> <Label htmlFor="labelSeconds">Seconds Label</Label> <Controller name="labelSeconds" control={form.control} render={({ field }) => <Input id="labelSeconds" {...field} onBlur={handleBlurUpdate('labelSeconds')} />} /> </div>
                         </div>
                          <div className="space-y-2 mt-3"> <Label htmlFor="countdownDisplayStyle">Display Style</Label> <Controller name="displayStyle" control={form.control} render={({ field }) => ( <Select onValueChange={field.onChange} value={field.value}><SelectTrigger id="countdownDisplayStyle"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="blocks">Blocks</SelectItem><SelectItem value="inline">Inline</SelectItem></SelectContent></Select> )} /> </div>
                    </>
                 );
            case 'social':
                 const socialErrors = errors as typeof SocialFeedConfigSchema._input;
                return (
                    <>
                        <div className="space-y-2"> <Label htmlFor="socialPlatform">Platform</Label> <Controller name="platform" control={form.control} render={({ field }) => ( <Select onValueChange={field.onChange} value={field.value}><SelectTrigger id="socialPlatform"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="twitter">Twitter</SelectItem><SelectItem value="instagram">Instagram</SelectItem><SelectItem value="facebook">Facebook</SelectItem><SelectItem value="linkedin">LinkedIn (Limited)</SelectItem></SelectContent></Select> )} /> </div>
                        <div className="space-y-2"> <Label htmlFor="profileUrlOrHandle">Profile URL or Handle</Label> <Controller name="profileUrlOrHandle" control={form.control} render={({ field }) => <Input id="profileUrlOrHandle" placeholder="e.g., https://twitter.com/yourhandle or yourhandle" {...field} onBlur={handleBlurUpdate('profileUrlOrHandle')} />} /> {socialErrors?.profileUrlOrHandle && <p className="text-sm text-destructive">{socialErrors.profileUrlOrHandle.message}</p>} </div>
                         <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2"> <Label htmlFor="numberOfPosts">Number of Posts</Label> <Controller name="numberOfPosts" control={form.control} defaultValue={5} render={({ field }) => <Input id="numberOfPosts" type="number" min="1" max="20" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))} onBlur={handleBlurUpdate('numberOfPosts')} />} /> {socialErrors?.numberOfPosts && <p className="text-sm text-destructive">{socialErrors.numberOfPosts.message}</p>} </div>
                             <div className="space-y-2"> <Label htmlFor="socialLayout">Layout (if supported)</Label> <Controller name="layout" control={form.control} render={({ field }) => ( <Select onValueChange={field.onChange} value={field.value}><SelectTrigger id="socialLayout"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="list">List</SelectItem><SelectItem value="grid">Grid</SelectItem></SelectContent></Select> )} /> </div>
                         </div>
                         <p className="text-xs text-muted-foreground pt-2">Note: Embedding social feeds can be unreliable and depends on the platform's policies.</p>
                    </>
                 );
             case 'divider':
                 const dividerErrors = errors as typeof DividerConfigSchema._input;
                  return (
                     <>
                         <div className="grid grid-cols-3 gap-4 items-end"> {/* Use items-end */}
                             <div className="space-y-2"> <Label htmlFor="dividerStyle">Style</Label> <Controller name="style" control={form.control} render={({ field }) => ( <Select onValueChange={field.onChange} value={field.value}><SelectTrigger id="dividerStyle"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="solid">Solid</SelectItem><SelectItem value="dashed">Dashed</SelectItem><SelectItem value="dotted">Dotted</SelectItem></SelectContent></Select> )} /> </div>
                             <div className="space-y-2"> <Label htmlFor="thickness">Thickness (px)</Label> <Controller name="thickness" control={form.control} defaultValue={1} render={({ field }) => <Input id="thickness" type="number" min="1" max="10" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))} onBlur={handleBlurUpdate('thickness')} />} /> {dividerErrors?.thickness && <p className="text-sm text-destructive">{dividerErrors.thickness.message}</p>} </div>
                              <div className="space-y-2"> <Label htmlFor="dividerColor">Color</Label> <Controller name="color" control={form.control} render={({ field }) => ( <Select onValueChange={field.onChange} value={field.value}><SelectTrigger id="dividerColor"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="border">Default (Border)</SelectItem><SelectItem value="primary">Primary</SelectItem><SelectItem value="accent">Accent</SelectItem></SelectContent></Select> )} /> </div>
                          </div>
                     </>
                  );
             case 'camera':
                 const cameraErrors = errors as typeof CameraConfigSchema._input;
                 return (
                    <>
                         <div className="space-y-2"> <Label htmlFor="cameraFacingMode">Default Camera</Label> <Controller name="facingMode" control={form.control} render={({ field }) => ( <Select onValueChange={field.onChange} value={field.value}><SelectTrigger id="cameraFacingMode"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="environment">Back Camera</SelectItem><SelectItem value="user">Front Camera</SelectItem></SelectContent></Select> )} /> </div>
                         <div className="space-y-2"> <Label htmlFor="captureButtonText">Capture Button Text</Label> <Controller name="captureButtonText" control={form.control} render={({ field }) => <Input id="captureButtonText" {...field} onBlur={handleBlurUpdate('captureButtonText')} />} /> {cameraErrors?.captureButtonText && <p className="text-sm text-destructive">{cameraErrors.captureButtonText.message}</p>} </div>
                         <p className="text-xs text-muted-foreground pt-2">Requires user permission in the actual app.</p>
                     </>
                 );
             case 'pushNotification':
                 const pushErrors = errors as typeof PushNotificationConfigSchema._input;
                 return (
                     <>
                         <p className="text-sm text-muted-foreground mb-3">Configure push notification service (e.g., Firebase Cloud Messaging).</p>
                         <div className="space-y-2"> <Label htmlFor="serverKey">Server Key (Placeholder)</Label> <Controller name="serverKey" control={form.control} render={({ field }) => <Input type="password" id="serverKey" placeholder="Enter FCM server key..." {...field} onBlur={handleBlurUpdate('serverKey')} />} /> {pushErrors?.serverKey && <p className="text-sm text-destructive">{pushErrors.serverKey.message}</p>} </div>
                         <div className="space-y-2"> <Label htmlFor="senderId">Sender ID (Placeholder)</Label> <Controller name="senderId" control={form.control} render={({ field }) => <Input id="senderId" placeholder="Enter FCM sender ID..." {...field} onBlur={handleBlurUpdate('senderId')} />} /> {pushErrors?.senderId && <p className="text-sm text-destructive">{pushErrors.senderId.message}</p>} </div>
                         <div className="space-y-2"> <Label htmlFor="optInPromptText">Opt-In Prompt Text</Label> <Controller name="optInPromptText" control={form.control} render={({ field }) => <Input id="optInPromptText" {...field} onBlur={handleBlurUpdate('optInPromptText')} />} /> {pushErrors?.optInPromptText && <p className="text-sm text-destructive">{pushErrors.optInPromptText.message}</p>} </div>
                         <p className="text-xs text-muted-foreground pt-2">Requires service worker setup and user opt-in in the actual app.</p>
                     </>
                 );


             default:
                 return <p className="text-sm text-muted-foreground">No specific configuration available.</p>;
         }
     };

     // --- Template Loading Logic ---
     const loadTemplate = (templateName: keyof typeof appTemplateDefaults) => {
         const templateWidgets = appTemplateDefaults[templateName];
         if (templateWidgets) {
             // Add unique IDs to template widgets before setting state
             const uniqueTemplateWidgets = templateWidgets.map(w => ({
                ...w,
                id: `${w.type}-${Date.now()}-${Math.random().toString(16).slice(2)}` // Ensure uniqueness
             }));
             setWidgets(uniqueTemplateWidgets);
             setSelectedWidgetId(null); // Deselect any widget
             setCurrentPreviewUrl('/'); // Reset preview URL
              toast({title: "Template Loaded", description: `Loaded the ${templateName} template.`});
         }
     };

    return (
        <div className={cn("h-full flex flex-col bg-secondary/50 border-l", className)}>
             {/* Top Section: Title and Templates/AI */}
            <div className="p-4 border-b border-border">
                 <h2 className="text-xl font-semibold text-primary mb-3 px-2">Configuration</h2>
                  <div className="grid grid-cols-2 gap-2">
                      <Dialog>
                         <DialogTrigger asChild>
                            <Button variant="outline" size="sm">Load Template...</Button>
                         </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Load App Template</DialogTitle>
                              <DialogDescription> Select a pre-defined template. This will replace your current layout. </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-4 py-4">
                                {Object.keys(appTemplateDefaults).map((key) => (
                                     <DialogClose key={key} asChild>
                                         <Button variant="secondary" onClick={() => loadTemplate(key as keyof typeof appTemplateDefaults)}>
                                             {key.charAt(0).toUpperCase() + key.slice(1)}
                                         </Button>
                                    </DialogClose>
                                ))}
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="ghost">Cancel</Button>
                                </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                      </Dialog>
                      {/* AI Layout Suggestion */}
                      <Dialog>
                           <DialogTrigger asChild>
                             <Button variant="outline" size="sm" className="border-purple-500/50 hover:bg-purple-500/10 text-purple-600">
                                <Lightbulb className="h-4 w-4 mr-2" /> AI Layout...
                             </Button>
                           </DialogTrigger>
                           <DialogContent>
                              <DialogHeader>
                                 <DialogTitle>AI Layout Suggestion</DialogTitle>
                                 <DialogDescription>Let AI suggest a starting layout based on your app's purpose.</DialogDescription>
                              </DialogHeader>
                               <div className="grid grid-cols-2 gap-4 py-4">
                                 {(['store', 'blog', 'portfolio', 'event'] as const).map((type) => (
                                      <DialogClose key={type} asChild>
                                         <Button
                                             variant="secondary"
                                             onClick={() => handleSuggestLayout(type)}
                                             disabled={isSuggestingLayout}
                                         >
                                             {isSuggestingLayout ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                             {type.charAt(0).toUpperCase() + type.slice(1)} App
                                         </Button>
                                     </DialogClose>
                                 ))}
                             </div>
                             <DialogFooter>
                                 <DialogClose asChild>
                                     <Button variant="ghost" disabled={isSuggestingLayout}>Cancel</Button>
                                 </DialogClose>
                             </DialogFooter>
                           </DialogContent>
                       </Dialog>
                  </div>
             </div>

            {/* Main Configuration Area */}
             <div className="flex-1 overflow-y-auto">
                 <Card className="flex-1 overflow-hidden bg-card shadow-none border-0 rounded-none">
                    <CardHeader className="pb-4 pt-4 px-4">
                        <CardTitle className="text-lg capitalize">
                            {selectedWidget ? `${selectedWidget.name || selectedWidget.type} Settings` : 'Select a Widget'}
                        </CardTitle>
                    </CardHeader>
                     <CardContent className="space-y-3 px-4 pb-4">
                         {selectedWidget ? (
                             <form
                                 onSubmit={(e) => e.preventDefault()}
                                 className="space-y-3"
                                 key={selectedWidget.id} // Force re-render on widget change
                             >
                                {/* Specific Widget Settings */}
                                <Accordion type="single" collapsible defaultValue="specific-settings" value={activeAccordionItem} onValueChange={setActiveAccordionItem} className="w-full">
                                     <AccordionItem value="specific-settings">
                                         <AccordionTrigger className="text-sm font-medium px-2 hover:no-underline">Widget Specific Settings</AccordionTrigger>
                                         <AccordionContent className="pt-2 space-y-3 px-2">
                                             {renderSpecificFields()}
                                         </AccordionContent>
                                     </AccordionItem>
                                 </Accordion>

                                 {/* Common Settings (Margins, Animation, etc.) */}
                                 {selectedWidget.type !== 'header' && renderCommonFields(selectedWidget.type === 'spacer' ? ['margins'] : [])}

                             </form>
                         ) : (
                             <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-10">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mouse-pointer-click mb-4 opacity-50"><path d="m9 9 5 12 1.8-5.2L21 14Z"/><path d="M7.2 2.2 8 7.1"/><path d="m5.1 5.1 3.5 3.5"/><path d="M2 13h6"/><path d="M3 3l7.07 7.07"/></svg>
                                 <p> Select a widget in the preview to configure its settings. </p>
                             </div>
                         )}
                     </CardContent>
                 </Card>
            </div>

             {/* Bottom Section: Theme Selector */}
            <div className="mt-auto p-4 border-t border-border">
                <ThemeSelector />
                {/* Placeholder for Version History & Publish */}
                <div className="mt-4 space-y-2">
                     <Button variant="outline" size="sm" className="w-full" disabled>Version History (Soon)</Button>
                     <Button variant="default" size="sm" className="w-full" disabled>Publish App (Soon)</Button>
                </div>
            </div>
             {/* Hidden file input for reuse */}
             <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
        </div>
    );
}
