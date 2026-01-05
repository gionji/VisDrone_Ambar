import React, { useState } from 'react';
import { Activity, Box, Map, TreePine, Building2, User, RotateCcw, Sun, Cloud, Wind, Dice5, ChevronDown, ChevronRight, Upload, FileUp } from 'lucide-react';
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
  
  // Custom Assets State: Maps Category ID -> Array of Blob URLs
  const [customModels, setCustomModels] = useState<Record<number, string[]>>({});
  const [uploadCategory, setUploadCategory] = useState<string>(ActorCategory.Car.toString());

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create a Blob URL for the uploaded file
    const url = URL.createObjectURL(file);
    const catId = parseInt(uploadCategory);

    setCustomModels(prev => {
        const existing = prev[catId] || [];
        return {
            ...prev,
            [catId]: [...existing, url]
        };
    });

    // Reset input
    event.target.value = '';
    
    alert(`Model ${file.name} uploaded for category ${ACTOR_DEFINITIONS[catId as ActorCategory].label}. Click "Regenerate Procedural" or add new actors to see it.`);
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
            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Synthetic Generator</p>
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
                        title="Regenerate procedural positions"
                    >
                        <Dice5 className="w-3 h-3" /> Regenerate Procedural
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-2">
                    <button 
                        onClick={() => setEnvironment(EnvironmentType.URBAN)}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${environment === EnvironmentType.URBAN ? 'bg-blue-600/20 border-blue-500 text-blue-100' : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600 text-slate-400'}`}
                    >
                        <Building2 className="w-5 h-5" />
                        <div className="text-left">
                            <div className="font-medium text-sm">Urban</div>
                            <div className="text-[10px] opacity-60">City, streets, buildings</div>
                        </div>
                    </button>
                    
                    <button 
                        onClick={() => setEnvironment(EnvironmentType.COUNTRY)}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${environment === EnvironmentType.COUNTRY ? 'bg-green-600/20 border-green-500 text-green-100' : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600 text-slate-400'}`}
                    >
                        <TreePine className="w-5 h-5" />
                        <div className="text-left">
                            <div className="font-medium text-sm">Country</div>
                            <div className="text-[10px] opacity-60">Nature, vegetation</div>
                        </div>
                    </button>

                    <button 
                        onClick={() => setEnvironment(EnvironmentType.WINTER)}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${environment === EnvironmentType.WINTER ? 'bg-indigo-500/20 border-indigo-400 text-indigo-100' : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600 text-slate-400'}`}
                    >
                        <Box className="w-5 h-5" />
                        <div className="text-left">
                            <div className="font-medium text-sm">Winter</div>
                            <div className="text-[10px] opacity-60">Snow, hills</div>
                        </div>
                    </button>
                </div>
            </SidebarSection>

             {/* 2. WEATHER SECTION */}
             <SidebarSection 
                id="weather" 
                title="Weather & Time" 
                icon={Sun} 
                isOpen={activeTab === 'weather'} 
                onToggle={() => toggleTab('weather')}
             >
                <div className="space-y-5">
                    
                    {/* Time of Day */}
                    <div>
                        <div className="flex justify-between text-[11px] mb-2 text-slate-400 font-medium">
                            <span>TIME OF DAY</span>
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
                            <span>SUN AZIMUTH</span>
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
                            <span className="flex items-center gap-1"><Cloud className="w-3 h-3"/> CLOUD COVER</span>
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
                            <span className="flex items-center gap-1"><Wind className="w-3 h-3"/> FOG & ATMOSPHERE</span>
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
            
            {/* 3. UPLOAD / IMPORT ASSETS SECTION */}
            <SidebarSection 
                id="import" 
                title="Import 3D Assets" 
                icon={Upload} 
                isOpen={activeTab === 'import'} 
                onToggle={() => toggleTab('import')}
            >
                <div className="flex flex-col gap-3">
                    <div className="text-[10px] text-slate-400 leading-relaxed">
                        Upload <b>.glb</b> or <b>.gltf</b> files from your computer. They will be used randomly for the selected category.
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-300">TARGET CATEGORY</label>
                        <select 
                            value={uploadCategory} 
                            onChange={(e) => setUploadCategory(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded p-2 focus:border-blue-500 focus:outline-none"
                        >
                            {Object.entries(ACTOR_DEFINITIONS).map(([key, def]) => (
                                <option key={key} value={key}>{def.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="relative group">
                         <label 
                            htmlFor="file-upload" 
                            className="flex items-center justify-center gap-2 w-full p-3 border border-dashed border-slate-600 rounded-lg bg-slate-800/50 hover:bg-slate-800 hover:border-blue-500 cursor-pointer transition-all group-hover:text-blue-400 text-slate-400 text-xs"
                        >
                            <FileUp className="w-4 h-4" />
                            <span>Select File (.glb)</span>
                         </label>
                         <input 
                            id="file-upload" 
                            type="file" 
                            accept=".glb,.gltf" 
                            onChange={handleFileUpload}
                            className="hidden" 
                        />
                    </div>

                    {/* Show stats of uploaded models */}
                    <div className="mt-2 border-t border-slate-700 pt-2">
                        <div className="text-[10px] font-bold text-slate-500 mb-1">CUSTOM ASSETS</div>
                        {Object.keys(customModels).length === 0 ? (
                            <div className="text-[10px] text-slate-600 italic">No models uploaded</div>
                        ) : (
                            <div className="flex flex-wrap gap-1">
                                {Object.entries(customModels).map(([catId, urls]) => {
                                    const count = (urls as string[]).length;
                                    if(count === 0) return null;
                                    const def = ACTOR_DEFINITIONS[parseInt(catId) as ActorCategory];
                                    return (
                                        <div key={catId} className="text-[9px] bg-slate-800 border border-slate-700 text-slate-300 px-1.5 py-0.5 rounded flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: def.color}}></div>
                                            {def.label}: {count}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </SidebarSection>

            {/* 4. VISUALIZATION SECTION */}
            <SidebarSection 
                id="visual" 
                title="Visualization" 
                icon={Box} 
                isOpen={activeTab === 'visual'} 
                onToggle={() => toggleTab('visual')}
            >
                <label className="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg border border-slate-700/50 cursor-pointer hover:bg-slate-800 transition-colors">
                    <span className="text-xs font-medium text-slate-300">Bounding Box Overlay</span>
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

            {/* 5. ACTORS SECTION */}
            <SidebarSection 
                id="actors" 
                title="Actors (VisDrone)" 
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
            customAssets={customModels}
         />
      </main>

    </div>
  );
};

export default App;