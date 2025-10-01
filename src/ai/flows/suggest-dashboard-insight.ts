
'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a daily insight for the dashboard.
 *
 * @exports {suggestDashboardInsight} - The main function to trigger the flow.
 * @exports {SuggestDashboardInsightInput} - The input type for the flow.
 * @exports {SuggestDashboardInsightOutput} - The output type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SuggestDashboardInsightInputSchema = z.object({
  monthlySales: z.number().describe('O total de vendas no mês atual.'),
  criticalStockCount: z.number().describe('A quantidade de itens com estoque baixo ou zerado.'),
});

export type SuggestDashboardInsightInput = z.infer<typeof SuggestDashboardInsightInputSchema>;

const SuggestDashboardInsightOutputSchema = z.object({
  suggestion: z.string().describe('Uma sugestão curta e acionável para o dono da confeitaria.'),
});

export type SuggestDashboardInsightOutput = z.infer<typeof SuggestDashboardInsightOutputSchema>;

const suggestDashboardInsightPrompt = ai.definePrompt({
  name: 'suggestDashboardInsightPrompt',
  input: { schema: SuggestDashboardInsightInputSchema },
  output: { schema: SuggestDashboardInsightOutputSchema },
  prompt: `Você é um consultor de negócios especialista em pequenas confeitarias.
Seu objetivo é fornecer uma dica do dia, curta, direta e acionável para o dono do negócio, baseada nos dados atuais do dashboard.
Responda em português brasileiro. A sugestão deve ter no máximo 280 caracteres.

Dados Atuais:
- Vendas no Mês: R$ {{monthlySales}}
- Itens em Estoque Crítico: {{criticalStockCount}}

Analise os dados e foque no ponto mais urgente ou na maior oportunidade.

Exemplos de Sugestões:

Se o estoque crítico for alto:
"Você tem {{criticalStockCount}} itens com estoque baixo! Que tal planejar as compras hoje para não perder nenhuma venda?"

Se as vendas estiverem baixas no início do mês:
"O mês está só começando! Que tal criar uma promoção especial para o fim de semana e impulsionar as vendas?"

Se as vendas estiverem boas:
"Suas vendas estão ótimas! É um bom momento para postar os bastidores da produção no Instagram e engajar seus clientes."

Se tudo estiver normal:
"Tudo em ordem! Que tal aproveitar o dia para organizar suas receitas ou planejar a próxima campanha sazonal?"

Gere uma única sugestão criativa e relevante baseada nos dados fornecidos.
`,
});

const suggestDashboardInsightFlow = ai.defineFlow(
  {
    name: 'suggestDashboardInsightFlow',
    inputSchema: SuggestDashboardInsightInputSchema,
    outputSchema: SuggestDashboardInsightOutputSchema,
  },
  async (input) => {
    const { output } = await suggestDashboardInsightPrompt(input);
    return output!;
  }
);

export async function suggestDashboardInsight(
  input: SuggestDashboardInsightInput
): Promise<SuggestDashboardInsightOutput> {
  return suggestDashboardInsightFlow(input);
}
