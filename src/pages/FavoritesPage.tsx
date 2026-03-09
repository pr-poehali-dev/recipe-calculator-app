import { useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { RECIPES } from '@/data/recipes';
import { matchRecipes } from '@/lib/recipeUtils';
import RecipeCard from '@/components/RecipeCard';

export default function FavoritesPage() {
  const { favorites, myIngredients } = useAppStore();
  const allMatches = useMemo(() => matchRecipes(myIngredients), [myIngredients]);

  const favoriteRecipes = favorites
    .map((id) => {
      const recipe = RECIPES.find((r) => r.id === id);
      const match = allMatches.find((m) => m.recipe.id === id);
      return recipe ? { recipe, match } : null;
    })
    .filter(Boolean) as { recipe: (typeof RECIPES)[0]; match: (typeof allMatches)[0] | undefined }[];

  if (favoriteRecipes.length === 0) {
    return (
      <div className="pb-24 lg:pb-8">
        <h1 className="text-3xl font-black text-foreground mb-1">Избранное</h1>
        <p className="text-muted-foreground text-sm mb-12">Рецепты, которые вы сохранили</p>
        <div className="text-center py-12 animate-fade-in">
          <p className="text-7xl mb-4">❤️</p>
          <h3 className="text-xl font-black text-foreground mb-2">Избранное пусто</h3>
          <p className="text-muted-foreground text-sm">
            Нажмите ❤️ на любом рецепте, чтобы сохранить его сюда
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      <div>
        <h1 className="text-3xl font-black text-foreground mb-1">Избранное</h1>
        <p className="text-muted-foreground text-sm">{favoriteRecipes.length} сохранённых рецептов</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {favoriteRecipes.map(({ recipe, match }, i) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            matchPercent={match?.matchPercent ?? 0}
            missingIngredients={match?.missingIngredients ?? []}
            canCook={match?.canCook ?? false}
            animationDelay={i * 60}
          />
        ))}
      </div>
    </div>
  );
}
