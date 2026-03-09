import { useState, useMemo } from 'react';
import { matchRecipes, filterRecipes } from '@/lib/recipeUtils';
import { useAppStore } from '@/store/useAppStore';
import { CATEGORY_LABELS, DIET_FILTERS } from '@/data/recipes';
import RecipeCard from '@/components/RecipeCard';
import Icon from '@/components/ui/icon';

const CATEGORIES = [
  { id: 'all', label: 'Все', emoji: '🍽️' },
  { id: 'breakfast', label: 'Завтрак', emoji: '🍳' },
  { id: 'lunch', label: 'Обед', emoji: '🥘' },
  { id: 'dinner', label: 'Ужин', emoji: '🍗' },
  { id: 'soup', label: 'Суп', emoji: '🍲' },
  { id: 'salad', label: 'Салат', emoji: '🥗' },
];

const DIFFICULTIES = [
  { id: 'all', label: 'Любая' },
  { id: 'easy', label: 'Лёгко' },
  { id: 'medium', label: 'Средне' },
  { id: 'hard', label: 'Сложно' },
];

const MAX_TIMES = [
  { label: 'Любое', value: undefined },
  { label: '≤15 мин', value: 15 },
  { label: '≤30 мин', value: 30 },
  { label: '≤60 мин', value: 60 },
];

export default function RecipesPage() {
  const { myIngredients, addToHistory } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [maxTime, setMaxTime] = useState<number | undefined>(undefined);
  const [maxCalories, setMaxCalories] = useState<number | undefined>(undefined);
  const [selectedDiets, setSelectedDiets] = useState<string[]>([]);
  const [onlyCanCook, setOnlyCanCook] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'match' | 'calories' | 'time'>('match');

  const allMatches = useMemo(() => matchRecipes(myIngredients), [myIngredients]);

  const filtered = useMemo(() => {
    let result = filterRecipes(allMatches, {
      category,
      difficulty,
      maxTime,
      maxCalories,
      diet: selectedDiets,
      searchQuery,
    });

    if (onlyCanCook) result = result.filter((m) => m.canCook);

    if (sortBy === 'calories') result = [...result].sort((a, b) => a.recipe.calories - b.recipe.calories);
    if (sortBy === 'time') result = [...result].sort((a, b) => a.recipe.time - b.recipe.time);

    return result;
  }, [allMatches, category, difficulty, maxTime, maxCalories, selectedDiets, onlyCanCook, searchQuery, sortBy]);

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (q.length > 2) addToHistory(q);
  };

  const toggleDiet = (diet: string) => {
    setSelectedDiets((prev) => prev.includes(diet) ? prev.filter((d) => d !== diet) : [...prev, diet]);
  };

  const activeFiltersCount = [
    category !== 'all', difficulty !== 'all', maxTime !== undefined,
    maxCalories !== undefined, selectedDiets.length > 0, onlyCanCook,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-foreground mb-1">Рецепты</h1>
        <p className="text-muted-foreground text-sm">
          {filtered.length} {filtered.length === 1 ? 'рецепт' : filtered.length < 5 ? 'рецепта' : 'рецептов'}
          {myIngredients.length > 0 && ` · ${myIngredients.length} продуктов в наличии`}
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm border border-border/50">
          <Icon name="Search" size={20} className="text-muted-foreground shrink-0" />
          <input
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Найти рецепт..."
            className="flex-1 bg-transparent outline-none text-foreground font-golos placeholder:text-muted-foreground"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-muted-foreground">
              <Icon name="X" size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 custom-scroll -mx-1 px-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl whitespace-nowrap font-semibold text-sm transition-all btn-bounce shrink-0 ${
              category === cat.id
                ? 'gradient-orange text-white shadow-md shadow-orange-200'
                : 'bg-white text-muted-foreground border border-border/50'
            }`}
          >
            <span>{cat.emoji}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex gap-2 items-center flex-wrap">
        {myIngredients.length > 0 && (
          <button
            onClick={() => setOnlyCanCook(!onlyCanCook)}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold transition-all btn-bounce ${
              onlyCanCook ? 'gradient-green text-white' : 'bg-white border border-border/50 text-foreground'
            }`}
          >
            <Icon name="CheckCircle" size={16} />
            Только доступные
          </button>
        )}

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold transition-all btn-bounce ${
            activeFiltersCount > 0
              ? 'bg-primary text-white'
              : 'bg-white border border-border/50 text-foreground'
          }`}
        >
          <Icon name="SlidersHorizontal" size={16} />
          Фильтры
          {activeFiltersCount > 0 && (
            <span className="bg-white/30 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-black">
              {activeFiltersCount}
            </span>
          )}
        </button>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Сортировка:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'match' | 'calories' | 'time')}
            className="bg-white border border-border/50 rounded-xl px-3 py-1.5 text-sm font-medium text-foreground outline-none"
          >
            <option value="match">По совпадению</option>
            <option value="calories">По калориям</option>
            <option value="time">По времени</option>
          </select>
        </div>
      </div>

      {/* Extended filters */}
      {showFilters && (
        <div className="bg-white rounded-3xl p-5 border border-border/50 shadow-sm space-y-5 animate-fade-in">
          {/* Difficulty */}
          <div>
            <p className="text-sm font-bold text-foreground mb-2">Сложность</p>
            <div className="flex gap-2 flex-wrap">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDifficulty(d.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all btn-bounce ${
                    difficulty === d.id ? 'gradient-orange text-white' : 'bg-muted text-foreground'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Max time */}
          <div>
            <p className="text-sm font-bold text-foreground mb-2">Время приготовления</p>
            <div className="flex gap-2 flex-wrap">
              {MAX_TIMES.map((t) => (
                <button
                  key={t.label}
                  onClick={() => setMaxTime(t.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all btn-bounce ${
                    maxTime === t.value ? 'gradient-orange text-white' : 'bg-muted text-foreground'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Diet */}
          <div>
            <p className="text-sm font-bold text-foreground mb-2">Диетические ограничения</p>
            <div className="flex gap-2 flex-wrap">
              {DIET_FILTERS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => toggleDiet(d.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all btn-bounce ${
                    selectedDiets.includes(d.id) ? 'gradient-green text-white' : 'bg-muted text-foreground'
                  }`}
                >
                  <span>{d.emoji}</span>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Max calories */}
          <div>
            <p className="text-sm font-bold text-foreground mb-2">
              Калорийность: {maxCalories ? `до ${maxCalories} ккал` : 'любая'}
            </p>
            <input
              type="range"
              min={100}
              max={800}
              step={50}
              value={maxCalories ?? 800}
              onChange={(e) => setMaxCalories(Number(e.target.value) >= 800 ? undefined : Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>100 ккал</span>
              <span>800+ ккал</span>
            </div>
          </div>

          <button
            onClick={() => {
              setDifficulty('all'); setMaxTime(undefined); setMaxCalories(undefined);
              setSelectedDiets([]); setOnlyCanCook(false);
            }}
            className="text-sm text-muted-foreground underline"
          >
            Сбросить все фильтры
          </button>
        </div>
      )}

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 animate-fade-in">
          <p className="text-6xl mb-4">🔍</p>
          <h3 className="text-xl font-black text-foreground mb-2">Ничего не найдено</h3>
          <p className="text-muted-foreground">Попробуйте изменить фильтры или добавить больше продуктов</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((m, i) => (
            <RecipeCard
              key={m.recipe.id}
              recipe={m.recipe}
              matchPercent={m.matchPercent}
              missingIngredients={m.missingIngredients}
              canCook={m.canCook}
              animationDelay={Math.min(i * 50, 400)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
