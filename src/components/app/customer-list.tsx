
'use client';

import { useState } from 'react';
import type { Customer, Order } from '@/lib/types';
import { getCrmSuggestion } from '@/app/actions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Users, Lightbulb, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { useUser, useFirestore, useMemoFirebase } from "@/firebase/provider";
import { collection, doc, query, where } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

interface CustomerListProps {
    customers: Customer[];
    onDeleteCustomer: (customerId: string) => void;
}

export default function CustomerList({ customers, onDeleteCustomer }: CustomerListProps) {
    const { toast } = useToast();
    const [loadingSuggestion, setLoadingSuggestion] = useState<string | null>(null);
    const firestore = useFirestore();
    const { user } = useUser();

    const ordersQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, 'orders'), where('userId', '==', user.uid));
    }, [firestore, user]);
    const { data: allOrders = [] } = useCollection<Order>(ordersQuery);

    const handleGenerateSuggestion = async (customer: Customer) => {
        if (!user || !firestore) return;
        setLoadingSuggestion(customer.id);
        
        const customerOrders = allOrders.filter(o => o.customerName === customer.name);

        const result = await getCrmSuggestion({ customer, orders: customerOrders });

        if (result.success && result.suggestion) {
            const customerDocRef = doc(firestore, 'customers', customer.id);
            setDocumentNonBlocking(customerDocRef, { ...customer, crmSuggestion: result.suggestion }, { merge: true });
        } else {
            toast({
                variant: 'destructive',
                title: 'Erro ao gerar sugestão',
                description: result.error || 'Não foi possível se comunicar com a IA.'
            });
        }
        setLoadingSuggestion(null);
    }

    if (customers.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-center p-4 border-2 border-dashed rounded-lg">
                <Users className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold text-xl">Nenhum cliente cadastrado</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                   Adicione seu primeiro cliente para começar a gerenciar seus contatos e receber sugestões de CRM.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customers.map(customer => (
                <Card key={customer.id} className="flex flex-col">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <CardTitle>{customer.name}</CardTitle>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive -mt-2 -mr-2">
                                      <Trash2 />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                    Essa ação não pode ser desfeita. Isso excluirá permanentemente o cliente.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => onDeleteCustomer(customer.id)} className="bg-destructive hover:bg-destructive/90">Deletar</AlertDialogAction>
                                </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                        <CardDescription>
                            {customer.phone && <span>{customer.phone}</span>}
                            {customer.instagram && <span className="ml-2 text-pink-600">{customer.instagram}</span>}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-4">
                       <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                            <div className="flex items-center gap-2">
                                <Lightbulb className="text-accent-foreground" />
                                <h4 className="font-semibold">Sugestão de CRM</h4>
                            </div>
                            {customer.crmSuggestion ? (
                                <p className="text-sm text-muted-foreground italic">"{customer.crmSuggestion}"</p>
                            ) : (
                                <p className="text-sm text-muted-foreground">Clique no botão abaixo para gerar uma sugestão.</p>
                            )}
                       </div>
                    </CardContent>
                    <CardFooter>
                         <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => handleGenerateSuggestion(customer)}
                            disabled={loadingSuggestion === customer.id}
                        >
                            {loadingSuggestion === customer.id ? (
                                <Loader2 className="mr-2 animate-spin"/>
                            ) : (
                                <Lightbulb className="mr-2"/>
                            )}
                            {loadingSuggestion === customer.id ? 'Gerando...' : 'Gerar Sugestão de CRM'}
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
