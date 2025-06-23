import React from 'react';
import { Card, CardContent } from './ui/card';

export default function InfoPanel() {
  return (
    <Card className="
      w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-xl p-6
      shadow-2xl shadow-black/50 hidden md:block transform transition-transform duration-200 ease-out
    "> {/* <<< PERUBAHAN STYLING CARD */}
      <CardContent className="p-0 space-y-5"> {/* <<< PERUBAHAN SPACING */}
        <h2 className="text-xl font-bold text-white mb-3 text-center tracking-wide drop-shadow-md">Petunjuk Penggunaan</h2> {/* <<< PERUBAHAN HEADING */}
        <div className="space-y-4 text-sm text-gray-300"> {/* <<< PERUBAHAN SPACING & WARNA TEKS */}
          <p>
            Masukkan persamaan linear satu per satu. Format umum adalah: <br/>
            <code className="bg-gray-800 text-teal-300 p-1 rounded font-mono block mt-2">KoefisienX x + KoefisienY y = Konstanta</code> {/* <<< PERUBAHAN STYLING CODE */}
          </p>
          <p>
            <span className="font-semibold text-white">Contoh:</span> <br/>
            <code className="bg-gray-800 text-teal-300 p-1 rounded block mt-1">2x + 3y = 7</code> <br/>
            <code className="bg-gray-800 text-teal-300 p-1 rounded block mt-1">1.5x - 0.5y + 2z = 10</code>
          </p>
          <p>
            <span className="font-semibold text-white">Aturan Input:</span>
            <ul className="list-disc list-inside ml-2 mt-2 space-y-2"> {/* <<< PERUBAHAN SPACING */}
              <li>Untuk koefisien 1 atau -1, cukup ketik `x` atau `-x`.</li>
              <li>Gunakan tombol variabel yang tersedia untuk memasukkan variabel.</li>
              <li>Anda bisa menggunakan `*` (kali), contoh: `2 * x`.</li>
              <li>Gunakan tombol `ENTER` setelah setiap persamaan.</li>
              <li>Tekan `SOLVE` setelah semua persamaan dimasukkan.</li>
            </ul>
          </p>
          <p className="text-xs text-gray-500 mt-5 border-t border-gray-700 pt-4"> {/* <<< PERUBAHAN SPACING & BORDER */}
            Aplikasi ini mendukung sistem hingga 10 variabel dan 10 persamaan.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}