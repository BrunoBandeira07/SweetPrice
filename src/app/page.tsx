"use client";

import { useState, useEffect } from "react";
import type { Ingredient, Recipe, RecipeIngredient } from "@/lib/types";
import { INITIAL_INGREDIENTS } from "@/lib/constants";
import { useSearchParams, useRouter } from 'next/navigation'


import AppHeader from "@/components/app/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import IngredientForm from "@/components/app/ingredient-form";
import IngredientsList from "@/components/app/ingredients-list";
import RecipeBuilder from "@/components/app/recipe-builder";
import CostAnalysis from "@/components/app/cost-analysis";
import ImportSheetDialog from "@/components/app/import-sheet-dialog";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [ingredients, setIngredients] = useState<Ingredient[]>(INITIAL_INGREDIENTS);
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>([]);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | undefined>(undefined);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const { toast } = useToast();

  const searchParams = useSearchParams();
  const router = useRouter();


  useEffect(() => {
    try {
      const storedRecipes = localStorage.getItem('savedRecipes');
      if (storedRecipes) {
        setSavedRecipes(JSON.parse(storedRecipes));
      }
    } catch (error) {
      console.error("Failed to load recipes from localStorage", error);
    }
  }, []);

  useEffect(() => {
    const recipeToLoadId = searchParams.get('loadRecipe');
    if (recipeToLoadId) {
      try {
        const storedRecipes = localStorage.getItem('savedRecipes');
        if (storedRecipes) {
          const recipes: Recipe[] = JSON.parse(storedRecipes);
          const recipeToLoad = recipes.find(r => r.id === recipeToLoadId);
          if (recipeToLoad) {
            setRecipeIngredients(recipeToLoad.ingredients);
            toast({
              title: `Receita "${recipeToLoad.name}" carregada!`,
              description: 'Os ingredientes foram adicionados à montagem.',
            });
            // Clean up URL
            router.replace('/', { scroll: false });
          }
        }
      } catch (error) {
        console.error("Failed to load recipe from URL", error);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, toast]);


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

  const handleIngredientsImported = (importedIngredients: Ingredient[]) => {
    setIngredients(prev => [...prev, ...importedIngredients]);
    toast({
      title: "Sucesso!",
      description: `${importedIngredients.length} ingredientes foram importados com sucesso.`,
    })
  };

  const handleSaveRecipe = (recipe: Recipe) => {
    const updatedRecipes = [...savedRecipes, recipe];
    setSavedRecipes(updatedRecipes);
    localStorage.setItem('savedRecipes', JSON.stringify(updatedRecipes));
    toast({
      title: 'Receita Salva!',
      description: `A receita "${recipe.name}" foi adicionada ao seu Livro de Receitas.`,
    });
  }

  return (
    <div className="min-h-screen w-full">
      <AppHeader />
      <main className="container mx-auto p-4 md:p-8 space-y-8">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-headline text-2xl">Gerenciar Ingredientes</CardTitle>
            <ImportSheetDialog onIngredientsImported={handleIngredientsImported}/>
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
              onSaveRecipe={handleSaveRecipe}
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