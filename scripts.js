// Haze Executor - Roblox Script Executor

class HazeExecutor {
    constructor() {
        this.scripts = this.loadScripts();
        this.currentScript = null;
        this.isExecuting = false;
        this.gameConnected = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderScriptsList();
        this.updateEditorStats();
        this.initializeRobloxConnection();
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

    initializeRobloxConnection() {
        // Simular conexão com Roblox
        setTimeout(() => {
            this.addConsoleMessage('⚠️ Aguardando injeção no Roblox...', 'warning');
        }, 1000);
    }

    loadScripts() {
        const stored = localStorage.getItem('hazeRobloxScripts');
        const defaults = [
            {
                id: 1,
                name: 'Hello World',
                description: 'Script simples de teste',
                code: 'print("🟢 Haze Executor conectado ao Roblox!")'
            },
            {
                id: 2,
                name: 'Player Teleport',
                description: 'Teleportar para um local',
                code: `local player = game.Players.LocalPlayer
local character = player.Character or player.CharacterAdded:Wait()
local humanootpart = character:WaitForChild("HumanoidRootPart")
humanootpart.CFrame = CFrame.new(Vector3.new(0, 100, 0))`
            },
            {
                id: 3,
                name: 'Infinite Jump',
                description: 'Pulo infinito',
                code: `local player = game.Players.LocalPlayer
local UserInputService = game:GetService("UserInputService")
local jumping = false

UserInputService.InputBegan:Connect(function(input, gameProcessed)
    if gameProcessed then return end
    if input.KeyCode == Enum.KeyCode.Space then
        jumping = true
    end
end)

UserInputService.InputEnded:Connect(function(input, gameProcessed)
    if input.KeyCode == Enum.KeyCode.Space then
        jumping = false
    end
end)

local character = player.Character
local humanoid = character:WaitForChild("Humanoid")
local rootpart = character:WaitForChild("HumanoidRootPart")

game:GetService("RunService").RenderStepped:Connect(function()
    if jumping then
        humanoid:ChangeState(Enum.HumanoidStateType.Jumping)
    end
end)`
            },
            {
                id: 4,
                name: 'Speed Boost',
                description: 'Aumentar velocidade de movimento',
                code: `local player = game.Players.LocalPlayer
local character = player.Character or player.CharacterAdded:Wait()
local humanoid = character:WaitForChild("Humanoid")
humanoid.WalkSpeed = 50`
            },
            {
                id: 5,
                name: 'God Mode',
                description: 'Modo deus - invulnerável',
                code: `local player = game.Players.LocalPlayer
local character = player.Character or player.CharacterAdded:Wait()
local humanoid = character:WaitForChild("Humanoid")

while true do
    humanoid.Health = humanoid.MaxHealth
    wait(0.1)
end`
            }
        ];

        return stored ? JSON.parse(stored) : defaults;
    }

    saveScripts() {
        localStorage.setItem('hazeRobloxScripts', JSON.stringify(this.scripts));
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
            this.addConsoleMessage(`✓ Script carregado: ${script.name}`, 'success');
        }
    }

    newScript() {
        const name = prompt('Nome do novo script:');
        if (!name) return;

        const id = Math.max(...this.scripts.map(s => s.id), 0) + 1;
        const newScript = {
            id,
            name,
            description: 'Novo script Roblox',
            code: '-- Escreva seu script aqui\nprint("Script iniciado")'
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
                description: 'Script Roblox salvo',
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
            this.addConsoleMessage('⚠️ Nenhum código para executar', 'warning');
            return;
        }

        if (!this.gameConnected) {
            this.addConsoleMessage('❌ Roblox não está conectado. Injete o executor primeiro!', 'error');
            return;
        }

        this.isExecuting = true;
        document.getElementById('executeBtn').disabled = true;
        this.addConsoleMessage('▶️ Executando script Roblox...', 'info');

        try {
            // Simular execução do script
            const logs = [];
            const originalLog = console.log;

            console.log = (...args) => {
                const message = args.map(arg => 
                    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                ).join(' ');
                logs.push({ message, type: 'log' });
                this.addConsoleMessage(message, 'success');
            };

            // Timeout de segurança
            const timeout = setTimeout(() => {
                throw new Error('Script timeout - execução excedeu 60 segundos');
            }, 60000);

            // Simular execução Lua
            this.simulateLuaExecution(code);
            clearTimeout(timeout);

            console.log = originalLog;
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

    simulateLuaExecution(code) {
        // Simular algumas funções Lua básicas
        const lines = code.split('\n');
        const printPattern = /print\((.*?)\)/g;
        
        lines.forEach(line => {
            const match = line.match(printPattern);
            if (match) {
                match.forEach(m => {
                    const content = m.replace('print(', '').replace(')', '').replace(/"/g, '').replace(/'/g, '');
                    this.addConsoleMessage('[Lua Output] ' + content, 'success');
                });
            }
        });
    }

    stopExecution() {
        this.isExecuting = false;
        this.addConsoleMessage('⏹️ Execução parada', 'warning');
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
        const consoleElement = document.getElementById('console');
        const messageEl = document.createElement('div');
        messageEl.className = `console-message ${type}`;
        messageEl.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        consoleElement.appendChild(messageEl);
        consoleElement.scrollTop = consoleElement.scrollHeight;
    }

    setGameStatus(connected) {
        this.gameConnected = connected;
        const statusEl = document.getElementById('gameStatus');
        
        if (connected) {
            statusEl.textContent = 'CONECTADO ✓';
            statusEl.classList.remove('status-disconnected');
            statusEl.classList.add('status-connected');
            this.addConsoleMessage('✓ Roblox conectado com sucesso!', 'success');
        } else {
            statusEl.textContent = 'DESCONECTADO ✗';
            statusEl.classList.remove('status-connected');
            statusEl.classList.add('status-disconnected');
            this.addConsoleMessage('✗ Desconectado do Roblox', 'error');
        }
    }
}

// Inicializar executor
let executor;
document.addEventListener('DOMContentLoaded', () => {
    executor = new HazeExecutor();
    executor.addConsoleMessage('🟢 HAZE EXECUTOR v1.0.0 - Roblox Script Executor', 'success');
    executor.addConsoleMessage('Aguardando injeção no Roblox...', 'info');
    executor.addConsoleMessage('Biblioteca de scripts carregada', 'info');
});

// Impedir fechar sem avisar se houver mudanças
window.addEventListener('beforeunload', (e) => {
    const code = document.getElementById('scriptEditor').value;
    if (code.trim()) {
        e.preventDefault();
        e.returnValue = '';
    }
});
