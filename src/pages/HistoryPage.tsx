import { useAppStore } from '@/store/useAppStore';
import { RECIPES } from '@/data/recipes';
import RecipeCard from '@/components/RecipeCard';
import Icon from '@/components/ui/icon';

export default function HistoryPage() {
  const { searchHistory, clearHistory, mealPlan } = useAppStore();

  const allMeals = mealPlan.flatMap((p) =>
    p.meals.map((m) => ({ ...m, date: p.date }))
  ).reverse();

  const uniqueRecipeIds = [...new Set(allMeals.map((m) => m.recipe.id))];
  const recentRecipes = uniqueRecipeIds.map((id) => RECIPES.find((r) => r.id === id)).filter(Boolean);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Сегодня';
    if (date.toDateString() === yesterday.toDateString()) return 'Вчера';
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  };

  const groupedByDate = mealPlan.reduce<Record<string, typeof allMeals>>((acc, plan) => {
    const dateLabel = formatDate(plan.date);
    acc[dateLabel] = plan.meals.map((m) => ({ ...m, date: plan.date }));
    return acc;
  }, {});

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-foreground mb-1">История</h1>
        <p className="text-muted-foreground text-sm">Ваши поиски и добавленные блюда</p>
      </div>

      {/* Search History */}
      {searchHistory.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-foreground flex items-center gap-2">
              <Icon name="Search" size={18} className="text-muted-foreground" />
              История поиска
            </h2>
            <button
              onClick={clearHistory}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
            >
              <Icon name="Trash2" size={12} />
              Очистить
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {searchHistory.map((query) => (
              <span
                key={query}
                className="bg-white border border-border/50 text-foreground text-sm font-medium px-3 py-2 rounded-2xl shadow-sm flex items-center gap-2"
              >
                <Icon name="Clock" size={12} className="text-muted-foreground" />
                {query}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Meal history by date */}
      {Object.keys(groupedByDate).length > 0 ? (
        <section className="space-y-6">
          <h2 className="font-bold text-foreground flex items-center gap-2">
            <Icon name="CalendarDays" size={18} className="text-muted-foreground" />
            Меню по дням
          </h2>
          {Object.entries(groupedByDate).map(([dateLabel, meals]) => (
            <div key={dateLabel}>
              <p className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wide">{dateLabel}</p>
              <div className="space-y-2">
                {meals.map(({ recipe, servings }) => (
                  <div
                    key={recipe.id}
                    className="bg-white rounded-2xl p-4 flex items-center gap-4 border border-border/50 shadow-sm"
                  >
                    <span className="text-3xl">{recipe.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground truncate">{recipe.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {servings} порц. · {Math.round(recipe.calories * servings / recipe.servings)} ккал
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black macro-protein">{Math.round(recipe.protein * servings / recipe.servings)}г</p>
                      <p className="text-xs text-muted-foreground">белок</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      ) : (
        <div>
          {/* Recently viewed recipes */}
          {recentRecipes.length > 0 && (
            <section>
              <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <Icon name="Clock" size={18} className="text-muted-foreground" />
                Недавно добавленные блюда
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recentRecipes.slice(0, 6).map((recipe, i) => recipe && (
                  <RecipeCard key={recipe.id} recipe={recipe} animationDelay={i * 60} />
                ))}
              </div>
            </section>
          )}

          {recentRecipes.length === 0 && searchHistory.length === 0 && (
            <div className="text-center py-16 animate-fade-in">
              <p className="text-6xl mb-4">📖</p>
              <h3 className="text-xl font-black text-foreground mb-2">История пока пуста</h3>
              <p className="text-muted-foreground text-sm">
                Ищите рецепты и добавляйте их в меню — всё сохранится здесь
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
