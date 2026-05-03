class GameRenderer {
    constructor(canvasId, gameMap) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.gameMap = gameMap;
        this.cellSize = this.canvas.width / gameMap.cols; // assegurar que seja quadrado
    }

    drawMap() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let y = 0; y < this.gameMap.rows; y++) {
            for (let x = 0; x < this.gameMap.cols; x++) {
                this.drawCell(x, y, this.gameMap.grid[y][x]);
            }
        }
    }

    drawCell(x, y, typeValue) {
        let color = '#000';

        switch (typeValue) {
            case CELL_TYPES.BUILDING.value: color = '#2c3e50'; break;
            case CELL_TYPES.ROAD.value: color = '#bdc3c7'; break;
            case CELL_TYPES.AVENUE.value: color = '#3498db'; break;
            case CELL_TYPES.SLOW_ZONE.value: color = '#e67e22'; break;
            case CELL_TYPES.ONE_WAY_RIGHT.value: color = '#e74c3c'; break;
            case CELL_TYPES.ONE_WAY_DOWN.value: color = '#e74c3c'; break;
        }

        const px = x * this.cellSize;
        const py = y * this.cellSize;
        const s = this.cellSize;

        // preencher a cor base da célula
        this.ctx.fillStyle = color;
        this.ctx.fillRect(px, py, s, s);

        this.ctx.fillStyle = 'rgba(255,255,255,0.15)';
        this.ctx.fillRect(px, py, s, 2);
        this.ctx.fillRect(px, py, 2, s);

        this.ctx.fillStyle = 'rgba(0,0,0,0.25)';
        this.ctx.fillRect(px, py + s - 2, s, 2);
        this.ctx.fillRect(px + s - 2, py, 2, s);

        // desenhar setas para mão única
        if (typeValue === CELL_TYPES.ONE_WAY_RIGHT.value) {
            this.drawArrow(x, y, 'right');
        } else if (typeValue === CELL_TYPES.ONE_WAY_DOWN.value) {
            this.drawArrow(x, y, 'down');
        }
    }

    drawArrow(x, y, dir) {
        this.ctx.fillStyle = 'white';
        this.ctx.font = `${this.cellSize / 2}px monospace`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        const cx = x * this.cellSize + this.cellSize / 2;
        const cy = y * this.cellSize + this.cellSize / 2;
        if (dir === 'right') this.ctx.fillText('→', cx, cy);
        if (dir === 'down') this.ctx.fillText('↓', cx, cy);
    }

    drawVisited(nodes) {
        this.ctx.fillStyle = 'rgba(155, 89, 182, 0.4)';
        for (let node of nodes) {
            // não desenha sobre o início ou fim
            if ((node.x === this.gameMap.start.x && node.y === this.gameMap.start.y) ||
                (node.x === this.gameMap.end.x && node.y === this.gameMap.end.y)) {
                continue;
            }
            this.ctx.fillRect(node.x * this.cellSize, node.y * this.cellSize, this.cellSize, this.cellSize);
        }
    }

    drawPath(path) {
        if (!path || path.length === 0) return;

        this.ctx.strokeStyle = '#f1c40f';
        this.ctx.lineWidth = this.cellSize / 3;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        this.ctx.beginPath();
        this.ctx.moveTo(
            path[0].x * this.cellSize + this.cellSize / 2,
            path[0].y * this.cellSize + this.cellSize / 2
        );

        for (let i = 1; i < path.length; i++) {
            this.ctx.lineTo(
                path[i].x * this.cellSize + this.cellSize / 2,
                path[i].y * this.cellSize + this.cellSize / 2
            );
        }
        this.ctx.stroke();
    }

    drawEntities() {
        const start = this.gameMap.start;
        const end = this.gameMap.end;

        // desenhar entregador
        this.ctx.fillStyle = '#2ecc71';
        this.ctx.fillRect(start.x * this.cellSize + 2, start.y * this.cellSize + 2, this.cellSize - 4, this.cellSize - 4);

        // desenhar cliente
        this.ctx.fillStyle = '#e94560';
        this.ctx.beginPath();
        this.ctx.arc(
            end.x * this.cellSize + this.cellSize / 2,
            end.y * this.cellSize + this.cellSize / 2,
            this.cellSize / 2 - 2,
            0, Math.PI * 2
        );
        this.ctx.fill();
    }

    // desenha tudo na ordem correta
    render(visited = [], path = []) {
        this.drawMap();
        this.drawVisited(visited);
        this.drawPath(path);
        this.drawEntities();
    }
}
