const gridEl = document.getElementById("grid");
const startBtn = document.getElementById("start");
const stepBtn = document.getElementById("step");
const randomBtn = document.getElementById("random");
const clearBtn = document.getElementById("clear");
const drawCellBtn = document.getElementById("drawCellBtn");
const aboutBtn = document.getElementById("about");
const aboutModal = document.getElementById("aboutModal");
const closeAboutBtn = document.getElementById("closeAbout");
const patternSelect = document.getElementById("patternSelect");

const speedSlider = document.getElementById("speed");
const rowSlider = document.getElementById("row");
const colSlider = document.getElementById("col");

const squareToggle = document.getElementById("squareToggle");
const rowControlWrap = document.getElementById("rowControlWrap");
const colControlWrap = document.getElementById("colControlWrap");
const rowLabelText = document.getElementById("rowLabelText");

const speedValue = document.getElementById("speedValue");
const rowValue = document.getElementById("rowval");
const colValue = document.getElementById("colval");

const stateLabel = document.getElementById("state");
const generationLabel = document.getElementById("generation");
const aliveLabel = document.getElementById("alive");

let rows = Number(rowSlider.value);
let cols = squareToggle.checked ? rows : Number(colSlider.value);
let fps = Number(speedSlider.value);

if (squareToggle.checked) {
    colSlider.value = rows;
}
let generation = 0;
let timer = null;
let running = false;
let isPointerDown = false;
let currentPattern = null;
let previewCells = [];

const PATTERNS = {
    "Block": ["OO", "OO"],
    "Bee-hive": [".OO.", "O..O", ".OO."],
    "Loaf": [".OO.", "O..O", ".O.O", "..O."],
    "Boat": ["OO.", "O.O", ".O."],
    "Tub": [".O.", "O.O", ".O."],
    "Blinker": ["OOO"],
    "Toad": [".OOO", "OOO."],
    "Beacon": ["OO..", "OO..", "..OO", "..OO"],
    "Pulsar": [
        "..OOO...OOO..",
        ".............",
        "O....O.O....O",
        "O....O.O....O",
        "O....O.O....O",
        "..OOO...OOO..",
        ".............",
        "..OOO...OOO..",
        "O....O.O....O",
        "O....O.O....O",
        "O....O.O....O",
        ".............",
        "..OOO...OOO.."
    ],
    "Penta-decathlon": ["OOOOOOOOOO"],
    "Glider": [".O.", "..O", "OOO"],
    "LWSS": [".O..O", "O....", "O...O", "OOOO."],
    "MWSS": ["...OO.", ".O...O", "O.....", "O....O", "OOOOO."],
    "HWSS": ["...OO..", ".O....O", "O......", "O.....O", "OOOOOO."],
    "Gosper Glider Gun": [
        "........................O...........",
        "......................O.O...........",
        "............OO......OO............OO",
        "...........O...O....OO............OO",
        "OO........O.....O...OO..............",
        "OO........O...O.OO....O.O...........",
        "..........O.....O.......O...........",
        "...........O...O....................",
        "............OO......................"
    ]
};

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
            cell.addEventListener("dblclick", onPaintLockToggle);
            cell.addEventListener("mouseenter", onPaintLockPaint);
            gridEl.appendChild(cell);
            cells.push(cell);
        }
    }
}

function getCellIndex(row, col) {
    return row * cols + col;
}

function getCellColor(age) {
    if (age <= 0) {
        return "";
    }
    const hue = 140 + ((age - 1) * 8); 
    const lightness = 65 - ((age - 1) * 5);
    return `hsl(${hue}, 90%, ${lightness}%)`;
}

function setCellAlive(row, col) {
    if (board[row][col] > 0) {
        return;
    }

    board[row][col] = 1;
    const index = getCellIndex(row, col);
    cells[index].classList.add("alive");
    cells[index].style.backgroundColor = getCellColor(1);
    updateStats();
}

function onCellToggle(event) {
    const cell = event.currentTarget;
    const r = Number(cell.dataset.row);
    const c = Number(cell.dataset.col);

    if (currentPattern) {
        placePattern(r, c, currentPattern);
    } else {
        const isAlive = board[r][c] > 0;
        board[r][c] = isAlive ? 0 : 1;
        cell.classList.toggle("alive", !isAlive);
        cell.style.backgroundColor = getCellColor(board[r][c]);
        updateStats();
    }
}

function placePattern(startRow, startCol, pattern) {
    for (let r = 0; r < pattern.length; r++) {
        for (let c = 0; c < pattern[r].length; c++) {
            if (pattern[r][c] === 'O') {
                const tr = startRow + r;
                const tc = startCol + c;
                if (tr >= 0 && tr < rows && tc >= 0 && tc < cols) {
                    if (board[tr][tc] <= 0) {
                        board[tr][tc] = 1;
                        const index = getCellIndex(tr, tc);
                        cells[index].classList.add("alive");
                        cells[index].style.backgroundColor = getCellColor(1);
                    }
                }
            }
        }
    }
    updateStats();
}

let paintLocked = false;

function onPaintLockToggle(event) {
    if (currentPattern) return;
    event.preventDefault();
    paintLocked = !paintLocked;

    const cell = event.currentTarget;
    const r = Number(cell.dataset.row);
    const c = Number(cell.dataset.col);
    setCellAlive(r, c);
}

function onPaintLockPaint(event) {
    if (currentPattern) {
        return;
    }

    if (!paintLocked && !isPointerDown) {
        return;
    }

    const cell = event.currentTarget;
    const r = Number(cell.dataset.row);
    const c = Number(cell.dataset.col);
    setCellAlive(r, c);
}

function clearPreview() {
    for (const cell of previewCells) {
        cell.classList.remove("preview");
    }
    previewCells = [];
}

gridEl.addEventListener("mouseover", (event) => {
    if (!currentPattern) {
        return;
    }

    const cell = event.target.closest(".cell");
    if (!cell) {
        return;
    }

    const r = Number(cell.dataset.row);
    const c = Number(cell.dataset.col);

    clearPreview();

    for (let pr = 0; pr < currentPattern.length; pr++) {
        for (let pc = 0; pc < currentPattern[pr].length; pc++) {
            if (currentPattern[pr][pc] === 'O') {
                const tr = r + pr;
                const tc = c + pc;
                if (tr >= 0 && tr < rows && tc >= 0 && tc < cols) {
                    const index = getCellIndex(tr, tc);
                    const targetCell = cells[index];
                    if (targetCell && board[tr][tc] <= 0) {
                        targetCell.classList.add("preview");
                        previewCells.push(targetCell);
                    }
                }
            }
        }
    }
});

gridEl.addEventListener("mouseleave", clearPreview);

function stopPointerPaint() {
    isPointerDown = false;
}

function openAboutModal() {
    if (!aboutModal) {
        return;
    }
    aboutModal.hidden = false;
}

function closeAboutModal() {
    if (!aboutModal) {
        return;
    }
    aboutModal.hidden = true;
}

function drawBoard() {
    for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
            const index = r * cols + c;
            const age = board[r][c];
            const cell = cells[index];
            if (age > 0) {
                cell.classList.add("alive");
                cell.style.backgroundColor = getCellColor(age);
            } else {
                cell.classList.remove("alive");
                cell.style.backgroundColor = "";
            }
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

            const rr = row + dr;
            const cc = col + dc;
            if (rr >= 0 && rr < rows && cc >= 0 && cc < cols) {
                alive += board[rr][cc] > 0 ? 1 : 0;
            }
        }
    }
    return alive;
}

function stepSimulation() {
    for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
            const neighbors = countNeighbors(r, c);
            const current = board[r][c];
            if (current > 0) {
                if (neighbors === 2 || neighbors === 3) {
                    nextBoard[r][c] = Math.min(current + 1, 10);
                } else {
                    nextBoard[r][c] = 0;
                }
            } else {
                if (neighbors === 3) {
                    nextBoard[r][c] = 1;
                } else {
                    nextBoard[r][c] = 0;
                }
            }
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
            alive += board[r][c] > 0 ? 1 : 0;
        }
    }

    generationLabel.textContent = String(generation);
    aliveLabel.textContent = String(alive);
}

drawCellBtn.addEventListener("click", () => {
    currentPattern = null;
    patternSelect.value = "";
    clearPreview();
});

patternSelect.addEventListener("change", (e) => {
    const val = e.target.value;
    if (val && PATTERNS[val]) {
        currentPattern = PATTERNS[val];
    } else {
        currentPattern = null;
        clearPreview();
    }
});

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

aboutBtn?.addEventListener("click", openAboutModal);
closeAboutBtn?.addEventListener("click", closeAboutModal);
aboutModal?.addEventListener("click", (event) => {
    if (event.target === aboutModal) {
        closeAboutModal();
    }
});

gridEl.addEventListener("mousedown", (event) => {
    if (event.button !== 0) {
        return;
    }
    isPointerDown = true;
});

document.addEventListener("mouseup", stopPointerPaint);

// Ensure drag painting always stops, even if mouse is released outside the page.
window.addEventListener("blur", stopPointerPaint);
document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") {
        stopPointerPaint();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && aboutModal && !aboutModal.hidden) {
        closeAboutModal();
        return;
    }

    if (event.key !== "Escape" || !paintLocked) {
        return;
    }
    paintLocked = false;
});

speedSlider.addEventListener("input", () => {
    fps = Number(speedSlider.value);
    speedValue.textContent = `${fps} fps`;

    if (running) {
        window.clearInterval(timer);
        timer = window.setInterval(stepSimulation, 1000 / fps);
    }
});

squareToggle.addEventListener("change", (e) => {
    if (e.target.checked) {
        colControlWrap.style.display = "none";
        rowLabelText.textContent = "Grid Size";
        cols = rows;
        colSlider.value = rows;
        colValue.textContent = String(cols);
        if (running) setRunningState(false);
        rebuildBoard();
    } else {
        colControlWrap.style.display = "grid";
        rowLabelText.textContent = "Rows";
    }
});

rowSlider.addEventListener("input", () => {
    rows = Number(rowSlider.value);
    rowValue.textContent = String(rows);
    if (squareToggle.checked) {
        cols = rows;
        colSlider.value = rows;
        colValue.textContent = String(cols);
    }
    if (running) {
        setRunningState(false);
    }
    rebuildBoard();
});

colSlider.addEventListener("input", () => {
    cols = Number(colSlider.value);
    colValue.textContent = String(cols);
    if (!squareToggle.checked) {
        if (running) {
            setRunningState(false);
        }
        rebuildBoard();
    }
});

rowValue.textContent = String(rows);
colValue.textContent = String(cols);
speedValue.textContent = `${fps} fps`;

// Force initial grid build based on square toggle state
if (squareToggle.checked) {
    colSlider.value = rows;
    cols = rows;
    colControlWrap.style.display = "none";
    rowLabelText.textContent = "Grid Size";
} else {
    colControlWrap.style.display = "flex";
    rowLabelText.textContent = "Rows";
}

buildGrid();
drawBoard();
updateStats();