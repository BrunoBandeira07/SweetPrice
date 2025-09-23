'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting ingredient substitutions.
 *
 * The flow takes an ingredient name and desired amount as input, and suggests
 * alternative ingredients with their equivalent amounts from other markets.
 *
 * @exports {suggestIngredientSubstitutions} - The main function to trigger the flow.
 * @exports {SuggestIngredientSubstitutionsInput} - The input type for the flow.
 * @exports {SuggestIngredientSubstitutionsOutput} - The output type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema
const SuggestIngredientSubstitutionsInputSchema = z.object({
  ingredientName: z.string().describe('The name of the ingredient to substitute.'),
  amount: z.number().describe('The desired amount of the ingredient.'),
  market: z.string().optional().describe('The market where ingredient is unavailable, e.g. "US", "UK", etc. Defaults to user current market.'),
});

export type SuggestIngredientSubstitutionsInput = z.infer<
  typeof SuggestIngredientSubstitutionsInputSchema
>;

// Define the output schema
const SuggestIngredientSubstitutionsOutputSchema = z.object({
  substitutions: z.array(
    z.object({
      ingredientName: z.string().describe('The name of the suggested substitute ingredient.'),
      amount: z.number().describe('The equivalent amount of the substitute ingredient.'),
      market: z.string().describe('The market where the substitute ingredient is available.'),
    })
  ).describe('An array of suggested ingredient substitutions.'),
});

export type SuggestIngredientSubstitutionsOutput = z.infer<
  typeof SuggestIngredientSubstitutionsOutputSchema
>;

// Define the tool to get ingredient substitutions
const getIngredientSubstitutions = ai.defineTool({
  name: 'getIngredientSubstitutions',
  description: 'Returns a list of potential ingredient substitutions based on ingredient, amount, and market',
  inputSchema: SuggestIngredientSubstitutionsInputSchema,
  outputSchema: SuggestIngredientSubstitutionsOutputSchema,
},
async (input) => {
    // TODO: Implement the logic to fetch ingredient substitutions from an external API or database
    // based on the input parameters (ingredientName, amount, market).
    // This is a placeholder, replace with actual implementation.
    console.log("Tool called with input:", input);

    return {
      substitutions: [
        {
          ingredientName: 'Example Substitute',
          amount: input.amount, // Placeholder: Adjust the amount based on conversion rates
          market: 'US', // Placeholder: Use the correct market if available in the external source
        },
      ],
    };
  }
);

// Define the prompt
const suggestIngredientSubstitutionsPrompt = ai.definePrompt({
  name: 'suggestIngredientSubstitutionsPrompt',
  tools: [getIngredientSubstitutions],
  input: {schema: SuggestIngredientSubstitutionsInputSchema},
  output: {schema: SuggestIngredientSubstitutionsOutputSchema},
  prompt: `You are a helpful assistant that suggests ingredient substitutions based on availability in different markets.

  The user is looking for a substitute for {{ingredientName}} with an amount of {{amount}}.
  You can use the getIngredientSubstitutions tool to find suitable substitutes.

  Here's the result from the tool:
  {{toolResults.getIngredientSubstitutions}}

  Based on the tool's result, suggest ingredient substitutions with equivalent amounts.
  Make sure to mention the market where each substitute is available.
  Return the result in JSON format.
  `,
});

// Define the flow
const suggestIngredientSubstitutionsFlow = ai.defineFlow(
  {
    name: 'suggestIngredientSubstitutionsFlow',
    inputSchema: SuggestIngredientSubstitutionsInputSchema,
    outputSchema: SuggestIngredientSubstitutionsOutputSchema,
  },
  async input => {
    const {output} = await suggestIngredientSubstitutionsPrompt(input);
    return output!;
  }
);

/**
 * Suggests alternative ingredients and their equivalent amounts from other markets
 * if the preferred ingredient is unavailable.
 * @param input - The input containing the ingredient name, amount, and market.
 * @returns A promise that resolves to the suggested ingredient substitutions.
 */
export async function suggestIngredientSubstitutions(
  input: SuggestIngredientSubstitutionsInput
): Promise<SuggestIngredientSubstitutionsOutput> {
  return suggestIngredientSubstitutionsFlow(input);
}
