import Icon from '@/components/ui/icon';

interface NavBarProps {
  active: string;
  onChange: (page: string) => void;
}

const NAV_ITEMS = [
  { id: 'home', label: 'Главная', icon: 'Home' },
  { id: 'recipes', label: 'Рецепты', icon: 'UtensilsCrossed' },
  { id: 'menu', label: 'Меню', icon: 'CalendarDays' },
  { id: 'favorites', label: 'Избранное', icon: 'Heart' },
  { id: 'products', label: 'Продукты', icon: 'ShoppingBasket' },
];

export default function NavBar({ active, onChange }: NavBarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-border/50 min-h-screen p-6 gap-2 fixed left-0 top-0 z-40">
        {/* Logo */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 gradient-hero rounded-2xl flex items-center justify-center text-2xl shadow-lg">
              🍽️
            </div>
            <div>
              <p className="text-lg font-black text-foreground leading-tight">ВкусноДома</p>
              <p className="text-xs text-muted-foreground">Правильное питание</p>
            </div>
          </div>
        </div>

        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all duration-200 btn-bounce w-full ${
                isActive
                  ? 'gradient-orange text-white shadow-lg shadow-orange-200'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon name={item.icon} size={20} fallback="Home" />
              <span className="font-semibold">{item.label}</span>
            </button>
          );
        })}
      </aside>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50">
        <div className="flex items-center justify-around px-2 py-2">
          {NAV_ITEMS.map((item) => {
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChange(item.id)}
                className={`nav-pill ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 ${isActive ? 'gradient-orange shadow-md shadow-orange-200' : ''}`}>
                  <Icon name={item.icon} size={20} fallback="Home" className={isActive ? 'text-white' : ''} />
                </div>
                <span className={`text-[10px] font-semibold ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}