import React, { useMemo } from 'react';
import { Copy, Check, QrCode } from 'lucide-react';

interface BarcodeRendererProps {
  code?: string;
  type: 'CODE128' | 'QR' | 'NONE';
  height?: number;
  showText?: boolean;
}

export const BarcodeRenderer: React.FC<BarcodeRendererProps> = ({
  code = '',
  type,
  height = 54,
  showText = true,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate deterministic bar widths based on input string
  const bars = useMemo(() => {
    if (!code || (type !== 'CODE128' && type !== 'NONE')) return [];
    const hashValues: number[] = [];
    // Start bar pattern
    hashValues.push(2, 1, 1, 2, 3, 2);
    for (let i = 0; i < code.length; i++) {
      const charCode = code.charCodeAt(i);
      hashValues.push(
        (charCode % 3) + 1,
        ((charCode >> 1) % 3) + 1,
        ((charCode >> 2) % 3) + 1,
        ((charCode >> 3) % 2) + 1
      );
    }
    // End bar pattern
    hashValues.push(2, 3, 3, 1, 1, 1, 2);
    return hashValues;
  }, [code, type]);

  // Generate pseudo QR matrix for QR type
  const qrMatrix = useMemo(() => {
    if (!code || type !== 'QR') return null;
    const size = 17; // 17x17 grid
    const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
    
    // Corner finder patterns (7x7)
    const placeFinder = (r: number, c: number) => {
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
          if (
            i === 0 ||
            i === 6 ||
            j === 0 ||
            j === 6 ||
            (i >= 2 && i <= 4 && j >= 2 && j <= 4)
          ) {
            matrix[r + i][c + j] = true;
          }
        }
      }
    };
    placeFinder(0, 0);
    placeFinder(0, 10);
    placeFinder(10, 0);

    // Fill data bits deterministically from code
    let bitIdx = 0;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        // Skip finder zones
        if (
          (r < 8 && c < 8) ||
          (r < 8 && c >= 9) ||
          (r >= 9 && c < 8)
        ) {
          continue;
        }
        const char = code.charCodeAt(bitIdx % code.length);
        matrix[r][c] = ((char + r * 7 + c * 11) % 2 === 0);
        bitIdx++;
      }
    }
    return matrix;
  }, [code, type]);

  if (type === 'QR' && qrMatrix) {
    return (
      <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-stone-200 shadow-inner">
        <div className="relative group cursor-pointer" onClick={handleCopy}>
          <div className="grid grid-cols-17 gap-0.5 w-32 h-32 bg-white p-1">
            {qrMatrix.flat().map((filled, idx) => (
              <div
                key={idx}
                className={filled ? 'bg-stone-900 rounded-[0.5px]' : 'bg-transparent'}
              />
            ))}
          </div>
          <div className="absolute inset-0 bg-stone-900/10 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
            <span className="bg-stone-900 text-white text-xs px-2 py-1 rounded shadow flex items-center gap-1">
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy Code'}
            </span>
          </div>
        </div>
        {showText && (
          <div className="mt-2 text-center">
            <div className="font-mono text-sm tracking-wider font-semibold text-stone-800">
              {code}
            </div>
            <button
              onClick={handleCopy}
              type="button"
              className="mt-1 text-xs text-stone-500 hover:text-stone-800 flex items-center justify-center gap-1 mx-auto cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-700 font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Click to copy</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-2.5 bg-white rounded-xl border border-stone-200 shadow-inner">
      <div
        className="w-full flex justify-center items-end gap-[1.5px] overflow-hidden px-2 cursor-pointer group relative py-1"
        style={{ height: `${height}px` }}
        onClick={handleCopy}
        title="Click to copy code"
      >
        {bars.map((weight, idx) => {
          const isBar = idx % 2 === 0;
          return (
            <div
              key={idx}
              className={`${isBar ? 'bg-stone-900' : 'bg-transparent'}`}
              style={{
                width: `${weight * 2.2}px`,
                height: `${height}px`,
                minWidth: isBar ? '1px' : '1px',
              }}
            />
          );
        })}
        <div className="absolute inset-0 bg-stone-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
          <span className="bg-stone-900 text-white text-xs px-2 py-1 rounded shadow flex items-center gap-1 font-sans">
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy'}
          </span>
        </div>
      </div>
      {showText && (
        <div className="mt-1.5 flex items-center justify-between w-full px-2 text-xs font-mono text-stone-700">
          <span className="tracking-widest font-semibold text-center w-full">{code}</span>
          <button
            onClick={handleCopy}
            type="button"
            className="text-stone-400 hover:text-stone-700 cursor-pointer p-0.5"
            title="Copy code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}
    </div>
  );
};
