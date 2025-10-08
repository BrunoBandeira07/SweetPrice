

"use client";

import { useMemo } from 'react';
import { useUser, useFirestore, useMemoFirebase } from "@/firebase/provider";
import { collection, query, where } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { DollarSign, Package, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Order, Recipe } from '@/lib/types';
import MonthlyRevenueChart from '@/components/app/charts/monthly-revenue-chart';
import ProductRevenueChart from '@/components/app/charts/product-revenue-chart';
import { Skeleton } from '@/components/ui/skeleton';

const StatCard = ({ title, value, icon: Icon, isLoading }: { title: string, value: string, icon: React.ElementType, isLoading?: boolean }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{value}</div>}
        </CardContent>
    </Card>
);

export default function ReportsPage() {
    const firestore = useFirestore();
    const { user } = useUser();

    const ordersQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, 'orders'), where('userId', '==', user.uid));
    }, [firestore, user]);
    const { data: orders, isLoading: isLoadingOrders } = useCollection<Order>(ordersQuery);
    
    const recipesQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, 'recipes'), where('userId', '==', user.uid));
    }, [firestore, user]);
    const { data: recipes = [] } = useCollection<Recipe>(recipesQuery);

    const deliveredOrders = useMemo(() => (orders || []).filter(o => o.deliveryStatus === 'delivered'), [orders]);

    const totalRevenue = useMemo(() => deliveredOrders.reduce((sum, o) => sum + o.total, 0), [deliveredOrders]);
    
    const totalCost = useMemo(() => {
        return deliveredOrders.reduce((sum, order) => {
            const orderCost = order.items.reduce((itemSum, item) => {
                const originalRecipe = recipes.find((r: any) => r.id === item.recipe.id);
                return itemSum + (originalRecipe?.totalCost || 0) * item.quantity;
            }, 0);
            return sum + orderCost;
        }, 0);
    }, [deliveredOrders, recipes]);

    const grossProfit = totalRevenue - totalCost;
    const averageTicket = deliveredOrders.length > 0 ? totalRevenue / deliveredOrders.length : 0;

    const isLoading = isLoadingOrders;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Relatórios</h1>
                <p className="text-muted-foreground">Analise o desempenho financeiro do seu negócio.</p>
            </div>
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Receita Total" value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)} icon={DollarSign} isLoading={isLoading} />
                <StatCard title="Lucro Bruto" value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(grossProfit)} icon={TrendingUp} isLoading={isLoading} />
                <StatCard title="Ticket Médio" value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(averageTicket)} icon={Package} isLoading={isLoading} />
                <StatCard title="Encomendas Entregues" value={`${deliveredOrders.length}`} icon={Package} isLoading={isLoading} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Receita vs. Custo (Últimos 6 meses)</CardTitle>
                        <CardDescription>
                            Acompanhe a evolução da sua receita, custos e lucro.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Skeleton className="h-[400px] w-full" /> : <MonthlyRevenueChart orders={deliveredOrders} recipes={recipes} />}
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                     <CardHeader>
                        <CardTitle>Receita por Produto</CardTitle>
                         <CardDescription>
                            Veja quais produtos geram mais receita para o seu negócio.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Skeleton className="h-[350px] w-full" /> : <ProductRevenueChart orders={deliveredOrders} />}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

    