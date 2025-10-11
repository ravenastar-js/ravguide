/**
 * 🎨 Sistema de Boxes e Cores Padronizadas
 * 📦 Geração responsiva de boxes com estética consistente
 * 🎯 Sistema de cores pastel para menus e interfaces
 */

const chalk = require('chalk');
const boxen = require('boxen');
const figlet = require('figlet');
const { readFileSync } = require('fs');
const { join } = require('path');

/**
 * 🎨 Sistema de Cores Pastel - Paleta consistente para toda a aplicação
 * @namespace colors
 */
const colors = {
    // 🟡 Cores para opções principais
    ravenastar: chalk.hex("#06D6A0"),
    option: chalk.hex('#FFD166'),       // Amarelo pastel
    action: chalk.hex('#57f287'),       // Verde limão pastel
    danger: chalk.hex('#EF476F'),       // Vermelho claro pastel
    info: chalk.hex('#118AB2'),         // Azul pastel
    secondary: chalk.hex('#8A89C0'),    // Lilás pastel
    success: chalk.hex('#83C5BE'),      // Verde água pastel

    // 🎨 Cores para conteúdo
    title: chalk.hex('#57f287'),        // Magenta
    subtitle: chalk.hex('#ffffffff'),   // Azul médio
    highlight: chalk.hex('#F18F01'),
    highlight2: chalk.hex('#f8e789'),   // Laranja
    text: chalk.hex('#E9ECEF'),         // Branco suave
    muted: chalk.hex('#7F8C8D'),        // Cinza
    link: chalk.hex('#8ad4ff')          // Azul link
};

/**
 * 📦 Obtém versão do package.json
 * @returns {string} 🏷️ Versão da aplicação ou '1.0.0' como fallback
 * @throws {Error} 🚨 Se não conseguir ler ou parsear o package.json
 */
function getVersion() {
    try {
        const packagePath = join(__dirname, '..', 'package.json');
        return JSON.parse(readFileSync(packagePath, 'utf8')).version || '1.0.0';
    } catch (error) {
        return '1.0.0';
    }
}

/**
 * 📱 Detecta se está em dispositivo móvel (Termux)
 * @returns {boolean} 📊 true se for dispositivo móvel, false caso contrário
 */
function isMobileDevice() {
    return process.env.TERM === 'xterm-256color' &&
        (process.env.TERM_PROGRAM === 'Termux' ||
            process.env.PREFIX && process.env.PREFIX.includes('com.termux'));
}

/**
 * 📏 Obtém largura do terminal atual
 * @returns {number} 📐 Largura em colunas (80 como fallback)
 */
function getTerminalWidth() {
    return process.stdout.columns || 80;
}

/**
 * 🔄 Calcula largura responsiva para boxes baseada no dispositivo
 * @param {number} baseWidth - Largura base desejada
 * @param {number} minWidth - Largura mínima permitida
 * @param {number} maxWidth - Largura máxima permitida
 * @returns {number} 📐 Largura calculada e ajustada
 */
function getResponsiveWidth(baseWidth = 60, minWidth = 40, maxWidth = 100) {
    const terminalWidth = getTerminalWidth();
    const isMobile = isMobileDevice();

    if (isMobile) {
        return Math.min(Math.max(terminalWidth - 4, minWidth), maxWidth);
    }

    return Math.min(Math.max(terminalWidth - 8, minWidth), maxWidth);
}

/**
 * 🎨 Cria banner compacto otimizado para dispositivos móveis
 * @returns {string} 🖼️ Banner formatado para mobile
 */
function createCompactBanner() {
    const version = getVersion();
    const width = getResponsiveWidth(50, 35, 60);

    const bannerText = colors.action(
        figlet.textSync('ravguide', { font: 'Standard', horizontalLayout: 'default' })
    );

    const content = [
        bannerText,
        colors.subtitle('Guia de Segurança Digital via CLI/NPM'),
        '',
        colors.highlight2(`🌱 v${version}`),
        '',
        colors.text('Feito com ') + colors.danger('💚') + colors.text(' por ') + colors.ravenastar('RavenaStar'),
        colors.link.underline('https://ravenastar.link\n'),
        colors.text('🔒 ') + colors.link.underline('https://secguide.pages.dev'),
        '',
        colors.text('📱 Compatível com Termux'),
        colors.text('📚 Modular • 🎯 Rápido • 🔧 Expansível')
    ].join('\n');

    return boxen(content, {
        padding: 1,
        margin: 1,
        borderColor: '#57f287',
        borderStyle: 'classic',
        backgroundColor: '#1a1a1a',
        width: width,
        textAlignment: 'center'
    });
}

/**
 * 🖥️ Cria banner completo para desktop com arte ASCII
 * @returns {string} 🖼️ Banner formatado para desktop
 */
function createDesktopBanner() {
    const version = getVersion();
    const width = getResponsiveWidth(80, 60, 100);

    const bannerText = colors.action(
        figlet.textSync('ravguide', { font: 'Standard', horizontalLayout: 'default' })
    );

    const content = [
        bannerText,
        colors.highlight2(`🌱 v${version}`),
        '',
        colors.subtitle('📖  Guia de Segurança Digital via CLI/NPM'),
        '',
        colors.text('Feito com ') + colors.danger('💚') + colors.text(' por ') + colors.ravenastar.bold('RavenaStar'),
        colors.link.underline('https://ravenastar.link\n'),
        colors.text('🔒 ') + colors.link.underline('https://secguide.pages.dev'),
        '',
        colors.text('📱 Compatível com Termux'),
        colors.text('📚 Modular • 🎯 Rápido • 🔧 Expansível')
    ].join('\n');

    return boxen(content, {
        padding: 1,
        margin: 1,
        borderColor: '#57f287',
        borderStyle: 'classic',
        backgroundColor: '#1a1a1a',
        width: width,
        textAlignment: 'center'
    });
}

/**
 * 🖼️ Exibe header apropriado baseado no dispositivo e tamanho do terminal
 * @returns {void} 📤 Não retorna valor - apenas exibe no console
 */
function displayHeader() {
    console.clear();
    const banner = isMobileDevice() || getTerminalWidth() < 80
        ? createCompactBanner()
        : createDesktopBanner();
    console.log(banner);
}

/**
 * 🔤 Quebra texto inteligente mantendo palavras inteiras
 * @param {string} text - Texto original a ser quebrado
 * @param {number} maxWidth - Largura máxima por linha
 * @returns {string} 📝 Texto quebrado em múltiplas linhas
 */
function wrapTextIntelligent(text, maxWidth) {
    if (!text || typeof text !== 'string') return '';
    if (text.length <= maxWidth) return text;

    const lines = [];
    let currentLine = '';
    const words = text.split(' ');

    for (let i = 0; i < words.length; i++) {
        const word = words[i];

        // 🎯 Se a palavra é muito longa, quebra ela
        if (word.length > maxWidth) {
            // Se já tem conteúdo na linha atual, salva primeiro
            if (currentLine) {
                lines.push(currentLine.trim());
                currentLine = '';
            }

            // Quebra a palavra longa
            for (let j = 0; j < word.length; j += maxWidth) {
                const chunk = word.substring(j, j + maxWidth);
                if (chunk) lines.push(chunk);
            }
            continue;
        }

        // 🎯 Testa se a palavra cabe na linha atual
        const testLine = currentLine ? `${currentLine} ${word}` : word;

        if (testLine.length <= maxWidth) {
            currentLine = testLine;
        } else {
            // Não cabe, salva a linha atual e começa nova
            if (currentLine) {
                lines.push(currentLine.trim());
            }
            currentLine = word;
        }
    }

    // 🎯 Adiciona a última linha se houver conteúdo
    if (currentLine) {
        lines.push(currentLine.trim());
    }

    return lines.join('\n');
}

/**
 * 🔗 Detecta e formata URLs no texto com cores e sublinhado
 * @param {string} text - Texto original que pode conter URLs
 * @returns {string} 📝 Texto com URLs formatadas visualmente
 */
function formatUrlsInText(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, url => colors.link.underline(url));
}

/**
 * 📦 Cria box de conteúdo responsivo para passos e tutoriais
 * @param {string} title - Título do box
 * @param {string} content - Conteúdo do box
 * @param {Object} options - Opções adicionais do box
 * @returns {string} 📦 Box formatado e estilizado
 */
function createStepBox(title, content, options = {}) {
    const isMobile = isMobileDevice();
    const width = getResponsiveWidth(60, 45, 80);

    // Processa o conteúdo
    const formattedContent = formatUrlsInText(content);
    const wrappedContent = wrapTextIntelligent(formattedContent, width - 8);

    const boxContent = [
        colors.title.bold(title),
        '',
        colors.text(wrappedContent)
    ].join('\n');

    return boxen(boxContent, {
        padding: 1,
        margin: 1,
        borderColor: '#57f287',
        borderStyle: 'classic',
        backgroundColor: '#1a1a1a',
        width: width,
        textAlignment: 'center'
    });
}

/**
 * 📦 Cria box de conteúdo simples para informações gerais
 * @param {string} title - Título do conteúdo
 * @param {any} content - Conteúdo a ser exibido (string ou qualquer tipo)
 * @returns {string} 📦 Box formatado com título e conteúdo
 */
function createSimpleContentBox(title, content) {
    const isMobile = isMobileDevice();
    const width = getResponsiveWidth(60, 45, 80);

    let contentText = '';

    if (typeof content === 'string') {
        contentText = formatUrlsInText(content);
    } else {
        contentText = String(content);
    }

    // 🎯 Quebrar texto inteligentemente
    const wrappedContent = wrapTextIntelligent(contentText, width - 8);

    const boxContent = [
        colors.title.bold(`📖 ${title}`),
        colors.muted('─'.repeat(width - 12)),
        '',
        colors.text(wrappedContent)
    ].join('\n');

    return boxen(boxContent, {
        padding: 1,
        margin: { bottom: 1 },
        borderStyle: 'classic',
        borderColor: "#57f287",
        backgroundColor: '#1a1a1a',
        width: width,
        textAlignment: 'left'
    });
}

/**
 * 🛠️ Cria box de ferramenta com informações completas
 * @param {Object} tool - Dados da ferramenta
 * @param {string} tool.name - Nome da ferramenta
 * @param {string} tool.link - URL da ferramenta
 * @param {string} tool.description - Descrição da ferramenta
 * @param {string} tool.id - ID único da ferramenta
 * @param {string} category - Categoria da ferramenta
 * @returns {string} 📦 Box formatado da ferramenta
 */
function createToolBox(tool, category) {
    const isMobile = isMobileDevice();
    const width = getResponsiveWidth(55, 40, 70);

    const toolName = tool.name || 'Ferramenta sem nome';
    const toolLink = tool.link ? colors.link.underline(tool.link) : 'Link não disponível';
    const toolDescription = tool.description ? wrapTextIntelligent(tool.description, width - 8) : '';

    // 🎯 Quebrar o nome da ferramenta se for muito longo
    const wrappedToolName = wrapTextIntelligent(toolName, width - 8);

    const contentLines = [
        colors.subtitle.bold(`🛠️ ${wrappedToolName}`),
        ''
    ];

    if (toolDescription) {
        contentLines.push(colors.text(toolDescription), '');
    }

    contentLines.push(
        colors.text('🔗 ') + toolLink,
        "",
        colors.highlight2('📁 ID: ' + (tool.id || 'N/A')),
        colors.highlight2('📂 ' + category)
    );

    const content = contentLines.join('\n');

    return boxen(content, {
        padding: 1,
        margin: 1,
        borderColor: '#57f287',
        borderStyle: 'classic',
        backgroundColor: '#1a1a1a',
        width: width,
        textAlignment: 'center'
    });
}

/**
 * 🏢 Cria box de plataforma com informações de contato
 * @param {Object} platform - Dados da plataforma
 * @param {string} platform.message_pt - Mensagem em português
 * @param {string} platform.type - Tipo de contato (email, form, multiple)
 * @param {string|Array} platform.contact - Informações de contato
 * @param {string} platform.description_pt - Descrição em português
 * @param {string} platformName - Nome da plataforma
 * @returns {string} 📦 Box formatado da plataforma
 */
function createPlatformBox(platform, platformName) {
    const isMobile = isMobileDevice();
    const width = getResponsiveWidth(60, 45, 75);

    const contentLines = [
        colors.title.bold(`🏢 ${platformName}`),
        colors.subtitle('─'.repeat(width - 12)),
        ''
    ];

    // 🎯 Mensagem principal
    if (platform.message_pt) {
        const message = wrapTextIntelligent(platform.message_pt, width - 6);
        contentLines.push(colors.text(message), '');
    }

    // 🎯 Informações de contato
    if (platform.type === 'email') {
        contentLines.push(
            colors.success('📧 E-mail: ') + colors.link(platform.contact)
        );
    } else if (platform.type === 'form') {
        contentLines.push(
            colors.success('📝 Formulário: ') + colors.link.underline(platform.contact)
        );
    } else if (platform.type === 'multiple' && Array.isArray(platform.contacts)) {
        platform.contacts.forEach((contact, index) => {
            const contactType = contact.type === 'email' ?
                colors.success('📧 E-mail') :
                contact.type === 'form' ?
                    colors.success('📝 Formulário') :
                    colors.info('📞 Contato');

            contentLines.push(
                `${contactType}: ${colors.link.underline(contact.contact)}`
            );
        });
    }

    if (platform.description_pt) {
        contentLines.push('', colors.muted(wrapTextIntelligent(platform.description_pt, width - 6)));
    }

    const content = contentLines.join('\n');

    return boxen(content, {
        padding: 1,
        margin: 1,
        borderColor: '#57f287',
        borderStyle: 'classic',
        backgroundColor: '#1a1a1a',
        width: width,
        textAlignment: 'center'
    });
}

/**
 * 📋 Cria menu de opções com cores padronizadas e responsivas
 * @param {Array} choices - Opções do menu
 * @param {string} message - Mensagem do menu
 * @returns {Object} ⚙️ Configuração do menu Inquirer formatada
 */
function createMenu(choices, message = '🎯 Selecione uma opção:') {
    const isMobile = isMobileDevice();

    const coloredChoices = choices.map(choice => {
        // 🎯 Lida com separadores e choices inválidos
        if (!choice || choice.type === 'separator') {
            return choice;
        }

        // 🎯 Garante que choice.name existe
        const choiceName = choice.name || choice.value || 'Opção sem nome';

        let coloredName = choiceName;

        // 🎯 Aplica cores baseadas no conteúdo da opção
        if (choiceName.includes('❌') || choiceName.includes('Sair') || choiceName.includes('Exit')) {
            coloredName = colors.danger(choiceName);
        } else if (choiceName.includes('↩️') || choiceName.includes('Voltar') || choiceName.includes('Back')) {
            coloredName = colors.action(choiceName);
        } else if (choiceName.includes('🛠️') || choiceName.includes('🔍') || choiceName.includes('Ferramenta')) {
            coloredName = colors.option(choiceName);
        } else if (choiceName.includes('🏢') || choiceName.includes('Plataforma')) {
            coloredName = colors.info(choiceName);
        } else if (choiceName.includes('📁') || choiceName.includes('Categoria')) {
            coloredName = colors.secondary(choiceName);
        } else {
            coloredName = colors.option(choiceName);
        }

        return {
            ...choice,
            name: coloredName
        };
    });

    return {
        type: 'list',
        name: 'selectedOption',
        message: colors.option(message),
        choices: coloredChoices,
        pageSize: isMobile ? 8 : 12,
        loop: false
    };
}

/**
 * 🚨 Cria box de erro com destaque visual
 * @param {string} message - Mensagem de erro a ser exibida
 * @returns {string} 📦 Box de erro formatado
 */
function createErrorBox(message) {
    const width = getResponsiveWidth(50, 35, 70);

    return boxen(colors.danger(`❌ ${message}`), {
        padding: 1,
        margin: 1,
        borderStyle: 'classic',
        borderColor: 'red',
        backgroundColor: '#2a1a1a',
        width: width,
        textAlignment: 'center'
    });
}

/**
 * ✅ Cria box de sucesso com destaque visual
 * @param {string} message - Mensagem de sucesso a ser exibida
 * @returns {string} 📦 Box de sucesso formatado
 */
function createSuccessBox(message) {
    const width = getResponsiveWidth(50, 35, 70);

    return boxen(colors.success(`✅ ${message}`), {
        padding: 1,
        margin: 1,
        borderStyle: 'classic',
        borderColor: 'green',
        backgroundColor: '#1a2a1a',
        width: width,
        textAlignment: 'center'
    });
}

module.exports = {
    // 🎨 Sistema de cores
    colors,

    // 📦 Funções de box principais
    createStepBox,
    createSimpleContentBox,
    createToolBox,
    createPlatformBox,
    createErrorBox,
    createSuccessBox,

    // 📋 Sistema de menus
    createMenu,

    // 🖼️ Header e utilitários
    displayHeader,
    isMobileDevice,
    getTerminalWidth,

    // 🔧 Funções de processamento
    wrapTextIntelligent,
    formatUrlsInText
};
