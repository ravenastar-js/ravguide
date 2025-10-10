/**
 * 🗂️ Carregador de Dados Inteligente
 * 📥 Carrega dados locais e remotos de forma eficiente
 * 🔄 Processa e normaliza dados de múltiplas fontes
 */

const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

class DataLoader {
    constructor() {
        this.dataPath = path.join(__dirname, '..', 'data');
        this.categories = new Map();
    }

    /**
     * 📁 Carrega dados locais do diretório data/
     * @returns {Promise<void>}
     */
    async loadLocalData() {
        try {
            const files = await fs.readdir(this.dataPath);
            const jsonFiles = files.filter(file => file.endsWith('.json'));

            if (jsonFiles.length === 0) {
                throw new Error('Nenhum arquivo JSON encontrado no diretório data/');
            }

            // 📥 Carrega cada arquivo JSON
            for (const file of jsonFiles) {
                try {
                    const filePath = path.join(this.dataPath, file);
                    const data = await fs.readFile(filePath, 'utf8');
                    const categoryName = path.basename(file, '.json');
                    this.categories.set(categoryName, JSON.parse(data));
                } catch (fileError) {
                    console.error(`❌ Erro ao carregar arquivo ${file}:`, fileError.message);
                }
            }

            console.log(`✅ Carregadas ${this.categories.size} categorias locais`);
        } catch (error) {
            console.error('❌ Erro crítico ao carregar dados locais:', error.message);
            process.exit(1);
        }
    }

    /**
     * 🌐 Carrega dados remotos de fontes externas
     * @returns {Promise<void>}
     */
    async loadRemoteData() {
        const remoteSources = [
            {
                url: 'https://raw.githubusercontent.com/ravenastar-js/gd/refs/heads/main/report.json',
                key: 'contatos-plataformas'
            },
            {
                url: 'https://secguide.pages.dev/js/data-tools.js',
                key: 'ferramentas-osint'
            }
        ];

        for (const source of remoteSources) {
            try {
                const response = await axios.get(source.url);
                const processedData = source.key === 'ferramentas-osint'
                    ? this.processToolsData(response.data)
                    : response.data;

                this.categories.set(source.key, processedData);
            } catch (error) {
                console.error(`❌ Erro ao carregar ${source.key}:`, error.message);
            }
        }
    }

    /**
     * 🔧 Processa dados de ferramentas do JavaScript remoto
     * @param {string} rawData - Dados brutos do JavaScript
     * @returns {Object} Dados processados das ferramentas
     */
    processToolsData(rawData) {
        try {
            const toolsDataMatch = rawData.match(/var toolsData = (\[.*?\]);/s);
            if (!toolsDataMatch) {
                console.error('❌ Não foi possível extrair toolsData do JavaScript');
                return { 'Ferramentas Remotas': [] };
            }

            const toolsData = eval(`(${toolsDataMatch[1]})`);
            const categorizedTools = {};

            // 🗂️ Categoriza ferramentas
            toolsData.forEach(tool => {
                if (!tool.id || !tool.name) return;

                const category = this.mapCategory(tool.category);
                if (!categorizedTools[category]) categorizedTools[category] = [];

                const finalLink = this.normalizeToolLink(tool.link, tool.id);

                categorizedTools[category].push({
                    id: tool.id,
                    name: this.cleanText(tool.name),
                    link: finalLink
                });
            });

            return categorizedTools;
        } catch (error) {
            console.error('❌ Erro ao processar dados das ferramentas:', error.message);
            return { 'Ferramentas Remotas': [] };
        }
    }

    /**
     * 🔗 Normaliza links de ferramentas
     * @param {string} link - Link original
     * @param {string} id - ID da ferramenta
     * @returns {string} Link normalizado
     */
    normalizeToolLink(link, id) {
        if (link === 'https://secguide.pages.dev/r/' ||
            link.endsWith('/r/') ||
            link === link) {
            return `https://secguide.pages.dev/r/${id}`;
        }
        return link;
    }

    /**
     * 🗂️ Mapeia categorias para nomes amigáveis
     * @param {string} rawCategory - Categoria original
     * @returns {string} Categoria formatada
     */
    mapCategory(rawCategory) {
        const categoryMap = {
            'scan': '🔍 Ferramentas de Scan',
            'sec': '🛡️ Segurança',
            'ex': '🛠️ Utilitários',
            'jus': '⚖️ Jurídico',
            'google': '🔎 Google',
            'dados': '📊 Verificação de Dados',
            'gov': '🏛️ Governo',
            'denuncie': '🚨 Denúncia'
        };
        return categoryMap[rawCategory] || '📋 Outras Ferramentas';
    }

    /**
     * 🧹 Limpa e normaliza texto
     * @param {string} text - Texto original
     * @returns {string} Texto limpo
     */
    cleanText(text) {
        const replacements = {
            'Ã§': 'ç', 'Ã£': 'ã', 'Ã¡': 'á', 'Ã©': 'é', 'Ã­': 'í',
            'Ã³': 'ó', 'Ãº': 'ú', 'Ãµ': 'õ', 'Ã¢': 'â', 'Ãª': 'ê',
            'Ã®': 'î', 'Ã´': 'ô', 'Ã»': 'û', 'Ã ': 'à', 'Â': '',
            'ðŸ‡§ðŸ‡·': '🇧🇷', 'â€"': '"', 'â€“': '-', 'â€™': "'"
        };

        return Object.keys(replacements).reduce((acc, key) =>
            acc.replace(new RegExp(key, 'g'), replacements[key]), text
        ).trim();
    }

    /**
     * 🚀 Inicializa carregador de dados
     * @returns {Promise<Array>} Nomes das categorias disponíveis
     */
    async initialize() {
        await this.loadLocalData();
        await this.loadRemoteData();
        return this.getCategoryNames();
    }

    /**
     * 📋 Obtém nomes das categorias disponíveis
     * @returns {Array} Lista de nomes de categorias
     */
    getCategoryNames() {
        return Array.from(this.categories.entries()).map(([fileName, data]) => {
            if (fileName === 'ferramentas-osint') return 'Ferramentas OSINT';
            if (fileName === 'contatos-plataformas') return fileName.replace(/-/g, ' ');

            const firstKey = Object.keys(data)[0];
            return firstKey || fileName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        });
    }

    /**
     * 🔍 Obtém dados de uma categoria específica
     * @param {string} categoryName - Nome da categoria
     * @returns {Object} Dados da categoria
     */
    getCategoryData(categoryName) {
        if (categoryName.toLowerCase() === 'ferramentas osint') {
            return this.categories.get('ferramentas-osint');
        }

        for (const [fileName, data] of this.categories) {
            const firstKey = Object.keys(data)[0];
            if (firstKey && firstKey.toLowerCase() === categoryName.toLowerCase()) {
                return data;
            }
        }

        return this.categories.get(categoryName.toLowerCase().replace(/\s+/g, '-'));
    }

    /**
     * 🎯 Obtém categoria baseada em comando
     * @param {string} command - Comando de busca
     * @returns {Object|null} Dados da categoria encontrada
     */
    /**
     * 🎯 Obtém categoria baseada em comando
     * @param {string} command - Comando de busca
     * @returns {Object|null} Dados da categoria encontrada
     */
    getCategoryByCommand(command) {
        const normalizedCommand = command.toLowerCase().replace(/\s+/g, '-');

        // 🔍 Busca direta por comandos específicos primeiro
        if (normalizedCommand === 'ferramentas-osint' || normalizedCommand === 'ferramentas-osint') {
            return this.categories.get('ferramentas-osint');
        }

        // 🔍 Busca por correspondência exata no nome do arquivo
        if (this.categories.has(normalizedCommand)) {
            return this.categories.get(normalizedCommand);
        }

        // 🔍 Busca por correspondência parcial no nome do arquivo
        for (const [fileName, data] of this.categories) {
            if (fileName.includes(normalizedCommand) || normalizedCommand.includes(fileName)) {
                return data;
            }
        }

        // 🔍 Busca por correspondência no conteúdo (primeira chave)
        for (const [fileName, data] of this.categories) {
            const firstKey = Object.keys(data)[0];
            if (firstKey && firstKey.toLowerCase().includes(normalizedCommand)) {
                return data;
            }
        }

        // 🔍 Busca por alias comuns
        const aliases = {
            'ferramentas': 'ferramentas-osint',
            'osint': 'ferramentas-osint',
            'tools': 'ferramentas-osint',
            'contatos': 'contatos-plataformas',
            'platforms': 'contatos-plataformas',
            'instagram': 'ig-hackeado',
            'hackeado': 'ig-hackeado'
        };

        if (aliases[normalizedCommand] && this.categories.has(aliases[normalizedCommand])) {
            return this.categories.get(aliases[normalizedCommand]);
        }

        return null;
    }

    /**
     * 📊 Verifica disponibilidade de dados
     * @returns {Promise<Object>} Status dos dados
     */
    async checkDataAvailability() {
        try {
            await this.initialize();
            const categories = this.getCategoryNames();

            return categories.length === 0 ? {
                hasData: false,
                message: '❌ Nenhum arquivo de dados encontrado.',
                instructions: [
                    '📁 Adicione arquivos JSON na pasta data/',
                    '📚 Exemplos: faq.json, checklist.json, ig-hackeado.json',
                    '🔧 Estruture conforme documentação'
                ]
            } : {
                hasData: true,
                categories: categories,
                total: categories.length
            };
        } catch (error) {
            return {
                hasData: false,
                message: `❌ Erro ao carregar dados: ${error.message}`,
                instructions: [
                    '🔧 Execute: ravguide setup',
                    '📁 Verifique os arquivos em data/',
                    '📚 Certifique-se de que são JSON válidos'
                ]
            };
        }
    }
}

module.exports = new DataLoader();