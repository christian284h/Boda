export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end(); // Respuesta al preflight
  }

  try {
    // Reenvía la petición al Web App de Google Apps Script
    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbxGMkJxDLOybjhrAY8xN8QwTD9F6_385LtQQJXZN7mhwRlBcgJDPsvPqdICJmSwwXeR/exec",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      }
    );

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}