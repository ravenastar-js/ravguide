const boxen = require('boxen');
const figlet = require('figlet');
const chalk = require('chalk');
const { readFileSync } = require('fs');
const { join } = require('path');

const colors = {
    primary: chalk.hex("#06D6A0"),
    option: chalk.hex('#FFD166'),
    action: chalk.hex('#57f287'),
    danger: chalk.hex('#EF476F'),
    info: chalk.hex('#118AB2'),
    title: chalk.hex('#57f287'),
    subtitle: chalk.white,
    highlight: chalk.hex('#F18F01'),
    highlight2: chalk.hex('#f8e789'),
    text: chalk.hex('#E9ECEF'),
    muted: chalk.hex('#7F8C8D'),
    link: chalk.hex('#8ad4ff').underline,
    success: chalk.hex('#57f287')
};
/**
 * 📦 Obtém versão do package.json
 * @returns {string} 🏷️ Versão da aplicação ou '1.0.0' como fallback
 * @throws {Error} 🚨 Se não conseguir ler ou parsear o package.json
 */

function getVersion() {
    try {
        const packagePath = join(__dirname, '..', 'package.json');
        return JSON.parse(readFileSync(packagePath, 'utf8')).version || 'BETA';
    } catch (error) {
        return 'BETA';
    }
}

class BoxRenderer {
    constructor() {
        this.terminalWidth = process.stdout.columns || 80;
    }

    /**
     * 📝 Quebra texto longo em múltiplas linhas respeitando a largura máxima
     * @param {string} text - 📄 Texto a ser formatado
     * @param {number} maxWidth - 📏 Largura máxima por linha
     * @returns {string} 📋 Texto formatado com quebras de linha
     */
    wrapText(text, maxWidth) {
        if (!text || typeof text !== 'string') return text;

        const lines = text.split('\n');
        const processedLines = [];

        for (const line of lines) {
            const cleanLine = line.replace(/\s+/g, ' ').trim();

            if (!cleanLine) {
                processedLines.push('');
                continue;
            }

            if (cleanLine.length <= maxWidth) {
                processedLines.push(this.formatUrls(cleanLine));
                continue;
            }

            const words = cleanLine.split(' ');
            let currentLine = '';

            for (const word of words) {
                const testLine = currentLine ? `${currentLine} ${word}` : word;
                const testLinePlain = this.stripAnsiCodes(testLine);

                if (testLinePlain.length <= maxWidth) {
                    currentLine = testLine;
                } else {
                    if (currentLine) {
                        processedLines.push(this.formatUrls(currentLine));
                    }

                    if (this.isUrl(word) || word.includes('ID:')) {
                        processedLines.push(this.formatUrls(word));
                        currentLine = '';
                    } else if (this.stripAnsiCodes(word).length > maxWidth) {
                        const chunks = this.breakLongWord(word, maxWidth);
                        processedLines.push(...chunks.map(chunk => this.formatUrls(chunk)));
                        currentLine = '';
                    } else {
                        currentLine = word;
                    }
                }
            }

            if (currentLine) {
                processedLines.push(this.formatUrls(currentLine));
            }
        }

        return processedLines.join('\n');
    }

    /**
     * 🔗 Verifica se o texto é uma URL
     * @param {string} text - 📄 Texto a ser verificado
     * @returns {boolean} ✅ true se for URL, false caso contrário
     */
    isUrl(text) {
        return text.startsWith('http://') || text.startsWith('https://');
    }

    /**
     * 🧹 Remove códigos ANSI de formatação do texto
     * @param {string} str - 📄 Texto com códigos ANSI
     * @returns {string} 📄 Texto limpo sem formatação
     */
    stripAnsiCodes(str) {
        if (!str) return '';
        return String(str).replace(/\u001b\[[0-9;]*m/g, '');
    }

    /**
     * 🌐 Formata URLs no texto com cores e sublinhado
     * @param {string} text - 📄 Texto contendo URLs
     * @returns {string} 🎨 Texto com URLs formatadas
     */
    formatUrls(text) {
        const urlRegex = /(https?:\/\/[^\s<]+[^\s<.)])/g;
        return text.replace(urlRegex, url => colors.link(url));
    }

    /**
     * ✂️ Quebra palavras muito longas em pedaços menores
     * @param {string} word - 📄 Palavra a ser quebrada
     * @param {number} maxWidth - 📏 Largura máxima por pedaço
     * @returns {Array} 📋 Array com pedaços da palavra
     */
    breakLongWord(word, maxWidth) {
        const plainWord = this.stripAnsiCodes(word);
        const chunks = [];

        for (let i = 0; i < plainWord.length; i += maxWidth) {
            chunks.push(word.substring(i, Math.min(i + maxWidth, word.length)));
        }

        return chunks;
    }

    /**
     * 📏 Obtém a largura real do texto sem códigos ANSI
     * @param {string} str - 📄 Texto a ser medido
     * @returns {number} 📐 Largura do texto em caracteres
     */
    getStringWidth(str) {
        if (!str) return 0;
        const cleanStr = this.stripAnsiCodes(str);
        return cleanStr.length;
    }

    /**
     * 🎨 Exibe o cabeçalho principal da aplicação
     * @returns {void} 📺 Cabeçalho exibido no console
     */
    displayHeader() {
        const version = getVersion();
        console.clear();

        const bannerText = colors.action(
            figlet.textSync('ravguide', { font: 'Standard' })
        );

        const content = [
            bannerText,
            colors.highlight2(`🌱 v${version}`),
            '',
            colors.subtitle('📖 Guia de Segurança Digital via CLI/NPM'),
            '',
            colors.text('Feito com ') + colors.danger('💚') + colors.text(' por ') + colors.primary.bold('RavenaStar'),
            colors.text('🔗 ') + colors.link('https://ravenastar.link'),
            colors.text('🔒 ') + colors.link('https://secguide.pages.dev'),
            '',
            colors.text('📱 Compatível com Termux'),
            colors.text('📚 Modular • 🎯 Rápido • 🔧 Expansível')
        ].join('\n');

        console.log(boxen(content, {
            padding: 1,
            margin: 1,
            borderColor: '#57f287',
            borderStyle: 'classic',
            backgroundColor: '#1a1a1a',
            width: Math.min(this.terminalWidth - 8, 80),
            textAlignment: 'center'
        }));
    }

    /**
     * 📦 Cria uma caixa de conteúdo estilizada
     * @param {string} title - 🏷️ Título da caixa
     * @param {*} content - 📄 Conteúdo a ser exibido
     * @returns {string} 🎨 Caixa formatada pronta para exibição
     */
    createContentBox(title, content) {
        const width = Math.min(this.terminalWidth - 12, 55);
        const contentWidth = width - 4;

        let contentText = '';
        if (typeof content === 'string') {
            contentText = content;
        } else if (typeof content === 'object') {
            contentText = JSON.stringify(content, null, 2);
        } else {
            contentText = String(content);
        }

        const wrappedContent = this.wrapText(contentText, contentWidth);

        const boxContent = [
            colors.title.bold(`📖 ${this.wrapText(title, contentWidth - 2)}`),
            colors.muted('─'.repeat(width - 8)),
            '',
            colors.text(wrappedContent)
        ].join('\n');

        return boxen(boxContent, {
            padding: { top: 0, bottom: 0, left: 1, right: 1 },
            margin: { bottom: 1 },
            borderStyle: 'single',
            borderColor: "#57f287",
            backgroundColor: '#1a1a1a',
            width: width,
            textAlignment: 'left'
        });
    }

    /**
     * 🏢 Cria caixa específica para informações de plataformas
     * @param {Object} platform - 📊 Dados da plataforma
     * @param {string} platformName - 🏷️ Nome da plataforma
     * @returns {string} 🎨 Caixa de plataforma formatada
     */
    createPlatformBox(platform, platformName) {
        const width = Math.min(this.terminalWidth - 8, 60);
        const contentWidth = width - 6;

        const contentLines = [
            colors.title.bold(`🏢 ${platformName}`),
            colors.muted('─'.repeat(width - 12)),
            ''
        ];

        if (platform.message_pt) {
            const message = this.wrapText(platform.message_pt, contentWidth);
            contentLines.push(colors.text(message), '');
        }

        if (platform.type === 'email') {
            contentLines.push(
                colors.success('📧 ') + colors.link(platform.contact)
            );
        } else if (platform.type === 'form') {
            contentLines.push(
                colors.success('🔗 ') + colors.link(platform.contact)
            );
        } else if (platform.type === 'multiple' && Array.isArray(platform.contacts)) {
            platform.contacts.forEach((contact, index) => {
                const emoji = contact.type === 'email' ? '📧' : '🔗';
                contentLines.push(
                    `${colors.success(emoji)} ${colors.link(contact.contact)}`
                );

                if (contact.description_pt) {
                    const desc = this.wrapText(contact.description_pt, contentWidth - 2);
                    contentLines.push(colors.muted(`  ${desc}`));
                }
                contentLines.push('');
            });
        }

        if (contentLines[contentLines.length - 1] === '') {
            contentLines.pop();
        }

        const content = contentLines.join('\n');

        return boxen(content, {
            padding: { top: 0, bottom: 0, left: 1, right: 1 },
            margin: 1,
            borderStyle: 'round',
            borderColor: '#57f287',
            backgroundColor: '#1a1a1a',
            width: width,
            textAlignment: 'left'
        });
    }

    /**
     * ❌ Cria caixa de erro estilizada
     * @param {string} message - 📄 Mensagem de erro
     * @returns {string} 🎨 Caixa de erro formatada
     */
    createErrorBox(message) {
        const width = Math.min(this.terminalWidth - 8, 50);
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
     * ✅ Cria caixa de sucesso estilizada
     * @param {string} message - 📄 Mensagem de sucesso
     * @returns {string} 🎨 Caixa de sucesso formatada
     */
    createSuccessBox(message) {
        const width = Math.min(this.terminalWidth - 8, 50);
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

    /**
     * 📚 Cria caixa para exibição de passos/tutoriais
     * @param {string} title - 🏷️ Título do passo
     * @param {string} content - 📄 Conteúdo do passo
     * @returns {string} 🎨 Caixa de passo formatada
     */
    createStepBox(title, content) {
        const width = Math.min(this.terminalWidth - 8, 60);
        const contentWidth = width - 6;

        const wrappedContent = this.wrapText(content, contentWidth);

        const boxContent = [
            colors.title.bold(title),
            '',
            colors.text(wrappedContent)
        ].join('\n');

        return boxen(boxContent, {
            padding: { top: 0, bottom: 0, left: 1, right: 1 },
            margin: 1,
            borderStyle: 'round',
            borderColor: '#57f287',
            backgroundColor: '#1a1a1a',
            width: width,
            textAlignment: 'left'
        });
    }
}

module.exports = new BoxRenderer();