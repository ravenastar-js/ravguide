#!/usr/bin/env node

/**
 * 🚀 RAVGUIDE - CLI Principal
 * 📍 Ponto de entrada da aplicação
 * 🔧 Gerencia configuração automática e execução de comandos
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * 🔍 Verifica se Node.js está instalado no sistema
 * @returns {boolean} 📊 true se Node.js está disponível, false caso contrário
 * @throws {Error} 🚨 Se não conseguir executar o comando de verificação
 */
function checkNodeJS() {
    try {
        execSync('node --version', { stdio: 'pipe' });
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * 📦 Verifica se todas as dependências do projeto estão instaladas
 * @returns {boolean} 📊 true se todas as dependências estão presentes
 * @throws {Error} 🚨 Se houver erro ao ler package.json ou node_modules
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
    } catch (error) {
        return false;
    }
}

/**
 * 📁 Verifica se o diretório data existe
 * @returns {boolean} 📊 true se diretório data existe
 */
function checkDataDirectory() {
    return fs.existsSync(path.join(__dirname, '..', 'data'));
}

/**
 * ⚡ Instala dependências automaticamente usando npm install
 * @returns {boolean} 📊 true se instalação foi bem-sucedida
 * @throws {Error} 🚨 Se o comando npm install falhar
 */
function installDependencies() {
    console.log('📦 Instalando dependências automaticamente...');
    try {
        execSync('npm install', {
            stdio: 'inherit',
            cwd: path.join(__dirname, '..')
        });
        console.log('✅ Dependências instaladas com sucesso!');
        return true;
    } catch (error) {
        console.log('❌ Falha ao instalar dependências automaticamente');
        return false;
    }
}

/**
 * 🗂️ Cria diretório data se não existir
 * @returns {void} 📤 Não retorna valor
 */
function createDataDirectory() {
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
        console.log('📁 Criando diretório data...');
        fs.mkdirSync(dataDir, { recursive: true });
    }
}

/**
 * 🌐 Configura instalação global do CLI usando npm link
 * @returns {boolean} 📊 true se configuração foi bem-sucedida
 */
function setupGlobalInstall() {
    try {
        console.log('🔗 Configurando instalação global...');
        execSync('npm link', {
            stdio: 'inherit',
            cwd: path.join(__dirname, '..')
        });
        console.log('✅ Instalação global configurada!');
        return true;
    } catch (error) {
        console.log('⚠️  Instalação global não foi possível, mas o CLI funciona localmente');
        return false;
    }
}

/**
 * 🔄 Configuração automática do ambiente - Verifica e instala dependências necessárias
 * @returns {void} 📤 Não retorna valor
 * @throws {Error} 🚨 Se houver falha crítica na configuração
 */
function autoSetup() {
    console.log('🔍 Verificando ambiente...');

    // 🛑 Verifica Node.js (requisito fundamental)
    if (!checkNodeJS()) {
        console.log('\n❌ Node.js não encontrado!');
        console.log('📥 Baixe e instale Node.js em: https://nodejs.org');
        console.log('💡 Depois execute novamente: ravguide');
        process.exit(1);
    }

    const needsDeps = !checkDependencies();
    const needsDataDir = !checkDataDirectory();

    // ⚡ Executa configuração se necessário
    if (needsDeps || needsDataDir) {
        console.log('\n🚀 Configuração automática detectada...');

        if (needsDeps && !installDependencies()) {
            console.log('💡 Execute manualmente: npm install');
            process.exit(1);
        }

        if (needsDataDir) createDataDirectory();
        setupGlobalInstall();

        console.log('\n🎉 Configuração automática concluída!');
        console.log('📚 Agora adicione seus arquivos JSON na pasta data/');
    }
}

/**
 * 📊 Verifica arquivos de dados disponíveis na pasta data
 * @returns {Object} 📋 Objeto com status dos arquivos de dados
 * @property {boolean} hasFiles - Se existem arquivos disponíveis
 * @property {number} count - Quantidade de categorias disponíveis
 * @property {string[]} categories - Lista de categorias encontradas
 */
function checkDataFiles() {
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
        return { hasFiles: false, count: 0, categories: [] };
    }

    try {
        const files = fs.readdirSync(dataDir);
        const jsonFiles = files.filter(file =>
            file.endsWith('.json') &&
            fs.statSync(path.join(dataDir, file)).isFile()
        );

        const categories = [];

        for (const file of jsonFiles) {
            try {
                const filePath = path.join(dataDir, file);
                const fileContent = fs.readFileSync(filePath, 'utf8');
                const jsonData = JSON.parse(fileContent);

                // 📋 Pega a primeira chave do JSON como nome da categoria
                const firstKey = Object.keys(jsonData)[0];
                if (firstKey) {
                    categories.push(firstKey);
                }
            } catch (fileError) {
                console.error(`❌ Erro ao ler arquivo ${file}:`, fileError.message);
            }
        }

        // 🎯 Adiciona categorias remotas fixas
        const remoteCategories = ['contatos plataformas', 'Ferramentas OSINT'];
        const allCategories = [...categories, ...remoteCategories];

        return {
            hasFiles: allCategories.length > 0,
            count: allCategories.length,
            categories: allCategories
        };
    } catch (error) {
        return { hasFiles: false, count: 0, categories: [] };
    }
}

/**
 * 📋 Mostra status dos arquivos de dados no console
 * @returns {void} 📤 Não retorna valor
 */
function showDataStatus() {
    const dataStatus = checkDataFiles();

    if (!dataStatus.hasFiles) {
        console.log('\n⚠️  Aviso: Nenhum arquivo de dados encontrado em data/');
        console.log('📁 Adicione arquivos JSON para ver o menu completo');
    } else {
        console.log(`\n📁 ${dataStatus.count} categoria(s) de dados disponível(is)`);
        console.log('\n📚 Categorias disponíveis:');
        dataStatus.categories.forEach(category => {
            console.log(`   📖 ${category}`);
        });
        console.log('');
    }
}

// 🚀 EXECUÇÃO PRINCIPAL DO SCRIPT
autoSetup();
const dataStatus = checkDataFiles();

// 📥 Carrega módulos principais da aplicação
const { main } = require('../src/index.js');
const args = process.argv.slice(2);

// 🎯 Processa argumentos de linha de comando
if (args.length > 0) {
    const command = args[0].toLowerCase();
    const commands = require('../src/commands.js');

    /**
     * 🔧 Comandos especiais disponíveis via CLI
     * @type {Object.<string, Function>}
     */
    const specialCommands = {
        'setup': () => {
            console.log('✅ O sistema já está configurado automaticamente!');
            showDataStatus();
        },
        'check': () => {
            console.log('\n📊 Status do Sistema:');
            console.log(`   ✅ Node.js: Instalado`);
            console.log(`   ✅ Dependências: ${checkDependencies() ? 'Instaladas' : 'Pendentes'}`);
            console.log(`   ✅ Diretório data: ${checkDataDirectory() ? 'Existe' : 'Não existe'}`);

            const dataStatus = checkDataFiles();
            console.log(`   📁 Categorias de dados: ${dataStatus.count}`);

            if (dataStatus.count > 0) {
                console.log('\n📚 Categorias disponíveis:');
                dataStatus.categories.forEach(category => {
                    const icon = category.includes('Ferramentas') && category.includes('OSINT') ? '🔍' :
                        category.includes('Ferramentas') ? '🛠️' :
                            category.includes('Instagram') || category.includes('hackeado') ? '🔐' :
                                category.includes('Profissionais') || category.includes('Recomendados') ? '👥' :
                                    category.includes('contatos') || category.includes('plataformas') ? '🏢' : '📖';

                    console.log(`   ${icon} ${category}`);
                });
            }
        },
        'doctor': () => {
            console.log('\n🏥 Diagnóstico do Sistema:');
            const checks = [
                { name: 'Node.js', check: checkNodeJS },
                { name: 'Dependências', check: checkDependencies },
                { name: 'Diretório data', check: checkDataDirectory },
                { name: 'Arquivos de dados', check: () => dataStatus.hasFiles }
            ];

            checks.forEach(({ name, check }) => {
                console.log(`   ${check() ? '✅' : '❌'} ${name}`);
            });

            if (!dataStatus.hasFiles) {
                console.log('\n💡 Recomendações:');
                console.log('   📁 Adicione arquivos JSON na pasta data/');
            }
        }
    };

    // 🎯 Executa comando especial ou direto
    if (specialCommands[command.replace(/^-+/g, '')]) {
        specialCommands[command.replace(/^-+/g, '')]();
    } else {
        commands.executeDirectCommand(command);
    }
} else {
    // 📱 Modo interativo - Executa interface principal
    if (!dataStatus.hasFiles) {
        console.log('💡 Use: ravguide <categoria> para comandos diretos');
        console.log('   Exemplo: ravguide FAQ\n');
    }
    main();
}