
"use client";

import { useMemo } from 'react';
import { DollarSign, Package, ShoppingCart, Users, AlertTriangle } from 'lucide-react';
import { useUser, useFirestore, useMemoFirebase } from "@/firebase/provider";
import { collection, query, where, doc } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useDoc } from '@/firebase/firestore/use-doc';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import UpcomingEvents from '@/components/app/upcoming-events';
import { cn } from '@/lib/utils';
import AiSuggestionCard from '@/components/app/ai-suggestion-card';
import MonthlyGoalCard from '@/components/app/monthly-goal-card';
import TopProductsCard from '@/components/app/top-products-card';
import { Order, Customer, Ingredient, UserSettings } from '@/lib/types';


const StatCard = ({ title, value, icon: Icon, description, className, isLoading }: { title: string, value: string, icon: React.ElementType, description: string, className?: string, isLoading?: boolean }) => (
    <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{value}</div>}
            <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
)

export default function DashboardPage() {
    const firestore = useFirestore();
    const { user } = useUser();
    
    const ordersQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, 'orders'), where('userId', '==', user.uid));
    }, [firestore, user]);
    const { data: orders = [], isLoading: isLoadingOrders } = useCollection<Order>(ordersQuery);

    const customersQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, 'customers'), where('userId', '==', user.uid));
    }, [firestore, user]);
    const { data: customers = [], isLoading: isLoadingCustomers } = useCollection<Customer>(customersQuery);

    const ingredientsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, 'ingredients'), where('userId', '==', user.uid));
    }, [firestore, user]);
    const { data: ingredients, isLoading: isLoadingIngredients } = useCollection<Ingredient>(ingredientsQuery);
    
    const settingsDocRef = useMemoFirebase(() => user ? doc(firestore, 'settings', user.uid) : null, [firestore, user]);
    const { data: settings, isLoading: isLoadingSettings } = useDoc<UserSettings>(settingsDocRef);

    const monthlySales = useMemo(() => {
        return (orders || [])
            .filter(o => o.deliveryStatus === 'delivered' && new Date(o.deliveryDate).getMonth() === new Date().getMonth())
            .reduce((sum, o) => sum + o.total, 0);
    }, [orders]);

    const pendingOrdersCount = useMemo(() => {
        return (orders || []).filter(o => o.deliveryStatus === 'pending').length;
    }, [orders]);
    
    const upcomingOrders = useMemo(() => {
        return (orders || [])
            .filter(o => o.deliveryStatus === 'pending' && new Date(o.deliveryDate) >= new Date())
            .sort((a,b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime())
            .slice(0, 5); // Limit to 5 upcoming orders
    }, [orders]);

    const criticalStockCount = useMemo(() => {
        return (ingredients || []).filter(i => (i.stockQuantity ?? 0) <= (i.lowStockThreshold ?? 0)).length;
    }, [ingredients]);

    const isLoading = isLoadingOrders || isLoadingCustomers || isLoadingIngredients || isLoadingSettings;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard 
                    title="Vendas no Mês" 
                    value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthlySales)} 
                    icon={DollarSign} 
                    description="Total de vendas em encomendas entregues" 
                    isLoading={isLoadingOrders}
                />
                <StatCard 
                    title="Encomendas Pendentes" 
                    value={`+${pendingOrdersCount}`} 
                    icon={ShoppingCart} 
                    description="Total de encomendas a serem produzidas/entregues" 
                    isLoading={isLoadingOrders}
                />
                <StatCard 
                    title="Total de Clientes" 
                    value={`${(customers || []).length}`} 
                    icon={Users} 
                    description="Número de clientes cadastrados" 
                    isLoading={isLoadingCustomers}
                />
                <StatCard 
                    title="Estoque Crítico" 
                    value={`${criticalStockCount}`} 
                    icon={AlertTriangle} 
                    description="Itens com estoque baixo ou zerado"
                    isLoading={isLoadingIngredients}
                    className={cn(!isLoadingIngredients && criticalStockCount > 0 && "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800 [&>div>svg]:text-yellow-800 dark:[&>div>svg]:text-yellow-300")}
                />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                 <div className="lg:col-span-2 grid grid-cols-1 gap-8">
                    <AiSuggestionCard criticalStockCount={criticalStockCount} monthlySales={monthlySales} />
                    <Card>
                        <CardHeader>
                            <CardTitle>Próximas Encomendas</CardTitle>
                        </CardHeader>
                        <CardContent>
                             {isLoadingOrders ? (
                                <div className="space-y-2">
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                             ) : upcomingOrders.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Cliente</TableHead>
                                            <TableHead>Entrega</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {upcomingOrders.map(order => (
                                            <TableRow key={order.id}>
                                                <TableCell className="font-medium">{order.customerName}</TableCell>
                                                <TableCell>{new Date(order.deliveryDate).toLocaleDateString('pt-br')}</TableCell>
                                                <TableCell>
                                                    <Badge variant={'secondary'}>{order.productionStatus}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-10 text-muted-foreground">
                                    <ShoppingCart className="mx-auto h-12 w-12" />
                                    <p className="mt-4">Nenhuma encomenda futura encontrada.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1 space-y-8">
                    <MonthlyGoalCard currentSales={monthlySales} monthlyGoal={settings?.monthlyGoal} isLoading={isLoadingSettings} />
                    <TopProductsCard orders={orders || []} />
                    <UpcomingEvents orders={orders || []} />
                </div>
            </div>
        </div>
    );
}

    