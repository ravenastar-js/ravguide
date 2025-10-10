/**
 * 🎯 Módulo de Comandos Diretos
 * ⚡ Executa comandos via linha de comando sem menu interativo
 */

const dataLoader = require('./data-loader');
const { displayHeader } = require('./renderer');

/**
 * 🚀 Executa comando direto baseado no argumento
 * @param {string} command - Comando a ser executado
 * @returns {Promise<void>}
 */
async function executeDirectCommand(command) {
    await dataLoader.initialize();

    const data = dataLoader.getCategoryByCommand(command);

    if (!data) {
        console.log(`❌ Comando "${command}" não encontrado.`);
        console.log('📖 Use "ravguide" sem argumentos para ver o menu interativo.');
        process.exit(1);
    }

    // 🎯 Lista de categorias que devem usar menu interativo
    const interactiveCategories = [
        'ferramentas-osint', 'osint', 'ferramentas', 'tools',
        'contatos-plataformas', 'contatos', 'platforms'
    ];

    if (interactiveCategories.includes(command.toLowerCase())) {
        // 🔄 Redireciona para menu interativo ESPECÍFICO
        console.log(`\n🎯 Carregando menu interativo para ${command}...\n`);

        // 🎯 Usar o menu específico baseado no tipo de categoria
        if (command.toLowerCase().includes('ferramentas') || command.toLowerCase().includes('osint') || command.toLowerCase().includes('tools')) {
            // 🛠️ Menu de ferramentas OSINT
            const { showToolsSubmenu } = require('./menu');

            // 🎯 Passar os dados corretos para o submenu
            const toolsData = dataLoader.getCategoryData('Ferramentas OSINT') || data;
            await showToolsSubmenu(toolsData);

        } else if (command.toLowerCase().includes('contatos') || command.toLowerCase().includes('platforms')) {
            // 🏢 Menu de contatos
            const { showPlatformsSubmenu } = require('./menu');
            await showPlatformsSubmenu(data);

        } else {
            // 🏠 Menu principal como fallback
            const { showMainMenu } = require('./menu');
            displayHeader();
            await showMainMenu();
        }

    } else {
        // 📖 Exibe conteúdo direto para categorias simples
        const categoryName = Object.keys(data)[0] || command;
        const categoryData = Object.values(data)[0] || data;

        if (typeof categoryData === 'object' && categoryData !== null) {
            const hasSteps = Object.keys(categoryData).some(key => key.startsWith('passo_'));
            if (hasSteps) {
                displayStepByStep(categoryData);
            } else {
                displayContent(categoryName, categoryData);
            }
        } else {
            displayContent(categoryName, categoryData);
        }
        process.exit(0);
    }
}


module.exports = { executeDirectCommand };