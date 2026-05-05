// Fila de prioridade simples
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
// heurísticas
function heuristicEuclidean(a, b) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

function heuristicManhattan(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

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


function runAStar(gameMap, heuristic = heuristicEuclidean) {
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

                // A*: f(n) = g(n) + h(n)
                const priority = newCost + heuristic(next, end);

                frontier.enqueue(next, priority);
                cameFrom[nextStr] = current;
            }
        }
    }

    return { path: [], visited: visitedNodes, cost: 0, success: false };
}


function runGreedy(gameMap, heuristic = heuristicEuclidean) {
    const start = gameMap.start;
    const end = gameMap.end;

    const frontier = new PriorityQueue();
    frontier.enqueue(start, 0);

    const cameFrom = {};
    const visited = {}; // registro simples: apenas "já visitei ou não"

    const startStr = `${start.x},${start.y}`;
    cameFrom[startStr] = null;
    visited[startStr] = true;

    const visitedNodes = [];
    let totalCost = 0; // calculado só ao final, para exibição

    while (!frontier.isEmpty()) {
        const current = frontier.dequeue();
        visitedNodes.push(current);

        if (current.x === end.x && current.y === end.y) {
            const path = reconstructPath(cameFrom, current);
            // calcula o custo real do caminho encontrado (ignorado durante a busca)
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

                // Gulosa: f(n) = h(n) apenas — sem considerar g(n)
                const priority = heuristic(next, end);

                frontier.enqueue(next, priority);
                cameFrom[nextStr] = current;
            }
        }
    }

    return { path: [], visited: visitedNodes, cost: 0, success: false };
}
