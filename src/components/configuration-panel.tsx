
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

interface ConfigurationPanelProps {
  selectedWidget: DroppedWidget | null;
  updateWidgetConfig: (widgetId: string, newConfig: Partial<DroppedWidget['config']>) => void;
}

// --- Define Zod schemas for each widget type ---

const BaseWidgetSchema = z.object({
    // Common fields
    marginTop: z.number().min(0).max(20).default(2), // Use Tailwind scale (e.g., 1 = 0.25rem)
    marginBottom: z.number().min(0).max(20).default(2),
});

// Banner
const BannerConfigSchema = BaseWidgetSchema.extend({
    imageUrl: z.string().url({ message: "Must be a valid URL" }).optional().or(z.literal('')),
    altText: z.string().optional(),
    linkUrl: z.string().url({ message: "Must be a valid URL" }).optional().or(z.literal('')),
});
type BannerConfigFormData = z.infer<typeof BannerConfigSchema>;

// Grid
const GridConfigSchema = BaseWidgetSchema.extend({
    columns: z.enum(['2', '3', '4']).default('2'),
    gap: z.number().min(0).max(10).default(2),
    dataSource: z.string().optional().describe("API Endpoint or identifier for product data"), // Example data source
});
type GridConfigFormData = z.infer<typeof GridConfigSchema>;

// List
const ListConfigSchema = BaseWidgetSchema.extend({
    itemLayout: z.enum(['simple', 'detailed', 'image-left']).default('simple'),
    showDividers: z.boolean().default(true),
    dataSource: z.string().optional().describe("API Endpoint or identifier for product data"), // Example data source
});
type ListConfigFormData = z.infer<typeof ListConfigSchema>;

// Form
const FormConfigSchema = BaseWidgetSchema.extend({
    submitButtonText: z.string().default('Submit'),
    recipientEmail: z.string().email({ message: "Invalid email address" }).optional().or(z.literal('')),
    successMessage: z.string().default('Thank you for your submission!'),
     // TODO: Define form fields structure (e.g., array of objects)
});
type FormConfigFormData = z.infer<typeof FormConfigSchema>;

// Text Block
const TextConfigSchema = BaseWidgetSchema.extend({
    content: z.string().default('Enter your text here...'),
    fontSize: z.enum(['xs', 'sm', 'base', 'lg', 'xl', '2xl']).default('base'),
    alignment: z.enum(['left', 'center', 'right']).default('left'),
    isBold: z.boolean().default(false),
    isItalic: z.boolean().default(false),
});
type TextConfigFormData = z.infer<typeof TextConfigSchema>;

// Button
const ButtonConfigSchema = BaseWidgetSchema.extend({
    buttonText: z.string().default('Click Me'),
    linkUrl: z.string().url({ message: "Must be a valid URL" }).optional().or(z.literal('')),
    variant: z.enum(['default', 'destructive', 'outline', 'secondary', 'ghost', 'link']).default('default'),
    alignment: z.enum(['left', 'center', 'right']).default('center'),
});
type ButtonConfigFormData = z.infer<typeof ButtonConfigSchema>;

// Spacer
const SpacerConfigSchema = BaseWidgetSchema.extend({
    height: z.number().min(1).max(40).default(4), // Corresponds to Tailwind spacing scale (e.g., 4 = 1rem)
});
type SpacerConfigFormData = z.infer<typeof SpacerConfigSchema>;

// Map
const MapConfigSchema = BaseWidgetSchema.extend({
    address: z.string().default('1600 Amphitheatre Parkway, Mountain View, CA'),
    zoomLevel: z.number().min(1).max(20).default(15),
    showMarker: z.boolean().default(true),
});
type MapConfigFormData = z.infer<typeof MapConfigSchema>;

// Video
const VideoConfigSchema = BaseWidgetSchema.extend({
    videoUrl: z.string().url({ message: "Must be a valid video URL (e.g., YouTube, Vimeo)" }).optional().or(z.literal('')),
    aspectRatio: z.enum(['16/9', '4/3', '1/1', '9/16']).default('16/9'),
    autoplay: z.boolean().default(false),
});
type VideoConfigFormData = z.infer<typeof VideoConfigSchema>;


// --- Map widget types to their schemas and default values ---
const widgetSchemaMap = {
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

const widgetDefaultValuesMap = {
    banner: { imageUrl: '', altText: '', linkUrl: '', marginTop: 2, marginBottom: 2 },
    grid: { columns: '2', gap: 2, dataSource: '', marginTop: 2, marginBottom: 2 },
    list: { itemLayout: 'simple', showDividers: true, dataSource: '', marginTop: 2, marginBottom: 2 },
    form: { submitButtonText: 'Submit', recipientEmail: '', successMessage: 'Thank you!', marginTop: 2, marginBottom: 2 },
    text: { content: 'Enter text...', fontSize: 'base', alignment: 'left', isBold: false, isItalic: false, marginTop: 2, marginBottom: 2 },
    button: { buttonText: 'Click Me', linkUrl: '', variant: 'default', alignment: 'center', marginTop: 2, marginBottom: 2 },
    spacer: { height: 4, marginTop: 0, marginBottom: 0 }, // Spacers often don't need top/bottom margins themselves
    map: { address: '1600 Amphitheatre Parkway, Mountain View, CA', zoomLevel: 15, showMarker: true, marginTop: 2, marginBottom: 2 },
    video: { videoUrl: '', aspectRatio: '16/9', autoplay: false, marginTop: 2, marginBottom: 2 },
};


// --- Configuration Panel Component ---

export function ConfigurationPanel({ selectedWidget, updateWidgetConfig }: ConfigurationPanelProps) {

    const currentSchema = selectedWidget ? widgetSchemaMap[selectedWidget.type as keyof typeof widgetSchemaMap] : BaseWidgetSchema; // Default to Base Schema
    const currentDefaults = selectedWidget ? widgetDefaultValuesMap[selectedWidget.type as keyof typeof widgetDefaultValuesMap] : {};

    const form = useForm({
        resolver: zodResolver(currentSchema),
        defaultValues: selectedWidget?.config || currentDefaults, // Load existing config or defaults
    });

     // Reset form when selected widget changes or when config updates externally
     useEffect(() => {
        if (selectedWidget) {
            form.reset(selectedWidget.config || currentDefaults);
        } else {
            form.reset({}); // Reset to empty if no widget selected
        }
    }, [selectedWidget, form, currentDefaults]);


    // --- Handle Form Submission (on blur or specific interactions) ---
     const handleBlurUpdate = async () => {
         if (!selectedWidget) return;
         const result = await form.trigger(); // Validate the form
         if (result) {
             const data = form.getValues();
             console.log('Updating widget config (on blur):', selectedWidget.id, data);
             updateWidgetConfig(selectedWidget.id, data);
         }
     };

    // --- Watch form changes and auto-submit (debounced) ---
    // Use debounce to avoid excessive updates on every keystroke
    useEffect(() => {
        const subscription = form.watch((value, { name /*, type */ }) => {
             // Auto-update specific fields immediately (like sliders, checkboxes, selects)
            if (name && ['marginTop', 'marginBottom', 'height', 'gap', 'zoomLevel', 'columns', 'itemLayout', 'fontSize', 'alignment', 'variant', 'aspectRatio', 'showDividers', 'isBold', 'isItalic', 'showMarker', 'autoplay'].includes(name)) {
                 if (selectedWidget && currentSchema) {
                    currentSchema.safeParseAsync(value).then(result => {
                        if (result.success) {
                            console.log('Updating widget config (instant):', selectedWidget.id, value);
                            updateWidgetConfig(selectedWidget.id, value);
                        }
                    });
                 }
            }
             // For text inputs, update on blur (handled by onBlur below)
        });
        return () => subscription.unsubscribe();
    }, [form, selectedWidget, updateWidgetConfig, currentSchema]);


    // --- Render Common Fields ---
    const renderCommonFields = () => (
         <>
            <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="marginTop">Margin Top ({form.watch('marginTop')})</Label>
                    <Controller
                        name="marginTop"
                        control={form.control}
                        render={({ field }) => (
                            <Slider
                                id="marginTop"
                                min={0}
                                max={20}
                                step={1}
                                value={[field.value ?? 0]}
                                onValueChange={(value) => field.onChange(value[0])}
                            />
                        )}
                    />
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="marginBottom">Margin Bottom ({form.watch('marginBottom')})</Label>
                     <Controller
                        name="marginBottom"
                        control={form.control}
                        render={({ field }) => (
                             <Slider
                                id="marginBottom"
                                min={0}
                                max={20}
                                step={1}
                                value={[field.value ?? 0]}
                                onValueChange={(value) => field.onChange(value[0])}
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

        switch (selectedWidget.type) {
            case 'banner':
                specificFields = (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="imageUrl">Image URL</Label>
                            <Controller
                                name="imageUrl"
                                control={form.control}
                                render={({ field }) => <Input id="imageUrl" placeholder="https://..." {...field} onBlur={handleBlurUpdate} />}
                            />
                            {form.formState.errors.imageUrl && <p className="text-sm text-destructive">{(form.formState.errors.imageUrl as { message?: string })?.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="altText">Alt Text</Label>
                            <Controller
                                name="altText"
                                control={form.control}
                                render={({ field }) => <Input id="altText" placeholder="Descriptive text" {...field} onBlur={handleBlurUpdate} />}
                            />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="linkUrl">Link URL (Optional)</Label>
                            <Controller
                                name="linkUrl"
                                control={form.control}
                                render={({ field }) => <Input id="linkUrl" placeholder="https://..." {...field} onBlur={handleBlurUpdate} />}
                            />
                             {form.formState.errors.linkUrl && <p className="text-sm text-destructive">{(form.formState.errors.linkUrl as { message?: string })?.message}</p>}
                        </div>
                    </>
                );
                break; // Added break statement
            case 'grid':
                 specificFields = (
                     <>
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
                                             <SelectItem value="2">2 Columns</SelectItem>
                                             <SelectItem value="3">3 Columns</SelectItem>
                                             <SelectItem value="4">4 Columns</SelectItem>
                                         </SelectContent>
                                     </Select>
                                 )}
                             />
                         </div>
                         <div className="space-y-2">
                             <Label htmlFor="gap">Gap ({form.watch('gap')})</Label>
                              <Controller
                                name="gap"
                                control={form.control}
                                render={({ field }) => <Slider id="gap" min={0} max={10} step={1} value={[field.value ?? 0]} onValueChange={val => field.onChange(val[0])} />}
                            />
                             {form.formState.errors.gap && <p className="text-sm text-destructive">{(form.formState.errors.gap as { message?: string })?.message}</p>}
                         </div>
                         <div className="space-y-2">
                            <Label htmlFor="dataSource">Data Source</Label>
                             <Controller
                                name="dataSource"
                                control={form.control}
                                render={({ field }) => <Input id="dataSource" placeholder="API endpoint or ID" {...field} onBlur={handleBlurUpdate} />}
                            />
                             <p className="text-xs text-muted-foreground">Identifier for fetching product data.</p>
                         </div>
                     </>
                 );
                  break; // Added break statement
             case 'list':
                 specificFields = (
                     <>
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
                                         </SelectContent>
                                     </Select>
                                 )}
                             />
                         </div>
                         <div className="flex items-center space-x-2">
                            <Controller
                                name="showDividers"
                                control={form.control}
                                render={({ field }) => <Checkbox id="showDividers" checked={field.value} onCheckedChange={field.onChange} />}
                            />
                             <Label htmlFor="showDividers">Show Dividers</Label>
                         </div>
                         <div className="space-y-2">
                            <Label htmlFor="dataSource">Data Source</Label>
                             <Controller
                                name="dataSource"
                                control={form.control}
                                render={({ field }) => <Input id="dataSource" placeholder="API endpoint or ID" {...field} onBlur={handleBlurUpdate} />}
                            />
                              <p className="text-xs text-muted-foreground">Identifier for fetching product data.</p>
                         </div>
                     </>
                 );
                  break; // Added break statement
             case 'form':
                 specificFields = (
                     <>
                         <div className="space-y-2">
                             <Label htmlFor="submitButtonText">Submit Button Text</Label>
                              <Controller
                                name="submitButtonText"
                                control={form.control}
                                render={({ field }) => <Input id="submitButtonText" {...field} onBlur={handleBlurUpdate} />}
                            />
                         </div>
                          <div className="space-y-2">
                             <Label htmlFor="recipientEmail">Recipient Email</Label>
                              <Controller
                                name="recipientEmail"
                                control={form.control}
                                render={({ field }) => <Input id="recipientEmail" type="email" placeholder="your@email.com" {...field} onBlur={handleBlurUpdate} />}
                            />
                              {form.formState.errors.recipientEmail && <p className="text-sm text-destructive">{(form.formState.errors.recipientEmail as { message?: string })?.message}</p>}
                          </div>
                           <div className="space-y-2">
                             <Label htmlFor="successMessage">Success Message</Label>
                              <Controller
                                name="successMessage"
                                control={form.control}
                                render={({ field }) => <Textarea id="successMessage" {...field} onBlur={handleBlurUpdate} />}
                            />
                          </div>
                         <p className="text-sm text-muted-foreground">Form fields definition coming soon...</p>
                     </>
                 );
                  break; // Added break statement
            case 'text':
                 specificFields = (
                     <>
                         <div className="space-y-2">
                             <Label htmlFor="content">Text Content</Label>
                             <Controller
                                name="content"
                                control={form.control}
                                render={({ field }) => <Textarea id="content" {...field} rows={4} onBlur={handleBlurUpdate} />}
                            />
                         </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="fontSize">Font Size</Label>
                                <Controller
                                    name="fontSize"
                                    control={form.control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger id="fontSize"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="xs">Extra Small</SelectItem>
                                                <SelectItem value="sm">Small</SelectItem>
                                                <SelectItem value="base">Base</SelectItem>
                                                <SelectItem value="lg">Large</SelectItem>
                                                <SelectItem value="xl">XL</SelectItem>
                                                <SelectItem value="2xl">2XL</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="alignment">Alignment</Label>
                                <Controller
                                    name="alignment"
                                    control={form.control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger id="alignment"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="left">Left</SelectItem>
                                                <SelectItem value="center">Center</SelectItem>
                                                <SelectItem value="right">Right</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <Controller name="isBold" control={form.control} render={({ field }) => <Checkbox id="isBold" checked={field.value} onCheckedChange={field.onChange} />} />
                                    <Label htmlFor="isBold">Bold</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Controller name="isItalic" control={form.control} render={({ field }) => <Checkbox id="isItalic" checked={field.value} onCheckedChange={field.onChange} />} />
                                    <Label htmlFor="isItalic">Italic</Label>
                                </div>
                          </div>
                     </>
                 );
                  break; // Added break statement
             case 'button':
                 specificFields = (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="buttonText">Button Text</Label>
                             <Controller name="buttonText" control={form.control} render={({ field }) => <Input id="buttonText" {...field} onBlur={handleBlurUpdate}/>} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="linkUrl">Link URL</Label>
                             <Controller name="linkUrl" control={form.control} render={({ field }) => <Input id="linkUrl" placeholder="https://..." {...field} onBlur={handleBlurUpdate} />} />
                              {form.formState.errors.linkUrl && <p className="text-sm text-destructive">{(form.formState.errors.linkUrl as { message?: string })?.message}</p>}
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="variant">Variant</Label>
                                <Controller
                                    name="variant"
                                    control={form.control}
                                    render={({ field }) => (
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
                                    )}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="alignment">Alignment</Label>
                                <Controller
                                    name="alignment"
                                    control={form.control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger id="alignment"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="left">Left</SelectItem>
                                                <SelectItem value="center">Center</SelectItem>
                                                <SelectItem value="right">Right</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </div>
                    </>
                 );
                  break; // Added break statement
             case 'spacer':
                 specificFields = (
                    <div className="space-y-2">
                         <Label htmlFor="height">Height ({form.watch('height')})</Label>
                         <Controller
                            name="height"
                            control={form.control}
                            render={({ field }) => <Slider id="height" min={1} max={40} step={1} value={[field.value ?? 0]} onValueChange={val => field.onChange(val[0])} />}
                        />
                        <p className="text-xs text-muted-foreground">Adjust the vertical space (1 unit ≈ 0.25rem).</p>
                    </div>
                 );
                  break; // Added break statement
             case 'map':
                  specificFields = (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="address">Address or Location</Label>
                            <Controller name="address" control={form.control} render={({ field }) => <Textarea id="address" {...field} rows={2} placeholder="e.g., 1 Infinite Loop, Cupertino, CA" onBlur={handleBlurUpdate} />} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="zoomLevel">Zoom Level ({form.watch('zoomLevel')})</Label>
                            <Controller name="zoomLevel" control={form.control} render={({ field }) => <Slider id="zoomLevel" min={1} max={20} step={1} value={[field.value ?? 15]} onValueChange={val => field.onChange(val[0])} />} />
                         </div>
                         <div className="flex items-center space-x-2">
                            <Controller name="showMarker" control={form.control} render={({ field }) => <Checkbox id="showMarker" checked={field.value} onCheckedChange={field.onChange} />} />
                            <Label htmlFor="showMarker">Show Marker</Label>
                         </div>
                    </>
                  );
                  break; // Added break statement
             case 'video':
                  specificFields = (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="videoUrl">Video URL</Label>
                             <Controller name="videoUrl" control={form.control} render={({ field }) => <Input id="videoUrl" placeholder="https://youtube.com/watch?v=..." {...field} onBlur={handleBlurUpdate} />} />
                            {form.formState.errors.videoUrl && <p className="text-sm text-destructive">{(form.formState.errors.videoUrl as { message?: string })?.message}</p>}
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
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Controller name="autoplay" control={form.control} render={({ field }) => <Checkbox id="autoplay" checked={field.value} onCheckedChange={field.onChange} />} />
                            <Label htmlFor="autoplay">Autoplay (Use with caution)</Label>
                         </div>
                    </>
                  );
                  break; // Added break statement
            default:
                specificFields = <p className="text-sm text-muted-foreground">No configuration available for this widget type.</p>;
        }

         // Combine common and specific fields
         return (
            <>
              {specificFields}
              {selectedWidget.type !== 'spacer' && <hr className="my-4 border-border" />}
              {selectedWidget.type !== 'spacer' && renderCommonFields()}
            </>
        );
    };

    return (
        <div className="p-4 h-full flex flex-col bg-secondary/50 border-l">
            <h2 className="text-xl font-semibold text-primary mb-4 px-2">Configuration</h2>
            <Card className="flex-1 overflow-hidden bg-card shadow-none border-0">
                <CardHeader className="pb-4 pt-0 px-2">
                    <CardTitle className="text-lg capitalize">
                        {selectedWidget ? `${selectedWidget.type} Settings` : 'Select a Widget'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 overflow-y-auto h-[calc(100%-theme(spacing.16))] px-2 pb-4"> {/* Adjust height based on header */}
                    {selectedWidget ? (
                        <form
                            onSubmit={(e) => e.preventDefault()} // Prevent default browser submission
                            className="space-y-4"
                            key={selectedWidget.id} // Force re-render on widget change
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
            </Card>
        </div>
    );
}
