"use client";

import { useState } from "react";
import type { Ingredient, RecipeIngredient } from "@/lib/types";
import { INITIAL_INGREDIENTS } from "@/lib/constants";

import AppHeader from "@/components/app/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import IngredientForm from "@/components/app/ingredient-form";
import IngredientsList from "@/components/app/ingredients-list";
import RecipeBuilder from "@/components/app/recipe-builder";
import CostAnalysis from "@/components/app/cost-analysis";

export default function Home() {
  const [ingredients, setIngredients] = useState<Ingredient[]>(INITIAL_INGREDIENTS);
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>([]);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | undefined>(undefined);

  const addOrUpdateIngredient = (ingredient: Ingredient) => {
    setIngredients((prev) => {
      const existing = prev.find((i) => i.id === ingredient.id);
      if (existing) {
        return prev.map((i) => (i.id === ingredient.id ? ingredient : i));
      }
      return [...prev, ingredient];
    });
    setEditingIngredient(undefined);
  };

  const deleteIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((i) => i.id !== id));
    setRecipeIngredients((prev) => prev.filter((ri) => ri.ingredient.id !== id));
  };

  const startEditing = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
  };

  const cancelEditing = () => {
    setEditingIngredient(undefined);
  };

  return (
    <div className="min-h-screen w-full">
      <AppHeader />
      <main className="container mx-auto p-4 md:p-8 space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Gerenciar Ingredientes</CardTitle>
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
              recipeIngredients={recipeIngredients}
              setRecipeIngredients={setRecipeIngredients}
            />
          </div>
          <div className="lg:col-span-2">
            <CostAnalysis recipeIngredients={recipeIngredients} />
          </div>
        </div>
      </main>
    </div>
  );
}
