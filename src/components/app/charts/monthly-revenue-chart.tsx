"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { subMonths, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { Order, Recipe } from "@/lib/types";

interface MonthlyRevenueChartProps {
    orders: Order[];
}

export default function MonthlyRevenueChart({ orders }: MonthlyRevenueChartProps) {
    const [recipes, setRecipes] = React.useState<Recipe[]>([]);

    React.useEffect(() => {
        try {
            const storedRecipes = localStorage.getItem('savedRecipes');
            if (storedRecipes) {
                setRecipes(JSON.parse(storedRecipes));
            }
        } catch (error) {
            console.error("Failed to load recipes from localStorage", error);
        }
    }, []);
    
    const chartData = React.useMemo(() => {
        const data: { month: string; receita: number; custo: number; lucro: number }[] = [];
        const sixMonthsAgo = subMonths(new Date(), 5);

        for (let i = 0; i < 6; i++) {
            const date = subMonths(new Date(), i);
            data.push({ month: format(date, 'MMM', { locale: ptBR }), receita: 0, custo: 0, lucro: 0 });
        }
        data.reverse();

        const storedRecipes = recipes;

        orders.forEach(order => {
            const orderDate = new Date(order.deliveryDate);
            if (orderDate >= sixMonthsAgo) {
                const monthName = format(orderDate, 'MMM', { locale: ptBR });
                const monthData = data.find(d => d.month.toLowerCase() === monthName.toLowerCase());
                
                if (monthData) {
                    monthData.receita += order.total;

                    const orderCost = order.items.reduce((acc, item) => {
                        const originalRecipe = storedRecipes.find(r => r.id === item.recipe.id);
                        return acc + (originalRecipe?.totalCost || 0) * item.quantity;
                    }, 0);
                    
                    monthData.custo += orderCost;
                    monthData.lucro = monthData.receita - monthData.custo;
                }
            }
        });

        return data;
    }, [orders, recipes]);

    const chartConfig = {
        receita: {
            label: "Receita",
            color: "hsl(var(--chart-2))",
        },
        custo: {
            label: "Custo",
            color: "hsl(var(--chart-4))",
        },
        lucro: {
            label: "Lucro",
            color: "hsl(var(--chart-1))",
        }
    }

  return (
     <div className="h-[400px] w-full">
        <ChartContainer config={chartConfig}>
            <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                />
                 <YAxis
                    tickFormatter={(value) => `R$ ${value / 1000}k`}
                />
                <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="receita" fill="var(--color-receita)" radius={4} />
                <Bar dataKey="custo" fill="var(--color-custo)" radius={4} />
            </BarChart>
        </ChartContainer>
     </div>
  )
}
