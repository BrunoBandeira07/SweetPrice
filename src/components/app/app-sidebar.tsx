"use client";

import { usePathname } from 'next/navigation';
import { Cake, BookHeart, Settings, LayoutDashboard, Users, Archive, ShoppingCart, FileText, PanelLeft } from 'lucide-react';
import { SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/orders', icon: ShoppingCart, label: 'Encomendas' },
  { href: '/calculator', icon: Cake, label: 'Calculadora' },
  { href: '/recipes', icon: BookHeart, label: 'Receitas' },
  { href: '/stock', icon: Archive, label: 'Estoque' },
  { href: '/customers', icon: Users, label: 'Clientes' },
  { href: '/quotes', icon: FileText, label: 'Orçamentos' },
  { href: '/costs', icon: Settings, label: 'Custos' },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { isMobile } = useSidebar();

  return (
    <>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
            <div className="bg-primary/20 p-2 rounded-lg">
                 <Cake className="text-primary" size={24} />
            </div>
            <h1 className="text-xl font-semibold">Precifica Céu</h1>
            {isMobile && <SidebarTrigger className="ml-auto" />}
        </div>
      </SidebarHeader>
      <SidebarContent className="p-4">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                href={item.href}
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
    </>
  );
}
