
const gameBoard = document.querySelector('#game-board .grid');
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const startButton = document.getElementById('startButton');
const gameOverModal = document.getElementById('gameOverModal');
const finalScoreEl = document.getElementById('finalScore');
const playAgainButton = document.getElementById('playAgainButton');


let score = 0;
let timeLeft = 30;
let gameTimerId = null;
let moleTimerId = null;
let lastHole;
let isGameActive = false;
const holeCount = 9;


const bonkSound = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.1 }
}).toDestination();

const gameOverSound = new Tone.Player({
    url: "https://tonejs.github.io/audio/berklee/gong_1.mp3",
    loop: false,
    autostart: false,
}).toDestination();
gameOverSound.volume.value = -10;



function createGameBoard() {
    gameBoard.innerHTML = ''; 
    for (let i = 0; i < holeCount; i++) {
        const hole = document.createElement('div');
        hole.classList.add('hole');
        
        const mole = document.createElement('div');
        mole.classList.add('mole');
        mole.dataset.index = i;
        
        hole.appendChild(mole);
        gameBoard.appendChild(hole);
    }
}


function randomHole() {
    const holes = document.querySelectorAll('.hole');
    const idx = Math.floor(Math.random() * holes.length);
    const hole = holes[idx];
    if (hole === lastHole) {
        return randomHole();
    }
    lastHole = hole;
    return hole;
}

function peep() {
    if (!isGameActive) return;

    const time = Math.random() * 800 + 600; 
    const hole = randomHole();
    const mole = hole.querySelector('.mole');
    
    mole.classList.add('up');
    
    
    moleTimerId = setTimeout(() => {
        mole.classList.remove('up');
        if (isGameActive) {
            peep();
        }
    }, time);
}

function startGame() {
    if (isGameActive) return;
    
    isGameActive = true;
    score = 0;
    timeLeft = 30;
    scoreEl.textContent = score;
    timerEl.textContent = timeLeft;
    startButton.disabled = true;

    gameOverModal.classList.add('hidden');
    gameOverModal.querySelector('div').classList.remove('scale-100');

    gameTimerId = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);

    peep();
}

function endGame() {
    isGameActive = false;
    clearInterval(gameTimerId);
    clearTimeout(moleTimerId); 
    startButton.disabled = false;
    
    document.querySelectorAll('.mole.up').forEach(mole => mole.classList.remove('up'));

    finalScoreEl.textContent = score;
    gameOverModal.classList.remove('hidden');
    setTimeout(() => {
         gameOverModal.querySelector('div').classList.add('scale-100');
    }, 50);
    
    Tone.context.resume().then(() => {
        gameOverSound.start();
    });
}

function bonk(e) {
    if (!e.isTrusted || !isGameActive) return; 
    
    const mole = e.target;
    if (mole.classList.contains('mole') && mole.classList.contains('up')) {
        score++;
        scoreEl.textContent = score;
        
        bonkSound.triggerAttackRelease('C5', '8n');
        mole.classList.add('bonked');
        setTimeout(() => mole.classList.remove('bonked'), 500);

        mole.classList.remove('up');
    }
}


startButton.addEventListener('click', startGame);
playAgainButton.addEventListener('click', startGame);
gameBoard.addEventListener('click', bonk);

window.onload = () => {
    createGameBoard();
};
