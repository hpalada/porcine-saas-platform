// Traducciones del sistema
export const translations = {
  es: {
    // Navegación
    nav: {
      dashboard: 'Dashboard',
      lotes: 'Lotes',
      concentrados: 'Concentrados',
      inventario: 'Inventario',
      consumos: 'Consumos',
      gastos: 'Gastos',
      ventas: 'Ventas',
      reportes: 'Reportes',
      configuraciones: 'Configuraciones',
    },
    // Configuraciones
    settings: {
      title: 'Configuraciones',
      general: 'General',
      apariencia: 'Apariencia',
      notificaciones: 'Notificaciones',
      sistema: 'Sistema',
      
      // General
      nombreGranja: 'Nombre de la Granja',
      ubicacion: 'Ubicación',
      contacto: 'Teléfono/Contacto',
      email: 'Correo Electrónico',
      
      // Apariencia
      idioma: 'Idioma',
      tema: 'Tema',
      temaOscuro: 'Oscuro',
      temaClaro: 'Claro',
      temaAuto: 'Automático',
      
      // Moneda
      moneda: 'Moneda',
      tasaCambio: 'Tasa de Cambio (USD a HNL)',
      
      // Notificaciones
      notificacionesActivas: 'Activar Notificaciones',
      alertaStockBajo: 'Alertas de Stock Bajo',
      nivelStockCritico: 'Nivel de Stock Crítico (%)',
      
      // Sistema
      backupAutomatico: 'Backup Automático',
      horaBackup: 'Hora de Backup',
      registroAuditoria: 'Registrar Auditoría',
      
      guardar: 'Guardar Cambios',
      reset: 'Restablecer a Valores Por Defecto',
      resetConfirm: '¿Estás seguro de que deseas restablecer todas las configuraciones?',
      guardadoExitoso: 'Configuración guardada exitosamente',
      errorGuardar: 'Error al guardar la configuración',
    },
    // Común
    common: {
      guardar: 'Guardar',
      cancelar: 'Cancelar',
      eliminar: 'Eliminar',
      editar: 'Editar',
      nuevo: 'Nuevo',
      buscar: 'Buscar',
      cargar: 'Cargar...',
      error: 'Error',
      exito: 'Éxito',
      confirmar: 'Confirmar',
    },
  },
  en: {
    // Navigation
    nav: {
      dashboard: 'Dashboard',
      lotes: 'Batches',
      concentrados: 'Feed Types',
      inventario: 'Inventory',
      consumos: 'Consumptions',
      gastos: 'Expenses',
      ventas: 'Sales',
      reportes: 'Reports',
      configuraciones: 'Settings',
    },
    // Settings
    settings: {
      title: 'Settings',
      general: 'General',
      apariencia: 'Appearance',
      notificaciones: 'Notifications',
      sistema: 'System',
      
      // General
      nombreGranja: 'Farm Name',
      ubicacion: 'Location',
      contacto: 'Phone/Contact',
      email: 'Email Address',
      
      // Appearance
      idioma: 'Language',
      tema: 'Theme',
      temaOscuro: 'Dark',
      temaClaro: 'Light',
      temaAuto: 'Auto',
      
      // Currency
      moneda: 'Currency',
      tasaCambio: 'Exchange Rate (USD to HNL)',
      
      // Notifications
      notificacionesActivas: 'Enable Notifications',
      alertaStockBajo: 'Low Stock Alerts',
      nivelStockCritico: 'Critical Stock Level (%)',
      
      // System
      backupAutomatico: 'Automatic Backup',
      horaBackup: 'Backup Time',
      registroAuditoria: 'Audit Log',
      
      guardar: 'Save Changes',
      reset: 'Reset to Default Values',
      resetConfirm: 'Are you sure you want to reset all settings?',
      guardadoExitoso: 'Settings saved successfully',
      errorGuardar: 'Error saving settings',
    },
    // Common
    common: {
      guardar: 'Save',
      cancelar: 'Cancel',
      eliminar: 'Delete',
      editar: 'Edit',
      nuevo: 'New',
      buscar: 'Search',
      cargar: 'Loading...',
      error: 'Error',
      exito: 'Success',
      confirmar: 'Confirm',
    },
  },
  fr: {
    // Navigation
    nav: {
      dashboard: 'Tableau de Bord',
      lotes: 'Lots',
      concentrados: 'Types d\'Aliments',
      inventario: 'Inventaire',
      consumos: 'Consommations',
      gastos: 'Dépenses',
      ventas: 'Ventes',
      reportes: 'Rapports',
      configuraciones: 'Paramètres',
    },
    // Settings
    settings: {
      title: 'Paramètres',
      general: 'Général',
      apariencia: 'Apparence',
      notificaciones: 'Notifications',
      sistema: 'Système',
      
      // General
      nombreGranja: 'Nom de la Ferme',
      ubicacion: 'Emplacement',
      contacto: 'Téléphone/Contact',
      email: 'Adresse Email',
      
      // Appearance
      idioma: 'Langue',
      tema: 'Thème',
      temaOscuro: 'Sombre',
      temaClaro: 'Clair',
      temaAuto: 'Automatique',
      
      // Currency
      moneda: 'Devise',
      tasaCambio: 'Taux de Change (USD vers HNL)',
      
      // Notifications
      notificacionesActivas: 'Activer les Notifications',
      alertaStockBajo: 'Alertes de Stock Faible',
      nivelStockCritico: 'Niveau de Stock Critique (%)',
      
      // System
      backupAutomatico: 'Sauvegarde Automatique',
      horaBackup: 'Heure de Sauvegarde',
      registroAuditoria: 'Journal d\'Audit',
      
      guardar: 'Enregistrer les Modifications',
      reset: 'Réinitialiser aux Valeurs Par Défaut',
      resetConfirm: 'Êtes-vous sûr de vouloir réinitialiser tous les paramètres ?',
      guardadoExitoso: 'Paramètres enregistrés avec succès',
      errorGuardar: 'Erreur lors de l\'enregistrement des paramètres',
    },
    // Common
    common: {
      guardar: 'Enregistrer',
      cancelar: 'Annuler',
      eliminar: 'Supprimer',
      editar: 'Modifier',
      nuevo: 'Nouveau',
      buscar: 'Rechercher',
      cargar: 'Chargement...',
      error: 'Erreur',
      exito: 'Succès',
      confirmar: 'Confirmer',
    },
  },
};

export type Language = 'es' | 'en' | 'fr';
export type TranslationKey = keyof typeof translations.es;

export function getTranslation(language: Language, path: string): string {
  const keys = path.split('.');
  let value: any = translations[language];

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return path; // Retorna la ruta si no encuentra la traducción
    }
  }

  return typeof value === 'string' ? value : path;
}
