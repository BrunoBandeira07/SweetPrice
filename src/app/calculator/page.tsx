
"use client";

import { useState, useEffect } from "react";
import type { Ingredient, Recipe, RecipeItem } from "@/lib/types";
import { useSearchParams, useRouter } from 'next/navigation'
import { useCollection } from "@/firebase/firestore/use-collection";
import { useUser, useFirestore, useMemoFirebase } from "@/firebase/provider";
import { collection, doc, query, where } from "firebase/firestore";
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import IngredientForm from "@/components/app/ingredient-form";
import IngredientsList from "@/components/app/ingredients-list";
import RecipeBuilder from "@/components/app/recipe-builder";
import CostAnalysis from "@/components/app/cost-analysis";
import ImportSheetDialog from "@/components/app/import-sheet-dialog";
import { useToast } from "@/hooks/use-toast";

export default function CalculatorPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const ingredientsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'ingredients'), where('userId', '==', user.uid));
  }, [firestore, user]);
  const { data: ingredients = [], isLoading: isLoadingIngredients } = useCollection<Ingredient>(ingredientsQuery);
  
  const recipesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'recipes'), where('userId', '==', user.uid));
  }, [firestore, user]);
  const { data: savedRecipes = [] } = useCollection<Recipe>(recipesQuery);

  const [recipeItems, setRecipeItems] = useState<RecipeItem[]>([]);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | undefined>(undefined);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | undefined>(undefined);
  
  useEffect(() => {
    const recipeToLoadId = searchParams.get('loadRecipe');
    if (recipeToLoadId && savedRecipes.length > 0 && ingredients.length > 0) {
      try {
          const recipeToLoad = savedRecipes.find(r => r.id === recipeToLoadId);
          if (recipeToLoad) {
            setEditingRecipe(recipeToLoad);
            // Re-hydrate ingredients from the main ingredients list
            const hydratedItems = recipeToLoad.items.map(item => {
                if (item.type === 'ingredient' && item.ingredient?.id) {
                    const fullIngredient = ingredients.find(i => i.id === item.ingredient!.id);
                    // Ensure the latest ingredient data is used
                    return { ...item, ingredient: fullIngredient, cost: (fullIngredient?.unitCost || 0) * item.quantity * (fullIngredient?.lossFactor || 1) };
                }
                return item;
            });

            setRecipeItems(hydratedItems as RecipeItem[]);
            
            toast({
              title: `Receita "${recipeToLoad.name}" carregada!`,
              description: 'Os itens foram adicionados à montagem para edição.',
            });
            // Clean up URL
            router.replace('/calculator', { scroll: false });
          }
      } catch (error) {
        console.error("Failed to load recipe from URL", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar receita",
          description: "Não foi possível carregar os dados da receita selecionada."
        });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, savedRecipes, ingredients]);

  const addOrUpdateIngredient = (ingredient: Omit<Ingredient, 'id' | 'userId'> & { id?: string }) => {
    if (!user || !firestore) return;
    const ingredientsCollection = collection(firestore, 'ingredients');
    const docRef = ingredient.id ? doc(ingredientsCollection, ingredient.id) : doc(ingredientsCollection);
    const dataToSave: Omit<Ingredient, 'id'> & { id: string, userId: string } = {
      ...ingredient,
      id: docRef.id,
      userId: user.uid,
    };
    setDocumentNonBlocking(docRef, dataToSave, { merge: true });
    setEditingIngredient(undefined);
  };

  const deleteIngredient = (id: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'ingredients', id);
    deleteDocumentNonBlocking(docRef);
    setRecipeItems((prev) => prev.filter((ri) => !(ri.type === 'ingredient' && ri.ingredient?.id === id)));
  };

  const startEditing = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
  };

  const cancelEditing = () => {
    setEditingIngredient(undefined);
  };

  const handleIngredientsImported = (importedIngredients: Omit<Ingredient, 'id' | 'userId'>[]) => {
    if (!user || !firestore) return;
    const ingredientsCollection = collection(firestore, 'ingredients');
    importedIngredients.forEach(ing => {
      const docRef = doc(ingredientsCollection);
      const dataToSave: Omit<Ingredient, 'id'> & { id: string, userId: string } = {
        ...ing,
        id: docRef.id,
        userId: user.uid,
      };
      setDocumentNonBlocking(docRef, dataToSave, { merge: true });
    });

    toast({
      title: "Sucesso!",
      description: `${importedIngredients.length} ingredientes foram importados com sucesso.`,
    })
  };

  const handleSaveRecipe = (recipe: Omit<Recipe, 'id' | 'userId' | 'items'> & { id?: string; items: RecipeItem[] }) => {
    if (!user || !firestore) return;
    const recipesCollection = collection(firestore, 'recipes');
    const docRef = recipe.id ? doc(recipesCollection, recipe.id) : doc(recipesCollection);
    
    // Create a serializable version of items, removing the full ingredient object
    const serializedItems = recipe.items.map(item => {
      const { ingredient, ...rest } = item;
      if (item.type === 'ingredient' && ingredient) {
        return { ...rest, ingredient: { id: ingredient.id, name: ingredient.name } };
      }
      return rest;
    });
    
    const dataToSave = {
      ...recipe,
      items: serializedItems,
      id: docRef.id,
      userId: user.uid,
    };

    setDocumentNonBlocking(docRef, dataToSave, { merge: true });
    toast({
      title: 'Receita Salva!',
      description: `A receita "${recipe.name}" foi salva no seu Livro de Receitas.`,
    });
    // Clear the form after saving
    setRecipeItems([]);
    setEditingRecipe(undefined);
  }
  
  const clearRecipe = () => {
    setRecipeItems([]);
    setEditingRecipe(undefined);
    toast({
      title: 'Calculadora Limpa',
      description: 'Você pode começar uma nova receita do zero.',
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
              onClearRecipe={clearRecipe}
              editingRecipe={editingRecipe}
            />
          </div>
          <div className="lg:col-span-2">
            <CostAnalysis recipeItems={recipeItems} />
          </div>
        </div>
    </div>
  );
}
