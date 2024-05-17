import React from 'react'
import Die from './components/Die'
import { nanoid } from 'nanoid'
import Confetti from 'react-confetti'
import './styles/style.css'

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
	const [displayMenu, setDisplayMenu] = React.useState(false)
	const [currentTheme, setCurrentTheme] = React.useState('Black & White')

	const themeColors = {
		'Black & Yellow': '#FFEB3B',
		'Black & Red': '#F44336',
		'Black & Green': '#98fb98',
		'Black & White': '#98fb98',
	}

	const currentThemeColor = themeColors[currentTheme]

	// Win condition
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

	// Setting timer to be 30 when a new game starts
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
		} else if (timer === 0) {
			clearInterval(timerInterval)
			setGameState(false)
			alert('You Lose, Try again!')
		}
		return () => clearInterval(timerInterval)
	}, [gameState, timer, tenzies])

	// Dynamically loading theme CSS
	React.useEffect(() => {
		const link = document.createElement('link')
		link.rel = 'stylesheet'
		link.type = 'text/css'
		link.href = getThemeCSSFile(currentTheme)

		document.head.appendChild(link)

		// Clean up previous theme
		return () => {
			document.head.removeChild(link)
		}
	}, [currentTheme])

	// Function to get the CSS file path based on the theme
	const getThemeCSSFile = (theme) => {
		switch (theme) {
			case 'Black & Yellow':
				return './styles/black-and-yellow-theme.css'
			case 'Black & Red':
				return './styles/black-and-red-theme.css'
			case 'Black & Green':
				return './styles/black-and-green-theme.css'
			case 'Black & White':
				return './styles/black-and-white-theme.css'
			default:
				return './styles/style.css'
		}
	}

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
		setDice(allNewDice())
		setGameState(true)
		setRolls(0)
		setTenzies(false)
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

	// Displaying Theme Menu
	function showMenu() {
		if (!displayMenu) {
			setDisplayMenu(true)
		} else {
			return setDisplayMenu(false)
		}
	}

	// Shows Active Theme
	function activeTheme(theme) {
		setCurrentTheme(theme)
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
			themeColor={currentThemeColor}
		/>
	))

	return (
		<main>
			{tenzies && <Confetti />}
			<div className="dropdown" onClick={showMenu}>
				<div className="select">
					<span className="selected">{currentTheme}</span>
					<div className="caret"></div>
				</div>
				{displayMenu && (
					<ul className="menu">
						<li
							className={currentTheme === 'Black & Red' ? 'active' : ''}
							onClick={() => activeTheme('Black & Red')}
						>
							Black & Red
						</li>
						<li
							className={currentTheme === 'Black & Green' ? 'active' : ''}
							onClick={() => activeTheme('Black & Green')}
						>
							Black & Green
						</li>
						<li
							className={currentTheme === 'Black & White' ? 'active' : ''}
							onClick={() => activeTheme('Black & White')}
						>
							Black & White
						</li>
						<li
							className={currentTheme === 'Black & Yellow' ? 'active' : ''}
							onClick={() => activeTheme('Black & Yellow')}
						>
							Black & Yellow
						</li>
					</ul>
				)}
			</div>
			<h1 className="title">Tenzies</h1>
			<p className="instructions">
				Roll until all dice are the same. Click a dice to freeze it at its
				current value between rolls.
			</p>
			{gameState && <h3>Time left: {timer} seconds</h3>}
			<h2 className="highScore">
				High Score:{' '}
				<span className="highscore-num">
					{highScore === Infinity ? '-' : highScore}
				</span>
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
