import React, { useState } from 'react';
import { Activity, Box, Map, TreePine, Building2, Truck, User, RotateCcw } from 'lucide-react';
import { EnvironmentType, ActorCategory } from './types';
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

const App: React.FC = () => {
  const [environment, setEnvironment] = useState<EnvironmentType>(EnvironmentType.URBAN);
  const [actorCounts, setActorCounts] = useState<Record<ActorCategory, number>>(INITIAL_COUNTS);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(false);

  const handleCountChange = (category: ActorCategory, value: number) => {
    setActorCounts(prev => ({
      ...prev,
      [category]: Math.max(0, Math.min(50, value)) // Limit between 0 and 50
    }));
  };

  const resetCounts = () => setActorCounts(INITIAL_COUNTS);

  return (
    <div className="flex h-screen w-full bg-slate-900 overflow-hidden font-sans">
      
      {/* Sidebar Controls */}
      <aside className="w-80 flex-shrink-0 bg-slate-900 border-r border-slate-700 flex flex-col h-full text-slate-200 shadow-2xl z-10">
        <div className="p-5 border-b border-slate-700">
            <h1 className="text-2xl font-bold flex items-center gap-2 text-blue-400">
                <Activity className="w-6 h-6" />
                VisDrone Sim
            </h1>
            <p className="text-xs text-slate-500 mt-1">Generatore di scenari sintetici</p>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar">
            
            {/* Environment Selection */}
            <section>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                    <Map className="w-4 h-4" /> Scenario
                </h2>
                <div className="grid grid-cols-1 gap-2">
                    <button 
                        onClick={() => setEnvironment(EnvironmentType.URBAN)}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${environment === EnvironmentType.URBAN ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 hover:border-slate-500'}`}
                    >
                        <Building2 className="w-5 h-5" />
                        <div className="text-left">
                            <div className="font-medium">Mappa Urbana</div>
                            <div className="text-[10px] opacity-70">Quartiere a griglia con edifici</div>
                        </div>
                    </button>
                    
                    <button 
                        onClick={() => setEnvironment(EnvironmentType.COUNTRY)}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${environment === EnvironmentType.COUNTRY ? 'bg-green-600 border-green-500 text-white' : 'bg-slate-800 border-slate-700 hover:border-slate-500'}`}
                    >
                        <TreePine className="w-5 h-5" />
                        <div className="text-left">
                            <div className="font-medium">Paesino Campagna</div>
                            <div className="text-[10px] opacity-70">Strade irregolari e natura</div>
                        </div>
                    </button>

                    <button 
                        onClick={() => setEnvironment(EnvironmentType.WINTER)}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${environment === EnvironmentType.WINTER ? 'bg-indigo-500 border-indigo-400 text-white' : 'bg-slate-800 border-slate-700 hover:border-slate-500'}`}
                    >
                        <Box className="w-5 h-5" />
                        <div className="text-left">
                            <div className="font-medium">Paesaggio Invernale</div>
                            <div className="text-[10px] opacity-70">Rilievi ondulati e neve</div>
                        </div>
                    </button>
                </div>
            </section>

            {/* Overlays */}
            <section>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                    <Box className="w-4 h-4" /> Visualizzazione
                </h2>
                <label className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700 cursor-pointer hover:bg-slate-750">
                    <span className="text-sm font-medium">Overlay Bounding Box (YOLO)</span>
                    <div className="relative inline-block w-10 h-5 align-middle select-none transition duration-200 ease-in">
                        <input 
                            type="checkbox" 
                            name="toggle" 
                            id="toggle" 
                            checked={showBoundingBoxes}
                            onChange={(e) => setShowBoundingBoxes(e.target.checked)}
                            className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 right-5"
                        />
                        <label htmlFor="toggle" className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${showBoundingBoxes ? 'bg-blue-500' : 'bg-slate-600'}`}></label>
                    </div>
                </label>
            </section>

            {/* Actor Controls */}
            <section>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                        <User className="w-4 h-4" /> Attori (VisDrone)
                    </h2>
                    <button onClick={resetCounts} title="Reset" className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white">
                        <RotateCcw className="w-3 h-3" />
                    </button>
                </div>
                
                <div className="space-y-3 bg-slate-800/50 p-3 rounded-xl border border-slate-800">
                    {Object.keys(ACTOR_DEFINITIONS).map((key) => {
                        const cat = parseInt(key) as ActorCategory;
                        const def = ACTOR_DEFINITIONS[cat];
                        return (
                            <div key={cat} className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 flex-1">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: def.color }}></div>
                                    <span className="text-sm text-slate-300">{def.label}</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="20" 
                                    value={actorCounts[cat]} 
                                    onChange={(e) => handleCountChange(cat, parseInt(e.target.value))}
                                    className="w-20 h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                                <span className="text-xs font-mono w-6 text-right text-slate-400">{actorCounts[cat]}</span>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
        
        <div className="p-4 border-t border-slate-700 text-[10px] text-slate-600 text-center">
            Three.js React Simulator v1.0
        </div>
      </aside>

      {/* Main Canvas Area */}
      <main className="flex-1 relative h-full bg-black">
         <Scene 
            environment={environment} 
            actorCounts={actorCounts} 
            showBoundingBoxes={showBoundingBoxes} 
         />
      </main>

    </div>
  );
};

export default App;
