import OpenAI from "openai";
import { NextResponse } from "next/server";

const schema = {
  name: "series_lookup",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      error: { type: ["string", "null"] },
      title: { type: ["string", "null"] },
      year: { type: ["integer", "null"] },
      genre: { type: ["string", "null"] },
      status: {
        type: ["string", "null"],
        enum: ["En emisión", "Finalizada", "Cancelada", null]
      },
      platforms: {
        type: "array",
        items: { type: "string" }
      },
      seasons: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            number: { type: "integer" },
            episodes: { type: "integer" }
          },
          required: ["number", "episodes"]
        }
      },
      description: { type: ["string", "null"] },
      rating: { type: ["number", "null"] }
    },
    required: [
      "error",
      "title",
      "year",
      "genre",
      "status",
      "platforms",
      "seasons",
      "description",
      "rating"
    ]
  }
} as const;

export async function POST(request: Request) {
  const { name } = (await request.json()) as { name?: string };
  const query = name?.trim();

  if (!query) {
    return NextResponse.json({ error: "Escribe el nombre de una serie" }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY no está configurada" }, { status: 500 });
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      response_format: {
        type: "json_schema",
        json_schema: schema
      },
      messages: [
        {
          role: "system",
          content:
            "Eres un asistente que devuelve datos fiables sobre series de TV. Responde solo con JSON válido que cumpla el schema."
        },
        {
          role: "user",
          content: `Devuelve información sobre la serie de TV "${query}".
Si no conoces la serie, usa {"error":"Serie no encontrada"} y deja el resto como null o arrays vacios.
La descripcion debe estar en español y tener maximo 80 palabras.`
        }
      ],
      temperature: 0.2
    });

    const content = response.choices[0]?.message.content;
    if (!content) {
      return NextResponse.json({ error: "OpenAI no devolvió contenido" }, { status: 502 });
    }

    return NextResponse.json(JSON.parse(content));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error consultando OpenAI";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
