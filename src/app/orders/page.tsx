
"use client";

import { useState, useEffect } from 'react';
import { format, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import AppHeader from '@/components/app/header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

import type { Order, ProductionStatus } from '@/lib/types';
import { INITIAL_ORDERS, PRODUCTION_STATUS_MAP } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { CircleDotDashed, ShoppingCart, CheckCircle2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';


const OrderCard = ({ order, onStatusChange }: { order: Order; onStatusChange: (orderId: string, status: ProductionStatus) => void; }) => {
    const [isOpen, setIsOpen] = useState(true);
    const deliveryDate = new Date(order.deliveryDate);
    const isOverdue = isPast(deliveryDate) && order.deliveryStatus === 'pending';

    return (
      <Collapsible asChild open={isOpen} onOpenChange={setIsOpen}>
        <Card className="shadow-md">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{order.customerName}</CardTitle>
                        <CardDescription className={isOverdue ? 'text-destructive font-bold' : ''}>
                            Entrega: {format(deliveryDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            {isOverdue && " (ATRASADA)"}
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={order.deliveryStatus === 'pending' ? 'secondary' : 'default'}>{order.deliveryStatus}</Badge>
                       <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="icon" className="shrink-0">
                                <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")}/>
                                <span className="sr-only">{isOpen ? 'Contrair' : 'Expandir'}</span>
                            </Button>
                        </CollapsibleTrigger>
                    </div>
                </div>
            </CardHeader>
            <CollapsibleContent>
                <CardContent>
                    <Accordion type="single" collapsible>
                        <AccordionItem value="items">
                            <AccordionTrigger>Ver Itens ({order.items.length})</AccordionTrigger>
                            <AccordionContent>
                                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                                    {order.items.map(item => (
                                        <li key={item.recipe.id}>{item.quantity}x {item.recipe.name}</li>
                                    ))}
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                    <Separator className="my-4"/>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Status da Produção</label>
                        <Select value={order.productionStatus} onValueChange={(value) => onStatusChange(order.id, value as ProductionStatus)}>
                            <SelectTrigger className={PRODUCTION_STATUS_MAP[order.productionStatus].color}>
                                <SelectValue placeholder="Selecione o status"/>
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(PRODUCTION_STATUS_MAP).map(([key, { label }]) => (
                                    <SelectItem key={key} value={key}>{label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <span className="font-bold text-lg">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total)}</span>
                </CardFooter>
            </CollapsibleContent>
        </Card>
    </Collapsible>
    )
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const { toast } = useToast();

    useEffect(() => {
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

    const handleProductionStatusChange = (orderId: string, newStatus: ProductionStatus) => {
        const updatedOrders = orders.map(order => {
            if (order.id === orderId) {
                return { ...order, productionStatus: newStatus };
            }
            return order;
        });
        updateOrders(updatedOrders);
        toast({
            title: "Status Atualizado!",
            description: `A encomenda de ${updatedOrders.find(o => o.id === orderId)?.customerName} foi atualizada para "${PRODUCTION_STATUS_MAP[newStatus].label}".`
        });
    }

    const pendingOrders = orders
        .filter(o => o.deliveryStatus === 'pending')
        .sort((a,b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime());

    const completedOrders = orders
        .filter(o => o.deliveryStatus !== 'pending')
        .sort((a,b) => new Date(b.deliveryDate).getTime() - new Date(a.deliveryDate).getTime());
    
    return (
        <div className="min-h-screen w-full">
            <AppHeader/>
            <main className="container mx-auto p-4 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    
                    {/* Pending Orders Column */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <CircleDotDashed className="h-8 w-8 text-primary"/>
                            <h1 className="font-headline text-3xl">Encomendas Pendentes ({pendingOrders.length})</h1>
                        </div>
                        {pendingOrders.length > 0 ? (
                           <div className="space-y-4">
                             {pendingOrders.map(order => (
                                <OrderCard key={order.id} order={order} onStatusChange={handleProductionStatusChange} />
                            ))}
                           </div>
                        ) : (
                            <Card className="text-center p-8">
                                <p className="text-muted-foreground">Nenhuma encomenda pendente no momento.</p>
                            </Card>
                        )}
                    </div>

                    {/* Completed Orders Column */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <CheckCircle2 className="h-8 w-8 text-green-600"/>
                            <h1 className="font-headline text-3xl">Histórico de Encomendas ({completedOrders.length})</h1>
                        </div>
                        {completedOrders.length > 0 ? (
                             <div className="space-y-4">
                                {completedOrders.map(order => (
                                    <OrderCard key={order.id} order={order} onStatusChange={handleProductionStatusChange} />
                                ))}
                            </div>
                        ) : (
                           <Card className="text-center p-8">
                                <p className="text-muted-foreground">Nenhuma encomenda no histórico.</p>
                            </Card>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
