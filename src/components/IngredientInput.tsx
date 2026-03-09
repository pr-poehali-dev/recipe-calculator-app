import { useState, useRef, useEffect } from 'react';
import { ALL_INGREDIENTS } from '@/data/recipes';
import { useAppStore } from '@/store/useAppStore';
import Icon from '@/components/ui/icon';

export default function IngredientInput() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { myIngredients, addIngredient, removeIngredient, clearIngredients } = useAppStore();

  useEffect(() => {
    if (query.length >= 1) {
      const q = query.toLowerCase();
      setSuggestions(
        ALL_INGREDIENTS.filter((i) => i.toLowerCase().includes(q) && !myIngredients.includes(i)).slice(0, 8)
      );
    } else {
      setSuggestions([]);
    }
  }, [query, myIngredients]);

  const handleAdd = (ingredient: string) => {
    addIngredient(ingredient.toLowerCase().trim());
    setQuery('');
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      if (suggestions.length > 0) {
        handleAdd(suggestions[0]);
      } else {
        handleAdd(query.trim());
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Input */}
      <div className="relative">
        <div className={`flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm border-2 transition-all duration-200 ${focused ? 'border-primary shadow-md' : 'border-transparent'}`}>
          <Icon name="Search" size={20} className="text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            placeholder="Что есть дома? Например: курица..."
            className="flex-1 bg-transparent outline-none text-foreground text-base placeholder:text-muted-foreground font-golos"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground transition-colors">
              <Icon name="X" size={16} />
            </button>
          )}
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && focused && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-border/50 overflow-hidden z-50 animate-scale-in">
            {suggestions.map((s) => (
              <button
                key={s}
                onMouseDown={() => handleAdd(s)}
                className="w-full text-left px-4 py-3 hover:bg-muted/60 transition-colors text-foreground text-sm font-medium capitalize first:pt-4 last:pb-4"
              >
                <span className="mr-2">🍽️</span>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tags */}
      {myIngredients.length > 0 && (
        <div className="flex flex-wrap gap-2 animate-fade-in">
          {myIngredients.map((ingredient) => (
            <div
              key={ingredient}
              className="flex items-center gap-1.5 bg-white border border-border rounded-full px-3 py-1.5 text-sm font-medium text-foreground shadow-sm animate-scale-in"
            >
              <span className="capitalize">{ingredient}</span>
              <button
                onClick={() => removeIngredient(ingredient)}
                className="w-4 h-4 rounded-full bg-muted hover:bg-muted-foreground/20 flex items-center justify-center transition-colors ml-0.5"
              >
                <Icon name="X" size={10} className="text-muted-foreground" />
              </button>
            </div>
          ))}
          <button
            onClick={clearIngredients}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1.5"
          >
            <Icon name="Trash2" size={12} />
            Очистить всё
          </button>
        </div>
      )}
    </div>
  );
}
