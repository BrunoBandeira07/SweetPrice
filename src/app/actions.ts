'use server';

import {
  suggestIngredientSubstitutions,
  type SuggestIngredientSubstitutionsInput,
  type SuggestIngredientSubstitutionsOutput,
} from '@/ai/flows/suggest-ingredient-substitutions';
import {
  suggestCrmAction,
  type SuggestCrmActionInput,
} from '@/ai/flows/suggest-crm-action';

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

function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
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
        const rows = csvText.split(/\r?\n/);
        const headerRow = rows[0].split(',').map(normalizeHeader);
        const dataRows = rows.slice(1);

        const columnIndices = {
          item: headerRow.indexOf('item'),
          category: headerRow.indexOf('categoria'),
          volumeBruto: headerRow.indexOf('volume bruto'),
          unMed: headerRow.indexOf('un.med'),
          custoMedio: headerRow.indexOf('custo medio'),
          custoUn: headerRow.indexOf('custo un.'),
          fatorDePerda: headerRow.indexOf('fator de perda'),
        };
        
        const requiredColumns = ['item', 'volumeBruto', 'unMed', 'custoMedio'];
        const missingColumns = requiredColumns.filter(col => columnIndices[col as keyof typeof columnIndices] === -1);

        if (missingColumns.length > 0) {
             return { success: false, error: `Formato de planilha inválido. Faltando colunas obrigatórias: ${missingColumns.join(', ')}.` };
        }
        
        const ingredients: Ingredient[] = dataRows
            .map((row) => {
                const columns = row.split(',');
                if (columns.length < 4 || !columns[columnIndices.item]) return null;

                const name = columns[columnIndices.item]?.trim();
                const packageSize = parseFloat(columns[columnIndices.volumeBruto]?.trim().replace(',', '.'));
                const cost = parseFloat(columns[columnIndices.custoMedio]?.trim().replace(',', '.'));
                const unit = columns[columnIndices.unMed]?.trim().toLowerCase();
                
                const category = columnIndices.category !== -1 ? columns[columnIndices.category]?.trim() : undefined;
                const unitCostStr = columnIndices.custoUn !== -1 ? columns[columnIndices.custoUn]?.trim().replace(',', '.') : undefined;
                const unitCost = unitCostStr ? parseFloat(unitCostStr) : undefined;
                const lossFactorStr = columnIndices.fatorDePerda !== -1 ? columns[columnIndices.fatorDePerda]?.trim().replace(',', '.') : undefined;
                const lossFactor = lossFactorStr ? parseFloat(lossFactorStr) : undefined;


                if (!name || isNaN(packageSize) || isNaN(cost) || !unit) {
                    return null;
                }

                if (!isValidUnit(unit)) {
                    console.warn(`Unidade inválida '${unit}' para o ingrediente '${name}'. Pulando linha.`);
                    return null;
                }

                return {
                    id: new Date().toISOString() + Math.random(),
                    name,
                    packageSize,
                    cost,
                    unit,
                    category,
                    unitCost: isNaN(unitCost!) ? undefined : unitCost,
                    lossFactor: isNaN(lossFactor!) ? undefined : lossFactor,
                    supplier: undefined,
                };
            })
            .filter((ing): ing is Ingredient => ing !== null);

        return { success: true, data: ingredients };
    } catch (error) {
        console.error("Erro ao importar planilha:", error);
        const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
        return { success: false, error: `Falha ao importar: ${errorMessage}` };
    }
}

interface CrmActionResult {
  success: boolean;
  suggestion?: string;
  error?: string;
}

export async function getCrmSuggestion(input: SuggestCrmActionInput): Promise<CrmActionResult> {
  try {
    const result = await suggestCrmAction(input);
    return { success: true, suggestion: result.suggestion };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
    return { success: false, error: `Falha ao gerar sugestão de CRM: ${errorMessage}` };
  }
}