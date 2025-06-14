import React, { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [playerName, setPlayerName] = useState('')
  const [gameStarted, setGameStarted] = useState(false)
  const [dice, setDice] = useState(generateAllNewDice())
  const [tenzies, setTenzies] = useState(false)
  const [rollCount, setRollCount] = useState(0)
  const [currentTheme, setCurrentTheme] = useState(0)
  const [time, setTime] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const [scoreSaved, setScoreSaved] = useState(false)
  const [buttonPosition, setButtonPosition] = useState(0)
  const [scores, setScores] = useState(() => {
    const savedScores = localStorage.getItem('tenzies-scores')
    return savedScores ? JSON.parse(savedScores) : []
  })

  const themes = [
    'theme-purple',
    'theme-ocean',
    'theme-sunset',
    'theme-forest',
    'theme-galaxy',
    'theme-fire',
    'theme-ice'
  ]

  const positions = [
    'top-right',
    'top-left',
    'bottom-left',
    'bottom-right',
    
  ]

  useEffect(() => {
    const allHeld = dice.every(die => die.isHeld)
    const firstValue = dice[0].value
    const allSameValue = dice.every(die => die.value === firstValue)
    if (allHeld && allSameValue && !tenzies) {
      setTenzies(true)
      setTimerActive(false)
      setScoreSaved(false)
    }
  }, [dice, tenzies])

  useEffect(() => {
    if (tenzies && !scoreSaved && playerName && rollCount > 0) {
      const newScore = {
        id: Date.now(),
        name: playerName,
        rolls: rollCount,
        time: time,
        date: new Date().toLocaleDateString()
      }
      
      setScores(prevScores => {
        const updatedScores = [...prevScores, newScore]
          .sort((a, b) => {
            // Sort by rolls first, then by time
            if (a.rolls !== b.rolls) return a.rolls - b.rolls
            return a.time - b.time
          })
          .slice(0, 10) // Keep only top 10 scores
        
        localStorage.setItem('tenzies-scores', JSON.stringify(updatedScores))
        return updatedScores
      })
      
      setScoreSaved(true)
    }
  }, [tenzies, scoreSaved, playerName, rollCount, time])

  useEffect(() => {
    let interval = null
    if (timerActive) {
      interval = setInterval(() => {
        setTime(time => time + 1)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timerActive])

  function generateNewDie() {
    return {
      value: Math.ceil(Math.random() * 6),
      isHeld: false,
      id: crypto.randomUUID()
    }
  }

  function generateAllNewDice() {
    const newDice = []
    for (let i = 0; i < 10; i++) {
      newDice.push(generateNewDie())
    }
    return newDice
  }

  function rollDice() {
    if (!tenzies) {
      if (rollCount === 0) {
        setTimerActive(true)
      }
      setDice(oldDice => oldDice.map(die => {
        return die.isHeld ? die : generateNewDie()
      }))
      setRollCount(prevCount => prevCount + 1)
    } else {
      setTenzies(false)
      setDice(generateAllNewDice())
      setRollCount(0)
      setTime(0)
      setTimerActive(false)
      setScoreSaved(false)
    }
  }

  function holdDice(id) {
    setDice(oldDice => oldDice.map(die => {
      return die.id === id ? { ...die, isHeld: !die.isHeld } : die
    }))
  }

  function handleNameSubmit(e) {
    e.preventDefault()
    if (playerName.trim()) {
      setGameStarted(true)
    }
  }

  function changeBalloonTheme() {
    setCurrentTheme(prevTheme => (prevTheme + 1) % themes.length)
    setButtonPosition(prevPos => (prevPos + 1) % positions.length)
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const diceElements = dice.map(die => (
    <div 
      key={die.id} 
      className={`die ${die.isHeld ? 'held' : ''}`}
      onClick={() => holdDice(die.id)}
    >
      {die.value}
    </div>
  ))

  const PartyEffect = () => (
    <div className="party-container">
      {/* Main explosion burst */}
      {[...Array(30)].map((_, i) => (
        <div key={`burst-${i}`} className={`party-burst burst-${i % 6}`}></div>
      ))}
      
      {/* Firework explosions */}
      {[...Array(15)].map((_, i) => (
        <div key={`firework-${i}`} className={`firework firework-${i % 5}`}>
          {[...Array(8)].map((_, j) => (
            <div key={j} className={`spark spark-${j}`}></div>
          ))}
        </div>
      ))}
      
      {/* Falling confetti */}
      {[...Array(40)].map((_, i) => (
        <div key={`confetti-${i}`} className={`confetti confetti-${i % 7}`}></div>
      ))}
      
      {/* Sparkles */}
      {[...Array(25)].map((_, i) => (
        <div key={`sparkle-${i}`} className={`sparkle sparkle-${i % 4}`}></div>
      ))}
    </div>
  )

  const Scoreboard = () => (
    <div className="scoreboard">
      <h2 className="scoreboard-title">🏆 High Scores</h2>
      {scores.length === 0 ? (
        <p className="no-scores">No scores yet!</p>
      ) : (
        <div className="scores-list">
          {scores.map((score, index) => (
            <div key={score.id} className="score-item">
              <div className="score-rank">#{index + 1}</div>
              <div className="score-details">
                <div className="score-name">{score.name}</div>
                <div className="score-stats">
                  {score.rolls} rolls • {formatTime(score.time)}
                </div>
                <div className="score-date">{score.date}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <main className={`app ${themes[currentTheme]}`}>
      {tenzies && <PartyEffect />}
      
      <button className={`theme-button ${themes[currentTheme]}-button ${positions[buttonPosition]}`} onClick={changeBalloonTheme}>
        <div className="theme-button-inner"></div>
      </button>

      <div className="app-layout">
        <div className="game-section">
          {!gameStarted ? (
            <div className="game-container">
              <h1 className="title">Tenzies</h1>
              <p className="instructions">
                Welcome to Tenzies! Enter your name to start playing.
              </p>
              <form onSubmit={handleNameSubmit} className="name-form">
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  className="name-input"
                  maxLength={20}
                />
                <button type="submit" className="start-button">
                  Start Game
                </button>
              </form>
            </div>
          ) : (
            <div className="game-container">
              <h1 className="title">Tenzies</h1>
              <p className="player-name">Good luck, {playerName}!</p>
              <p className="instructions">
                Roll until all dice are the same. Click each die to freeze it at its current value between rolls.
              </p>
              <div className="stats">
                <p>Rolls: {rollCount}</p>
                <p>Time: {formatTime(time)}</p>
              </div>
              <div className="dice-container">
                {diceElements}
              </div>
              <button 
                className="roll-button" 
                onClick={rollDice}
              >
                {tenzies ? 'New Game' : 'Roll'}
              </button>
              {tenzies && (
                <div className="win-message">
                  🎉 {playerName}, you won in {rollCount} rolls and {formatTime(time)}! 🎉
                </div>
              )}
            </div>
          )}
        </div>
        
        <Scoreboard />
      </div>
    </main>
  )
}

export default App
