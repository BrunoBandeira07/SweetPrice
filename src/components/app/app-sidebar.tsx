"use client";

import { usePathname } from 'next/navigation';
import { Cake, BookHeart, Settings, LayoutDashboard, Users, Archive, ShoppingCart, FileText, CalendarCheck, BarChart3, LogOut } from 'lucide-react';
import { SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarTrigger, SidebarFooter } from '@/components/ui/sidebar';
import { useAuth } from '@/firebase/provider';
import { signOut } from 'firebase/auth';
import { Button } from '../ui/button';

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/orders', icon: ShoppingCart, label: 'Encomendas' },
  { href: '/planner', icon: CalendarCheck, label: 'Planejador' },
  { href: '/calculator', icon: Cake, label: 'Calculadora' },
  { href: '/recipes', icon: BookHeart, label: 'Receitas' },
  { href: '/stock', icon: Archive, label: 'Estoque' },
  { href: '/customers', icon: Users, label: 'Clientes' },
  { href: '/quotes', icon: FileText, label: 'Orçamentos' },
  { href: '/reports', icon: BarChart3, label: 'Relatórios' },
  { href: '/costs', icon: Settings, label: 'Custos' },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const auth = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
    // The AuthGate will handle the redirect to /login
  };

  return (
    <>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
            <div className="bg-sidebar-primary/20 p-2 rounded-lg">
                 <Cake className="text-sidebar-primary" size={24} />
            </div>
            <h1 className="text-xl font-semibold font-headline">Precifica Céu</h1>
            <SidebarTrigger className="ml-auto" />
        </div>
      </SidebarHeader>
      <SidebarContent className="p-4">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
              >
                <a href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
          <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} tooltip="Sair">
                    <LogOut/>
                    <span>Sair</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
