import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProductTable } from '@/components/ProductTable';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4">
          <ProductTable />
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;
