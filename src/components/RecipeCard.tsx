import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Recipe, CATEGORY_LABELS, DIFFICULTY_LABELS } from '@/data/recipes';
import { useAppStore } from '@/store/useAppStore';
import RecipeModal from './RecipeModal';

interface RecipeCardProps {
  recipe: Recipe;
  matchPercent?: number;
  missingIngredients?: string[];
  canCook?: boolean;
  animationDelay?: number;
}

export default function RecipeCard({
  recipe,
  matchPercent = 0,
  missingIngredients = [],
  canCook = false,
  animationDelay = 0,
}: RecipeCardProps) {
  const [open, setOpen] = useState(false);
  const { favorites, toggleFavorite } = useAppStore();
  const isFav = favorites.includes(recipe.id);

  const getBadgeColor = () => {
    if (canCook) return 'gradient-green text-white';
    if (matchPercent >= 60) return 'bg-amber-100 text-amber-700';
    return 'bg-muted text-muted-foreground';
  };

  const getDifficultyColor = () => {
    if (recipe.difficulty === 'easy') return 'text-green-600 bg-green-50';
    if (recipe.difficulty === 'medium') return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <>
      <div
        className="bg-white rounded-3xl overflow-hidden shadow-sm card-hover cursor-pointer border border-border/50 animate-fade-in"
        style={{ animationDelay: `${animationDelay}ms` }}
        onClick={() => setOpen(true)}
      >
        {/* Card Header */}
        <div className="relative h-36 flex items-center justify-center gradient-warm overflow-hidden">
          <span className="text-7xl select-none" style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))' }}>
            {recipe.emoji}
          </span>

          {/* Match badge */}
          {matchPercent > 0 && (
            <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold ${getBadgeColor()}`}>
              {canCook ? '✓ Готово!' : `${matchPercent}% есть`}
            </div>
          )}

          {/* Favorite */}
          <button
            className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 btn-bounce ${
              isFav ? 'bg-red-100 text-red-500' : 'bg-white/80 text-muted-foreground'
            }`}
            onClick={(e) => { e.stopPropagation(); toggleFavorite(recipe.id); }}
          >
            <Icon name={isFav ? 'Heart' : 'Heart'} size={16} className={isFav ? 'fill-current' : ''} />
          </button>
        </div>

        {/* Card Body */}
        <div className="p-4">
          <h3 className="font-bold text-base text-foreground mb-1 leading-tight">{recipe.name}</h3>
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{recipe.description}</p>

          {/* Meta row */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Icon name="Clock" size={12} />
              {recipe.time} мин
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getDifficultyColor()}`}>
              {DIFFICULTY_LABELS[recipe.difficulty]}
            </span>
            <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
              {CATEGORY_LABELS[recipe.category]}
            </span>
          </div>

          {/* Nutrition strip */}
          <div className="flex items-center gap-3 py-2 px-3 bg-muted/60 rounded-2xl">
            <div className="flex flex-col items-center">
              <span className="text-sm font-black macro-cal">{recipe.calories}</span>
              <span className="text-[10px] text-muted-foreground">ккал</span>
            </div>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs font-semibold macro-protein">Б {recipe.protein}г</span>
              <span className="text-xs font-semibold macro-fat">Ж {recipe.fat}г</span>
              <span className="text-xs font-semibold macro-carbs">У {recipe.carbs}г</span>
            </div>
          </div>

          {/* Missing ingredients */}
          {missingIngredients.length > 0 && (
            <div className="mt-3 flex items-start gap-2">
              <Icon name="ShoppingCart" size={14} className="text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                Купить: <span className="text-foreground font-medium">{missingIngredients.slice(0, 3).join(', ')}{missingIngredients.length > 3 ? ` +${missingIngredients.length - 3}` : ''}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      <RecipeModal recipe={recipe} open={open} onClose={() => setOpen(false)} missingIngredients={missingIngredients} />
    </>
  );
}
