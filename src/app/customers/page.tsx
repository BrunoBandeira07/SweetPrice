"use client";

import { useState, useEffect } from 'react';
import { Controller } from 'react-hook-form';
import AppHeader from '@/components/app/header';
import CustomerList from '@/components/app/customer-list';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputMask } from '@/components/ui/input-mask';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import type { Customer } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const customerFormSchema = z.object({
    name: z.string().min(2, 'Nome é obrigatório.'),
    cpf: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    instagram: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerFormSchema>;


export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();

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

    useEffect(() => {
        try {
            const storedCustomers = localStorage.getItem('customers');
            if (storedCustomers) {
                setCustomers(JSON.parse(storedCustomers));
            }
        } catch (error) {
            console.error("Failed to load customers from localStorage", error);
        }
    }, []);

    const updateCustomers = (newCustomers: Customer[]) => {
        setCustomers(newCustomers);
        localStorage.setItem('customers', JSON.stringify(newCustomers));
    }

    const handleAddCustomer = (data: CustomerFormValues) => {
        const newCustomer: Customer = {
            id: new Date().toISOString(),
            ...data
        };
        updateCustomers([...customers, newCustomer]);
        toast({
            title: 'Cliente Adicionado!',
            description: `${data.name} agora está na sua lista de clientes.`
        });
        form.reset();
        setIsDialogOpen(false);
    }


    return (
        <div className="min-h-screen w-full">
            <AppHeader />
            <main className="container mx-auto p-4 md:p-8">
                 <Card className="shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="font-headline text-2xl">Gerenciar Clientes</CardTitle>
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
                       <CustomerList customers={customers} setCustomers={updateCustomers} />
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
