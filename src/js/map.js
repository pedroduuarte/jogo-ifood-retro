const CELL_TYPES = {
    ROAD: { value: 0, cost: 1, name: 'Rua' },
    BUILDING: { value: 1, cost: Infinity, name: 'Prédio' },
    AVENUE: { value: 2, cost: 0.5, name: 'Avenida' },
    SLOW_ZONE: { value: 3, cost: 3, name: 'Calçadão' },
    ONE_WAY_RIGHT: { value: 4, cost: 1, name: 'Mão Única (Direita)', dir: { dx: 1, dy: 0 } },
    ONE_WAY_DOWN: { value: 5, cost: 1, name: 'Mão Única (Baixo)', dir: { dx: 0, dy: 1 } },
};

class GameMap {
    constructor(cols, rows, cellSize) {
        this.cols = cols;
        this.rows = rows;
        this.cellSize = cellSize;
        this.grid = [];
        this.start = null;
        this.end = null;
        this.generateMap();
    }

    generateMap() {
        // Inicializa grade vazia (apenas ruas)
        this.grid = Array(this.rows).fill(null).map(() => Array(this.cols).fill(CELL_TYPES.ROAD.value));

        // Cria as bordas de prédios para conter o mapa
        for (let i = 0; i < this.cols; i++) {
            this.grid[0][i] = CELL_TYPES.BUILDING.value;
            this.grid[this.rows - 1][i] = CELL_TYPES.BUILDING.value;
        }
        for (let j = 0; j < this.rows; j++) {
            this.grid[j][0] = CELL_TYPES.BUILDING.value;
            this.grid[j][this.cols - 1] = CELL_TYPES.BUILDING.value;
        }

        // Gerar blocos de prédios aleatórios (4 a 7 blocos)
        const numBlocks = this._randInt(4, 7);
        for (let b = 0; b < numBlocks; b++) {
            const bw = this._randInt(3, 7);
            const bh = this._randInt(3, 7);
            const bx = this._randInt(3, this.cols - bw - 3);
            const by = this._randInt(3, this.rows - bh - 3);

            for (let y = by; y < by + bh && y < this.rows - 1; y++) {
                for (let x = bx; x < bx + bw && x < this.cols - 1; x++) {
                    this.grid[y][x] = CELL_TYPES.BUILDING.value;
                }
            }
        }

        // Gerar avenidas horizontais aleatórias (2 a 3)
        const numHAvenues = this._randInt(2, 3);
        const usedRows = new Set();
        for (let a = 0; a < numHAvenues; a++) {
            let row;
            let attempts = 0;
            do {
                row = this._randInt(3, this.rows - 4);
                attempts++;
            } while (usedRows.has(row) && attempts < 20);
            usedRows.add(row);

            const startX = this._randInt(2, 6);
            const endX = this._randInt(this.cols - 6, this.cols - 2);
            for (let x = startX; x < endX; x++) {
                this.grid[row][x] = CELL_TYPES.AVENUE.value;
                // Segunda faixa da avenida (se caber)
                if (row + 1 < this.rows - 1) {
                    this.grid[row + 1][x] = CELL_TYPES.AVENUE.value;
                }
            }
        }

        // Gerar avenidas verticais aleatórias (2 a 3)
        const numVAvenues = this._randInt(2, 3);
        const usedCols = new Set();
        for (let a = 0; a < numVAvenues; a++) {
            let col;
            let attempts = 0;
            do {
                col = this._randInt(3, this.cols - 4);
                attempts++;
            } while (usedCols.has(col) && attempts < 20);
            usedCols.add(col);

            const startY = this._randInt(2, 6);
            const endY = this._randInt(this.rows - 6, this.rows - 2);
            for (let y = startY; y < endY; y++) {
                this.grid[y][col] = CELL_TYPES.AVENUE.value;
                if (col + 1 < this.cols - 1) {
                    this.grid[y][col + 1] = CELL_TYPES.AVENUE.value;
                }
            }
        }

        // Adicionar zonas lentas (calçadões) aleatórias (2 a 4 trechos)
        const numSlowZones = this._randInt(2, 4);
        for (let s = 0; s < numSlowZones; s++) {
            const isHorizontal = Math.random() > 0.5;
            if (isHorizontal) {
                const row = this._randInt(2, this.rows - 3);
                const sx = this._randInt(2, this.cols - 8);
                const len = this._randInt(3, 8);
                for (let x = sx; x < sx + len && x < this.cols - 1; x++) {
                    if (this.grid[row][x] === CELL_TYPES.ROAD.value) {
                        this.grid[row][x] = CELL_TYPES.SLOW_ZONE.value;
                    }
                }
            } else {
                const col = this._randInt(2, this.cols - 3);
                const sy = this._randInt(2, this.rows - 8);
                const len = this._randInt(3, 8);
                for (let y = sy; y < sy + len && y < this.rows - 1; y++) {
                    if (this.grid[y][col] === CELL_TYPES.ROAD.value) {
                        this.grid[y][col] = CELL_TYPES.SLOW_ZONE.value;
                    }
                }
            }
        }

        // Posicionar início e fim em lados opostos do mapa
        this.start = this._findOpenCell(2, Math.floor(this.rows / 2), 'left');
        this.end = this._findOpenCell(this.cols - 3, Math.floor(this.rows / 2), 'right');

        // Garantir que início e fim são acessíveis (limpar área ao redor)
        this._clearArea(this.start.x, this.start.y, 1);
        this._clearArea(this.end.x, this.end.y, 1);

        // Verificar conectividade – se não há caminho, regenerar
        if (!this._isReachable(this.start, this.end)) {
            this.generateMap(); // Recursão até gerar um mapa válido
        }
    }

    _randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    _findOpenCell(preferX, preferY, side) {
        // Busca uma célula aberta perto da posição preferida
        for (let r = 0; r < 10; r++) {
            const x = Math.max(1, Math.min(this.cols - 2, preferX + this._randInt(-r, r)));
            const y = Math.max(1, Math.min(this.rows - 2, preferY + this._randInt(-r, r)));
            if (!this.isObstacle(x, y)) {
                return { x, y };
            }
        }
        // Fallback: forçar posição
        const fx = side === 'left' ? 2 : this.cols - 3;
        const fy = Math.floor(this.rows / 2);
        return { x: fx, y: fy };
    }

    _clearArea(cx, cy, radius) {
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                const x = cx + dx;
                const y = cy + dy;
                if (this.isValid(x, y) && x > 0 && x < this.cols - 1 && y > 0 && y < this.rows - 1) {
                    if (this.grid[y][x] === CELL_TYPES.BUILDING.value) {
                        this.grid[y][x] = CELL_TYPES.ROAD.value;
                    }
                }
            }
        }
    }

    _isReachable(from, to) {
        // BFS simples para verificar conectividade
        const visited = new Set();
        const queue = [from];
        visited.add(`${from.x},${from.y}`);

        while (queue.length > 0) {
            const curr = queue.shift();
            if (curr.x === to.x && curr.y === to.y) return true;

            const dirs = [{ dx: 0, dy: -1 }, { dx: 1, dy: 0 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }];
            for (const d of dirs) {
                const nx = curr.x + d.dx;
                const ny = curr.y + d.dy;
                const key = `${nx},${ny}`;
                if (this.isValid(nx, ny) && !this.isObstacle(nx, ny) && !visited.has(key)) {
                    visited.add(key);
                    queue.push({ x: nx, y: ny });
                }
            }
        }
        return false;
    }

    isValid(x, y) {
        return x >= 0 && x < this.cols && y >= 0 && y < this.rows;
    }

    isObstacle(x, y) {
        return this.grid[y][x] === CELL_TYPES.BUILDING.value;
    }

    getNeighbors(node) {
        const neighbors = [];
        const { x, y } = node;
        const currentTypeVal = this.grid[y][x];

        // Regra de Mão Única:
        // Se a célula atual é de mão única, o vizinho SÓ PODE SER NA DIREÇÃO ESPECÍFICA
        if (currentTypeVal === CELL_TYPES.ONE_WAY_RIGHT.value) {
            if (this.isValid(x + 1, y) && !this.isObstacle(x + 1, y)) {
                neighbors.push({ x: x + 1, y: y });
            }
            return neighbors;
        }
        if (currentTypeVal === CELL_TYPES.ONE_WAY_DOWN.value) {
            if (this.isValid(x, y + 1) && !this.isObstacle(x, y + 1)) {
                neighbors.push({ x: x, y: y + 1 });
            }
            return neighbors;
        }

        // Movimento Ortogonal Padrão (Sem diagonais para simplificar a grade de ruas)
        const dirs = [
            { dx: 0, dy: -1 }, // Cima
            { dx: 1, dy: 0 },  // Direita
            { dx: 0, dy: 1 },  // Baixo
            { dx: -1, dy: 0 }  // Esquerda
        ];

        for (let dir of dirs) {
            const nx = x + dir.dx;
            const ny = y + dir.dy;

            if (this.isValid(nx, ny) && !this.isObstacle(nx, ny)) {
                neighbors.push({ x: nx, y: ny });
            }
        }

        return neighbors;
    }

    getCost(fromNode, toNode) {
        const typeVal = this.grid[toNode.y][toNode.x];

        for (const key in CELL_TYPES) {
            if (CELL_TYPES[key].value === typeVal) {
                return CELL_TYPES[key].cost;
            }
        }
        return 1; // Default
    }
}
