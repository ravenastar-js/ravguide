const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

class DataLoader {
    constructor() {
        this.dataPath = path.join(__dirname, '..', '..', 'data');
        this.categories = new Map();
        this.initialized = false;
    }

    /**
     * 🚀 Inicializa o carregador de dados
     * @returns {Promise<Array>} 📋 Lista de nomes de categorias carregadas
     */
    async initialize() {
        if (this.initialized) return this.getCategoryNames();

        await this.loadLocalData();
        await this.loadRemoteData();
        this.initialized = true;

        const categories = this.getCategoryNames();
        return categories;
    }

    /**
     * 📁 Carrega dados locais do diretório data/
     * @returns {Promise<void>} 📊 Dados locais carregados no mapa de categorias
     */
    async loadLocalData() {
        try {
            const files = await fs.readdir(this.dataPath);
            const jsonFiles = files.filter(file => file.endsWith('.json'));

            for (const file of jsonFiles) {
                try {
                    const filePath = path.join(this.dataPath, file);
                    const data = await fs.readFile(filePath, 'utf8');
                    const fileName = path.basename(file, '.json');
                    const parsedData = JSON.parse(data);

                    this.categories.set(fileName, parsedData);
                } catch (error) {
                    console.error(`❌ Erro ao carregar ${file}:`, error.message);
                }
            }
        } catch (error) {
            console.error('❌ Erro ao acessar data/:', error.message);
        }
    }

    /**
     * 🌐 Carrega dados remotos de fontes externas
     * @returns {Promise<void>} 📡 Dados remotos carregados no mapa de categorias
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
                console.error(`❌ Erro em ${source.key}:`, error.message);
            }
        }
    }

    /**
     * ⚙️ Processa dados brutos de ferramentas OSINT
     * @param {string} rawData - 📦 Dados brutos das ferramentas
     * @returns {Object} 🛠️ Dados processados e categorizados das ferramentas
     */
    processToolsData(rawData) {
        try {
            const toolsDataMatch = rawData.match(/var toolsData = (\[.*?\]);/s);
            if (!toolsDataMatch) return { 'Ferramentas OSINT': [] };

            const toolsData = eval(`(${toolsDataMatch[1]})`);
            const categorizedTools = {};

            toolsData.forEach(tool => {
                if (!tool.id || !tool.name) return;

                const category = this.mapCategory(tool.category);
                if (!categorizedTools[category]) categorizedTools[category] = [];

                const toolLink = `https://secguide.pages.dev/r/${tool.id}`;

                categorizedTools[category].push({
                    id: tool.id,
                    name: tool.name,
                    link: toolLink,
                    emoji: this.getToolEmoji(tool.category)
                });
            });

            return categorizedTools;
        } catch (error) {
            console.error('❌ Erro ao processar ferramentas:', error.message);
            return { 'Ferramentas OSINT': [] };
        }
    }

    /**
     * 🗺️ Mapeia categoria raw para nome amigável
     * @param {string} rawCategory - 🏷️ Categoria original da ferramenta
     * @returns {string} 📝 Nome amigável da categoria com emoji
     */
    mapCategory(rawCategory) {
        const categoryMap = {
            'scan': '🔍 Ferramentas de Scan',
            'sec': '🛡️ Segurança',
            'jus': '⚖️ Jurídico',
            'google': '🔎 Google',
            'educa': '🎓 Educacionais', 
            'gbtools': '⚙️ Github Tools', 
            'ex': '✨ Extras', 
            'dados': '📊 Verificação de Dados',
            'gov': '🏛️ Governo',
            'denuncie': '🚨 Denúncia'
        };
        return categoryMap[rawCategory] || '📋 Outras Ferramentas';
    }

    /**
     * 🎨 Obtém emoji correspondente à categoria
     * @param {string} category - 🏷️ Categoria da ferramenta
     * @returns {string} ✨ Emoji representativo da categoria
     */
    getToolEmoji(category) {
        const emojiMap = {
            'scan': '🔍', 'sec': '🛡️', 'ex': '✨ ', 'jus': '⚖️',
            'google': '🔎', 'dados': '📊', 'gov': '🏛️', 'denuncie': '🚨', 
            'gbtools': '⚙️','educa': '🎓',
        };
        return emojiMap[category] || '📋';
    }

    /**
     * 📋 Obtém lista de nomes de categorias disponíveis
     * @returns {Array} 🗂️ Array com nomes formatados das categorias
     */
    getCategoryNames() {
        const names = [];

        for (const [fileName, data] of this.categories) {
            if (fileName === 'ferramentas-osint') {
                names.push('Ferramentas OSINT');
            }
            else if (fileName === 'contatos-plataformas') {
                names.push('Contatos Plataformas');
            }
            else {
                const firstKey = Object.keys(data)[0];
                if (firstKey) {
                    names.push(firstKey);
                } else {
                    names.push(fileName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
                }
            }
        }

        return names;
    }

    /**
     * 📊 Obtém dados de uma categoria específica
     * @param {string} categoryName - 🏷️ Nome da categoria desejada
     * @returns {Object|null} 📄 Dados da categoria ou null se não encontrada
     */
    getCategoryData(categoryName) {
        if (!categoryName) {
            console.error('❌ Nome da categoria é undefined');
            return null;
        }

        const mapping = {
            'Ferramentas Básicas': 'ferramentas',
            'Meu Instagram foi hackeado, o que fazer?': 'ig-hackeado',
            'Profissionais Recomendados': 'recomendacoes',
            'Contatos Plataformas': 'contatos-plataformas',
            'Ferramentas OSINT': 'ferramentas-osint'
        };

        const fileName = mapping[categoryName];

        if (!fileName) {
            console.error(`❌ Mapeamento não encontrado para: "${categoryName}"`);
            return null;
        }

        const data = this.categories.get(fileName);

        if (!data) {
            console.error(`❌ Dados não encontrados para arquivo: "${fileName}"`);
            return null;
        }

        return data;
    }

    /**
     * 🔍 Obtém categoria por comando/alias
     * @param {string} command - 🎯 Comando ou alias para busca
     * @returns {Object|null} 📁 Dados da categoria correspondente ou null
     */
    getCategoryByCommand(command) {
        const normalizedCommand = command.toLowerCase().replace(/\s+/g, '-');

        const aliases = {
            'ferramentas': 'ferramentas',
            'osint': 'ferramentas-osint',
            'tools': 'ferramentas-osint',
            'contatos': 'contatos-plataformas',
            'platforms': 'contatos-plataformas',
            'instagram': 'ig-hackeado',
            'hackeado': 'ig-hackeado'
        };

        const fileName = aliases[normalizedCommand] || normalizedCommand;

        if (this.categories.has(fileName)) {
            return this.categories.get(fileName);
        }

        return null;
    }
}

module.exports = new DataLoader();
