import { Cake, BookHeart, Settings, LayoutDashboard, Users, Archive, ShoppingCart, FileText } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const AppHeader = () => {
  const headerBg = PlaceHolderImages.find(p => p.id === 'header-background');

  return (
    <header className="relative bg-primary/20 py-8 text-center text-primary-foreground shadow-md">
      {headerBg && (
        <Image
          src={headerBg.imageUrl}
          alt={headerBg.description}
          fill
          className="object-cover opacity-20"
          data-ai-hint={headerBg.imageHint}
          priority
        />
      )}
      <div className="relative z-10 container mx-auto">
        <div className="flex items-center justify-center gap-4">
          <Cake className="h-12 w-12 text-primary" />
          <h1 className="font-headline text-5xl font-bold tracking-tight text-primary-foreground">
            Precifica Céu
          </h1>
        </div>
        <p className="mt-2 text-lg text-primary-foreground/80 font-script">
          Precificação fácil para suas doces criações
        </p>

        <nav className="mt-6 flex justify-center flex-wrap gap-4">
            <Link href="/" className="text-primary-foreground/90 hover:text-primary-foreground font-semibold pb-1 border-b-2 border-transparent hover:border-primary/50 transition-colors">
                <LayoutDashboard className="inline-block mr-2"/>Dashboard
            </Link>
             <Link href="/orders" className="text-primary-foreground/70 hover:text-primary-foreground font-semibold pb-1 border-b-2 border-transparent hover:border-primary/50 transition-colors">
                <ShoppingCart className="inline-block mr-2"/>Encomendas
            </Link>
            <Link href="/calculator" className="text-primary-foreground/70 hover:text-primary-foreground font-semibold pb-1 border-b-2 border-transparent hover-border-primary/50 transition-colors">
                <Cake className="inline-block mr-2"/>Calculadora
            </Link>
            <Link href="/recipes" className="text-primary-foreground/70 hover:text-primary-foreground font-semibold pb-1 border-b-2 border-transparent hover-border-primary/50 transition-colors">
                <BookHeart className="inline-block mr-2"/>Livro de Receitas
            </Link>
             <Link href="/stock" className="text-primary-foreground/70 hover:text-primary-foreground font-semibold pb-1 border-b-2 border-transparent hover-border-primary/50 transition-colors">
                <Archive className="inline-block mr-2"/>Estoque
            </Link>
            <Link href="/customers" className="text-primary-foreground/70 hover:text-primary-foreground font-semibold pb-1 border-b-2 border-transparent hover-border-primary/50 transition-colors">
                <Users className="inline-block mr-2"/>Clientes
            </Link>
            <Link href="/quotes" className="text-primary-foreground/70 hover:text-primary-foreground font-semibold pb-1 border-b-2 border-transparent hover:border-primary/50 transition-colors">
                <FileText className="inline-block mr-2"/>Orçamentos
            </Link>
            <Link href="/costs" className="text-primary-foreground/70 hover:text-primary-foreground font-semibold pb-1 border-b-2 border-transparent hover:border-primary/50 transition-colors">
                <Settings className="inline-block mr-2"/>Custos
            </Link>
        </nav>
      </div>
    </header>
  );
};

export default AppHeader;
