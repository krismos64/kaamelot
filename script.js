// Représentation du royaume
const kingdom = {
  nodes: [
    "Kaamelot",
    "Entrée du labyrinthe",
    "Village1",
    "Forêt",
    "Montagne",
    "Lac",
  ],
  edges: [
    { from: "Kaamelot", to: "Village1", weight: 5 },
    { from: "Kaamelot", to: "Forêt", weight: 8 },
    { from: "Village1", to: "Forêt", weight: 3 },
    { from: "Village1", to: "Montagne", weight: 7 },
    { from: "Forêt", to: "Lac", weight: 4 },
    { from: "Montagne", to: "Lac", weight: 6 },
    { from: "Lac", to: "Entrée du labyrinthe", weight: 5 },
  ],
};

// Représentation du labyrinthe
const maze = [
  [1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1],
];

const treasurePosition = { x: 5, y: 5 };
let playerPosition = { x: 1, y: 1 };

// Fonction pour dessiner le royaume
function drawKingdom() {
  const canvas = document.getElementById("kingdomCanvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Dessiner les nœuds
  kingdom.nodes.forEach((node, index) => {
    const x = 100 + (index % 3) * 200;
    const y = 100 + Math.floor(index / 3) * 200;
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, 2 * Math.PI);
    ctx.fillStyle = "lightblue";
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "black";
    ctx.fillText(node, x - 30, y + 30);
  });

  // Dessiner les arêtes
  kingdom.edges.forEach((edge) => {
    const fromIndex = kingdom.nodes.indexOf(edge.from);
    const toIndex = kingdom.nodes.indexOf(edge.to);
    const fromX = 100 + (fromIndex % 3) * 200;
    const fromY = 100 + Math.floor(fromIndex / 3) * 200;
    const toX = 100 + (toIndex % 3) * 200;
    const toY = 100 + Math.floor(toIndex / 3) * 200;

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    ctx.fillText(edge.weight.toString(), (fromX + toX) / 2, (fromY + toY) / 2);
  });
}

// Algorithme de Dijkstra pour trouver le plus court chemin
function dijkstra(start, end) {
  const distances = {};
  const previous = {};
  const nodes = new Set(kingdom.nodes);

  kingdom.nodes.forEach((node) => {
    distances[node] = Infinity;
    previous[node] = null;
  });
  distances[start] = 0;

  while (nodes.size > 0) {
    const closest = Array.from(nodes).reduce((a, b) =>
      distances[a] < distances[b] ? a : b
    );
    nodes.delete(closest);

    if (closest === end) break;

    kingdom.edges
      .filter((edge) => edge.from === closest || edge.to === closest)
      .forEach((edge) => {
        const neighbor = edge.from === closest ? edge.to : edge.from;
        const alt = distances[closest] + edge.weight;
        if (alt < distances[neighbor]) {
          distances[neighbor] = alt;
          previous[neighbor] = closest;
        }
      });
  }

  const path = [];
  let current = end;
  while (current !== null) {
    path.unshift(current);
    current = previous[current];
  }

  return path;
}

// Dessiner le chemin le plus court
function drawShortestPath() {
  const path = dijkstra("Kaamelot", "Entrée du labyrinthe");
  const canvas = document.getElementById("kingdomCanvas");
  const ctx = canvas.getContext("2d");

  for (let i = 0; i < path.length - 1; i++) {
    const fromIndex = kingdom.nodes.indexOf(path[i]);
    const toIndex = kingdom.nodes.indexOf(path[i + 1]);
    const fromX = 100 + (fromIndex % 3) * 200;
    const fromY = 100 + Math.floor(fromIndex / 3) * 200;
    const toX = 100 + (toIndex % 3) * 200;
    const toY = 100 + Math.floor(toIndex / 3) * 200;

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "black";
  }
}

// Fonction pour dessiner le labyrinthe
function drawMaze() {
  const canvas = document.getElementById("mazeCanvas");
  const ctx = canvas.getContext("2d");
  const cellSize = canvas.width / maze.length;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < maze.length; y++) {
    for (let x = 0; x < maze[y].length; x++) {
      if (maze[y][x] === 1) {
        ctx.fillStyle = "black";
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  }

  // Dessiner le trésor
  ctx.fillStyle = "gold";
  ctx.beginPath();
  ctx.arc(
    (treasurePosition.x + 0.5) * cellSize,
    (treasurePosition.y + 0.5) * cellSize,
    cellSize / 3,
    0,
    2 * Math.PI
  );
  ctx.fill();

  // Dessiner le joueur (Arthur)
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(
    (playerPosition.x + 0.5) * cellSize,
    (playerPosition.y + 0.5) * cellSize,
    cellSize / 3,
    0,
    2 * Math.PI
  );
  ctx.fill();
}

// Fonction pour déplacer Arthur dans le labyrinthe
function movePlayer(dx, dy) {
  const newX = playerPosition.x + dx;
  const newY = playerPosition.y + dy;

  if (
    newX >= 0 &&
    newX < maze[0].length &&
    newY >= 0 &&
    newY < maze.length &&
    maze[newY][newX] === 0
  ) {
    playerPosition.x = newX;
    playerPosition.y = newY;
    drawMaze();

    if (
      playerPosition.x === treasurePosition.x &&
      playerPosition.y === treasurePosition.y
    ) {
      alert("Félicitations ! Arthur a trouvé le trésor !");
    }
  }
}

// Gestion des touches du clavier pour déplacer Arthur
document.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "ArrowUp":
      movePlayer(0, -1);
      break;
    case "ArrowDown":
      movePlayer(0, 1);
      break;
    case "ArrowLeft":
      movePlayer(-1, 0);
      break;
    case "ArrowRight":
      movePlayer(1, 0);
      break;
  }
});

// Initialisation
window.onload = () => {
  drawKingdom();
  drawShortestPath();
  drawMaze();
};
