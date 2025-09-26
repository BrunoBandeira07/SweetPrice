"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Order } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { CalendarDays } from 'lucide-react';

interface UpcomingEventsProps {
    orders: Order[];
}

export default function UpcomingEvents({ orders }: UpcomingEventsProps) {
    const [date, setDate] = useState<Date | undefined>();
    const { toast } = useToast();

    useEffect(() => {
        setDate(new Date());
    }, []);

    const handleDayClick = (day: Date) => {
        const ordersOnDay = orders.filter(o => 
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
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    onDayClick={handleDayClick}
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
                            borderRadius: '9999px',
                        },
                        today: {
                            fontWeight: 'bold',
                            color: 'hsl(var(--primary))'
                        }
                    }}
                />
            </CardContent>
        </Card>
    );
}
