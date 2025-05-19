document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('chessboard');
    const boardSizeSelect = document.getElementById('boardSize');
    const newGameButton = document.getElementById('newGame');
    const moveCountElement = document.getElementById('moveCount');
    const bestScoreElement = document.getElementById('bestScore');
    let knightPosition = { row: 0, col: 0 };
    let visitedSquares = new Set();
    let gameOver = false;
    let boardSize = 8;
    let moveCount = 0;

    // Fonction pour gérer les cookies
    function setCookie(name, value, days) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }

    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for(let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    function updateBestScore() {
        const currentBest = getCookie(`bestScore_${boardSize}`);
        if (!currentBest || moveCount < parseInt(currentBest)) {
            setCookie(`bestScore_${boardSize}`, moveCount, 365);
            bestScoreElement.textContent = moveCount;
        }
    }

    function loadBestScore() {
        const bestScore = getCookie(`bestScore_${boardSize}`);
        bestScoreElement.textContent = bestScore || '-';
    }

    function initializeBoard() {
        // Vider l'échiquier
        board.innerHTML = '';
        visitedSquares.clear();
        gameOver = false;
        moveCount = 0;
        moveCountElement.textContent = '0';
        
        // Mettre à jour la taille de l'échiquier
        boardSize = parseInt(boardSizeSelect.value);
        board.style.gridTemplateColumns = `repeat(${boardSize}, 50px)`;
        board.style.gridTemplateRows = `repeat(${boardSize}, 50px)`;

        // Charger le meilleur score pour cette taille
        loadBestScore();

        // Créer les cases
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                const square = document.createElement('div');
                square.className = 'square';
                square.dataset.row = row;
                square.dataset.col = col;
                board.appendChild(square);
            }
        }

        // Placer le cavalier initial en haut à droite
        knightPosition = { row: 0, col: boardSize - 1 };
        updateKnightPosition();
        markSquareAsVisited(knightPosition.row, knightPosition.col);

        // Ajouter les écouteurs d'événements
        document.querySelectorAll('.square').forEach(square => {
            square.addEventListener('click', handleSquareClick);
        });
    }

    function updateKnightPosition() {
        document.querySelectorAll('.knight').forEach(knight => knight.remove());
        const square = document.querySelector(`[data-row="${knightPosition.row}"][data-col="${knightPosition.col}"]`);
        const knight = document.createElement('div');
        knight.className = 'knight';
        knight.textContent = '♞';
        square.appendChild(knight);
    }

    function markSquareAsVisited(row, col) {
        const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        square.classList.add('visited');
        visitedSquares.add(`${row},${col}`);
        
        if (visitedSquares.size === boardSize * boardSize) {
            gameOver = true;
            updateBestScore();
            showVictoryMessage();
        }
    }

    function isValidMove(row, col) {
        if (gameOver) return false;
        
        const rowDiff = Math.abs(row - knightPosition.row);
        const colDiff = Math.abs(col - knightPosition.col);
        const isValidKnightMove = (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
        
        return isValidKnightMove && !visitedSquares.has(`${row},${col}`);
    }

    function handleSquareClick(event) {
        const row = parseInt(event.target.dataset.row);
        const col = parseInt(event.target.dataset.col);

        if (isValidMove(row, col)) {
            knightPosition = { row, col };
            updateKnightPosition();
            markSquareAsVisited(row, col);
            moveCount++;
            moveCountElement.textContent = moveCount;
        }
    }

    function showVictoryMessage() {
        const info = document.querySelector('.info');
        info.innerHTML = `<p style="color: green; font-weight: bold;">Félicitations ! Vous avez visité toutes les cases en ${moveCount} mouvements !</p>`;
    }

    // Initialiser le jeu
    initializeBoard();

    // Écouteurs d'événements pour les contrôles
    boardSizeSelect.addEventListener('change', initializeBoard);
    newGameButton.addEventListener('click', initializeBoard);
}); 