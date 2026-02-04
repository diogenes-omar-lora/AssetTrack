/**
 * Utility para traducir y mejorar mensajes de error de Supabase
 */

interface ErrorMessage {
  title: string;
  description: string;
}

export const getErrorMessage = (error: any): ErrorMessage => {
  // Si no es un error, retornar mensaje genérico
  if (!error) {
    return {
      title: "Error desconocido",
      description: "Ocurrió un error inesperado. Por favor, intenta de nuevo.",
    };
  }

  const errorMessage = error?.message?.toLowerCase() || "";
  const errorCode = error?.code || "";

  // Errores de validación y restricciones
  if (errorMessage.includes("duplicate") || errorCode === "23505") {
    if (errorMessage.includes("serial")) {
      return {
        title: "Número de serie duplicado",
        description: "Este número de serie ya está registrado. Por favor, usa uno diferente.",
      };
    }
    if (errorMessage.includes("email")) {
      return {
        title: "Correo ya registrado",
        description: "Este correo electrónico ya está asociado a una cuenta.",
      };
    }
    return {
      title: "Dato duplicado",
      description: "Este dato ya existe en el sistema. Verifica e intenta con información diferente.",
    };
  }

  // Errores de restricción de clave foránea
  if (errorMessage.includes("foreign key") || errorCode === "23503") {
    return {
      title: "Referencia inválida",
      description: "El registro referenciado no existe. Por favor, verifica los datos.",
    };
  }

  // Errores de campo requerido
  if (errorMessage.includes("not null") || errorCode === "23502") {
    return {
      title: "Campos requeridos",
      description: "Por favor, completa todos los campos obligatorios.",
    };
  }

  // Errores de autenticación
  if (errorMessage.includes("unauthorized") || errorCode === "401") {
    return {
      title: "No autenticado",
      description: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
    };
  }

  // Errores de permisos
  if (errorMessage.includes("permission") || errorCode === "403") {
    return {
      title: "Permiso denegado",
      description: "No tienes permiso para realizar esta acción.",
    };
  }

  // Errores de recurso no encontrado
  if (errorMessage.includes("not found") || errorCode === "404") {
    return {
      title: "Recurso no encontrado",
      description: "El elemento que buscas no existe o fue eliminado.",
    };
  }

  // Errores de conexión de red
  if (errorMessage.includes("network") || errorMessage.includes("timeout")) {
    return {
      title: "Problema de conexión",
      description: "No se pudo conectar con el servidor. Verifica tu conexión a internet.",
    };
  }

  // Errores de validación de datos
  if (errorMessage.includes("invalid") || errorMessage.includes("format")) {
    return {
      title: "Datos inválidos",
      description: "Algunos datos no tienen el formato correcto. Por favor, verifica e intenta de nuevo.",
    };
  }

  // Errores de tipo enum
  if (errorMessage.includes("enum") || errorCode === "22P02") {
    return {
      title: "Valor inválido",
      description: "El valor seleccionado no es válido. Por favor, elige una opción disponible.",
    };
  }

  // Errores de transacción
  if (errorMessage.includes("transaction") || errorMessage.includes("conflict")) {
    return {
      title: "Conflicto de datos",
      description: "Los datos fueron modificados por otro usuario. Por favor, recarga e intenta de nuevo.",
    };
  }

  // Error genérico con mensaje original
  return {
    title: "Error",
    description: error?.message || "Ocurrió un error. Por favor, intenta de nuevo más tarde.",
  };
};

/**
 * Log mejorado de errores para la consola (solo en desarrollo)
 */
export const logError = (context: string, error: any) => {
  if (process.env.NODE_ENV === "development") {
    console.group(`❌ Error: ${context}`);
    console.error("Mensaje:", error?.message);
    console.error("Código:", error?.code);
    console.error("Estado HTTP:", error?.status);
    console.error("Detalles:", error);
    console.groupEnd();
  }
};

/**
 * Validar y proporcionar retroalimentación sobre errores específicos de formulario
 */
export const getFieldError = (fieldName: string, error: any): string | null => {
  const message = error?.message?.toLowerCase() || "";

  const fieldErrors: Record<string, string[]> = {
    serial_number: [
      "duplicate",
      "unique constraint",
      "serial",
    ],
    email: [
      "duplicate",
      "email",
      "unique constraint",
    ],
    password: [
      "password",
      "invalid",
      "weak",
    ],
  };

  const possibleErrors = fieldErrors[fieldName] || [];
  const hasFieldError = possibleErrors.some(err => message.includes(err));

  if (!hasFieldError) return null;

  const fieldMessages: Record<string, string> = {
    serial_number: "Este número de serie ya está registrado.",
    email: "Este correo electrónico ya está registrado.",
    password: "La contraseña no cumple con los requisitos de seguridad.",
  };

  return fieldMessages[fieldName] || "Este campo tiene un error.";
};
