
"use client";

import { useState, useEffect } from "react";
import type { Ingredient, Recipe, RecipeItem } from "@/lib/types";
import { useUser, useFirestore, useMemoFirebase } from "@/firebase/provider";
import { useCollection } from "@/firebase/firestore/use-collection";
import { collection, query, where, doc } from "firebase/firestore";
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useSearchParams, useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import IngredientForm from "@/components/app/ingredient-form";
import IngredientsList from "@/components/app/ingredients-list";
import RecipeBuilder from "@/components/app/recipe-builder";
import CostAnalysis from "@/components/app/cost-analysis";
import ImportSheetDialog from "@/components/app/import-sheet-dialog";
import { useToast } from "@/hooks/use-toast";
import { useDoc } from "@/firebase/firestore/use-doc";
import { Skeleton } from "@/components/ui/skeleton";


export default function CalculatorClientPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const recipeToLoadId = searchParams.get('loadRecipe');

  const ingredientsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'ingredients'), where('userId', '==', user.uid));
  }, [firestore, user]);
  const { data: ingredients, isLoading: isLoadingIngredients } = useCollection<Ingredient>(ingredientsQuery);

  const recipeDocRef = useMemoFirebase(() => {
    if (!recipeToLoadId || !firestore) return null;
    return doc(firestore, 'recipes', recipeToLoadId);
  }, [firestore, recipeToLoadId]);
  const { data: recipeToLoad, isLoading: isLoadingRecipe } = useDoc<Recipe>(recipeDocRef);

  const [recipeItems, setRecipeItems] = useState<RecipeItem[]>([]);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | undefined>(undefined);
  const [recipeBuilderState, setRecipeBuilderState] = useState<{name: string, margin: number, marginType: 'percentage' | 'fixed'}>({
    name: '',
    margin: 100,
    marginType: 'percentage',
  });


  useEffect(() => {
    if (recipeToLoad && recipeItems.length === 0) {
        setRecipeItems(recipeToLoad.items);
        setRecipeBuilderState({
            name: recipeToLoad.name,
            margin: recipeToLoad.margin || 100,
            marginType: recipeToLoad.marginType || 'percentage',
        });
        toast({
            title: `Receita "${recipeToLoad.name}" carregada!`,
            description: "Ajuste os itens e salve como uma nova receita ou atualize a existente.",
        });
        // Remove the query param from URL without reloading the page
        router.replace('/calculator', {scroll: false});
    }
  }, [recipeToLoad, toast, router, recipeItems.length]);


  const addOrUpdateIngredient = (ingredient: Omit<Ingredient, 'id' | 'userId'> & { id?: string }) => {
    if (!user || !firestore) return;
    const unitCost = ingredient.packageSize > 0 ? ingredient.cost / ingredient.packageSize : 0;
    const ingredientsCollection = collection(firestore, 'ingredients');

    if (editingIngredient) {
      const docRef = doc(ingredientsCollection, editingIngredient.id);
      setDocumentNonBlocking(docRef, { ...editingIngredient, ...ingredient, unitCost }, { merge: true });
      toast({ title: "Ingrediente Atualizado!" });
      setEditingIngredient(undefined);
    } else {
      const docRef = doc(ingredientsCollection);
      const newIngredient: Ingredient = { ...ingredient, id: docRef.id, userId: user.uid, unitCost };
      setDocumentNonBlocking(docRef, newIngredient, { merge: true });
      toast({ title: "Ingrediente Adicionado!" });
    }
  };

  const deleteIngredient = (id: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'ingredients', id);
    deleteDocumentNonBlocking(docRef);
    setRecipeItems((prev) => prev.filter((ri) => ri.type === 'ingredient' && ri.ingredient?.id !== id));
    toast({ title: "Ingrediente Deletado!" });
  };
  
  const handleIngredientsImported = (importedIngredients: Omit<Ingredient, 'id' | 'userId'>[]) => {
      if (!user || !firestore) return;
      const ingredientsCollection = collection(firestore, 'ingredients');
      
      importedIngredients.forEach(ing => {
        const unitCost = ing.packageSize > 0 ? ing.cost / ing.packageSize : 0;
        const docRef = doc(ingredientsCollection);
        const newIngredient: Ingredient = { ...ing, id: docRef.id, userId: user.uid, unitCost };
        setDocumentNonBlocking(docRef, newIngredient, { merge: true });
      });
      
      toast({
        title: `${importedIngredients.length} ingredientes importados!`,
        description: "Seus ingredientes foram adicionados com sucesso."
      });
  };

  const startEditing = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
  };

  const cancelEditing = () => {
    setEditingIngredient(undefined);
  };

  const handleSaveRecipe = (recipe: Omit<Recipe, 'id' | 'userId'>) => {
    if (!user || !firestore) return;
    const recipesCollection = collection(firestore, 'recipes');
    
    // If we loaded a recipe, we can update it. Otherwise, create a new one.
    const docRef = recipeToLoadId ? doc(recipesCollection, recipeToLoadId) : doc(recipesCollection);
    
    const recipeData: Recipe = {
      ...recipe,
      id: docRef.id,
      userId: user.uid,
    };
    setDocumentNonBlocking(docRef, recipeData, { merge: true });

    toast({
        title: `Receita "${recipe.name}" salva!`,
        description: recipeToLoadId ? 'Sua receita foi atualizada com sucesso.' : 'Sua nova receita está no seu livro!'
    });
    
    // Reset state
    setRecipeItems([]);
    setRecipeBuilderState({ name: '', margin: 100, marginType: 'percentage' });
  }
  
  const isLoading = isLoadingIngredients || isLoadingRecipe;

  if (isLoading && (isLoadingIngredients || recipeToLoadId)) {
      return (
          <div className="w-full space-y-8">
              <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/3" />
                </CardHeader>
                 <CardContent>
                    <Skeleton className="h-40 w-full" />
                </CardContent>
              </Card>
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3">
                         <Skeleton className="h-96 w-full" />
                    </div>
                     <div className="lg:col-span-2">
                        <Skeleton className="h-96 w-full" />
                    </div>
              </div>
          </div>
      )
  }

  return (
    <div className="w-full space-y-8">
        <Card>
          <CardHeader>
             <div className="flex flex-wrap items-center justify-between gap-4">
                <CardTitle>Gerenciar Ingredientes</CardTitle>
                <ImportSheetDialog onIngredientsImported={handleIngredientsImported} />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <IngredientForm
              onSubmit={addOrUpdateIngredient}
              editingIngredient={editingIngredient}
              onCancel={cancelEditing}
            />
            <IngredientsList
              ingredients={ingredients || []}
              onEdit={startEditing}
              onDelete={deleteIngredient}
              isLoading={isLoadingIngredients}
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <RecipeBuilder
              ingredients={ingredients || []}
              recipeItems={recipeItems}
              setRecipeItems={setRecipeItems}
              onSaveRecipe={handleSaveRecipe}
              initialState={recipeBuilderState}
            />
          </div>
          <div className="lg:col-span-2">
            <CostAnalysis recipeItems={recipeItems} />
          </div>
        </div>
    </div>
  );
}

    