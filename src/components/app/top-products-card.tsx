
"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Order } from '@/lib/types';
import { BarChart } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

interface TopProductsCardProps {
    orders: Order[];
    isLoading: boolean;
}

export default function TopProductsCard({ orders, isLoading }: TopProductsCardProps) {

    const topProducts = useMemo(() => {
        if (!orders || orders.length === 0) return [];

        const productMap: { [key: string]: number } = {};
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const monthlyOrders = (orders || []).filter(o => {
            const orderDate = new Date(o.deliveryDate);
            return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
        });

        monthlyOrders.forEach(order => {
            order.items.forEach(item => {
                const name = item.recipe.name;
                if (productMap[name]) {
                    productMap[name] += item.quantity;
                } else {
                    productMap[name] = item.quantity;
                }
            });
        });

        return Object.entries(productMap)
            .map(([name, quantity]) => ({ name, quantity }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);

    }, [orders]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart />
                    Top 5 Produtos do Mês
                </CardTitle>
                <CardDescription>Os produtos mais vendidos neste mês.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                     <div className="space-y-2">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                ) : topProducts.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Produto</TableHead>
                                <TableHead className="text-right">Qtd. Vendida</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {topProducts.map((product, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell className="text-right">{product.quantity}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center py-4 text-muted-foreground">
                        <p>Nenhuma venda registrada este mês.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
