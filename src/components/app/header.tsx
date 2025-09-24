import { Cake } from 'lucide-react';
import Image from 'next/image';
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
        <p className="mt-2 text-lg text-primary-foreground/80">
          Precificação fácil para suas doces criações
        </p>
      </div>
    </header>
  );
};

export default AppHeader;
