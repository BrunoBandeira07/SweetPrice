

"use client";

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookUp, ChefHat, Trash2 } from 'lucide-react';
import type { Recipe, RecipeItem } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useUser, useFirestore, useMemoFirebase } from "@/firebase/provider";
import { collection, doc, query, where } from 'firebase/firestore';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Skeleton } from '@/components/ui/skeleton';


export default function RecipesPage() {
    const { toast } = useToast();
    const firestore = useFirestore();
    const { user } = useUser();

    const recipesQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, 'recipes'), where('userId', '==', user.uid));
    }, [firestore, user]);
    const { data: recipes = [], isLoading: isLoadingRecipes } = useCollection<Recipe>(recipesQuery);

    const handleDeleteRecipe = (recipeId: string) => {
        if (!firestore) return;
        const docRef = doc(firestore, 'recipes', recipeId);
        deleteDocumentNonBlocking(docRef);
        toast({
            title: 'Receita Excluída!',
            description: 'A receita foi removida do seu livro.',
        })
    };

    const getItemTypeLabel = (type: string) => {
        switch (type) {
            case 'ingredient': return 'Ingrediente';
            case 'labor': return 'Mão de Obra';
            case 'equipment': return 'Equipamento';
            default: return 'Item';
        }
    }

    if (isLoadingRecipes) {
        return (
            <div className="w-full space-y-6">
                {[...Array(2)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-8 w-1/2" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-24 w-full" />
                        </CardContent>
                        <CardFooter>
                            <Skeleton className="h-6 w-1/3" />
                        </CardFooter>
                    </Card>
                ))}
            </div>
        )
    }

    return (
        <div className="w-full">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <ChefHat />
                            Livro de Receitas
                        </CardTitle>
                        <CardDescription>
                            Aqui estão todas as suas receitas salvas. Carregue-as para a calculadora para ajustar preços ou visualize seus detalhes.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recipes.length > 0 ? (
                            <div className="space-y-6">
                                {recipes.map((recipe) => (
                                    <Card key={recipe.id} className="overflow-hidden">
                                        <CardHeader className="bg-muted/30">
                                            <div className="flex justify-between items-center">
                                                <CardTitle>{recipe.name}</CardTitle>
                                                <div className="flex items-center gap-2">
                                                    <Button asChild variant="outline" size="sm">
                                                        <Link href={`/calculator?loadRecipe=${recipe.id}`}>
                                                            <BookUp className="mr-2"/>
                                                            Carregar na Montagem
                                                        </Link>
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                          <Button variant="destructive" size="icon">
                                                              <Trash2 />
                                                          </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                            Essa ação não pode ser desfeita. Isso excluirá permanentemente a receita.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteRecipe(recipe.id)} className="bg-destructive hover:bg-destructive/90">Deletar</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                             <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Item</TableHead>
                                                        <TableHead>Tipo</TableHead>
                                                        <TableHead>Quantidade</TableHead>
                                                        <TableHead className="text-right">Custo</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {Array.isArray(recipe.items) && recipe.items.map((item: RecipeItem) => (
                                                        <TableRow key={item.id}>
                                                            <TableCell>{item.name}</TableCell>
                                                            <TableCell><Badge variant="secondary">{getItemTypeLabel(item.type)}</Badge></TableCell>
                                                            <TableCell>{item.quantity} {item.unit}</TableCell>
                                                            <TableCell className="text-right">
                                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.cost)}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </CardContent>
                                        <CardFooter className="bg-muted/30 p-4 flex justify-between font-bold">
                                            <div>Custo Total: <span className="text-primary">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(recipe.totalCost || 0)}</span></div>
                                            <div>Preço Sugerido: <span className="text-accent-foreground">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(recipe.suggestedPrice || 0)}</span></div>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-96 text-center p-4 border-2 border-dashed rounded-lg">
                                <ChefHat className="h-16 w-16 text-muted-foreground/50 mb-4" />
                                <h3 className="font-semibold text-xl">Seu livro de receitas está vazio</h3>
                                <p className="text-muted-foreground max-w-md mx-auto">
                                    Vá para a página de Calculadora, monte uma receita e salve-a para que ela apareça aqui.
                                </p>
                                <Button asChild className="mt-6">
                                    <Link href="/calculator">Ir para Calculadora</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
        </div>
    );
}

    
