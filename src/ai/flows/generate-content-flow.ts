'use server';
/**
 * @fileOverview AI flow for generating content for widgets.
 *
 * - generateWidgetContent - Generates text content based on widget type and user prompt.
 * - GenerateWidgetContentInput - Input type for the flow.
 * - GenerateWidgetContentOutput - Output type for the flow.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';

const GenerateWidgetContentInputSchema = z.object({
  widgetType: z.string().describe("The type of widget the content is for (e.g., 'text', 'banner')."),
  prompt: z.string().describe('The user-provided prompt or topic for content generation.'),
  existingContent: z.string().optional().describe('Existing content to potentially refine or build upon.'),
});
export type GenerateWidgetContentInput = z.infer<typeof GenerateWidgetContentInputSchema>;

const GenerateWidgetContentOutputSchema = z.object({
  generatedContent: z.string().describe('The AI-generated content.'),
});
export type GenerateWidgetContentOutput = z.infer<typeof GenerateWidgetContentOutputSchema>;

export async function generateWidgetContent(input: GenerateWidgetContentInput): Promise<GenerateWidgetContentOutput> {
  return generateContentFlow(input);
}

const contentPrompt = ai.definePrompt({
  name: 'generateContentPrompt',
  input: {
    schema: GenerateWidgetContentInputSchema,
  },
  output: {
    schema: GenerateWidgetContentOutputSchema,
  },
  prompt: `Generate content for a '{{widgetType}}' widget based on the following prompt.
  {{#if existingContent}}Refine or expand upon this existing content: {{{existingContent}}}{{/if}}

Prompt: {{{prompt}}}

Generate concise and relevant content suitable for the widget type.
If it's for a 'banner' alt text, make it descriptive and brief.
If it's for a 'text' widget, generate a paragraph or relevant text based on the prompt.
Return only the generated content.`,
});

const generateContentFlow = ai.defineFlow<
  typeof GenerateWidgetContentInputSchema,
  typeof GenerateWidgetContentOutputSchema
>(
  {
    name: 'generateContentFlow',
    inputSchema: GenerateWidgetContentInputSchema,
    outputSchema: GenerateWidgetContentOutputSchema,
  },
  async (input) => {
    const { output } = await contentPrompt(input);
    if (!output) {
        throw new Error("AI failed to generate content.");
    }
    return output;
  }
);
