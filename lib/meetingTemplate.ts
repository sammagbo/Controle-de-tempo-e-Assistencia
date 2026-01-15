// Template padrão da Reunião do Meio de Semana
// Baseado na estrutura oficial

export interface MeetingPart {
    id: string;
    title: string;
    estimatedMinutes: number;
    section: 'abertura' | 'tesouros' | 'ministerio' | 'vida_crista' | 'encerramento';
    allowsComments: boolean;
    requiresPostComment: boolean;
}

export const MEETING_SECTIONS = {
    abertura: {
        label: 'Abertura',
        color: 'gray',
        icon: 'meeting_room',
    },
    tesouros: {
        label: 'Tesouros da Palavra de Deus',
        color: 'amber',
        icon: 'auto_stories',
    },
    ministerio: {
        label: 'Faça Seu Melhor no Ministério',
        color: 'green',
        icon: 'school',
    },
    vida_crista: {
        label: 'Nossa Vida Cristã',
        color: 'purple',
        icon: 'favorite',
    },
    encerramento: {
        label: 'Encerramento',
        color: 'gray',
        icon: 'flag',
    },
} as const;

export type SectionKey = keyof typeof MEETING_SECTIONS;

// Template padrão das partes da reunião
export const DEFAULT_MEETING_TEMPLATE: MeetingPart[] = [
    // === ABERTURA ===
    {
        id: 'abertura-1',
        title: 'Cântico e Oração',
        estimatedMinutes: 5,
        section: 'abertura',
        allowsComments: false,
        requiresPostComment: false,
    },
    {
        id: 'abertura-2',
        title: 'Comentários Iniciais',
        estimatedMinutes: 1,
        section: 'abertura',
        allowsComments: false,
        requiresPostComment: false,
    },

    // === TESOUROS DA PALAVRA DE DEUS ===
    {
        id: 'tesouros-1',
        title: 'Discurso de Tesouros',
        estimatedMinutes: 10,
        section: 'tesouros',
        allowsComments: false,
        requiresPostComment: false,
    },
    {
        id: 'tesouros-2',
        title: 'Joias Espirituais',
        estimatedMinutes: 10,
        section: 'tesouros',
        allowsComments: true, // Parte de perguntas e respostas
        requiresPostComment: false,
    },
    {
        id: 'tesouros-3',
        title: 'Leitura da Bíblia',
        estimatedMinutes: 4,
        section: 'tesouros',
        allowsComments: false, // Não há comentário DEPOIS aqui neste flag, usamos requiresPostComment
        requiresPostComment: true, // Presidente faz comentário breve após
    },

    // === FAÇA SEU MELHOR NO MINISTÉRIO ===
    // As partes aqui variam, mas sempre requerem comentário do instrutor
    {
        id: 'ministerio-1',
        title: 'Iniciando Conversas',
        estimatedMinutes: 3,
        section: 'ministerio',
        allowsComments: false,
        requiresPostComment: true,
    },
    {
        id: 'ministerio-2',
        title: 'Cultivando o Interesse',
        estimatedMinutes: 4,
        section: 'ministerio',
        allowsComments: false,
        requiresPostComment: true,
    },
    {
        id: 'ministerio-3',
        title: 'Fazendo Discípulos',
        estimatedMinutes: 5,
        section: 'ministerio',
        allowsComments: false,
        requiresPostComment: true,
    },
    // Nota: Às vezes há discurso de estudante, explicacao de crencas, etc.
    // O usuário pode editar no Setup.

    // === NOSSA VIDA CRISTÃ ===
    {
        id: 'vida-crista-1',
        title: 'Cântico',
        estimatedMinutes: 5,
        section: 'vida_crista',
        allowsComments: false,
        requiresPostComment: false,
    },
    {
        id: 'vida-crista-2',
        title: 'Parte Local / Necessidades',
        estimatedMinutes: 15,
        section: 'vida_crista',
        allowsComments: true, // Podem ter perguntas (Opcional)
        requiresPostComment: false,
    },
    {
        id: 'vida-crista-3',
        title: 'Estudo Bíblico de Congregação',
        estimatedMinutes: 30,
        section: 'vida_crista',
        allowsComments: true, // Muito interativo
        requiresPostComment: false,
    },

    // === ENCERRAMENTO ===
    {
        id: 'encerramento-1',
        title: 'Comentários Finais',
        estimatedMinutes: 3,
        section: 'encerramento',
        allowsComments: true, // Pode haver breves comentários
        requiresPostComment: false,
    },
    {
        id: 'encerramento-2',
        title: 'Cântico e Oração Final',
        estimatedMinutes: 5,
        section: 'encerramento',
        allowsComments: false,
        requiresPostComment: false,
    },
];

// Cores para cada seção (Tailwind classes)
export const SECTION_COLORS: Record<SectionKey, { bg: string; text: string; border: string }> = {
    abertura: {
        bg: 'bg-gray-100 dark:bg-gray-800',
        text: 'text-gray-700 dark:text-gray-300',
        border: 'border-gray-300 dark:border-gray-600',
    },
    tesouros: {
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-300 dark:border-amber-700',
    },
    ministerio: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-700 dark:text-green-400',
        border: 'border-green-300 dark:border-green-700',
    },
    vida_crista: {
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        text: 'text-purple-700 dark:text-purple-400',
        border: 'border-purple-300 dark:border-purple-700',
    },
    encerramento: {
        bg: 'bg-gray-100 dark:bg-gray-800',
        text: 'text-gray-700 dark:text-gray-300',
        border: 'border-gray-300 dark:border-gray-600',
    },
};

// Função para calcular tempo total estimado
export const getTotalEstimatedMinutes = (parts: MeetingPart[]): number => {
    return parts.reduce((sum, part) => {
        let partTime = part.estimatedMinutes;
        // Adiciona 1 minuto extra se houver análise/conselho do instrutor (padrão S-38-T)
        if (part.requiresPostComment) {
            partTime += 1;
        }
        return sum + partTime;
    }, 0);
};
