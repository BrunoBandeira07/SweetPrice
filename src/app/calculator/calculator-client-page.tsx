
"use client";

import { useState } from "react";
import type { Ingredient, Recipe, RecipeItem } from "@/lib/types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import IngredientForm from "@/components/app/ingredient-form";
import IngredientsList from "@/components/app/ingredients-list";
import RecipeBuilder from "@/components/app/recipe-builder";
import CostAnalysis from "@/components/app/cost-analysis";

export default function CalculatorClientPage() {
  // Dummy data for now - will be replaced with Firebase data
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipeItems, setRecipeItems] = useState<RecipeItem[]>([]);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | undefined>(undefined);

  const addOrUpdateIngredient = (ingredient: Omit<Ingredient, 'id'> & { id?: string }) => {
    // Calculate unit cost before saving
    const unitCost = ingredient.packageSize > 0 ? ingredient.cost / ingredient.packageSize : 0;
    
    if (editingIngredient) {
      setIngredients(
        ingredients.map((i) =>
          i.id === editingIngredient.id ? { ...i, ...ingredient, unitCost } : i
        )
      );
      setEditingIngredient(undefined);
    } else {
      setIngredients([
        ...ingredients,
        { ...ingredient, id: new Date().toISOString(), unitCost },
      ]);
    }
  };

  const deleteIngredient = (id: string) => {
    setIngredients(ingredients.filter((i) => i.id !== id));
    // Also remove from the current recipe if it's being used
    setRecipeItems((prev) => prev.filter((ri) => ri.ingredient.id !== id));
  };

  const startEditing = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
  };

  const cancelEditing = () => {
    setEditingIngredient(undefined);
  };

  const handleSaveRecipe = (recipe: Omit<Recipe, 'id'>) => {
    // For now, we'll just log it. Later this will save to Firebase.
    console.log("Saving recipe:", { ...recipe, id: new Date().toISOString() });
    alert(`Receita "${recipe.name}" salva! (Verifique o console)`);
  }

  return (
    <div className="w-full space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Gerenciar Ingredientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <IngredientForm
              onSubmit={addOrUpdateIngredient}
              editingIngredient={editingIngredient}
              onCancel={cancelEditing}
            />
            <IngredientsList
              ingredients={ingredients}
              onEdit={startEditing}
              onDelete={deleteIngredient}
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <RecipeBuilder
              ingredients={ingredients}
              recipeItems={recipeItems}
              setRecipeItems={setRecipeItems}
              onSaveRecipe={handleSaveRecipe}
            />
          </div>
          <div className="lg:col-span-2">
            <CostAnalysis recipeItems={recipeItems} />
          </div>
        </div>
    </div>
  );
}
