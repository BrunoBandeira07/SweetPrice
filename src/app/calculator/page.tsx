
import { Suspense } from 'react';
import CalculatorClientPage from './calculator-client-page';
import { Skeleton } from '@/components/ui/skeleton';

// This is a wrapper component to provide a Suspense boundary
export default function CalculatorPage() {
  return (
    <Suspense fallback={<Skeleton className="h-[80vh] w-full" />}>
      <CalculatorClientPage />
    </Suspense>
  );
}
