import { useState, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { matchRecipes, calcNutrition, generateWeekMenu } from '@/lib/recipeUtils';
import RecipeCard from '@/components/RecipeCard';
import MacroBadge from '@/components/MacroBadge';
import Icon from '@/components/ui/icon';

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const MEAL_LABELS = { breakfast: '🍳 Завтрак', lunch: '🥘 Обед', dinner: '🍗 Ужин', snack: '🍎 Перекус' };

type MenuMode = 'today' | 'week';

export default function MenuPage() {
  const [mode, setMode] = useState<MenuMode>('today');
  const [activeDay, setActiveDay] = useState(DAYS[0]);
  const { mealPlan, myIngredients, removeFromMealPlan, clearMealPlan, addToShoppingList } = useAppStore();

  const weekMenu = useMemo(() => generateWeekMenu(myIngredients), [myIngredients]);

  const today = new Date().toISOString().split('T')[0];
  const todayPlan = mealPlan.find((p) => p.date === today);

  const todayNutrition = todayPlan
    ? todayPlan.meals.reduce(
        (acc, { recipe, servings }) => {
          const n = calcNutrition(recipe, servings);
          return {
            calories: acc.calories + n.calories,
            protein: acc.protein + n.protein,
            fat: acc.fat + n.fat,
            carbs: acc.carbs + n.carbs,
          };
        },
        { calories: 0, protein: 0, fat: 0, carbs: 0 }
      )
    : { calories: 0, protein: 0, fat: 0, carbs: 0 };

  // Collect all missing for week menu
  const allMatches = useMemo(() => matchRecipes(myIngredients), [myIngredients]);
  const weekShoppingList = useMemo(() => {
    const missing: string[] = [];
    Object.values(weekMenu).forEach((day) => {
      [day.breakfast, day.lunch, day.dinner].forEach((m) => {
        if (m) missing.push(...m.missingIngredients);
      });
    });
    return [...new Set(missing)];
  }, [weekMenu]);

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-foreground mb-1">Меню</h1>
        <p className="text-muted-foreground text-sm">Составьте рацион питания на день или неделю</p>
      </div>

      {/* Mode toggle */}
      <div className="flex bg-muted rounded-2xl p-1">
        {(['today', 'week'] as MenuMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all btn-bounce ${
              mode === m ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
          >
            {m === 'today' ? '📅 Сегодня' : '📆 Неделя'}
          </button>
        ))}
      </div>

      {/* Today mode */}
      {mode === 'today' && (
        <div className="space-y-5 animate-fade-in">
          {/* Nutrition summary */}
          {todayPlan && todayPlan.meals.length > 0 && (
            <div className="bg-white rounded-3xl p-5 border border-border/50 shadow-sm">
              <h2 className="font-bold text-foreground mb-4">Итого на сегодня</h2>
              <MacroBadge {...todayNutrition} size="lg" />
            </div>
          )}

          {/* Meals */}
          {todayPlan && todayPlan.meals.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-foreground">Блюда дня</h2>
                <button
                  onClick={clearMealPlan}
                  className="text-xs text-muted-foreground flex items-center gap-1 hover:text-destructive transition-colors"
                >
                  <Icon name="Trash2" size={12} /> Очистить
                </button>
              </div>
              {todayPlan.meals.map(({ recipe, servings, mealType }) => (
                <div
                  key={recipe.id}
                  className="bg-white rounded-2xl p-4 flex items-center gap-4 border border-border/50 shadow-sm animate-fade-in"
                >
                  <span className="text-4xl shrink-0">{recipe.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground truncate">{recipe.name}</p>
                    <p className="text-xs text-primary font-medium">{MEAL_LABELS[mealType]}</p>
                    <MacroBadge
                      {...calcNutrition(recipe, servings)}
                      size="sm"
                    />
                  </div>
                  <button
                    onClick={() => removeFromMealPlan(today, recipe.id)}
                    className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 btn-bounce text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Icon name="X" size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 animate-fade-in">
              <p className="text-6xl mb-4">📋</p>
              <h3 className="text-xl font-black text-foreground mb-2">Меню пока пусто</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Откройте любой рецепт и нажмите «Добавить в меню»
              </p>
            </div>
          )}
        </div>
      )}

      {/* Week mode */}
      {mode === 'week' && (
        <div className="space-y-5 animate-fade-in">
          {/* Generate button */}
          <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-3xl p-5 border border-orange-100">
            <h3 className="font-black text-foreground text-lg mb-1">Меню на неделю</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {myIngredients.length > 0
                ? `Составлено на основе ${myIngredients.length} ваших продуктов`
                : 'Добавьте продукты для персонального меню'}
            </p>
            {weekShoppingList.length > 0 && (
              <button
                onClick={() => addToShoppingList(weekShoppingList)}
                className="flex items-center gap-2 gradient-orange text-white px-5 py-3 rounded-2xl font-bold text-sm btn-bounce shadow-md"
              >
                <Icon name="ShoppingCart" size={16} />
                Добавить в список покупок ({weekShoppingList.length} продуктов)
              </button>
            )}
          </div>

          {/* Day selector */}
          <div className="flex gap-2 overflow-x-auto pb-1 custom-scroll -mx-1 px-1">
            {DAYS.map((day) => (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all btn-bounce shrink-0 ${
                  activeDay === day ? 'gradient-orange text-white shadow-md' : 'bg-white border border-border/50 text-foreground'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Day menu */}
          {(['breakfast', 'lunch', 'dinner'] as const).map((mealType) => {
            const match = weekMenu[activeDay]?.[mealType];
            return (
              <div key={mealType}>
                <p className="text-sm font-bold text-muted-foreground mb-2">
                  {MEAL_LABELS[mealType]}
                </p>
                {match ? (
                  <RecipeCard
                    recipe={match.recipe}
                    matchPercent={match.matchPercent}
                    missingIngredients={match.missingIngredients}
                    canCook={match.canCook}
                  />
                ) : (
                  <div className="bg-muted rounded-2xl p-4 text-center text-muted-foreground text-sm">
                    Нет подходящего блюда
                  </div>
                )}
              </div>
            );
          })}

          {/* Week shopping list */}
          {weekShoppingList.length > 0 && (
            <div className="bg-white rounded-3xl p-5 border border-border/50 shadow-sm">
              <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                <Icon name="ShoppingCart" size={18} className="text-primary" />
                Нужно докупить
              </h3>
              <div className="flex flex-wrap gap-2">
                {weekShoppingList.map((item) => (
                  <span key={item} className="bg-orange-50 text-orange-700 text-sm font-medium px-3 py-1.5 rounded-full capitalize">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
