'use client'

import { useState, useEffect, useCallback } from 'react'

const ALPHABET = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ".split("")

export default function Home() {
  // Game State
  const [word, setWord] = useState("")
  const [guessedLetters, setGuessedLetters] = useState<string[]>([])
  const [maxErrors, setMaxErrors] = useState(6)
  const [difficulty, setDifficulty] = useState("MEDIUM")
  const [mistakes, setMistakes] = useState(0)
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing')
  const [customImage, setCustomImage] = useState<string | null>(null)
  const [scores, setScores] = useState({ won: 0, lost: 0 })
  const [showSettings, setShowSettings] = useState(true)
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')

  // Theme logic
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.setAttribute('data-theme', systemTheme)
    } else {
      root.setAttribute('data-theme', theme)
    }
  }, [theme])

  // Load scores
  useEffect(() => {
    const saved = localStorage.getItem('hangman-scores')
    if (saved) setScores(JSON.parse(saved))
  }, [])

  // Fetch new word
  const startNewGame = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/word?difficulty=${difficulty}`)
      const data = await res.json()
      setWord(data.word.toUpperCase())
      setGuessedLetters([])
      setMistakes(0)
      setStatus('playing')
      setShowSettings(false)
    } catch (err) {
      console.error("Failed to fetch word. Is the backend running?", err)
      // Fallback for demo
      setWord("ADAMASMACA")
      setGuessedLetters([])
      setMistakes(0)
      setStatus('playing')
      setShowSettings(false)
    }
  }, [difficulty])

  // Handle guess
  const handleGuess = useCallback((letter: string) => {
    if (status !== 'playing' || guessedLetters.includes(letter)) return

    const newGuessed = [...guessedLetters, letter]
    setGuessedLetters(newGuessed)

    if (!word.includes(letter)) {
      const newMistakes = mistakes + 1
      setMistakes(newMistakes)
      if (newMistakes >= maxErrors) {
        setStatus('lost')
        const newScores = { ...scores, lost: scores.lost + 1 }
        setScores(newScores)
        localStorage.setItem('hangman-scores', JSON.stringify(newScores))
      }
    } else {
      // Check win
      const isWin = word.split('').every(l => newGuessed.includes(l))
      if (isWin) {
        setStatus('won')
        const newScores = { ...scores, won: scores.won + 1 }
        setScores(newScores)
        localStorage.setItem('hangman-scores', JSON.stringify(newScores))
      }
    }
  }, [guessedLetters, word, status, mistakes, maxErrors, scores])

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase()
      if (ALPHABET.includes(key)) {
        handleGuess(key)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleGuess])

  // PNG Reveal percentage
  const revealPercent = Math.min((mistakes / maxErrors) * 100, 100)

  return (
    <div className="container">
      <header style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>ADAM ASMACA</h1>
        <button className="button" onClick={() => setShowSettings(true)}>Settings</button>
      </header>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div className="gallows-container">
          {customImage ? (
            <>
              <img src={customImage} className="custom-image" alt="Hangman" />
              <div 
                className="mask-container" 
                style={{ transform: `scaleY(${1 - revealPercent / 100})` }}
              />
            </>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              Default Man: {mistakes} / {maxErrors}
              {/* Here we could put an SVG hangman but user asked for PNG support specifically */}
              <div style={{ fontSize: '4rem' }}>
                {mistakes >= 1 && 'O'}<br/>
                {mistakes >= 2 && '/'}{mistakes >= 3 && '|'}{mistakes >= 4 && '\\'}<br/>
                {mistakes >= 5 && '/'}{mistakes >= 6 && ' \\'}
              </div>
            </div>
          )}
        </div>

        <div style={{ flex: 1, minWidth: '300px' }}>
          <div className="word-display">
            {word.split('').map((char, i) => (
              <div key={i} className="letter-slot">
                {guessedLetters.includes(char) ? char : ''}
              </div>
            ))}
          </div>

          <div style={{ margin: '2rem 0', color: 'var(--text-muted)' }}>
            Hata Payı: {mistakes} / {maxErrors} | Skor: {scores.won}W - {scores.lost}L
          </div>

          {status !== 'playing' && (
            <div style={{ marginBottom: '1rem', color: status === 'won' ? 'var(--success)' : 'var(--error)' }}>
              <h2>{status === 'won' ? 'Tebrikler!' : `Oyunu Kaybettin! Kelime: ${word}`}</h2>
              <button className="button" onClick={startNewGame}>Tekrar Oyna</button>
            </div>
          )}

          <div className="keyboard">
            {ALPHABET.map(letter => (
              <button 
                key={letter} 
                className={`key ${guessedLetters.includes(letter) ? 'used' : ''}`}
                onClick={() => handleGuess(letter)}
                disabled={guessedLetters.includes(letter) || status !== 'playing'}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {showSettings && (
        <div className="settings-overlay">
          <div className="settings-modal">
            <h2>Ayarlar</h2>
            
            <label>Zorluk:</label>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option value="EASY">Kolay (3-5 Harf)</option>
              <option value="MEDIUM">Orta (6-8 Harf)</option>
              <option value="HARD">Zor (9+ Harf)</option>
            </select>

            <label>Hata Hakkı:</label>
            <input 
              type="number" 
              value={maxErrors} 
              onChange={(e) => setMaxErrors(Number(e.target.value))} 
              min="1" max="26"
            />

            <label>Tema:</label>
            <select value={theme} onChange={(e) => setTheme(e.target.value as any)}>
              <option value="light">Açık</option>
              <option value="dark">Koyu</option>
              <option value="system">Sistem</option>
            </select>

            <label>Özel PNG (İsteğe bağlı):</label>
            <input 
              type="file" 
              accept="image/png" 
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  const reader = new FileReader()
                  reader.onload = (ev) => setCustomImage(ev.target?.result as string)
                  reader.readAsDataURL(file)
                }
              }}
            />

            <button className="button" onClick={startNewGame}>Oyunu Başlat</button>
          </div>
        </div>
      )}
    </div>
  )
}
