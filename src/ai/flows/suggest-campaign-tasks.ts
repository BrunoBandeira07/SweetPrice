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
  prompt: `Você é um especialista em marketing e planejamento para uma pequena confeitaria.
Seu objetivo é ajudar o dono do negócio a planejar uma campanha sazonal de sucesso.
Responda em português brasileiro.

Baseado no nome da campanha fornecido, gere uma lista de 5 a 7 tarefas essenciais.
As tarefas devem ser práticas, acionáveis e personalizadas para um negócio de confeitaria.

Nome da Campanha: {{campaignName}}

Exemplos de boas tarefas:
- Definir um cardápio temático especial (ex: ovos de páscoa, bolos para dia das mães).
- Calcular o custo e definir o preço final dos produtos.
- Comprar embalagens temáticas e insumos necessários com antecedência.
- Criar um cronograma de postagens e stories para as redes sociais.
- Tirar fotos de alta qualidade dos produtos para divulgação.
- Abrir a agenda de encomendas em uma data específica.
- Definir uma data limite para aceitar encomendas.

Retorne a lista de tarefas no campo 'tasks'.
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

    