import { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NavBar from '@/components/NavBar';
import HomePage from '@/pages/HomePage';
import RecipesPage from '@/pages/RecipesPage';
import MenuPage from '@/pages/MenuPage';
import FavoritesPage from '@/pages/FavoritesPage';
import ProductsPage from '@/pages/ProductsPage';

export default function App() {
  const [activePage, setActivePage] = useState('home');

  const renderPage = () => {
    switch (activePage) {
      case 'home': return <HomePage onNavigate={setActivePage} />;
      case 'recipes': return <RecipesPage />;
      case 'menu': return <MenuPage />;
      case 'favorites': return <FavoritesPage />;
      case 'products': return <ProductsPage />;
      default: return <HomePage onNavigate={setActivePage} />;
    }
  };

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <div className="min-h-screen bg-background">
        <NavBar active={activePage} onChange={setActivePage} />
        <main className="lg:ml-64 min-h-screen">
          <div className="max-w-4xl mx-auto px-4 pt-6 lg:pt-8">
            {renderPage()}
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}