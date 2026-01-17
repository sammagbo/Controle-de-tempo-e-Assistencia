// Translations for the application
// Keys are in Portuguese, values are translations

export type Language = 'pt' | 'fr';

interface TranslationStrings {
      // Navigation
      back: string;
      home: string;
      settings: string;

      // Dashboard
      meetingPanel: string;
      selectPeriod: string;
      selectWeek: string;
      startMeeting: string;
      continueMeeting: string;
      meetingInProgress: string;
      noPeriodsAvailable: string;
      noWeeksAvailable: string;
      syncNeeded: string;
      syncData: string;

      // Setup Session
      setupMeeting: string;
      president: string;
      presidentPlaceholder: string;
      importPdf: string;
      importing: string;
      totalDuration: string;
      startMeetingBtn: string;
      saving: string;
      addPart: string;
      insertHere: string;
      insertAtBeginning: string;
      newPart: string;
      assignedPlaceholder: string;
      allowsComments: string;
      requiresInstructorComment: string;
      removePart: string;

      // Live Meeting
      liveMeeting: string;
      attendance: string;
      comments: string;
      pause: string;
      start: string;
      next: string;
      finalize: string;
      estimated: string;
      actual: string;

      // Attendance
      attendanceTitle: string;
      inPerson: string;
      zoom: string;
      total: string;
      save: string;
      share: string;
      recentRecords: string;

      // Comments
      commentsTitle: string;
      addComment: string;
      noComments: string;

      // Report
      meetingReport: string;
      duration: string;
      exportPdf: string;
      newMeeting: string;

      // Settings
      settingsTitle: string;
      dataSync: string;
      syncInstructions: string;
      syncPortuguese: string;
      syncFrench: string;
      syncDisabled: string;
      backup: string;
      backupDescription: string;
      downloadBackup: string;

      // History
      meetingHistory: string;
      noMeetingsFound: string;
      viewDetails: string;

      // Days
      monday: string;
      tuesday: string;
      wednesday: string;
      thursday: string;
      friday: string;
      saturday: string;
      sunday: string;

      // Sections
      opening: string;
      treasures: string;
      ministry: string;
      christianLife: string;
      closing: string;

      // Common
      cancel: string;
      confirm: string;
      delete: string;
      edit: string;
      min: string;
      congregation: string;
}

const translations: Record<Language, TranslationStrings> = {
      pt: {
            // Navigation
            back: 'Voltar',
            home: 'Início',
            settings: 'Configurações',

            // Dashboard
            meetingPanel: 'Painel de Reuniões',
            selectPeriod: 'Selecionar Período',
            selectWeek: 'Selecionar Semana',
            startMeeting: 'Iniciar Reunião',
            continueMeeting: 'Continuar Reunião',
            meetingInProgress: 'Reunião em andamento',
            noPeriodsAvailable: 'Nenhum período disponível',
            noWeeksAvailable: 'Nenhuma semana disponível',
            syncNeeded: 'Sincronização necessária',
            syncData: 'Sincronizar Dados',

            // Setup Session
            setupMeeting: 'Configurar Reunião',
            president: 'Presidente da Reunião',
            presidentPlaceholder: 'Nome do Presidente',
            importPdf: 'Importar PDF',
            importing: 'Importando...',
            totalDuration: 'Duração Total',
            startMeetingBtn: 'Iniciar Reunião',
            saving: 'Salvando...',
            addPart: 'Adicionar parte',
            insertHere: 'Inserir aqui',
            insertAtBeginning: 'Inserir no início',
            newPart: 'Nova Parte',
            assignedPlaceholder: 'Designado(s): ex. Fulano / Ciclano',
            allowsComments: 'Permite comentários da assistência',
            requiresInstructorComment: 'Requer comentário do instrutor',
            removePart: 'Remover parte',

            // Live Meeting
            liveMeeting: 'Reunião Ao Vivo',
            attendance: 'Assistência',
            comments: 'Comentários',
            pause: 'Pausar',
            start: 'Iniciar',
            next: 'Próxima',
            finalize: 'Finalizar',
            estimated: 'Estimado',
            actual: 'Real',

            // Attendance
            attendanceTitle: 'Contagem de Assistência',
            inPerson: 'Presencial',
            zoom: 'Zoom',
            total: 'Total',
            save: 'Salvar',
            share: 'Compartilhar',
            recentRecords: 'Registros Recentes',

            // Comments
            commentsTitle: 'Contador de Comentários',
            addComment: 'Adicionar Comentário',
            noComments: 'Nenhum comentário',

            // Report
            meetingReport: 'Relatório da Reunião',
            duration: 'Duração',
            exportPdf: 'Exportar PDF',
            newMeeting: 'Nova Reunião',

            // Settings
            settingsTitle: 'Configurações & Dados',
            dataSync: 'Sincronização de Dados (JW.ORG)',
            syncInstructions: 'Para baixar novos períodos e semanas, execute os comandos abaixo no terminal:',
            syncPortuguese: 'Sincronizar dados em Português',
            syncFrench: 'Sincronizar dados em Francês',
            syncDisabled: 'A sincronização pelo navegador está desabilitada devido a restrições de segurança (CORS).',
            backup: 'Backup Completo (Excel)',
            backupDescription: 'Baixe todo o histórico do sistema em um arquivo Excel (.xlsx).',
            downloadBackup: 'Baixar Backup',

            // History
            meetingHistory: 'Histórico de Reuniões',
            noMeetingsFound: 'Nenhuma reunião encontrada',
            viewDetails: 'Ver Detalhes',

            // Days
            monday: 'Segunda',
            tuesday: 'Terça',
            wednesday: 'Quarta',
            thursday: 'Quinta',
            friday: 'Sexta',
            saturday: 'Sábado',
            sunday: 'Domingo',

            // Sections
            opening: 'Abertura',
            treasures: 'Tesouros da Palavra de Deus',
            ministry: 'Faça Seu Melhor no Ministério',
            christianLife: 'Nossa Vida Cristã',
            closing: 'Encerramento',

            // Common
            cancel: 'Cancelar',
            confirm: 'Confirmar',
            delete: 'Excluir',
            edit: 'Editar',
            min: 'min',
            congregation: 'Congregação',
      },

      fr: {
            // Navigation
            back: 'Retour',
            home: 'Accueil',
            settings: 'Paramètres',

            // Dashboard
            meetingPanel: 'Tableau de bord des réunions',
            selectPeriod: 'Sélectionner la période',
            selectWeek: 'Sélectionner la semaine',
            startMeeting: 'Commencer la réunion',
            continueMeeting: 'Continuer la réunion',
            meetingInProgress: 'Réunion en cours',
            noPeriodsAvailable: 'Aucune période disponible',
            noWeeksAvailable: 'Aucune semaine disponible',
            syncNeeded: 'Synchronisation nécessaire',
            syncData: 'Synchroniser les données',

            // Setup Session
            setupMeeting: 'Configurer la réunion',
            president: 'Président de la réunion',
            presidentPlaceholder: 'Nom du président',
            importPdf: 'Importer PDF',
            importing: 'Importation...',
            totalDuration: 'Durée totale',
            startMeetingBtn: 'Commencer la réunion',
            saving: 'Enregistrement...',
            addPart: 'Ajouter une partie',
            insertHere: 'Insérer ici',
            insertAtBeginning: 'Insérer au début',
            newPart: 'Nouvelle partie',
            assignedPlaceholder: 'Assigné(s): ex. Jean / Marie',
            allowsComments: 'Permet les commentaires de l\'assistance',
            requiresInstructorComment: 'Nécessite un commentaire de l\'instructeur',
            removePart: 'Supprimer la partie',

            // Live Meeting
            liveMeeting: 'Réunion en direct',
            attendance: 'Assistance',
            comments: 'Commentaires',
            pause: 'Pause',
            start: 'Démarrer',
            next: 'Suivant',
            finalize: 'Terminer',
            estimated: 'Estimé',
            actual: 'Réel',

            // Attendance
            attendanceTitle: 'Comptage de l\'assistance',
            inPerson: 'En personne',
            zoom: 'Zoom',
            total: 'Total',
            save: 'Enregistrer',
            share: 'Partager',
            recentRecords: 'Enregistrements récents',

            // Comments
            commentsTitle: 'Compteur de commentaires',
            addComment: 'Ajouter un commentaire',
            noComments: 'Aucun commentaire',

            // Report
            meetingReport: 'Rapport de la réunion',
            duration: 'Durée',
            exportPdf: 'Exporter en PDF',
            newMeeting: 'Nouvelle réunion',

            // Settings
            settingsTitle: 'Paramètres & Données',
            dataSync: 'Synchronisation des données (JW.ORG)',
            syncInstructions: 'Pour télécharger de nouvelles périodes et semaines, exécutez les commandes suivantes dans le terminal:',
            syncPortuguese: 'Synchroniser les données en portugais',
            syncFrench: 'Synchroniser les données en français',
            syncDisabled: 'La synchronisation via le navigateur est désactivée en raison des restrictions de sécurité (CORS).',
            backup: 'Sauvegarde complète (Excel)',
            backupDescription: 'Téléchargez tout l\'historique du système dans un fichier Excel (.xlsx).',
            downloadBackup: 'Télécharger la sauvegarde',

            // History
            meetingHistory: 'Historique des réunions',
            noMeetingsFound: 'Aucune réunion trouvée',
            viewDetails: 'Voir les détails',

            // Days
            monday: 'Lundi',
            tuesday: 'Mardi',
            wednesday: 'Mercredi',
            thursday: 'Jeudi',
            friday: 'Vendredi',
            saturday: 'Samedi',
            sunday: 'Dimanche',

            // Sections
            opening: 'Ouverture',
            treasures: 'Trésors de la Parole de Dieu',
            ministry: 'Applique-toi au ministère',
            christianLife: 'Vie chrétienne',
            closing: 'Conclusion',

            // Common
            cancel: 'Annuler',
            confirm: 'Confirmer',
            delete: 'Supprimer',
            edit: 'Modifier',
            min: 'min',
            congregation: 'Assemblée',
      }
};

// Get current language from localStorage
export function getCurrentLanguage(): Language {
      const stored = localStorage.getItem('jw_lang');
      if (stored === 'fr') return 'fr';
      return 'pt';
}

// Get translation for current language
export function t(key: keyof TranslationStrings): string {
      const lang = getCurrentLanguage();
      return translations[lang][key] || translations.pt[key] || key;
}

// Get all translations for current language
export function getTranslations(): TranslationStrings {
      const lang = getCurrentLanguage();
      return translations[lang];
}

export default translations;
