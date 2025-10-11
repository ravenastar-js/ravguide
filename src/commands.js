/**
 * 🎯 Módulo de Comandos Diretos
 * ⚡ Executa comandos via linha de comando sem menu interativo
 * 📍 Processa argumentos CLI e redireciona para funcionalidades específicas
 */

const dataLoader = require('./data-loader');
const {
    displayHeader,
    createErrorBox,
    colors
} = require('./renderer');

/**
 * 🚀 Executa comando direto baseado no argumento da linha de comando
 * @param {string} command - Comando a ser executado
 * @returns {Promise<void>} 📤 Promise que resolve quando o comando é concluído
 * @throws {Error} 🚨 Se houver erro no carregamento de dados ou execução
 */
async function executeDirectCommand(command) {
    // 🔄 Inicializa o carregador de dados
    await dataLoader.initialize();

    // 🔍 Busca dados correspondentes ao comando
    const data = dataLoader.getCategoryByCommand(command);

    // 🚨 Verifica se o comando existe
    if (!data) {
        const errorBox = createErrorBox(
            `Comando "${command}" não encontrado.`,
            'Comando Inválido'
        );
        console.log(errorBox);
        console.log(colors.option('📖 Use "ravguide" sem argumentos para ver o menu interativo.'));
        process.exit(1);
    }

    // 🎯 Lista de categorias que devem usar menu interativo
    const interactiveCategories = [
        'ferramentas-osint', 'osint', 'ferramentas', 'tools',
        'contatos-plataformas', 'contatos', 'platforms'
    ];

    // 🔄 Decide entre modo direto ou interativo
    if (interactiveCategories.includes(command.toLowerCase())) {
        // 📱 Redireciona para menu interativo ESPECÍFICO
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

/**
 * 📋 Exibe conteúdo passo a passo para tutoriais
 * @param {Object} stepData - Dados dos passos do tutorial
 * @returns {void} 📤 Não retorna valor - apenas exibe no console
 */
function displayStepByStep(stepData) {
    console.log('\n📚 Conteúdo Passo a Passo:\n');
    
    // 🔄 Ordena as chaves para garantir sequência correta
    const stepKeys = Object.keys(stepData).filter(key => key.startsWith('passo_'));
    stepKeys.sort((a, b) => {
        const numA = parseInt(a.replace('passo_', ''));
        const numB = parseInt(b.replace('passo_', ''));
        return numA - numB;
    });

    // 🎯 Exibe cada passo formatado
    stepKeys.forEach((key, index) => {
        console.log(colors.title.bold(`📍 Passo ${index + 1}:`));
        console.log(colors.text(stepData[key]));
        console.log(''); // Linha em branco entre passos
    });
}

/**
 * 📄 Exibe conteúdo simples de uma categoria
 * @param {string} categoryName - Nome da categoria
 * @param {any} content - Conteúdo a ser exibido
 * @returns {void} 📤 Não retorna valor - apenas exibe no console
 */
function displayContent(categoryName, content) {
    console.log(colors.title.bold(`\n📖 ${categoryName}\n`));
    
    if (typeof content === 'string') {
        console.log(colors.text(content));
    } else if (Array.isArray(content)) {
        content.forEach((item, index) => {
            console.log(colors.text(`  ${index + 1}. ${item}`));
        });
    } else if (typeof content === 'object') {
        Object.entries(content).forEach(([key, value]) => {
            console.log(colors.subtitle(`  ${key}:`));
            console.log(colors.text(`    ${value}`));
        });
    } else {
        console.log(colors.text(String(content)));
    }
    console.log(''); // Linha final em branco
}

module.exports = { 
    executeDirectCommand,
    displayStepByStep,
    displayContent 
};