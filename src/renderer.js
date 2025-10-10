/**
 * 🎨 Sistema de Renderização e Interface
 * 📱 Renderiza conteúdo de forma adaptativa para diferentes dispositivos
 * 🎯 Formatação inteligente com suporte a cores e layouts responsivos
 */

const chalk = require('chalk');
const boxen = require('boxen');
const figlet = require('figlet');
const { readFileSync } = require('fs');
const { join } = require('path');

/**
 * 📦 Obtém versão do package.json
 * @returns {string} Versão da aplicação
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
 * @returns {boolean} true se for dispositivo móvel
 */
function isMobileDevice() {
    return process.env.TERM === 'xterm-256color' &&
        (process.env.TERM_PROGRAM === 'Termux' ||
            process.env.PREFIX && process.env.PREFIX.includes('com.termux'));
}

/**
 * 📏 Obtém largura do terminal
 * @returns {number} Largura em colunas
 */
function getTerminalWidth() {
    return process.stdout.columns || 80;
}

/**
 * 🎨 Cria banner compacto para mobile
 * @returns {string} Banner formatado
 */
function createCompactBanner() {
    const version = getVersion();
    const width = Math.min(getTerminalWidth(), 60);

    const content = [
        chalk.greenBright.bold('📖  ravguide'),
        chalk.cyan('Guia de Segurança Digital via CLI/NPM'),
        '',
        chalk.yellow(`🌱 v${version}`),
        '',
        chalk.white('Feito com ') + chalk.red('💚') + chalk.white(' por ') + chalk.greenBright('RavenaStar'),
        chalk.blue.underline('https://ravenastar.link\n\n'),
        chalk.white('🔒 ') + chalk.blue.underline('https://secguide.pages.dev'),
        '',
        chalk.white('📱 Compatível com Termux'),
        chalk.white('📚 Modular • 🎯 Rápido • 🔧 Expansível')
    ].join('\n');

    return boxen(content, {
        padding: 1,
        margin: 1,
        borderColor: 'greenBright',
        borderStyle: 'round',
        backgroundColor: '#1a1a1a',
        width: width,
        textAlignment: 'center'
    });
}

/**
 * 🖥️ Cria banner para desktop
 * @returns {string} Banner formatado
 */
function createDesktopBanner() {
    const version = getVersion();
    const width = Math.min(getTerminalWidth(), 100);

    const bannerText = chalk.greenBright.bold(
        figlet.textSync('ravguide', { font: 'Standard', horizontalLayout: 'default' })
    );

    const content = [
        bannerText,
        chalk.yellow(`🌱 v${version}`),
        '',
        chalk.cyanBright('📖  Guia de Segurança Digital via CLI/NPM'),
        '',
        chalk.white('Feito com ') + chalk.red('💚') + chalk.white(' por ') + chalk.greenBright('RavenaStar'),
        chalk.blue.underline('https://ravenastar.link\n\n'),
        chalk.white('🔒 ') + chalk.blue.underline('https://secguide.pages.dev'),
        '',
        chalk.white('📱 Compatível com Termux'),
        chalk.white('📚 Modular • 🎯 Rápido • 🔧 Expansível')
    ].join('\n');

    return boxen(content, {
        padding: 1,
        margin: 1,
        borderColor: 'greenBright',
        borderStyle: 'double',
        backgroundColor: '#1a1a1a',
        width: width,
        textAlignment: 'center'
    });
}

/**
 * 🖼️ Exibe header apropriado para o dispositivo
 * @returns {void}
 */
function displayHeader() {
    console.clear();
    const banner = isMobileDevice() || getTerminalWidth() < 80
        ? createCompactBanner()
        : createDesktopBanner();
    console.log(banner);
}

/**
 * 📖 Exibe conteúdo formatado
 * @param {string} title - Título do conteúdo
 * @param {any} content - Conteúdo a ser exibido
 * @param {Object} options - Opções de formatação
 * @returns {void}
 */
function displayContent(title, content, options = {}) {
    const isMobile = isMobileDevice();
    const terminalWidth = getTerminalWidth();
    const maxWidth = isMobile ? Math.min(terminalWidth, 60) : Math.min(terminalWidth, 80);

    console.log('\n');

    // 🎯 Título formatado
    const titleBox = boxen(
        chalk.cyanBright.bold(`📖 ${title}`),
        {
            padding: 1,
            margin: { bottom: 1 },
            borderStyle: isMobile ? 'single' : 'classic',
            borderColor: 'cyanBright',
            textAlignment: 'center',
            width: maxWidth - 4,
            backgroundColor: '#2d2d2d'
        }
    );
    console.log(titleBox);

    // 📝 Conteúdo formatado
    let contentText = '';
    if (typeof content === 'string') {
        contentText = formatSimpleString(content, isMobile, maxWidth - 8);
    } else if (Array.isArray(content)) {
        contentText = formatArrayContent(content, isMobile);
    } else if (typeof content === 'object') {
        contentText = Object.keys(content).some(key => key.includes('?') || key.includes('pergunta'))
            ? formatFAQContent(content, isMobile, maxWidth)
            : formatSimpleObject(content, isMobile);
    }

    if (contentText.trim()) {
        const contentBox = boxen(
            contentText,
            {
                padding: 1,
                margin: { bottom: 1 },
                borderStyle: isMobile ? 'single' : 'round',
                borderColor: 'gray',
                backgroundColor: '#2d2d2d',
                width: maxWidth - 4
            }
        );
        console.log(contentBox);
    }

    // 🧭 Navegação
    console.log(chalk.gray(isMobile ? '⬅️ Use as setas para navegar' : '↩️ Use o menu abaixo para continuar...'));
}

/**
 * 📋 Formata conteúdo de FAQ
 * @param {Object} faqData - Dados do FAQ
 * @param {boolean} isMobile - Se é mobile
 * @param {number} maxWidth - Largura máxima
 * @returns {string} FAQ formatado
 */
function formatFAQContent(faqData, isMobile = false, maxWidth = 80) {
    let result = '';
    const lineWidth = maxWidth - 8;

    Object.entries(faqData).forEach(([question, answer], index) => {
        const formattedQuestion = question.replace(/\?/g, '').trim();
        result += chalk.yellowBright.bold(`❓ ${formattedQuestion}?\n`);

        const wrappedAnswer = wrapText(answer, lineWidth);
        result += chalk.white(`   ${wrappedAnswer}\n`);

        if (index < Object.keys(faqData).length - 1) {
            result += chalk.gray('   ' + '─'.repeat(lineWidth - 10)) + '\n\n';
        }
    });

    return result;
}

/**
 * 🔤 Quebra texto para caber na largura
 * @param {string} text - Texto original
 * @param {number} maxWidth - Largura máxima
 * @returns {string} Texto quebrado
 */
function wrapText(text, maxWidth) {
    const words = text.split(' ');
    let lines = [];
    let currentLine = '';

    words.forEach(word => {
        if ((currentLine + word).length <= maxWidth) {
            currentLine += (currentLine === '' ? '' : ' ') + word;
        } else {
            if (currentLine !== '') lines.push(currentLine);
            currentLine = word;
        }
    });

    if (currentLine !== '') lines.push(currentLine);
    return lines.join('\n   ');
}

/**
 * 📋 Formata conteúdo de array
 * @param {Array} array - Array a ser formatado
 * @param {boolean} isMobile - Se é mobile
 * @returns {string} Array formatado
 */
function formatArrayContent(array, isMobile = false) {
    return array.map((item, index) => {
        if (typeof item === 'object') {
            return formatSimpleObject(item, isMobile);
        } else {
            const bullet = isMobile ? '•' : '◦';
            return chalk.white(`  ${chalk.green(bullet)} ${item}\n`);
        }
    }).join('');
}

/**
 * 🗂️ Formata objeto simples
 * @param {Object} obj - Objeto a ser formatado
 * @param {boolean} isMobile - Se é mobile
 * @param {number} indent - Indentação
 * @returns {string} Objeto formatado
 */
function formatSimpleObject(obj, isMobile = false, indent = 0) {
    const spaces = '  '.repeat(indent);
    let result = '';

    Object.entries(obj).forEach(([key, value]) => {
        const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

        if (typeof value === 'object' && !Array.isArray(value)) {
            result += chalk.yellowBright(`${spaces}${formattedKey}:\n`);
            result += formatSimpleObject(value, isMobile, indent + 1);
        } else if (Array.isArray(value)) {
            result += chalk.yellowBright(`${spaces}${formattedKey}:\n`);
            value.forEach(item => {
                if (typeof item === 'object') {
                    result += formatSimpleObject(item, isMobile, indent + 1);
                } else {
                    const bullet = isMobile ? '›' : '•';
                    result += chalk.white(`${spaces}  ${chalk.blue(bullet)} ${item}\n`);
                }
            });
        } else {
            const separator = isMobile ? ':' : ': ';
            const displayValue = isUrl(value) ? chalk.cyan.underline(value) : chalk.white(value);
            result += chalk.greenBright(`${spaces}${formattedKey}${separator}`) + ' ' + displayValue + '\n';
        }
    });

    return result;
}

/**
 * 🔗 Verifica se string é URL
 * @param {string} string - String a verificar
 * @returns {boolean} true se for URL
 */
function isUrl(string) {
    return typeof string === 'string' && (string.startsWith('http://') || string.startsWith('https://'));
}

/**
 * 🚶‍♂️ Exibe conteúdo passo a passo
 * @param {Object} steps - Passos a serem exibidos
 * @returns {void}
 */
function displayStepByStep(steps) {
    const isMobile = isMobileDevice();
    const terminalWidth = getTerminalWidth();
    const maxWidth = isMobile ? Math.min(terminalWidth, 60) : Math.min(terminalWidth, 80);

    console.log('\n');

    Object.entries(steps).forEach(([step, description], index) => {
        const stepNumber = index + 1;
        const stepTitle = isMobile
            ? chalk.cyanBright.bold(`📍 ${stepNumber}`)
            : chalk.cyanBright.bold(`📍 Passo ${stepNumber}`);

        const processedDescription = formatStepDescription(description, isMobile, maxWidth - 8);

        const stepBox = boxen(
            [stepTitle, '', chalk.white(processedDescription)].join('\n'),
            {
                padding: { top: 1, bottom: 1, left: 1, right: 1 },
                margin: { bottom: 1 },
                borderStyle: isMobile ? 'single' : 'round',
                borderColor: 'blueBright',
                backgroundColor: '#1a2a2a',
                width: maxWidth - 4
            }
        );
        console.log(stepBox);
    });
}

/**
 * 🎨 Formata descrição de passo
 * @param {string} description - Descrição original
 * @param {boolean} isMobile - Se é mobile
 * @param {number} maxWidth - Largura máxima
 * @returns {string} Descrição formatada
 */
function formatStepDescription(description, isMobile = false, maxWidth = 60) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const processedText = description.replace(urlRegex, url => chalk.cyan.underline(url));
    return wrapStepText(processedText, maxWidth);
}

/**
 * 🔤 Formata string simples com quebra de linha
 * @param {string} text - Texto original
 * @param {boolean} isMobile - Se é mobile
 * @param {number} maxWidth - Largura máxima
 * @returns {string} Texto formatado
 */
function formatSimpleString(text, isMobile = false, maxWidth = 80) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const processedText = text.replace(urlRegex, url => chalk.cyan.underline(url));
    return wrapSimpleText(processedText, maxWidth);
}

/**
 * 🔄 Quebra texto simples considerando cores
 * @param {string} text - Texto com formatação
 * @param {number} maxWidth - Largura máxima
 * @returns {string} Texto quebrado
 */
function wrapSimpleText(text, maxWidth) {
    const words = text.split(' ');
    let lines = [];
    let currentLine = '';

    words.forEach(word => {
        const plainWord = word.replace(/\u001b\[[0-9;]*m/g, '');

        // 🔨 Quebra palavras muito longas
        if (plainWord.length > maxWidth) {
            if (currentLine !== '') {
                lines.push(currentLine);
                currentLine = '';
            }
            for (let i = 0; i < plainWord.length; i += maxWidth) {
                const chunk = plainWord.substring(i, i + maxWidth);
                lines.push(word.includes('\u001b[') ? chalk.cyan.underline(chunk) : chunk);
            }
        }
        // ➕ Adiciona à linha atual se couber
        else if ((currentLine.length + plainWord.length + 1) <= maxWidth) {
            currentLine += (currentLine === '' ? '' : ' ') + word;
        } else {
            if (currentLine !== '') lines.push(currentLine);
            currentLine = word;
        }
    });

    if (currentLine !== '') lines.push(currentLine);
    return lines.join('\n');
}

/**
 * 🚶‍♂️ Quebra texto de passo a passo
 * @param {string} text - Texto original
 * @param {number} maxWidth - Largura máxima
 * @returns {string} Texto quebrado
 */
function wrapStepText(text, maxWidth) {
    const words = text.split(' ');
    let lines = [];
    let currentLine = '';

    words.forEach(word => {
        const isColoredWord = word.includes('\u001b[');
        const plainWord = word.replace(/\u001b\[[0-9;]*m/g, '');

        if (word.length > maxWidth && !isColoredWord) {
            if (currentLine !== '') lines.push(currentLine);
            currentLine = '';
            for (let i = 0; i < word.length; i += maxWidth - 5) {
                lines.push(word.substring(i, i + maxWidth - 5));
            }
        } else if (isColoredWord) {
            const linkLength = plainWord.length;
            if ((currentLine.length + linkLength + 1) > maxWidth) {
                if (currentLine !== '') lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine += (currentLine === '' ? '' : ' ') + word;
            }
        } else if ((currentLine + ' ' + word).length <= maxWidth) {
            currentLine += (currentLine === '' ? '' : ' ') + word;
        } else {
            if (currentLine !== '') lines.push(currentLine);
            currentLine = word;
        }
    });

    if (currentLine !== '') lines.push(currentLine);
    return lines.join('\n');
}

module.exports = {
    displayHeader,
    displayContent,
    displayStepByStep,
    isMobileDevice,
    getTerminalWidth
};