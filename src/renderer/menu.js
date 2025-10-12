const inquirer = require('inquirer');
const chalk = require('chalk');

const colors = {
    option: chalk.hex('#FFD166'),
    action: chalk.hex('#57f287'),
    danger: chalk.hex('#EF476F'),
    info: chalk.hex('#118AB2')
};

class MenuSystem {
    /**
     * 📱 Cria um menu interativo com opções personalizadas
     * @param {Array} choices - 📋 Lista de opções do menu
     * @param {string} message - 💬 Mensagem de prompt do menu
     * @returns {Object} 🎯 Configuração do menu para o inquirer
     */
    createMenu(choices, message = '🎯 Selecione uma opção:') {
        return {
            type: 'list',
            name: 'selectedOption',
            message: colors.option(message),
            choices: choices,
            pageSize: 12,
            loop: false
        };
    }

    /**
     * ⏸️ Aguarda entrada do usuário para continuar
     * @returns {Promise<void>} ⌨️ Promessa resolvida quando usuário pressiona Enter
     */
    async waitForInput() {
        await inquirer.prompt([{
            type: 'input',
            name: 'continue',
            message: 'Pressione Enter para continuar...'
        }]);
    }
}

module.exports = new MenuSystem();