
"use client";

import { Quote } from '@/app/quotes/page';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Copy, FileText, Share2, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addDays, format } from 'date-fns';

interface QuotePreviewProps {
    quote: Quote;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export default function QuotePreview({ quote }: QuotePreviewProps) {
    const { toast } = useToast();

    const companyDetails = {
        name: "Precifica Céu Confeitaria",
        phone: "(11) 98765-4321",
        email: "contato@precificaceu.com.br",
        instagram: "@precificaceu"
    };

    const generateTextQuote = () => {
        let text = `*Orçamento de ${companyDetails.name}*\n\n`;
        text += `Olá, ${quote.customer.name || 'Cliente'}!\nSegue o seu orçamento:\n\n`;
        text += `*Itens:*\n`;
        quote.items.forEach(item => {
            text += `- ${item.quantity}x ${item.recipe.name} - ${formatCurrency(item.total)}\n`;
        });
        text += `\n*Valor Total: ${formatCurrency(quote.total)}*\n\n`;
        if (quote.notes) {
            text += `*Observações:*\n${quote.notes}\n\n`;
        }
        text += `Este orçamento é válido até ${format(addDays(new Date(), quote.validityInDays), 'dd/MM/yyyy')}.\n\n`;
        text += `Qualquer dúvida, estamos à disposição!\n${companyDetails.name}\n${companyDetails.phone}`;
        return text;
    };

    const handleCopyToClipboard = () => {
        const textToCopy = generateTextQuote();
        navigator.clipboard.writeText(textToCopy);
        toast({
            title: 'Orçamento Copiado!',
            description: 'Você pode colar o texto no seu e-mail ou onde preferir.'
        });
    };
    
    const handleShareWhatsApp = () => {
        const text = generateTextQuote();
        const whatsappUrl = `https://wa.me/${(quote.customer.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
        window.open(whatsappUrl, '_blank');
    };

    const expirationDate = addDays(new Date(), quote.validityInDays);

    return (
        <Card className="shadow-lg">
            <CardHeader className="text-center">
                <CardTitle className="font-headline text-2xl flex items-center justify-center gap-2"><FileText /> Pré-visualização do Orçamento</CardTitle>
                <CardDescription>Este é o orçamento que será enviado para o seu cliente.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="p-6 border rounded-lg space-y-6" id="quote-content">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-lg">{companyDetails.name}</h3>
                            <p className="text-sm text-muted-foreground">{companyDetails.phone}</p>
                            <p className="text-sm text-muted-foreground">{companyDetails.email}</p>
                        </div>
                        <div className="text-right">
                            <h4 className="font-semibold">Orçamento</h4>
                            <p className="text-sm text-muted-foreground">Data: {format(new Date(), 'dd/MM/yyyy')}</p>
                             <p className="text-sm text-muted-foreground">Válido até: {format(expirationDate, 'dd/MM/yyyy')}</p>
                        </div>
                    </div>
                    <Separator />
                    {/* Customer */}
                    <div>
                        <h4 className="font-semibold">Para:</h4>
                        <p>{quote.customer.name || 'Cliente não selecionado'}</p>
                        <p>{quote.customer.phone || ''}</p>
                    </div>

                    {/* Items Table */}
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50%]">Produto</TableHead>
                                <TableHead className="text-center">Qtd.</TableHead>
                                <TableHead className="text-right">Preço Un.</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {quote.items.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.recipe.name}</TableCell>
                                    <TableCell className="text-center">{item.quantity}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                                    <TableCell className="text-right font-medium">{formatCurrency(item.total)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {/* Total */}
                     <div className="flex justify-end">
                        <div className="w-full md:w-1/2 space-y-2">
                             <Separator />
                             <div className="flex justify-between font-bold text-lg">
                                <span>Total:</span>
                                <span>{formatCurrency(quote.total)}</span>
                             </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {quote.notes && (
                         <div>
                            <h4 className="font-semibold">Observações:</h4>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{quote.notes}</p>
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter className="flex-col md:flex-row gap-2">
                 <Button className="w-full" onClick={handleShareWhatsApp} disabled={!quote.customer.name || quote.items.length === 0}>
                    <MessageCircle className="mr-2"/> Compartilhar no WhatsApp
                </Button>
                <Button variant="outline" className="w-full" onClick={handleCopyToClipboard} disabled={quote.items.length === 0}>
                    <Copy className="mr-2"/> Copiar para Área de Transferência
                </Button>
            </CardFooter>
        </Card>
    );
}
