export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { zpl } = req.body;

    const response = await fetch(
      "https://api.labelary.com/v1/printers/8dpmm/labels/4x8.2/0/",
      {
        method: "POST",
        headers: {
          Accept: "image/png",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: zpl,
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("Labelary error:", text);
      return res
        .status(400)
        .json({ error: "Labelary API error", details: text });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Length", buffer.length);
    res.status(200).send(buffer);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Error generando etiqueta" });
  }
}
