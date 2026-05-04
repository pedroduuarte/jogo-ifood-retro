// fila de prioridade simples
class PriorityQueue {
    constructor() {
        this.elements = [];
    }

    enqueue(element, priority) {
        this.elements.push({ element, priority });
        this.elements.sort((a, b) => a.priority - b.priority);
    }

    dequeue() {
        return this.elements.shift().element;
    }

    isEmpty() {
        return this.elements.length === 0;
    }
}

// heurística de distância euclidiana em linha reta
function heuristicEuclidean(a, b) {
    // retorna a distância em linha reta, ignorando todos os obstáculos
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

// função para reconstruir o caminho a partir do dicionário "cameFrom"
function reconstructPath(cameFrom, current) {
    const path = [];
    let currStr = `${current.x},${current.y}`;
    while (cameFrom[currStr]) {
        path.push(current);
        current = cameFrom[currStr];
        currStr = `${current.x},${current.y}`;
    }
    path.push(current);
    return path.reverse();
}

// algoritmo A*
// utiliza f(n) = g(n) + h(n), encontrando o caminho de menor custo
function runAStar(gameMap) {
    const start = gameMap.start;
    const end = gameMap.end;

    const frontier = new PriorityQueue();
    frontier.enqueue(start, 0);

    const cameFrom = {};
    const costSoFar = {};

    const startStr = `${start.x},${start.y}`;
    cameFrom[startStr] = null;
    costSoFar[startStr] = 0;

    const visitedNodes = []; // para animação

    while (!frontier.isEmpty()) {
        const current = frontier.dequeue();
        visitedNodes.push(current);

        if (current.x === end.x && current.y === end.y) {
            return {
                path: reconstructPath(cameFrom, current),
                visited: visitedNodes,
                cost: costSoFar[`${end.x},${end.y}`],
                success: true
            };
        }

        for (let next of gameMap.getNeighbors(current)) {
            const nextStr = `${next.x},${next.y}`;
            const stepCost = gameMap.getCost(current, next);
            const newCost = costSoFar[`${current.x},${current.y}`] + stepCost;

            if (!(nextStr in costSoFar) || newCost < costSoFar[nextStr]) {
                costSoFar[nextStr] = newCost;

                // A* f(n) = g(n) + h(n)
                const priority = newCost + heuristicEuclidean(next, end);

                frontier.enqueue(next, priority);
                cameFrom[nextStr] = current;
            }
        }
    }

    return { path: [], visited: visitedNodes, cost: 0, success: false };
}

// algoritmo de busca gulosa (greedy best-first search)
// utiliza apenas f(n) = h(n), ignorando o custo real percorrido
function runGreedy(gameMap) {
    const start = gameMap.start;
    const end = gameMap.end;

    const frontier = new PriorityQueue();
    frontier.enqueue(start, 0);

    const cameFrom = {};
    const visited = {}; // mantemos um registro simples de visitados para não entrar em loop infinito

    const startStr = `${start.x},${start.y}`;
    cameFrom[startStr] = null;
    visited[startStr] = true;

    const visitedNodes = []; 
    let totalCost = 0; // calcular apenas o custo final no caminho achado

    while (!frontier.isEmpty()) {
        const current = frontier.dequeue();
        visitedNodes.push(current);

        if (current.x === end.x && current.y === end.y) {
            const path = reconstructPath(cameFrom, current);
            // calcular o custo real do caminho (mesmo que o algoritmo tenha ignorado ao escolher)
            for (let i = 0; i < path.length - 1; i++) {
                totalCost += gameMap.getCost(path[i], path[i + 1]);
            }
            return {
                path: path,
                visited: visitedNodes,
                cost: totalCost,
                success: true
            };
        }

        for (let next of gameMap.getNeighbors(current)) {
            const nextStr = `${next.x},${next.y}`;

            if (!visited[nextStr]) {
                visited[nextStr] = true;

                // GULOSA f(n) = h(n) apenas (distância em linha reta pro objetivo)
                const priority = heuristicEuclidean(next, end);

                frontier.enqueue(next, priority);
                cameFrom[nextStr] = current;
            }
        }
    }

    return { path: [], visited: visitedNodes, cost: 0, success: false };
}
