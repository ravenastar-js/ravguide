const chalk = require('chalk');
const { readFileSync } = require('fs');
const { join } = require('path');

class ColorSystem {
    constructor() {
        this.loadConfig();
    }

    /**
     * 📥 Carrega a configuração do arquivo config.json
     * @returns {void} ⚙️ Configuração carregada ou padrão aplicada
     */
    loadConfig() {
        try {
            const configPath = join(__dirname, '..', '..', 'config.json');
            this.config = JSON.parse(readFileSync(configPath, 'utf8'));
        } catch (error) {
            console.error('❌ Erro ao carregar config.json, usando padrão');
            this.config = this.getDefaultConfig();
        }
        this.initializeColors();
    }

    /**
     * 🎨 Obtém a configuração padrão do sistema de cores
     * @returns {Object} 📋 Objeto com configurações padrão de cores e UI
     */
    getDefaultConfig() {
        return {
            colors: {
                primary: "#06D6A0",
                secondary: "#FFD166",
                success: "#57f287",
                danger: "#EF476F",
                info: "#118AB2",
                warning: "#F18F01",
                muted: "#7F8C8D",
                text: "#E9ECEF",
                background: "#1a1a1a",
                border: "#57f287"
            },
            ui: {
                mobileMaxWidth: 60,
                desktopMaxWidth: 100,
                mobilePageSize: 8,
                desktopPageSize: 12,
                padding: 1,
                margin: 1
            },
            urls: {
                website: "https://ravenastar.link",
                guide: "https://secguide.pages.dev",
                tools: "https://secguide.pages.dev/r/"
            },
            remote: {
                platforms: "https://raw.githubusercontent.com/ravenastar-js/gd/refs/heads/main/report.json",
                tools: "https://secguide.pages.dev/js/data-tools.js"
            }
        };
    }

    /**
     * 🌈 Inicializa o sistema de cores com base na configuração
     * @returns {void} 🎨 Cores inicializadas e prontas para uso
     */
    initializeColors() {
        const { colors } = this.config;

        this.colors = {
            primary: chalk.hex(colors.primary),
            secondary: chalk.hex(colors.secondary),
            success: chalk.hex(colors.success),
            danger: chalk.hex(colors.danger),
            info: chalk.hex(colors.info),
            warning: chalk.hex(colors.warning),
            muted: chalk.hex(colors.muted),
            text: chalk.hex(colors.text),
            ravenastar: chalk.hex(colors.primary),
            option: chalk.hex(colors.secondary),
            action: chalk.hex(colors.success),
            title: chalk.hex(colors.success),
            subtitle: chalk.white,
            highlight: chalk.hex(colors.warning),
            highlight2: chalk.hex('#f8e789'),
            link: chalk.hex('#8ad4ff')
        };
    }

    /**
     * ⚙️ Obtém a configuração completa do sistema
     * @returns {Object} 📋 Configuração atual do sistema
     */
    getConfig() {
        return this.config;
    }

    /**
     * 🎨 Obtém o objeto de cores para uso na aplicação
     * @returns {Object} 🌈 Objeto com todas as cores configuradas
     */
    getColors() {
        return this.colors;
    }
}

const colorSystem = new ColorSystem();
module.exports = colorSystem;