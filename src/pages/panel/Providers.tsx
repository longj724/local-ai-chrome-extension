// External Dependencies
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Relative Dependencies
import { ThemeProvider } from './ThemeProvider';

type ProvidersProps = {
  children: React.ReactNode;
};

export const Providers = ({ children, ...props }: ProvidersProps) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ThemeProvider {...props}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ThemeProvider>
  );
};
