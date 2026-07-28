const boardEl = document.getElementById('chessboard');
const turnIndicator = document.getElementById('turn-indicator');
const devModeSelect = document.getElementById('dev-mode');
const instructionPanel = document.getElementById('instruction-panel');
const winnerIndicator = document.getElementById('winner-indicator');

// Action Buttons
const btnMove = document.getElementById('btn-move');
const btnSplit = document.getElementById('btn-split');
const btnSplitMove = document.getElementById('btn-split-move');
const btnReset = document.getElementById('btn-reset');

let currentBoard = [];
let turn = 'W';
let actionState = 'move'; // move, split, split_move
let selectionState = {};

// Helper to construct backend-friendly coordinates from grid click
// Python expects [row, col] (1-indexed based on the original structure)
function getPythonCoords(r, c) {
    if (devModeSelect.value === 'true' || turn === 'W') {
        // showW and showTrue put Rank 8 at top (row 0), Rank 1 at bottom (row 7)
        return [8 - r, c + 1]; 
    } else {
        // showB puts Rank 1 at top (row 0), Rank 8 at bottom (row 7)
        return [r + 1, c + 1];
    }
}

// Map Python piece name to image file name
function getImagePath(pieceName) {
    if (pieceName === '--0--') return null;
    
    // Example piece name: P_W_1 or P_W_1_S
    const parts = pieceName.split('_');
    const type = parts[0];
    const team = parts[1];
    const isSplit = pieceName.endsWith('_S');

    const fileName = `${type}_${team}${isSplit ? '_S' : ''}.png`;
    return `/static/img/${fileName}`;
}

async function fetchState() {
    const devMode = devModeSelect.value;
    const res = await fetch(`/state?dev=${devMode}`);
    const data = await res.json();
    
    currentBoard = data.board;
    turn = data.turn;
    
    turnIndicator.innerText = `Turn: ${turn === 'W' ? 'White' : 'Black'}`;
    if (data.winner) {
        winnerIndicator.innerText = `${data.winner === 'W' ? 'White' : 'Black'} WINS!`;
        winnerIndicator.classList.remove('hidden');
    } else {
        winnerIndicator.classList.add('hidden');
    }
    renderBoard();
}

function renderBoard() {
    boardEl.innerHTML = '';
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const square = document.createElement('div');
            square.className = `square ${(r + c) % 2 === 0 ? 'light' : 'dark'}`;
            square.dataset.r = r;
            square.dataset.c = c;
            
            const pieceName = currentBoard[r][c];
            if (pieceName !== '--0--') {
                square.dataset.piece = pieceName;
                const img = document.createElement('img');
                img.src = getImagePath(pieceName);
                img.className = 'piece-img';
                
                // Add fallback for missing images to show text temporarily
                img.onerror = () => {
                    img.style.display = 'none';
                    square.innerText = pieceName; 
                };
                square.appendChild(img);
            }

            // Highlighting
            if (selectionState.selectedSquare && selectionState.selectedSquare.r === r && selectionState.selectedSquare.c === c) {
                square.classList.add('selected');
            }
            if (selectionState.splitRealDest && selectionState.splitRealDest.r === r && selectionState.splitRealDest.c === c) {
                 square.classList.add('highlight');
            }

            square.addEventListener('click', () => handleSquareClick(r, c, pieceName));
            boardEl.appendChild(square);
        }
    }
}

async function handleSquareClick(r, c, pieceName) {
    if (actionState === 'move') {
        if (!selectionState.selectedSquare) {
            if (pieceName !== '--0--') {
                selectionState.selectedSquare = { r, c, name: pieceName };
            }
        } else {
            const destCoords = getPythonCoords(r, c);
            await fetch('/move', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ piece_name: selectionState.selectedSquare.name, coords: destCoords })
            });
            selectionState = {};
            fetchState();
        }
    } 
    else if (actionState === 'split') {
        if (pieceName !== '--0--') {
            await fetch('/split', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ piece_name: pieceName })
            });
            selectionState = {};
            fetchState();
        }
    }
    else if (actionState === 'split_move') {
        // Step 1: Select real piece
        if (!selectionState.realPiece) {
            if (pieceName !== '--0--' && !pieceName.endsWith('_S')) {
                selectionState.realPiece = pieceName;
                selectionState.selectedSquare = { r, c }; // visual only
                instructionPanel.innerText = "Select destination for REAL piece.";
            }
        } 
        // Step 2: Select real dest
        else if (!selectionState.realDest) {
            selectionState.realDest = getPythonCoords(r, c);
            selectionState.splitRealDest = {r, c}; // visual only
            selectionState.selectedSquare = null;
            instructionPanel.innerText = "Select the FAKE (Split) piece.";
        }
        // Step 3: Select fake piece
        else if (!selectionState.fakePiece) {
            if (pieceName.endsWith('_S')) {
                selectionState.fakePiece = pieceName;
                selectionState.selectedSquare = { r, c }; // visual only
                instructionPanel.innerText = "Select destination for FAKE piece.";
            }
        }
        // Step 4: Select fake dest & Send
        else {
            const fakeDest = getPythonCoords(r, c);
            await fetch('/split_move', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    real_name: selectionState.realPiece,
                    real_coords: selectionState.realDest,
                    copy_name: selectionState.fakePiece,
                    copy_coords: fakeDest
                })
            });
            resetActionState('move'); // return to normal
            fetchState();
        }
    }
    renderBoard();
}

function resetActionState(newState) {
    actionState = newState;
    selectionState = {};
    [btnMove, btnSplit, btnSplitMove].forEach(b => b.classList.remove('active'));
    
    if (newState === 'move') {
        btnMove.classList.add('active');
        instructionPanel.innerText = "Select a piece, then select a destination square.";
    } else if (newState === 'split') {
        btnSplit.classList.add('active');
        instructionPanel.innerText = "Click one of your pieces to split it.";
    } else if (newState === 'split_move') {
        btnSplitMove.classList.add('active');
        instructionPanel.innerText = "Select the REAL piece to move.";
    }
    renderBoard();
}

// Event Listeners
btnMove.addEventListener('click', () => resetActionState('move'));
btnSplit.addEventListener('click', () => resetActionState('split'));
btnSplitMove.addEventListener('click', () => resetActionState('split_move'));
devModeSelect.addEventListener('change', fetchState);

btnReset.addEventListener('click', async () => {
    await fetch('/reset', { method: 'POST' });
    winnerIndicator.classList.add('hidden');
    resetActionState('move');
    fetchState();
});

// Init
fetchState();
