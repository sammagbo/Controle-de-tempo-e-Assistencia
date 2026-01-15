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
    let currentSection: SectionKey | null = null;

    // Regex padrões para identificar seções e tempos
    const timeRegex = /(\d{1,2})\s*min/;

    // Índices para ajudar a não repetir IDs
    let tesourosCount = 1;
    let ministerioCount = 1;
    let vidaCristaCount = 1;

    // Normalizar linhas: remover vazias e trim
    const cleanLines = lines.map(l => l.trim()).filter(l => l.length > 0);

    // Iterar pelas linhas para encontrar padrões
    for (let i = 0; i < cleanLines.length; i++) {
        const line = cleanLines[i];
        const upperLine = line.toUpperCase();

        // === DETECÇÃO DE SEÇÃO ===
        if (upperLine.includes('TESOUROS DA PALAVRA DE DEUS')) {
            currentSection = 'tesouros';
            continue;
        } else if (upperLine.includes('FAÇA SEU MELHOR NO MINISTÉRIO')) {
            currentSection = 'ministerio';
            continue;
        } else if (upperLine.includes('NOSSA VIDA CRISTÃ')) {
            currentSection = 'vida_crista';
            continue;
        }

        if (!currentSection) continue;

        // === PARSING DE PARTES POR SEÇÃO ===

        // TESOUROS
        if (currentSection === 'tesouros') {
            // Procurar Discurso (geralmente primeira parte)
            // Ex: "10 min: Discurso..." ou apenas "Discurso... 10 min"
            if (line.toLowerCase().includes('discurso') && !line.toLowerCase().includes('estudante')) {
                // Se ainda não temos discurso, adiciona
                // Mas o template já tem, talvez seja melhor detectar o TEMA
                // Vamos simplificar: Se detectar uma linha com 'min', assume que é uma parte
            }

            // Joias Espirituais
            if (line.toLowerCase().includes('joias espirituais')) {
                // Nada a fazer, é fixo
            }

            // Leitura
            if (line.toLowerCase().includes('leitura da bíblia')) {
                // extrair o texto da leitura se possível (ex: Salmo 23-25)
            }
        }

        // MINISTÉRIO
        if (currentSection === 'ministerio') {
            // As partes aqui variam. Ex: "Iniciando conversas (3 min)"
            // Vamos tentar pegar linhas que começam com texto e tem tempo.
            if (timeRegex.test(line)) {
                const timeMatch = line.match(timeRegex);
                const minutes = timeMatch ? parseInt(timeMatch[1]) : 0;

                // Tenta limpar o tempo do título
                const title = line.replace(timeRegex, '').replace(/[\(\):]/g, '').trim();

                // Ignorar se for muito curto ou parecer lixo
                if (title.length < 3) continue;

                parts.push({
                    id: `imported-ministerio-${ministerioCount++}`,
                    title: title,
                    estimatedMinutes: minutes,
                    section: 'ministerio',
                    allowsComments: false, // Padrão S-38-T para partes de aluno
                    requiresPostComment: true // Padrão S-38-T
                });
            }
        }

        // VIDA CRISTÃ
        if (currentSection === 'vida_crista') {
            // Cântico
            if (line.toLowerCase().startsWith('cântico')) {
                continue; // Cânticos são fixos na ordem, mas podemos extrair o número
            }

            // Partes variáveis
            // Geralmente: "15 min: Necessidades locais" ou Título específico
            if (timeRegex.test(line)) {
                const timeMatch = line.match(timeRegex);
                const minutes = timeMatch ? parseInt(timeMatch[1]) : 0;

                // Estudo Bíblico é fixo, não precisamos duplicar se não quisermos, 
                // ou podemos substituir o título "Estudo Bíblico de Congregação" pelo livro/capítulo
                if (line.toLowerCase().includes('estudo bíblico de congregação')) {
                    continue; // Mantém o fixo
                }

                const title = line.replace(timeRegex, '').replace(/[\(\):]/g, '').trim();

                // Ignora se for oração final
                if (title.toLowerCase().includes('oração')) continue;

                parts.push({
                    id: `imported-vidacrista-${vidaCristaCount++}`,
                    title: title,
                    estimatedMinutes: minutes,
                    section: 'vida_crista',
                    allowsComments: true, // Geralmente partes de vida cristã permitem comentários
                    requiresPostComment: false
                });
            }
        }
    }

    // Se não encontrou nada (parsing falhou ou PDF complexo), retorna vazio
    // O ideal seria retornar o que encontrou para o usuário revisar
    return parts;
};
