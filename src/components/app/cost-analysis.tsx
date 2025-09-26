"use client";

import { useMemo } from 'react';
import { TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { RecipeItem } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface CostAnalysisProps {
  recipeItems: RecipeItem[];
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', '#D3B4F3', '#B4F3D3', '#fbc6a4', '#b5eAD7', '#ffdac1'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background/80 backdrop-blur-sm p-2 border rounded-md shadow-lg">
        <p className="font-bold">{data.name}</p>
        <p className="text-sm">
          Custo: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.value)} ({data.percent}%)
        </p>
      </div>
    );
  }
  return null;
};

const CostAnalysis = ({ recipeItems }: CostAnalysisProps) => {
  const totalCost = useMemo(() => {
    return recipeItems.reduce((acc, item) => acc + item.cost, 0);
  }, [recipeItems]);

  const chartData = useMemo(() => {
    if (totalCost === 0) return [];
    
    // Group costs by type (Ingredients, Labor, Equipment)
    const groupedCosts = recipeItems.reduce((acc, item) => {
        let key = '';
        if (item.type === 'ingredient') key = 'Ingredientes';
        else if (item.type === 'labor') key = 'Mão de Obra';
        else if (item.type === 'equipment') key = 'Equipamentos';
        
        if (key) {
            if (!acc[key]) acc[key] = 0;
            acc[key] += item.cost;
        }
        return acc;
    }, {} as Record<string, number>);


    return Object.entries(groupedCosts).map(([name, value]) => ({
      name,
      value,
      percent: ((value / totalCost) * 100).toFixed(1),
    }));
  }, [recipeItems, totalCost]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon/>
          Análise de Custo
        </CardTitle>
        <CardDescription>
          Visualize a proporção de custo de cada componente na sua receita.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  stroke="hsl(var(--card))"
                  strokeWidth={4}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[350px] text-center p-4 border-2 border-dashed rounded-lg">
            <TrendingUp className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold">Nenhum dado para analisar</h3>
            <p className="text-sm text-muted-foreground">
              Adicione itens à sua receita para ver a análise de custos aqui.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CostAnalysis;
