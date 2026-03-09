interface MacroBadgeProps {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function MacroBadge({ calories, protein, fat, carbs, size = 'md' }: MacroBadgeProps) {
  const isLg = size === 'lg';
  const isSm = size === 'sm';

  const containerClass = isLg
    ? 'grid grid-cols-4 gap-3'
    : isSm
    ? 'flex gap-2 flex-wrap'
    : 'grid grid-cols-4 gap-2';

  const itemClass = isLg
    ? 'flex flex-col items-center bg-white rounded-2xl p-4 shadow-sm'
    : isSm
    ? 'flex items-center gap-1'
    : 'flex flex-col items-center bg-white rounded-xl p-3 shadow-sm';

  const numClass = isLg ? 'text-2xl font-black' : isSm ? 'text-sm font-bold' : 'text-xl font-black';
  const labelClass = isLg ? 'text-sm text-muted-foreground mt-1' : isSm ? 'text-xs text-muted-foreground' : 'text-xs text-muted-foreground mt-0.5';

  if (isSm) {
    return (
      <div className={containerClass}>
        <span className={itemClass}>
          <span className={`${numClass} macro-cal`}>{calories}</span>
          <span className={labelClass}>ккал</span>
        </span>
        <span className="text-border">·</span>
        <span className={itemClass}>
          <span className={`${numClass} macro-protein`}>{protein}г</span>
          <span className={labelClass}>Б</span>
        </span>
        <span className="text-border">·</span>
        <span className={itemClass}>
          <span className={`${numClass} macro-fat`}>{fat}г</span>
          <span className={labelClass}>Ж</span>
        </span>
        <span className="text-border">·</span>
        <span className={itemClass}>
          <span className={`${numClass} macro-carbs`}>{carbs}г</span>
          <span className={labelClass}>У</span>
        </span>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <div className={itemClass}>
        <span className={`${numClass} macro-cal`}>{calories}</span>
        <span className={labelClass}>ккал</span>
      </div>
      <div className={itemClass}>
        <span className={`${numClass} macro-protein`}>{protein}г</span>
        <span className={labelClass}>Белки</span>
      </div>
      <div className={itemClass}>
        <span className={`${numClass} macro-fat`}>{fat}г</span>
        <span className={labelClass}>Жиры</span>
      </div>
      <div className={itemClass}>
        <span className={`${numClass} macro-carbs`}>{carbs}г</span>
        <span className={labelClass}>Углеводы</span>
      </div>
    </div>
  );
}
