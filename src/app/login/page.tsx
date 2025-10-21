
'use client';

import { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, AuthError } from 'firebase/auth';
import { useAuth } from '@/firebase/provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Cake, AlertTriangle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Label } from '../ui/label';
import EmailVerificationAlert from '@/components/app/email-verification-alert';


const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48" fill="currentColor">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
g-4 w-full" />
                        </TableRow>
                     ))
                  ) : filteredIngredients.map(ingredient => {
                     const status = getStatus(ingredient);
                     return (
                        <TableRow key={ingredient.id}>
                            <TableCell className="font-medium">{ingredient.name}</TableCell>
                            <TableCell>
                                <span className="font-mono">{ingredient.stockQuantity || 0} {ingredient.unit}</span>
                            </TableCell>
                            <TableCell>
                                <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-[200px] justify-start text-left font-normal",
                                        !ingredient.expirationDate && "text-muted-foreground"
                                    )}
                                    >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {ingredient.expirationDate
                                        ? format(new Date(ingredient.expirationDate), 'PPP', { locale: ptBR })
                                        : <span>Sem data</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                    mode="single"
                                    selected={ingredient.expirationDate ? new Date(ingredient.expirationDate) : undefined}
                                    onSelect={(date) => handleDateChange(ingredient, date)}
                                    initialFocus
                                    />
                                </PopoverContent>
                                </Popover>
                            </TableCell>
                            <TableCell>
                                <Badge 
                                    variant={status.color as any} 
                                    className={cn('flex items-center gap-1 w-fit', {
                                        'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700': status.color === 'destructive',
                                        'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700': status.color === 'accent',
                                        'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700': status.color === 'default',
                                    })}
                                >
                                    <status.icon className="h-3 w-3"/>
                                    {status.label}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <StockMovementDialog ingredient={ingredient} type="in" />
                                    <StockMovementDialog ingredient={ingredient} type="out" />
                                </div>
                            </TableCell>
                        </TableRow>
                     )
                  })}
                </TableBody>
              </Table>
            </div>
            {!isLoadingIngredients && filteredIngredients.length === 0 && (
                <div className="text-center py-16">
                    <p className="text-muted-foreground">Nenhum ingrediente encontrado.</p>
                </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
}
