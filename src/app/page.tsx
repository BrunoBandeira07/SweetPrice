"use client";

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, DollarSign, Package, ShoppingCart } from 'lucide-react';
import AppHeader from '@/components/app/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Order } from '@/lib/types';
import { INITIAL_ORDERS } from '@/lib/constants';
import AddOrderForm from '@/components/app/add-order-form';


const StatCard = ({ title, value, icon: Icon, description }: { title: string, value: string, icon: React.ElementType, description: string }) => (
    <Card>
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
    const [date, setDate] = useState<Date | undefined>(undefined);
    
    useEffect(() => {
        setDate(new Date());
        try {
            const storedOrders = localStorage.getItem('orders');
            if (storedOrders) {
                setOrders(JSON.parse(storedOrders));
            } else {
                setOrders(INITIAL_ORDERS);
                localStorage.setItem('orders', JSON.stringify(INITIAL_ORDERS));
            }
        } catch (error) {
            console.error("Failed to load orders from localStorage", error);
            setOrders(INITIAL_ORDERS);
        }
    }, []);

    const updateOrders = (newOrders: Order[]) => {
        setOrders(newOrders);
        localStorage.setItem('orders', JSON.stringify(newOrders));
    }

    const monthlySales = orders
        .filter(o => o.deliveryStatus === 'delivered' && new Date(o.deliveryDate).getMonth() === new Date().getMonth())
        .reduce((sum, o) => sum + o.total, 0);

    const pendingOrders = orders.filter(o => o.deliveryStatus === 'pending').length;
    
    const upcomingOrders = orders
        .filter(o => o.deliveryStatus === 'pending' && new Date(o.deliveryDate) >= new Date())
        .sort((a,b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime());

    const handleAddOrder = (newOrder: Omit<Order, 'id' | 'deliveryStatus' | 'productionStatus'>) => {
        const orderWithId: Order = { 
            ...newOrder, 
            id: new Date().toISOString(),
            deliveryStatus: 'pending',
            productionStatus: 'to_do',
        };
        updateOrders([...orders, orderWithId]);
    }

    return (
        <div className="min-h-screen w-full">
            <AppHeader />
            <main className="container mx-auto p-4 md:p-8 space-y-8">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard title="Vendas no Mês" value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthlySales)} icon={DollarSign} description="Total de vendas em encomendas entregues" />
                    <StatCard title="Encomendas Pendentes" value={`+${pendingOrders}`} icon={ShoppingCart} description="Total de encomendas a serem produzidas/entregues" />
                    <StatCard title="Novos Clientes" value="+12" icon={Package} description="+5% em relação ao mês passado (placeholder)" />
                    <StatCard title="Estoque Baixo" value="3 Itens" icon={Package} description="Itens que precisam de reposição (placeholder)" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                         <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="font-headline text-2xl">Próximas Encomendas</CardTitle>
                            </CardHeader>
                            <CardContent>
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
                                                <TableCell>{new Date(order.deliveryDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric'})}</TableCell>
                                                <TableCell>
                                                    <Badge variant={order.deliveryStatus === 'pending' ? 'secondary' : 'default'}>{order.deliveryStatus}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                        <AddOrderForm onAddOrder={handleAddOrder} />
                    </div>
                    <div>
                        <Card className="shadow-lg">
                             <CardHeader>
                                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                                  <CalendarIcon className="text-primary"/>
                                  Calendário
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex justify-center">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    className="rounded-md"
                                    modifiers={{
                                        deliveryDay: orders
                                            .filter(o => o.deliveryStatus === 'pending')
                                            .map(o => new Date(o.deliveryDate))
                                    }}
                                    modifiersStyles={{
                                        deliveryDay: {
                                            color: 'hsl(var(--primary-foreground))',
                                            backgroundColor: 'hsl(var(--primary))',
                                        },
                                    }}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
