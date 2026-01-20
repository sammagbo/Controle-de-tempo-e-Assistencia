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

export const OFFICIAL_SCHEDULE: ScheduleWeek[] = [
      // === JANEIRO 2026 ===
      {
            id: "week-jan-5",
            dateRange: "5-11 de Janeiro",
            startDate: "2026-01-05",
            endDate: "2026-01-11",
            bibleReading: "Isaías 17-20",
            parts: [
                  { section: "treasures", title: "Discurso: A recompensa dos que nos saqueiam", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Isa. 19:1-12)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Discurso do Estudante", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 148", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Lembre-se da Rocha de sua fortaleza", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "week-jan-12",
            dateRange: "12-18 de Janeiro",
            startDate: "2026-01-12",
            endDate: "2026-01-18",
            bibleReading: "Isaías 21-23",
            parts: [
                  { section: "treasures", title: "Discurso: A carga de Babilônia", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Isa. 22:1-14)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Discurso do Estudante", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 25", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Necessidades Locais", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "week-jan-19",
            dateRange: "19-25 de Janeiro",
            startDate: "2026-01-19",
            endDate: "2026-01-25",
            bibleReading: "Isaías 24-26",
            parts: [
                  { section: "treasures", title: "Discurso: O banquete de Jeová", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Isa. 25:1-12)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Fazendo Discípulos", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 45", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Confie em Jeová e viva", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "week-jan-26",
            dateRange: "26 de Janeiro - 1 de Fevereiro",
            startDate: "2026-01-26",
            endDate: "2026-02-01",
            bibleReading: "Isaías 27-28",
            parts: [
                  { section: "treasures", title: "Discurso: Proteção contra o inimigo", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Isa. 28:1-13)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Discurso do Estudante", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 67", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Necessidades Locais", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      // === FEVEREIRO 2026 ===
      {
            id: "week-feb-2",
            dateRange: "2-8 de Fevereiro",
            startDate: "2026-02-02",
            endDate: "2026-02-08",
            bibleReading: "Isaías 29-30",
            parts: [
                  { section: "treasures", title: "Discurso: Buscando ajuda de Jeová", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Isa. 30:1-18)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Discurso do Estudante", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 89", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Tema da Vida Cristã", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "week-feb-9",
            dateRange: "9-15 de Fevereiro",
            startDate: "2026-02-09",
            endDate: "2026-02-15",
            bibleReading: "Isaías 31-33",
            parts: [
                  { section: "treasures", title: "Discurso: Rei justo governará", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Isa. 33:1-16)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Fazendo Discípulos", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 102", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Necessidades Locais", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "week-feb-16",
            dateRange: "16-22 de Fevereiro",
            startDate: "2026-02-16",
            endDate: "2026-02-22",
            bibleReading: "Isaías 34-36",
            parts: [
                  { section: "treasures", title: "Discurso: Vingança de Jeová", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Isa. 35:1-10)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Discurso do Estudante", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 115", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Tema da Vida Cristã", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "week-feb-23",
            dateRange: "23 de Fevereiro - 1 de Março",
            startDate: "2026-02-23",
            endDate: "2026-03-01",
            bibleReading: "Isaías 37-38",
            parts: [
                  { section: "treasures", title: "Discurso: Ezequias confia em Jeová", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Isa. 37:21-35)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Discurso do Estudante", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 128", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Necessidades Locais", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      // === MARÇO 2026 ===
      {
            id: "week-mar-2",
            dateRange: "2-8 de Março",
            startDate: "2026-03-02",
            endDate: "2026-03-08",
            bibleReading: "Isaías 39-40",
            parts: [
                  { section: "treasures", title: "Discurso: Consolo para o povo de Deus", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Isa. 40:1-17)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Discurso do Estudante", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 8", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Tema da Vida Cristã", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "week-mar-9",
            dateRange: "9-15 de Março",
            startDate: "2026-03-09",
            endDate: "2026-03-15",
            bibleReading: "Isaías 41-42",
            parts: [
                  { section: "treasures", title: "Discurso: Não tenha medo", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Isa. 42:1-12)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Fazendo Discípulos", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 33", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Necessidades Locais", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "week-mar-16",
            dateRange: "16-22 de Março",
            startDate: "2026-03-16",
            endDate: "2026-03-22",
            bibleReading: "Isaías 43-44",
            parts: [
                  { section: "treasures", title: "Discurso: Você é minha testemunha", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Isa. 43:1-13)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Discurso do Estudante", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 56", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Tema da Vida Cristã", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "week-mar-23",
            dateRange: "23-29 de Março",
            startDate: "2026-03-23",
            endDate: "2026-03-29",
            bibleReading: "Isaías 45-46",
            parts: [
                  { section: "treasures", title: "Discurso: Ciro libertador escolhido", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Isa. 45:1-13)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Discurso do Estudante", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 78", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Necessidades Locais", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "week-mar-30",
            dateRange: "30 de Março - 5 de Abril",
            startDate: "2026-03-30",
            endDate: "2026-04-05",
            bibleReading: "Isaías 47-49",
            parts: [
                  { section: "treasures", title: "Discurso: A queda de Babilônia", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Isa. 49:1-13)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Fazendo Discípulos", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 91", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Tema da Vida Cristã", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      // === ABRIL 2026 ===
      {
            id: "week-apr-6",
            dateRange: "6-12 de Abril",
            startDate: "2026-04-06",
            endDate: "2026-04-12",
            bibleReading: "Isaías 50-52",
            parts: [
                  { section: "treasures", title: "Discurso: O servo sofredor", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Isa. 52:1-12)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Discurso do Estudante", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 104", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Necessidades Locais", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "week-apr-13",
            dateRange: "13-19 de Abril",
            startDate: "2026-04-13",
            endDate: "2026-04-19",
            bibleReading: "Isaías 53-55",
            parts: [
                  { section: "treasures", title: "Discurso: O sacrifício do Messias", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Isa. 53:1-12)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Discurso do Estudante", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 117", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Tema da Vida Cristã", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "week-apr-20",
            dateRange: "20-26 de Abril",
            startDate: "2026-04-20",
            endDate: "2026-04-26",
            bibleReading: "Isaías 56-57",
            parts: [
                  { section: "treasures", title: "Discurso: Casa de oração para todos", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Isa. 56:1-12)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Fazendo Discípulos", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 130", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Necessidades Locais", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "week-apr-27",
            dateRange: "27 de Abril - 3 de Maio",
            startDate: "2026-04-27",
            endDate: "2026-05-03",
            bibleReading: "Isaías 58-59",
            parts: [
                  { section: "treasures", title: "Discurso: Jejum verdadeiro", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Isa. 58:1-14)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Discurso do Estudante", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 143", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Tema da Vida Cristã", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      // === MAIO 2026 ===
      {
            id: "week-may-4",
            dateRange: "4-10 de Maio",
            startDate: "2026-05-04",
            endDate: "2026-05-10",
            bibleReading: "Isaías 60-62",
            parts: [
                  { section: "treasures", title: "Discurso: Levante-se e brilhe", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Isa. 60:1-14)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Discurso do Estudante", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 21", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Necessidades Locais", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "week-may-11",
            dateRange: "11-17 de Maio",
            startDate: "2026-05-11",
            endDate: "2026-05-17",
            bibleReading: "Isaías 63-64",
            parts: [
                  { section: "treasures", title: "Discurso: O dia de vingança", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Isa. 63:1-14)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Fazendo Discípulos", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 44", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Tema da Vida Cristã", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "week-may-18",
            dateRange: "18-24 de Maio",
            startDate: "2026-05-18",
            endDate: "2026-05-24",
            bibleReading: "Isaías 65-66",
            parts: [
                  { section: "treasures", title: "Discurso: Novos céus e nova terra", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Isa. 65:17-25)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Discurso do Estudante", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 67", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Necessidades Locais", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "week-may-25",
            dateRange: "25-31 de Maio",
            startDate: "2026-05-25",
            endDate: "2026-05-31",
            bibleReading: "Jeremias 1-2",
            parts: [
                  { section: "treasures", title: "Discurso: Chamado de Jeremias", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Jer. 1:1-19)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Discurso do Estudante", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 90", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Tema da Vida Cristã", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      // === JUNHO 2026 ===
      {
            id: "week-jun-1",
            dateRange: "1-7 de Junho",
            startDate: "2026-06-01",
            endDate: "2026-06-07",
            bibleReading: "Jeremias 3-4",
            parts: [
                  { section: "treasures", title: "Discurso: Volte para Jeová", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Jer. 3:11-25)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Discurso do Estudante", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 113", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Necessidades Locais", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "week-jun-8",
            dateRange: "8-14 de Junho",
            startDate: "2026-06-08",
            endDate: "2026-06-14",
            bibleReading: "Jeremias 5-6",
            parts: [
                  { section: "treasures", title: "Discurso: Busque o caminho bom", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Jer. 6:1-15)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Fazendo Discípulos", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 136", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Tema da Vida Cristã", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "week-jun-15",
            dateRange: "15-21 de Junho",
            startDate: "2026-06-15",
            endDate: "2026-06-21",
            bibleReading: "Jeremias 7-8",
            parts: [
                  { section: "treasures", title: "Discurso: O templo de Jeová", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Jer. 7:1-15)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Discurso do Estudante", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 149", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Necessidades Locais", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "week-jun-22",
            dateRange: "22-28 de Junho",
            startDate: "2026-06-22",
            endDate: "2026-06-28",
            bibleReading: "Jeremias 9-10",
            parts: [
                  { section: "treasures", title: "Discurso: Não se glorie na sabedoria", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Jer. 9:17-26)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Discurso do Estudante", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 12", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Tema da Vida Cristã", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "week-jun-29",
            dateRange: "29 de Junho - 5 de Julho",
            startDate: "2026-06-29",
            endDate: "2026-07-05",
            bibleReading: "Jeremias 11-12",
            parts: [
                  { section: "treasures", title: "Discurso: Lembre do pacto", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Jer. 11:1-17)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Fazendo Discípulos", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 35", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Necessidades Locais", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
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
