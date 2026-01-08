
import { GoogleGenAI } from "@google/genai";
import { Course, FormData } from "./types";

const getLanguageName = (code: string) => {
  switch (code) {
    case 'en': return 'English';
    case 'fr': return 'French';
    default: return 'Spanish';
  }
};

export const generateCourse = async (data: FormData): Promise<Course> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API_KEY no configurada. Asegúrate de añadirla en las variables de entorno de tu plataforma de despliegue.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";
  const targetLang = getLanguageName(data.language);
  
  const systemInstruction = `
    Actúa como un Diseñador Instruccional Senior y Profesor Experto. 
    Tu misión es crear un curso estructurado basado en los parámetros del usuario.
    
    REGLAS CRÍTICAS:
    1. El tono debe ser didáctico, cercano, motivador y profesional.
    2. El curso debe tener entre 6 y 8 unidades. Cada unidad entre 3 y 5 lecciones.
    3. Cada lección DEBE tener: Idea clave, Ejemplo real, Actividad práctica y un Test de 3 preguntas.
    4. Usa la herramienta Google Search para fuentes actualizadas.
    5. Idioma: ${targetLang}.
  `;

  const prompt = `
    Diseña un curso completo con estos parámetros:
    - Tema: ${data.topic}
    - Nivel: ${data.level}
    - Perfil: ${data.profile}
    - Objetivo: ${data.objective}
    
    Devuelve estrictamente un JSON con este esquema:
    {
      "title": "Título",
      "description": "Descripción",
      "level": "Nivel",
      "duration": "Duración",
      "profile": "Perfil",
      "objectives": ["obj1", "obj2"],
      "units": [
        {
          "title": "Unidad",
          "summary": "Resumen",
          "lessons": [
            {
              "id": "1.1",
              "title": "Lección",
              "content": {
                "keyIdea": "Teoría",
                "example": "Ejemplo",
                "activity": "Práctica",
                "quiz": [{ "text": "Pregunta", "options": ["A", "B", "C", "D"], "correctAnswer": "A" }]
              }
            }
          ]
        }
      ],
      "finalEvaluation": [{ "text": "Pregunta", "options": ["A", "B", "C", "D"], "correctAnswer": "C" }],
      "finalProjects": ["Proyecto 1"],
      "sources": [{ "title": "Fuente", "url": "URL" }]
    }
  `;

  try {
    const result = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }]
      },
    });

    const text = result.text || "";
    // Limpieza de seguridad por si la IA devuelve markdown
    const startIdx = text.indexOf('{');
    const endIdx = text.lastIndexOf('}');
    
    if (startIdx === -1) throw new Error("Formato JSON no encontrado");
    
    const cleanedJson = text.substring(startIdx, endIdx + 1);
    return JSON.parse(cleanedJson) as Course;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Error al generar el aula virtual. Revisa la consola para más detalles.");
  }
};
