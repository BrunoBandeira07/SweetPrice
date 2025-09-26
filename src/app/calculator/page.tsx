"use client";

import { useState, useEffect } from "react";
import type { Ingredient, Recipe, RecipeItem } from "@/lib/types";
import { INITIAL_INGREDIENTS } from "@/lib/constants";
import { useSearchParams, useRouter } from 'next/navigation'


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import IngredientForm from "@/components/app/ingredient-form";
import IngredientsList from "@/components/app/ingredients-list";
import RecipeBuilder from "@/components/app/recipe-builder";
import CostAnalysis from "@/components/app/cost-analysis";
import ImportSheetDialog from "@/components/app/import-sheet-dialog";
import { useToast } from "@/hooks/use-toast";

export default function CalculatorPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipeItems, setRecipeItems] = useState<RecipeItem[]>([]);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | undefined>(undefined);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const { toast } = useToast();

  const searchParams = useSearchParams();
  const router = useRouter();
  
  useEffect(() => {
    try {
      const storedIngredients = localStorage.getItem('ingredients');
       if (storedIngredients) {
        setIngredients(JSON.parse(storedIngredients));
      } else {
        setIngredients(INITIAL_INGREDIENTS)
      }
    } catch (error) {
       console.error("Failed to load ingredients from localStorage", error);
       setIngredients(INITIAL_INGREDIENTS);
    }
  }, []);

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
            setRecipeItems(recipeToLoad.items);
            toast({
              title: `Receita "${recipeToLoad.name}" carregada!`,
              description: 'Os itens foram adicionados à montagem.',
            });
            // Clean up URL
            router.replace('/calculator', { scroll: false });
          }
        }
      } catch (error) {
        console.error("Failed to load recipe from URL", error);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, toast]);

  const updateIngredients = (newIngredients: Ingredient[]) => {
      setIngredients(newIngredients);
      localStorage.setItem('ingredients', JSON.stringify(newIngredients));
  }

  const addOrUpdateIngredient = (ingredient: Ingredient) => {
    let newIngredients: Ingredient[];
    const existing = ingredients.find((i) => i.id === ingredient.id);
    if (existing) {
        newIngredients = ingredients.map((i) => (i.id === ingredient.id ? ingredient : i));
    } else {
        newIngredients = [...ingredients, ingredient];
    }
    updateIngredients(newIngredients);
    setEditingIngredient(undefined);
  };

  const deleteIngredient = (id: string) => {
    const newIngredients = ingredients.filter((i) => i.id !== id);
    updateIngredients(newIngredients);
    setRecipeItems((prev) => prev.filter((ri) => ri.type === 'ingredient' && ri.ingredient?.id !== id));
  };

  const startEditing = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
  };

  const cancelEditing = () => {
    setEditingIngredient(undefined);
  };

  const handleIngredientsImported = (importedIngredients: Ingredient[]) => {
    const newIngredients = [...ingredients, ...importedIngredients];
    updateIngredients(newIngredients);
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
    <div className="w-full space-y-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Gerenciar Ingredientes</CardTitle>
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
