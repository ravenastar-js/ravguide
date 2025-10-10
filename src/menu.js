/**
 * 📱 Sistema de Menu Interativo
 * 🎮 Interface de usuário para navegação nas categorias
 * 🔄 Navegação hierárquica e paginação inteligente
 */

const inquirer = require('inquirer');
const dataLoader = require('./data-loader');
const { displayContent, displayStepByStep, displayHeader, isMobileDevice } = require('./renderer');

let categories = []; // 📋 Cache de categorias

/**
 * ⏸️ Aguarda entrada do usuário para continuar
 * @returns {Promise<void>}
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
 * @returns {Promise<Array>} Lista de categorias disponíveis
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
 * 🏠 Mostra menu principal
 * @returns {Promise<void>}
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
        loop: false
    }]);

    selectedCategory === 'exit' 
        ? (console.log(isMobile ? '👋 Até logo!' : '👋 Até logo!'), process.exit(0))
        : await showCategoryContent(selectedCategory);
}

/**
 * 📖 Mostra conteúdo da categoria selecionada
 * @param {string} categoryName - Nome da categoria
 * @returns {Promise<void>}
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
 * 🛠️ Mostra submenu de ferramentas OSINT
 * @param {Object} toolsData - Dados das ferramentas
 * @returns {Promise<void>}
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

    console.log(`\n📁 Encontradas ${categories.length} categorias de ferramentas:`);
    categories.forEach((cat, index) => {
        console.log(`   ${index + 1}. ${cat}`);
    });
    console.log('');

    const choices = [
        ...categories.map(cat => ({
            name: `${cat} (${toolsData[cat].length})`,
            value: cat
        })),
        new inquirer.Separator(),
        { name: isMobile ? '↩️ Voltar' : '↩️ Voltar ao menu principal', value: 'back' }
    ];

    const { selectedCategory } = await inquirer.prompt([
        {
            type: 'list',
            name: 'selectedCategory',
            message: isMobile ? '🛠️ Selecione a categoria:' : '🛠️ Selecione uma categoria de ferramentas:',
            choices: choices,
            pageSize: isMobile ? 8 : 12,
            loop: false
        }
    ]);

    if (selectedCategory === 'back') {
        displayHeader();
        return showMainMenu();
    }

    await showToolsList(selectedCategory, toolsData[selectedCategory], toolsData);
}

/**
 * 📋 Mostra lista de ferramentas de uma categoria
 * @param {string} categoryName - Nome da categoria
 * @param {Array} tools - Lista de ferramentas
 * @param {Object} allToolsData - Todos os dados de ferramentas
 * @returns {Promise<void>}
 */
async function showToolsList(categoryName, tools, allToolsData) {
    const isMobile = isMobileDevice();
    const toolChoices = tools.map(tool => ({ name: tool.name, value: tool }));

    const { selectedTool } = await inquirer.prompt([{
        type: 'list',
        name: 'selectedTool',
        message: `${categoryName}:`,
        choices: [...toolChoices, new inquirer.Separator(),
                 { name: isMobile ? '🛠️ Outra categoria' : '🛠️ Ver outra categoria', value: 'another_category' },
                 { name: isMobile ? '↩️ Voltar' : '↩️ Voltar ao menu principal', value: 'back' }],
        pageSize: isMobile ? 8 : 12,
        loop: false
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
 * @param {Object} tool - Dados da ferramenta
 * @param {string} categoryName - Nome da categoria
 * @param {Object} allToolsData - Todos os dados de ferramentas
 * @returns {Promise<void>}
 */
async function showToolDetails(tool, categoryName, allToolsData) {
    const isMobile = isMobileDevice();

    console.log('\n' + '='.repeat(50));
    console.log(`🛠️ ${tool.name}`);
    console.log('='.repeat(50));
    console.log(`\n🔗 Link: ${tool.link}`);
    console.log(`📁 ID: ${tool.id}`);
    console.log(`📂 Categoria: ${categoryName}`);
    console.log('\n' + '='.repeat(50));

    const { action } = await inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: isMobile ? '📝 Opções:' : '📝 O que deseja fazer?',
        choices: [
            { name: isMobile ? '🛠️ Ver outra ferramenta' : '🛠️ Ver outra ferramenta', value: 'another_tool' },
            { name: isMobile ? '📂 Outra categoria' : '📂 Ver outra categoria', value: 'another_category' },
            { name: isMobile ? '↩️ Voltar' : '↩️ Voltar ao menu principal', value: 'back' }
        ],
        loop: false
    }]);

    switch (action) {
        case 'another_tool': await showToolsList(categoryName, allToolsData[categoryName], allToolsData); break;
        case 'another_category': await showToolsSubmenu(allToolsData); break;
        case 'back': displayHeader(); await showMainMenu(); break;
    }
}

/**
 * 🏢 Mostra submenu de plataformas de contato
 * @param {Object} platformsData - Dados das plataformas
 * @returns {Promise<void>}
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
 * 📄 Mostra plataformas com paginação
 * @param {Array} platforms - Lista de plataformas
 * @param {Object} platformsData - Dados completos
 * @returns {Promise<void>}
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
            { name: isMobile ? '↩️ Voltar' : '↩️ Voltar ao menu principal', value: 'back' }
        ];

        const { selectedOption } = await inquirer.prompt([{
            type: 'list',
            name: 'selectedOption',
            message: `🏢 Plataformas (Página ${currentPage + 1}/${totalPages}):`,
            choices: paginationChoices,
            pageSize: isMobile ? 8 : 12,
            loop: false
        }]);

        if (selectedOption === 'back') {
            displayHeader();
            return showMainMenu();
        } else if (selectedOption === 'prev') {
            currentPage--;
        } else if (selectedOption === 'next') {
            currentPage++;
        } else {
            await showPlatformDetails(selectedOption, platformsData);
            return;
        }
    }
}

/**
 * 🎯 Mostra seleção de plataformas sem paginação
 * @param {Array} platforms - Lista de plataformas
 * @param {Object} platformsData - Dados completos
 * @returns {Promise<void>}
 */
async function showPlatformSelection(platforms, platformsData) {
    const isMobile = isMobileDevice();
    
    const { selectedPlatform } = await inquirer.prompt([{
        type: 'list',
        name: 'selectedPlatform',
        message: isMobile ? '🏢 Selecione a plataforma:' : '🏢 Selecione uma plataforma:',
        choices: [...platforms, new inquirer.Separator(), 
                 { name: isMobile ? '↩️ Voltar' : '↩️ Voltar ao menu principal', value: 'back' }],
        pageSize: isMobile ? 8 : 12,
        loop: false
    }]);

    selectedPlatform === 'back' 
        ? (displayHeader(), showMainMenu())
        : await showPlatformDetails(selectedPlatform, platformsData);
}

/**
 * 📋 Mostra detalhes de uma plataforma específica
 * @param {Object} platformInfo - Informações da plataforma
 * @param {Object} platformsData - Dados completos
 * @returns {Promise<void>}
 */
async function showPlatformDetails(platformInfo, platformsData) {
    const { key, platform } = platformInfo;
    const platformName = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const isMobile = isMobileDevice();

    console.log('\n' + '='.repeat(50));
    console.log(`🏢 ${platformName}`);
    console.log('='.repeat(50));

    if (platform.message_pt) console.log(`\n${platform.message_pt}\n`);

    // 📧 Exibe informações de contato
    if (platform.type === 'email') {
        console.log(`📧 E-mail: ${platform.contact}`);
        if (platform.description_pt) console.log(`   📋 ${platform.description_pt}`);
    } else if (platform.type === 'form') {
        console.log(`📝 Formulário: ${platform.contact}`);
        if (platform.description_pt) console.log(`   📋 ${platform.description_pt}`);
    } else if (platform.type === 'multiple' && Array.isArray(platform.contacts)) {
        platform.contacts.forEach((contact, index) => {
            const contactType = contact.type === 'email' ? '📧 E-mail' :
                              contact.type === 'form' ? '📝 Formulário' : '📞 Contato';
            console.log(`\n${contactType}: ${contact.contact}`);
            if (contact.description_pt) console.log(`   📋 ${contact.description_pt}`);
        });
    }

    console.log('\n' + '='.repeat(50));

    const { action } = await inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: isMobile ? '📝 Opções:' : '📝 O que deseja fazer?',
        choices: [
            { name: isMobile ? '🏢 Ver outra plataforma' : '🏢 Ver outra plataforma', value: 'another' },
            { name: isMobile ? '↩️ Voltar' : '↩️ Voltar ao menu principal', value: 'back' },
            { name: isMobile ? '❌ Sair' : '❌ Sair', value: 'exit' }
        ],
        loop: false
    }]);

    switch (action) {
        case 'another': await showPlatformsSubmenu(platformsData); break;
        case 'back': displayHeader(); await showMainMenu(); break;
        case 'exit': console.log(isMobile ? '👋 Até logo!' : '👋 Até logo!'); process.exit(0); break;
    }
}

/**
 * 🎨 Exibe dados da categoria formatados
 * @param {string} categoryName - Nome da categoria
 * @param {Object} data - Dados da categoria
 * @returns {void}
 */
function displayCategoryData(categoryName, data) {
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
 * @param {string} currentCategory - Categoria atual
 * @returns {Promise<void>}
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
        loop: false
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