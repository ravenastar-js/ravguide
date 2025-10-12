#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const commandSystem = require('../src/commands');
const boxRenderer = require('../src/renderer/box');

/**
 * 🔍 Verifica se o Node.js está instalado no sistema
 * @returns {boolean} 📋 true se Node.js está disponível, false caso contrário
 */
function checkNodeJS() {
    try {
        execSync('node --version', { stdio: 'pipe' });
        return true;
    } catch {
        return false;
    }
}

/**
 * 📦 Verifica se todas as dependências estão instaladas
 * @returns {boolean} ✅ true se todas as dependências estão presentes, false caso contrário
 */
function checkDependencies() {
    const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
    const packageJsonPath = path.join(__dirname, '..', 'package.json');

    if (!fs.existsSync(nodeModulesPath) || !fs.existsSync(packageJsonPath)) {
        return false;
    }

    try {
        const packageData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const deps = Object.keys(packageData.dependencies || {});
        return deps.every(dep => fs.existsSync(path.join(nodeModulesPath, dep)));
    } catch {
        return false;
    }
}

/**
 * 📁 Verifica se o diretório data existe
 * @returns {boolean} ✅ true se o diretório existe, false caso contrário
 */
function checkDataDirectory() {
    return fs.existsSync(path.join(__dirname, '..', 'data'));
}

/**
 * ⚙️ Instala as dependências do projeto via npm install
 * @returns {boolean} ✅ true se a instalação foi bem-sucedida, false caso contrário
 */
function installDependencies() {
    console.log('📦 Instalando dependências...');
    try {
        execSync('npm install', {
            stdio: 'inherit',
            cwd: path.join(__dirname, '..')
        });
        console.log('✅ Dependências instaladas!');
        return true;
    } catch {
        console.log('❌ Falha na instalação automática');
        return false;
    }
}

/**
 * 📂 Cria o diretório data se não existir
 * @returns {void} 📁 Diretório criado (se necessário)
 */
function createDataDirectory() {
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
        console.log('📁 Criando diretório data...');
        fs.mkdirSync(dataDir, { recursive: true });
    }
}

/**
 * 🚀 Executa a configuração automática do ambiente
 * @returns {void} ⚙️ Configura o ambiente ou encerra o processo em caso de erro
 */
function autoSetup() {
    console.log('🔍 Verificando ambiente...');

    if (!checkNodeJS()) {
        console.log(boxRenderer.createErrorBox('Node.js não encontrado!'));
        console.log('📥 Baixe em: https://nodejs.org');
        process.exit(1);
    }

    const needsDeps = !checkDependencies();
    const needsDataDir = !checkDataDirectory();

    if (needsDeps || needsDataDir) {
        console.log('\n🚀 Configuração automática...');

        if (needsDeps && !installDependencies()) {
            console.log('💡 Execute manualmente: npm install');
            process.exit(1);
        }

        if (needsDataDir) createDataDirectory();
        console.log('\n🎉 Configuração concluída!');
    }
}

autoSetup();

const args = process.argv.slice(2);

if (args.length > 0) {
    const command = args[0].toLowerCase().replace(/^-+/g, '');
    commandSystem.executeDirectCommand(command);
} else {
    const { main } = require('../src/index.js');
    main();
}