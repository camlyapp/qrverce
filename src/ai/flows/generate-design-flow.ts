
'use server';
/**
 * @fileOverview An AI agent for generating QR code designs.
 *
 * - generateDesign - A function that handles the design generation process.
 * - GenerateDesignInput - The input type for the generateDesign function.
 * - GenerateDesignOutput - The return type for the generateDesign function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateDesignInputSchema = z.string();
export type GenerateDesignInput = z.infer<typeof GenerateDesignInputSchema>;

const GenerateDesignOutputSchema = z.object({
  colors: z.object({
    background: z.string().describe('The background color of the QR code, as a hex string (e.g., "#FFFFFF").'),
    dots: z.string().describe('The color of the QR code dots, as a hex string (e.g., "#000000").'),
    corner: z.string().describe('The color of the corner squares of the QR code, as a hex string (e.g., "#000000").'),
  }),
  shapes: z.object({
    dots: z.enum(['square', 'dots', 'rounded', 'extra-rounded', 'classy', 'classy-rounded']).describe('The shape of the dots.'),
    corners: z.enum(['square', 'extra-rounded', 'dot']).describe('The shape of the corner squares.'),
  }),
  logoDataUri: z.string().optional().describe(
    "A logo for the center of the QR code, as a data URI that must include a MIME type (image/png or image/jpeg) and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'. The logo should be simple and iconic."
  ),
});

export type GenerateDesignOutput = z.infer<typeof GenerateDesignOutputSchema>;

export async function generateDesign(input: GenerateDesignInput): Promise<GenerateDesignOutput> {
  return generateDesignFlow(input);
}

const designPrompt = ai.definePrompt({
  name: 'generateDesignPrompt',
  input: { schema: GenerateDesignInputSchema },
  output: { schema: GenerateDesignOutputSchema },
  prompt: `You are a creative designer specializing in QR codes.
  Your task is to generate a visually appealing and functional QR code design based on the user's prompt.
  - Choose a harmonious color palette (background, dots, corners). Ensure high contrast between the background and the dots/corners for scannability.
  - Select appropriate shapes for the dots and corners that match the theme of the prompt.
  - If it makes sense, generate a simple, iconic logo that fits the theme. The logo must be a PNG with a transparent background.

  User Prompt: {{{_input}}}`,
});

const logoGenerationPrompt = ai.definePrompt({
    name: 'generateLogoPrompt',
    input: { schema: z.string() },
    prompt: `Generate a simple, iconic logo for the center of a QR code based on this theme: {{{_input}}}. The logo should be a PNG with a transparent background.`,
    model: 'googleai/gemini-2.0-flash-preview-image-generation',
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
    },
});


const generateDesignFlow = ai.defineFlow(
  {
    name: 'generateDesignFlow',
    inputSchema: GenerateDesignInputSchema,
    outputSchema: GenerateDesignOutputSchema,
  },
  async (prompt) => {
    const [designResponse, logoResponse] = await Promise.all([
        designPrompt(prompt),
        logoGenerationPrompt(prompt)
    ]);
    
    const design = await designResponse.output();
    if (!design) {
      throw new Error('Failed to generate design from prompt.');
    }

    const { media } = logoResponse;
    if (media) {
      design.logoDataUri = media.url;
    }

    return design;
  }
);
