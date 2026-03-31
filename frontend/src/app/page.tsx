'use client'

import { useState, useEffect, useCallback } from 'react'
import { SoundManager } from '@/utils/SoundManager'

const ALPHABET = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ".split("")

export default function Home() {
  // User/Economy State
  const [user, setUser] = useState<{name: string, gold: number, inventory: string[], unlockedAchievements?: string[]} | null>(null)
  
  // Game State
  const [word, setWord] = useState("")
  const [guessedLetters, setGuessedLetters] = useState<string[]>([])
  const [maxErrors, setMaxErrors] = useState(6)
  const [difficulty, setDifficulty] = useState("MEDIUM")
  const [mistakes, setMistakes] = useState(0)
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing')
  const [customImage, setCustomImage] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(true)
  const [showShop, setShowShop] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
  const [timeLeft, setTimeLeft] = useState(60)
  const [startTime, setStartTime] = useState(Date.now())
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [lastAchievement, setLastAchievement] = useState<string | null>(null)
  const [meaning, setMeaning] = useState("")

  // Hyper-Premium States
  const [category, setCategory] = useState('GENEL')
  const [showCategorySelect, setShowCategorySelect] = useState(true)
  const [isShaking, setIsShaking] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)

  // Load user (Mock for now since OAuth needs setup)
  useEffect(() => {
    const saved = localStorage.getItem('hangman-user')
    if (saved) setUser(JSON.parse(saved))
    else setUser({ name: "Misafir", gold: 100, inventory: [] })

    // Init Sound
    SoundManager.init()
    if (soundEnabled) SoundManager.startBGM()
    return () => SoundManager.stopBGM()
  }, [])

  useEffect(() => {
    SoundManager.toggle(soundEnabled)
  }, [soundEnabled])

  const saveUser = (updatedUser: any) => {
    setUser(updatedUser)
    localStorage.setItem('hangman-user', JSON.stringify(updatedUser))
  }

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

  // Fetch new word
  const startNewGame = useCallback(async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'
      const res = await fetch(`${API_URL}/api/word?difficulty=${difficulty}&category=${category}`)
      const data = await res.json()
      setWord(data.word.toUpperCase())
      setMeaning(data.meaning || "")
      setGuessedLetters([])
      setMistakes(0)
      setStatus('playing')
      setShowSettings(false)
      setShowCategorySelect(false)
      setShowConfetti(false)
      setStartTime(Date.now())
      setTimeLeft(difficulty === 'HARD' ? 30 : 60)
      SoundManager.play('click')
    } catch (err) {
      // Fallback
      setWord("ADAM ASMACA")
      setMeaning("Bir oyun adı.")
      setGuessedLetters([])
      setMistakes(0)
      setStatus('playing')
      setShowSettings(false)
      setShowCategorySelect(false)
      setShowConfetti(false)
      setStartTime(Date.now())
      setTimeLeft(difficulty === 'HARD' ? 30 : 60)
    }
  }, [difficulty, category])

  // Timer Effect
  useEffect(() => {
    if (status !== 'playing') return
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setStatus('lost')
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [status])

  const saveUserStats = useCallback(async (won: boolean) => {
    if (won) SoundManager.play('win')
    else SoundManager.play('lose')

    if (!user || user.name === "Misafir") {
        if (won) saveUser({ ...user, gold: (user?.gold || 0) + 30 })
        else saveUser({ ...user, gold: (user?.gold || 0) + 5 })
        return
    }

    const timeTaken = Math.floor((Date.now() - startTime) / 1000)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'
      const res = await fetch(`${API_URL}/api/user/update-stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          won,
          mistakes,
          timeInSeconds: timeTaken,
          wordLength: word.length,
          category
        })
      })
      const updatedUser = await res.json()
      saveUser(updatedUser)
      
      const oldLength = user.unlockedAchievements?.length || 0
      const newLength = updatedUser.unlockedAchievements?.length || 0
      if (newLength > oldLength) {
          const newAchievement = updatedUser.unlockedAchievements[newLength - 1]
          setLastAchievement(newAchievement)
          setTimeout(() => setLastAchievement(null), 5000)
      }
    } catch (e) {
      console.error("Stats update failed", e)
    }
  }, [user, startTime, mistakes, word.length, saveUser, category])

  const fetchLeaderboard = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'
      const res = await fetch(`${API_URL}/api/leaderboard`)
      const data = await res.json()
      setLeaderboard(data)
      setShowLeaderboard(true)
    } catch (e) {
      console.error(e)
    }
  }

  // Handle guess
  const handleGuess = useCallback((letter: string) => {
    if (status !== 'playing' || guessedLetters.includes(letter)) return

    const newGuessed = [...guessedLetters, letter]
    setGuessedLetters(newGuessed)

    if (!word.includes(letter)) {
      SoundManager.play('wrong')
      const newMistakes = mistakes + 1
      setMistakes(newMistakes)
      
      // Trigger Shake
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 500)

      if (newMistakes >= maxErrors) {
        setStatus('lost')
        saveUserStats(false)
      }
    } else {
      SoundManager.play('correct')
      const isWin = word.split('').filter((l: string) => l !== ' ').every((l: string) => newGuessed.includes(l))
      if (isWin) {
        setStatus('won')
        setShowConfetti(true)
        saveUserStats(true)
      }
    }
  }, [guessedLetters, word, status, mistakes, maxErrors, user, saveUserStats])

  // Power-ups
  const useHint = () => {
    if (!user || user.gold < 50 || status !== 'playing') return
    const remainingLetters = word.split('').filter((l: string) => l !== ' ' && !guessedLetters.includes(l))
    if (remainingLetters.length === 0) return
    const randomLetter = remainingLetters[Math.floor(Math.random() * remainingLetters.length)]
    handleGuess(randomLetter)
    saveUser({ ...user, gold: user.gold - 50 })
  }

  const buyExtraLife = () => {
    if (!user || user.gold < 100) return
    setMaxErrors((prev: number) => prev + 1)
    saveUser({ ...user, gold: user.gold - 100 })
  }

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSettings(false)
        setShowCategorySelect(false)
        setShowShop(false)
        setShowLeaderboard(false)
        setShowAchievements(false)
        return
      }
      
      // ENTER to restart
      if (e.key === 'Enter' && status !== 'playing') {
        startNewGame()
        return
      }

      const key = e.key.toUpperCase()
      if (ALPHABET.includes(key) && !showSettings && !showCategorySelect && !showShop && !showLeaderboard && !showAchievements) {
        handleGuess(key)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleGuess, status, startNewGame, showSettings, showCategorySelect, showShop, showLeaderboard, showAchievements])

  const revealPercent = Math.min((mistakes / maxErrors) * 100, 100)

  return (
    <div className="container">
      {/* Confetti Overlay */}
      {showConfetti && (
        <div className="confetti-overlay">
          {[...Array(50)].map((_, i) => (
            <div 
              key={i} 
              className="confetti" 
              style={{ 
                left: `${Math.random() * 100}%`, 
                backgroundColor: ['#3b82f6', '#ef4444', '#f59e0b', '#10b981'][Math.floor(Math.random() * 4)],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }} 
            />
          ))}
        </div>
      )}

      {/* Category Selection Modal */}
      {showCategorySelect && (
        <div className="settings-overlay">
          <div className="settings-modal" style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ width: '40px' }}></div>
              <h2 style={{ textAlign: 'center', margin: 0 }}>KATEGORİ SEÇ</h2>
              <button className="button" style={{ padding: '0.5rem', background: 'transparent', color: 'var(--foreground)' }} onClick={() => setShowCategorySelect(false)}>✖</button>
            </div>
            <div className="category-grid">
              {[
                { id: 'GENEL', icon: '🌐', label: 'Genel' },
                { id: 'TEKNOLOJI', icon: '💻', label: 'Teknoloji' },
                { id: 'SINEMA', icon: '🎬', label: 'Sinema' },
                { id: 'COGRAFYA', icon: '🌍', label: 'Coğrafya' },
                { id: 'MITOLOJI', icon: '🔱', label: 'Mitoloji' },
              ].map(cat => (
                <div 
                  key={cat.id} 
                  className={`category-card ${category === cat.id ? 'active' : ''}`}
                  onClick={() => setCategory(cat.id)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                >
                  <span style={{ fontSize: '2rem', lineHeight: 1 }}>{cat.icon}</span>
                  <span style={{ fontSize: '1rem' }}>{cat.label}</span>
                </div>
              ))}
            </div>
            <button className="button" style={{ marginTop: '1rem' }} onClick={startNewGame}>OYUNU BAŞLAT</button>
          </div>
        </div>
      )}

      <header style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ minWidth: '150px' }}>
          <h1 style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '1.2rem', margin: 0, color: '#53FC18', textShadow: '2px 2px 0px #000' }}>ADAM ASMACA</h1>
          <p style={{ opacity: 0.8, fontSize: '0.9rem', margin: 0 }}>Hoş geldin, {user?.name}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
          {user && (user as any).currentStreak > 1 && (
            <div className="combo-badge" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>
              🔥 {(user as any).currentStreak}
            </div>
          )}
          <div className="gold-badge" style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem' }}>🪙 {user?.gold}</div>
          <button className="button" style={{ background: 'var(--primary)', padding: '0.4rem 0.8rem' }} onClick={() => setShowCategorySelect(true)}>{category}</button>
          <button className="button" style={{ background: '#3b82f6', padding: '0.4rem 0.8rem' }} onClick={fetchLeaderboard}>🏆</button>
          <button className="button" style={{ background: '#f59e0b', padding: '0.4rem 0.8rem' }} onClick={() => setShowShop(true)}>🛒</button>
          <button className="button" style={{ padding: '0.4rem 0.8rem' }} onClick={() => setShowSettings(true)}>⚙️</button>
        </div>
      </header>

      {/* Timer & Info Bar */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem', margin: '0.2rem 0' }}>
        <div className={`gold-badge ${timeLeft < 10 ? 'pulsate' : ''}`} style={{ fontSize: '0.8rem', padding: '0.2rem 1rem' }}>
          ⏱️ {timeLeft}s
        </div>
        <div className={`gold-badge ${mistakes >= maxErrors - 1 ? 'pulsate' : ''}`} style={{ fontSize: '0.8rem', padding: '0.2rem 1rem' }}>
          ❤️ {maxErrors - mistakes} / {maxErrors}
        </div>
      </div>

      {/* Achievement Toast */}
      {lastAchievement && (
        <div className="achievement-toast">
          <div style={{ fontSize: '1.5rem' }}>🌟</div>
          <div>
            <div style={{ fontWeight: 'bold' }}>BAŞARIM KAZANILDI!</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>{lastAchievement}</div>
          </div>
        </div>
      )}

      <main style={{ display: 'flex', gap: '1rem', width: '100%', flex: 1, overflow: 'hidden', alignItems: 'center' }}>
        <div className={`gallows-container ${isShaking ? 'shake' : ''}`}>
            <div style={{ position: 'relative', width: '240px', height: '240px' }}>
              <svg width="240" height="240" viewBox="0 0 320 320" style={{ position: 'absolute', top: 0, left: 0 }}>
                <defs>
                  <clipPath id="revealMask">
                    <rect 
                      x="160" y="80" 
                      width="120" 
                      height={(mistakes / maxErrors) * 160} 
                      style={{ transition: "height 0.3s ease" }}
                    />
                  </clipPath>
                </defs>
                <g stroke="white" strokeLinecap="round">
                  {/* Fixed Gallows */}
                  <line x1="40" y1="280" x2="280" y2="280" strokeWidth="8" />
                  <line x1="80" y1="280" x2="80" y2="40" strokeWidth="8" />
                  <line x1="76" y1="40" x2="220" y2="40" strokeWidth="8" />
                  <line x1="80" y1="80" x2="120" y2="40" strokeWidth="8" />
                  <line x1="220" y1="40" x2="220" y2="80" strokeWidth="4" />
                  
                  {customImage ? (
                    <image 
                      href={customImage} 
                      x="160" y="80" 
                      width="120" height="160" 
                      clipPath="url(#revealMask)"
                      preserveAspectRatio="xMidYMid slice"
                    />
                  ) : (
                    <>
                      {revealPercent > 0 && <circle cx="220" cy="110" r="30" strokeWidth="6" fill="black" />}
                      {revealPercent > 16.7 && <line x1="220" y1="140" x2="220" y2="210" strokeWidth="6" />}
                      {revealPercent > 33.4 && <line x1="220" y1="150" x2="170" y2="190" strokeWidth="6" />}
                      {revealPercent > 50.1 && <line x1="220" y1="150" x2="270" y2="190" strokeWidth="6" />}
                      {revealPercent > 66.8 && <line x1="220" y1="210" x2="180" y2="260" strokeWidth="6" />}
                      {revealPercent > 83.5 && <line x1="220" y1="210" x2="260" y2="260" strokeWidth="6" />}
                    </>
                  )}
                </g>
              </svg>
            </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem', overflow: 'hidden' }}>
          <div className="word-display">
            {word.split('').map((char: string, i: number) => {
              if (char === ' ') return <div key={i} style={{ width: '15px' }} />
              return (
                <div key={i} className="letter-slot">
                  {guessedLetters.includes(char) ? char : ''}
                </div>
              )
            })}
          </div>

          {status !== 'playing' && (
            <div className="shop-card" style={{ padding: '0.4rem', border: '2px solid #000' }}>
              <div style={{ fontSize: '0.8rem' }}>
                <strong>{status === 'won' ? 'KAZANDIN!' : 'KAYBETTİN!'}</strong> - Kelime: {word}
              </div>
              <button className="button" style={{ padding: '0.2rem 0.5rem' }} onClick={startNewGame}>YENİ</button>
            </div>
          )}

          <div className="keyboard">
            {ALPHABET.map(letter => (
              <button 
                key={letter} 
                className="key"
                onClick={() => handleGuess(letter)}
                disabled={guessedLetters.includes(letter) || status !== 'playing'}
                style={guessedLetters.includes(letter) ? { background: word.includes(letter) ? 'var(--success)' : 'var(--error)', opacity: 0.7 } : {}}
              >
                {letter}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {meaning && (
              <div className="meaning-hint">
                <strong style={{ color: 'var(--primary)' }}>İPUCU:</strong> {meaning}
              </div>
            )}
            <button className="button" style={{ fontSize: '0.9rem' }} onClick={useHint} disabled={status !== 'playing' || (user?.gold || 0) < 50}>
              💡 HARF AL (50)
            </button>
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div className="settings-overlay">
          <div className="settings-modal" style={{ backdropFilter: 'blur(20px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.8rem', margin: 0 }}>⚙️ Oyun Ayarları</h2>
              <button className="button" style={{ padding: '0.5rem', background: 'transparent', color: 'var(--foreground)' }} onClick={() => setShowSettings(false)}>✖</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <label>Zorluk Seviyesi</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="button" style={{ background: 'var(--surface)', color: 'var(--foreground)' }}>
                <option value="EASY">Kolay</option>
                <option value="MEDIUM">Orta</option>
                <option value="HARD">Zor</option>
              </select>

              <label>Başlangıç Canı</label>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem', 
                background: 'var(--surface)', 
                borderRadius: '1rem', 
                padding: '0.4rem', 
                border: '1px solid var(--border)' 
              }}>
                <button 
                  className="button" 
                  style={{ padding: '0.5rem 1rem', fontSize: '1.2rem', margin: 0, minWidth: '45px' }} 
                  onClick={() => setMaxErrors(Math.max(1, maxErrors - 1))}
                >
                  -
                </button>
                <div style={{ flex: 1, textAlign: 'center', fontSize: '1.4rem', fontWeight: 'bold' }}>
                  {maxErrors}
                </div>
                <button 
                  className="button" 
                  style={{ padding: '0.5rem 1rem', fontSize: '1.2rem', margin: 0, minWidth: '45px' }} 
                  onClick={() => setMaxErrors(Math.min(15, maxErrors + 1))}
                >
                  +
                </button>
              </div>

              <label>Görünüm Tema</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['light', 'dark', 'system'].map(t => (
                  <button key={t} className="button" style={{ flex: 1, opacity: theme === t ? 1 : 0.5 }} onClick={() => setTheme(t as any)}>{t.toUpperCase()}</button>
                ))}
              </div>

              <label>Özel Karakter Görseli</label>
              <input type="file" accept="image/png, image/jpeg, image/jpg, image/webp" onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  const reader = new FileReader()
                  reader.onload = (ev) => setCustomImage(ev.target?.result as string)
                  reader.readAsDataURL(file)
                }
              }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                <input 
                  type="checkbox" 
                  checked={soundEnabled} 
                  onChange={(e) => setSoundEnabled(e.target.checked)} 
                  id="soundToggle" 
                  style={{ width: '20px', height: '20px' }} 
                />
                <label htmlFor="soundToggle" style={{ cursor: 'pointer' }}>🔊 Ses Efektleri ve Müzik</label>
              </div>
            </div>
            <button className="button" style={{ marginTop: '1rem' }} onClick={startNewGame}>OYUNU BAŞLAT</button>
          </div>
        </div>
      )}

      {/* Shop Modal */}
      {showShop && (
        <div className="settings-overlay">
          <div className="settings-modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>🛒 Marketplace</h2>
              <button className="button" style={{ padding: '0.5rem', background: 'transparent', color: 'var(--foreground)' }} onClick={() => setShowShop(false)}>✖</button>
            </div>
            
            <div className="shop-card">
              <div>
                <p><strong>Ekstra Can</strong></p>
                <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Mevcut oyuna +1 hak ekler.</p>
              </div>
              <button className="button" onClick={buyExtraLife}>100 🪙</button>
            </div>

            <div className="shop-card">
              <div>
                <p><strong>İpucu Paketi</strong></p>
                <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Rastgele bir harf açar.</p>
              </div>
              <button className="button" onClick={useHint}>50 🪙</button>
            </div>

          </div>
        </div>
      )}
      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className="settings-overlay">
          <div className="settings-modal" style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>🏆 Küresel Sıralama</h2>
              <button className="button" style={{ padding: '0.5rem', background: 'transparent', color: 'var(--foreground)' }} onClick={() => setShowLeaderboard(false)}>✖</button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {['GENEL', 'TEKNOLOJI', 'SINEMA', 'COGRAFYA', 'MITOLOJI'].map(cat => (
                <button 
                  key={cat} 
                  className="button" 
                  style={{ 
                    fontSize: '0.8rem', 
                    padding: '0.4rem 0.8rem',
                    background: category === cat ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                    border: category === cat ? '1px solid white' : '1px solid var(--border)'
                  }}
                  onClick={async () => {
                    setCategory(cat)
                    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'
                    const res = await fetch(`${API_URL}/api/leaderboard?category=${cat}`)
                    const data = await res.json()
                    setLeaderboard(data)
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {leaderboard.map((u: any, i: number) => (
                <div key={u.id} className="shop-card" style={{ background: i < 3 ? 'rgba(245, 158, 11, 0.1)' : 'var(--surface)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', width: '30px' }}>{i + 1}.</div>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{u.name}</div>
                      <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{u.gamesWon} Galibiyet</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{u.highScore} Puan</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Achievements Modal */}
      {showAchievements && (
        <div className="settings-overlay">
          <div className="settings-modal" style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>🌟 Başarımlar</h2>
              <button className="button" style={{ padding: '0.5rem', background: 'transparent', color: 'var(--foreground)' }} onClick={() => setShowAchievements(false)}>✖</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[
                { id: "İlk Bilgi", name: "İlk Bilgi", desc: "İlk maçını kazan.", icon: "🎯" },
                { id: "Kusursuz", name: "Kusursuz", desc: "Sıfır hata ile bil.", icon: "💎" },
                { id: "Hızlı Düşünür", name: "Hızlı Düşünür", desc: "10 sn altında bil.", icon: "⚡" },
                { id: "Kelime Avcısı", name: "Kelime Avcısı", desc: "10+ harf uzunluğunda bil.", icon: "🦖" },
                { id: "Şanslı", name: "Şanslı", desc: "Son aşamada bil.", icon: "🍀" }
              ].map(ach => {
                const isUnlocked = user?.unlockedAchievements?.includes(ach.id)
                return (
                  <div key={ach.id} className="shop-card" style={{ opacity: isUnlocked ? 1 : 0.4, flexFlow: 'column', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem' }}>{ach.icon}</div>
                    <div style={{ fontWeight: 'bold' }}>{ach.name}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{ach.desc}</div>
                    {isUnlocked && <div style={{ fontSize: '0.7rem', color: 'var(--success)', marginTop: '0.5rem' }}>AÇILDI ✅</div>}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
      {/* Footer Links */}
      <footer className="footer" style={{ marginTop: 'auto', paddingTop: '1rem', paddingBottom: '1rem', display: 'flex', justifyContent: 'center', gap: '2rem', alignItems: 'center' }}>
        <a href="https://github.com/yusuf-ulgen/adamAsmaca" target="_blank" rel="noopener noreferrer" className="footer-link">
          <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '30px', height: '30px' }}>
            <path d="M12 0C5.37 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.113.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
          </svg>
        </a>
        <a href="https://www.linkedin.com/in/yusuf-ulgen" target="_blank" rel="noopener noreferrer" className="footer-link">
          <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '30px', height: '30px' }}>
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        </a>
        <a href="https://www.yusufulgen.com" target="_blank" rel="noopener noreferrer" className="footer-link">
          <img src="/logo.png" alt="Yusuf Ülgen Logo" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'contain' }} />
        </a>
      </footer>
    </div>
  )
}
