// External Dependencies
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Relative Dependencies
import { ThemeProvider } from './ThemeProvider';
import { TooltipProvider } from './components/ui/tooltip';

type ProvidersProps = {
  children: React.ReactNode;
};

export const Providers = ({ children, ...props }: ProvidersProps) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ThemeProvider {...props}>
      <TooltipProvider>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
};
