import React from 'react';
import { Home, CreditCard, CalendarCheck2, ArrowUpDown, BarChart3 } from 'lucide-react';

const TABS = [
  { id: 'inicio', label: 'Inicio', icon: Home },
  { id: 'tarjetas', label: 'Tarjetas', icon: CreditCard },
  { id: 'fijos', label: 'Fijos', icon: CalendarCheck2 },
  { id: 'extras', label: 'Extras', icon: ArrowUpDown },
  { id: 'anio', label: 'Año', icon: BarChart3 },
];

export function BottomNav({ activeTab, onSelectTab }) {
  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      {TABS.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            className={`nav-tab-btn ${isActive ? 'active' : ''}`}
            onClick={() => onSelectTab(tab.id)}
            aria-selected={isActive}
            role="tab"
          >
            <Icon className="nav-tab-icon" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

