
import { UserProfile, Language } from "./types";

/**
 * IMPORTANTE: Para que esto funcione, debes desplegar un Google Apps Script 
 * como Web App y pegar la URL aquí.
 */
const GOOGLE_SHEETS_WEBAPP_URL = "TU_URL_DE_APPS_SCRIPT_AQUI";

export const syncUserToDatabase = async (profile: UserProfile, language: Language) => {
  if (!GOOGLE_SHEETS_WEBAPP_URL || GOOGLE_SHEETS_WEBAPP_URL.includes("TU_URL")) {
    console.warn("Sincronización con base de datos omitida: URL no configurada.");
    return;
  }

  try {
    const response = await fetch(GOOGLE_SHEETS_WEBAPP_URL, {
      method: 'POST',
      mode: 'no-cors', // Necesario para evitar bloqueos CORS con Apps Script
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: profile.name,
        email: profile.email,
        language: language,
        timestamp: new Date().toISOString()
      }),
    });
    console.log("Datos sincronizados con Google Sheets.");
  } catch (error) {
    console.error("Error al sincronizar con la base de datos:", error);
  }
};
