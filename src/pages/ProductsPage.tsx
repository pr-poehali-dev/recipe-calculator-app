import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { ALL_INGREDIENTS } from '@/data/recipes';
import IngredientInput from '@/components/IngredientInput';
import Icon from '@/components/ui/icon';

const CATEGORIES_MAP: Record<string, string[]> = {
  '🥚 Яйца и молочное': ['яйца', 'молоко', 'творог', 'сметана', 'кефир', 'сыр', 'масло сливочное', 'йогурт'],
  '🥩 Мясо и рыба': ['курица', 'говядина', 'свинина', 'рыба', 'лосось', 'тунец'],
  '🥔 Овощи': ['картофель', 'морковь', 'лук', 'чеснок', 'помидоры', 'огурцы', 'капуста', 'болгарский перец', 'баклажан', 'кабачок', 'брокколи', 'шпинат', 'салат'],
  '🌾 Крупы и мука': ['рис', 'гречка', 'макароны', 'овсянка', 'геркулес', 'мука'],
  '🍎 Фрукты': ['яблоки', 'бананы', 'апельсины', 'лимон', 'клубника'],
  '🫙 Консервы и соусы': ['томатная паста', 'майонез', 'горчица', 'соевый соус', 'консервированная кукуруза', 'консервированный горошек', 'консервированная фасоль'],
  '🌿 Специи и зелень': ['укроп', 'петрушка', 'базилик', 'тимьян', 'лавровый лист', 'соль', 'перец'],
  '🍄 Грибы': ['грибы', 'шампиньоны', 'опята'],
  '🫘 Бобовые': ['фасоль', 'горох', 'чечевица', 'нут'],
  '🍯 Сладкое': ['сахар', 'мёд', 'варенье', 'шоколад', 'какао'],
  '🥖 Хлеб': ['хлеб', 'тосты', 'батон'],
  '🫒 Масло': ['масло растительное'],
};

export default function ProductsPage() {
  const { myIngredients, addIngredient, removeIngredient, shoppingList, removeFromShoppingList, clearShoppingList, addToShoppingList } = useAppStore();
  const [activeTab, setActiveTab] = useState<'mine' | 'catalog' | 'shopping'>('mine');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(Object.keys(CATEGORIES_MAP).slice(0, 3));

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const notInList = ALL_INGREDIENTS.filter((i) => !myIngredients.includes(i));

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      <div>
        <h1 className="text-3xl font-black text-foreground mb-1">Мои продукты</h1>
        <p className="text-muted-foreground text-sm">Управляйте продуктами и списком покупок</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-muted rounded-2xl p-1">
        {([
          { id: 'mine', label: `Есть дома (${myIngredients.length})` },
          { id: 'catalog', label: 'Каталог' },
          { id: 'shopping', label: `Покупки (${shoppingList.length})` },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all btn-bounce whitespace-nowrap ${
              activeTab === tab.id ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* My products */}
      {activeTab === 'mine' && (
        <div className="space-y-5 animate-fade-in">
          <IngredientInput />

          {myIngredients.length > 0 ? (
            <div className="bg-white rounded-3xl p-5 border border-border/50 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-foreground">Список продуктов</h2>
                <span className="bg-primary/10 text-primary text-sm font-bold px-3 py-1 rounded-full">
                  {myIngredients.length} шт.
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {myIngredients.map((ingredient) => (
                  <div
                    key={ingredient}
                    className="flex items-center gap-2 bg-muted/60 rounded-2xl px-3 py-2.5 group"
                  >
                    <span className="flex-1 text-sm font-medium text-foreground capitalize truncate">{ingredient}</span>
                    <button
                      onClick={() => removeIngredient(ingredient)}
                      className="w-6 h-6 rounded-full bg-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all shadow-sm shrink-0"
                    >
                      <Icon name="X" size={10} className="text-muted-foreground" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 animate-fade-in">
              <p className="text-5xl mb-3">🛒</p>
              <h3 className="text-lg font-black text-foreground mb-2">Список продуктов пуст</h3>
              <p className="text-muted-foreground text-sm">Начните вводить продукты выше</p>
            </div>
          )}
        </div>
      )}

      {/* Catalog */}
      {activeTab === 'catalog' && (
        <div className="space-y-3 animate-fade-in">
          <p className="text-sm text-muted-foreground">Нажмите на продукт, чтобы добавить его в список</p>
          {Object.entries(CATEGORIES_MAP).map(([catName, items]) => {
            const isExpanded = expandedCategories.includes(catName);
            return (
              <div key={catName} className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleCategory(catName)}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                >
                  <span className="font-bold text-foreground">{catName}</span>
                  <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={18} className="text-muted-foreground" />
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 flex flex-wrap gap-2">
                    {items.map((item) => {
                      const isAdded = myIngredients.includes(item);
                      return (
                        <button
                          key={item}
                          onClick={() => isAdded ? removeIngredient(item) : addIngredient(item)}
                          className={`px-3 py-1.5 rounded-2xl text-sm font-medium transition-all btn-bounce capitalize ${
                            isAdded
                              ? 'gradient-green text-white shadow-sm'
                              : 'bg-muted text-foreground hover:bg-muted/80'
                          }`}
                        >
                          {isAdded && <span className="mr-1">✓</span>}
                          {item}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Shopping list */}
      {activeTab === 'shopping' && (
        <div className="space-y-4 animate-fade-in">
          {shoppingList.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{shoppingList.length} позиций</p>
                <button
                  onClick={() => {
                    shoppingList.forEach((item) => addIngredient(item));
                    clearShoppingList();
                  }}
                  className="flex items-center gap-2 gradient-green text-white px-4 py-2 rounded-xl font-semibold text-sm btn-bounce"
                >
                  <Icon name="CheckCheck" size={16} />
                  Всё куплено!
                </button>
              </div>
              <div className="space-y-2">
                {shoppingList.map((item) => (
                  <div
                    key={item}
                    className="bg-white rounded-2xl p-4 flex items-center gap-3 border border-border/50 shadow-sm"
                  >
                    <div className="w-6 h-6 rounded-full border-2 border-border shrink-0" />
                    <span className="flex-1 font-medium text-foreground capitalize">{item}</span>
                    <button
                      onClick={() => {
                        addIngredient(item);
                        removeFromShoppingList(item);
                      }}
                      className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full btn-bounce"
                    >
                      <Icon name="Plus" size={12} />
                      В наличии
                    </button>
                    <button
                      onClick={() => removeFromShoppingList(item)}
                      className="w-7 h-7 rounded-full bg-muted flex items-center justify-center btn-bounce"
                    >
                      <Icon name="X" size={12} className="text-muted-foreground" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={clearShoppingList}
                className="w-full py-3 rounded-2xl border border-border/50 text-muted-foreground font-semibold text-sm btn-bounce"
              >
                Очистить список
              </button>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-5xl mb-3">🛍️</p>
              <h3 className="text-lg font-black text-foreground mb-2">Список покупок пуст</h3>
              <p className="text-muted-foreground text-sm">
                Открывайте рецепты и нажимайте «В список покупок» для недостающих ингредиентов
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
