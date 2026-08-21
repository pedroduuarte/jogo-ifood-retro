# 🗺️ Pathfinding Visualizer — A\* e Busca Gulosa

Visualizador interativo de algoritmos de busca em grafos aplicados a mapas de jogo. O projeto implementa e compara o **algoritmo A\*** e a **Busca Gulosa (Greedy Best-First Search)**, exibindo em tempo real os nós visitados, o caminho encontrado e o custo total.

---

## 📌 Funcionalidades

- Geração de mapas com obstáculos, ponto de início e ponto de destino
- Execução do algoritmo A\* com cálculo do caminho de menor custo real
- Execução da Busca Gulosa com prioridade baseada apenas na heurística
- Animação dos nós visitados durante a busca
- Comparação de desempenho entre os dois algoritmos (nós visitados, custo final)

---

## 🧠 Algoritmos

### A\* (A-Star)

Encontra o **caminho de menor custo** entre dois pontos combinando o custo real percorrido com uma estimativa da distância restante.

```
f(n) = g(n) + h(n)
```

| Símbolo | Significado |
|---|---|
| `g(n)` | Custo real acumulado do início até o nó `n` |
| `h(n)` | Heurística — distância euclidiana até o destino |
| `f(n)` | Prioridade do nó na fila |

- ✅ Garante o caminho ótimo (menor custo)
- ✅ Completo — sempre encontra o caminho se ele existir
- ⚠️ Pode visitar mais nós que a Busca Gulosa

### Busca Gulosa (Greedy Best-First Search)

Prioriza sempre o nó que **parece mais próximo do destino** em linha reta, ignorando o custo real do caminho percorrido.

```
f(n) = h(n)
```

- ⚡ Geralmente mais rápida que o A\*
- ❌ Não garante o caminho ótimo
- ❌ Pode se perder em mapas com obstáculos complexos

### Heurística utilizada

Ambos os algoritmos usam a **distância euclidiana** como heurística:

```
h(a, b) = √( (a.x - b.x)² + (a.y - b.y)² )
```

---

## 📁 Estrutura do Projeto

```
.
├── algorithms/
│   ├── aStar.js          # Implementação do A*
│   ├── greedy.js         # Implementação da Busca Gulosa
│   └── heuristics.js     # Funções heurísticas (euclidiana, etc.)
├── structures/
│   └── priorityQueue.js  # Fila de prioridade usada pelos algoritmos
├── map/
│   └── gameMap.js        # Representação do mapa, vizinhos e custos
├── index.js              # Ponto de entrada principal
└── README.md
```

> A estrutura acima é uma sugestão baseada no código. Adapte conforme a organização real do seu projeto.

---

## 🚀 Como executar

### Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior

### Instalação

```bash
git clone https://github.com/seu-usuario/seu-repositorio.git
cd seu-repositorio
npm install
```

### Execução

```bash
node index.js
```

---

## 🔍 Exemplo de uso (API interna)

```js
import { runAStar } from './algorithms/aStar.js';
import { runGreedy } from './algorithms/greedy.js';

const result = runAStar(gameMap);
console.log('Caminho:', result.path);
console.log('Custo total:', result.cost);
console.log('Nós visitados:', result.visited.length);

const resultGreedy = runGreedy(gameMap);
console.log('Caminho (gulosa):', resultGreedy.path);
```

O objeto de retorno de ambas as funções segue o formato:

```js
{
  path: [],      // array de nós no caminho encontrado
  visited: [],   // array de nós visitados durante a busca (para animação)
  cost: 0,       // custo real total do caminho
  success: true  // false se não houver caminho possível
}
```

---

## ⚖️ Comparação entre os algoritmos

| Critério | A\* | Busca Gulosa |
|---|---|---|
| Função de prioridade | `g(n) + h(n)` | `h(n)` |
| Garante caminho ótimo | ✅ Sim | ❌ Não |
| Velocidade | Moderada | Alta |
| Uso de memória | Maior | Menor |
| Ideal para | Mapas complexos | Mapas simples ou aproximações rápidas |

---

## 📄 Licença

Este projeto está sob a licença MIT. Consulte o arquivo [LICENSE](./LICENSE) para mais detalhes.
