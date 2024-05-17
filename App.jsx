import React from 'react'
import Die from './Die'
import { nanoid } from 'nanoid'
import Confetti from 'react-confetti'

export default function App() {
	const [dice, setDice] = React.useState(allNewDice())
	const [tenzies, setTenzies] = React.useState(false)
	const [rolls, setRolls] = React.useState(0)
	const [highScore, setHighScore] = React.useState(() => {
		const storedHighScore = localStorage.getItem('highScore')
		return storedHighScore ? Number(storedHighScore) : Infinity
	})
	const [gameState, setGameState] = React.useState(false)
	const [timer, setTimer] = React.useState(30)

	// Win condition might not need this
	React.useEffect(() => {
		const allHeld = dice.every((die) => die.isHeld)
		const firstValue = dice[0].value
		const allSameValue = dice.every((die) => die.value === firstValue)
		if (allHeld && allSameValue) {
			setTenzies(true)
			updateHighScore()
			setGameState(false)
		}
	}, [dice])
	//const firstValue = dice[0].value
	//const allSameValue = dice.every((die) => die.value === firstValue)

	// Setting timer to be 60 when a new game starts
	React.useEffect(() => {
		if (gameState) {
			setTimer(30)
		}
	}, [gameState])

	// Timer logic
	React.useEffect(() => {
		let timerInterval
		if (gameState && timer > 0) {
			timerInterval = setInterval(() => {
				setTimer((prevTimer) => prevTimer - 1)
			}, 1000)
		} else if (tenzies) {
			clearInterval(timerInterval)
			alert('You win!, Click Start Game to start a new game')
		} else if (timer === 0) {
			clearInterval(timerInterval)
			setGameState(false)
			alert('You Lose, Try again!')
		}
		return () => clearInterval(timerInterval)
	}, [gameState, timer, tenzies])

	// Roll new dice if not held
	function generateNewDice() {
		return { value: Math.ceil(Math.random() * 6), isHeld: false, id: nanoid() }
	}

	// function to make all new dice
	function allNewDice() {
		const newDice = []
		for (let i = 0; i < 10; i++) {
			newDice.push(generateNewDice())
		}
		return newDice
	}

	// Reset game function saved in var
	const resetGame = () => {
		setDice(allNewDice())
		setTenzies(false)
		setRolls(0)
		setGameState(false)
	}

	// Reset high score function saved in var
	const resetHighScore = () => {
		setHighScore(Infinity)
		localStorage.removeItem('highScore')
	}

	// Function to start the game
	function startGame() {
		setGameState(true)
		setRolls(0)
		setTenzies(false)
		console.log('game has started')
	}

	// Roll dice function and resets the game
	function rollDice() {
		if (!tenzies) {
			setDice((oldDice) =>
				oldDice.map((die) => {
					return die.isHeld ? die : generateNewDice()
				})
			)
			setRolls(rolls + 1)
		} else {
			resetGame()
		}
	}

	// Hold dice function
	function holdDice(id) {
		setDice((oldDice) =>
			oldDice.map((die) => {
				return die.id === id ? { ...die, isHeld: !die.isHeld } : die
			})
		)
	}

	// Updates the high score in localstorage
	function updateHighScore() {
		if (rolls < highScore) {
			setHighScore(rolls)
			localStorage.setItem('highScore', rolls)
		}
	}

	// Var that sets the die component elements
	const diceElements = dice.map((die) => (
		<Die
			key={die.id}
			value={die.value}
			isHeld={die.isHeld}
			holdDice={() => holdDice(die.id)}
		/>
	))

	return (
		<main>
			{tenzies && <Confetti />}
			<h1 className="title">Tenzies</h1>
			{<h3></h3>}
			<p className="instructions">
				Roll until all dice are the same. Click each die to freeze it at its
				current value between rolls.
			</p>
			{gameState && <h3>Time left: {timer} seconds</h3>}
			<h2 className="highScore">
				High Score: {highScore === Infinity ? '-' : highScore}
			</h2>
			<p className="rolls">Rolls: {rolls}</p>
			<div className="dice-container">{diceElements}</div>
			<div className="buttons-container">
				<button className="resetGame" onClick={resetGame}>
					Reset Game
				</button>
				{gameState === false && (
					<button className="start-game" onClick={startGame}>
						Start Game
					</button>
				)}
				{gameState && (
					<button className="roll-dice" onClick={rollDice}>
						{tenzies ? 'New Game' : 'Roll'}
					</button>
				)}
				<button className="resetHighScore" onClick={resetHighScore}>
					Reset HighScore
				</button>
			</div>
		</main>
	)
}
