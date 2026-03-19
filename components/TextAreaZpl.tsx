"use client";
import React from "react";
export default function TextAreaZpl() {
  const [multipleZpl, setMultipleZpl] = React.useState<string[]>([]);
  const [zpl, setZpl] = React.useState<string>("");
  const [type, setType] = React.useState<"split" | "correo">("split");

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

  function splitCorreoArgentinoLabels(zplText: string): string[] {
    const regex = /\^XA[\s\S]*?\^XA\^MCY\^XZ/g;

    const matches = zplText.match(regex);

    if (!matches) return [];

    return matches
      .map((label) => label.trim())
      .filter((label) => label.length > 0);
  }

  function agregarEtiquetas() {
    const etiquetas =
      type === "split" ? splitZplLabels(zpl) : splitCorreoArgentinoLabels(zpl);
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
      <div className="flex gap-5 justify-center items-center">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300"></label>
        Tipo de división de etiquetas:
        <select
          value={type}
          onChange={(e) => setType(e.target.value as "split" | "correo")}
          className=" p-2 border border-gray-300 rounded-md"
        >
          <option value="split" className="text-gray-700">
            Envio CORREO
          </option>
          <option value="correo" className="text-gray-700">
            Envios FLEX
          </option>
        </select>
      </div>
      <textarea
        className="w-full h-64 p-4 border border-zinc-300 rounded-md"
        placeholder="Escribe tu código ZPL aquí..."
        value={zpl}
        onChange={(e) => setZpl(e.target.value)}
      />
      <div className="flex justify-between mb-4 items-center gap-3">
        <div className="flex gap-4">
          <p>Cantidad de etiquetas: {multipleZpl.length}</p>
          {zpl && (
            <p className="text-blue-600">
              Etiquetas detectadas en el ZPL:{" "}
              {type === "split"
                ? splitZplLabels(zpl).length
                : splitCorreoArgentinoLabels(zpl).length}
            </p>
          )}
        </div>
        <button
          className="bg-red-500 rounded text-amber-50 p-2"
          onClick={() => setMultipleZpl([])}
        >
          Eliminar todas
        </button>
      </div>
      <div className="flex gap-2">
        <button
          onClick={agregarEtiquetas}
          className="inline-block rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 transition-colors cursor-pointer"
        >
          Sumar etiqueta(s)
        </button>
        <button
          disabled={multipleZpl.length === 0}
          onClick={generarEtiqueta}
          className="inline-block rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Descargar Etiqueta
        </button>
      </div>
    </>
  );
}
