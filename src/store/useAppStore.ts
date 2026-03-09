import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Recipe } from '@/data/recipes';

export interface MealPlan {
  id: string;
  date: string;
  meals: { recipe: Recipe; servings: number; mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' }[];
}

interface AppState {
  myIngredients: string[];
  favorites: string[];
  searchHistory: string[];
  mealPlan: MealPlan[];
  shoppingList: string[];
  calorieGoal: number;

  addIngredient: (ingredient: string) => void;
  removeIngredient: (ingredient: string) => void;
  clearIngredients: () => void;

  toggleFavorite: (recipeId: string) => void;

  addToHistory: (search: string) => void;
  clearHistory: () => void;

  addToMealPlan: (date: string, recipe: Recipe, servings: number, mealType: MealPlan['meals'][0]['mealType']) => void;
  removeFromMealPlan: (date: string, recipeId: string) => void;
  clearMealPlan: () => void;

  addToShoppingList: (items: string[]) => void;
  removeFromShoppingList: (item: string) => void;
  clearShoppingList: () => void;

  setCalorieGoal: (goal: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      myIngredients: [],
      favorites: [],
      searchHistory: [],
      mealPlan: [],
      shoppingList: [],
      calorieGoal: 2000,

      addIngredient: (ingredient) =>
        set((state) => ({
          myIngredients: state.myIngredients.includes(ingredient)
            ? state.myIngredients
            : [...state.myIngredients, ingredient],
        })),

      removeIngredient: (ingredient) =>
        set((state) => ({
          myIngredients: state.myIngredients.filter((i) => i !== ingredient),
        })),

      clearIngredients: () => set({ myIngredients: [] }),

      toggleFavorite: (recipeId) =>
        set((state) => ({
          favorites: state.favorites.includes(recipeId)
            ? state.favorites.filter((id) => id !== recipeId)
            : [...state.favorites, recipeId],
        })),

      addToHistory: (search) =>
        set((state) => ({
          searchHistory: [search, ...state.searchHistory.filter((s) => s !== search)].slice(0, 20),
        })),

      clearHistory: () => set({ searchHistory: [] }),

      addToMealPlan: (date, recipe, servings, mealType) =>
        set((state) => {
          const existing = state.mealPlan.find((p) => p.date === date);
          if (existing) {
            return {
              mealPlan: state.mealPlan.map((p) =>
                p.date === date
                  ? { ...p, meals: [...p.meals, { recipe, servings, mealType }] }
                  : p
              ),
            };
          }
          return {
            mealPlan: [...state.mealPlan, { id: date, date, meals: [{ recipe, servings, mealType }] }],
          };
        }),

      removeFromMealPlan: (date, recipeId) =>
        set((state) => ({
          mealPlan: state.mealPlan
            .map((p) =>
              p.date === date
                ? { ...p, meals: p.meals.filter((m) => m.recipe.id !== recipeId) }
                : p
            )
            .filter((p) => p.meals.length > 0),
        })),

      clearMealPlan: () => set({ mealPlan: [] }),

      addToShoppingList: (items) =>
        set((state) => ({
          shoppingList: [...new Set([...state.shoppingList, ...items])],
        })),

      removeFromShoppingList: (item) =>
        set((state) => ({
          shoppingList: state.shoppingList.filter((i) => i !== item),
        })),

      clearShoppingList: () => set({ shoppingList: [] }),

      setCalorieGoal: (goal) => set({ calorieGoal: goal }),
    }),
    { name: 'vkusno-doma-store' }
  )
);
