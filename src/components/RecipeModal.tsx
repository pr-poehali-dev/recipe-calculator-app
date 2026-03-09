import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Recipe, CATEGORY_LABELS, DIFFICULTY_LABELS } from '@/data/recipes';
import { calcNutrition } from '@/lib/recipeUtils';
import { useAppStore } from '@/store/useAppStore';
import MacroBadge from './MacroBadge';
import Icon from '@/components/ui/icon';

interface RecipeModalProps {
  recipe: Recipe;
  open: boolean;
  onClose: () => void;
  missingIngredients?: string[];
}

export default function RecipeModal({ recipe, open, onClose, missingIngredients = [] }: RecipeModalProps) {
  const [servings, setServings] = useState(recipe.servings);
  const [addedToMenu, setAddedToMenu] = useState(false);
  const { favorites, toggleFavorite, addToMealPlan, addToShoppingList } = useAppStore();
  const isFav = favorites.includes(recipe.id);

  const nutrition = calcNutrition(recipe, servings);
  const factor = servings / recipe.servings;

  const handleAddToMenu = () => {
    const today = new Date().toISOString().split('T')[0];
    addToMealPlan(today, recipe, servings, recipe.category === 'breakfast' ? 'breakfast' : recipe.category === 'dinner' ? 'dinner' : 'lunch');
    setAddedToMenu(true);
    setTimeout(() => setAddedToMenu(false), 2000);
  };

  const handleAddToShopping = () => {
    addToShoppingList(missingIngredients);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full max-h-[90vh] overflow-y-auto p-0 rounded-3xl border-0 shadow-2xl custom-scroll">
        <DialogTitle className="sr-only">{recipe.name}</DialogTitle>
        <DialogDescription className="sr-only">{recipe.description}</DialogDescription>
        {/* Header */}
        <div className="relative h-48 gradient-warm flex items-center justify-center sticky top-0 z-10 rounded-t-3xl">
          <span className="text-9xl select-none" style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.12))' }}>
            {recipe.emoji}
          </span>
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={() => toggleFavorite(recipe.id)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all btn-bounce ${isFav ? 'bg-red-100 text-red-500' : 'bg-white/80 text-muted-foreground'}`}
            >
              <Icon name="Heart" size={18} className={isFav ? 'fill-current' : ''} />
            </button>
          </div>
          <div className="absolute bottom-4 left-4 flex gap-2 flex-wrap">
            <span className="bg-white/90 text-foreground text-xs font-semibold px-3 py-1.5 rounded-full">
              {CATEGORY_LABELS[recipe.category]}
            </span>
            <span className="bg-white/90 text-foreground text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
              <Icon name="Clock" size={12} /> {recipe.time} мин
            </span>
            <span className="bg-white/90 text-foreground text-xs font-semibold px-3 py-1.5 rounded-full">
              {DIFFICULTY_LABELS[recipe.difficulty]}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <h2 className="text-2xl font-black text-foreground mb-2">{recipe.name}</h2>
            <p className="text-muted-foreground">{recipe.description}</p>
          </div>

          {/* Servings */}
          <div className="flex items-center justify-between bg-muted/60 rounded-2xl p-4">
            <span className="font-semibold text-foreground">Порции</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setServings(Math.max(1, servings - 1))}
                className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center font-bold text-lg btn-bounce text-foreground"
              >
                −
              </button>
              <span className="text-xl font-black text-foreground w-8 text-center">{servings}</span>
              <button
                onClick={() => setServings(servings + 1)}
                className="w-9 h-9 rounded-full gradient-orange text-white shadow-sm flex items-center justify-center font-bold text-lg btn-bounce"
              >
                +
              </button>
            </div>
          </div>

          {/* Nutrition */}
          <div>
            <h3 className="font-bold text-foreground mb-3">Пищевая ценность на {servings} порц.</h3>
            <MacroBadge {...nutrition} size="lg" />
          </div>

          {/* Ingredients */}
          <div>
            <h3 className="font-bold text-foreground mb-3">Ингредиенты</h3>
            <div className="space-y-2">
              {recipe.ingredients.map((ing) => {
                const isMissing = missingIngredients.includes(ing.name);
                return (
                  <div
                    key={ing.name}
                    className={`flex items-center justify-between p-3 rounded-xl ${isMissing ? 'bg-red-50 border border-red-100' : 'bg-muted/60'}`}
                  >
                    <div className="flex items-center gap-2">
                      {isMissing && <Icon name="ShoppingCart" size={14} className="text-red-400" />}
                      <span className={`font-medium capitalize ${isMissing ? 'text-red-600' : 'text-foreground'}`}>
                        {ing.name}
                      </span>
                    </div>
                    <span className="text-muted-foreground text-sm">
                      {ing.unit === 'по вкусу' ? 'по вкусу' : `${Math.round(ing.amount * factor * 10) / 10} ${ing.unit}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Steps */}
          <div>
            <h3 className="font-bold text-foreground mb-3">Приготовление</h3>
            <div className="space-y-3">
              {recipe.steps.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full gradient-orange text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-foreground leading-relaxed pt-1">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pb-2">
            <button
              onClick={handleAddToMenu}
              className={`flex-1 py-3.5 rounded-2xl font-bold text-white transition-all btn-bounce text-sm ${addedToMenu ? 'gradient-green' : 'gradient-orange'}`}
            >
              {addedToMenu ? '✓ Добавлено в меню!' : 'Добавить в меню'}
            </button>
            {missingIngredients.length > 0 && (
              <button
                onClick={handleAddToShopping}
                className="flex-1 py-3.5 rounded-2xl font-bold bg-muted text-foreground transition-all btn-bounce text-sm flex items-center justify-center gap-2"
              >
                <Icon name="ShoppingCart" size={16} />
                В список покупок
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}