
"use client";

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus } from 'lucide-react';
import { useUser, useFirestore, useMemoFirebase } from "@/firebase/provider";
import { collection, doc, query, where } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';

import CustomerList from '@/components/app/customer-list';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputMask } from '@/components/ui/input-mask';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import type { Customer, Order } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';


const customerFormSchema = z.object({
    name: z.string().min(2, 'Nome é obrigatório.'),
    cpf: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    instagram: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerFormSchema>;


export default function CustomersPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();
    const firestore = useFirestore();
    const { user } = useUser();
    
    const customersQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, 'customers'), where('userId', '==', user.uid));
    }, [firestore, user]);
    const { data: customers, isLoading: isLoadingCustomers } = useCollection<Customer>(customersQuery);

    const ordersQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, 'orders'), where('userId', '==', user.uid));
    }, [firestore, user]);
    const { data: allOrders = [], isLoading: isLoadingOrders } = useCollection<Order>(ordersQuery);

    const form = useForm<CustomerFormValues>({
        resolver: zodResolver(customerFormSchema),
        defaultValues: {
            name: '',
            cpf: '',
            address: '',
            phone: '',
            instagram: '',
        }
    });

    const handleAddCustomer = (data: CustomerFormValues) => {
        if (!user || !firestore) return;
        const customersCollection = collection(firestore, 'customers');
        const docRef = doc(customersCollection);
        const newCustomer: Customer = {
            id: docRef.id,
            userId: user.uid,
            ...data
        };
        setDocumentNonBlocking(docRef, newCustomer, { merge: true });
        toast({
            title: 'Cliente Adicionado!',
            description: `${data.name} agora está na sua lista de clientes.`
        });
        form.reset();
        setIsDialogOpen(false);
    }
    
    const handleDeleteCustomer = (customerId: string) => {
        if (!firestore) return;
        const docRef = doc(firestore, 'customers', customerId);
        deleteDocumentNonBlocking(docRef);
        toast({
            title: 'Cliente Removido',
            description: 'O cliente foi removido da sua lista.'
        });
    };

    const isLoading = isLoadingCustomers || isLoadingOrders;

    return (
        <div className="w-full">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Gerenciar Clientes</CardTitle>
                            <CardDescription>Adicione, visualize e gerencie seus clientes.</CardDescription>
                        </div>
                         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button><Plus className="mr-2"/> Adicionar Cliente</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Adicionar Novo Cliente</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={form.handleSubmit(handleAddCustomer)} className="space-y-4">
                                     <div className="space-y-2">
                                        <Label htmlFor="name">Nome Completo</Label>
                                        <Input id="name" {...form.register('name')} />
                                        {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="cpf">CPF</Label>
                                            <Controller
                                                name="cpf"
                                                control={form.control}
                                                render={({ field: { ref, ...field } }) => <InputMask id="cpf" mask="___.___.___-__" replacement={{ _: /\d/ }} {...field} ref={ref} />}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Telefone</Label>
                                             <Controller
                                                name="phone"
                                                control={form.control}
                                                render={({ field: { ref, ...field } }) => <InputMask id="phone" mask="(__) _____-____" replacement={{ _: /\d/ }} {...field} ref={ref} />}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="address">Endereço</Label>
                                        <Input id="address" {...form.register('address')} />
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="instagram">Instagram</Label>
                                        <Input id="instagram" {...form.register('instagram')} placeholder="@usuario" />
                                    </div>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button type="button" variant="secondary">Cancelar</Button>
                                        </DialogClose>
                                        <Button type="submit">Salvar Cliente</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(3)].map((_, i) => (
                                    <Card key={i}>
                                        <CardHeader>
                                            <Skeleton className="h-6 w-1/2" />
                                            <Skeleton className="h-4 w-1/3" />
                                        </CardHeader>
                                        <CardContent>
                                            <Skeleton className="h-12 w-full" />
                                        </CardContent>
                                        <CardFooter>
                                            <Skeleton className="h-10 w-full" />
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                           <CustomerList customers={customers} allOrders={allOrders} onDeleteCustomer={handleDeleteCustomer} />
                        )}
                    </CardContent>
                </Card>
        </div>
    );
}
