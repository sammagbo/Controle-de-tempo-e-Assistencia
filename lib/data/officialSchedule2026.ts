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

// =====================================================
// CRONOGRAMA OFICIAL 2026 - BASEADO NOS PDFs OFICIAIS
// mwb_T_202601 (Janeiro-Fevereiro)
// mwb_T_202603 (Março-Abril)  
// mwb_T_202605 (Maio-Junho)
// =====================================================

export const OFFICIAL_SCHEDULE: ScheduleWeek[] = [
      // ============================================
      // JANEIRO 2026 (mwb_T_202601)
      // ============================================
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
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Discurso", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 148", duration: 3, type: "song", hasCounsel: false },
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
            parts: [
                  { section: "treasures", title: "Discurso: A disciplina dada com amor pode ser um modo de Deus nos moldar", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Isa. 23:1-14)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas (Testemunho Informal)", duration: 1, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas (De casa em casa)", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 2, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Discurso", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 124", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Necessidades Locais", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "2026-01-19",
            startDate: "2026-01-19",
            endDate: "2026-01-25",
            dateRange: "19-25 de Janeiro",
            bibleReading: "Isaías 24-27",
            parts: [
                  { section: "treasures", title: "Discurso: 'Este é o nosso Deus!'", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Isa. 25:1-9)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas (Testemunho Público)", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Explicando suas Crenças", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 144", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Confie plenamente em Jeová ao se preparar para um tratamento médico ou uma cirurgia", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "2026-01-26",
            startDate: "2026-01-26",
            endDate: "2026-02-01",
            dateRange: "26 Jan - 1 Fev",
            bibleReading: "Isaías 28-29",
            parts: [
                  { section: "treasures", title: "Discurso: Honre a Jeová com seus lábios e também com o seu coração", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Isa. 29:13-24)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 2, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Fazendo Discípulos", duration: 2, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Fazendo Discípulos", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 89", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Necessidades Locais", duration: 7, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },

      // ============================================
      // FEVEREIRO 2026 (mwb_T_202601)
      // ============================================
      {
            id: "2026-02-02",
            startDate: "2026-02-02",
            endDate: "2026-02-08",
            dateRange: "2-8 de Fevereiro",
            bibleReading: "Isaías 30-32",
            parts: [
                  { section: "treasures", title: "Discurso: Deixe que Jeová guie a sua vida", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Isa. 31:1-9)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 157", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Parte de Vida Cristã", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "2026-02-09",
            startDate: "2026-02-09",
            endDate: "2026-02-15",
            dateRange: "9-15 de Fevereiro",
            bibleReading: "Isaías 33-35",
            parts: [
                  { section: "treasures", title: "Discurso: Use bem as provisões de Jeová", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Isa. 35:1-10)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Discurso", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 41", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Necessidades Locais", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "2026-02-16",
            startDate: "2026-02-16",
            endDate: "2026-02-22",
            dateRange: "16-22 de Fevereiro",
            bibleReading: "Isaías 36-37",
            parts: [
                  { section: "treasures", title: "Discurso: Ataques de Satanás", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Isa. 37:14-23)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Explicando suas Crenças", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 118", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "'Em que se baseia a sua confiança?'", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "2026-02-23",
            startDate: "2026-02-23",
            endDate: "2026-03-01",
            dateRange: "23 Fev - 1 Mar",
            bibleReading: "Isaías 38-40",
            parts: [
                  { section: "treasures", title: "Discurso: 'Como um pastor ele cuidará do seu rebanho'", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Isa. 40:21-31)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 2, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 2, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 2, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Fazendo Discípulos", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 160", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Relatório anual de serviço", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },

      // ============================================
      // MARÇO 2026 (mwb_T_202603)
      // ============================================
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
                  { section: "living", title: "Cântico 19", duration: 3, type: "song", hasCounsel: false },
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
            parts: [
                  { section: "treasures", title: "Discurso: Uma profecia escrita 200 anos antes de se cumprir", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Isa. 44:9-20)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas (De casa em casa)", duration: 1, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas (Testemunho Informal)", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas (Testemunho Informal)", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 69", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Necessidades Locais", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "2026-03-16",
            startDate: "2026-03-16",
            endDate: "2026-03-22",
            dateRange: "16-22 de Março",
            bibleReading: "Isaías 45-47",
            parts: [
                  { section: "treasures", title: "Discurso: 'Eu sou Deus, e não há ninguém igual a mim'", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Isa. 45:1-11)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas (Testemunho Público)", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Fazendo Discípulos", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 38", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "A única fonte de ajuda em que podemos confiar", duration: 7, type: "talk", hasCounsel: false },
                  { section: "living", title: "Atualizações do Departamento Local de Projeto/Construção — 2026", duration: 8, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "2026-03-23",
            startDate: "2026-03-23",
            endDate: "2026-03-29",
            dateRange: "23-29 de Março",
            bibleReading: "Isaías 48-49",
            parts: [
                  { section: "treasures", title: "Discurso: Sinta os benefícios de prestar atenção ao que Jeová diz", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Isa. 48:9-20)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Fazendo Discípulos", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 107", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Leitura da Bíblia para a Celebração", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "2026-03-30",
            startDate: "2026-03-30",
            endDate: "2026-04-05",
            dateRange: "30 Mar - 5 Abr",
            bibleReading: "Isaías 50-51",
            parts: [
                  { section: "treasures", title: "Discurso: Jesus aprendeu com o Pai", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Isa. 50:1-11)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Fazendo Discípulos", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 99", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Parte de Vida Cristã", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },

      // ============================================
      // ABRIL 2026 (mwb_T_202603)
      // ============================================
      {
            id: "2026-04-06",
            startDate: "2026-04-06",
            endDate: "2026-04-12",
            dateRange: "6-12 de Abril",
            bibleReading: "Isaías 52-53",
            parts: [
                  { section: "treasures", title: "Discurso: Jesus foi 'levado como uma ovelha ao abate'", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Isa. 53:3-12)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Fazendo Discípulos", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 20", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Parte de Vida Cristã", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "2026-04-13",
            startDate: "2026-04-13",
            endDate: "2026-04-19",
            dateRange: "13-19 de Abril",
            bibleReading: "Isaías 54-55",
            parts: [
                  { section: "treasures", title: "Discurso: Venha comprar sem dinheiro!", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Isa. 54:1-10)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Fazendo Discípulos", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 97", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Parte de Vida Cristã", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "2026-04-20",
            startDate: "2026-04-20",
            endDate: "2026-04-26",
            dateRange: "20-26 de Abril",
            bibleReading: "Isaías 56-57",
            parts: [
                  { section: "treasures", title: "Discurso: Os maus não têm paz", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Isa. 56:4-12)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Fazendo Discípulos", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 58", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Parte de Vida Cristã", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "2026-04-27",
            startDate: "2026-04-27",
            endDate: "2026-05-03",
            dateRange: "27 Abr - 3 Mai",
            bibleReading: "Isaías 58-59",
            parts: [
                  { section: "treasures", title: "Discurso: Receba muitas bênçãos de Jeová", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Isa. 59:1-12)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Fazendo Discípulos", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 100", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Parte de Vida Cristã", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },

      // ============================================
      // MAIO 2026 (mwb_T_202605)
      // ============================================
      {
            id: "2026-05-04",
            startDate: "2026-05-04",
            endDate: "2026-05-10",
            dateRange: "4-10 de Maio",
            bibleReading: "Isaías 58-59",
            parts: [
                  { section: "treasures", title: "Discurso: Seja hospitaleiro", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Isa. 59:1-12)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Fazendo Discípulos", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 100", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Vídeo: Seja hospitaleiro", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "2026-05-11",
            startDate: "2026-05-11",
            endDate: "2026-05-17",
            dateRange: "11-17 de Maio",
            bibleReading: "Isaías 60-61",
            parts: [
                  { section: "treasures", title: "Discurso: 'Levante-se, ó mulher, deixe brilhar a sua luz'", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Isa. 61:1-9)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas (Testemunho Informal)", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse (Testemunho Informal)", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Fazendo Discípulos", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 156", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Necessidades Locais", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "2026-05-18",
            startDate: "2026-05-18",
            endDate: "2026-05-24",
            dateRange: "18-24 de Maio",
            bibleReading: "Isaías 62-64",
            parts: [
                  { section: "treasures", title: "Discurso: O Oleiro amoroso e cheio de compaixão", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Isa. 64:4-12)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas (Testemunho Público)", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Fazendo Discípulos", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 115", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Prepare-se para um desastre — Espere o inesperado", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "2026-05-25",
            startDate: "2026-05-25",
            endDate: "2026-05-31",
            dateRange: "25-31 de Maio",
            bibleReading: "Isaías 65-66",
            parts: [
                  { section: "treasures", title: "Discurso: Nós amamos nosso paraíso espiritual!", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Isa. 65:17-25)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas (Testemunho Informal)", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas (Testemunho Público)", duration: 2, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Fazendo Discípulos", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 80", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Parte de Vida Cristã", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },

      // ============================================
      // JUNHO 2026 (mwb_T_202605)
      // ============================================
      {
            id: "2026-06-01",
            startDate: "2026-06-01",
            endDate: "2026-06-07",
            dateRange: "1-7 de Junho",
            bibleReading: "Jeremias 1-3",
            parts: [
                  { section: "treasures", title: "Discurso: Jeová nos qualifica para fazer sua vontade", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Jer. 3:14-25)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Fazendo Discípulos", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 76", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Parte de Vida Cristã", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "2026-06-08",
            startDate: "2026-06-08",
            endDate: "2026-06-14",
            dateRange: "8-14 de Junho",
            bibleReading: "Jeremias 4-6",
            parts: [
                  { section: "treasures", title: "Discurso: Circuncide o seu coração", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Jer. 5:1-11)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Fazendo Discípulos", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 60", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Parte de Vida Cristã", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "2026-06-15",
            startDate: "2026-06-15",
            endDate: "2026-06-21",
            dateRange: "15-21 de Junho",
            bibleReading: "Jeremias 7-8",
            parts: [
                  { section: "treasures", title: "Discurso: Confie nos conselhos de Jeová", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Jer. 8:4-13)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Fazendo Discípulos", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 91", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Parte de Vida Cristã", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "2026-06-22",
            startDate: "2026-06-22",
            endDate: "2026-06-28",
            dateRange: "22-28 de Junho",
            bibleReading: "Jeremias 9-10",
            parts: [
                  { section: "treasures", title: "Discurso: Gloriar-se somente em Jeová", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Jer. 9:13-24)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Fazendo Discípulos", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 48", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Por que o Reino de Deus é a única esperança para a humanidade?", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "2026-06-29",
            startDate: "2026-06-29",
            endDate: "2026-07-05",
            dateRange: "29 Jun - 5 Jul",
            bibleReading: "Jeremias 11-12",
            parts: [
                  { section: "treasures", title: "Discurso: Aprenda a enfrentar dificuldades", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Jer. 12:1-11)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Fazendo Discípulos", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 109", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Parte de Vida Cristã", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },

      // ============================================
      // JULHO-AGOSTO 2026 (mwb_T_202607)
      // ============================================
      {
            id: "2026-07-06",
            startDate: "2026-07-06",
            endDate: "2026-07-12",
            dateRange: "6-12 de Julho",
            bibleReading: "Jeremias 13-15",
            parts: [
                  { section: "treasures", title: "Discurso: Jeová merece nossa obediência", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Jer. 13:1-14)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Discurso", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 49", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "“Obedecer é melhor do que um sacrifício”", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "2026-07-13",
            startDate: "2026-07-13",
            endDate: "2026-07-19",
            dateRange: "13-19 de Julho",
            bibleReading: "Jeremias 16-17",
            parts: [
                  { section: "treasures", title: "Discurso: Faz diferença em quem confiamos!", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Jer. 17:5-18)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Fazendo Discípulos", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 54", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Jovens, confiem nos conselhos da Bíblia", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "2026-07-20",
            startDate: "2026-07-20",
            endDate: "2026-07-26",
            dateRange: "20-26 de Julho",
            bibleReading: "Jeremias 18-19",
            parts: [
                  { section: "treasures", title: "Discurso: É possível se recuperar espiritualmente", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Jer. 19:1-11)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Explicando suas Crenças", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 38", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Como se recuperar espiritualmente", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "2026-07-27",
            startDate: "2026-07-27",
            endDate: "2026-08-02",
            dateRange: "27 Jul - 2 Ago",
            bibleReading: "Jeremias 20-21",
            parts: [
                  { section: "treasures", title: "Discurso: Ele pregou com coragem", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Jer. 20:7-18)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Explicando suas Crenças", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 57", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Seja adaptável — mostre interesse pessoal", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "2026-08-03",
            startDate: "2026-08-03",
            endDate: "2026-08-09",
            dateRange: "3-9 de Agosto",
            bibleReading: "Jeremias 22-23",
            parts: [
                  { section: "treasures", title: "Discurso: A importância de ter bons pastores", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Jer. 23:25-36)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Discurso", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 103", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Uma História Escrita por Jeová — O Corpo Governante Unido com os Irmãos — Parte 1", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "2026-08-10",
            startDate: "2026-08-10",
            endDate: "2026-08-16",
            dateRange: "10-16 de Agosto",
            bibleReading: "Jeremias 24-25",
            parts: [
                  { section: "treasures", title: "Discurso: Por que alguns “figos” eram bons e outros eram ruins?", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Jer. 24:1-10)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Fazendo Discípulos", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 65", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Necessidades Locais", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "2026-08-17",
            startDate: "2026-08-17",
            endDate: "2026-08-23",
            dateRange: "17-23 de Agosto",
            bibleReading: "Jeremias 26-28",
            parts: [
                  { section: "treasures", title: "Discurso: Não seja enganado por falsos profetas", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Jer. 28:5-17)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Fazendo Discípulos", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 16", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Necessidades Locais", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "2026-08-24",
            startDate: "2026-08-24",
            endDate: "2026-08-30",
            dateRange: "24-30 de Agosto",
            bibleReading: "Jeremias 29-30",
            parts: [
                  { section: "treasures", title: "Discurso: Jeová disciplina seus servos na medida certa", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Jer. 30:1-11)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Discurso", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 3", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Jeová dá esperança a seus servos", duration: 10, type: "talk", hasCounsel: false },
                  { section: "living", title: "Campanha especial em setembro", duration: 5, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "2026-08-31",
            startDate: "2026-08-31",
            endDate: "2026-09-06",
            dateRange: "31 Ago - 6 Set",
            bibleReading: "Jeremias 31",
            parts: [
                  { section: "treasures", title: "Discurso: “Farei . . . um novo pacto”", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Jer. 31:1-11)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Explicando suas Crenças", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 67", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Seja adaptável — Use o JW.ORG", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },

      // ============================================
      // SETEMBRO-OUTUBRO 2026 (mwb_T_202609)
      // ============================================
      {
            id: "2026-09-07",
            startDate: "2026-09-07",
            endDate: "2026-09-13",
            dateRange: "7-13 de Setembro",
            bibleReading: "Jeremias 32-33",
            parts: [
                  { section: "treasures", title: "Discurso: Meditar nas qualidades de Jeová fortalece a nossa fé", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Jer. 32:6-18)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 128", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Use seu tempo da melhor forma durante a campanha", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "2026-09-14",
            startDate: "2026-09-14",
            endDate: "2026-09-20",
            dateRange: "14-20 de Setembro",
            bibleReading: "Jeremias 34-35",
            parts: [
                  { section: "treasures", title: "Discurso: Jeová recompensa quem sempre é obediente a ele", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Jer. 35:1-14)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 2, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 2, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Fazendo Discípulos", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 121", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "O autodomínio nos ajuda a obedecer", duration: 6, type: "talk", hasCounsel: false },
                  { section: "living", title: "Realizações da Organização, setembro", duration: 9, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "2026-09-21",
            startDate: "2026-09-21",
            endDate: "2026-09-27",
            dateRange: "21-27 de Setembro",
            bibleReading: "Jeremias 36-37",
            parts: [
                  { section: "treasures", title: "Discurso: Jeová apoia aqueles que apoiam o Seu Reino", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Jer. 36:1-13)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "O Que Você Diria?", duration: 6, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 142", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Continue neutro no seu coração", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "2026-09-28",
            startDate: "2026-09-28",
            endDate: "2026-10-04",
            dateRange: "28 Set - 4 Out",
            bibleReading: "Jeremias 38-39",
            parts: [
                  { section: "treasures", title: "Discurso: Continuem ajudando uns aos outros", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Jer. 38:1-13)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "O Que Você Diria?", duration: 6, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 90", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "“Quem me Tocou?”", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "2026-10-05",
            startDate: "2026-10-05",
            endDate: "2026-10-11",
            dateRange: "5-11 de Outubro",
            bibleReading: "Jeremias 40-41",
            parts: [
                  { section: "treasures", title: "Discurso: Tenha o ponto de vista correto sobre a proteção de Jeová", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Jer. 40:1-10)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 2, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 2, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Explicando suas Crenças", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 17", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Jeová é o Protetor das viúvas", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "2026-10-12",
            startDate: "2026-10-12",
            endDate: "2026-10-18",
            dateRange: "12-18 de Outubro",
            bibleReading: "Jeremias 42-44",
            parts: [
                  { section: "treasures", title: "Discurso: Eles perguntaram o que fazer, mas não obedeceram", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Jer. 43:1-13)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "O Que Você Diria?", duration: 6, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 47", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Necessidades Locais", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "2026-10-19",
            startDate: "2026-10-19",
            endDate: "2026-10-25",
            dateRange: "19-25 de Outubro",
            bibleReading: "Jeremias 45-46",
            parts: [
                  { section: "treasures", title: "Discurso: Ter esperança é o segredo para o contentamento", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Jer. 46:13-24)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 2, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 2, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Discurso", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 117", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "‘Partilhe com outros o que você tem’", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "2026-10-26",
            startDate: "2026-10-26",
            endDate: "2026-11-01",
            dateRange: "26 Out - 1 Nov",
            bibleReading: "Jeremias 47-48",
            parts: [
                  { section: "treasures", title: "Discurso: Jeová é um Juiz justo e misericordioso", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Jer. 48:1-13)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Fazendo Discípulos", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 158", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Necessidades Locais", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },

      // ============================================
      // NOVEMBRO-DEZEMBRO 2026 (mwb_T_202611)
      // ============================================
      {
            id: "2026-11-02",
            startDate: "2026-11-02",
            endDate: "2026-11-08",
            dateRange: "2-8 de Novembro",
            bibleReading: "Jeremias 49-50",
            parts: [
                  { section: "treasures", title: "Discurso: Ajude outros a se beneficiar da misericórdia de Jeová", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Jer. 50:24-40)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Fazendo Discípulos", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 44", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Nunca se Esqueça do Que Jeová se Lembra", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "2026-11-09",
            startDate: "2026-11-09",
            endDate: "2026-11-15",
            dateRange: "9-15 de Novembro",
            bibleReading: "Jeremias 51-52",
            parts: [
                  { section: "treasures", title: "Discurso: Não siga o exemplo de Zedequias", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Jer. 52:6-20)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Discurso", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 10", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Nossos donativos dão glória ao belo nome de Jeová", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "2026-11-16",
            startDate: "2026-11-16",
            endDate: "2026-11-22",
            dateRange: "16-22 de Novembro",
            bibleReading: "Lamentações 1-2",
            parts: [
                  { section: "treasures", title: "Discurso: Uma reação compreensível diante de uma terrível perda", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Lam. 1:8-18)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "O Que Você Diria?", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 90", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Não se esqueça de nossos irmãos e irmãs inativos", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "2026-11-23",
            startDate: "2026-11-23",
            endDate: "2026-11-29",
            dateRange: "23-29 de Novembro",
            bibleReading: "Lamentações 3-5",
            parts: [
                  { section: "treasures", title: "Discurso: Não desista quando passar por provações", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Lam. 3:19-42)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Discurso", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 109", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Ajude os cuidadores a não desanimar", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "2026-11-30",
            startDate: "2026-11-30",
            endDate: "2026-12-06",
            dateRange: "30 Nov - 6 Dez",
            bibleReading: "Ezequiel 1-2",
            parts: [
                  { section: "treasures", title: "Discurso: Acompanhe o passo do carro celestial de Jeová", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Eze. 2:1-10)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Fazendo Discípulos", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Discurso", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 63", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Necessidades Locais", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "2026-12-07",
            startDate: "2026-12-07",
            endDate: "2026-12-13",
            dateRange: "7-13 de Dezembro",
            bibleReading: "Ezequiel 3-4",
            parts: [
                  { section: "treasures", title: "Discurso: Por que não temos medo de pregar?", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Eze. 3:16-27)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Fazendo Discípulos", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 161", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Necessidades Locais", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "2026-12-14",
            startDate: "2026-12-14",
            endDate: "2026-12-20",
            dateRange: "14-20 de Dezembro",
            bibleReading: "Ezequiel 5-6",
            parts: [
                  { section: "treasures", title: "Discurso: Pessoas que adoram ídolos deixam Jeová muito triste", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Eze. 6:1-10)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "O Que Você Diria?", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 153", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Por que não participamos de cerimônias nacionalistas?", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "2026-12-21",
            startDate: "2026-12-21",
            endDate: "2026-12-27",
            dateRange: "21-27 de Dezembro",
            bibleReading: "Ezequiel 7-8",
            parts: [
                  { section: "treasures", title: "Discurso: O dia de Jeová virá na hora certa", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Eze. 8:7-18)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Fazendo Discípulos", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 139", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Pense nas consequências", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
      {
            id: "2026-12-28",
            startDate: "2026-12-28",
            endDate: "2027-01-03",
            dateRange: "28 Dez - 3 Jan",
            bibleReading: "Ezequiel 9-10",
            parts: [
                  { section: "treasures", title: "Discurso: Ajude outros a sobreviver ao Armagedom", duration: 10, type: "talk", hasCounsel: false },
                  { section: "treasures", title: "Joias Espirituais", duration: 10, type: "gems", hasCounsel: false },
                  { section: "treasures", title: "Leitura da Bíblia (Eze. 9:1-11)", duration: 4, type: "bible_reading", hasCounsel: true },
                  { section: "ministry", title: "Iniciando Conversas", duration: 3, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Cultivando o Interesse", duration: 4, type: "ministry_part", hasCounsel: true },
                  { section: "ministry", title: "Explicando suas Crenças", duration: 5, type: "ministry_part", hasCounsel: true },
                  { section: "living", title: "Cântico 60", duration: 3, type: "song", hasCounsel: false },
                  { section: "living", title: "Salve a si mesmo e a quem escuta você", duration: 15, type: "talk", hasCounsel: false },
                  { section: "living", title: "Estudo Bíblico de Congregação", duration: 30, type: "cbs", hasCounsel: false }
            ]
      },
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
