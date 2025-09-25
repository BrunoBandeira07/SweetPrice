'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting CRM actions for customers.
 *
 * @exports {suggestCrmAction} - The main function to trigger the flow.
 * @exports {SuggestCrmActionInput} - The input type for the flow.
 * @exports {SuggestCrmActionOutput} - The output type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { Customer, Order } from '@/lib/types';

// We need to pass the full customer and their order history to the AI.
const SuggestCrmActionInputSchema = z.object({
  customer: z.custom<Customer>(),
  orders: z.array(z.custom<Order>()),
});

export type SuggestCrmActionInput = z.infer<typeof SuggestCrmActionInputSchema>;

const SuggestCrmActionOutputSchema = z.object({
  suggestion: z.string().describe('The suggested CRM action for the customer.'),
});

export type SuggestCrmActionOutput = z.infer<
  typeof SuggestCrmActionOutputSchema
>;

// Define the prompt
const suggestCrmActionPrompt = ai.definePrompt({
  name: 'suggestCrmActionPrompt',
  input: { schema: SuggestCrmActionInputSchema },
  output: { schema: SuggestCrmActionOutputSchema },
  prompt: `You are a CRM and marketing expert for a small confectionery business.
Analyze the customer's profile and their order history to suggest a concrete, actionable CRM or sales action.

Customer Profile:
- Name: {{customer.name}}
- Last Order: {{customer.lastOrderDate}}
- Instagram: {{customer.instagram}}

Order History:
{{#each orders}}
- Order on {{deliveryDate}}: Total R$ {{total}}. Items: {{#each items}}{{quantity}}x {{recipe.name}}; {{/each}}
{{/each}}

Based on their habits (favorite sweets, preferred flavors, order dates, times), generate a personalized suggestion.
For example:
- "Offer a discount on their next 'Bolo de Chocolate' order."
- "Send a message on Instagram around the time they usually order."
- "Remind them of an upcoming special date and suggest a custom cake."

Your suggestion should be concise and directly applicable.
`,
});

// Define the flow
const suggestCrmActionFlow = ai.defineFlow(
  {
    name: 'suggestCrmActionFlow',
    inputSchema: SuggestCrmActionInputSchema,
    outputSchema: SuggestCrmActionOutputSchema,
  },
  async (input) => {
    const { output } = await suggestCrmActionPrompt(input);
    return output!;
  }
);

/**
 * Suggests a CRM action for a customer based on their profile and order history.
 * @param input - The customer and their orders.
 * @returns A promise that resolves to the CRM suggestion.
 */
export async function suggestCrmAction(
  input: SuggestCrmActionInput
): Promise<SuggestCrmActionOutput> {
  return suggestCrmActionFlow(input);
}
