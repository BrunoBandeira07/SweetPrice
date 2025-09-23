"use client";

import { useMemo } from 'react';
import { TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { RecipeIngredient } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface CostAnalysisProps {
  recipeIngredients: RecipeIngredient[];
}

const COLORS = ['#F4B4C5', '#F9E79F', '#B4E4F3', '#D3B4F3', '#B4F3D3'];

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

const CostAnalysis = ({ recipeIngredients }: CostAnalysisProps) => {
  const totalCost = useMemo(() => {
    return recipeIngredients.reduce((acc, ri) => {
      const costPerUnit = ri.ingredient.cost / ri.ingredient.packageSize;
      return acc + (costPerUnit * ri.quantity);
    }, 0);
  }, [recipeIngredients]);

  const chartData = useMemo(() => {
    if (totalCost === 0) return [];
    return recipeIngredients.map(ri => {
      const cost = (ri.ingredient.cost / ri.ingredient.packageSize) * ri.quantity;
      return {
        name: ri.ingredient.name,
        value: cost,
        percent: ((cost / totalCost) * 100).toFixed(1),
      };
    });
  }, [recipeIngredients, totalCost]);

  return (
    <Card className="shadow-lg h-full">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <PieChartIcon className="text-primary"/>
          Análise de Custo
        </CardTitle>
        <CardDescription>
          Visualize a proporção de custo de cada ingrediente na sua receita.
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
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
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
              Adicione ingredientes à sua receita para ver a análise de custos aqui.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CostAnalysis;
