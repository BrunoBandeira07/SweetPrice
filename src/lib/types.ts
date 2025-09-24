export type Unit = 'g' | 'kg' | 'ml' | 'l' | 'un';
export type OperationalUnit = 'min' | 'h' | 'un';

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

export type RecipeItemType = 'ingredient' | 'labor' | 'equipment';

export interface RecipeItem {
  id: string;
  type: RecipeItemType;
  name: string;
  quantity: number;
  unit: Unit | OperationalUnit;
  cost: number;
  // If type is 'ingredient', this will be the ingredient object
  ingredient?: Ingredient;
  // If type is 'equipment', this can hold the equipment key
  equipmentKey?: string;
}


export interface Recipe {
    id: string;
    name:string;
    items: RecipeItem[];
    totalCost?: number;
    suggestedPrice?: number;
}
