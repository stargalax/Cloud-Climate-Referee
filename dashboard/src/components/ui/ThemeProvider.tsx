'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArbitratorVerdict } from '@/types'

interface ThemeContextType {
    currentTheme: 'default' | 'red' | 'yellow' | 'green'
    setTheme: (theme: 'default' | 'red' | 'yellow' | 'green') => void
    audioEnabled: boolean
    toggleAudio: () => void
    playWhistle: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}

interface ThemeProviderProps {
    children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const [currentTheme, setCurrentTheme] = useState<'default' | 'red' | 'yellow' | 'green'>('default')
    const [audioEnabled, setAudioEnabled] = useState(false)
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null)

    // Initialize audio context
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Check user preference from localStorage
            const savedAudioPref = localStorage.getItem('referee-audio-enabled')
            setAudioEnabled(savedAudioPref === 'true')
        }
    }, [])

    const toggleAudio = () => {
        const newState = !audioEnabled
        setAudioEnabled(newState)
        if (typeof window !== 'undefined') {
            localStorage.setItem('referee-audio-enabled', newState.toString())
        }
    }

    const setTheme = (theme: 'default' | 'red' | 'yellow' | 'green') => {
        setCurrentTheme(theme)
    }

    // Create whistle sound using Web Audio API
    const playWhistle = () => {
        if (!audioEnabled) return

        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()

            // Create a short whistle sound
            const oscillator = ctx.createOscillator()
            const gainNode = ctx.createGain()

            oscillator.connect(gainNode)
            gainNode.connect(ctx.destination)

            // Whistle frequency sweep
            oscillator.frequency.setValueAtTime(800, ctx.currentTime)
            oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1)
            oscillator.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.2)

            // Volume envelope
            gainNode.gain.setValueAtTime(0, ctx.currentTime)
            gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.01)
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)

            oscillator.type = 'sine'
            oscillator.start(ctx.currentTime)
            oscillator.stop(ctx.currentTime + 0.2)
        } catch (error) {
            console.warn('Audio playback failed:', error)
        }
    }

    const getBackgroundClass = () => {
        switch (currentTheme) {
            case 'red':
                return 'breathe-red'
            case 'yellow':
                return 'breathe-yellow'
            case 'green':
                return 'breathe-green'
            default:
                return 'breathe-background'
        }
    }

    return (
        <ThemeContext.Provider value={{
            currentTheme,
            setTheme,
            audioEnabled,
            toggleAudio,
            playWhistle
        }}>
            <div className={`min-h-screen ${getBackgroundClass()}`}>
                {/* Audio Controls */}
                <div className="audio-controls">
                    <button
                        onClick={toggleAudio}
                        className={`whistle-button ${!audioEnabled ? 'muted' : ''}`}
                        title={audioEnabled ? 'Mute whistle sounds' : 'Enable whistle sounds'}
                    >
                        {audioEnabled ? '🔊' : '🔇'}
                    </button>
                </div>

                {children}
            </div>
        </ThemeContext.Provider>
    )
}