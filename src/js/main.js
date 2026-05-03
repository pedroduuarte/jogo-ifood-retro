document.addEventListener('DOMContentLoaded', () => {
    // configurações do grid (30x30, canvas 600x600 -> 20px cada célula)
    const COLS = 30;
    const ROWS = 30;
    const CANVAS_SIZE = 600;
    const CELL_SIZE = CANVAS_SIZE / COLS;

    // instâncias principais
    let gameMap = new GameMap(COLS, ROWS, CELL_SIZE);
    let renderer = new GameRenderer('gameCanvas', gameMap);

    // estado da animação
    let animationId = null;
    let isAnimating = false;
    let currentResult = null;
    let visitedCount = 0;
    let pathCount = 0;

    // elementos da UI
    const algoSelect = document.getElementById('algorithmSelect');

    const startBtn = document.getElementById('startBtn');
    const resetBtn = document.getElementById('resetBtn');
    const newMapBtn = document.getElementById('newMapBtn');
    
    // elementos de Estatística
    const statAlgo = document.getElementById('statAlgo');
    const statCost = document.getElementById('statCost');
    const statNodes = document.getElementById('statNodes');
    const statStatus = document.getElementById('statStatus');

    // inicialização
    renderer.render();

    // controles
    startBtn.addEventListener('click', () => {
        if (isAnimating) return;
        
        resetMapState();
        
        const algo = algoSelect.value;
        statAlgo.textContent = algo === 'astar' ? 'Busca A*' : 'Busca Gulosa';
        statStatus.textContent = 'Buscando...';
        statStatus.className = 'stat-value waiting';

        if (algo === 'astar') {
            currentResult = runAStar(gameMap);
        } else {
            currentResult = runGreedy(gameMap);
        }

        if (currentResult && currentResult.visited.length > 0) {
            startAnimation();
        } else {
            statStatus.textContent = 'Falhou!';
            statStatus.className = 'stat-value fail';
        }
    });

    resetBtn.addEventListener('click', () => {
        resetMapState();
        renderer.render();
        statAlgo.textContent = '-';
        statStatus.textContent = 'Aguardando...';
        statStatus.className = 'stat-value waiting';
    });

    newMapBtn.addEventListener('click', () => {
        gameMap.generateMap();
        resetMapState();
        renderer.render();
        statAlgo.textContent = '-';
        statStatus.textContent = 'Aguardando...';
        statStatus.className = 'stat-value waiting';
    });

    function resetMapState() {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        isAnimating = false;
        currentResult = null;
        visitedCount = 0;
        pathCount = 0;
        
        statCost.textContent = '0';
        statNodes.textContent = '0';
    }

    function startAnimation() {
        isAnimating = true;
        animate();
    }

    let lastTime = 0;
    function animate(currentTime = 0) {
        if (!isAnimating) return;

        // velocidade fixa da animação (rápida para boa visualização)
        const delay = 1000 / 60;

        if (currentTime - lastTime < delay) {
            animationId = requestAnimationFrame(animate);
            return;
        }
        lastTime = currentTime;

        // animar a exploração (nós visitados)
        if (visitedCount < currentResult.visited.length) {
            visitedCount++;
            statNodes.textContent = visitedCount;
            
            renderer.render(currentResult.visited.slice(0, visitedCount), []);
            
            animationId = requestAnimationFrame(animate);
        } 
        // fase 2: animar a construção do caminho final
        else if (pathCount < currentResult.path.length) {
            pathCount++;
            renderer.render(currentResult.visited, currentResult.path.slice(0, pathCount));
            
            animationId = requestAnimationFrame(animate);
        } 
        // fim da animação
        else {
            isAnimating = false;
            
            if (currentResult.success) {
                statCost.textContent = currentResult.cost.toFixed(1);
                statStatus.textContent = 'Concluído';
                statStatus.className = 'stat-value success';
            } else {
                statStatus.textContent = 'Sem Caminho';
                statStatus.className = 'stat-value fail';
            }
        }
    }
});
