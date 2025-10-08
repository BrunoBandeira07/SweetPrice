"use client";

import { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, Trash2, Calendar as CalendarIcon, MoreVertical, Archive, Edit, CheckCircle2, ListTodo, Circle, Lightbulb, Loader2, ChevronDown } from 'lucide-react';
import { Campaign, CampaignStatus, CampaignTask } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { getCampaignSuggestions } from '@/app/actions';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useUser, useFirestore, useMemoFirebase } from "@/firebase/provider";
import { collection, doc } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Skeleton } from '../ui/skeleton';


const campaignFormSchema = z.object({
  name: z.string().min(3, "O nome da campanha é obrigatório."),
  dateRange: z.object({
    from: z.date({ required_error: 'Data de início é obrigatória.' }),
    to: z.date({ required_error: 'Data de término é obrigatória.' }),
  }),
  tasks: z.array(z.object({
    text: z.string().min(1, "A descrição da tarefa não pode ser vazia.")
  })).optional()
});

type CampaignFormValues = z.infer<typeof campaignFormSchema>;

const STATUS_MAP: Record<CampaignStatus, { label: string; className: string; icon: React.ElementType }> = {
    planning: { label: 'Planejamento', className: 'bg-blue-100 text-blue-800 border-blue-200', icon: Edit },
    in_progress: { label: 'Em Andamento', className: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: ListTodo },
    completed: { label: 'Concluída', className: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2 },
    archived: { label: 'Arquivada', className: 'bg-gray-100 text-gray-800 border-gray-200', icon: Archive },
};


const CampaignForm = ({ onSave, campaign }: { onSave: (data: Omit<Campaign, 'id'> & { id?: string }) => void; campaign?: Campaign }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const { toast } = useToast();

    const form = useForm<CampaignFormValues>({
        resolver: zodResolver(campaignFormSchema),
        defaultValues: {
            name: campaign?.name || '',
            dateRange: (campaign?.startDate && campaign?.endDate) ? { from: new Date(campaign.startDate), to: new Date(campaign.endDate) } : { from: undefined, to: undefined },
            tasks: campaign?.tasks.map(t => ({ text: t.text })) || [{ text: '' }],
        }
    });

    const { control, register, handleSubmit, watch, getValues, reset } = form;
    const { fields, append, remove, replace } = useFieldArray({
        control,
        name: 'tasks'
    });
    
    const dateRange = watch('dateRange');

    const handleGenerateSuggestions = async () => {
        const campaignName = getValues('name');
        if (!campaignName) {
            toast({
                variant: 'destructive',
                title: 'Nome da Campanha Vazio',
                description: 'Por favor, insira um nome para a campanha antes de pedir sugestões.'
            });
            return;
        }

        setIsSuggesting(true);
        const result = await getCampaignSuggestions(campaignName);
        setIsSuggesting(false);

        if (result.success && result.tasks) {
            const newTasks = result.tasks.map(taskText => ({ text: taskText }));
            replace(newTasks);
            toast({
                title: 'Tarefas Sugeridas!',
                description: 'A IA preencheu a lista de tarefas para você.'
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'Erro ao Gerar Sugestões',
                description: result.error
            });
        }
    }


    const onSubmit = (data: CampaignFormValues) => {
        const campaignData: Omit<Campaign, 'id'> & { id?: string } = {
            id: campaign?.id,
            name: data.name,
            startDate: data.dateRange.from.toISOString(),
            endDate: data.dateRange.to.toISOString(),
            status: campaign?.status || 'planning',
            tasks: data.tasks ? data.tasks.map((t, i) => ({ id: campaign?.tasks[i]?.id || `${new Date().toISOString()}-${i}`, text: t.text, completed: campaign?.tasks[i]?.completed || false })) : [],
        }
        onSave(campaignData);
        reset({
            name: '',
            dateRange: { from: undefined, to: undefined },
            tasks: [{ text: '' }],
        });
        setIsOpen(false);
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {campaign ? (
                     <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Editar</span>
                    </DropdownMenuItem>
                ) : (
                    <Button><Plus className="mr-2" /> Criar Campanha</Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>{campaign ? 'Editar Campanha' : 'Criar Nova Campanha'}</DialogTitle>
                    <DialogDescription>
                        Planeje suas ações, defina prazos e liste as tarefas necessárias para o sucesso da sua campanha.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <ScrollArea className="h-[60vh] pr-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome da Campanha</Label>
                                <div className="flex items-center gap-2">
                                    <Input id="name" {...register('name')} placeholder="Ex: Natal Iluminado" />
                                    <Button type="button" variant="outline" size="icon" onClick={handleGenerateSuggestions} disabled={isSuggesting}>
                                        {isSuggesting ? <Loader2 className="animate-spin" /> : <Lightbulb />}
                                        <span className="sr-only">Gerar Sugestões com IA</span>
                                    </Button>
                                </div>
                                {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Período da Campanha</Label>
                                <Controller
                                    name="dateRange"
                                    control={control}
                                    render={({ field }) => (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                            <Button
                                                id="date"
                                                variant={"outline"}
                                                className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !field.value?.from && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {dateRange?.from ? (
                                                dateRange.to ? (
                                                    <>
                                                    {format(dateRange.from, "LLL dd, y")} -{" "}
                                                    {format(dateRange.to, "LLL dd, y")}
                                                    </>
                                                ) : (
                                                    format(dateRange.from, "LLL dd, y")
                                                )
                                                ) : (
                                                <span>Selecione o período</span>
                                                )}
                                            </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                initialFocus
                                                mode="range"
                                                defaultMonth={dateRange?.from}
                                                selected={{ from: field.value.from!, to: field.value.to! }}
                                                onSelect={field.onChange}
                                                numberOfMonths={2}
                                            />
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                />
                                {form.formState.errors.dateRange && <p className="text-sm text-destructive">{form.formState.errors.dateRange?.from?.message || form.formState.errors.dateRange?.to?.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Lista de Tarefas</Label>
                                {fields.map((item, index) => (
                                    <div key={item.id} className="flex items-center gap-2">
                                        <Input {...register(`tasks.${index}.text`)} placeholder={`Tarefa ${index + 1}`} />
                                        <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}><Trash2 /></Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={() => append({ text: '' })}>
                                    <Plus className="mr-2 h-4 w-4" /> Adicionar Tarefa
                                </Button>
                            </div>
                        </div>
                    </ScrollArea>
                    <DialogFooter className="pt-4">
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">Cancelar</Button>
                        </DialogClose>
                        <Button type="submit">Salvar Campanha</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}


const CampaignCard = ({ campaign, onUpdate, onDelete }: { campaign: Campaign, onUpdate: (campaign: Campaign) => void, onDelete: (id: string) => void }) => {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(true);
    const statusInfo = STATUS_MAP[campaign.status];
    const progress = campaign.tasks.length > 0 ? (campaign.tasks.filter(t => t.completed).length / campaign.tasks.length) * 100 : 0;
    
    const handleTaskToggle = (taskId: string) => {
        const updatedTasks = campaign.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
        onUpdate({ ...campaign, tasks: updatedTasks });
    };

    const handleStatusChange = (status: CampaignStatus) => {
        onUpdate({ ...campaign, status });
        toast({
            title: `Campanha "${campaign.name}" atualizada!`,
            description: `Status alterado para: ${STATUS_MAP[status].label}`,
        })
    };


    return (
         <Collapsible asChild open={isOpen} onOpenChange={setIsOpen} defaultOpen>
            <Card className="flex flex-col">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div className="flex-grow">
                            <CardTitle>{campaign.name}</CardTitle>
                            <CardDescription>
                                {format(new Date(campaign.startDate), 'dd/MM/yyyy')} - {format(new Date(campaign.endDate), 'dd/MM/yyyy')}
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-1">
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                   <Button variant="ghost" size="icon"><MoreVertical /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                     <CampaignForm onSave={(data) => onUpdate({...(data as Campaign), id: campaign.id})} campaign={campaign}/>
                                     <DropdownMenuItem onClick={() => handleStatusChange(campaign.status === 'archived' ? 'planning' : 'archived')}>
                                        <Archive className="mr-2 h-4 w-4" />
                                        <span>{campaign.status === 'archived' ? 'Desarquivar' : 'Arquivar'}</span>
                                    </DropdownMenuItem>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                              <Trash2 className="mr-2 h-4 w-4" />
                                              <span>Excluir</span>
                                          </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Essa ação não pode ser desfeita. Isso excluirá permanentemente a campanha e todas as suas tarefas.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => onDelete(campaign.id)} className="bg-destructive hover:bg-destructive/90">Deletar</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <ChevronDown className={cn("transition-transform", isOpen && 'rotate-180')} />
                                </Button>
                            </CollapsibleTrigger>
                        </div>
                    </div>
                     <div className="flex items-center gap-2 mt-4">
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                               <Badge variant="outline" className={cn("cursor-pointer", statusInfo.className)}>
                                    <statusInfo.icon className="h-3 w-3 mr-1" />
                                    {statusInfo.label}
                                </Badge>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {Object.entries(STATUS_MAP).map(([key, value]) => (
                                    <DropdownMenuItem key={key} onClick={() => handleStatusChange(key as CampaignStatus)}>
                                        <value.icon className="mr-2 h-4 w-4" />
                                        <span>{value.label}</span>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <p className="text-xs text-muted-foreground">
                            {campaign.status === 'completed' ? 'Finalizada' : `Termina ${formatDistanceToNow(new Date(campaign.endDate), { locale: ptBR, addSuffix: true })}`}
                        </p>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow">
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-sm font-semibold">Progresso</h4>
                                    <span className="text-xs text-muted-foreground">{progress.toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2.5">
                                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CollapsibleContent>
                    <CardContent className="pt-4">
                        <div>
                            <h4 className="text-sm font-semibold mb-2">Tarefas</h4>
                            <div className="space-y-2">
                                {campaign.tasks.length > 0 ? campaign.tasks.map(task => (
                                    <div key={task.id} className="flex items-center space-x-2">
                                        <Checkbox id={task.id} checked={task.completed} onCheckedChange={() => handleTaskToggle(task.id)} />
                                        <label htmlFor={task.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 data-[completed=true]:line-through" data-completed={task.completed}>
                                            {task.text}
                                        </label>
                                    </div>
                                )) : <p className="text-sm text-muted-foreground">Nenhuma tarefa para esta campanha.</p>}
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                         <p className="text-xs text-muted-foreground">Total de tarefas: {campaign.tasks.length}</p>
                    </CardFooter>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
}

export default function PlannerPage() {
    const { toast } = useToast();
    const { user } = useUser();
    const firestore = useFirestore();

    const campaignsCollection = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'campaigns') : null, [firestore, user]);
    const { data: campaigns = [], isLoading: isLoadingCampaigns } = useCollection<Campaign>(campaignsCollection);

    const handleSaveCampaign = (campaignData: Omit<Campaign, 'id'> & { id?: string }) => {
        if (!campaignsCollection) return;
        const isEditing = !!campaignData.id;
        const docRef = campaignData.id ? doc(campaignsCollection, campaignData.id) : doc(campaignsCollection);

        const dataToSave: Campaign = {
            ...campaignData,
            id: docRef.id,
        };

        setDocumentNonBlocking(docRef, dataToSave, { merge: true });

        toast({
            title: `Campanha "${campaignData.name}" salva!`,
            description: isEditing ? 'As informações foram atualizadas.' : 'Sua nova campanha foi criada com sucesso.',
        })
    };
    
    const handleDeleteCampaign = (id: string) => {
        if (!campaignsCollection) return;
        const docRef = doc(campaignsCollection, id);
        deleteDocumentNonBlocking(docRef);
        toast({
            title: 'Campanha Excluída!',
            description: 'A campanha foi removida do seu planejador.',
        })
    };

    const activeCampaigns = campaigns.filter(c => c.status !== 'archived');
    const archivedCampaigns = campaigns.filter(c => c.status === 'archived');


    return (
        <div className="space-y-8">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Planejador de Campanhas</h1>
                    <p className="text-muted-foreground">Organize suas campanhas sazonais em um só lugar.</p>
                </div>
                <CampaignForm onSave={handleSaveCampaign} />
            </div>
            
            {isLoadingCampaigns ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-80 w-full" />)}
                 </div>
            ) : activeCampaigns.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                    {activeCampaigns.map(campaign => (
                        <CampaignCard key={campaign.id} campaign={campaign} onUpdate={handleSaveCampaign} onDelete={handleDeleteCampaign} />
                    ))}
                </div>
            ) : (
                 <Card className="text-center p-16 col-span-full">
                    <CardTitle className="flex flex-col items-center justify-center gap-4">
                        <Circle className="h-16 w-16 text-muted-foreground/30" />
                        Seu planejador está vazio
                    </CardTitle>
                    <CardDescription className="mt-4">Comece a planejar sua primeira campanha clicando no botão "Criar Campanha".</CardDescription>
                </Card>
            )}

            {archivedCampaigns.length > 0 && (
                <div className="space-y-6">
                     <div>
                        <h2 className="text-2xl font-bold">Campanhas Arquivadas</h2>
                        <p className="text-muted-foreground">Campanhas passadas que você pode consultar.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {archivedCampaigns.map(campaign => (
                            <CampaignCard key={campaign.id} campaign={campaign} onUpdate={handleSaveCampaign} onDelete={handleDeleteCampaign} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
