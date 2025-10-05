# Guess the Number (Enhanced)

Modern, responsive number guessing game with multiple difficulties, hints, attempts counter, guess history, and local high scores.

## Features
- Difficulty levels: Easy (1–50), Medium (1–100), Hard (1–500)
- Optional hints: Higher/Lower plus Hot/Warm/Cold proximity
- Attempts counter and guess history chips
- Local high score per difficulty (player name and best attempts)
- Keyboard-friendly (Enter to submit), mobile-friendly UI

## Getting Started
1. Open `index.html` in your browser.
2. Enter your name, choose a difficulty, and click Start Game.
3. Type your guess and press Guess (or Enter).
4. Use New Round to play again with the same difficulty, or Reset Game to start fresh.

## Files
- `index.html` – App layout and structure
- `styles.css` – Modern responsive theme
- `script.js` – Game logic and high score persistence

## Notes
- High scores are stored in `localStorage` and are scoped per difficulty.
- If hints are off, you will only see a generic prompt to try again.

