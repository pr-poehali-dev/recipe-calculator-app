import { useMemo } from 'react';
import { matchRecipes } from '@/lib/recipeUtils';
import { useAppStore } from '@/store/useAppStore';
import IngredientInput from '@/components/IngredientInput';
import RecipeCard from '@/components/RecipeCard';
import CalorieCounter from '@/components/CalorieCounter';
import Icon from '@/components/ui/icon';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const { myIngredients, mealPlan } = useAppStore();
  const matches = useMemo(() => matchRecipes(myIngredients), [myIngredients]);

  const canCookNow = matches.filter((m) => m.canCook);
  const almostReady = matches.filter((m) => !m.canCook && m.matchPercent >= 50).slice(0, 4);
  const topRecipes = matches.slice(0, 6);

  const today = new Date().toISOString().split('T')[0];
  const todayMeals = mealPlan.find((p) => p.date === today)?.meals || [];

  return (
    <div className="space-y-8 pb-24 lg:pb-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl gradient-hero p-6 text-white min-h-[200px] flex flex-col justify-end noise-bg">
        <div className="absolute top-0 right-0 text-[120px] leading-none opacity-20 select-none pointer-events-none -mt-4 -mr-4">
          🍳
        </div>
        <div className="relative z-10">
          <p className="text-white/80 text-sm font-medium mb-1">Привет! 👋</p>
          <h1 className="text-3xl font-black mb-2 leading-tight">
            Что приготовим<br />сегодня?
          </h1>
          <p className="text-white/80 text-sm">
            {myIngredients.length > 0
              ? `У вас ${myIngredients.length} продуктов → ${canCookNow.length} блюд прямо сейчас`
              : 'Введите продукты и найдём рецепты!'}
          </p>
        </div>
      </div>

      {/* Ingredient Input */}
      <div>
        <h2 className="text-xl font-black text-foreground mb-3">🛒 Что есть дома?</h2>
        <IngredientInput />
      </div>

      {/* Calorie Counter */}
      <CalorieCounter />

      {/* Quick stats */}
      {myIngredients.length > 0 && (
        <div className="grid grid-cols-3 gap-3 animate-fade-in">
          {[
            { label: 'Можно сейчас', value: canCookNow.length, emoji: '✅', color: 'bg-green-50 text-green-700', onClick: () => onNavigate('recipes') },
            { label: 'Почти готово', value: almostReady.length, emoji: '🛒', color: 'bg-amber-50 text-amber-700', onClick: () => onNavigate('recipes') },
            { label: 'В меню сегодня', value: todayMeals.length, emoji: '📋', color: 'bg-blue-50 text-blue-700', onClick: () => onNavigate('menu') },
          ].map(({ label, value, emoji, color, onClick }) => (
            <button key={label} onClick={onClick} className={`${color} rounded-2xl p-4 text-center card-hover btn-bounce`}>
              <p className="text-3xl mb-1">{emoji}</p>
              <p className="text-2xl font-black">{value}</p>
              <p className="text-xs font-medium leading-tight">{label}</p>
            </button>
          ))}
        </div>
      )}

      {/* Can cook now */}
      {canCookNow.length > 0 && (
        <section className="animate-fade-in stagger-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-foreground flex items-center gap-2">
              <span className="w-7 h-7 gradient-green rounded-lg flex items-center justify-center text-white text-xs">✓</span>
              Готово прямо сейчас
            </h2>
            <button onClick={() => onNavigate('recipes')} className="text-primary text-sm font-semibold">Все →</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {canCookNow.slice(0, 4).map((m, i) => (
              <RecipeCard
                key={m.recipe.id}
                recipe={m.recipe}
                matchPercent={100}
                canCook
                animationDelay={i * 60}
              />
            ))}
          </div>
        </section>
      )}

      {/* Almost ready */}
      {almostReady.length > 0 && (
        <section className="animate-fade-in stagger-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-foreground flex items-center gap-2">
              <span className="w-7 h-7 bg-amber-400 rounded-lg flex items-center justify-center text-white text-xs">🛒</span>
              Почти готово
            </h2>
            <button onClick={() => onNavigate('recipes')} className="text-primary text-sm font-semibold">Все →</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {almostReady.map((m, i) => (
              <RecipeCard
                key={m.recipe.id}
                recipe={m.recipe}
                matchPercent={m.matchPercent}
                missingIngredients={m.missingIngredients}
                animationDelay={i * 60}
              />
            ))}
          </div>
        </section>
      )}

      {/* Top picks if no ingredients */}
      {myIngredients.length === 0 && (
        <section className="animate-fade-in">
          <h2 className="text-xl font-black text-foreground mb-4">🌟 Популярные рецепты</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {topRecipes.map((m, i) => (
              <RecipeCard key={m.recipe.id} recipe={m.recipe} animationDelay={i * 60} />
            ))}
          </div>
        </section>
      )}

      {/* Today's menu preview */}
      {todayMeals.length > 0 && (
        <section className="animate-fade-in">
          <h2 className="text-xl font-black text-foreground mb-4">📋 Меню на сегодня</h2>
          <div className="bg-white rounded-3xl p-4 space-y-3 border border-border/50 shadow-sm">
            {todayMeals.map(({ recipe, servings }) => (
              <div key={recipe.id} className="flex items-center gap-3">
                <span className="text-3xl">{recipe.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{recipe.name}</p>
                  <p className="text-xs text-muted-foreground">{servings} порц. · {Math.round(recipe.calories * servings / recipe.servings)} ккал</p>
                </div>
              </div>
            ))}
            <button
              onClick={() => onNavigate('menu')}
              className="w-full py-2.5 rounded-2xl bg-muted text-foreground font-semibold text-sm btn-bounce mt-2"
            >
              Открыть полное меню →
            </button>
          </div>
        </section>
      )}

      {/* CTA */}
      {myIngredients.length === 0 && (
        <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-3xl p-6 border border-orange-100 animate-fade-in">
          <p className="text-2xl mb-3">💡</p>
          <h3 className="font-black text-foreground text-lg mb-2">Начните прямо сейчас!</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Введите 3–5 продуктов, которые есть у вас дома, и мы подберём рецепты и посчитаем калории.
          </p>
          <div className="flex flex-wrap gap-2">
            {['курица', 'яйца', 'картофель', 'гречка', 'морковь'].map((item) => (
              <button
                key={item}
                onClick={() => useAppStore.getState().addIngredient(item)}
                className="bg-white text-foreground text-sm font-medium px-3 py-1.5 rounded-full border border-border shadow-sm btn-bounce capitalize"
              >
                + {item}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
