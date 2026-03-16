const gridEl = document.getElementById("grid");
const startBtn = document.getElementById("start");
const stepBtn = document.getElementById("step");
const randomBtn = document.getElementById("random");
const clearBtn = document.getElementById("clear");

const speedSlider = document.getElementById("speed");
const rowSlider = document.getElementById("row");
const colSlider = document.getElementById("col");

const speedValue = document.getElementById("speedValue");
const rowValue = document.getElementById("rowval");
const colValue = document.getElementById("colval");

const stateLabel = document.getElementById("state");
const generationLabel = document.getElementById("generation");
const aliveLabel = document.getElementById("alive");
const traceModeLabel = document.getElementById("traceMode");

let rows = Number(rowSlider.value);
let cols = Number(colSlider.value);
let fps = Number(speedSlider.value);
let generation = 0;
let timer = null;
let running = false;
let isPointerDown = false;
let traceLocked = false;

let board = createBoard(rows, cols);
let nextBoard = createBoard(rows, cols);
let cells = [];

function createBoard(totalRows, totalCols) {
    return Array.from({ length: totalRows }, () => Array(totalCols).fill(0));
}

function buildGrid() {
    gridEl.innerHTML = "";
    gridEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    gridEl.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

    cells = [];
    for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
            const cell = document.createElement("div");
            cell.className = "cell";
            cell.dataset.row = String(r);
            cell.dataset.col = String(c);
            cell.addEventListener("click", onCellToggle);
            cell.addEventListener("dblclick", onTraceToggle);
            cell.addEventListener("mouseenter", onTracePaint);
            gridEl.appendChild(cell);
            cells.push(cell);
        }
    }
}

function getCellIndex(row, col) {
    return row * cols + col;
}

function setCellAlive(row, col) {
    if (board[row][col] === 1) {
        return;
    }

    board[row][col] = 1;
    const index = getCellIndex(row, col);
    cells[index].classList.add("alive");
    updateStats();
}

function onCellToggle(event) {
    const cell = event.currentTarget;
    const r = Number(cell.dataset.row);
    const c = Number(cell.dataset.col);

    board[r][c] = board[r][c] ? 0 : 1;
    cell.classList.toggle("alive", board[r][c] === 1);
    updateStats();
}

function onTraceToggle(event) {
    event.preventDefault();
    traceLocked = !traceLocked;
    traceModeLabel.textContent = traceLocked ? "On" : "Off";

    const cell = event.currentTarget;
    const r = Number(cell.dataset.row);
    const c = Number(cell.dataset.col);
    setCellAlive(r, c);
}

function onTracePaint(event) {
    if (!traceLocked && !isPointerDown) {
        return;
    }

    const cell = event.currentTarget;
    const r = Number(cell.dataset.row);
    const c = Number(cell.dataset.col);
    setCellAlive(r, c);
}

function drawBoard() {
    for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
            const index = r * cols + c;
            cells[index].classList.toggle("alive", board[r][c] === 1);
        }
    }
}

function countNeighbors(row, col) {
    let alive = 0;
    for (let dr = -1; dr <= 1; dr += 1) {
        for (let dc = -1; dc <= 1; dc += 1) {
            if (dr === 0 && dc === 0) {
                continue;
            }

            const rr = (row + dr + rows) % rows;
            const cc = (col + dc + cols) % cols;
            alive += board[rr][cc];
        }
    }
    return alive;
}

function stepSimulation() {
    for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
            const neighbors = countNeighbors(r, c);
            const current = board[r][c];
            const survive = current === 1 && (neighbors === 2 || neighbors === 3);
            const born = current === 0 && neighbors === 3;
            nextBoard[r][c] = survive || born ? 1 : 0;
        }
    }

    const temp = board;
    board = nextBoard;
    nextBoard = temp;
    generation += 1;

    drawBoard();
    updateStats();
}

function setRunningState(isRunning) {
    running = isRunning;
    startBtn.textContent = running ? "Pause" : "Play";
    startBtn.classList.toggle("is-running", running);
    stateLabel.textContent = running ? "Running" : "Paused";

    if (running) {
        timer = window.setInterval(stepSimulation, 1000 / fps);
    } else if (timer !== null) {
        window.clearInterval(timer);
        timer = null;
    }
}

function resetBoardValues() {
    board = createBoard(rows, cols);
    nextBoard = createBoard(rows, cols);
    generation = 0;
}

function rebuildBoard() {
    resetBoardValues();
    buildGrid();
    drawBoard();
    updateStats();
}

function randomizeBoard(fillRate = 0.28) {
    for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
            board[r][c] = Math.random() < fillRate ? 1 : 0;
        }
    }
    generation = 0;
    drawBoard();
    updateStats();
}

function updateStats() {
    let alive = 0;
    for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
            alive += board[r][c];
        }
    }

    generationLabel.textContent = String(generation);
    aliveLabel.textContent = String(alive);
}

startBtn.addEventListener("click", () => {
    setRunningState(!running);
});

stepBtn.addEventListener("click", () => {
    if (running) {
        setRunningState(false);
    }
    stepSimulation();
});

randomBtn.addEventListener("click", () => {
    if (running) {
        setRunningState(false);
    }
    randomizeBoard();
});

clearBtn.addEventListener("click", () => {
    if (running) {
        setRunningState(false);
    }
    resetBoardValues();
    drawBoard();
    updateStats();
});

gridEl.addEventListener("mousedown", (event) => {
    if (event.button !== 0) {
        return;
    }
    isPointerDown = true;
});

document.addEventListener("mouseup", () => {
    isPointerDown = false;
});

document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !traceLocked) {
        return;
    }
    traceLocked = false;
    traceModeLabel.textContent = "Off";
});

speedSlider.addEventListener("input", () => {
    fps = Number(speedSlider.value);
    speedValue.textContent = `${fps} fps`;

    if (running) {
        window.clearInterval(timer);
        timer = window.setInterval(stepSimulation, 1000 / fps);
    }
});

rowSlider.addEventListener("input", () => {
    rows = Number(rowSlider.value);
    rowValue.textContent = String(rows);
    if (running) {
        setRunningState(false);
    }
    rebuildBoard();
});

colSlider.addEventListener("input", () => {
    cols = Number(colSlider.value);
    colValue.textContent = String(cols);
    if (running) {
        setRunningState(false);
    }
    rebuildBoard();
});

rowValue.textContent = String(rows);
colValue.textContent = String(cols);
speedValue.textContent = `${fps} fps`;
traceModeLabel.textContent = "Off";

buildGrid();
drawBoard();
updateStats();