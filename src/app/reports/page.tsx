"use client";

import { useState, useEffect } from 'react';
import { DollarSign, Package, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Order } from '@/lib/types';
import MonthlyRevenueChart from '@/components/app/charts/monthly-revenue-chart';
import ProductRevenueChart from '@/components/app/charts/product-revenue-chart';

const StatCard = ({ title, value, icon: Icon }: { title: string, value: string, icon: React.ElementType }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);

export default function ReportsPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    
    useEffect(() => {
        try {
            const storedOrders = localStorage.getItem('orders');
             if (storedOrders) {
                setOrders(JSON.parse(storedOrders));
            }
        } catch (error) {
           console.error("Failed to load orders from localStorage", error);
        }
    }, []);
    
    const deliveredOrders = orders.filter(o => o.deliveryStatus === 'delivered');

    const totalRevenue = deliveredOrders.reduce((sum, o) => sum + o.total, 0);
    
    const totalCost = deliveredOrders.reduce((sum, order) => {
        const orderCost = order.items.reduce((itemSum, item) => {
            const recipe = item.recipe;
            // Find the original recipe from localStorage to get its totalCost
            // This is a simplification; a real app might store costs differently.
            const storedRecipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
            const originalRecipe = storedRecipes.find((r: any) => r.id === recipe.id);
            return itemSum + (originalRecipe?.totalCost || 0) * item.quantity;
        }, 0);
        return sum + orderCost;
    }, 0);

    const grossProfit = totalRevenue - totalCost;
    const averageTicket = deliveredOrders.length > 0 ? totalRevenue / deliveredOrders.length : 0;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Relatórios</h1>
                <p className="text-muted-foreground">Analise o desempenho financeiro do seu negócio.</p>
            </div>
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Receita Total" value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)} icon={DollarSign} />
                <StatCard title="Lucro Bruto" value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(grossProfit)} icon={TrendingUp} />
                <StatCard title="Ticket Médio" value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(averageTicket)} icon={Package} />
                <StatCard title="Encomendas Entregues" value={`${deliveredOrders.length}`} icon={Package} />
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
                        <MonthlyRevenueChart orders={deliveredOrders} />
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
                        <ProductRevenueChart orders={deliveredOrders} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
