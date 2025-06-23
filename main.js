const cardGrid = document.getElementById('card-grid');
const timeTakenDisplay = document.getElementById('time-taken');
const movesCountDisplay = document.getElementById('moves-count');
const startButton = document.getElementById('start-button');
const gameOverMessage = document.getElementById('gameOverMessage');
const gameOverTitle = document.getElementById('gameOverTitle');
const finalTimeDisplay = document.getElementById('finalTime');
const finalMovesDisplay = document.getElementById('finalMoves');
const nextLevelButton = document.getElementById('nextLevelButton');
const currentLevelDisplay = document.getElementById('current-level-display');

// Elements for the Easy Game (Quick Click Challenge)
let easyGameBoard, easyGameClicksDisplay, easyGameTimeDisplay, easyGameTarget, clicksNeededDisplay;

// Elements for the Picture Puzzle Game
let picturePuzzleBoard, puzzleGrid, puzzleMovesDisplay, puzzleTimeDisplay;

// All possible card emojis, grouped into themes
const cardEmojiThemes = [
    [
        '🍎', '🍌', '🍇', '🍓', '🍍', '🍑', '🍒',
        '🍊', '🥝', '🥭', '🍐', '🍋', '🥥', '🥑', '🍆',
        '🥦', '🥕', '🥔', '🌶️', '🌽', '🧅', '🍄', '🌰'
    ],
    [
        '🥨', '🥐', '🥯', '🥞', '🧇', '🧀', '🍔', '🍟',
        '🍕', '🌭', '🌮', '🌯', '🥙', '🧆', '🍝', '🍜',
        '🍣', '🍤', '🍚', '🍙', '🍦', '🍩', '🍪', '🍰',
        '☕', '🍵', '🥛', '🥤', '🍷', '🍺', '🍸', '🍹'
    ],
    [
        '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
        '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔',
        '🐧', '🐦', '🦉', '🦋', '🐝', '🐛', '🐌', '🐢'
    ],
    [
        '🚗', '✈️', '🚢', '🚂', '🚲', '🛴', '🚁', '⛵',
        '🗺️', '🧭', '🗼', '🗽', '🕌', '⛩️', '🏰', '⛺',
        '🏖️', '⛰️', '🌃', '🌉', '🛣️', '🛤️', '🏙️', '🏡'
    ]
];

const bonusGameEmojis = [
    '⭐', '🚀', '🌈', '💎', '🏆', '🎉', '💡', '💯',
    '🧩', '🌟', '🎯', '✨'
];

// Level configurations for Memory Match
const levels = [
    { pairs: 2, gridCols: 2, message: "Level 1 Complete!" },
    { pairs: 3, gridCols: 3, message: "Level 2 Complete!" },
    { pairs: 4, gridCols: 4, message: "Level 3 Complete!" },
    { pairs: 5, gridCols: 4, message: "Level 4 Complete!" },
    { pairs: 6, gridCols: 4, message: "Level 5 Complete!" },
    { pairs: 7, gridCols: 4, message: "Level 6 Complete!" },
    { pairs: 8, gridCols: 4, message: "Level 7 Complete!" },
    { pairs: 9, gridCols: 6, message: "Level 8 Complete!" },
    { pairs: 10, gridCols: 5, message: "Level 9 Complete!" },
    { pairs: 11, gridCols: 6, message: "Level 10 Complete!" },
    { pairs: 12, gridCols: 6, message: "Level 11 Complete!" },
    { pairs: 13, gridCols: 6, message: "Level 12 Complete!" },
    { pairs: 14, gridCols: 8, message: "Level 13 Complete!" },
    { pairs: 15, gridCols: 6, message: "Level 14 Complete!" },
    { pairs: 16, gridCols: 8, message: "Level 15 Complete!" },
    { pairs: 17, gridCols: 8, message: "Level 16 Complete!" },
    { pairs: 18, gridCols: 8, message: "Level 17 Complete!" },
    { pairs: 19, gridCols: 8, message: "Level 18 Complete!" },
    { pairs: 20, gridCols: 8, message: "Level 19 Complete!" },
    { pairs: 21, gridCols: 8, message: "Level 20 Complete!" }
];

let currentLevelIndex = 0;
let cardsArray = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let timer = 0;
let timerInterval;
let isGameActive = false;
let lockBoard = false;

// Easy Game variables
let easyGameScore = 0;
let easyGameTimerInterval = null;
const EASY_GAME_CLICKS_NEEDED = 15;
const EASY_GAME_TIME_LIMIT = 5;

// Picture Puzzle variables
let puzzleBoardState = [];
let puzzleMoves = 0;
let puzzleTime = 0;
let puzzleTimerInterval = null;
const SOLVED_PUZZLE_STATE = [1, 2, 3, 4, 5, 6, 7, 8, 0];
const PUZZLE_TILE_COUNT = 9;

let bonusGameCount = 0;

// Utility function
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Memory Match Logic

function initializeMemoryMatchGame() {
    cardGrid.innerHTML = '';
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    timer = 0;
    movesCountDisplay.textContent = moves;
    timeTakenDisplay.textContent = '0s';
    currentLevelDisplay.textContent = currentLevelIndex + 1;

    const currentLevel = levels[currentLevelIndex];
    const numberOfPairs = currentLevel.pairs;
    const gridColumns = currentLevel.gridCols;

    const currentThemeIndex = Math.floor(currentLevelIndex / 5);
    const selectedThemeEmojis = cardEmojiThemes[currentThemeIndex % cardEmojiThemes.length];

    const availableEmojis = selectedThemeEmojis.slice(0, Math.min(numberOfPairs, selectedThemeEmojis.length));
    const currentLevelEmojis = shuffle([...availableEmojis]).slice(0, numberOfPairs);
    cardsArray = [...currentLevelEmojis, ...currentLevelEmojis];
    shuffle(cardsArray);

    cardGrid.style.gridTemplateColumns = `repeat(${gridColumns}, 1fr)`;
    const cardWidth = window.innerWidth > 768 ? 100 : (window.innerWidth > 480 ? 80 : 65);
    const gridGap = window.innerWidth > 768 ? 15 : 10;
    const gridPadding = window.innerWidth > 768 ? 40 : 30;
    cardGrid.style.maxWidth = `${gridColumns * cardWidth + (gridColumns - 1) * gridGap + gridPadding}px`;

    cardsArray.forEach((value, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.value = value;
        card.dataset.id = index;

        const cardInner = document.createElement('div');
        cardInner.classList.add('card-inner');

        const cardFront = document.createElement('div');
        cardFront.classList.add('card-front');
        cardFront.textContent = '?';

        const cardBack = document.createElement('div');
        cardBack.classList.add('card-back');
        cardBack.textContent = value;

        cardInner.appendChild(cardFront);
        cardInner.appendChild(cardBack);
        card.appendChild(cardInner);

        card.addEventListener('click', flipCard);
        cardGrid.appendChild(card);
    });
}

function flipCard(event) {
    if (!isGameActive || lockBoard) return;
    const clickedCard = event.currentTarget;

    if (clickedCard.classList.contains('flipped') || clickedCard.classList.contains('matched')) {
        return;
    }

    clickedCard.classList.add('flipped');
    flippedCards.push(clickedCard);

    if (flippedCards.length === 2) {
        moves++;
        movesCountDisplay.textContent = moves;
        lockBoard = true;
        setTimeout(checkForMatch, 500);
    }
}

function checkForMatch() {
    const [cardOne, cardTwo] = flippedCards;
    const isMatch = cardOne.dataset.value === cardTwo.dataset.value;

    if (isMatch) {
        disableCards();
    } else {
        unflipCards();
    }
}

function disableCards() {
    flippedCards.forEach(card => {
        card.classList.add('matched');
        card.removeEventListener('click', flipCard);
    });
    matchedPairs++;
    resetTurn();
}

function unflipCards() {
    flippedCards.forEach(card => {
        card.classList.remove('flipped');
    });
    resetTurn();
}

function resetTurn() {
    flippedCards = [];
    lockBoard = false;
    if (matchedPairs === levels[currentLevelIndex].pairs) {
        endMemoryMatchGame();
    }
}

function startMemoryMatchTimer() {
    timer = 0;
    timeTakenDisplay.textContent = '0s';
    clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        timer++;
        timeTakenDisplay.textContent = `${timer}s`;
    }, 1000);
}

function startMemoryMatchGame() {
    isGameActive = true;
    gameOverMessage.classList.remove('active');
    startButton.style.display = 'none';

    cardGrid.style.display = 'grid';
    easyGameBoard.style.display = 'none';
    picturePuzzleBoard.style.display = 'none';

    initializeMemoryMatchGame();
    startMemoryMatchTimer();
}

function endMemoryMatchGame() {
    isGameActive = false;
    clearInterval(timerInterval);

    finalTimeDisplay.textContent = `${timer}s`;
    finalMovesDisplay.textContent = moves;

    if (((currentLevelIndex + 1) % 10 === 0) && (currentLevelIndex + 1 < levels.length)) {
        gameOverTitle.textContent = `Level ${currentLevelIndex + 1} Complete! Get Ready for a Bonus Challenge!`;
        nextLevelButton.textContent = "Start Bonus Game";

        if (bonusGameCount % 2 === 0) {
            nextLevelButton.onclick = startBonusGame;
        } else {
            nextLevelButton.onclick = startPicturePuzzleGame;
        }
    } else if (currentLevelIndex < levels.length - 1) {
        gameOverTitle.textContent = levels[currentLevelIndex].message;
        nextLevelButton.textContent = "Next Level";
        nextLevelButton.onclick = () => {
            currentLevelIndex++;
            startMemoryMatchGame();
        };
    } else {
        gameOverTitle.textContent = "🎉 Congratulations! You Finished All Levels! 🎉";
        nextLevelButton.textContent = "Play Again";
        nextLevelButton.onclick = () => {
            currentLevelIndex = 0;
            bonusGameCount = 0;
            startMemoryMatchGame();
        };
    }

    gameOverMessage.classList.add('active');
    startButton.style.display = 'block';
}

// Easy Game (Quick Click Challenge)

function startBonusGame() {
    cardGrid.style.display = 'none';
    startButton.style.display = 'none';
    gameOverMessage.classList.remove('active');
    picturePuzzleBoard.style.display = 'none';

    easyGameBoard.style.display = 'flex';
    easyGameClicksDisplay.textContent = '0';
    easyGameTimeDisplay.textContent = EASY_GAME_TIME_LIMIT;
    clicksNeededDisplay.textContent = EASY_GAME_CLICKS_NEEDED;
    easyGameScore = 0;

    const bonusEmojiIndex = bonusGameCount % bonusGameEmojis.length;
    easyGameTarget.textContent = bonusGameEmojis[bonusEmojiIndex];

    let timeLeftForEasyGame = EASY_GAME_TIME_LIMIT;
    clearInterval(easyGameTimerInterval);
    easyGameTimerInterval = setInterval(() => {
        timeLeftForEasyGame--;
        easyGameTimeDisplay.textContent = timeLeftForEasyGame;
        if (timeLeftForEasyGame <= 0) {
            clearInterval(easyGameTimerInterval);
            endBonusGame(false);
        }
    }, 1000);
}

function handleEasyGameClick() {
    easyGameScore++;
    easyGameClicksDisplay.textContent = easyGameScore;
    if (easyGameScore >= EASY_GAME_CLICKS_NEEDED) {
        clearInterval(easyGameTimerInterval);
        endBonusGame(true);
    }
}

function endBonusGame(success) {
    clearInterval(easyGameTimerInterval);
    easyGameBoard.style.display = 'none';

    bonusGameCount++;

    cardGrid.style.display = 'grid';
    startButton.style.display = 'block';

    if (success) {
        gameOverTitle.textContent = `Bonus Complete! You clicked ${EASY_GAME_CLICKS_NEEDED} times!`;
        nextLevelButton.textContent = "Continue to Next Level";
        nextLevelButton.onclick = () => {
            currentLevelIndex++;
            startMemoryMatchGame();
        };
    } else {
        gameOverTitle.textContent = "Bonus Failed! Try Again?";
        bonusGameCount--;
        nextLevelButton.textContent = "Retry Bonus Game";
        nextLevelButton.onclick = startBonusGame;
    }
    gameOverMessage.classList.add('active');
}

// Picture Puzzle Game

function createPuzzleTiles(state) {
    puzzleGrid.innerHTML = '';
    state.forEach((value, index) => {
        const tile = document.createElement('div');
        tile.classList.add('puzzle-tile');
        if (value === 0) {
            tile.classList.add('empty');
        } else {
            tile.textContent = value;
            tile.dataset.index = index;
            tile.addEventListener('click', handlePuzzleTileClick);
        }
        puzzleGrid.appendChild(tile);
    });
}

function shufflePuzzle() {
    let shuffled = [...SOLVED_PUZZLE_STATE];
    let emptyIndex = shuffled.indexOf(0);

    for (let i = 0; i < 100; i++) {
        const possibleMoves = [];
        const row = Math.floor(emptyIndex / 3);
        const col = emptyIndex % 3;

        if (row > 0) possibleMoves.push(emptyIndex - 3);
        if (row < 2) possibleMoves.push(emptyIndex + 3);
        if (col > 0) possibleMoves.push(emptyIndex - 1);
        if (col < 2) possibleMoves.push(emptyIndex + 1);

        const moveToIndex = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        [shuffled[emptyIndex], shuffled[moveToIndex]] = [shuffled[moveToIndex], shuffled[emptyIndex]];
        emptyIndex = moveToIndex;
    }
    return shuffled;
}

function handlePuzzleTileClick(event) {
    const clickedTileIndex = parseInt(event.target.dataset.index);
    const emptyTileIndex = puzzleBoardState.indexOf(0);

    const rowClicked = Math.floor(clickedTileIndex / 3);
    const colClicked = clickedTileIndex % 3;
    const rowEmpty = Math.floor(emptyTileIndex / 3);
    const colEmpty = emptyTileIndex % 3;

    const isAdjacent = (Math.abs(rowClicked - rowEmpty) === 1 && colClicked === colEmpty) ||
                       (Math.abs(colClicked - colEmpty) === 1 && rowClicked === rowEmpty);

    if (isAdjacent) {
        [puzzleBoardState[clickedTileIndex], puzzleBoardState[emptyTileIndex]] =
            [puzzleBoardState[emptyTileIndex], puzzleBoardState[clickedTileIndex]];

        puzzleMoves++;
        puzzleMovesDisplay.textContent = puzzleMoves;
        createPuzzleTiles(puzzleBoardState);

        if (checkPuzzleWin()) {
            endPicturePuzzleGame(true);
        }
    }
}

function checkPuzzleWin() {
    for (let i = 0; i < SOLVED_PUZZLE_STATE.length; i++) {
        if (puzzleBoardState[i] !== SOLVED_PUZZLE_STATE[i]) {
            return false;
        }
    }
    return true;
}

function startPicturePuzzleGame() {
    cardGrid.style.display = 'none';
    startButton.style.display = 'none';
    gameOverMessage.classList.remove('active');
    easyGameBoard.style.display = 'none';

    picturePuzzleBoard.style.display = 'flex';
    puzzleMoves = 0;
    puzzleTime = 0;
    puzzleMovesDisplay.textContent = puzzleMoves;
    puzzleTimeDisplay.textContent = '0s';

    puzzleBoardState = shufflePuzzle();
    createPuzzleTiles(puzzleBoardState);

    clearInterval(puzzleTimerInterval);
    puzzleTimerInterval = setInterval(() => {
        puzzleTime++;
        puzzleTimeDisplay.textContent = `${puzzleTime}s`;
    }, 1000);
}

function endPicturePuzzleGame(success) {
    clearInterval(puzzleTimerInterval);
    picturePuzzleBoard.style.display = 'none';

    bonusGameCount++;

    cardGrid.style.display = 'grid';
    startButton.style.display = 'block';

    if (success) {
        gameOverTitle.textContent = `Puzzle Solved! Moves: ${puzzleMoves}, Time: ${puzzleTime}s`;
        nextLevelButton.textContent = "Continue to Next Level";
        nextLevelButton.onclick = () => {
            currentLevelIndex++;
            startMemoryMatchGame();
        };
    } else {
        gameOverTitle.textContent = "Puzzle Not Solved! Try Again?";
        bonusGameCount--;
        nextLevelButton.textContent = "Retry Puzzle";
        nextLevelButton.onclick = startPicturePuzzleGame;
    }
    gameOverMessage.classList.add('active');
}

// Event Listeners and Initial Setup
startButton.addEventListener('click', startMemoryMatchGame);

document.addEventListener('DOMContentLoaded', () => {
    easyGameBoard = document.getElementById('easy-game-board');
    easyGameClicksDisplay = document.getElementById('easy-clicks');
    easyGameTimeDisplay = document.getElementById('easy-time');
    easyGameTarget = document.getElementById('easy-target');
    clicksNeededDisplay = document.getElementById('clicks-needed-display');

    if (easyGameTarget) {
        easyGameTarget.addEventListener('click', handleEasyGameClick);
    }

    picturePuzzleBoard = document.getElementById('picture-puzzle-board');
    puzzleGrid = document.getElementById('puzzle-grid');
    puzzleMovesDisplay = document.getElementById('puzzle-moves');
    puzzleTimeDisplay = document.getElementById('puzzle-time');

    initializeMemoryMatchGame();
});
