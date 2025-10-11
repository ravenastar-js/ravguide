/**
 * 📱 Sistema de Menu Interativo
 * 🎮 Interface de usuário para navegação nas categorias
 * 🔄 Navegação hierárquica e paginação inteligente
 * 🎯 Sistema completo de menus para todas as funcionalidades
 */

const inquirer = require('inquirer');
const dataLoader = require('./data-loader');
const {
    displayHeader,
    createToolBox,
    createPlatformBox,
    isMobileDevice,
} = require('./renderer');

let categories = []; // 📋 Cache de categorias para performance

/**
 * ⏸️ Aguarda entrada do usuário para continuar
 * @returns {Promise<void>} 📤 Promise que resolve quando o usuário pressiona Enter
 */
async function waitForInput() {
    const isMobile = isMobileDevice();
    
    await inquirer.prompt([{
        type: 'input',
        name: 'continue',
        message: isMobile ? 'Enter para continuar...' : 'Pressione Enter para continuar...'
    }]);
}

/**
 * 🔍 Verifica disponibilidade de dados do menu
 * @returns {Promise<Array>} 📋 Lista de categorias disponíveis
 * @throws {Error} 🚨 Se não houver dados disponíveis
 */
async function checkMenuData() {
    const dataCheck = await dataLoader.checkDataAvailability();
    const isMobile = isMobileDevice();

    if (!dataCheck.hasData) {
        const line = '='.repeat(isMobile ? 30 : 50);
        console.log(`\n${line}\n❌ MENU VAZIO\n${line}`);
        console.log(dataCheck.message);
        console.log(isMobile ? '\n📋 O que fazer:' : '\n📋 Instruções:');
        dataCheck.instructions.forEach(instruction => console.log(`  ${instruction}`));
        console.log(isMobile ? '\n💡 Dica: ravguide setup' : '\n💡 Dica: Execute "ravguide setup" para verificar a configuração.');
        console.log(line + '\n');

        await waitForInput();
        process.exit(1);
    }

    return dataCheck.categories;
}

/**
 * 🏠 Mostra menu principal da aplicação
 * @returns {Promise<void>} 📤 Promise que resolve quando o menu é concluído
 */
async function showMainMenu() {
    categories = await checkMenuData();
    const isMobile = isMobileDevice();

    const choices = [
        ...categories,
        new inquirer.Separator(),
        { name: isMobile ? '❌ Sair' : '❌ Sair', value: 'exit' }
    ];

    const { selectedCategory } = await inquirer.prompt([{
        type: 'list',
        name: 'selectedCategory',
        message: isMobile ? '📚 Selecione:' : '📚 Selecione uma categoria:',
        choices: choices,
        pageSize: isMobile ? 8 : 12,
        loop: false,
        validate: () => true,
        transformer: () => '',
    }]);

    selectedCategory === 'exit'
        ? (console.log(isMobile ? '👋 Até logo!' : '👋 Até logo!'), process.exit(0))
        : await showCategoryContent(selectedCategory);
}

/**
 * 📖 Mostra conteúdo da categoria selecionada
 * @param {string} categoryName - Nome da categoria selecionada
 * @returns {Promise<void>} 📤 Promise que resolve quando o conteúdo é exibido
 */
async function showCategoryContent(categoryName) {
    const data = dataLoader.getCategoryData(categoryName);

    if (!data) {
        console.log('❌ Categoria não encontrada');
        await waitForInput();
        return showMainMenu();
    }

    // 🎯 Roteamento para submenus especializados
    if (categoryName.toLowerCase().includes('contatos')) {
        await showPlatformsSubmenu(data);
    } else if (categoryName.toLowerCase().includes('ferramentas')) {
        await showToolsSubmenu(data);
    } else {
        displayCategoryData(categoryName, data);
        await showActionMenu(categoryName);
    }
}

/**
 * 🛠️ Mostra submenu de ferramentas OSINT com categorização
 * @param {Object} toolsData - Dados das ferramentas organizadas por categoria
 * @returns {Promise<void>} 📤 Promise que resolve quando o submenu é concluído
 */
async function showToolsSubmenu(toolsData) {
    const isMobile = isMobileDevice();

    // 🎯 Garantir que temos um objeto com categorias
    if (!toolsData || typeof toolsData !== 'object') {
        console.log('❌ Dados de ferramentas inválidos');
        await waitForInput();
        return showMainMenu();
    }

    // 🎯 Extrair categorias corretamente
    const categories = Object.keys(toolsData);

    if (categories.length === 0) {
        console.log('❌ Nenhuma categoria de ferramentas encontrada');
        await waitForInput();
        return showMainMenu();
    }

    categories.forEach((cat, index) => {
        // 🎯 Calcular número de ferramentas corretamente para diferentes estruturas
        const categoryData = toolsData[cat];
        let toolCount = 0;

        if (Array.isArray(categoryData)) {
            // Estrutura OSINT: array de ferramentas
            toolCount = categoryData.length;
        } else if (typeof categoryData === 'object' && categoryData !== null) {
            // Estrutura básica: objeto com subcategorias
            toolCount = Object.values(categoryData).reduce((total, subArray) => {
                return total + (Array.isArray(subArray) ? subArray.length : 0);
            }, 0);
        }
    });
    console.log('');

    const choices = [
        ...categories.map(cat => {
            // 🎯 Calcular número de ferramentas para cada categoria
            const categoryData = toolsData[cat];
            let toolCount = 0;

            if (Array.isArray(categoryData)) {
                toolCount = categoryData.length;
            } else if (typeof categoryData === 'object' && categoryData !== null) {
                toolCount = Object.values(categoryData).reduce((total, subArray) => {
                    return total + (Array.isArray(subArray) ? subArray.length : 0);
                }, 0);
            }

            return {
                name: `${cat} (${toolCount})`,
                value: cat
            };
        }),
        new inquirer.Separator(),
        { name: isMobile ? '↩️ Voltar' : '↩️ Voltar ao menu principal', value: 'back' },
        { name: isMobile ? '❌ Sair' : '❌ Sair', value: 'exit' }
    ];

    const { selectedCategory } = await inquirer.prompt([
        {
            type: 'list',
            name: 'selectedCategory',
            message: isMobile ? '🛠️ Selecione a categoria:' : '🛠️ Selecione uma categoria de ferramentas:',
            choices: choices,
            pageSize: isMobile ? 8 : 12,
            loop: false,
        validate: () => true,
        transformer: () => '',
        }
    ]);

    if (selectedCategory === 'back') {
        displayHeader();
        return showMainMenu();
    } else if (selectedCategory === 'exit') {
        console.log(isMobile ? '👋 Até logo!' : '👋 Até logo!');
        process.exit(0);
    }

    // 🎯 Verificar o tipo de estrutura de dados
    const categoryData = toolsData[selectedCategory];

    if (Array.isArray(categoryData)) {
        // Estrutura OSINT: ir direto para lista de ferramentas
        await showToolsList(selectedCategory, categoryData, toolsData);
    } else if (typeof categoryData === 'object' && categoryData !== null) {
        // Estrutura básica: mostrar subcategorias primeiro
        await showBasicToolsSubcategories(selectedCategory, categoryData, toolsData);
    } else {
        console.log('❌ Estrutura de dados não suportada');
        await waitForInput();
        return showToolsSubmenu(toolsData);
    }
}

/**
 * 📂 Mostra subcategorias para Ferramentas Básicas
 * @param {string} categoryName - Nome da categoria principal
 * @param {Object} subcategories - Objeto com subcategorias e suas ferramentas
 * @param {Object} allToolsData - Todos os dados de ferramentas
 * @returns {Promise<void>} 📤 Promise que resolve quando a subcategoria é selecionada
 */
async function showBasicToolsSubcategories(categoryName, subcategories, allToolsData) {
    const isMobile = isMobileDevice();

    const subcategoryNames = Object.keys(subcategories);

    console.log(`\n📂 ${categoryName} - ${subcategoryNames.length} subcategorias:`);
    subcategoryNames.forEach((subcat, index) => {
        const toolCount = Array.isArray(subcategories[subcat]) ? subcategories[subcat].length : 0;
        console.log(`   ${index + 1}. ${subcat} (${toolCount} ferramentas)`);
    });
    console.log('');

    const choices = [
        ...subcategoryNames.map(subcat => {
            const toolCount = Array.isArray(subcategories[subcat]) ? subcategories[subcat].length : 0;
            return {
                name: `${subcat} (${toolCount})`,
                value: subcat
            };
        }),
        new inquirer.Separator(),
        { name: isMobile ? '↩️ Voltar' : '↩️ Voltar às categorias', value: 'back' },
        { name: isMobile ? '❌ Sair' : '❌ Sair', value: 'exit' }
    ];

    const { selectedSubcategory } = await inquirer.prompt([{
        type: 'list',
        name: 'selectedSubcategory',
        message: isMobile ? '📂 Selecione a subcategoria:' : `📂 ${categoryName} - Selecione uma subcategoria:`,
        choices: choices,
        pageSize: isMobile ? 8 : 12,
        loop: false,
        validate: () => true,
        transformer: () => '',
    }]);

    if (selectedSubcategory === 'back') {
        return showToolsSubmenu(allToolsData);
    } else if (selectedSubcategory === 'exit') {
        console.log(isMobile ? '👋 Até logo!' : '👋 Até logo!');
        process.exit(0);
    }

    await showBasicToolsList(categoryName, selectedSubcategory, subcategories[selectedSubcategory], allToolsData);
}

/**
 * 📋 Mostra lista de ferramentas básicas de uma subcategoria
 * @param {string} categoryName - Nome da categoria principal
 * @param {string} subcategoryName - Nome da subcategoria
 * @param {Array} tools - Lista de ferramentas da subcategoria
 * @param {Object} allToolsData - Todos os dados de ferramentas
 * @returns {Promise<void>} 📤 Promise que resolve quando a ação é processada
 */
async function showBasicToolsList(categoryName, subcategoryName, tools, allToolsData) {
    const isMobile = isMobileDevice();
    
    console.log(`\n🛠️ ${categoryName} › ${subcategoryName}:`);
    
    // 🎯 Apenas mostra a lista, sem menu interativo para ferramentas individuais
    tools.forEach((tool, index) => {
        const toolName = typeof tool === 'string' ? tool : (tool.name || 'Ferramenta sem nome');
        console.log(`   ${index + 1}. ${toolName}`);
    });
    console.log('');

    const { action } = await inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: isMobile ? '🎯 O que fazer?' : '🎯 O que deseja fazer?',
        choices: [
            { name: isMobile ? '📂 Outra subcategoria' : '📂 Ver outra subcategoria', value: 'another_subcategory' },
            { name: isMobile ? '🛠️ Outra categoria' : '🛠️ Ver outra categoria', value: 'another_category' },
            { name: isMobile ? '↩️ Voltar' : '↩️ Voltar ao menu', value: 'back' },
            { name: isMobile ? '❌ Sair' : '❌ Sair', value: 'exit' }
        ],
        pageSize: 4,
        loop: false,
        validate: () => true,
        transformer: () => '',
    }]);

    // 🎯 Lidar com a ação manualmente
    switch (action) {
        case 'back':
            displayHeader();
            await showMainMenu();
            break;
            
        case 'another_subcategory':
            const categoryData = allToolsData[categoryName];
            await showBasicToolsSubcategories(categoryName, categoryData, allToolsData);
            break;
            
        case 'another_category':
            await showToolsSubmenu(allToolsData);
            break;
            
        case 'exit':
            console.log(isMobile ? '👋 Até logo!' : '👋 Até logo!');
            process.exit(0);
            break;
            
        default:
            // Nada a fazer
            break;
    }
}

/**
 * 📋 Mostra lista de ferramentas de uma categoria OSINT
 * @param {string} categoryName - Nome da categoria
 * @param {Array} tools - Lista de ferramentas da categoria
 * @param {Object} allToolsData - Todos os dados de ferramentas
 * @returns {Promise<void>} 📤 Promise que resolve quando uma ferramenta é selecionada
 */
async function showToolsList(categoryName, tools, allToolsData) {
    const isMobile = isMobileDevice();

    const toolChoices = tools.map(tool => ({
        name: tool.name || 'Ferramenta sem nome',
        value: tool
    }));

    const { selectedTool } = await inquirer.prompt([{
        type: 'list',
        name: 'selectedTool',
        message: `${categoryName}:`,
        choices: [...toolChoices, new inquirer.Separator(),
        { name: isMobile ? '🛠️ Outra categoria' : '🛠️ Ver outra categoria', value: 'another_category' },
        { name: isMobile ? '↩️ Voltar' : '↩️ Voltar ao menu principal', value: 'back' }],
        pageSize: isMobile ? 8 : 12,
        loop: false,
        validate: () => true,
        transformer: () => '',
    }]);

    if (selectedTool === 'back') {
        displayHeader();
        return showMainMenu();
    } else if (selectedTool === 'another_category') {
        return showToolsSubmenu(allToolsData);
    }

    await showToolDetails(selectedTool, categoryName, allToolsData);
}

/**
 * 🔍 Mostra detalhes de uma ferramenta específica
 * @param {Object} tool - Dados da ferramenta selecionada
 * @param {string} categoryName - Nome da categoria da ferramenta
 * @param {Object} allToolsData - Todos os dados de ferramentas
 * @returns {Promise<void>} 📤 Promise que resolve quando os detalhes são exibidos
 */
async function showToolDetails(tool, categoryName, allToolsData) {
    const isMobile = isMobileDevice();
    
    // 🎯 Usa o sistema de box de ferramentas
    const toolBox = createToolBox(tool, categoryName);
    console.log(toolBox);

    const { action } = await inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: isMobile ? '🎯 Opções:' : '🎯 O que deseja fazer?',
        choices: [
            { name: isMobile ? '🛠️ Outra ferramenta' : '🛠️ Ver outra ferramenta', value: 'another_tool' },
            { name: isMobile ? '📂 Outra categoria' : '📂 Ver outra categoria', value: 'another_category' },
            { name: isMobile ? '↩️ Voltar' : '↩️ Voltar ao menu', value: 'back' },
            { name: isMobile ? '❌ Sair' : '❌ Sair', value: 'exit' }
        ],
        pageSize: isMobile ? 5 : 8,
        loop: false,
        validate: () => true,
        transformer: () => '',
    }]);

    // 🎯 Lidar com a ação manualmente
    switch (action) {
        case 'back':
            displayHeader();
            await showMainMenu();
            break;
            
        case 'another_tool':
            await showToolsList(categoryName, allToolsData[categoryName], allToolsData);
            break;
            
        case 'another_category':
            await showToolsSubmenu(allToolsData);
            break;
            
        case 'exit':
            console.log(isMobile ? '👋 Até logo!' : '👋 Até logo!');
            process.exit(0);
            break;
            
        default:
            // Nada a fazer
            break;
    }
}

/**
 * 🏢 Mostra submenu de plataformas de contato
 * @param {Object} platformsData - Dados das plataformas organizadas por tipo
 * @returns {Promise<void>} 📤 Promise que resolve quando uma plataforma é selecionada
 */
async function showPlatformsSubmenu(platformsData) {
    const isMobile = isMobileDevice();
    const platforms = Object.entries(platformsData).map(([key, platform]) => {
        const name = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const description = platform.message_pt || platform.description_pt || 'Contatos de denúncia';
        const shortDesc = description.length > 50 ? description.substring(0, 47) + '...' : description;

        return {
            name: `${name} - ${shortDesc}`,
            value: { key, platform }
        };
    }).sort((a, b) => a.name.localeCompare(b.name));

    // 📄 Paginação para muitas plataformas
    platforms.length > 20
        ? await showPaginatedPlatforms(platforms, platformsData)
        : await showPlatformSelection(platforms, platformsData);
}

/**
 * 📄 Mostra plataformas com paginação para listas grandes
 * @param {Array} platforms - Lista completa de plataformas
 * @param {Object} platformsData - Dados completos das plataformas
 * @returns {Promise<void>} 📤 Promise que resolve quando a navegação é concluída
 */
async function showPaginatedPlatforms(platforms, platformsData) {
    const isMobile = isMobileDevice();

    const pageSize = isMobile ? 15 : 25;
    let currentPage = 0;
    const totalPages = Math.ceil(platforms.length / pageSize);

    while (true) {
        const startIdx = currentPage * pageSize;
        const currentPlatforms = platforms.slice(startIdx, startIdx + pageSize);

        const paginationChoices = [
            ...currentPlatforms,
            new inquirer.Separator(),
            ...(currentPage > 0 ? [{ name: '⬅️ Página anterior', value: 'prev' }] : []),
            ...(currentPage < totalPages - 1 ? [{ name: '➡️ Próxima página', value: 'next' }] : []),
            new inquirer.Separator(),
            { name: isMobile ? '↩️ Voltar' : '↩️ Voltar ao menu principal', value: 'back' },
            { name: isMobile ? '❌ Sair' : '❌ Sair', value: 'exit' }
        ];

        const { selectedOption } = await inquirer.prompt([{
            type: 'list',
            name: 'selectedOption',
            message: `🏢 Plataformas (Página ${currentPage + 1}/${totalPages}):`,
            choices: paginationChoices,
            pageSize: isMobile ? 8 : 12,
            loop: false,
        validate: () => true,
        transformer: () => '',
        }]);

        // 🎯 Primeiro verificar ações de navegação
        if (selectedOption === 'back') {
            displayHeader();
            return showMainMenu();
        } else if (selectedOption === 'exit') {
            console.log(isMobile ? '👋 Até logo!' : '👋 Até logo!');
            process.exit(0);
        } else if (selectedOption === 'prev') {
            currentPage--;
            continue;
        } else if (selectedOption === 'next') {
            currentPage++;
            continue;
        }

        // 🎯 Se chegou aqui, é uma plataforma selecionada
        if (selectedOption && typeof selectedOption === 'object' && selectedOption.key && selectedOption.platform) {
            await showPlatformDetails(selectedOption, platformsData);
            return;
        } else {
            console.log('❌ Plataforma selecionada inválida');
            await waitForInput();
            continue;
        }
    }
}

/**
 * 🎯 Mostra seleção de plataformas sem paginação
 * @param {Array} platforms - Lista de plataformas
 * @param {Object} platformsData - Dados completos das plataformas
 * @returns {Promise<void>} 📤 Promise que resolve quando uma plataforma é selecionada
 */
async function showPlatformSelection(platforms, platformsData) {
    const isMobile = isMobileDevice();

    const choices = [
        ...platforms,
        new inquirer.Separator(),
        { name: isMobile ? '↩️ Voltar' : '↩️ Voltar ao menu principal', value: 'back' },
        { name: isMobile ? '❌ Sair' : '❌ Sair', value: 'exit' }
    ];

    const { selectedPlatform } = await inquirer.prompt([{
        type: 'list',
        name: 'selectedPlatform',
        message: isMobile ? '🏢 Selecione a plataforma:' : '🏢 Selecione uma plataforma:',
        choices: choices,
        pageSize: isMobile ? 8 : 12,
        loop: false,
        validate: () => true,
        transformer: () => '',
    }]);

    // 🎯 Primeiro verificar ações de navegação
    if (selectedPlatform === 'back') {
        displayHeader();
        return showMainMenu();
    } else if (selectedPlatform === 'exit') {
        console.log(isMobile ? '👋 Até logo!' : '👋 Até logo!');
        process.exit(0);
    }

    // 🎯 Verificar se selectedPlatform tem a estrutura correta
    if (selectedPlatform && typeof selectedPlatform === 'object' && selectedPlatform.key && selectedPlatform.platform) {
        await showPlatformDetails(selectedPlatform, platformsData);
    } else {
        console.log('❌ Plataforma selecionada inválida');
        await waitForInput();
        return showPlatformSelection(platforms, platformsData);
    }
}

/**
 * 📋 Mostra detalhes de uma plataforma específica
 * @param {Object} platformInfo - Informações da plataforma selecionada
 * @param {string} platformInfo.key - Chave identificadora da plataforma
 * @param {Object} platformInfo.platform - Dados completos da plataforma
 * @param {Object} platformsData - Dados completos de todas as plataformas
 * @returns {Promise<void>} 📤 Promise que resolve quando os detalhes são exibidos
 */
async function showPlatformDetails(platformInfo, platformsData) {
    // 🎯 Verificar se platformInfo é válido
    if (!platformInfo || typeof platformInfo !== 'object') {
        console.log('❌ Informações da plataforma inválidas');
        await waitForInput();
        return showPlatformsSubmenu(platformsData);
    }

    const { key, platform } = platformInfo;
    
    // 🎯 Verificar se key e platform existem
    if (!key || !platform) {
        console.log('❌ Dados da plataforma incompletos');
        await waitForInput();
        return showPlatformsSubmenu(platformsData);
    }

    const platformName = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const isMobile = isMobileDevice();

    // 🎯 Usa o novo sistema de box de plataformas
    const platformBox = createPlatformBox(platform, platformName);
    console.log(platformBox);

    const { action } = await inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: isMobile ? '🎯 Ações:' : '🎯 Ações:',
        choices: [
            { name: isMobile ? '🏢 Outra' : '🏢 Ver outra plataforma', value: 'another_platform' },
            { name: isMobile ? '↩️ Voltar' : '↩️ Voltar ao menu', value: 'back' },
            { name: isMobile ? '❌ Sair' : '❌ Sair', value: 'exit' }
        ],
        pageSize: 3,
        loop: false,
        validate: () => true,
        transformer: () => '',
    }]);

    // 🎯 Lidar com a ação manualmente
    switch (action) {
        case 'back':
            displayHeader();
            await showMainMenu();
            break;
            
        case 'another_platform':
            await showPlatformsSubmenu(platformsData);
            break;
            
        case 'exit':
            console.log(isMobile ? '👋 Até logo!' : '👋 Até logo!');
            process.exit(0);
            break;
            
        default:
            // Nada a fazer
            break;
    }
}

/**
 * 🎨 Exibe dados da categoria formatados
 * @param {string} categoryName - Nome da categoria
 * @param {Object} data - Dados da categoria
 * @returns {void} 📤 Não retorna valor - apenas exibe no console
 */
function displayCategoryData(categoryName, data) {
    const { displayContent, displayStepByStep } = require('./renderer');

    const firstKey = Object.keys(data)[0];
    const firstValue = data[firstKey];

    if (typeof firstValue === 'object' && firstValue !== null) {
        const hasSteps = Object.keys(firstValue).some(key => key.startsWith('passo_'));
        hasSteps ? displayStepByStep(firstValue) : displayContent(firstKey, firstValue);
    } else {
        displayContent(categoryName, data);
    }
}

/**
 * 📝 Mostra menu de ações pós-conteúdo
 * @param {string} currentCategory - Categoria atual sendo visualizada
 * @returns {Promise<void>} 📤 Promise que resolve quando a ação é processada
 */
async function showActionMenu(currentCategory) {
    const isMobile = isMobileDevice();
    const categoryData = dataLoader.getCategoryData(currentCategory);
    const isPaginated = categoryData &&
        (currentCategory.toLowerCase().includes('contatos') ||
            currentCategory.toLowerCase().includes('ferramentas'));

    const choices = [
        { name: isMobile ? '↩️ Voltar' : '↩️ Voltar ao menu principal', value: 'back' },
        { name: isMobile ? '❌ Sair' : '❌ Sair', value: 'exit' }
    ];

    if (isPaginated) {
        choices.unshift({
            name: isMobile ? '🔄 Ver de novo' : '🔄 Ver esta categoria novamente',
            value: 'reload'
        });
    }

    const { action } = await inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: isMobile ? '📝 Opções:' : '📝 O que deseja fazer?',
        choices: choices,
        loop: false,
        validate: () => true,
        transformer: () => '',
    }]);

    switch (action) {
        case 'back': displayHeader(); await showMainMenu(); break;
        case 'reload': await showCategoryContent(currentCategory); break;
        case 'exit': console.log(isMobile ? '👋 Até logo!' : '👋 Até logo!'); process.exit(0); break;
    }
}

module.exports = {
    showMainMenu,
    showToolsSubmenu,
    showPlatformsSubmenu
};