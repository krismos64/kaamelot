// Représentation du royaume
const kingdom = {
  nodes: [
    "Kaamelot",
    "Labyrinthe",
    "KingVillage",
    "QueenVillage",
    "Forêt",
    "Montagne",
    "Lac",
    "Port",
  ],
  edges: [
    { from: "Kaamelot", to: "KingVillage", weight: 3 },
    { from: "Kaamelot", to: "Montagne", weight: 7 },
    { from: "Kaamelot", to: "QueenVillage", weight: 4 },
    { from: "Kaamelot", to: "Forêt", weight: 5 },
    { from: "Kaamelot", to: "Port", weight: 12 },
    { from: "Kaamelot", to: "Lac", weight: 13 },
    { from: "Kaamelot", to: "Labyrinthe", weight: 26 },
    { from: "KingVillage", to: "QueenVillage", weight: 6 },
    { from: "KingVillage", to: "Forêt", weight: 7 },
    { from: "KingVillage", to: "Montagne", weight: 8 },
    { from: "Forêt", to: "Lac", weight: 9 },
    { from: "Montagne", to: "Lac", weight: 5 },
    { from: "Montagne", to: "Labyrinthe", weight: 18 },
    { from: "Lac", to: "Labyrinthe", weight: 12 },
    { from: "Lac", to: "Forêt", weight: 20 },
    { from: "QueenVillage", to: "KingVillage", weight: 3 },
    { from: "QueenVillage", to: "Port", weight: 6 },
    { from: "Port", to: "Forêt", weight: 6 },
  ],
};

// Coordonnées des points de passage sur l'image
const locations = {
  Kaamelot: { x: 45, y: 37.5 }, // 180/400 * 100, 150/400 * 100
  Labyrinthe: { x: 16.25, y: 77.5 }, // 65/400 * 100, 310/400 * 100
  KingVillage: { x: 75, y: 41.25 },
  QueenVillage: { x: 90, y: 57.5 },
  Forêt: { x: 42.5, y: 70 },
  Montagne: { x: 37.5, y: 7.5 },
  Lac: { x: 12.5, y: 12.5 },
  Port: { x: 75, y: 85 },
};

// Constantes pour le labyrinthe
const MAZE_SIZE = 15;
const CELL_SIZE = 30;

// Variables globales
let maze = [];
let startPosition = { x: 0, y: 0 };
let treasurePosition = { x: MAZE_SIZE - 1, y: MAZE_SIZE - 1 };

// Classe PriorityQueue pour optimiser Dijkstra
class PriorityQueue {
  constructor() {
    this.elements = [];
  }

  enqueue(element, priority) {
    this.elements.push({ element, priority });
    this.elements.sort((a, b) => a.priority - b.priority);
  }

  dequeue() {
    return this.elements.shift();
  }

  isEmpty() {
    return this.elements.length === 0;
  }
}

// Fonction pour dessiner le royaume
function drawKingdom() {
  const canvas = document.getElementById("kingdomCanvas");
  const ctx = canvas.getContext("2d");
  const img = document.getElementById("kingdomMap");

  canvas.width = img.width;
  canvas.height = img.height;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Dessiner les points de passage
  for (let [name, pos] of Object.entries(locations)) {
    const x = (pos.x / 100) * canvas.width;
    const y = (pos.y / 100) * canvas.height;

    ctx.beginPath();
    ctx.arc(x, y, canvas.width * 0.025, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(255, 0, 0, 0.7)";
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "white";
    ctx.font = `${canvas.width * 0.03}px Merriweather`;
    ctx.textAlign = "center";
    ctx.fillText(name, x, y - canvas.height * 0.0375);
  }

  // Dessiner les chemins
  kingdom.edges.forEach((edge) => {
    const from = locations[edge.from];
    const to = locations[edge.to];
    const fromX = (from.x / 100) * canvas.width;
    const fromY = (from.y / 100) * canvas.height;
    const toX = (to.x / 100) * canvas.width;
    const toY = (to.y / 100) * canvas.height;

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
    ctx.stroke();

    // Afficher le poids du chemin
    const midX = (fromX + toX) / 2;
    const midY = (fromY + toY) / 2;
    ctx.fillStyle = "white";
    ctx.fillRect(
      midX - canvas.width * 0.025,
      midY - canvas.height * 0.025,
      canvas.width * 0.05,
      canvas.height * 0.05
    );
    ctx.fillStyle = "black";
    ctx.font = `${canvas.width * 0.03}px Merriweather`;
    ctx.fillText(edge.weight.toString(), midX, midY + canvas.height * 0.0125);
  });
}
// Algorithme de Dijkstra pour trouver le plus court chemin
function dijkstra(start, end) {
  const distances = {};
  const previous = {};
  const queue = new PriorityQueue();

  kingdom.nodes.forEach((node) => {
    distances[node] = node === start ? 0 : Infinity;
    previous[node] = null;
    queue.enqueue(node, distances[node]);
  });

  while (!queue.isEmpty()) {
    const closest = queue.dequeue().element;

    if (closest === end) break;

    kingdom.edges
      .filter((edge) => edge.from === closest || edge.to === closest)
      .forEach((edge) => {
        const neighbor = edge.from === closest ? edge.to : edge.from;
        const alt = distances[closest] + edge.weight;
        if (alt < distances[neighbor]) {
          distances[neighbor] = alt;
          previous[neighbor] = closest;
          queue.enqueue(neighbor, alt);
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

// Fonction pour calculer la distance totale d'un chemin
function calculatePathDistance(path) {
  let distance = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const edge = kingdom.edges.find(
      (e) =>
        (e.from === path[i] && e.to === path[i + 1]) ||
        (e.to === path[i] && e.from === path[i + 1])
    );
    distance += edge.weight;
  }
  return distance;
}

// Fonction pour dessiner le chemin le plus court
function drawShortestPath(path) {
  const canvas = document.getElementById("kingdomCanvas");
  const ctx = canvas.getContext("2d");

  ctx.beginPath();
  const start = locations[path[0]];
  ctx.moveTo((start.x / 100) * canvas.width, (start.y / 100) * canvas.height);

  for (let i = 1; i < path.length; i++) {
    const point = locations[path[i]];
    ctx.lineTo((point.x / 100) * canvas.width, (point.y / 100) * canvas.height);
  }

  ctx.strokeStyle = "red";
  ctx.lineWidth = canvas.width * 0.0075;
  ctx.stroke();
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
  const canvas = document.getElementById("kingdomCanvas");
  const img = document.getElementById("kingdomMap");

  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    drawKingdom();
  };

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
    const distance = calculatePathDistance(path);
    drawKingdom();
    drawShortestPath(path);
    showHelpMessage(
      `Chemin le plus court trouvé ! Distance totale : ${distance}`
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

  // Ajout d'interactivité à la carte
  canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    for (let [name, pos] of Object.entries(locations)) {
      if (Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2) < 15) {
        showHelpMessage(`Vous avez cliqué sur ${name}`);
        break;
      }
    }
  });

  window.addEventListener("resize", () => {
    const img = document.getElementById("kingdomMap");
    img.onload = () => {
      drawKingdom();
      // Redessiner le chemin si nécessaire
    };
    img.src = img.src; // Recharge l'image pour déclencher l'événement onload
  });
};
