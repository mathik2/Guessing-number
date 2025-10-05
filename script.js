(function () {
    /**
     * Game state
     */
    const elements = {
        playerName: document.getElementById('playerName'),
        difficulty: document.getElementById('difficulty'),
        hints: document.getElementById('hints'),
        startBtn: document.getElementById('startBtn'),
        rangeText: document.getElementById('rangeText'),
        attemptsText: document.getElementById('attemptsText'),
        guessInput: document.getElementById('guessInput'),
        guessBtn: document.getElementById('guessBtn'),
        feedback: document.getElementById('feedback'),
        historyList: document.getElementById('historyList'),
        newRoundBtn: document.getElementById('newRoundBtn'),
        resetBtn: document.getElementById('resetBtn'),
        scorePlayer: document.getElementById('scorePlayer'),
        scoreDifficulty: document.getElementById('scoreDifficulty'),
        scoreBest: document.getElementById('scoreBest'),
    };

    const difficultyConfig = {
        easy: { max: 50, attempts: 12 },
        medium: { max: 100, attempts: 10 },
        hard: { max: 500, attempts: 12 },
    };

    /**
     * Persistent high scores by difficulty
     */
    const HIGH_SCORE_KEY = 'guess-game:highscores:v1';
    function loadHighScores() {
        try { return JSON.parse(localStorage.getItem(HIGH_SCORE_KEY)) || {}; } catch { return {}; }
    }
    function saveHighScores(scores) {
        localStorage.setItem(HIGH_SCORE_KEY, JSON.stringify(scores));
    }

    let state = createInitialState('medium');

    function createInitialState(difficulty) {
        const cfg = difficultyConfig[difficulty];
        return {
            difficulty,
            secret: Math.floor(Math.random() * cfg.max) + 1,
            attemptsLeft: cfg.attempts,
            max: cfg.max,
            started: false,
            finished: false,
            guesses: [],
        };
    }

    function setText(el, text) { el.textContent = text; }
    function setFeedback(text, type) {
        elements.feedback.className = 'feedback' + (type ? ` feedback--${type}` : '');
        elements.feedback.textContent = text;
    }
    function enablePlay(enabled) {
        elements.guessInput.disabled = !enabled;
        elements.guessBtn.disabled = !enabled;
        elements.newRoundBtn.disabled = enabled; // new round only when finished
    }
    function updateRangeAndAttempts() {
        setText(elements.rangeText, `Range: 1–${state.max}`);
        setText(elements.attemptsText, `Attempts left: ${state.attemptsLeft}`);
    }
    function resetHistory() {
        elements.historyList.innerHTML = '';
    }
    function appendHistory(guess) {
        const li = document.createElement('li');
        li.textContent = String(guess);
        elements.historyList.appendChild(li);
    }

    function startGame() {
        const name = elements.playerName.value.trim() || 'Player';
        const diff = elements.difficulty.value;
        state = createInitialState(diff);
        state.started = true;
        resetHistory();
        elements.guessInput.value = '';
        updateRangeAndAttempts();
        setFeedback(`Good luck, ${name}!`, 'warning');
        enablePlay(true);
        elements.guessInput.focus();
    }

    function evaluateGuess() {
        if (!state.started || state.finished) return;
        const raw = elements.guessInput.value;
        const guess = Number(raw);
        if (!Number.isFinite(guess) || guess < 1 || guess > state.max) {
            setFeedback(`Please enter a number between 1 and ${state.max}.`, 'danger');
            return;
        }
        state.guesses.push(guess);
        appendHistory(guess);
        state.attemptsLeft -= 1;
        updateRangeAndAttempts();

        if (guess === state.secret) {
            winRound();
            return;
        }

        if (state.attemptsLeft <= 0) {
            loseRound();
            return;
        }

        if (elements.hints.checked) {
            const direction = guess < state.secret ? 'Higher' : 'Lower';
            const distance = Math.abs(guess - state.secret);
            const proximity = distance <= Math.ceil(state.max * 0.02) ? '🔥 Hot' :
                              distance <= Math.ceil(state.max * 0.06) ? '🌡️ Warm' : '❄️ Cold';
            setFeedback(`${direction}! ${proximity}.`, 'warning');
        } else {
            setFeedback('Try again!', 'warning');
        }
        elements.guessInput.value = '';
        elements.guessInput.focus();
    }

    function winRound() {
        state.finished = true;
        enablePlay(false);
        setFeedback(`Correct! The number was ${state.secret}.`, 'success');
        elements.newRoundBtn.disabled = false;
        maybeUpdateHighScore();
    }

    function loseRound() {
        state.finished = true;
        enablePlay(false);
        setFeedback(`Out of attempts. The number was ${state.secret}.`, 'danger');
        elements.newRoundBtn.disabled = false;
    }

    function maybeUpdateHighScore() {
        const name = elements.playerName.value.trim() || 'Player';
        const scores = loadHighScores();
        const attemptsUsed = state.guesses.length;
        const existing = scores[state.difficulty];
        if (!existing || attemptsUsed < existing.bestAttempts) {
            scores[state.difficulty] = { player: name, bestAttempts: attemptsUsed };
            saveHighScores(scores);
            renderHighScore();
        }
    }

    function renderHighScore() {
        const scores = loadHighScores();
        const diff = elements.difficulty.value;
        const s = scores[diff];
        elements.scorePlayer.textContent = s ? s.player : '—';
        elements.scoreDifficulty.textContent = diff.charAt(0).toUpperCase() + diff.slice(1);
        elements.scoreBest.textContent = s ? String(s.bestAttempts) : '—';
    }

    function newRound() {
        const diff = state.difficulty; // keep same difficulty
        state = createInitialState(diff);
        state.started = true;
        resetHistory();
        elements.guessInput.value = '';
        updateRangeAndAttempts();
        setFeedback('New round started. You got this!', 'warning');
        enablePlay(true);
        elements.guessInput.focus();
    }

    function resetGame() {
        state = createInitialState(elements.difficulty.value);
        state.started = false;
        state.finished = false;
        elements.guessInput.value = '';
        resetHistory();
        updateRangeAndAttempts();
        setFeedback('Game reset.', undefined);
        enablePlay(false);
    }

    // Event listeners
    elements.startBtn.addEventListener('click', () => {
        startGame();
        renderHighScore();
    });
    elements.guessBtn.addEventListener('click', evaluateGuess);
    elements.guessInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') evaluateGuess();
    });
    elements.newRoundBtn.addEventListener('click', newRound);
    elements.resetBtn.addEventListener('click', resetGame);
    elements.difficulty.addEventListener('change', () => {
        const diff = elements.difficulty.value;
        const cfg = difficultyConfig[diff];
        state.max = cfg.max;
        state.attemptsLeft = cfg.attempts;
        updateRangeAndAttempts();
        renderHighScore();
        setFeedback(`Difficulty set to ${diff}.`, undefined);
    });

    // Initial render
    updateRangeAndAttempts();
    renderHighScore();
})();


