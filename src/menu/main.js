const inquirer = require('inquirer');
const dataLoader = require('../data/loader');
const boxRenderer = require('../renderer/box');
const menuSystem = require('../renderer/menu');

class MainMenu {
    constructor() {
        this.categories = [];
    }

    /**
     * 🚀 Inicializa o menu principal carregando categorias
     * @returns {Promise<void>} 📋 Categorias carregadas e prontas para uso
     */
    async initialize() {
        try {
            this.categories = await dataLoader.initialize();

            if (this.categories.length === 0) {
                console.log('❌ Nenhum arquivo de dados encontrado em data/');
                process.exit(1);
            }

        } catch (error) {
            console.log('❌ Erro ao inicializar:', error.message);
            process.exit(1);
        }
    }

    /**
     * 📱 Exibe o menu principal com categorias disponíveis
     * @returns {Promise<void>} 🎯 Navegação pelo menu de categorias
     */
    async showMainMenu() {
        if (!this.categories || this.categories.length === 0) {
            console.log('❌ Nenhuma categoria disponível');
            process.exit(1);
        }

        const choices = this.categories.map(cat => ({
            name: String(cat),
            value: String(cat)
        }));

        choices.push(
            new inquirer.Separator(),
            { name: '❌ Sair', value: 'exit' }
        );

        try {
            const result = await inquirer.prompt(
                menuSystem.createMenu(choices, '📚 Selecione uma categoria:')
            );

            if (!result || !result.selectedOption) {
                console.log('❌ Nenhuma opção selecionada');
                return this.showMainMenu();
            }

            const selectedCategory = result.selectedOption;

            if (selectedCategory === 'exit') {
                console.log('👋 Até logo!');
                process.exit(0);
            }

            await this.showCategoryContent(selectedCategory);

        } catch (error) {
            console.error('❌ Erro no menu:', error.message);
            return this.showMainMenu();
        }
    }

    /**
     * 📄 Exibe o conteúdo de uma categoria específica
     * @param {string} categoryName - 🏷️ Nome da categoria selecionada
     * @returns {Promise<void>} 📊 Conteúdo da categoria ou submenu
     */
    async showCategoryContent(categoryName) {
        if (!categoryName || categoryName === 'undefined') {
            console.log('❌ Nome da categoria inválido');
            return this.showMainMenu();
        }

        const data = dataLoader.getCategoryData(categoryName);

        if (!data) {
            console.log(`❌ Dados não encontrados para: "${categoryName}"`);
            return this.showMainMenu();
        }

        if (categoryName === 'Contatos Plataformas') {
            await this.showPlatformsMenu(data);
        }
        else if (categoryName === 'Ferramentas OSINT') {
            await this.showToolsSubmenu(data, categoryName);
        }
        else if (categoryName === 'Ferramentas Básicas') {
            await this.showBasicToolsMenu(data, categoryName);
        }
        else if (categoryName === 'Meu Instagram foi hackeado, o que fazer?') {
            await this.showInstagramHacked(data, categoryName);
        }
        else {
            this.displaySimpleContent(categoryName, data);
            await menuSystem.waitForInput();
            return this.showMainMenu();
        }
    }

    /**
     * 🔐 Exibe tutorial passo a passo para Instagram hackeado
     * @param {Object} data - 📊 Dados do tutorial
     * @param {string} categoryName - 🏷️ Nome da categoria
     * @returns {Promise<void>} 📚 Tutorial exibido em passos
     */
    async showInstagramHacked(data, categoryName) {
        try {
            const firstKey = Object.keys(data)[0];
            const steps = data[firstKey];

            if (typeof steps === 'object' && steps !== null) {
                const stepKeys = Object.keys(steps)
                    .filter(key => key.startsWith('passo_'))
                    .sort((a, b) => {
                        const numA = parseInt(a.replace('passo_', ''));
                        const numB = parseInt(b.replace('passo_', ''));
                        return numA - numB;
                    });

                console.log('\n');
                stepKeys.forEach((stepKey, index) => {
                    const stepNumber = index + 1;
                    const stepContent = steps[stepKey];
                    console.log(boxRenderer.createStepBox(`📍 Passo ${stepNumber}`, stepContent));
                });
            } else {
                console.log(boxRenderer.createContentBox(categoryName, steps || data));
            }

            await menuSystem.waitForInput();
            return this.showMainMenu();

        } catch (error) {
            console.error('❌ Erro ao exibir tutorial:', error.message);
            return this.showMainMenu();
        }
    }

    /**
     * 🏢 Exibe menu de plataformas de contato
     * @param {Object} platformsData - 📊 Dados das plataformas
     * @returns {Promise<void>} 📞 Menu interativo de plataformas
     */
    async showPlatformsMenu(platformsData) {
        try {
            const platforms = Object.entries(platformsData).map(([key, platform]) => {
                if (!platform || typeof platform !== 'object') {
                    console.error(`❌ Plataforma inválida: ${key}`);
                    return null;
                }

                const name = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                const shortDesc = platform.message_pt ?
                    (platform.message_pt.substring(0, 40) + '...') :
                    'Plataforma de contato';

                return {
                    name: `${name} - ${shortDesc}`,
                    value: { key, platform, name }
                };
            }).filter(platform => platform !== null);

            if (platforms.length === 0) {
                console.log('❌ Nenhuma plataforma disponível');
                return this.showMainMenu();
            }

            const choices = [
                ...platforms,
                new inquirer.Separator(),
                { name: '↩️ Voltar ao Menu Principal', value: 'back' }
            ];

            const result = await inquirer.prompt(
                menuSystem.createMenu(choices, '🏢 Selecione uma plataforma:')
            );

            if (!result || !result.selectedOption) {
                console.log('❌ Nenhuma plataforma selecionada');
                return this.showPlatformsMenu(platformsData);
            }

            const selectedOption = result.selectedOption;

            if (selectedOption === 'back') {
                boxRenderer.displayHeader();
                return this.showMainMenu();
            }

            if (!selectedOption.platform || !selectedOption.name) {
                console.error('❌ Estrutura da plataforma inválida');
                return this.showPlatformsMenu(platformsData);
            }

            const { platform, name } = selectedOption;

            console.log(boxRenderer.createPlatformBox(platform, name));

            await menuSystem.waitForInput();
            return this.showPlatformsMenu(platformsData);

        } catch (error) {
            console.error('❌ Erro no menu de plataformas:', error.message);
            return this.showMainMenu();
        }
    }

    /**
     * 🛠️ Exibe submenu de categorias de ferramentas OSINT
     * @param {Object} toolsData - 📊 Dados das ferramentas
     * @param {string} categoryName - 🏷️ Nome da categoria principal
     * @returns {Promise<void>} 📁 Submenu de categorias de ferramentas
     */
    async showToolsSubmenu(toolsData, categoryName) {
        try {
            const categories = Object.keys(toolsData);

            if (categories.length === 0) {
                console.log(`❌ Nenhuma categoria encontrada em ${categoryName}`);
                return this.showMainMenu();
            }

            console.log(`\n🛠️ ${categoryName} - ${categories.length} categorias:`);

            const choices = categories.map(cat => {
                const tools = toolsData[cat];
                const toolCount = Array.isArray(tools) ? tools.length : 0;
                return {
                    name: `${cat} (${toolCount})`,
                    value: cat
                };
            });

            choices.push(
                new inquirer.Separator(),
                { name: '↩️ Voltar ao Menu Principal', value: 'back' }
            );

            const result = await inquirer.prompt(
                menuSystem.createMenu(choices, `🛠️ ${categoryName}:`)
            );

            if (!result || !result.selectedOption) {
                console.log('❌ Nenhuma categoria selecionada');
                return this.showToolsSubmenu(toolsData, categoryName);
            }

            const selectedCategory = result.selectedOption;

            if (selectedCategory === 'back') {
                boxRenderer.displayHeader();
                return this.showMainMenu();
            }

            const categoryTools = toolsData[selectedCategory];
            if (!categoryTools || !Array.isArray(categoryTools)) {
                console.error(`❌ Estrutura inválida para categoria: ${selectedCategory}`);
                return this.showToolsSubmenu(toolsData, categoryName);
            }

            await this.showToolsList(categoryName, selectedCategory, categoryTools, toolsData);

        } catch (error) {
            console.error('❌ Erro no submenu de ferramentas:', error.message);
            return this.showMainMenu();
        }
    }

    /**
     * 📋 Exibe lista de ferramentas de uma categoria específica
     * @param {string} mainCategory - 🏷️ Categoria principal
     * @param {string} categoryName - 🏷️ Nome da subcategoria
     * @param {Array} tools - 🛠️ Lista de ferramentas
     * @param {Object} allToolsData - 📊 Todos os dados de ferramentas
     * @returns {Promise<void>} 🔧 Menu interativo de ferramentas
     */
    async showToolsList(mainCategory, categoryName, tools, allToolsData) {
        try {
            if (!tools || !Array.isArray(tools) || tools.length === 0) {
                console.log(`❌ Nenhuma ferramenta encontrada em ${categoryName}`);
                return this.showToolsSubmenu(allToolsData, mainCategory);
            }

            const toolChoices = tools.map(tool => ({
                name: `${tool.emoji || '🛠️'} ${tool.name || 'Ferramenta sem nome'}`,
                value: tool
            }));

            const choices = [
                ...toolChoices,
                new inquirer.Separator(),
                { name: '↩️ Voltar', value: 'back' }
            ];

            const result = await inquirer.prompt(
                menuSystem.createMenu(choices, `${mainCategory} › ${categoryName}:`)
            );

            if (!result || !result.selectedOption) {
                console.log('❌ Nenhuma ferramenta selecionada');
                return this.showToolsList(mainCategory, categoryName, tools, allToolsData);
            }

            const selectedTool = result.selectedOption;

            if (selectedTool === 'back') return this.showToolsSubmenu(allToolsData, mainCategory);

            const toolLink = selectedTool.link && selectedTool.id
                ? `${selectedTool.link}`
                : selectedTool.link || 'Link não disponível';

            const toolInfo = `🔗 ${toolLink}\n\n📁 ID: ${selectedTool.id || 'N/A'}`;

            console.log(boxRenderer.createContentBox(
                selectedTool.name || 'Ferramenta',
                toolInfo
            ));

            await menuSystem.waitForInput();
            return this.showToolsList(mainCategory, categoryName, tools, allToolsData);

        } catch (error) {
            console.error('❌ Erro na lista de ferramentas:', error.message);
            return this.showToolsSubmenu(allToolsData, mainCategory);
        }
    }

    /**
     * 🔧 Exibe menu de ferramentas básicas organizadas por subcategorias
     * @param {Object} toolsData - 📊 Dados das ferramentas básicas
     * @param {string} categoryName - 🏷️ Nome da categoria
     * @returns {Promise<void>} 🛠️ Menu de ferramentas básicas
     */
    async showBasicToolsMenu(toolsData, categoryName) {
        try {
            const mainKey = Object.keys(toolsData)[0];
            const subcategories = toolsData[mainKey];

            console.log(`\n🛠️ ${categoryName}:`);

            const choices = Object.keys(subcategories).map(subCatName => {
                const tools = subcategories[subCatName];
                const count = Array.isArray(tools) ? tools.length : '?';

                return {
                    name: `${subCatName} (${count})`,
                    value: subCatName
                };
            });

            choices.push(
                new inquirer.Separator(),
                { name: '↩️ Voltar', value: 'back' }
            );

            const result = await inquirer.prompt(
                menuSystem.createMenu(choices, `🛠️ ${categoryName}:`)
            );

            if (!result || !result.selectedOption) {
                console.log('❌ Nenhuma subcategoria selecionada');
                return this.showBasicToolsMenu(toolsData, categoryName);
            }

            const selectedSubCat = result.selectedOption;

            if (selectedSubCat === 'back') {
                return this.showMainMenu();
            }

            const toolsList = subcategories[selectedSubCat];

            if (Array.isArray(toolsList)) {
                const toolsText = toolsList.map((tool, index) =>
                    `${index + 1}. ${tool}`
                ).join('\n');

                console.log(boxRenderer.createContentBox(
                    `${categoryName} › ${selectedSubCat}`,
                    toolsText
                ));
            } else {
                console.log(boxRenderer.createContentBox(
                    `${categoryName} › ${selectedSubCat}`,
                    '❌ Estrutura de dados inesperada'
                ));
            }

            await menuSystem.waitForInput();
            return this.showBasicToolsMenu(toolsData, categoryName);

        } catch (error) {
            console.error('❌ Erro:', error.message);
            return this.showMainMenu();
        }
    }

    /**
     * 📄 Exibe conteúdo simples de uma categoria
     * @param {string} categoryName - 🏷️ Nome da categoria
     * @param {Object} data - 📊 Dados a serem exibidos
     * @returns {void} 📋 Conteúdo formatado no console
     */
    displaySimpleContent(categoryName, data) {
        try {
            const firstKey = Object.keys(data)[0];
            const content = data[firstKey] || data;

            if (typeof content === 'object' && content !== null) {
                const hasSteps = Object.keys(content).some(key => key.startsWith('passo_'));
                if (hasSteps) {
                    this.displaySteps(content);
                } else {
                    console.log(boxRenderer.createContentBox(categoryName, JSON.stringify(content, null, 2)));
                }
            } else {
                console.log(boxRenderer.createContentBox(categoryName, String(content)));
            }
        } catch (error) {
            console.log(boxRenderer.createContentBox(categoryName, 'Erro ao exibir conteúdo'));
        }
    }

    /**
     * 📚 Exibe conteúdo organizado em passos sequenciais
     * @param {Object} steps - 🗂️ Objeto com passos numerados
     * @returns {void} 📝 Passos exibidos sequencialmente
     */
    displaySteps(steps) {
        Object.entries(steps).forEach(([step, description], index) => {
            console.log(boxRenderer.createContentBox(`📍 Passo ${index + 1}`, description));
        });
    }
}

module.exports = new MainMenu();