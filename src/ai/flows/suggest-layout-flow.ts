'use server';
/**
 * @fileOverview AI flow for suggesting widget layouts.
 *
 * - suggestWidgetLayout - Suggests a layout based on the app type.
 * - SuggestWidgetLayoutInput - Input type for the flow.
 * - SuggestWidgetLayoutOutput - Output type for the flow.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';
import type { DroppedWidget } from '@/types/widget'; // Assuming this type exists

const SuggestWidgetLayoutInputSchema = z.object({
  appType: z.enum(['blog', 'store', 'portfolio', 'event', 'other']).describe("The general type or purpose of the app."),
  existingWidgets: z.array(z.object({ type: z.string(), id: z.string() })).optional().describe("List of widgets already present in the layout."),
});
export type SuggestWidgetLayoutInput = z.infer<typeof SuggestWidgetLayoutInputSchema>;

// Define a simplified widget structure for the output
const SuggestedWidgetSchema = z.object({
    type: z.string().describe("Type of the suggested widget (e.g., 'header', 'banner', 'grid')."),
    name: z.string().describe("A suggested name for the widget (e.g., 'Featured Products')."),
    // Add other relevant default properties if needed, keep it simple
});

const SuggestWidgetLayoutOutputSchema = z.object({
    suggestedLayout: z.array(SuggestedWidgetSchema).describe("An ordered list of suggested widgets for the layout."),
    reasoning: z.string().optional().describe("Explanation for the suggested layout."),
});
export type SuggestWidgetLayoutOutput = z.infer<typeof SuggestWidgetLayoutOutputSchema>;


export async function suggestWidgetLayout(input: SuggestWidgetLayoutInput): Promise<SuggestWidgetLayoutOutput> {
  // In a real implementation, you might want to map the complex existingWidgets
  // structure to a simpler format for the AI prompt if necessary.
  return suggestLayoutFlow(input);
}

const layoutPrompt = ai.definePrompt({
  name: 'suggestLayoutPrompt',
  input: {
    schema: SuggestWidgetLayoutInputSchema,
  },
  output: {
    schema: SuggestWidgetLayoutOutputSchema,
  },
  prompt: `You are an expert mobile app designer. Based on the app type ('{{appType}}'), suggest an optimal initial layout of widgets.
  {{#if existingWidgets}}Consider these existing widgets: {{#each existingWidgets}}'{{this.type}}' (ID: {{this.id}}){{#unless @last}}, {{/unless}}{{/each}}.{{/if}}

  Suggest a logical flow of widgets typically found in a '{{appType}}' app.
  Keep the number of initial widgets reasonable (e.g., 3-6 content widgets plus header).
  Provide the output as an array of objects, each with a 'type' and 'name'. Include a brief 'reasoning' for your suggestion.

  Available widget types: header, banner, carousel, grid, list, text, button, spacer, divider, form, map, video, audio, countdown, social, camera.
  Example for 'store': [{type: 'header', name: 'Store Header'}, {type: 'carousel', name: 'Promotions'}, {type: 'grid', name: 'Featured Products'}, {type: 'button', name: 'Shop All'}]
  Example for 'blog': [{type: 'header', name: 'Blog Header'}, {type: 'banner', name: 'Featured Article'}, {type: 'list', name: 'Recent Posts'}]
  `,
});


const suggestLayoutFlow = ai.defineFlow<
  typeof SuggestWidgetLayoutInputSchema,
  typeof SuggestWidgetLayoutOutputSchema
>(
  {
    name: 'suggestLayoutFlow',
    inputSchema: SuggestWidgetLayoutInputSchema,
    outputSchema: SuggestWidgetLayoutOutputSchema,
  },
  async (input) => {
    const { output } = await layoutPrompt(input);
     if (!output) {
        throw new Error("AI failed to suggest a layout.");
    }
    // Post-processing: Filter out suggestions that already exist? Or handle duplicates?
    // For now, return the direct suggestion.
    return output;
  }
);
