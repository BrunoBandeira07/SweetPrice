
"use client";

import { useState, useEffect } from 'react';
import { DollarSign, Package, ShoppingCart, Users, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Order, Customer, Ingredient } from '@/lib/types';
import { INITIAL_INGREDIENTS, INITIAL_ORDERS } from '@/lib/constants';
import UpcomingEvents from '@/components/app/upcoming-events';
import { cn } from '@/lib/utils';

const StatCard = ({ title, value, icon: Icon, description, className }: { title: string, value: string, icon: React.ElementType, description: string, className?: string }) => (
    <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
)

export default function DashboardPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    
    useEffect(() => {
        try {
            const storedOrders = localStorage.getItem('orders');
             if (storedOrders) {
                setOrders(JSON.parse(storedOrders));
            } else {
                setOrders(INITIAL_ORDERS)
            }
        } catch (error) {
           console.error("Failed to load orders from localStorage", error);
           setOrders(INITIAL_ORDERS);
        }
        
        try {
            const storedCustomers = localStorage.getItem('customers');
            if (storedCustomers) {
                setCustomers(JSON.parse(storedCustomers));
            }
        } catch (error) {
            console.error("Failed to load customers from localStorage", error);
        }

         try {
            const storedIngredients = localStorage.getItem('ingredients');
            if (storedIngredients) {
                setIngredients(JSON.parse(storedIngredients));
            } else {
                setIngredients(INITIAL_INGREDIENTS);
            }
        } catch (error) {
            console.error("Failed to load ingredients from localStorage", error);
        }

    }, []);


    const monthlySales = orders
        .filter(o => o.deliveryStatus === 'delivered' && new Date(o.deliveryDate).getMonth() === new Date().getMonth())
        .reduce((sum, o) => sum + o.total, 0);

    const pendingOrdersCount = orders.filter(o => o.deliveryStatus === 'pending').length;
    
    const upcomingOrders = orders
        .filter(o => o.deliveryStatus === 'pending' && new Date(o.deliveryDate) >= new Date())
        .sort((a,b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime())
        .slice(0, 5); // Limit to 5 upcoming orders

    const criticalStockCount = ingredients.filter(i => (i.stockQuantity ?? 0) <= (i.lowStockThreshold ?? 0)).length;
    

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Vendas no Mês" value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthlySales)} icon={DollarSign} description="Total de vendas em encomendas entregues" />
                <StatCard title="Encomendas Pendentes" value={`+${pendingOrdersCount}`} icon={ShoppingCart} description="Total de encomendas a serem produzidas/entregues" />
                <StatCard title="Total de Clientes" value={`${customers.length}`} icon={Users} description="Número de clientes cadastrados" />
                <StatCard 
                    title="Estoque Crítico" 
                    value={`${criticalStockCount}`} 
                    icon={AlertTriangle} 
                    description="Itens com estoque baixo ou zerado"
                    className={cn(criticalStockCount > 0 && "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800 [&>div>svg]:text-yellow-800 dark:[&>div>svg]:text-yellow-300")}
                />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8">
                     <Card>
                        <CardHeader>
                            <CardTitle>Próximas Encomendas</CardTitle>
                        </CardHeader>
                        <CardContent>
                             {upcomingOrders.length > 0 ? (
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
                <div className="lg:col-span-1">
                    <UpcomingEvents orders={orders} />
                </div>
            </div>
        </div>
    );
}
