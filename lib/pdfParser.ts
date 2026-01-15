import * as pdfjsLib from 'pdfjs-dist';
import { MeetingPart, MEETING_SECTIONS, SectionKey } from './meetingTemplate';

// Configurar o worker do PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface ExtractedLine {
    text: string;
    y: number; // Posição vertical para ajudar na ordem
}

export const parseMeetingPDF = async (file: File): Promise<Partial<MeetingPart>[]> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    // Vamos ler todas as páginas (geralmente é 1 ou 2 páginas relevantes, mas a apostila tem várias)
    // Precisamos de uma estratégia para encontrar a "semana atual" ou processar tudo.
    // Por simplificação inicial, vamos ler o texto da primeira página ou procurar uma data específica.
    // Mas como o usuário vai fazer upload, talvez ele faça upload apenas da página da semana ou a apostila toda.
    // Vamos extrair todo o texto e tentar identificar a estrutura de UMA reunião.

    let fullText: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str);
        fullText = [...fullText, ...pageText];
    }

    return processTextLines(fullText);
};

const processTextLines = (lines: string[]): Partial<MeetingPart>[] => {
    const parts: Partial<MeetingPart>[] = [];

    // Estratégia "Big String": Juntar tudo para lidar com PDFs que vêm fragmentados (letras soltas)
    // O teste mostrou que join('') recupera "NOSSA VIDA..." mas pode perder espaços em quebras de linha.
    // Vamos tentar um join(' ') e limpar espaços duplos, ou join('') se os items já tiverem espaços.
    // Dado o log "NOSSA VIDA...", parece que alguns items têm espaço.
    // Vamos usar join('') e depois tentar espaçar palavras coladas se necessário, ou usar regex flexível.

    const fullContent = lines.join('').replace(/\s+/g, ' '); // Unifica espaços

    // Regex para encontrar as seções principais (ignorando case, acentos e espaços extras)
    // O PDF pode separar acentos: 'MINIST ´ERIO', 'FA ¸CA', etc.
    // Usamos pontos '.' para casar qualquer coisa no lugar dos caracteres acentuados/espaços

    const tesourosMatch = fullContent.match(/TESOUROS\s*DA\s*PALAVRA/i);
    const ministerioMatch = fullContent.match(/FA.A\s*SEU\s*MELHOR\s*NO\s*MINIST/i);
    const vidaCristaMatch = fullContent.match(/NOSSA\s*VIDA\s*CRIST/i);

    // Índices de início
    const tesourosIndex = tesourosMatch?.index ?? -1;
    const ministerioIndex = ministerioMatch?.index ?? -1;
    const vidaCristaIndex = vidaCristaMatch?.index ?? -1;

    // Se não achou algo vital, aborta
    if (tesourosIndex === -1 || ministerioIndex === -1 || vidaCristaIndex === -1) {
        console.warn("Não foi possível identificar todas as seções no texto extraído.");
        // Tenta fallback? Não, melhor retornar vazio para o usuário saber.
        return [];
    }

    // Cortar o texto em blocos
    // Tesouros vai do início (ou match) até Ministério
    // Ministério vai até Vida Cristã
    // Vida Cristã vai até o fim (ou até "Comentários Finais", mas geralmente o fim da semana serve)

    const ministerioBlock = fullContent.substring(ministerioIndex, vidaCristaIndex);
    const vidaCristaBlock = fullContent.substring(vidaCristaIndex);

    // === PARSING MINISTÉRIO ===
    // Padrão esperado: "Título da Parte (X min)" ou "X min: Título"
    // No "Big String", pode aparecer algo como: "Iniciando conversas 3 min"

    // Vamos procurar padrões de tempo "X min" e pegar o texto ANTERIOR como título.
    // Regex: ([A-Za-zÀ-ÿ\s]+?)\s*(\d{1,2})\s*min
    // O '?' faz o match ser não-guloso (pegar o menor texto possível antes do número)

    const partRegex = /([A-Za-zÀ-ÿ0-9\s:()-]+?)\s+(\d{1,2})\s*min/g;

    // Extrair Ministério
    let match;
    let minCount = 1;

    // Reiniciar regex state ou criar novo loop
    while ((match = partRegex.exec(ministerioBlock)) !== null) {
        // Ignorar o próprio título da seção
        if (match[0].toUpperCase().includes('MELHOR NO MINISTÉRIO')) continue;

        let title = match[1].trim();
        const mins = parseInt(match[2]);

        // Limpeza do título (pode ter pego lixo anterior)
        // Geralmente pegamos os últimos X caracteres ou olhamos pontuação
        // Hack: Se tiver mais de 50 caracteres, provavelmente pegou texto da parte anterior.
        if (title.length > 50) {
            title = title.substring(title.length - 50);
            // Tentar cortar no último ponto ou letra maiúscula
            const lastPeriod = title.lastIndexOf('.');
            if (lastPeriod !== -1) title = title.substring(lastPeriod + 1);
        }

        title = title.trim();
        if (title.length < 3) continue;

        parts.push({
            id: `imp-min-${minCount++}`,
            title: title,
            estimatedMinutes: mins,
            section: 'ministerio',
            allowsComments: false,
            requiresPostComment: true
        });
    }

    // === PARSING VIDA CRISTÃ ===
    let vcCount = 1;
    const vcRegex = /([A-Za-zÀ-ÿ0-9\s:()-]+?)\s+(\d{1,2})\s*min/g; // Nova instância regex

    while ((match = vcRegex.exec(vidaCristaBlock)) !== null) {
        if (match[0].toUpperCase().includes('NOSSA VIDA CRISTÃ')) continue;

        let title = match[1].trim();
        const mins = parseInt(match[2]);

        // Filtros específicos
        if (title.includes('Cântico')) continue;
        if (title.includes('Estudo Bíblico')) continue;
        if (title.includes('Oração')) continue;

        // Limpeza do título
        if (title.length > 60) {
            title = title.substring(title.length - 60);
            const lastPeriod = title.lastIndexOf('.');
            if (lastPeriod !== -1) title = title.substring(lastPeriod + 1);
        }
        title = title.trim();

        if (title.length < 3) continue;

        parts.push({
            id: `imp-vc-${vcCount++}`,
            title: title,
            estimatedMinutes: mins,
            section: 'vida_crista',
            allowsComments: true,
            requiresPostComment: false
        });
    }

    return parts;
};
