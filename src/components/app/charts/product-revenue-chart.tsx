"use client"

import * as React from "react"
import { Pie, PieChart, Sector } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { Order } from "@/lib/types";
import { TrendingUp } from "lucide-react";

interface ProductRevenueChartProps {
    orders: Order[];
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function ProductRevenueChart({ orders }: ProductRevenueChartProps) {
  const chartData = React.useMemo(() => {
    const productRevenue: Record<string, { name: string; value: number }> = {};
    
    orders.forEach(order => {
        order.items.forEach(item => {
            const productName = item.recipe.name;
            if (!productRevenue[productName]) {
                productRevenue[productName] = { name: productName, value: 0 };
            }
            productRevenue[productName].value += item.recipe.suggestedPrice ? item.recipe.suggestedPrice * item.quantity : 0;
        });
    });

    return Object.values(productRevenue)
        .sort((a, b) => b.value - a.value) // Sort by revenue
        .slice(0, 5); // Take top 5
  }, [orders]);
  
  const chartConfig = chartData.reduce((acc, data, index) => {
    acc[data.name] = {
      label: data.name,
      color: COLORS[index % COLORS.length],
    };
    return acc;
  }, {} as any);

  const totalRevenue = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0)
  }, [chartData])

  const id = "pie-interactive"
  const [active, setActive] = React.useState(chartData[0]?.name)

  if (chartData.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-[350px] text-center p-4 border-2 border-dashed rounded-lg">
            <TrendingUp className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold">Nenhum dado para exibir</h3>
            <p className="text-sm text-muted-foreground">
              Nenhuma encomenda entregue foi encontrada para gerar o gráfico.
            </p>
        </div>
    )
  }

  return (
    <div className="h-[350px] w-full">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square h-full"
      >
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius={60}
            strokeWidth={5}
            activeIndex={chartData.findIndex(d => d.name === active)}
            activeShape={({
              outerRadius = 0,
              ...props
            }) => (
              <g>
                <Sector {...props} outerRadius={outerRadius + 10} />
                <Sector
                  {...props}
                  outerRadius={outerRadius + 25}
                  innerRadius={outerRadius + 12}
                />
              </g>
            )}
            onMouseOver={(_, index) => setActive(chartData[index].name)}
          >
             {chartData.map((entry, index) => (
                <Sector key={`cell-${index}`} fill={COLORS[index % COLORS.length]} name={entry.name} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
    </div>
  )
}
