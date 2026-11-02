import React from 'react';
import { PlayerProfile, StoreUpgrade, UpgradeId } from '../types/game';
import { INITIAL_UPGRADES, calculateUpgradeCost, getUpgradeBenefits } from '../game/profileManager';
import { X, Crosshair, Shield, Magnet, Zap, Feather, Flame, Coins, Check } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface StoreModalProps {
  profile: PlayerProfile;
  onUpgradePurchased: (id: UpgradeId, newLevel: number, newCredits: number) => void;
  onClose: () => void;
}

export const StoreModal: React.FC<StoreModalProps> = ({
  profile,
  onUpgradePurchased,
  onClose,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Crosshair': return <Crosshair className="w-5 h-5 text-cyan-400" />;
      case 'Shield': return <Shield className="w-5 h-5 text-blue-400" />;
      case 'Magnet': return <Magnet className="w-5 h-5 text-amber-400" />;
      case 'Zap': return <Zap className="w-5 h-5 text-emerald-400" />;
      case 'Feather': return <Feather className="w-5 h-5 text-purple-400" />;
      case 'Flame': return <Flame className="w-5 h-5 text-rose-400" />;
      default: return <Zap className="w-5 h-5 text-cyan-400" />;
    }
  };

  const handleBuy = (upgrade: StoreUpgrade, currentLvl: number) => {
    const cost = calculateUpgradeCost(upgrade, currentLvl);
    if (profile.credits < cost || currentLvl >= upgrade.maxLevel) return;

    const nextLvl = currentLvl + 1;
    const remainingCredits = profile.credits - cost;
    soundEngine.playStorePurchase();
    onUpgradePurchased(upgrade.id, nextLvl, remainingCredits);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <div className="text-[11px] font-arcade uppercase tracking-widest text-cyan-400">
              HANGAR DEPOT & WEAPON TECH
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-arcade text-white tracking-wide">
              FLIGHT UPGRADE STORE
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Credits Counter */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-amber-500/40 bg-amber-950/30">
              <Coins className="w-4 h-4 text-amber-400 animate-pulse" />
              <span className="text-sm font-telemetry font-bold text-amber-300">
                {profile.credits}
              </span>
              <span className="text-[10px] text-amber-400/80 uppercase font-arcade">CREDITS</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Upgrade Cards Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {INITIAL_UPGRADES.map((upgrade) => {
            const currentLvl = profile.upgrades[upgrade.id] || 0;
            const isMax = currentLvl >= upgrade.maxLevel;
            const cost = calculateUpgradeCost(upgrade, currentLvl);
            const canAfford = profile.credits >= cost && !isMax;
            const benefits = getUpgradeBenefits(upgrade.id, currentLvl);

            return (
              <div
                key={upgrade.id}
                className="p-4 rounded-lg border border-slate-800 bg-slate-950/60 flex flex-col justify-between hover:border-slate-700 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        {getIcon(upgrade.iconName)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold font-arcade text-white">
                          {upgrade.name}
                        </h4>
                        {/* Level Pips */}
                        <div className="flex items-center gap-1 mt-0.5">
                          {Array.from({ length: upgrade.maxLevel }).map((_, idx) => (
                            <span
                              key={idx}
                              className={`w-3.5 h-1.5 rounded-sm ${
                                idx < currentLvl
                                  ? 'bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.6)]'
                                  : 'bg-slate-800'
                              }`}
                            />
                          ))}
                          <span className="text-[10px] text-slate-400 ml-1 font-telemetry">
                            {isMax ? 'MAX' : `LV ${currentLvl}/${upgrade.maxLevel}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {upgrade.description}
                  </p>

                  <div className="mt-3 p-2.5 rounded bg-slate-900/80 border border-slate-800/80 text-[11px] space-y-1">
                    <div className="text-slate-300">
                      <span className="text-slate-500 font-arcade">CURRENT: </span>
                      <span className="font-medium text-cyan-300">{benefits.current}</span>
                    </div>
                    {!isMax && (
                      <div className="text-emerald-300">
                        <span className="text-slate-500 font-arcade">UPGRADE: </span>
                        <span className="font-medium">{benefits.next}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="text-xs">
                    {isMax ? (
                      <span className="text-slate-500 font-arcade">SYSTEM MAXED</span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <Coins className="w-3.5 h-3.5 text-amber-400" />
                        <span className="font-telemetry font-bold text-amber-300 text-sm">{cost}</span>
                        <span className="text-[10px] text-slate-500 font-arcade">CREDITS</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleBuy(upgrade, currentLvl)}
                    disabled={!canAfford}
                    className={`px-4 py-1.5 rounded-lg text-xs font-arcade font-bold transition-all flex items-center gap-1.5 ${
                      isMax
                        ? 'bg-slate-800/60 text-slate-500 cursor-not-allowed border border-slate-700/50'
                        : canAfford
                        ? 'bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-slate-950 shadow-[0_0_14px_rgba(6,182,212,0.4)] cursor-pointer'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {isMax ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>INSTALLED</span>
                      </>
                    ) : (
                      <span>UPGRADE</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info banner */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400 font-telemetry">
          <span>Earn credits by vaporizing obstacles, clearing gates, and completing trophies.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-arcade uppercase transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
