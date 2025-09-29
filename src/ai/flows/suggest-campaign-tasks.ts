'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting campaign tasks.
 *
 * @exports {suggestCampaignTasks} - The main function to trigger the flow.
 * @exports {SuggestCampaignTasksInput} - The input type for the flow.
 * @exports {SuggestCampaignTasksOutput} - The output type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SuggestCampaignTasksInputSchema = z.object({
  campaignName: z.string().describe('The name of the seasonal campaign.'),
});

export type SuggestCampaignTasksInput = z.infer<typeof SuggestCampaignTasksInputSchema>;

const SuggestCampaignTasksOutputSchema = z.object({
  tasks: z.array(z.string()).describe('A list of suggested tasks for the campaign.'),
});

export type SuggestCampaignTasksOutput = z.infer<typeof SuggestCampaignTasksOutputSchema>;

const suggestCampaignTasksPrompt = ai.definePrompt({
  name: 'suggestCampaignTasksPrompt',
  input: { schema: SuggestCampaignTasksInputSchema },
  output: { schema: SuggestCampaignTasksOutputSchema },
  prompt: `You are a marketing and planning expert for a small confectionery business.
Your goal is to help the business owner plan a successful seasonal campaign.

Based on the campaign name provided, generate a list of 5 to 7 essential tasks.
The tasks should be practical, actionable, and tailored for a confectionery business.

Campaign Name: {{campaignName}}

Examples of good tasks:
- Define a special themed menu (e.g., Easter eggs, Mother's Day cakes).
- Calculate the cost and define the final price of the products.
- Purchase themed packaging and necessary supplies in advance.
- Create a schedule for social media posts and stories.
- Take high-quality photos of the products for dissemination.
- Open the order agenda on a specific date.
- Define a deadline for accepting orders.

Return the list of tasks in the 'tasks' field.
`,
});

const suggestCampaignTasksFlow = ai.defineFlow(
  {
    name: 'suggestCampaignTasksFlow',
    inputSchema: SuggestCampaignTasksInputSchema,
    outputSchema: SuggestCampaignTasksOutputSchema,
  },
  async (input) => {
    const { output } = await suggestCampaignTasksPrompt(input);
    return output!;
  }
);

export async function suggestCampaignTasks(
  input: SuggestCampaignTasksInput
): Promise<SuggestCampaignTasksOutput> {
  return suggestCampaignTasksFlow(input);
}
