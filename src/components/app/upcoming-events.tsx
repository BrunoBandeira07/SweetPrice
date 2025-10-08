
"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Order } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import { CalendarDays } from 'lucide-react';

interface UpcomingEventsProps {
    orders: Order[];
    isLoading: boolean;
}

export default function UpcomingEvents({ orders, isLoading }: UpcomingEventsProps) {
    const { toast } = useToast();

    const deliveryDays = useMemo(() => {
        if (!orders) return []; // GUARANTEE that orders is available before processing
        return (orders || [])
            .filter(o => o.deliveryStatus === 'pending')
            .map(o => new Date(o.deliveryDate));
    }, [orders]);

    const handleDayClick = (day: Date) => {
        const ordersOnDay = (orders || []).filter(o => 
            new Date(o.deliveryDate).toDateString() === day.toDateString() &&
            o.deliveryStatus === 'pending'
        );

        if (ordersOnDay.length > 0) {
            toast({
                title: `Entregas para ${day.toLocaleDateString('pt-BR')}:`,
                description: (
                    <ul className="list-disc pl-5">
                        {ordersOnDay.map(o => <li key={o.id}>{o.customerName}</li>)}
                    </ul>
                )
            })
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <CalendarDays />
                    Calendário de Entregas
                </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center p-0">
                {isLoading ? (
                    <div className="p-4">
                        <Skeleton className="h-[280px] w-[280px]" />
                    </div>
                ) : (
                    <Calendar
                        mode="single"
                        onDayClick={handleDayClick}
                        className="rounded-md"
                        modifiers={{
                            deliveryDay: deliveryDays,
                        }}
                        modifierClassNames={{
                           deliveryDay: 'bg-primary text-primary-foreground rounded-full',
                        }}
                    />
                )}
            </CardContent>
        </Card>
    );
}
