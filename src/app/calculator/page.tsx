"use client";

import { useState, useEffect, useMemo } from "react";
import type { Ingredient, Recipe, RecipeItem } from "@/lib/types";
import { useSearchParams, useRouter } from 'next/navigation'
import { useCollection } from "@/firebase/firestore/use-collection";
import { useFirestore, useMemoFirebase } from "@/firebase/provider";
import { collection, doc } from "firebase/firestore";
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import IngredientForm from "@/components/app/ingredient-form";
import IngredientsList from "@/components/app/ingredients-list";
import RecipeBuilder from "@/components/app/recipe-builder";
import CostAnalysis from "@/components/app/cost-analysis";
import ImportSheetDialog from "@/components/app/import-sheet-dialog";
import { useToast } from "@/hooks/use-toast";

export default function CalculatorPage() {
  const firestore = useFirestore();
  const ingredientsCollection = useMemoFirebase(() => collection(firestore, 'ingredients'), [firestore]);
  const { data: ingredients = [], isLoading: isLoadingIngredients } = useCollection<Ingredient>(ingredientsCollection);
  
  const recipesCollection = useMemoFirebase(() => collection(firestore, 'recipes'), [firestore]);
  const { data: savedRecipes = [] } = useCollection<Recipe>(recipesCollection);

  const [recipeItems, setRecipeItems] = useState<RecipeItem[]>([]);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | undefined>(undefined);
  const { toast } = useToast();

  const searchParams = useSearchParams();
  const router = useRouter();
  
  useEffect(() => {
    const recipeToLoadId = searchParams.get('loadRecipe');
    if (recipeToLoadId && savedRecipes.length > 0) {
      try {
          const recipeToLoad = savedRecipes.find(r => r.id === recipeToLoadId);
          if (recipeToLoad) {
            setRecipeItems(recipeToLoad.items);
            toast({
              title: `Receita "${recipeToLoad.name}" carregada!`,
              description: 'Os itens foram adicionados à montagem.',
            });
            // Clean up URL
            router.replace('/calculator', { scroll: false });
          }
      } catch (error) {
        console.error("Failed to load recipe from URL", error);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, savedRecipes, toast]);

  const addOrUpdateIngredient = (ingredient: Omit<Ingredient, 'id'> & { id?: string }) => {
    const docRef = ingredient.id ? doc(ingredientsCollection, ingredient.id) : doc(ingredientsCollection);
    const dataToSave: Ingredient = {
      ...ingredient,
      id: docRef.id,
    };
    setDocumentNonBlocking(docRef, dataToSave, { merge: true });
    setEditingIngredient(undefined);
  };

  const deleteIngredient = (id: string) => {
    const docRef = doc(ingredientsCollection, id);
    deleteDocumentNonBlocking(docRef);
    setRecipeItems((prev) => prev.filter((ri) => ri.type === 'ingredient' && ri.ingredient?.id !== id));
  };

  const startEditing = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
  };

  const cancelEditing = () => {
    setEditingIngredient(undefined);
  };

  const handleIngredientsImported = (importedIngredients: Omit<Ingredient, 'id'>[]) => {
    importedIngredients.forEach(ing => {
      const docRef = doc(ingredientsCollection);
      const dataToSave: Ingredient = {
        ...ing,
        id: docRef.id,
      };
      setDocumentNonBlocking(docRef, dataToSave, { merge: true });
    });

    toast({
      title: "Sucesso!",
      description: `${importedIngredients.length} ingredientes foram importados com sucesso.`,
    })
  };

  const handleSaveRecipe = (recipe: Omit<Recipe, 'id'> & { id?: string }) => {
    const docRef = recipe.id ? doc(recipesCollection, recipe.id) : doc(recipesCollection);
    const dataToSave: Recipe = {
      ...recipe,
      id: docRef.id,
    };
    setDocumentNonBlocking(docRef, dataToSave, { merge: true });
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
              isLoading={isLoadingIngredients}
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
