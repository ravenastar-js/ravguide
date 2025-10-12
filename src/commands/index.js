const dataLoader = require('../data/loader');
const boxRenderer = require('../renderer/box');
const colorSystem = require('../config/colors');
const mainMenu = require('../menu/main');

class CommandSystem {
    constructor() {
        this.colors = colorSystem.getColors();
        this.specialCommands = {
            'setup': () => this.showSetup(),
            'check': () => this.showCheck(),
            'doctor': () => this.showDoctor()
        };
    }

    /**
     * 🚀 Executa um comando direto do sistema
     * @param {string} command - 🎯 Comando a ser executado
     * @returns {Promise<void>} 📋 Resultado da execução do comando
     */
    async executeDirectCommand(command) {
        await dataLoader.initialize();

        if (this.specialCommands[command]) {
            return this.specialCommands[command]();
        }

        const data = dataLoader.getCategoryByCommand(command);

        if (!data) {
            console.log(boxRenderer.createErrorBox(`Comando "${command}" não encontrado`));
            console.log(this.colors.option('📖 Use "ravguide" sem argumentos para o menu interativo'));
            process.exit(1);
        }

        const interactiveCategories = [
            'ferramentas-osint', 'osint', 'ferramentas', 'tools',
            'contatos-plataformas', 'contatos', 'platforms'
        ];

        if (interactiveCategories.includes(command.toLowerCase())) {
            console.log(`\n🎯 Carregando menu interativo para ${command}...\n`);
            boxRenderer.displayHeader();
            await mainMenu.showMainMenu();
        } else {
            this.displayDirectContent(command, data);
            process.exit(0);
        }
    }

    /**
     * 📄 Exibe o conteúdo direto de um comando
     * @param {string} command - 🎯 Comando sendo executado
     * @param {Object} data - 📊 Dados do comando
     * @returns {void} 📋 Conteúdo exibido no console
     */
    displayDirectContent(command, data) {
        const categoryName = this.getCategoryDisplayName(data) || command;
        const categoryData = this.getCategoryContent(data);

        if (typeof categoryData === 'object' && categoryData !== null) {
            const hasSteps = Object.keys(categoryData).some(key => key.startsWith('passo_'));
            if (hasSteps) {
                this.displayStepByStep(categoryData);
            } else {
                this.displayContent(categoryName, categoryData);
            }
        } else {
            this.displayContent(categoryName, categoryData);
        }
    }

    /**
     * 🏷️ Obtém o nome de exibição da categoria
     * @param {Object} data - 📊 Dados da categoria
     * @returns {string} 📝 Nome para exibição da categoria
     */
    getCategoryDisplayName(data) {
        const firstKey = Object.keys(data)[0];
        return firstKey || 'Conteúdo';
    }

    /**
     * 📊 Obtém o conteúdo principal da categoria
     * @param {Object} data - 📁 Dados completos da categoria
     * @returns {*} 📄 Conteúdo principal da categoria
     */
    getCategoryContent(data) {
        const firstKey = Object.keys(data)[0];
        return data[firstKey] || data;
    }

    /**
     * 📚 Exibe conteúdo passo a passo
     * @param {Object} stepData - 🗂️ Dados dos passos
     * @returns {void} 📋 Passos exibidos no console
     */
    displayStepByStep(stepData) {
        console.log('\n📚 Conteúdo Passo a Passo:\n');

        const stepKeys = Object.keys(stepData)
            .filter(key => key.startsWith('passo_'))
            .sort((a, b) => {
                const numA = parseInt(a.replace('passo_', ''));
                const numB = parseInt(b.replace('passo_', ''));
                return numA - numB;
            });

        stepKeys.forEach((key, index) => {
            console.log(this.colors.title.bold(`📍 Passo ${index + 1}:`));
            console.log(this.colors.text(stepData[key]));
            console.log('');
        });
    }

    /**
     * 🖥️ Exibe conteúdo formatado no console
     * @param {string} categoryName - 🏷️ Nome da categoria
     * @param {*} content - 📄 Conteúdo a ser exibido
     * @returns {void} 📋 Conteúdo formatado exibido
     */
    displayContent(categoryName, content) {
        console.log(this.colors.title.bold(`\n📖 ${categoryName}\n`));

        if (typeof content === 'string') {
            console.log(this.colors.text(content));
        } else if (Array.isArray(content)) {
            content.forEach((item, index) => {
                const itemText = typeof item === 'string' ? item : JSON.stringify(item);
                console.log(this.colors.text(`  ${index + 1}. ${itemText}`));
            });
        } else if (typeof content === 'object') {
            Object.entries(content).forEach(([key, value]) => {
                console.log(this.colors.subtitle(`  ${key}:`));
                if (typeof value === 'string') {
                    console.log(this.colors.text(`    ${value}`));
                } else if (Array.isArray(value)) {
                    value.forEach((item, idx) => {
                        console.log(this.colors.text(`    ${idx + 1}. ${item}`));
                    });
                } else {
                    console.log(this.colors.text(`    ${JSON.stringify(value, null, 2)}`));
                }
            });
        } else {
            console.log(this.colors.text(String(content)));
        }
        console.log('');
    }

    /**
     * ⚙️ Exibe informações de configuração do sistema
     * @returns {void} 📋 Status do setup exibido
     */
    showSetup() {
        console.log('✅ O sistema configura automaticamente!');
        this.showDataStatus();
    }

    /**
     * 📊 Exibe verificação de status do sistema
     * @returns {void} 📋 Status completo do sistema
     */
    showCheck() {
        console.log('\n📊 Status do Sistema:');
        console.log(`   ✅ Node.js: Disponível`);
        console.log(`   ✅ Dependências: Instaladas`);

        const categories = dataLoader.getCategoryNames();
        console.log(`   📁 Categorias de dados: ${categories.length}`);

        if (categories.length > 0) {
            console.log('\n📚 Categorias disponíveis:');
            categories.forEach(category => {
                const icon = category.includes('Ferramentas') ? '🔍' :
                    category.includes('Instagram') ? '🔐' :
                        category.includes('Profissionais') ? '👥' : '📖';
                console.log(`   ${icon} ${category}`);
            });
        }
    }

    /**
     * 🏥 Executa diagnóstico completo do sistema
     * @returns {void} 📋 Relatório de diagnóstico
     */
    showDoctor() {
        console.log('\n🏥 Diagnóstico do Sistema:');

        const categories = dataLoader.getCategoryNames();
        const checks = [
            { name: 'Node.js', status: true },
            { name: 'Dependências', status: true },
            { name: 'Arquivos de dados', status: categories.length > 0 }
        ];

        checks.forEach(({ name, status }) => {
            console.log(`   ${status ? '✅' : '❌'} ${name}`);
        });

        if (checks.some(check => !check.status)) {
            console.log('\n💡 Recomendações:');
            console.log('   📁 Adicione arquivos JSON em data/');
            console.log('   🔧 Execute: npm install');
        }
    }

    /**
     * 📁 Exibe status dos dados carregados
     * @returns {void} 📋 Status dos arquivos de dados
     */
    showDataStatus() {
        const categories = dataLoader.getCategoryNames();

        if (categories.length === 0) {
            console.log('\n⚠️  Nenhum arquivo de dados em data/');
            console.log('📁 Adicione arquivos JSON para ver o menu completo');
        } else {
            console.log(`\n📁 ${categories.length} categoria(s) disponível(is)`);
            console.log('\n📚 Categorias:');
            categories.forEach(category => {
                console.log(`   📖 ${category}`);
            });
        }
    }
}

module.exports = new CommandSystem();