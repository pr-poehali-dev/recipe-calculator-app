import { useAppStore } from '@/store/useAppStore';
import Icon from '@/components/ui/icon';

export default function CalorieCounter() {
  const { mealPlan, calorieGoal, setCalorieGoal } = useAppStore();

  const today = new Date().toISOString().split('T')[0];
  const todayPlan = mealPlan.find((p) => p.date === today);

  const todayNutrition = todayPlan
    ? todayPlan.meals.reduce(
        (acc, { recipe, servings }) => {
          const factor = servings / recipe.servings;
          return {
            calories: acc.calories + Math.round(recipe.calories * factor),
            protein: acc.protein + Math.round(recipe.protein * factor * 10) / 10,
            fat: acc.fat + Math.round(recipe.fat * factor * 10) / 10,
            carbs: acc.carbs + Math.round(recipe.carbs * factor * 10) / 10,
          };
        },
        { calories: 0, protein: 0, fat: 0, carbs: 0 }
      )
    : { calories: 0, protein: 0, fat: 0, carbs: 0 };

  const percent = Math.min(100, Math.round((todayNutrition.calories / calorieGoal) * 100));
  const remaining = calorieGoal - todayNutrition.calories;

  const barColor =
    percent < 70 ? 'gradient-green' : percent < 95 ? 'gradient-orange' : 'gradient-pink';

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-border/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 gradient-orange rounded-2xl flex items-center justify-center">
            <Icon name="Flame" size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-foreground">Сегодня</p>
            <p className="text-xs text-muted-foreground">Дневная норма</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black macro-cal">{todayNutrition.calories}</p>
          <p className="text-xs text-muted-foreground">из {calorieGoal} ккал</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-3 bg-muted rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        {remaining > 0
          ? `Ещё ${remaining} ккал до нормы`
          : `Норма выполнена! +${Math.abs(remaining)} ккал сверх`}
      </p>

      {/* Macro bars */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Белки', value: todayNutrition.protein, color: 'macro-protein', bg: 'bg-blue-50', goal: Math.round(calorieGoal * 0.03) },
          { label: 'Жиры', value: todayNutrition.fat, color: 'macro-fat', bg: 'bg-yellow-50', goal: Math.round(calorieGoal * 0.025) },
          { label: 'Углев.', value: todayNutrition.carbs, color: 'macro-carbs', bg: 'bg-green-50', goal: Math.round(calorieGoal * 0.075) },
        ].map(({ label, value, color, bg, goal }) => (
          <div key={label} className={`${bg} rounded-2xl p-3`}>
            <p className={`text-lg font-black ${color}`}>{value}г</p>
            <p className="text-xs text-muted-foreground">{label}</p>
            <div className="h-1.5 bg-white rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full ${color.replace('macro-', 'bg-').replace('protein', 'blue-400').replace('fat', 'yellow-400').replace('carbs', 'green-400')}`}
                style={{ width: `${Math.min(100, (value / goal) * 100)}%`, transition: 'width 0.7s ease-out' }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Goal editor */}
      <div className="mt-4 flex items-center gap-3 pt-4 border-t border-border/50">
        <Icon name="Target" size={16} className="text-muted-foreground" />
        <span className="text-sm text-muted-foreground flex-1">Цель калорий:</span>
        <div className="flex items-center gap-2">
          <button onClick={() => setCalorieGoal(Math.max(1000, calorieGoal - 100))} className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-sm font-bold btn-bounce text-foreground">−</button>
          <span className="text-sm font-bold text-foreground w-12 text-center">{calorieGoal}</span>
          <button onClick={() => setCalorieGoal(Math.min(5000, calorieGoal + 100))} className="w-7 h-7 rounded-full gradient-orange text-white flex items-center justify-center text-sm font-bold btn-bounce">+</button>
        </div>
      </div>
    </div>
  );
}
