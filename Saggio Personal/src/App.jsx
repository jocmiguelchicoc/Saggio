import React, { useState } from 'react';
import { usePeriod } from './hooks/usePeriod.js';
import { useFinanceData } from './hooks/useFinanceData.js';
import { Header } from './components/layout/Header.jsx';
import { BottomNav } from './components/layout/BottomNav.jsx';
import { SettingsModal } from './components/common/SettingsModal.jsx';
import { settingsRepository } from './data/repositories/settingsRepository.js';

import { InicioTab } from './components/tabs/InicioTab/InicioTab.jsx';
import { TarjetasTab } from './components/tabs/TarjetasTab/TarjetasTab.jsx';
import { FijosTab } from './components/tabs/FijosTab/FijosTab.jsx';
import { ExtrasTab } from './components/tabs/ExtrasTab/ExtrasTab.jsx';
import { AnioTab } from './components/tabs/AnioTab/AnioTab.jsx';

export function App() {
  const [activeTab, setActiveTab] = useState('inicio');
  const [tarjetasSubTab, setTarjetasSubTab] = useState('tarjetas');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const period = usePeriod();
  const data = useFinanceData();

  const handleNavigateTab = (tab, subTab) => {
    setActiveTab(tab);
    if (subTab) {
      setTarjetasSubTab(subTab);
    }
  };

  const isAnioTab = activeTab === 'anio';
  const isCurrentPeriod = isAnioTab
    ? period.selectedYear === parseInt(period.currentRealYM.split('-')[0], 10)
    : period.selectedYM === period.currentRealYM;

  const handlePrev = () => {
    if (isAnioTab) {
      period.goToPrevYear();
    } else {
      period.goToPrevMonth();
    }
  };

  const handleNext = () => {
    if (isAnioTab) {
      period.goToNextYear();
    } else {
      period.goToNextMonth();
    }
  };

  const handleReset = () => {
    if (isAnioTab) {
      period.setSelectedYear(parseInt(period.currentRealYM.split('-')[0], 10));
    } else {
      period.goToCurrentMonth();
    }
  };

  const handleSaveSettings = async (settingsData) => {
    await settingsRepository.save(settingsData);
  };

  return (
    <>
      <Header
        activeTab={activeTab}
        monthLabel={period.monthLabel}
        selectedYear={period.selectedYear}
        onPrev={handlePrev}
        onNext={handleNext}
        onReset={handleReset}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isCurrentPeriod={isCurrentPeriod}
      />

      <main className="app-content">
        {activeTab === 'inicio' && (
          <InicioTab
            period={period}
            data={data}
            onNavigateTab={handleNavigateTab}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}
        {activeTab === 'tarjetas' && (
          <TarjetasTab
            period={period}
            data={data}
            subTab={tarjetasSubTab}
            onSelectSubTab={setTarjetasSubTab}
          />
        )}
        {activeTab === 'fijos' && <FijosTab period={period} data={data} />}
        {activeTab === 'extras' && <ExtrasTab period={period} data={data} />}
        {activeTab === 'anio' && <AnioTab period={period} data={data} />}
      </main>

      <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={data.settings}
        onSaveSettings={handleSaveSettings}
      />
    </>
  );
}

export default App;
