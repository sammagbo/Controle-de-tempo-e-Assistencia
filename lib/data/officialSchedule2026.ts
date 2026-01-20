import { MeetingPart, SectionKey } from '../meetingTemplate';

export interface ScheduleWeek {
      id: string;
      dateRange: string;
      startDate: string; // ISO format: YYYY-MM-DD
      endDate: string;   // ISO format: YYYY-MM-DD
      bibleReading: string;
      parts: SchedulePart[];
}

export interface SchedulePart {
      section: 'treasures' | 'ministry' | 'living';
      title: string;
      duration: number;
      type: string;
      hasCounsel: boolean;
}

// Map schedule sections to app sections
const SECTION_MAP: Record<string, SectionKey> = {
      treasures: 'tesouros',
      ministry: 'ministerio',
      living: 'vida_crista',
};

// Standard generic structure for weeks without specific PDF content
const createStandardParts = (bibleReadingRange: string, songNumber: number): SchedulePart[] => [
      { section: "treasures", title: "Discurso", duration: 10, type: "talk", hasCounsel: false },
      { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
      { section: "treasures", title: `Leitura da Bíblia (${bibleReadingRange})`, duration: 4, type: "bible_reading", hasCounsel: true },
      { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
      { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
      { section: "ministry", title: "Fazendo Discípulos", duration: 5, type: "ministry_part", hasCounsel: true },
      { section: "living", title: `Cântico ${songNumber}`, duration: 3, type: "song", hasCounsel: false },
      { section: "living", title: "Necessidades Locais", duration: 15, type: "talk", hasCounsel: false },
      { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
];

export const OFFICIAL_SCHEDULE: ScheduleWeek[] = [
      // === JANEIRO 2026 ===
      {
            id: "2026-01-05",
            startDate: "2026-01-05",
            endDate: "2026-01-11",
            dateRange: "5-11 de Janeiro",
            bibleReading: "Isaías 17-20",
            parts: [
                  { section: "treasures", title: "Discurso: A recompensa dos que nos saqueiam", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Isa. 19:1-12)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas (De casa em casa)", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Discurso", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 153", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Tire tempo todos os dias para aprender com os amigos de Jeová", duration: 5, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "2026-01-12",
            startDate: "2026-01-12",
            endDate: "2026-01-18",
            dateRange: "12-18 de Janeiro",
            bibleReading: "Isaías 21-23",
            parts: createStandardParts("Isa. 22:1-14", 25)
      },
      {
            id: "2026-01-19",
            startDate: "2026-01-19",
            endDate: "2026-01-25",
            dateRange: "19-25 de Janeiro",
            bibleReading: "Isaías 24-27",
            parts: createStandardParts("Isa. 25:1-12", 45)
      },
      {
            id: "2026-01-26",
            startDate: "2026-01-26",
            endDate: "2026-02-01",
            dateRange: "26 Jan - 1 Fev",
            bibleReading: "Isaías 28-29",
            parts: createStandardParts("Isa. 28:1-13", 67)
      },

      // === FEVEREIRO 2026 ===
      {
            id: "2026-02-02",
            startDate: "2026-02-02",
            endDate: "2026-02-08",
            dateRange: "2-8 de Fevereiro",
            bibleReading: "Isaías 30-32",
            parts: createStandardParts("Isa. 30:1-18", 89)
      },
      {
            id: "2026-02-09",
            startDate: "2026-02-09",
            endDate: "2026-02-15",
            dateRange: "9-15 de Fevereiro",
            bibleReading: "Isaías 33-35",
            parts: createStandardParts("Isa. 33:1-16", 102)
      },
      {
            id: "2026-02-16",
            startDate: "2026-02-16",
            endDate: "2026-02-22",
            dateRange: "16-22 de Fevereiro",
            bibleReading: "Isaías 36-37",
            parts: createStandardParts("Isa. 35:1-10", 115)
      },
      {
            id: "2026-02-23",
            startDate: "2026-02-23",
            endDate: "2026-03-01",
            dateRange: "23 Fev - 1 Mar",
            bibleReading: "Isaías 38-40",
            parts: createStandardParts("Isa. 37:21-35", 128)
      },

      // === MARÇO 2026 (Content verified from PDF) ===
      {
            id: "2026-03-02",
            startDate: "2026-03-02",
            endDate: "2026-03-08",
            dateRange: "2-8 de Março",
            bibleReading: "Isaías 41-42",
            parts: [
                  { section: "treasures", title: "Discurso: 'Não tenha medo'", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Isa. 42:1-13)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas (Testemunho Público)", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Discurso", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 8", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Necessidades Locais", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "2026-03-09",
            startDate: "2026-03-09",
            endDate: "2026-03-15",
            dateRange: "9-15 de Março",
            bibleReading: "Isaías 43-44",
            parts: createStandardParts("Isa. 43:1-13", 33)
      },
      {
            id: "2026-03-16",
            startDate: "2026-03-16",
            endDate: "2026-03-22",
            dateRange: "16-22 de Março",
            bibleReading: "Isaías 45-46",
            parts: createStandardParts("Isa. 45:1-13", 56)
      },
      {
            id: "2026-03-23",
            startDate: "2026-03-23",
            endDate: "2026-03-29",
            dateRange: "23-29 de Março",
            bibleReading: "Isaías 47-48",
            parts: createStandardParts("Isa. 49:1-13", 78)
      },
      {
            id: "2026-03-30",
            startDate: "2026-03-30",
            endDate: "2026-04-05",
            dateRange: "30 Mar - 5 Abr",
            bibleReading: "Isaías 49-50",
            parts: createStandardParts("Isa. 49:1-13", 91)
      },

      // === ABRIL 2026 (Semana de 13-19 verificada do PDF) ===
      {
            id: "2026-04-06",
            startDate: "2026-04-06",
            endDate: "2026-04-12",
            dateRange: "6-12 de Abril",
            bibleReading: "Isaías 51-53",
            parts: createStandardParts("Isa. 52:1-12", 104)
      },
      {
            id: "2026-04-13",
            startDate: "2026-04-13",
            endDate: "2026-04-19",
            dateRange: "13-19 de Abril",
            bibleReading: "Isaías 54-57",
            parts: [
                  { section: "treasures", title: "Discurso", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Isa. 54:1-10)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Explicando suas Crenças", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 106", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Torne-se Amigo de Jeová - O Melhor Presente", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "2026-04-20",
            startDate: "2026-04-20",
            endDate: "2026-04-26",
            dateRange: "20-26 de Abril",
            bibleReading: "Isaías 60-62",
            parts: createStandardParts("Isa. 56:1-12", 130)
      },
      {
            id: "2026-04-27",
            startDate: "2026-04-27",
            endDate: "2026-05-03",
            dateRange: "27 Abr - 3 Mai",
            bibleReading: "Isaías 63-66",
            parts: createStandardParts("Isa. 58:1-14", 143)
      },

      // === MAIO 2026 (Content verified from PDF) ===
      {
            id: "2026-05-04",
            startDate: "2026-05-04",
            endDate: "2026-05-10",
            dateRange: "4-10 de Maio",
            bibleReading: "Isaías 58-59",
            parts: [
                  { section: "treasures", title: "Discurso: Receba muitas bênçãos de Jeová", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Isa. 59:1-11)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas (De casa em casa)", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Fazendo Discípulos (De casa em casa)", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 21", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Você está preparado para um desastre?", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "2026-05-11",
            startDate: "2026-05-11",
            endDate: "2026-05-17",
            dateRange: "11-17 de Maio",
            bibleReading: "Jeremias 1-4",
            parts: createStandardParts("Jer. 1:1-19", 44)
      },
      {
            id: "2026-05-18",
            startDate: "2026-05-18",
            endDate: "2026-05-24",
            dateRange: "18-24 de Maio",
            bibleReading: "Jeremias 5-7",
            parts: createStandardParts("Jer. 6:1-15", 67)
      },
      {
            id: "2026-05-25",
            startDate: "2026-05-25",
            endDate: "2026-05-31",
            dateRange: "25-31 de Maio",
            bibleReading: "Jeremias 8-11",
            parts: createStandardParts("Jer. 9:17-26", 90)
      },

      // === JUNHO 2026 ===
      {
            id: "2026-06-01",
            startDate: "2026-06-01",
            endDate: "2026-06-07",
            dateRange: "1-7 de Junho",
            bibleReading: "Jeremias 12-16",
            parts: createStandardParts("Jer. 12:1-13", 113)
      },
      {
            id: "2026-06-08",
            startDate: "2026-06-08",
            endDate: "2026-06-14",
            dateRange: "8-14 de Junho",
            bibleReading: "Jeremias 17-21",
            parts: createStandardParts("Jer. 17:1-18", 136)
      },
      {
            id: "2026-06-15",
            startDate: "2026-06-15",
            endDate: "2026-06-21",
            dateRange: "15-21 de Junho",
            bibleReading: "Jeremias 22-25",
            parts: createStandardParts("Jer. 22:1-16", 149)
      },
      {
            id: "2026-06-22",
            startDate: "2026-06-22",
            endDate: "2026-06-28",
            dateRange: "22-28 de Junho",
            bibleReading: "Jeremias 26-29",
            parts: createStandardParts("Jer. 26:1-15", 12)
      },
      {
            id: "2026-06-29",
            startDate: "2026-06-29",
            endDate: "2026-07-05",
            dateRange: "29 Jun - 5 Jul",
            bibleReading: "Jeremias 30-31",
            parts: createStandardParts("Jer. 30:1-17", 35)
      }
];

/**
 * Get the current week's schedule based on the current date (using ISO dates)
 */
export function getCurrentWeekSchedule(): ScheduleWeek | null {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (const week of OFFICIAL_SCHEDULE) {
            const start = new Date(week.startDate + 'T00:00:00');
            const end = new Date(week.endDate + 'T23:59:59');

            if (today >= start && today <= end) {
                  return week;
            }
      }

      // Default to first week if no match
      return OFFICIAL_SCHEDULE[0] || null;
}

/**
 * Check if a week is the current week
 */
export function isCurrentWeek(week: ScheduleWeek): boolean {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const start = new Date(week.startDate + 'T00:00:00');
      const end = new Date(week.endDate + 'T23:59:59');

      return today >= start && today <= end;
}

/**
 * Convert schedule parts to app MeetingPart format
 */
export function convertScheduleToMeetingParts(schedule: ScheduleWeek): MeetingPart[] {
      const abertura: MeetingPart[] = [
            {
                  id: 'abertura-1',
                  title: 'Comentários Iniciais',
                  estimatedMinutes: 1,
                  section: 'abertura',
                  allowsComments: false,
                  requiresPostComment: false,
            },
            {
                  id: 'abertura-2',
                  title: 'Cântico e Oração Inicial',
                  estimatedMinutes: 5,
                  section: 'abertura',
                  allowsComments: false,
                  requiresPostComment: false,
                  skipTiming: true,
            },
      ];

      let partIndex = 0;
      const mainParts: MeetingPart[] = schedule.parts.map((part) => {
            partIndex++;
            const appSection = SECTION_MAP[part.section] || 'tesouros';

            return {
                  id: `schedule-${schedule.id}-${partIndex}`,
                  title: part.title,
                  estimatedMinutes: part.duration,
                  section: appSection,
                  allowsComments: false,
                  requiresPostComment: part.hasCounsel,
                  skipTiming: part.type === 'song',
            };
      });

      const encerramento: MeetingPart[] = [
            {
                  id: 'encerramento-1',
                  title: 'Comentários Finais',
                  estimatedMinutes: 3,
                  section: 'encerramento',
                  allowsComments: false,
                  requiresPostComment: false,
            },
            {
                  id: 'encerramento-2',
                  title: 'Cântico e Oração Final',
                  estimatedMinutes: 5,
                  section: 'encerramento',
                  allowsComments: false,
                  requiresPostComment: false,
                  skipTiming: true,
            },
      ];

      return [...abertura, ...mainParts, ...encerramento];
}

/**
 * Get all available week schedules
 */
export function getAllScheduleWeeks(): ScheduleWeek[] {
      return OFFICIAL_SCHEDULE;
}

// Helper function to get month index from Portuguese month name
function getMonthIndex(monthName: string): number {
      const months: Record<string, number> = {
            janeiro: 0,
            fevereiro: 1,
            março: 2,
            marco: 2,
            abril: 3,
            maio: 4,
            junho: 5,
            julho: 6,
            agosto: 7,
            setembro: 8,
            outubro: 9,
            novembro: 10,
            dezembro: 11,
      };
      return months[monthName.toLowerCase()] ?? 0;
}
