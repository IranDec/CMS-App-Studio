
'use client';

import React, { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
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
import type { DroppedWidget } from '@/types/widget'; // Import the type
import { widgetDefaultValuesMap } from '@/lib/widget-defaults'; // Import defaults
import { cn } from '@/lib/utils'; // Import cn utility
import { ThemeSelector } from './theme-selector'; // Import ThemeSelector

interface ConfigurationPanelProps {
  selectedWidget: DroppedWidget | null;
  updateWidgetConfig: (widgetId: string, newConfig: Partial<DroppedWidget['config']>) => void;
  className?: string; // Add className prop
}

// --- Define Zod schemas for each widget type ---

// Base schema (for widgets that have margins)
const BaseWidgetSchema = z.object({
    marginTop: z.number().min(0).max(20).default(2).describe("Margin top in spacing units (1 = 0.25rem)"),
    marginBottom: z.number().min(0).max(20).default(2).describe("Margin bottom in spacing units"),
});

// Header (No BaseWidgetSchema, doesn't usually have margins)
const HeaderConfigSchema = z.object({
    title: z.string().default('App Name').describe("Text displayed in the header title"),
    showBackButton: z.boolean().default(false).describe("Show a back arrow button"),
    showMenuButton: z.boolean().default(true).describe("Show a menu button (for sidebar)"),
    showCartIcon: z.boolean().default(true).describe("Show a shopping cart icon"),
    showAuthButton: z.boolean().default(true).describe("Show a login/user button"),
    authButtonText: z.string().default('Login').describe("Text for the login/user button"),
     // Keep optional fields for schema merging consistency, although header doesn't use them
     marginTop: z.number().optional(),
     marginBottom: z.number().optional(),
});
type HeaderConfigFormData = z.infer<typeof HeaderConfigSchema>;


// Banner
const BannerConfigSchema = BaseWidgetSchema.extend({
    imageUrl: z.string().url({ message: "Must be a valid URL" }).optional().or(z.literal('')).describe("URL of the banner image"),
    altText: z.string().optional().describe("Alternative text for accessibility"),
    linkUrl: z.string().url({ message: "Must be a valid URL" }).optional().or(z.literal('')).describe("Optional URL to link the banner"),
    imageFit: z.enum(['cover', 'contain']).default('cover').describe("How the image should fit within the banner area"),
    aspectRatio: z.enum(['16/9', '4/3', '1/1', '21/9', 'auto']).default('16/9').describe("Aspect ratio of the banner container"),
});
type BannerConfigFormData = z.infer<typeof BannerConfigSchema>;

// Grid
const GridConfigSchema = BaseWidgetSchema.extend({
    columns: z.enum(['1', '2', '3', '4']).default('2').describe("Number of columns in the grid"),
    gap: z.number().min(0).max(10).default(4).describe("Gap between grid items in spacing units"),
    dataSource: z.string().optional().describe("API Endpoint or identifier for product data"), // Example data source
    itemAspectRatio: z.enum(['1/1', '4/3', '3/4', '16/9']).default('1/1').describe("Aspect ratio for each item in the grid"),
});
type GridConfigFormData = z.infer<typeof GridConfigSchema>;

// List
const ListConfigSchema = BaseWidgetSchema.extend({
    itemLayout: z.enum(['simple', 'detailed', 'image-left', 'image-right']).default('simple').describe("Layout style for list items"),
    showDividers: z.boolean().default(true).describe("Show lines between list items"),
    dataSource: z.string().optional().describe("API Endpoint or identifier for item data"), // Example data source
    imageSize: z.enum(['sm', 'md', 'lg']).default('md').describe("Size of the image in image layouts"),
});
type ListConfigFormData = z.infer<typeof ListConfigSchema>;

// Form
const FormConfigSchema = BaseWidgetSchema.extend({
    submitButtonText: z.string().default('Submit').describe("Text displayed on the submit button"),
    recipientEmail: z.string().email({ message: "Invalid email address" }).optional().or(z.literal('')).describe("Email address to send form submissions"),
    successMessage: z.string().default('Thank you for your submission!').describe("Message shown after successful submission"),
     // TODO: Define form fields structure (e.g., array of objects)
});
type FormConfigFormData = z.infer<typeof FormConfigSchema>;

// Text Block
const TextConfigSchema = BaseWidgetSchema.extend({
    content: z.string().default('Enter your text here...').describe("The actual text content"),
    fontSize: z.enum(['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl']).default('base').describe("Font size of the text"),
    alignment: z.enum(['left', 'center', 'right', 'justify']).default('left').describe("Text alignment"),
    isBold: z.boolean().default(false).describe("Make text bold"),
    isItalic: z.boolean().default(false).describe("Make text italic"),
    textColor: z.enum(['default', 'primary', 'secondary', 'accent', 'muted']).default('default').describe("Text color based on theme"),
});
type TextConfigFormData = z.infer<typeof TextConfigSchema>;

// Button
const ButtonConfigSchema = BaseWidgetSchema.extend({
    buttonText: z.string().default('Click Me').describe("Text displayed on the button"),
    linkUrl: z.string().url({ message: "Must be a valid URL" }).optional().or(z.literal('')).describe("URL the button links to"),
    variant: z.enum(['default', 'destructive', 'outline', 'secondary', 'ghost', 'link']).default('default').describe("Visual style of the button"),
    size: z.enum(['default', 'sm', 'lg', 'icon']).default('default').describe("Size of the button"),
    alignment: z.enum(['left', 'center', 'right', 'full']).default('center').describe("Horizontal alignment or full width"),
    // icon: z.string().optional().describe("Lucide icon name (optional)"), // Future enhancement
});
type ButtonConfigFormData = z.infer<typeof ButtonConfigSchema>;

// Spacer (No BaseWidgetSchema for Spacer margins)
const SpacerConfigSchema = z.object({
    height: z.number().min(1).max(40).default(4).describe("Vertical space in spacing units (1 = 0.25rem)"),
    // Margins are usually not needed for a pure spacer widget itself
     marginTop: z.number().min(0).max(20).default(0).optional(), // Keep optional for schema match
     marginBottom: z.number().min(0).max(20).default(0).optional(), // Keep optional for schema match
});

type SpacerConfigFormData = z.infer<typeof SpacerConfigSchema>;

// Map
const MapConfigSchema = BaseWidgetSchema.extend({
    address: z.string().default('1600 Amphitheatre Parkway, Mountain View, CA').describe("Address or location to display"),
    zoomLevel: z.number().min(1).max(20).default(15).describe("Initial map zoom level (1=world, 20=building)"),
    showMarker: z.boolean().default(true).describe("Display a marker at the specified location"),
    mapStyle: z.enum(['roadmap', 'satellite', 'hybrid', 'terrain']).default('roadmap').describe("Visual style of the map"),
});
type MapConfigFormData = z.infer<typeof MapConfigSchema>;

// Video
const VideoConfigSchema = BaseWidgetSchema.extend({
    videoUrl: z.string().url({ message: "Must be a valid video URL (e.g., YouTube, Vimeo)" }).optional().or(z.literal('')).describe("URL of the video to embed"),
    aspectRatio: z.enum(['16/9', '4/3', '1/1', '9/16', 'auto']).default('16/9').describe("Aspect ratio of the video player"),
    autoplay: z.boolean().default(false).describe("Automatically play video on load (use with caution)"),
    showControls: z.boolean().default(true).describe("Show video player controls (play, pause, volume)"),
});
type VideoConfigFormData = z.infer<typeof VideoConfigSchema>;


// --- Map widget types to their schemas ---
const widgetSchemaMap = {
    header: HeaderConfigSchema,
    banner: BannerConfigSchema,
    grid: GridConfigSchema,
    list: ListConfigSchema,
    form: FormConfigSchema,
    text: TextConfigSchema,
    button: ButtonConfigSchema,
    spacer: SpacerConfigSchema,
    map: MapConfigSchema,
    video: VideoConfigSchema,
};

// --- Configuration Panel Component ---

export function ConfigurationPanel({ selectedWidget, updateWidgetConfig, className }: ConfigurationPanelProps) {

    const currentSchema = selectedWidget ? widgetSchemaMap[selectedWidget.type as keyof typeof widgetSchemaMap] : BaseWidgetSchema; // Default to Base Schema
    const currentDefaults = selectedWidget ? widgetDefaultValuesMap[selectedWidget.type as keyof typeof widgetDefaultValuesMap] : {};

    const form = useForm({
        resolver: zodResolver(currentSchema),
        defaultValues: selectedWidget?.config || currentDefaults, // Load existing config or defaults
        mode: 'onBlur', // Validate on blur
    });

     // Reset form when selected widget changes or when config updates externally
     useEffect(() => {
        if (selectedWidget) {
            // Merge defaults with potentially partial existing config
            const mergedConfig = {
                 ...(widgetDefaultValuesMap[selectedWidget.type as keyof typeof widgetDefaultValuesMap] || {}), // Start with defaults
                 ...(selectedWidget.config || {}), // Override with existing config
             };
             console.log("Resetting form with config:", mergedConfig);
             form.reset(mergedConfig);
        } else {
            form.reset({}); // Reset to empty if no widget selected
        }
    }, [selectedWidget, form]); // Removed currentDefaults dependency as it's static


    // --- Handle Form Submission (on blur or specific interactions) ---
     const handleBlurUpdate = (fieldName: string) => async () => {
         if (!selectedWidget) return;
         // Trigger validation only for the field that lost focus
         const result = await form.trigger(fieldName as any);
         if (result) {
             const data = form.getValues();
             console.log(`Updating widget config (on blur: ${fieldName}):`, selectedWidget.id, data);
             updateWidgetConfig(selectedWidget.id, data);
         } else {
             console.log(`Validation failed for ${fieldName}:`, form.formState.errors);
         }
     };

    // --- Watch form changes and auto-submit for specific controls ---
    useEffect(() => {
        const subscription = form.watch((value, { name /*, type */ }) => {
             // Auto-update specific fields immediately (sliders, checkboxes, selects)
             const instantUpdateFields = [
                'marginTop', 'marginBottom', 'height', 'gap', 'zoomLevel', // Sliders
                'showDividers', 'isBold', 'isItalic', 'showMarker', 'autoplay', 'showControls', // Booleans (general)
                 'showBackButton', 'showMenuButton', 'showCartIcon', 'showAuthButton', // Booleans (header)
                'columns', 'itemLayout', 'fontSize', 'alignment', 'variant', 'size', 'aspectRatio', 'imageFit', 'itemAspectRatio', 'imageSize', 'textColor', 'mapStyle', // Selects
            ];

            if (name && instantUpdateFields.includes(name)) {
                 if (selectedWidget && currentSchema) {
                    // We use getValues because 'value' might only contain the changed field
                    const currentValues = form.getValues();
                    // Validate the specific changed field first for immediate feedback
                    currentSchema.pick({ [name]: true } as any).safeParseAsync({ [name]: currentValues[name] }).then(fieldResult => {
                        if (fieldResult.success) {
                             // If single field is valid, update the full config
                             currentSchema.safeParseAsync(currentValues).then(fullResult => {
                                if (fullResult.success) {
                                     console.log(`Updating widget config (instant: ${name}):`, selectedWidget.id, fullResult.data);
                                     updateWidgetConfig(selectedWidget.id, fullResult.data);
                                } else {
                                      console.warn(`Instant update validation failed for full object after ${name} change:`, fullResult.error.flatten().fieldErrors);
                                }
                             });

                        } else {
                             console.warn(`Instant update validation failed for ${name}:`, fieldResult.error.flatten().fieldErrors);
                        }
                    });
                 }
            }
             // Text inputs/Textareas update on blur (handled by onBlur on the input)
        });
        return () => subscription.unsubscribe();
    }, [form, selectedWidget, updateWidgetConfig, currentSchema]);


    // --- Render Common Fields ---
    const renderCommonFields = () => (
         <>
             <hr className="my-4 border-border" />
             <h3 className="text-md font-medium text-foreground mb-3 px-2">Spacing</h3>
             <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-2">
                 <div className="space-y-2">
                    <Label htmlFor="marginTop">Margin Top ({form.watch('marginTop') ?? widgetDefaultValuesMap.banner.marginTop})</Label>
                    <Controller
                        name="marginTop"
                        control={form.control}
                        defaultValue={widgetDefaultValuesMap.banner.marginTop} // Provide default
                        render={({ field }) => (
                            <Slider
                                id="marginTop"
                                min={0}
                                max={20}
                                step={1}
                                value={[field.value ?? widgetDefaultValuesMap.banner.marginTop ?? 2]}
                                onValueChange={(value) => field.onChange(value[0])}
                                aria-label="Margin Top"
                            />
                        )}
                    />
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="marginBottom">Margin Bottom ({form.watch('marginBottom') ?? widgetDefaultValuesMap.banner.marginBottom})</Label>
                     <Controller
                        name="marginBottom"
                        control={form.control}
                        defaultValue={widgetDefaultValuesMap.banner.marginBottom} // Provide default
                        render={({ field }) => (
                             <Slider
                                id="marginBottom"
                                min={0}
                                max={20}
                                step={1}
                                value={[field.value ?? widgetDefaultValuesMap.banner.marginBottom ?? 2]}
                                onValueChange={(value) => field.onChange(value[0])}
                                aria-label="Margin Bottom"
                            />
                        )}
                    />
                 </div>
             </div>
         </>
    );

    // --- Render Configuration Fields Based on Widget Type ---
    const renderConfigFields = () => {
        if (!selectedWidget) return null;

        let specificFields = null;
        const errors = form.formState.errors;

        switch (selectedWidget.type) {
             case 'header':
                specificFields = (
                     <>
                         <div className="space-y-2">
                            <Label htmlFor="title">Header Title</Label>
                            <Controller
                                name="title"
                                control={form.control}
                                render={({ field }) => <Input id="title" placeholder="App Name" {...field} onBlur={handleBlurUpdate('title')} />}
                            />
                            {errors.title && <p className="text-sm text-destructive">{(errors.title as any)?.message}</p>}
                        </div>
                        <hr className="my-3 border-border" />
                        <h4 className="text-sm font-medium text-foreground mb-2">Button Visibility</h4>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                             <div className="flex items-center space-x-2">
                                <Controller name="showBackButton" control={form.control} defaultValue={widgetDefaultValuesMap.header.showBackButton} render={({ field }) => <Checkbox id="showBackButton" checked={field.value ?? false} onCheckedChange={field.onChange} />} />
                                <Label htmlFor="showBackButton">Back Button</Label>
                             </div>
                              <div className="flex items-center space-x-2">
                                <Controller name="showMenuButton" control={form.control} defaultValue={widgetDefaultValuesMap.header.showMenuButton} render={({ field }) => <Checkbox id="showMenuButton" checked={field.value ?? true} onCheckedChange={field.onChange} />} />
                                <Label htmlFor="showMenuButton">Menu Button</Label>
                             </div>
                              <div className="flex items-center space-x-2">
                                <Controller name="showCartIcon" control={form.control} defaultValue={widgetDefaultValuesMap.header.showCartIcon} render={({ field }) => <Checkbox id="showCartIcon" checked={field.value ?? true} onCheckedChange={field.onChange} />} />
                                <Label htmlFor="showCartIcon">Cart Icon</Label>
                             </div>
                              <div className="flex items-center space-x-2">
                                <Controller name="showAuthButton" control={form.control} defaultValue={widgetDefaultValuesMap.header.showAuthButton} render={({ field }) => <Checkbox id="showAuthButton" checked={field.value ?? true} onCheckedChange={field.onChange} />} />
                                <Label htmlFor="showAuthButton">Auth Button</Label>
                             </div>
                         </div>
                         <div className="space-y-2 mt-3">
                            <Label htmlFor="authButtonText">Auth Button Text</Label>
                            <Controller
                                name="authButtonText"
                                control={form.control}
                                render={({ field }) => <Input id="authButtonText" placeholder="Login" {...field} onBlur={handleBlurUpdate('authButtonText')} disabled={!form.watch('showAuthButton')} />}
                            />
                            {errors.authButtonText && <p className="text-sm text-destructive">{(errors.authButtonText as any)?.message}</p>}
                        </div>
                          <p className="text-xs text-muted-foreground mt-3">Header appearance (colors, fonts) is controlled by the global theme.</p>
                     </>
                 );
                break;
            case 'banner':
                specificFields = (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="imageUrl">Image URL</Label>
                            <Controller
                                name="imageUrl"
                                control={form.control}
                                render={({ field }) => <Input id="imageUrl" placeholder="https://..." {...field} onBlur={handleBlurUpdate('imageUrl')} />}
                            />
                            {errors.imageUrl && <p className="text-sm text-destructive">{(errors.imageUrl as any)?.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="altText">Alt Text</Label>
                            <Controller
                                name="altText"
                                control={form.control}
                                render={({ field }) => <Input id="altText" placeholder="Descriptive text" {...field} onBlur={handleBlurUpdate('altText')} />}
                            />
                             {errors.altText && <p className="text-sm text-destructive">{(errors.altText as any)?.message}</p>}
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="linkUrl">Link URL (Optional)</Label>
                            <Controller
                                name="linkUrl"
                                control={form.control}
                                render={({ field }) => <Input id="linkUrl" placeholder="https://..." {...field} onBlur={handleBlurUpdate('linkUrl')} />}
                            />
                             {errors.linkUrl && <p className="text-sm text-destructive">{(errors.linkUrl as any)?.message}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="imageFit">Image Fit</Label>
                                <Controller name="imageFit" control={form.control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger id="imageFit"><SelectValue placeholder="Select fit" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="cover">Cover</SelectItem>
                                                <SelectItem value="contain">Contain</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="aspectRatio">Aspect Ratio</Label>
                                <Controller name="aspectRatio" control={form.control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger id="aspectRatio"><SelectValue placeholder="Select ratio" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="16/9">16:9</SelectItem>
                                                <SelectItem value="4/3">4:3</SelectItem>
                                                <SelectItem value="1/1">1:1</SelectItem>
                                                <SelectItem value="21/9">21:9</SelectItem>
                                                <SelectItem value="auto">Auto</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )} />
                             </div>
                        </div>
                    </>
                );
                break;
            case 'grid':
                 specificFields = (
                     <>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="columns">Columns</Label>
                                <Controller
                                    name="columns"
                                    control={form.control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger id="columns">
                                                <SelectValue placeholder="Select columns" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">1 Column</SelectItem>
                                                <SelectItem value="2">2 Columns</SelectItem>
                                                <SelectItem value="3">3 Columns</SelectItem>
                                                <SelectItem value="4">4 Columns</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="itemAspectRatio">Item Aspect Ratio</Label>
                                <Controller name="itemAspectRatio" control={form.control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger id="itemAspectRatio"><SelectValue placeholder="Select ratio" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1/1">1:1 (Square)</SelectItem>
                                                <SelectItem value="4/3">4:3</SelectItem>
                                                <SelectItem value="3/4">3:4</SelectItem>
                                                <SelectItem value="16/9">16:9</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )} />
                             </div>
                         </div>
                         <div className="space-y-2">
                              <Label htmlFor="gap">Gap ({form.watch('gap') ?? widgetDefaultValuesMap.grid.gap})</Label>
                              <Controller
                                name="gap"
                                control={form.control}
                                defaultValue={widgetDefaultValuesMap.grid.gap} // Provide default
                                render={({ field }) => <Slider id="gap" min={0} max={10} step={1} value={[field.value ?? widgetDefaultValuesMap.grid.gap ?? 4]} onValueChange={val => field.onChange(val[0])} aria-label="Grid Gap"/>}
                            />
                             {errors.gap && <p className="text-sm text-destructive">{(errors.gap as any)?.message}</p>}
                         </div>
                         <div className="space-y-2">
                            <Label htmlFor="dataSource">Data Source</Label>
                             <Controller
                                name="dataSource"
                                control={form.control}
                                render={({ field }) => <Input id="dataSource" placeholder="API endpoint or ID" {...field} onBlur={handleBlurUpdate('dataSource')} />}
                            />
                             <p className="text-xs text-muted-foreground">Identifier for fetching product data.</p>
                             {errors.dataSource && <p className="text-sm text-destructive">{(errors.dataSource as any)?.message}</p>}
                         </div>
                     </>
                 );
                  break;
             case 'list':
                 specificFields = (
                     <>
                         <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                 <Label htmlFor="itemLayout">Item Layout</Label>
                                 <Controller
                                     name="itemLayout"
                                     control={form.control}
                                     render={({ field }) => (
                                         <Select onValueChange={field.onChange} value={field.value}>
                                             <SelectTrigger id="itemLayout">
                                                 <SelectValue placeholder="Select layout" />
                                             </SelectTrigger>
                                             <SelectContent>
                                                 <SelectItem value="simple">Simple Text</SelectItem>
                                                 <SelectItem value="detailed">Detailed</SelectItem>
                                                 <SelectItem value="image-left">Image Left</SelectItem>
                                                 <SelectItem value="image-right">Image Right</SelectItem>
                                             </SelectContent>
                                         </Select>
                                     )}
                                 />
                             </div>
                             <div className="space-y-2">
                                <Label htmlFor="imageSize">Image Size</Label>
                                <Controller name="imageSize" control={form.control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value} disabled={!['image-left', 'image-right'].includes(form.watch('itemLayout') ?? '')}>
                                            <SelectTrigger id="imageSize"><SelectValue placeholder="Select size" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="sm">Small</SelectItem>
                                                <SelectItem value="md">Medium</SelectItem>
                                                <SelectItem value="lg">Large</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )} />
                             </div>
                         </div>
                         <div className="flex items-center space-x-2 pt-2">
                            <Controller
                                name="showDividers"
                                control={form.control}
                                defaultValue={widgetDefaultValuesMap.list.showDividers} // Provide default
                                render={({ field }) => <Checkbox id="showDividers" checked={field.value ?? true} onCheckedChange={field.onChange} />}
                            />
                             <Label htmlFor="showDividers">Show Dividers</Label>
                         </div>
                         <div className="space-y-2 pt-2">
                            <Label htmlFor="dataSource">Data Source</Label>
                             <Controller
                                name="dataSource"
                                control={form.control}
                                render={({ field }) => <Input id="dataSource" placeholder="API endpoint or ID" {...field} onBlur={handleBlurUpdate('dataSource')} />}
                            />
                              <p className="text-xs text-muted-foreground">Identifier for fetching item data.</p>
                              {errors.dataSource && <p className="text-sm text-destructive">{(errors.dataSource as any)?.message}</p>}
                         </div>
                     </>
                 );
                  break;
             case 'form':
                 specificFields = (
                     <>
                         <div className="space-y-2">
                             <Label htmlFor="submitButtonText">Submit Button Text</Label>
                              <Controller
                                name="submitButtonText"
                                control={form.control}
                                render={({ field }) => <Input id="submitButtonText" {...field} onBlur={handleBlurUpdate('submitButtonText')} />}
                            />
                             {errors.submitButtonText && <p className="text-sm text-destructive">{(errors.submitButtonText as any)?.message}</p>}
                         </div>
                          <div className="space-y-2">
                             <Label htmlFor="recipientEmail">Recipient Email</Label>
                              <Controller
                                name="recipientEmail"
                                control={form.control}
                                render={({ field }) => <Input id="recipientEmail" type="email" placeholder="your@email.com" {...field} onBlur={handleBlurUpdate('recipientEmail')} />}
                            />
                              {errors.recipientEmail && <p className="text-sm text-destructive">{(errors.recipientEmail as any)?.message}</p>}
                          </div>
                           <div className="space-y-2">
                             <Label htmlFor="successMessage">Success Message</Label>
                              <Controller
                                name="successMessage"
                                control={form.control}
                                render={({ field }) => <Textarea id="successMessage" {...field} onBlur={handleBlurUpdate('successMessage')} />}
                            />
                              {errors.successMessage && <p className="text-sm text-destructive">{(errors.successMessage as any)?.message}</p>}
                          </div>
                         <p className="text-sm text-muted-foreground pt-2">Form fields configuration coming soon...</p>
                     </>
                 );
                  break;
            case 'text':
                 specificFields = (
                     <>
                         <div className="space-y-2">
                             <Label htmlFor="content">Text Content</Label>
                             <Controller
                                name="content"
                                control={form.control}
                                render={({ field }) => <Textarea id="content" {...field} rows={4} onBlur={handleBlurUpdate('content')} />}
                            />
                             {errors.content && <p className="text-sm text-destructive">{(errors.content as any)?.message}</p>}
                         </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="fontSize">Font Size</Label>
                                <Controller name="fontSize" control={form.control} render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger id="fontSize"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="xs">XS</SelectItem>
                                            <SelectItem value="sm">SM</SelectItem>
                                            <SelectItem value="base">Base</SelectItem>
                                            <SelectItem value="lg">LG</SelectItem>
                                            <SelectItem value="xl">XL</SelectItem>
                                            <SelectItem value="2xl">2XL</SelectItem>
                                            <SelectItem value="3xl">3XL</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="alignment">Alignment</Label>
                                <Controller name="alignment" control={form.control} render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger id="alignment"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="left">Left</SelectItem>
                                            <SelectItem value="center">Center</SelectItem>
                                            <SelectItem value="right">Right</SelectItem>
                                            <SelectItem value="justify">Justify</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="textColor">Text Color</Label>
                                <Controller name="textColor" control={form.control} render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger id="textColor"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="default">Default</SelectItem>
                                            <SelectItem value="primary">Primary</SelectItem>
                                            <SelectItem value="secondary">Secondary</SelectItem>
                                            <SelectItem value="accent">Accent</SelectItem>
                                            <SelectItem value="muted">Muted</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )} />
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 pt-2">
                                <div className="flex items-center space-x-2">
                                      <Controller name="isBold" control={form.control} defaultValue={widgetDefaultValuesMap.text.isBold} render={({ field }) => <Checkbox id="isBold" checked={field.value ?? false} onCheckedChange={field.onChange} />} />
                                      <Label htmlFor="isBold">Bold</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                     <Controller name="isItalic" control={form.control} defaultValue={widgetDefaultValuesMap.text.isItalic} render={({ field }) => <Checkbox id="isItalic" checked={field.value ?? false} onCheckedChange={field.onChange} />} />
                                     <Label htmlFor="isItalic">Italic</Label>
                                </div>
                          </div>
                     </>
                 );
                  break;
             case 'button':
                 specificFields = (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="buttonText">Button Text</Label>
                             <Controller name="buttonText" control={form.control} render={({ field }) => <Input id="buttonText" {...field} onBlur={handleBlurUpdate('buttonText')}/>} />
                             {errors.buttonText && <p className="text-sm text-destructive">{(errors.buttonText as any)?.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="linkUrl">Link URL</Label>
                             <Controller name="linkUrl" control={form.control} render={({ field }) => <Input id="linkUrl" placeholder="https://..." {...field} onBlur={handleBlurUpdate('linkUrl')} />} />
                              {errors.linkUrl && <p className="text-sm text-destructive">{(errors.linkUrl as any)?.message}</p>}
                        </div>
                         <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="variant">Variant</Label>
                                <Controller name="variant" control={form.control} render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger id="variant"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="default">Default</SelectItem>
                                            <SelectItem value="destructive">Destructive</SelectItem>
                                            <SelectItem value="outline">Outline</SelectItem>
                                            <SelectItem value="secondary">Secondary</SelectItem>
                                            <SelectItem value="ghost">Ghost</SelectItem>
                                            <SelectItem value="link">Link</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="size">Size</Label>
                                <Controller name="size" control={form.control} render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger id="size"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="default">Default</SelectItem>
                                            <SelectItem value="sm">Small</SelectItem>
                                            <SelectItem value="lg">Large</SelectItem>
                                            <SelectItem value="icon">Icon</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="alignment">Alignment</Label>
                                <Controller name="alignment" control={form.control} render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger id="alignment"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="left">Left</SelectItem>
                                            <SelectItem value="center">Center</SelectItem>
                                            <SelectItem value="right">Right</SelectItem>
                                            <SelectItem value="full">Full Width</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )} />
                            </div>
                        </div>
                    </>
                 );
                  break;
             case 'spacer':
                 specificFields = (
                    <div className="space-y-2">
                          <Label htmlFor="height">Height ({form.watch('height') ?? widgetDefaultValuesMap.spacer.height})</Label>
                          <Controller
                            name="height"
                            control={form.control}
                            defaultValue={widgetDefaultValuesMap.spacer.height} // Provide default
                            render={({ field }) => <Slider id="height" min={1} max={40} step={1} value={[field.value ?? widgetDefaultValuesMap.spacer.height ?? 4]} onValueChange={val => field.onChange(val[0])} aria-label="Spacer Height"/>}
                        />
                        <p className="text-xs text-muted-foreground">Adjust the vertical space (1 unit ≈ 0.25rem).</p>
                         {errors.height && <p className="text-sm text-destructive">{(errors.height as any)?.message}</p>}
                    </div>
                 );
                  break;
             case 'map':
                  specificFields = (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="address">Address or Location</Label>
                            <Controller name="address" control={form.control} render={({ field }) => <Textarea id="address" {...field} rows={2} placeholder="e.g., 1 Infinite Loop, Cupertino, CA" onBlur={handleBlurUpdate('address')} />} />
                             {errors.address && <p className="text-sm text-destructive">{(errors.address as any)?.message}</p>}
                        </div>
                         <div className="space-y-2">
                              <Label htmlFor="zoomLevel">Zoom Level ({form.watch('zoomLevel') ?? widgetDefaultValuesMap.map.zoomLevel})</Label>
                              <Controller name="zoomLevel" control={form.control} defaultValue={widgetDefaultValuesMap.map.zoomLevel} render={({ field }) => <Slider id="zoomLevel" min={1} max={20} step={1} value={[field.value ?? widgetDefaultValuesMap.map.zoomLevel ?? 15]} onValueChange={val => field.onChange(val[0])} aria-label="Map Zoom Level" />} />
                             {errors.zoomLevel && <p className="text-sm text-destructive">{(errors.zoomLevel as any)?.message}</p>}
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                             <div className="flex items-center space-x-2 pt-2">
                                 <Controller name="showMarker" control={form.control} defaultValue={widgetDefaultValuesMap.map.showMarker} render={({ field }) => <Checkbox id="showMarker" checked={field.value ?? true} onCheckedChange={field.onChange} />} />
                                 <Label htmlFor="showMarker">Show Marker</Label>
                             </div>
                             <div className="space-y-2">
                                <Label htmlFor="mapStyle">Map Style</Label>
                                <Controller name="mapStyle" control={form.control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger id="mapStyle"><SelectValue placeholder="Select style" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="roadmap">Roadmap</SelectItem>
                                                <SelectItem value="satellite">Satellite</SelectItem>
                                                <SelectItem value="hybrid">Hybrid</SelectItem>
                                                <SelectItem value="terrain">Terrain</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )} />
                            </div>
                         </div>
                    </>
                  );
                  break;
             case 'video':
                  specificFields = (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="videoUrl">Video URL</Label>
                             <Controller name="videoUrl" control={form.control} render={({ field }) => <Input id="videoUrl" placeholder="https://youtube.com/watch?v=..." {...field} onBlur={handleBlurUpdate('videoUrl')} />} />
                            {errors.videoUrl && <p className="text-sm text-destructive">{(errors.videoUrl as any)?.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="aspectRatio">Aspect Ratio</Label>
                            <Controller
                                name="aspectRatio"
                                control={form.control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger id="aspectRatio"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="16/9">16:9 (Widescreen)</SelectItem>
                                            <SelectItem value="4/3">4:3 (Standard)</SelectItem>
                                            <SelectItem value="1/1">1:1 (Square)</SelectItem>
                                            <SelectItem value="9/16">9:16 (Vertical)</SelectItem>
                                            <SelectItem value="auto">Auto</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        <div className="flex items-center space-x-4 pt-2">
                            <div className="flex items-center space-x-2">
                                 <Controller name="autoplay" control={form.control} defaultValue={widgetDefaultValuesMap.video.autoplay} render={({ field }) => <Checkbox id="autoplay" checked={field.value ?? false} onCheckedChange={field.onChange} />} />
                                 <Label htmlFor="autoplay">Autoplay (Use with caution)</Label>
                             </div>
                              <div className="flex items-center space-x-2">
                                 <Controller name="showControls" control={form.control} defaultValue={widgetDefaultValuesMap.video.showControls} render={({ field }) => <Checkbox id="showControls" checked={field.value ?? true} onCheckedChange={field.onChange} />} />
                                 <Label htmlFor="showControls">Show Controls</Label>
                             </div>
                         </div>
                    </>
                  );
                  break;
            default:
                specificFields = <p className="text-sm text-muted-foreground">No specific configuration available for this widget type.</p>;
        }

         // Combine common and specific fields
         return (
            <>
              {specificFields}
              {/* Render common margin fields only if the widget type is NOT 'spacer' or 'header' */}
              {selectedWidget.type !== 'spacer' && selectedWidget.type !== 'header' && renderCommonFields()}
            </>
        );
    };

    return (
        <div className={cn("h-full flex flex-col bg-secondary/50 border-l", className)}> {/* Use className */}
            <div className="p-4">
                 <h2 className="text-xl font-semibold text-primary mb-4 px-2">Configuration</h2>
                 <Card className="flex-1 overflow-hidden bg-card shadow-none border-0">
                    <CardHeader className="pb-4 pt-0 px-2">
                        <CardTitle className="text-lg capitalize">
                            {selectedWidget ? `${selectedWidget.name || selectedWidget.type} Settings` : 'Select a Widget'}
                        </CardTitle>
                    </CardHeader>
                    {/* Use a fixed height container for the scrollable content */}
                     {/* Adjust height calculation if ThemeSelector is outside Card */}
                     <div className="h-[calc(100vh-18rem)] overflow-y-auto"> {/* Adjust based on surrounding elements */}
                       <CardContent className="space-y-4 px-2 pb-4">
                            {selectedWidget ? (
                                <form
                                    onSubmit={(e) => e.preventDefault()} // Prevent default browser submission
                                    className="space-y-4"
                                    key={selectedWidget.id} // Force re-render and reset on widget change
                                >
                                    {renderConfigFields()}
                                </form>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-10">
                                     <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mouse-pointer-click mb-4 opacity-50"><path d="m9 9 5 12 1.8-5.2L21 14Z"/><path d="M7.2 2.2 8 7.1"/><path d="m5.1 5.1 3.5 3.5"/><path d="M2 13h6"/><path d="M3 3l7.07 7.07"/></svg>
                                    <p>
                                        Click on a widget in the preview to configure its settings here.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                     </div>
                 </Card>
            </div>
             {/* Theme Selector at the bottom */}
            <div className="mt-auto p-4 border-t border-border">
                <ThemeSelector />
            </div>
        </div>
    );
}
