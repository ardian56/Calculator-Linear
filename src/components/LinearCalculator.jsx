import { useState, useEffect } from "react"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Calculator, Zap, Delete as DeleteIcon, CornerDownLeft } from "lucide-react"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Slider } from "./ui/slider"

export default function LinearCalculator() {
  const [numVariables, setNumVariables] = useState(2)
  const [numEquations, setNumEquations] = useState(2)
  const [equations, setEquations] = useState([])
  const [display, setDisplay] = useState("")
  const [result, setResult] = useState("")
  const [currentEquationIndex, setCurrentEquationIndex] = useState(0)
  const [inputMode, setInputMode] = useState("coefficient")

  const initializeEquations = (vars, eqs) => {
    setEquations(
      Array(eqs)
        .fill(null)
        .map(() => ({
          coefficients: Array(vars).fill(0),
          constant: 0,
          display: "",
        }))
    )
    setCurrentEquationIndex(0)
    setDisplay("")
    setResult("")
    setInputMode("coefficient")
  }

  useEffect(() => {
    initializeEquations(numVariables, numEquations)
  }, [numVariables, numEquations])

  const handleNumVariablesChange = (value) => {
    const newVars = Math.max(2, Math.min(10, value[0]));
    setNumVariables(newVars);
    initializeEquations(newVars, numEquations);
  }

  const handleNumEquationsChange = (value) => {
    const newEqs = Math.max(2, value[0]);
    setNumEquations(newEqs);
    initializeEquations(numVariables, newEqs);
  }

  const handleNumber = (num) => {
    setDisplay((prev) => prev + num)
  }

  const handleDelete = () => {
    setDisplay((prev) => prev.slice(0, -1));
  }

  const handleVariable = (varIndex) => {
    if (inputMode === "coefficient") {
      const varNames = ["x", "y", "z", "w", "v", "u", "p", "q", "r", "s"]
      if (varIndex < numVariables) {
        let prefix = ""
        const lastChar = display.slice(-1);
        if (display === "" || display.endsWith("+ ") || display.endsWith("- ") || display.endsWith("= ") || (isNaN(lastChar) && lastChar !== '.' && lastChar !== ' ')) {
            prefix = "1";
        } else {
            const trimmedDisplay = display.trim();
            const lastNonSpaceChar = trimmedDisplay.slice(-1);
            if (!isNaN(lastNonSpaceChar) && trimmedDisplay.length > 0) {
                prefix = "";
            } else {
                 prefix = "1";
            }
        }
        setDisplay((prev) => prev + (prefix.length > 0 ? prefix : "") + varNames[varIndex]);
      }
    }
  }

  const handleOperator = (op) => {
    if (op === "+" || op === "-") {
      setDisplay((prev) => prev + ` ${op} `)
    } else if (op === "=") {
      setDisplay((prev) => prev + " = ")
      setInputMode("constant")
    } else if (op === "*") {
        setDisplay((prev) => prev + ` * `);
    }
  }

  const parseEquation = (equationString, varsCount) => {
    const coeffs = Array(varsCount).fill(0);
    let constant = 0;

    const parts = equationString.split("=");
    if (parts.length !== 2) {
      return { coefficients: Array(varsCount).fill(NaN), constant: NaN };
    }

    const leftSide = parts[0].trim();
    const rightSide = parts[1].trim();

    constant = Number.parseFloat(rightSide) || 0;

    const varNames = ["x", "y", "z", "w", "v", "u", "p", "q", "r", "s"];
    const terms = leftSide.split(/(?=[+-])/).map(term => term.trim());

    terms.forEach(term => {
      if (!term) return;

      let sign = 1;
      if (term.startsWith('+')) {
        term = term.substring(1).trim();
      } else if (term.startsWith('-')) {
        sign = -1;
        term = term.substring(1).trim();
      }

      term = term.replace(/\s*\*\s*/g, '');

      for (let i = 0; i < varsCount; i++) {
        const varName = varNames[i];
        if (term.endsWith(varName)) {
          let coeffStr = term.substring(0, term.length - varName.length);
          if (coeffStr === "") {
            coeffs[i] += sign * 1;
          } else {
            coeffs[i] += sign * (Number.parseFloat(coeffStr) || 0);
          }
          return;
        }
      }
    });

    return { coefficients: coeffs, constant: constant };
  };

  const handleEnter = () => {
    if (display.trim()) {
      const newEquations = [...equations];
      newEquations[currentEquationIndex].display = display;

      const { coefficients, constant } = parseEquation(display, numVariables);

      if (coefficients.includes(NaN) || isNaN(constant)) {
        setResult("Error: Persamaan tidak valid. Pastikan format Ax + By = C.");
        setDisplay("");
        return;
      }

      newEquations[currentEquationIndex].coefficients = coefficients;
      newEquations[currentEquationIndex].constant = constant;

      setEquations(newEquations);

      if (currentEquationIndex < numEquations - 1) {
        setCurrentEquationIndex(currentEquationIndex + 1);
      }

      setDisplay("");
      setInputMode("coefficient");
    }
  };

  const gaussianElimination = (matrix) => {
    const numRows = matrix.length;
    const numCols = matrix[0].length;

    for (let i = 0; i < numRows; i++) {
      let maxRow = i;
      for (let k = i + 1; k < numRows; k++) {
        if (Math.abs(matrix[k][i]) > Math.abs(matrix[maxRow][i])) {
          maxRow = k;
        }
      }
      [matrix[i], matrix[maxRow]] = [matrix[maxRow], matrix[i]];

      if (Math.abs(matrix[i][i]) < 1e-9) {
        continue;
      }

      for (let k = i + 1; k < numRows; k++) {
        const factor = matrix[k][i] / matrix[i][i];
        for (let j = i; j < numCols; j++) {
          matrix[k][j] -= factor * matrix[i][j];
        }
      }
    }

    for (let i = numRows - 1; i >= 0; i--) {
        let allZerosCoeff = true;
        for (let j = 0; j < numCols - 1; j++) {
            if (Math.abs(matrix[i][j]) > 1e-9) {
                allZerosCoeff = false;
                break;
            }
        }
        if (allZerosCoeff && Math.abs(matrix[i][numCols - 1]) > 1e-9) {
            return { status: "no solution" };
        }
    }

    for (let i = numRows - 1; i >= 0; i--) {
        let pivotCol = -1;
        for (let j = 0; j < numCols - 1; j++) {
            if (Math.abs(matrix[i][j]) > 1e-9) {
                pivotCol = j;
                break;
            }
        }

        if (pivotCol !== -1) {
            const pivot = matrix[i][pivotCol];
            for (let j = pivotCol; j < numCols; j++) {
                matrix[i][j] /= pivot;
            }

            for (let k = 0; k < numRows; k++) {
                if (k !== i) {
                    const factor = matrix[k][pivotCol];
                    for (let j = pivotCol; j < numCols; j++) {
                        matrix[k][j] -= factor * matrix[i][j];
                    }
                }
            }
        }
    }

    const rank = matrix.filter(row => row.slice(0, numCols - 1).some(coeff => Math.abs(coeff) > 1e-9)).length;

    if (rank < numVariables) {
        return { status: "infinitely many solutions", matrix: matrix };
    } else if (rank === numVariables) {
        const solution = Array(numVariables).fill(0);
        for (let i = 0; i < numVariables; i++) {
            solution[i] = matrix[i][numCols - 1];
        }
        return { status: "unique solution", solution: solution };
    } else {
        return { status: "error", message: "Unexpected matrix state." };
    }
  };

  const solve = () => {
    if (numEquations < numVariables) {
        setResult("Tidak ada solusi unik. Jumlah persamaan kurang dari jumlah variabel.");
        return;
    }
    
    const allEquationsEntered = equations.every(eq => eq.display.length > 0);
    if (!allEquationsEntered) {
        setResult("Harap masukkan semua persamaan sebelum memecahkan.");
        return;
    }

    const augmentedMatrix = equations.map((eq) => [
      ...eq.coefficients,
      eq.constant,
    ]);

    const matrixForCalculation = augmentedMatrix.map(row => [...row]);

    const { status, solution, matrix, message } = gaussianElimination(matrixForCalculation);

    const varNames = ["x", "y", "z", "w", "v", "u", "p", "q", "r", "s"];

    if (status === "unique solution") {
      const solutionString = solution
        .map((val, idx) => `${varNames[idx]} = ${val.toFixed(4)}`)
        .join(", ");
      setResult(solutionString);
    } else if (status === "no solution") {
      setResult("Sistem tidak memiliki solusi (inkonsisten).");
    } else if (status === "infinitely many solutions") {
        let resultString = "Sistem memiliki solusi tak hingga banyaknya.";
        setResult(resultString);
    } else if (status === "error") {
        setResult(`Terjadi kesalahan: ${message}`);
    } else {
      setResult("Terjadi kesalahan yang tidak terduga saat memecahkan sistem.");
    }
  };

  const clear = () => setDisplay("")
  const clearAll = () => {
    initializeEquations(numVariables, numEquations)
    setResult("")
  }

  const variableButtons = Array.from({ length: numVariables }, (_, i) => {
    const varName = ["x", "y", "z", "w", "v", "u", "p", "q", "r", "s"][i]
    return (
      <Button
        key={varName}
        onClick={() => handleVariable(i)}
        className="
          bg-purple-700 hover:bg-purple-600 active:bg-purple-800 text-white font-bold
          transform transition-all duration-150 ease-out active:scale-95
          shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75
          rounded-lg
        " // <<< PERUBAHAN STYLING TOMBOL VARIABEL
      >
        {varName}
      </Button>
    )
  })

  return (
    <Card className="
      w-full max-w-xl bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden
      shadow-2xl shadow-black/50 transform transition-transform duration-200 ease-out
    "> {/* <<< PERUBAHAN STYLING CARD KESELURUHAN */}
      <CardContent className="p-6 space-y-6"> {/* <<< PERUBAHAN PADDING & SPACING UTAMA */}
        <div className="text-center space-y-4"> {/* <<< PERUBAHAN SPACING */}
          <div className="flex items-center justify-center gap-3"> {/* <<< PERUBAHAN SPACING */}
            <Calculator className="h-8 w-8 text-teal-400 drop-shadow-md" /> {/* <<< PERUBAHAN IKON DAN SHADOW */}
            <h1 className="text-2xl font-extrabold text-white tracking-wide drop-shadow-md">Sistem Persamaan Linear</h1> {/* <<< PERUBAHAN HEADING */}
          </div>
          
          <div className="flex flex-col gap-6"> {/* <<< PERUBAHAN SPACING */}
            <div className="flex flex-col items-center">
              <Label htmlFor="numVarsSlider" className="text-gray-300 text-base font-semibold mb-2"> {/* <<< PERUBAHAN FONT */}
                Jumlah Variabel: <span className="font-bold text-xl text-blue-300">{numVariables}</span> {/* <<< PERUBAHAN WARNA ANGKA */}
              </Label>
              <Slider
                id="numVarsSlider"
                defaultValue={[numVariables]}
                max={10}
                min={2}
                step={1}
                onValueChange={handleNumVariablesChange}
                className="w-full max-w-xs [&>span:first-child]:bg-blue-600 [&>span:last-child]:bg-blue-400" // <<< STYLING SLIDER BAR
              />
            </div>
            <div className="flex flex-col items-center">
              <Label htmlFor="numEqsSlider" className="text-gray-300 text-base font-semibold mb-2"> {/* <<< PERUBAHAN FONT */}
                Jumlah Persamaan: <span className="font-bold text-xl text-blue-300">{numEquations}</span> {/* <<< PERUBAHAN WARNA ANGKA */}
              </Label>
              <Slider
                id="numEqsSlider"
                defaultValue={[numEquations]}
                max={10} 
                min={2}
                step={1}
                onValueChange={handleNumEquationsChange}
                className="w-full max-w-xs [&>span:first-child]:bg-blue-600 [&>span:last-child]:bg-blue-400" // <<< STYLING SLIDER BAR
              />
            </div>
          </div>
        </div>

        <div className="
          bg-zinc-800 rounded-lg p-5 mb-4 min-h-[120px] border border-gray-700
          shadow-md shadow-black/40 flex flex-col justify-between
        "> {/* <<< PERUBAHAN STYLING DISPLAY AREA */}
          <div className="text-green-400 font-mono text-sm mb-2">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="bg-gray-700 text-gray-200 border-gray-600 px-3 py-1 rounded-full text-xs font-medium"> {/* <<< STYLING BADGE */}
                Eq {currentEquationIndex + 1}/{numEquations}
              </Badge>
              {inputMode === "constant" && (
                <Badge variant="outline" className="text-xs text-yellow-300 border-yellow-700 bg-yellow-900/30 px-3 py-1 rounded-full font-medium"> {/* <<< STYLING BADGE */}
                  Konstanta
                </Badge>
              )}
            </div>
            <div className="min-h-[20px] text-xl text-white break-words mt-2"> {/* <<< PERUBAHAN FONT DISPLAY */}
              {display || "Masukkan persamaan..."}
            </div>
          </div>
          <div className="text-blue-300 text-xs space-y-1 mt-3 pt-3 border-t border-gray-800"> {/* <<< PERUBAHAN SPACING & BORDER */}
            {equations.map(
              (eq, idx) =>
                eq.display && (
                  <div key={idx} className="opacity-80 text-[0.7rem] leading-tight"> {/* <<< PERUBAHAN FONT UKURAN */}
                    {idx + 1}: {eq.display}
                  </div>
                )
            )}
          </div>
          {result && (
            <div className="text-yellow-400 font-mono text-base mt-4 pt-3 border-t border-gray-700 font-semibold"> {/* <<< PERUBAHAN FONT RESULT */}
              <Zap className="h-5 w-5 inline mr-2 text-orange-400" />
              {result}
            </div>
          )}
        </div>

        <div className="grid grid-cols-4 gap-2"> {/* <<< PERTANDA KONSISTENSI GRID */}
          {/* Tombol variabel dinamis di sini */}
          <div className="col-span-4 grid grid-cols-5 gap-2 mb-3"> {/* <<< PERUBAHAN SPACING */}
              {variableButtons}
          </div>

          {/* Top row buttons (AC, C, DEL, *) */}
          <Button className="
            bg-red-700 hover:bg-red-600 active:bg-red-800 text-white font-bold
            transform transition-all duration-150 ease-out active:scale-95
            shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75
            rounded-lg
          ">AC</Button> {/* <<< PERUBAHAN STYLING */}
          <Button onClick={clear} className="
            bg-orange-700 hover:bg-orange-600 active:bg-orange-800 text-white font-bold
            transform transition-all duration-150 ease-out active:scale-95
            shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-75
            rounded-lg
          ">C</Button> {/* <<< PERUBAHAN STYLING */}
          <Button onClick={handleDelete} className="
            bg-gray-700 hover:bg-gray-600 active:bg-gray-800 text-white font-bold
            transform transition-all duration-150 ease-out active:scale-95
            shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75
            rounded-lg
            flex items-center justify-center /* <<< Tambahkan ini */
          ">
            <DeleteIcon className="h-5 w-5" />
          </Button>
          <Button onClick={() => handleOperator("*")} className="
            bg-blue-700 hover:bg-blue-600 active:bg-blue-800 text-white font-bold text-xl
            transform transition-all duration-150 ease-out active:scale-95
            shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75
            rounded-lg
          ">×</Button> {/* <<< PERUBAHAN STYLING */}


          {[..."789"].map(n => (
            <Button key={n} onClick={() => handleNumber(n)} className="
              bg-gray-800 hover:bg-gray-700 active:bg-gray-900 text-white font-bold text-lg
              transform transition-all duration-150 ease-out active:scale-95
              shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75
              rounded-lg
            ">{n}</Button> // <<< PERUBAHAN STYLING
          ))}
          <Button onClick={() => handleOperator("+")} className="
            bg-blue-700 hover:bg-blue-600 active:bg-blue-800 text-white font-bold text-xl
            transform transition-all duration-150 ease-out active:scale-95
            shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75
            rounded-lg
          ">+</Button> 

          {[..."456"].map(n => (
            <Button key={n} onClick={() => handleNumber(n)} className="
              bg-gray-800 hover:bg-gray-700 active:bg-gray-900 text-white font-bold text-lg
              transform transition-all duration-150 ease-out active:scale-95
              shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75
              rounded-lg
            ">{n}</Button> // <<< PERUBAHAN STYLING
          ))}
          <Button onClick={() => handleOperator("-")} className="
            bg-blue-700 hover:bg-blue-600 active:bg-blue-800 text-white font-bold text-xl
            transform transition-all duration-150 ease-out active:scale-95
            shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75
            rounded-lg
          ">-</Button> 

          {[..."123"].map(n => (
            <Button key={n} onClick={() => handleNumber(n)} className="
              bg-gray-800 hover:bg-gray-700 active:bg-gray-900 text-white font-bold text-lg
              transform transition-all duration-150 ease-out active:scale-95
              shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75
              rounded-lg
            ">{n}</Button> // <<< PERUBAHAN STYLING
          ))}
          <Button onClick={() => handleOperator("=")} className="
            bg-green-700 hover:bg-green-600 active:bg-green-800 text-white font-bold text-xl
            transform transition-all duration-150 ease-out active:scale-95
            shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75
            rounded-lg
          ">=</Button> 

          <Button onClick={() => handleNumber("0")} className="
            bg-gray-800 hover:bg-gray-700 active:bg-gray-900 text-white font-bold text-lg col-span-2
            transform transition-all duration-150 ease-out active:scale-95
            shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75
            rounded-lg
          ">0</Button> {/* <<< PERUBAHAN STYLING */}
          <Button onClick={() => handleNumber(".")} className="
            bg-gray-800 hover:bg-gray-700 active:bg-gray-900 text-white font-bold text-lg
            transform transition-all duration-150 ease-out active:scale-95
            shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75
            rounded-lg
          ">.</Button> {/* <<< PERUBAHAN STYLING */}
          <Button onClick={handleEnter} className="
            bg-indigo-700 hover:bg-indigo-600 active:bg-indigo-800 text-white font-bold text-lg
            transform transition-all duration-150 ease-out active:scale-95
            shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75
            rounded-lg
            flex items-center justify-center /* <<< Tambahkan ini */
          ">
            <CornerDownLeft className="h-6 w-6" />
          </Button>
          <Button onClick={solve} className="
            bg-yellow-700 hover:bg-yellow-600 active:bg-yellow-800 text-white font-bold text-xl col-span-4 mt-3
            transform transition-all duration-150 ease-out active:scale-95
            shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75
            rounded-lg
          ">SOLVE</Button> {/* <<< PERUBAHAN STYLING */}
        </div>
      </CardContent>
    </Card>
  )
}