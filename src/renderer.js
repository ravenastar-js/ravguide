/**
 * 🎨 Sistema de Renderização e Interface
 * 📱 Renderiza conteúdo de forma adaptativa para diferentes dispositivos
 * 🎯 Formatação inteligente com suporte a cores e layouts responsivos
 * 🔄 Camada de abstração sobre o sistema de boxes para interface unificada
 */

const { 
    displayHeader: boxDisplayHeader,
    createStepBox,
    createSimpleContentBox,
    createToolBox,
    createPlatformBox,
    createErrorBox,
    createSuccessBox,
    colors,
    isMobileDevice: boxIsMobileDevice,
    getTerminalWidth: boxGetTerminalWidth
} = require('./box');

// 📱 Re-exporta funções do box para compatibilidade
const isMobileDevice = boxIsMobileDevice;
const getTerminalWidth = boxGetTerminalWidth;

/**
 * 📖 Exibe conteúdo formatado com título e formatação inteligente
 * @param {string} title - Título do conteúdo a ser exibido
 * @param {any} content - Conteúdo a ser formatado e exibido
 * @returns {void} 📤 Não retorna valor - apenas exibe no console
 */
function displayContent(title, content) {
    console.log('\n');

    // 🎯 Processar o conteúdo para exibição correta
    let displayText = '';

    if (typeof content === 'string') {
        // Se for string, usar diretamente
        displayText = content;
    } else if (typeof content === 'object' && content !== null) {
        // Se for objeto, extrair o conteúdo relevante
        const firstKey = Object.keys(content)[0];
        const firstValue = content[firstKey];

        if (typeof firstValue === 'string') {
            // Se o valor é string, usar ele
            displayText = firstValue;
        } else {
            // Se não, mostrar como JSON formatado (fallback)
            displayText = JSON.stringify(content, null, 2);
        }
    } else {
        // Outros tipos (number, boolean, etc.)
        displayText = String(content);
    }

    const contentBox = createSimpleContentBox(title, displayText);
    console.log(contentBox);
}

/**
 * 🚶‍♂️ Exibe conteúdo passo a passo com formatação sequencial
 * @param {Object} steps - Objeto contendo os passos a serem exibidos
 * @returns {void} 📤 Não retorna valor - apenas exibe no console
 */
function displayStepByStep(steps) {
    console.log('\n');

    Object.entries(steps).forEach(([step, description], index) => {
        const stepNumber = index + 1;
        const stepTitle = `📍 Passo ${stepNumber}`;

        const stepBox = createStepBox(stepTitle, description);
        console.log(stepBox);
    });
}

/**
 * 🎨 Re-exporta todas as funções necessárias para interface unificada
 */
module.exports = {
    // 🖼️ Funções de exibição principal
    displayHeader: boxDisplayHeader,
    displayContent,
    displayStepByStep,
    
    // 📱 Utilitários de dispositivo
    isMobileDevice,
    getTerminalWidth,

    // 🎨 Funções de box para uso direto
    createStepBox, 
    createSimpleContentBox,
    createToolBox,
    createPlatformBox,
    createErrorBox,
    createSuccessBox,
    colors,

    // 📋 Sistema de menus
    createMenu: require('./box').createMenu
};