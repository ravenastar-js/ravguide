/**
 * 🏠 Ponto de Entrada Principal
 * 🎯 Inicializa e executa a aplicação ravguide
 */

const { showMainMenu } = require('./menu.js');
const { displayHeader } = require('./renderer.js');

/**
 * 🚀 Função principal da aplicação
 * @returns {void}
 */
function main() {
    displayHeader();
    showMainMenu();
}

module.exports = { main };