"use client";
import React from "react";
export default function TextAreaZpl() {
  const [multipleZpl, setMultipleZpl] = React.useState<string[]>([]);
  const [zpl, setZpl] = React.useState<string>("");

  function splitZplLabels(zplText: string): string[] {
    // Dividir por ^XA y filtrar strings vacíos
    const parts = zplText.split(/\^XA/i).filter((part) => part.trim() !== "");

    // Agregar ^XA al inicio de cada parte (excepto si ya lo tiene)
    const labels = parts.map((part) => {
      const trimmed = part.trim();
      if (trimmed.startsWith("^XA")) {
        return trimmed;
      }
      return "^XA" + trimmed;
    });

    return labels.filter((label) => label.length > 3); // Filtrar etiquetas muy cortas
  }

  function agregarEtiquetas() {
    const etiquetas = splitZplLabels(zpl);
    setMultipleZpl([...multipleZpl, ...etiquetas]);
    setZpl("");
  }

  async function generarEtiqueta() {
    for (let i = 0; i < multipleZpl.length; i++) {
      const zpl = multipleZpl[i];

      try {
        const response = await fetch("/api/labelary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ zpl }),
        });

        if (!response.ok) {
          console.error(`Error en etiqueta ${i + 1}:`, response.statusText);
          continue;
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        // Mostrar o descargar la imagen
        const link = document.createElement("a");
        link.href = url;
        link.download = `etiqueta_${i + 1}.png`;
        link.click();

        // Delay de 1 segundo entre requests para evitar rate limiting
        if (i < multipleZpl.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Error procesando etiqueta ${i + 1}:`, error);
      }
    }
  }
  return (
    <>
      <div className="flex justify-between mb-4 items-center gap-3">
        <div className="flex gap-4">
          <p>Cantidad de etiquetas: {multipleZpl.length}</p>
          {zpl && (
            <p className="text-blue-600">
              Etiquetas detectadas en el ZPL: {splitZplLabels(zpl).length}
            </p>
          )}
        </div>
        <button
          className="text-red-500 rounded bg-amber-50 p-2"
          onClick={() => setMultipleZpl([])}
        >
          Eliminar todas
        </button>
      </div>
      <textarea
        className="w-full h-64 p-4 border border-zinc-300 rounded-md"
        placeholder="Escribe tu código ZPL aquí..."
        value={zpl}
        onChange={(e) => setZpl(e.target.value)}
      />
      <div className="flex gap-2">
        <button
          onClick={agregarEtiquetas}
          className="inline-block rounded bg-green-500 px-4 py-2 text-white"
        >
          Sumar etiqueta(s)
        </button>
        <button
          onClick={generarEtiqueta}
          className="inline-block rounded bg-blue-500 px-4 py-2 text-white"
        >
          Descargar Etiqueta
        </button>
      </div>
    </>
  );
}
