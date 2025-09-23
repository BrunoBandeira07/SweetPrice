'use server';

import {
  suggestIngredientSubstitutions,
  type SuggestIngredientSubstitutionsInput,
  type SuggestIngredientSubstitutionsOutput,
} from '@/ai/flows/suggest-ingredient-substitutions';

interface ActionResult {
  success: boolean;
  data?: SuggestIngredientSubstitutionsOutput;
  error?: string;
}

export async function getSubstitutions(prevState: any, formData: FormData): Promise<ActionResult> {
  const ingredientName = formData.get('ingredientName') as string;
  const amount = Number(formData.get('amount') as string);
  const market = formData.get('market') as string;

  const input: SuggestIngredientSubstitutionsInput = {
    ingredientName,
    amount,
    market: market || undefined,
  };

  try {
    // This is a dummy implementation, as the genkit tool is not fully implemented.
    // In a real scenario, this would call the AI flow.
    const result: SuggestIngredientSubstitutionsOutput = {
      substitutions: [
        {
          ingredientName: 'Farinha de Amêndoas',
          amount: amount * 1.2,
          market: 'BR',
        },
        {
          ingredientName: 'All-Purpose Flour',
          amount: amount,
          market: 'US',
        },
         {
          ingredientName: 'Plain Flour',
          amount: amount,
          market: 'UK',
        },
      ],
    };
    // const result = await suggestIngredientSubstitutions(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Falha ao obter substituições.' };
  }
}
