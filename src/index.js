const mainMenu = require('./menu/main');
const boxRenderer = require('./renderer/box');

/**
 * 🚀 Função principal que inicia a aplicação
 * @returns {void} 📺 Exibe interface e gerencia fluxo principal
 */
function main() {
    boxRenderer.displayHeader();
    mainMenu.initialize()
        .then(() => mainMenu.showMainMenu())
        .catch(error => {
            console.error('❌ Erro fatal:', error.message);
            process.exit(1);
        });
}

module.exports = { main };