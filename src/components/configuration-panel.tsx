
'use client';

import React, { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
    // Common fields if any, maybe spacing?
    marginTop: z.number().min(0).optional(),
    marginBottom: z.number().min(0).optional(),
});

const BannerConfigSchema = BaseWidgetSchema.extend({
    imageUrl: z.string().url().optional().or(z.literal('')),
    altText: z.string().optional(),
    linkUrl: z.string().url().optional().or(z.literal('')),
});
type BannerConfigFormData = z.infer<typeof BannerConfigSchema>;

const GridConfigSchema = BaseWidgetSchema.extend({
    columns: z.enum(['2', '3', '4']).default('2'),
    gap: z.number().min(0).max(10).default(2),
    // Add more grid-specific fields: data source, item template, etc.
});
type GridConfigFormData = z.infer<typeof GridConfigSchema>;

const ListConfigSchema = BaseWidgetSchema.extend({
    itemLayout: z.enum(['simple', 'detailed', 'image-left']).default('simple'),
    showDividers: z.boolean().default(true),
     // Add more list-specific fields: data source, item fields, etc.
});
type ListConfigFormData = z.infer<typeof ListConfigSchema>;

const FormConfigSchema = BaseWidgetSchema.extend({
    submitButtonText: z.string().default('Submit'),
    recipientEmail: z.string().email().optional(),
    // Add more form-specific fields: fields definition, success message, etc.
});
type FormConfigFormData = z.infer<typeof FormConfigSchema>;

// --- Map widget types to their schemas and default values ---
const widgetSchemaMap = {
    banner: BannerConfigSchema,
    grid: GridConfigSchema,
    list: ListConfigSchema,
    form: FormConfigSchema,
};

const widgetDefaultValuesMap = {
    banner: { imageUrl: '', altText: '', linkUrl: '' },
    grid: { columns: '2', gap: 2 },
    list: { itemLayout: 'simple', showDividers: true },
    form: { submitButtonText: 'Submit', recipientEmail: '' },
};


// --- Configuration Panel Component ---

export function ConfigurationPanel({ selectedWidget, updateWidgetConfig }: ConfigurationPanelProps) {

    const currentSchema = selectedWidget ? widgetSchemaMap[selectedWidget.type as keyof typeof widgetSchemaMap] : null;
    const currentDefaults = selectedWidget ? widgetDefaultValuesMap[selectedWidget.type as keyof typeof widgetDefaultValuesMap] : {};

    const form = useForm({
        resolver: currentSchema ? zodResolver(currentSchema) : undefined,
        defaultValues: currentDefaults,
    });

     // Reset form when selected widget changes
     useEffect(() => {
        if (selectedWidget) {
            form.reset(selectedWidget.config || currentDefaults); // Use existing config or defaults
        } else {
            form.reset({}); // Reset to empty if no widget selected
        }
    }, [selectedWidget, form, currentDefaults]);


    // --- Handle Form Submission ---
     const onSubmit = (data: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        if (selectedWidget) {
            console.log('Updating widget config:', selectedWidget.id, data);
            updateWidgetConfig(selectedWidget.id, data);
            // Optionally show a toast message
        }
    };

     // Watch form changes and auto-submit (debounced would be better in real app)
     useEffect(() => {
        const subscription = form.watch((value) => {
             // Only submit if the form is valid according to the current schema
            if (selectedWidget && currentSchema) {
                 currentSchema.safeParseAsync(value).then(result => {
                    if (result.success) {
                        onSubmit(value);
                    }
                 });
            }
        });
        return () => subscription.unsubscribe();
    }, [form, selectedWidget, onSubmit, currentSchema]);


    // --- Render Configuration Fields Based on Widget Type ---
    const renderConfigFields = () => {
        if (!selectedWidget) return null;

        switch (selectedWidget.type) {
            case 'banner':
                return (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="imageUrl">Image URL</Label>
                            <Controller
                                name="imageUrl"
                                control={form.control}
                                render={({ field }) => <Input id="imageUrl" placeholder="https://..." {...field} />}
                            />
                            {form.formState.errors.imageUrl && <p className="text-sm text-destructive">{(form.formState.errors.imageUrl as { message?: string })?.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="altText">Alt Text</Label>
                            <Controller
                                name="altText"
                                control={form.control}
                                render={({ field }) => <Input id="altText" placeholder="Descriptive text" {...field} />}
                            />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="linkUrl">Link URL (Optional)</Label>
                            <Controller
                                name="linkUrl"
                                control={form.control}
                                render={({ field }) => <Input id="linkUrl" placeholder="https://..." {...field} />}
                            />
                             {form.formState.errors.linkUrl && <p className="text-sm text-destructive">{(form.formState.errors.linkUrl as { message?: string })?.message}</p>}
                        </div>
                    </>
                );
            case 'grid':
                 return (
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
                             <Label htmlFor="gap">Gap (0-10)</Label>
                              <Controller
                                name="gap"
                                control={form.control}
                                render={({ field }) => <Input id="gap" type="number" min="0" max="10" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />}
                            />
                             {form.formState.errors.gap && <p className="text-sm text-destructive">{(form.formState.errors.gap as { message?: string })?.message}</p>}
                         </div>
                         {/* TODO: Add fields for data source, item template */}
                         <p className="text-sm text-muted-foreground">More grid options coming soon...</p>
                     </>
                 );
             case 'list':
                 return (
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
                         {/* TODO: Add fields for data source, fields to display */}
                         <p className="text-sm text-muted-foreground">More list options coming soon...</p>
                     </>
                 );
             case 'form':
                 return (
                     <>
                         <div className="space-y-2">
                             <Label htmlFor="submitButtonText">Submit Button Text</Label>
                              <Controller
                                name="submitButtonText"
                                control={form.control}
                                render={({ field }) => <Input id="submitButtonText" {...field} />}
                            />
                         </div>
                          <div className="space-y-2">
                             <Label htmlFor="recipientEmail">Recipient Email (Optional)</Label>
                              <Controller
                                name="recipientEmail"
                                control={form.control}
                                render={({ field }) => <Input id="recipientEmail" type="email" placeholder="your@email.com" {...field} />}
                            />
                              {form.formState.errors.recipientEmail && <p className="text-sm text-destructive">{(form.formState.errors.recipientEmail as { message?: string })?.message}</p>}
                          </div>
                         {/* TODO: Add fields for form fields definition */}
                         <p className="text-sm text-muted-foreground">More form options coming soon...</p>
                     </>
                 );
            default:
                return <p className="text-sm text-muted-foreground">No configuration available for this widget type.</p>;
        }
    };

    return (
        <div className="p-4 h-full flex flex-col">
            <h2 className="text-xl font-semibold text-primary mb-4">Configuration</h2>
            <Card className="flex-1 overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-lg capitalize">
                        {selectedWidget ? `${selectedWidget.type} Settings` : 'Select a Widget'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 overflow-y-auto h-[calc(100%-theme(spacing.24))]"> {/* Adjust height based on header */}
                    {selectedWidget ? (
                        <form
                            // onSubmit={form.handleSubmit(onSubmit)} // Auto-submitting on change
                            className="space-y-4"
                        >
                            {renderConfigFields()}
                           {/* <Button type="submit" disabled={!form.formState.isDirty || !form.formState.isValid}>
                                Apply Changes
                            </Button> */}
                        </form>
                    ) : (
                        <p className="text-muted-foreground text-center pt-10">
                            Click on a widget in the preview to configure it.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
