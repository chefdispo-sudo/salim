
import { GoogleGenAI, Type } from "@google/genai";
import { Course, FormData } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

const getLanguageName = (code: string) => {
  switch (code) {
    case 'en': return 'English';
    case 'fr': return 'French';
    default: return 'Spanish';
  }
};

export const generateCourse = async (data: FormData): Promise<Course> => {
  const model = "gemini-3-flash-preview";
  const targetLang = getLanguageName(data.language);
  
  const systemInstruction = `
    Actúa como un Diseñador Instruccional Senior y Profesor Experto. 
    Tu misión es crear un curso estructurado basado en los parámetros del usuario.
    
    REGLAS CRÍTICAS:
    1. El tono debe ser didáctico, cercano, motivador y profesional. No menciones que eres una IA.
    2. Utiliza frases cortas y claras. Evita párrafos densos.
    3. Para temas complejos, usa analogías intuitivas.
    4. El curso debe tener entre 6 y 8 unidades. Cada unidad entre 3 y 5 lecciones.
    5. Cada lección DEBE tener: Idea clave, Ejemplo real/aplicado, Actividad práctica y un Test rápido de 3 preguntas.
    6. Incluye una Evaluación Final (8-10 preguntas) y 2 propuestas de proyecto.
    7. DEBES usar la herramienta Google Search para encontrar fuentes reales y actualizadas (libros, artículos, webs).
    8. El idioma del contenido generado DEBE ser estrictamente: ${targetLang}.
  `;

  const prompt = `
    Diseña un curso completo con estos parámetros:
    - Tema: ${data.topic}
    - Nivel del alumno: ${data.level}
    - Perfil del alumno: ${data.profile}
    - Objetivo: ${data.objective}
    - Tiempo disponible: ${data.time}
    - Formato: ${data.format}
    
    Devuelve la respuesta estrictamente en formato JSON siguiendo este esquema (las claves deben ser exactas, pero los valores en ${targetLang}):
    {
      "title": "Título del curso",
      "description": "Descripción corta",
      "level": "Nivel",
      "duration": "Duración",
      "profile": "Perfil",
      "objectives": ["objetivo 1", "objetivo 2"],
      "units": [
        {
          "title": "Título de Unidad",
          "summary": "Resumen",
          "lessons": [
            {
              "id": "1.1",
              "title": "Título de lección",
              "content": {
                "keyIdea": "Explicación",
                "example": "Ejemplo real",
                "activity": "Actividad",
                "quiz": [
                  { "text": "Pregunta", "options": ["A", "B", "C", "D"], "correctAnswer": "A" }
                ]
              }
            }
          ]
        }
      ],
      "finalEvaluation": [ { "text": "Pregunta", "options": ["A", "B", "C", "D"], "correctAnswer": "C" } ],
      "finalProjects": ["Proyecto A", "Proyecto B"],
      "sources": [ { "title": "Nombre de fuente", "url": "url_real" } ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }]
      },
    });

    const text = response.text || "";
    const cleanedJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanedJson) as Course;
  } catch (error) {
    console.error("Error generating course:", error);
    throw new Error("Ocurrió un error al generar el curso.");
  }
};
