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

// Constantes pour le labyrinthe
const MAZE_SIZE = 15;
const CELL_SIZE = 30;

// Variables globales
let maze = [];
let startPosition = { x: 0, y: 0 };
let treasurePosition = { x: MAZE_SIZE - 1, y: MAZE_SIZE - 1 };

// Fonction pour dessiner le royaume
function drawKingdom() {
  const canvas = document.getElementById("kingdomCanvas");
  const ctx = canvas.getContext("2d");

  canvas.width = 600;
  canvas.height = 400;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Dessiner les nœuds
  kingdom.nodes.forEach((node, index) => {
    const x = 100 + (index % 3) * 200;
    const y = 100 + Math.floor(index / 3) * 200;
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, 2 * Math.PI);
    ctx.fillStyle = "lightblue";
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "black";
    ctx.font = "14px Merriweather";
    ctx.textAlign = "center";
    ctx.fillText(node, x, y + 45);
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
    ctx.fillStyle = "black";
    ctx.font = "12px Merriweather";
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

// Fonction pour dessiner le chemin le plus court
function drawShortestPath(path) {
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
  }
  ctx.strokeStyle = "black";
  ctx.lineWidth = 1;
}

// Fonction pour générer un labyrinthe simple avec un chemin garanti
function generateMaze() {
  for (let y = 0; y < MAZE_SIZE; y++) {
    maze[y] = [];
    for (let x = 0; x < MAZE_SIZE; x++) {
      maze[y][x] = 1;
    }
  }

  let currentPos = { ...startPosition };
  while (
    currentPos.x !== treasurePosition.x ||
    currentPos.y !== treasurePosition.y
  ) {
    maze[currentPos.y][currentPos.x] = 0;
    if (Math.random() < 0.5 && currentPos.x !== treasurePosition.x) {
      currentPos.x += currentPos.x < treasurePosition.x ? 1 : -1;
    } else if (currentPos.y !== treasurePosition.y) {
      currentPos.y += currentPos.y < treasurePosition.y ? 1 : -1;
    }
  }
  maze[treasurePosition.y][treasurePosition.x] = 0;

  for (let y = 0; y < MAZE_SIZE; y++) {
    for (let x = 0; x < MAZE_SIZE; x++) {
      if (maze[y][x] === 1 && Math.random() < 0.3) {
        maze[y][x] = 0;
      }
    }
  }
}

// Fonction pour dessiner le labyrinthe
function drawMaze() {
  const canvas = document.getElementById("mazeCanvas");
  const ctx = canvas.getContext("2d");

  canvas.width = MAZE_SIZE * CELL_SIZE;
  canvas.height = MAZE_SIZE * CELL_SIZE;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < MAZE_SIZE; y++) {
    for (let x = 0; x < MAZE_SIZE; x++) {
      if (maze[y][x] === 1) {
        ctx.fillStyle = "black";
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }
  }

  // Dessiner le point de départ
  ctx.fillStyle = "green";
  ctx.beginPath();
  ctx.arc(
    (startPosition.x + 0.5) * CELL_SIZE,
    (startPosition.y + 0.5) * CELL_SIZE,
    CELL_SIZE / 3,
    0,
    2 * Math.PI
  );
  ctx.fill();

  // Dessiner le trésor
  ctx.fillStyle = "gold";
  ctx.beginPath();
  ctx.arc(
    (treasurePosition.x + 0.5) * CELL_SIZE,
    (treasurePosition.y + 0.5) * CELL_SIZE,
    CELL_SIZE / 3,
    0,
    2 * Math.PI
  );
  ctx.fill();
}

// Fonction pour trouver le chemin dans le labyrinthe
function findMazePath() {
  const queue = [[startPosition]];
  const visited = new Set();

  while (queue.length > 0) {
    const path = queue.shift();
    const { x, y } = path[path.length - 1];

    if (x === treasurePosition.x && y === treasurePosition.y) {
      return path;
    }

    const directions = [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0],
    ];
    for (let [dx, dy] of directions) {
      const newX = x + dx;
      const newY = y + dy;
      const key = `${newX},${newY}`;

      if (
        newX >= 0 &&
        newX < MAZE_SIZE &&
        newY >= 0 &&
        newY < MAZE_SIZE &&
        maze[newY][newX] === 0 &&
        !visited.has(key)
      ) {
        queue.push([...path, { x: newX, y: newY }]);
        visited.add(key);
      }
    }
  }

  return null; // Pas de chemin trouvé
}

// Fonction pour dessiner une partie du chemin dans le labyrinthe
function drawMazePathSegment(path, index) {
  const canvas = document.getElementById("mazeCanvas");
  const ctx = canvas.getContext("2d");

  if (index < path.length - 1) {
    const current = path[index];
    const next = path[index + 1];

    ctx.strokeStyle = "red";
    ctx.lineWidth = CELL_SIZE / 3;
    ctx.beginPath();
    ctx.moveTo((current.x + 0.5) * CELL_SIZE, (current.y + 0.5) * CELL_SIZE);
    ctx.lineTo((next.x + 0.5) * CELL_SIZE, (next.y + 0.5) * CELL_SIZE);
    ctx.stroke();

    setTimeout(() => drawMazePathSegment(path, index + 1), 100);
  }
}

function showHelpMessage(message) {
  const helpDiv = document.createElement("div");
  helpDiv.className = "help-message";
  helpDiv.textContent = message;
  document.body.appendChild(helpDiv);
  setTimeout(() => {
    helpDiv.remove();
  }, 3000);
}

// Initialisation
window.onload = () => {
  drawKingdom();
  generateMaze();
  drawMaze();

  // Remplir les sélecteurs de points pour la carte
  const startSelect = document.getElementById("start-point");
  const endSelect = document.getElementById("end-point");
  kingdom.nodes.forEach((node) => {
    startSelect.add(new Option(node, node));
    endSelect.add(new Option(node, node));
  });

  // Gestionnaire pour le bouton "Trouver le chemin" de la carte
  document.getElementById("find-path").addEventListener("click", () => {
    const start = document.getElementById("start-point").value;
    const end = document.getElementById("end-point").value;
    if (start === end) {
      showHelpMessage(
        "Veuillez choisir des points de départ et d'arrivée différents."
      );
      return;
    }
    const path = dijkstra(start, end);
    drawKingdom();
    drawShortestPath(path);
    showHelpMessage(
      "Voici le chemin le plus court vers l'entrée du labyrinthe !"
    );
  });

  // Gestionnaire pour le bouton "Trouver le trésor" du labyrinthe
  document.getElementById("find-treasure").addEventListener("click", () => {
    const path = findMazePath();
    if (path) {
      drawMaze(); // Redessiner le labyrinthe pour effacer l'ancien chemin
      drawMazePathSegment(path, 0);
      showHelpMessage("Le trésor a été trouvé ! Suivez le chemin rouge.");
    } else {
      alert("Impossible de trouver un chemin vers le trésor !");
    }
  });
};
