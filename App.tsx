import React, { useState } from 'react';
import { Activity, Box, Map, TreePine, Building2, User, RotateCcw, Sun, Cloud, Wind, Dice5, ChevronDown, ChevronRight } from 'lucide-react';
import { EnvironmentType, ActorCategory, WeatherSettings } from './types';
import { Scene } from './components/Scene';
import { ACTOR_DEFINITIONS } from './constants';

const INITIAL_COUNTS: Record<ActorCategory, number> = {
  [ActorCategory.Pedestrian]: 5,
  [ActorCategory.People]: 2,
  [ActorCategory.Bicycle]: 2,
  [ActorCategory.Car]: 3,
  [ActorCategory.Van]: 1,
  [ActorCategory.Truck]: 1,
  [ActorCategory.Tricycle]: 0,
  [ActorCategory.AwningTricycle]: 0,
  [ActorCategory.Bus]: 0,
  [ActorCategory.Motor]: 1,
};

const INITIAL_WEATHER: WeatherSettings = {
  timeOfDay: 12, // Noon
  azimuth: 180,
  cloudCover: 0.2,
  fogDensity: 0.02,
  fogColor: '#e2e8f0',
};

// Helper Component for Accordion Sections
interface SidebarSectionProps {
  id: string;
  title: string;
  icon: React.ElementType;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const SidebarSection: React.FC<SidebarSectionProps> = ({ id, title, icon: Icon, isOpen, onToggle, children }) => (
  <div className="border-b border-slate-700">
    <button
      onClick={onToggle}
      className={`w-full flex items-center justify-between p-4 transition-colors duration-200 ${
        isOpen ? 'bg-slate-800/50 text-blue-400' : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200'
      }`}
    >
      <div className="flex items-center gap-3 font-semibold text-xs uppercase tracking-wider">
        <Icon className="w-4 h-4" />
        {title}
      </div>
      {isOpen ? <ChevronDown className="w-4 h-4 opacity-70" /> : <ChevronRight className="w-4 h-4 opacity-50" />}
    </button>
    
    <div 
      className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}
    >
      <div className="p-4 bg-slate-900/30 inner-shadow">
        {children}
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [environment, setEnvironment] = useState<EnvironmentType>(EnvironmentType.URBAN);
  const [actorCounts, setActorCounts] = useState<Record<ActorCategory, number>>(INITIAL_COUNTS);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(false);
  const [weather, setWeather] = useState<WeatherSettings>(INITIAL_WEATHER);
  const [seed, setSeed] = useState<number>(0);
  
  // State for the accordion. Default 'scenario' open.
  const [activeTab, setActiveTab] = useState<string | null>('scenario');

  const toggleTab = (tab: string) => {
    setActiveTab(activeTab === tab ? null : tab);
  };

  const handleCountChange = (category: ActorCategory, value: number) => {
    setActorCounts(prev => ({
      ...prev,
      [category]: Math.max(0, Math.min(50, value)) // Limit between 0 and 50
    }));
  };

  const handleWeatherChange = (key: keyof WeatherSettings, value: number | string) => {
    setWeather(prev => ({ ...prev, [key]: value }));
  };

  const resetCounts = () => setActorCounts(INITIAL_COUNTS);
  const regenerateMap = () => setSeed(prev => prev + 1);

  return (
    <div className="flex h-screen w-full bg-slate-900 overflow-hidden font-sans">
      
      {/* Sidebar Controls */}
      <aside className="w-80 flex-shrink-0 bg-slate-900 border-r border-slate-700 flex flex-col h-full text-slate-200 shadow-2xl z-10">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-700 bg-slate-900 z-20">
            <h1 className="text-xl font-bold flex items-center gap-2 text-blue-400">
                <Activity className="w-5 h-5" />
                VisDrone Sim
            </h1>
            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Generatore Sintetico</p>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
            
            {/* 1. SCENARIO SECTION */}
            <SidebarSection 
              id="scenario" 
              title="Scenario" 
              icon={Map} 
              isOpen={activeTab === 'scenario'} 
              onToggle={() => toggleTab('scenario')}
            >
                <div className="mb-4 flex justify-end">
                     <button 
                        onClick={regenerateMap} 
                        className="flex items-center gap-2 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-md border border-slate-700 transition-colors w-full justify-center"
                        title="Rigenera posizione procedurale"
                    >
                        <Dice5 className="w-3 h-3" /> Rigenera Procedurale
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-2">
                    <button 
                        onClick={() => setEnvironment(EnvironmentType.URBAN)}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${environment === EnvironmentType.URBAN ? 'bg-blue-600/20 border-blue-500 text-blue-100' : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600 text-slate-400'}`}
                    >
                        <Building2 className="w-5 h-5" />
                        <div className="text-left">
                            <div className="font-medium text-sm">Urbano</div>
                            <div className="text-[10px] opacity-60">Città, strade, palazzi</div>
                        </div>
                    </button>
                    
                    <button 
                        onClick={() => setEnvironment(EnvironmentType.COUNTRY)}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${environment === EnvironmentType.COUNTRY ? 'bg-green-600/20 border-green-500 text-green-100' : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600 text-slate-400'}`}
                    >
                        <TreePine className="w-5 h-5" />
                        <div className="text-left">
                            <div className="font-medium text-sm">Campagna</div>
                            <div className="text-[10px] opacity-60">Natura, vegetazione</div>
                        </div>
                    </button>

                    <button 
                        onClick={() => setEnvironment(EnvironmentType.WINTER)}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${environment === EnvironmentType.WINTER ? 'bg-indigo-500/20 border-indigo-400 text-indigo-100' : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600 text-slate-400'}`}
                    >
                        <Box className="w-5 h-5" />
                        <div className="text-left">
                            <div className="font-medium text-sm">Inverno</div>
                            <div className="text-[10px] opacity-60">Neve, colline</div>
                        </div>
                    </button>
                </div>
            </SidebarSection>

             {/* 2. WEATHER SECTION */}
             <SidebarSection 
                id="weather" 
                title="Meteo & Orario" 
                icon={Sun} 
                isOpen={activeTab === 'weather'} 
                onToggle={() => toggleTab('weather')}
             >
                <div className="space-y-5">
                    
                    {/* Time of Day */}
                    <div>
                        <div className="flex justify-between text-[11px] mb-2 text-slate-400 font-medium">
                            <span>ORA DEL GIORNO</span>
                            <span className="text-blue-300 bg-blue-900/30 px-1.5 rounded">{weather.timeOfDay.toFixed(1)}h</span>
                        </div>
                        <input 
                            type="range" min="0" max="24" step="0.1"
                            value={weather.timeOfDay}
                            onChange={(e) => handleWeatherChange('timeOfDay', parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                    </div>

                    {/* Sun Azimuth */}
                    <div>
                        <div className="flex justify-between text-[11px] mb-2 text-slate-400 font-medium">
                            <span>POSIZIONE SOLE</span>
                            <span className="text-slate-300">{weather.azimuth}°</span>
                        </div>
                        <input 
                            type="range" min="0" max="360" step="1"
                            value={weather.azimuth}
                            onChange={(e) => handleWeatherChange('azimuth', parseInt(e.target.value))}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                    </div>

                    {/* Cloud Cover */}
                    <div>
                         <div className="flex justify-between text-[11px] mb-2 text-slate-400 font-medium items-center">
                            <span className="flex items-center gap-1"><Cloud className="w-3 h-3"/> NUVOLOSITÀ</span>
                            <span className="text-slate-300">{(weather.cloudCover * 100).toFixed(0)}%</span>
                        </div>
                        <input 
                            type="range" min="0" max="1" step="0.05"
                            value={weather.cloudCover}
                            onChange={(e) => handleWeatherChange('cloudCover', parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-400"
                        />
                    </div>

                    {/* Fog Density & Color */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-[11px] text-slate-400 font-medium items-center">
                            <span className="flex items-center gap-1"><Wind className="w-3 h-3"/> NEBBIA & ATMOSFERA</span>
                            <span className="text-slate-300">{(weather.fogDensity * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex gap-2 items-center">
                             <input 
                                type="range" min="0" max="0.1" step="0.005"
                                value={weather.fogDensity}
                                onChange={(e) => handleWeatherChange('fogDensity', parseFloat(e.target.value))}
                                className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-400"
                            />
                             <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-600 shadow-sm shrink-0">
                                <input 
                                    type="color"
                                    value={weather.fogColor}
                                    onChange={(e) => handleWeatherChange('fogColor', e.target.value)}
                                    className="absolute -top-2 -left-2 w-12 h-12 p-0 border-none cursor-pointer"
                                />
                             </div>
                        </div>
                    </div>
                </div>
            </SidebarSection>

            {/* 3. VISUALIZATION SECTION */}
            <SidebarSection 
                id="visual" 
                title="Visualizzazione" 
                icon={Box} 
                isOpen={activeTab === 'visual'} 
                onToggle={() => toggleTab('visual')}
            >
                <label className="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg border border-slate-700/50 cursor-pointer hover:bg-slate-800 transition-colors">
                    <span className="text-xs font-medium text-slate-300">Overlay Bounding Box</span>
                    <div className="relative inline-block w-9 h-5 align-middle select-none transition duration-200 ease-in">
                        <input 
                            type="checkbox" 
                            name="toggle" 
                            id="toggle" 
                            checked={showBoundingBoxes}
                            onChange={(e) => setShowBoundingBoxes(e.target.checked)}
                            className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 right-4"
                        />
                        <label htmlFor="toggle" className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${showBoundingBoxes ? 'bg-blue-500' : 'bg-slate-600'}`}></label>
                    </div>
                </label>
            </SidebarSection>

            {/* 4. ACTORS SECTION */}
            <SidebarSection 
                id="actors" 
                title="Attori (VisDrone)" 
                icon={User} 
                isOpen={activeTab === 'actors'} 
                onToggle={() => toggleTab('actors')}
            >
                <div className="mb-4 flex justify-end">
                     <button onClick={resetCounts} className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1 bg-red-900/20 px-2 py-1 rounded border border-red-900/50">
                        <RotateCcw className="w-3 h-3" /> Reset
                    </button>
                </div>

                <div className="space-y-3">
                    {Object.keys(ACTOR_DEFINITIONS).map((key) => {
                        const cat = parseInt(key) as ActorCategory;
                        const def = ACTOR_DEFINITIONS[cat];
                        return (
                            <div key={cat} className="flex flex-col gap-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: def.color }}></div>
                                        <span className="text-xs text-slate-300">{def.label}</span>
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-1.5 rounded">{actorCounts[cat]}</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="20" 
                                    value={actorCounts[cat]} 
                                    onChange={(e) => handleCountChange(cat, parseInt(e.target.value))}
                                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-400 hover:accent-blue-400"
                                />
                            </div>
                        );
                    })}
                </div>
            </SidebarSection>

        </div>
        
        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900 text-[9px] text-slate-600 text-center uppercase tracking-widest">
            VisDrone Simulator v1.0
        </div>
      </aside>

      {/* Main Canvas Area */}
      <main className="flex-1 relative h-full bg-black">
         <Scene 
            environment={environment} 
            actorCounts={actorCounts} 
            showBoundingBoxes={showBoundingBoxes}
            weather={weather}
            seed={seed}
         />
      </main>

    </div>
  );
};

export default App;