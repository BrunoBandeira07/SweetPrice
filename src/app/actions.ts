'use server';

import {
  suggestIngredientSubstitutions,
  type SuggestIngredientSubstitutionsInput,
  type SuggestIngredientSubstitutionsOutput,
} from '@/ai/flows/suggest-ingredient-substitutions';
import { Ingredient, Unit } from '@/lib/types';

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

interface ImportResult {
    success: boolean;
    data?: Ingredient[];
    error?: string;
}

function isValidUnit(unit: string): unit is Unit {
    return ['g', 'kg', 'ml', 'l', 'un'].includes(unit);
}

export async function importFromSheet(prevState: any, formData: FormData): Promise<ImportResult> {
    const sheetUrl = formData.get('sheetUrl') as string;

    if (!sheetUrl) {
        return { success: false, error: "URL da planilha é obrigatória." };
    }

    try {
        const sheetIdRegex = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
        const match = sheetUrl.match(sheetIdRegex);
        if (!match || !match[1]) {
            return { success: false, error: "URL do Google Sheets inválida." };
        }
        const sheetId = match[1];
        const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

        const response = await fetch(csvUrl);
        if (!response.ok) {
            throw new Error('Falha ao buscar a planilha. Verifique se o link está correto e se a planilha é pública.');
        }

        const csvText = await response.text();
        const rows = csvText.split(/\r?\n/).slice(1); // Ignora a linha do cabeçalho
        const ingredients: Ingredient[] = rows
            .map((row) => {
                const columns = row.split(',');
                if (columns.length < 4 || !columns[0]) return null; // Precisa pelo menos dos 4 primeiros campos

                const unit = columns[3]?.trim().toLowerCase();
                if (!isValidUnit(unit)) {
                    console.warn(`Unidade inválida '${unit}' para o ingrediente '${columns[0]}'. Pulando linha.`);
                    return null;
                }

                return {
                    id: new Date().toISOString() + Math.random(),
                    name: columns[0]?.trim(),
                    packageSize: parseFloat(columns[1]?.trim()),
                    cost: parseFloat(columns[2]?.trim()),
                    unit: unit,
                    supplier: columns[4]?.trim() || undefined,
                };
            })
            .filter((ing): ing is Ingredient => ing !== null && !isNaN(ing.packageSize) && !isNaN(ing.cost));

        return { success: true, data: ingredients };
    } catch (error) {
        console.error("Erro ao importar planilha:", error);
        const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
        return { success: false, error: `Falha ao importar: ${errorMessage}` };
    }
}
