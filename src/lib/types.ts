export type Unit = 'g' | 'kg' | 'ml' | 'l' | 'un';

export interface Ingredient {
  id: string;
  name: string;
  cost: number;
  packageSize: number;
  unit: Unit;
  supplier?: string;
  category?: string;
  unitCost?: number;
  lossFactor?: number;
}

export interface RecipeIngredient {
  id: string;
  ingredient: Ingredient;
  quantity: number;
}

export interface Recipe {
    id: string;
    name: string;
    ingredients: RecipeIngredient[];
    totalCost?: number;
    suggestedPrice?: number;
}