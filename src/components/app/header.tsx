import { Cake, BookHeart, Settings, LayoutDashboard, Users } from 'lucide-react';
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

        <nav className="mt-6 flex justify-center gap-4">
            <Link href="/" className="text-primary-foreground/90 hover:text-primary-foreground font-semibold pb-1 border-b-2 border-primary">
                Dashboard
            </Link>
            <Link href="/calculator" className="text-primary-foreground/70 hover:text-primary-foreground font-semibold pb-1 border-b-2 border-transparent hover:border-primary/50 transition-colors">
                Calculadora
            </Link>
            <Link href="/recipes" className="text-primary-foreground/70 hover:text-primary-foreground font-semibold pb-1 border-b-2 border-transparent hover:border-primary/50 transition-colors">
                Livro de Receitas
            </Link>
             <Link href="/stock" className="text-primary-foreground/70 hover:text-primary-foreground font-semibold pb-1 border-b-2 border-transparent hover:border-primary/50 transition-colors">
                Estoque
            </Link>
            <Link href="/customers" className="text-primary-foreground/70 hover:text-primary-foreground font-semibold pb-1 border-b-2 border-transparent hover:border-primary/50 transition-colors">
                Clientes
            </Link>
            <Link href="/costs" className="text-primary-foreground/70 hover:text-primary-foreground font-semibold pb-1 border-b-2 border-transparent hover:border-primary/50 transition-colors">
                Custos
            </Link>
        </nav>
      </div>
    </header>
  );
};

export default AppHeader;
