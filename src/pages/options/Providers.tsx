// External Dependencies
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Relative Dependencies
import { ThemeProvider } from '../panel/ThemeProvider';
import { Toaster } from '../panel/components/ui/sonner';
// import { TooltipProvider } from './components/ui/tooltip';

type ProvidersProps = {
  children: React.ReactNode;
};

export const Providers = ({ children, ...props }: ProvidersProps) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ThemeProvider {...props}>
      <QueryClientProvider client={queryClient}>
        <Toaster richColors position="top-center" duration={3000} />
        {children}
      </QueryClientProvider>
    </ThemeProvider>
  );
};
