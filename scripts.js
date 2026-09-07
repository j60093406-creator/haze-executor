// Haze Executor - Main JavaScript

class HazeExecutor {
    constructor() {
        this.scripts = this.loadScripts();
        this.currentScript = null;
        this.isExecuting = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderScriptsList();
        this.updateEditorStats();
    }

    setupEventListeners() {
        // Editor events
        const scriptEditor = document.getElementById('scriptEditor');
        scriptEditor.addEventListener('input', () => this.updateEditorStats());
        
        // Button events
        document.querySelector('.btn-new').addEventListener('click', () => this.newScript());
        document.querySelector('.btn-save').addEventListener('click', () => this.saveScript());
        document.querySelector('.btn-clear').addEventListener('click', () => this.clearEditor());
        document.getElementById('executeBtn').addEventListener('click', () => this.executeScript());
        document.getElementById('stopBtn').addEventListener('click', () => this.stopExecution());

        // Search event
        document.getElementById('searchInput').addEventListener('input', (e) => this.searchScripts(e.target.value));

        // Auto-save
        document.getElementById('autoSave').addEventListener('change', (e) => {
            if (e.target.checked) {
                scriptEditor.addEventListener('input', () => {
                    if (this.currentScript) {
                        this.saveScript();
                    }
                });
            }
        });
    }

    loadScripts() {
        const stored = localStorage.getItem('hazeScripts');
        const defaults = [
            {
                id: 1,
                name: 'Hello World',
                description: 'Script simples de teste',
                code: 'console.log("🟢 Haze Executor iniciado!");'
            },
            {
                id: 2,
                name: 'Sistema Info',
                description: 'Informações do sistema',
                code: `console.log("=== SISTEMA INFO ===");
console.log("Versão: 1.0.0");
console.log("Status: Online");
console.log("Tempo: " + new Date().toLocaleTimeString());`
            },
            {
                id: 3,
                name: 'Teste Loop',
                description: 'Loop de teste',
                code: `for (let i = 1; i <= 5; i++) {
    console.log("✓ Iteração " + i);
}`
            }
        ];

        return stored ? JSON.parse(stored) : defaults;
    }

    saveScripts() {
        localStorage.setItem('hazeScripts', JSON.stringify(this.scripts));
    }

    renderScriptsList() {
        const list = document.getElementById('scriptsList');
        const count = document.querySelector('.script-count');
        
        if (this.scripts.length === 0) {
            list.innerHTML = '<div class="no-scripts">Nenhum script disponível</div>';
            count.textContent = '0';
            return;
        }

        count.textContent = this.scripts.length;
        list.innerHTML = this.scripts.map(script => `
            <div class="script-item" onclick="executor.loadScript(${script.id})">
                <div class="script-item-name">📄 ${script.name}</div>
                <div class="script-item-desc">${script.description}</div>
            </div>
        `).join('');
    }

    loadScript(id) {
        const script = this.scripts.find(s => s.id === id);
        if (script) {
            this.currentScript = script;
            document.getElementById('scriptEditor').value = script.code;
            this.updateEditorStats();
            this.addConsoleMessage(`Script carregado: ${script.name}`, 'success');
        }
    }

    newScript() {
        const name = prompt('Nome do novo script:');
        if (!name) return;

        const id = Math.max(...this.scripts.map(s => s.id), 0) + 1;
        const newScript = {
            id,
            name,
            description: 'Novo script',
            code: ''
        };

        this.scripts.push(newScript);
        this.saveScripts();
        this.renderScriptsList();
        this.loadScript(id);
        this.addConsoleMessage(`✓ Script criado: ${name}`, 'success');
    }

    saveScript() {
        const code = document.getElementById('scriptEditor').value;
        
        if (!this.currentScript) {
            const name = prompt('Nome do script:');
            if (!name) return;

            const id = Math.max(...this.scripts.map(s => s.id), 0) + 1;
            this.currentScript = {
                id,
                name,
                description: 'Script salvo',
                code
            };
            this.scripts.push(this.currentScript);
        } else {
            this.currentScript.code = code;
        }

        this.saveScripts();
        this.renderScriptsList();
        this.addConsoleMessage(`💾 Script salvo: ${this.currentScript.name}`, 'success');
    }

    clearEditor() {
        if (confirm('Deseja limpar o editor?')) {
            document.getElementById('scriptEditor').value = '';
            this.currentScript = null;
            this.updateEditorStats();
            this.addConsoleMessage('✓ Editor limpo', 'info');
        }
    }

    searchScripts(query) {
        const list = document.getElementById('scriptsList');
        const filtered = this.scripts.filter(s =>
            s.name.toLowerCase().includes(query.toLowerCase()) ||
            s.description.toLowerCase().includes(query.toLowerCase())
        );

        if (filtered.length === 0) {
            list.innerHTML = '<div class="no-scripts">Nenhum script encontrado</div>';
            return;
        }

        list.innerHTML = filtered.map(script => `
            <div class="script-item" onclick="executor.loadScript(${script.id})">
                <div class="script-item-name">📄 ${script.name}</div>
                <div class="script-item-desc">${script.description}</div>
            </div>
        `).join('');
    }

    executeScript() {
        const code = document.getElementById('scriptEditor').value;
        
        if (!code.trim()) {
            this.addConsoleMessage('⚠ Nenhum código para executar', 'warning');
            return;
        }

        this.isExecuting = true;
        document.getElementById('executeBtn').disabled = true;
        this.addConsoleMessage('▶ Executando script...', 'info');

        try {
            // Criar um console mock para capturar logs
            const logs = [];
            const originalLog = console.log;
            const originalError = console.error;
            const originalWarn = console.warn;

            console.log = (...args) => {
                const message = args.map(arg => 
                    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                ).join(' ');
                logs.push({ message, type: 'log' });
                this.addConsoleMessage(message, 'success');
            };

            console.error = (...args) => {
                const message = args.map(arg => String(arg)).join(' ');
                logs.push({ message, type: 'error' });
                this.addConsoleMessage('ERROR: ' + message, 'error');
            };

            console.warn = (...args) => {
                const message = args.map(arg => String(arg)).join(' ');
                logs.push({ message, type: 'warn' });
                this.addConsoleMessage('WARNING: ' + message, 'warning');
            };

            // Executar script com timeout
            const timeout = setTimeout(() => {
                throw new Error('Script timeout - execução excedeu 30 segundos');
            }, 30000);

            // Executar código
            eval(code);
            clearTimeout(timeout);

            console.log = originalLog;
            console.error = originalError;
            console.warn = originalWarn;

            this.addConsoleMessage('✓ Script executado com sucesso!', 'success');

        } catch (error) {
            console.log = originalLog;
            this.addConsoleMessage('✗ ERRO: ' + error.message, 'error');
            
            if (document.getElementById('debugMode').checked) {
                this.addConsoleMessage('Stack: ' + error.stack, 'error');
            }
        } finally {
            this.isExecuting = false;
            document.getElementById('executeBtn').disabled = false;
        }
    }

    stopExecution() {
        this.isExecuting = false;
        this.addConsoleMessage('⏹ Execução parada', 'warning');
    }

    updateEditorStats() {
        const code = document.getElementById('scriptEditor').value;
        const lines = code.split('\n').length;
        const chars = code.length;
        const size = (chars / 1024).toFixed(2);

        document.getElementById('lineCount').textContent = lines;
        document.getElementById('charCount').textContent = chars;
        document.getElementById('sizeCount').textContent = size + ' KB';
    }

    addConsoleMessage(message, type = 'info') {
        const console = document.getElementById('console');
        const messageEl = document.createElement('div');
        messageEl.className = `console-message ${type}`;
        messageEl.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        console.appendChild(messageEl);
        console.scrollTop = console.scrollHeight;
    }
}

// Inicializar executor
let executor;
document.addEventListener('DOMContentLoaded', () => {
    executor = new HazeExecutor();
    executor.addConsoleMessage('🟢 Haze Executor v1.0.0 iniciado', 'success');
    executor.addConsoleMessage('Pronto para executar scripts', 'info');
});

// Impedir fechar sem avisar se houver mudanças
window.addEventListener('beforeunload', (e) => {
    const code = document.getElementById('scriptEditor').value;
    if (code.trim()) {
        e.preventDefault();
        e.returnValue = '';
    }
});
