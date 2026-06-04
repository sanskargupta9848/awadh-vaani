import React from 'react';

const Settings = () => {
  return (
    <div className="max-w-3xl mx-auto animate-fadeIn">
      <h2 className="text-3xl font-tiro text-saffron mb-8">Settings & Preferences</h2>
      
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-marigold/10 overflow-hidden">
        {/* Account Section */}
        <div className="p-8 border-b border-ivory">
          <h3 className="font-bold text-forest mb-4 uppercase text-xs tracking-widest">App Preferences</h3>
          <div className="space-y-6">
            <ToggleOption title="Primary Script" desc="Toggle between Devanagari (लौकी) and Roman (Lauki)" active="Devanagari" />
            <ToggleOption title="High Contrast Mode" desc="Better visibility for outdoor usage" active="Off" />
            <ToggleOption title="Daily Reminders" desc="Get a notification at 10:00 AM" active="On" />
          </div>
        </div>

        {/* Language Section */}
        <div className="p-8 bg-ivory/30">
          <h3 className="font-bold text-forest mb-4 uppercase text-xs tracking-widest">Language Source</h3>
          <div className="flex gap-4">
            <button className="flex-1 bg-white border-2 border-saffron p-4 rounded-2xl text-center">
              <p className="font-bold text-saffron">Hindi → Awadhi</p>
            </button>
            <button className="flex-1 bg-white border border-marigold/20 p-4 rounded-2xl text-center opacity-50">
              <p className="font-bold text-slate-400">English → Awadhi</p>
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="p-8">
           <button className="text-red-400 text-sm font-bold hover:underline">Reset All Learning Progress</button>
        </div>
      </div>
    </div>
  );
};

const ToggleOption = ({ title, desc, active }) => (
  <div className="flex justify-between items-center">
    <div>
      <p className="font-bold text-slate-800">{title}</p>
      <p className="text-xs text-slate-500">{desc}</p>
    </div>
    <button className={`px-4 py-1 rounded-full text-xs font-bold ${active === 'On' || active === 'Devanagari' ? 'bg-forest text-white' : 'bg-slate-200 text-slate-500'}`}>
      {active}
    </button>
  </div>
);

export default Settings;