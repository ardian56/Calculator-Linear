import React from 'react';
import LinearCalculator from './components/LinearCalculator'; // Pastikan path ini benar
import InfoPanel from './components/InfoPanel';   // Pastikan path ini benar

function App() {
  return (
    // Background gradient untuk seluruh halaman
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 flex items-center justify-center">
      
      <div className="flex flex-col md:flex-row-reverse items-center md:items-start justify-center gap-6 w-full max-w-screen-2xl mx-auto">

        <InfoPanel />

        <LinearCalculator />

      </div>
    </div>
  );
}

export default App;