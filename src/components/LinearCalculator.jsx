import { useState } from "react"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Calculator, Zap } from "lucide-react"

export default function LinearCalculator() {
  const [mode, setMode] = useState("2D")
  const [currentEquation, setCurrentEquation] = useState(0)
  const [equations, setEquations] = useState([
    { coefficients: [], constant: 0, display: "" },
    { coefficients: [], constant: 0, display: "" },
  ])
  const [display, setDisplay] = useState("")
  const [result, setResult] = useState("")
  const [inputMode, setInputMode] = useState("coefficient")
  const [currentVariable, setCurrentVariable] = useState(0)

  const initializeEquations = (is3D) => {
    const numEquations = is3D ? 3 : 2
    const numVariables = is3D ? 3 : 2
    setEquations(
      Array(numEquations)
        .fill(null)
        .map(() => ({
          coefficients: Array(numVariables).fill(0),
          constant: 0,
          display: "",
        }))
    )
    setCurrentEquation(0)
    setCurrentVariable(0)
    setDisplay("")
    setResult("")
  }

  const toggleMode = () => {
    const newMode = mode === "2D" ? "3D" : "2D"
    setMode(newMode)
    initializeEquations(newMode === "3D")
  }

  const handleNumber = (num) => {
    setDisplay((prev) => prev + num)
  }

  const handleVariable = (varIndex) => {
    setCurrentVariable(varIndex)
    setInputMode("coefficient")
    const varName = ["x", "y", "z"][varIndex]
    setDisplay((prev) => prev + varName)
  }

  const handleOperator = (op) => {
    if (op === "+" || op === "-") {
      setDisplay((prev) => prev + ` ${op} `)
    } else if (op === "=") {
      setDisplay((prev) => prev + " = ")
      setInputMode("constant")
    }
  }

  const handleEnter = () => {
    if (display.trim()) {
      const newEquations = [...equations]
      newEquations[currentEquation].display = display

      const parts = display.split("=")
      if (parts.length === 2) {
        newEquations[currentEquation].constant = Number.parseFloat(parts[1].trim()) || 0
        const leftSide = parts[0].trim()
        const coeffs = Array(mode === "3D" ? 3 : 2).fill(0)

        const xMatch = leftSide.match(/([+-]?\d*\.?\d*)x/)
        const yMatch = leftSide.match(/([+-]?\d*\.?\d*)y/)
        const zMatch = leftSide.match(/([+-]?\d*\.?\d*)z/)

        if (xMatch) coeffs[0] = Number.parseFloat(xMatch[1] || "1")
        if (yMatch) coeffs[1] = Number.parseFloat(yMatch[1] || "1")
        if (zMatch && mode === "3D") coeffs[2] = Number.parseFloat(zMatch[1] || "1")

        newEquations[currentEquation].coefficients = coeffs
      }

      setEquations(newEquations)

      if (currentEquation < equations.length - 1) {
        setCurrentEquation(currentEquation + 1)
      }

      setDisplay("")
      setInputMode("coefficient")
      setCurrentVariable(0)
    }
  }

  const solve = () => {
    if (mode === "2D") solve2D()
    else solve3D()
  }

  const solve2D = () => {
    const [eq1, eq2] = equations
    const [a1, b1] = eq1.coefficients
    const [a2, b2] = eq2.coefficients
    const c1 = eq1.constant
    const c2 = eq2.constant

    const determinant = a1 * b2 - a2 * b1

    if (Math.abs(determinant) < 1e-10) {
      setResult("Tidak ada solusi unik")
    } else {
      const x = (c1 * b2 - c2 * b1) / determinant
      const y = (a1 * c2 - a2 * c1) / determinant
      setResult(`x = ${x.toFixed(4)}, y = ${y.toFixed(4)}`)
    }
  }

  const solve3D = () => {
    const matrix = equations.map((eq) => [...eq.coefficients, eq.constant])
    for (let i = 0; i < 3; i++) {
      let maxRow = i
      for (let k = i + 1; k < 3; k++) {
        if (Math.abs(matrix[k][i]) > Math.abs(matrix[maxRow][i])) {
          maxRow = k
        }
      }
      ;[matrix[i], matrix[maxRow]] = [matrix[maxRow], matrix[i]]
      for (let k = i + 1; k < 3; k++) {
        if (Math.abs(matrix[i][i]) < 1e-10) continue
        const c = matrix[k][i] / matrix[i][i]
        for (let j = i; j < 4; j++) {
          if (i === j) matrix[k][j] = 0
          else matrix[k][j] -= c * matrix[i][j]
        }
      }
    }

    const solution = [0, 0, 0]
    for (let i = 2; i >= 0; i--) {
      if (Math.abs(matrix[i][i]) < 1e-10) {
        setResult("Tidak ada solusi unik")
        return
      }
      solution[i] = matrix[i][3] / matrix[i][i]
      for (let k = i - 1; k >= 0; k--) {
        matrix[k][3] -= matrix[k][i] * solution[i]
      }
    }

    setResult(`x = ${solution[0].toFixed(4)}, y = ${solution[1].toFixed(4)}, z = ${solution[2].toFixed(4)}`)
  }

  const clear = () => setDisplay("")
  const clearAll = () => {
    initializeEquations(mode === "3D")
    setResult("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 flex items-center justify-center">
      <Card className="w-full max-w-md bg-gray-900 border-gray-700 shadow-2xl">
        <CardContent className="p-6">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Calculator className="h-6 w-6 text-blue-400" />
              <h1 className="text-lg font-bold text-white">Linear Calc</h1>
            </div>
            <Button
              onClick={toggleMode}
              className="bg-blue-600 hover:bg-blue-700 text-white border-blue-500"
            >
              Mode: {mode}
            </Button>
          </div>

          <div className="bg-black rounded-lg p-4 mb-4 min-h-[120px]">
            <div className="text-green-400 font-mono text-sm mb-2">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary" className="text-xs">
                  Eq {currentEquation + 1}/{equations.length}
                </Badge>
                {inputMode === "constant" && (
                  <Badge variant="outline" className="text-xs text-yellow-400 border-yellow-400">
                    Konstanta
                  </Badge>
                )}
              </div>
              <div className="min-h-[20px]">{display || "Masukkan persamaan..."}</div>
            </div>
            <div className="text-blue-300 text-xs space-y-1">
              {equations.map(
                (eq, idx) =>
                  eq.display && (
                    <div key={idx} className="opacity-70">
                      {idx + 1}: {eq.display}
                    </div>
                  )
              )}
            </div>
            {result && (
              <div className="text-yellow-400 font-mono text-sm mt-2 pt-2 border-t border-gray-700">
                <Zap className="h-4 w-4 inline mr-1" />
                {result}
              </div>
            )}
          </div>

          <div className="grid grid-cols-4 gap-2">
            <Button onClick={clearAll} className="bg-red-600 hover:bg-red-700 text-white font-bold">AC</Button>
            <Button onClick={clear} className="bg-orange-600 hover:bg-orange-700 text-white font-bold">C</Button>
            <Button onClick={() => handleVariable(0)} className="bg-purple-600 text-white font-bold">x</Button>
            <Button onClick={() => handleVariable(1)} className="bg-purple-600 text-white font-bold">y</Button>

            {[..."789"].map(n => (
              <Button key={n} onClick={() => handleNumber(n)} className="bg-gray-700 text-white font-bold">{n}</Button>
            ))}
            <Button onClick={() => handleOperator("+")} className="bg-blue-600 text-white font-bold">+</Button>

            {[..."456"].map(n => (
              <Button key={n} onClick={() => handleNumber(n)} className="bg-gray-700 text-white font-bold">{n}</Button>
            ))}
            <Button onClick={() => handleOperator("-")} className="bg-blue-600 text-white font-bold">-</Button>

            {[..."123"].map(n => (
              <Button key={n} onClick={() => handleNumber(n)} className="bg-gray-700 text-white font-bold">{n}</Button>
            ))}
            {mode === "3D" ? (
              <Button onClick={() => handleVariable(2)} className="bg-purple-600 text-white font-bold">z</Button>
            ) : (
              <Button onClick={() => handleOperator("=")} className="bg-green-600 text-white font-bold">=</Button>
            )}

            <Button onClick={() => handleNumber("0")} className="bg-gray-700 text-white font-bold col-span-2">0</Button>
            <Button onClick={() => handleNumber(".")} className="bg-gray-700 text-white font-bold">.</Button>
            {mode === "3D" ? (
              <Button onClick={() => handleOperator("=")} className="bg-green-600 text-white font-bold">=</Button>
            ) : (
              <Button onClick={handleEnter} className="bg-indigo-600 text-white font-bold">↵</Button>
            )}

            <Button onClick={handleEnter} className="bg-indigo-600 text-white font-bold col-span-2">ENTER</Button>
            <Button onClick={solve} className="bg-yellow-600 text-white font-bold col-span-2">SOLVE</Button>
          </div>

          <div className="mt-4 text-xs text-gray-400 text-center">
            <p>Masukkan: koefisien → variabel → operator → konstanta</p>
            <p>Contoh: 2x + 3y = 7</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
