import { Recipe, RECIPES } from '@/data/recipes';

export interface RecipeMatch {
  recipe: Recipe;
  matchCount: number;
  missingIngredients: string[];
  matchPercent: number;
  canCook: boolean;
}

export function matchRecipes(userIngredients: string[]): RecipeMatch[] {
  if (userIngredients.length === 0) return RECIPES.map((recipe) => ({
    recipe,
    matchCount: 0,
    missingIngredients: recipe.ingredients.map((i) => i.name),
    matchPercent: 0,
    canCook: false,
  }));

  const normalized = userIngredients.map((i) => i.toLowerCase().trim());

  return RECIPES.map((recipe) => {
    const essentialIngredients = recipe.ingredients.filter(
      (i) => !['соль', 'перец', 'сахар', 'лавровый лист'].includes(i.name)
    );

    const matched = essentialIngredients.filter((ing) =>
      normalized.some((u) => u.includes(ing.name.toLowerCase()) || ing.name.toLowerCase().includes(u))
    );

    const missing = essentialIngredients
      .filter((ing) => !normalized.some((u) => u.includes(ing.name.toLowerCase()) || ing.name.toLowerCase().includes(u)))
      .map((ing) => ing.name);

    const matchPercent = essentialIngredients.length > 0
      ? Math.round((matched.length / essentialIngredients.length) * 100)
      : 0;

    return {
      recipe,
      matchCount: matched.length,
      missingIngredients: missing,
      matchPercent,
      canCook: missing.length === 0,
    };
  }).sort((a, b) => b.matchPercent - a.matchPercent);
}

export function calcNutrition(recipe: Recipe, servings: number) {
  const factor = servings / recipe.servings;
  return {
    calories: Math.round(recipe.calories * factor),
    protein: Math.round(recipe.protein * factor * 10) / 10,
    fat: Math.round(recipe.fat * factor * 10) / 10,
    carbs: Math.round(recipe.carbs * factor * 10) / 10,
  };
}

export function buildShoppingList(missingByRecipe: { recipe: Recipe; missing: string[] }[]): string[] {
  const all: string[] = [];
  missingByRecipe.forEach(({ missing }) => all.push(...missing));
  return [...new Set(all)];
}

export function generateWeekMenu(ingredients: string[]): Record<string, { breakfast?: RecipeMatch; lunch?: RecipeMatch; dinner?: RecipeMatch }> {
  const matches = matchRecipes(ingredients);
  const breakfasts = matches.filter((m) => ['breakfast'].includes(m.recipe.category));
  const lunches = matches.filter((m) => ['lunch', 'soup'].includes(m.recipe.category));
  const dinners = matches.filter((m) => ['dinner'].includes(m.recipe.category));
  const salads = matches.filter((m) => ['salad'].includes(m.recipe.category));

  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const menu: Record<string, { breakfast?: RecipeMatch; lunch?: RecipeMatch; dinner?: RecipeMatch }> = {};

  days.forEach((day, i) => {
    menu[day] = {
      breakfast: breakfasts[i % breakfasts.length],
      lunch: (i % 2 === 0 ? lunches : salads)[Math.floor(i / 2) % Math.max(lunches.length, salads.length, 1)],
      dinner: dinners[i % Math.max(dinners.length, 1)],
    };
  });

  return menu;
}

export function filterRecipes(
  matches: RecipeMatch[],
  filters: {
    category?: string;
    difficulty?: string;
    maxTime?: number;
    maxCalories?: number;
    diet?: string[];
    onlyCanCook?: boolean;
    searchQuery?: string;
  }
): RecipeMatch[] {
  return matches.filter(({ recipe }) => {
    if (filters.onlyCanCook !== undefined) {
      const match = matches.find((m) => m.recipe.id === recipe.id);
      if (filters.onlyCanCook && match && !match.canCook) return false;
    }
    if (filters.category && filters.category !== 'all' && recipe.category !== filters.category) return false;
    if (filters.difficulty && filters.difficulty !== 'all' && recipe.difficulty !== filters.difficulty) return false;
    if (filters.maxTime && recipe.time > filters.maxTime) return false;
    if (filters.maxCalories && recipe.calories > filters.maxCalories) return false;
    if (filters.diet && filters.diet.length > 0) {
      const hasAll = filters.diet.every((d) => recipe.diet.includes(d));
      if (!hasAll) return false;
    }
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      if (!recipe.name.toLowerCase().includes(q) && !recipe.tags.some((t) => t.includes(q))) return false;
    }
    return true;
  });
}
