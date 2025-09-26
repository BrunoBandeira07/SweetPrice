"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Order } from '@/lib/types';

interface UpcomingEventsProps {
    orders: Order[];
}

export default function UpcomingEvents({ orders }: UpcomingEventsProps) {
    const [date, setDate] = useState<Date | undefined>(new Date());

    return (
        <Card>
             <CardHeader>
                <CardTitle>Calendário</CardTitle>
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
    );
}
