// Verdict-based color utilities
export const getVerdictColor = (verdict: 'Red Card' | 'Yellow Card' | 'Play On' | 'Blue Card') => {
    switch (verdict) {
        case 'Red Card':
            return {
                primary: '#DC2626',
                secondary: '#FEE2E2',
                border: 'border-red-card/30',
                bg: 'bg-red-card/10',
                text: 'text-red-card',
                glow: 'shadow-red-500/20'
            }
        case 'Yellow Card':
            return {
                primary: '#F59E0B',
                secondary: '#FEF3C7',
                border: 'border-yellow-card/30',
                bg: 'bg-yellow-card/10',
                text: 'text-yellow-card',
                glow: 'shadow-yellow-500/20'
            }
        case 'Play On':
            return {
                primary: '#10B981',
                secondary: '#D1FAE5',
                border: 'border-play-on/30',
                bg: 'bg-play-on/10',
                text: 'text-play-on',
                glow: 'shadow-green-500/20'
            }
        case 'Blue Card':
            return {
                primary: '#3B82F6',
                secondary: '#DBEAFE',
                border: 'border-blue-500/30',
                bg: 'bg-blue-500/10',
                text: 'text-blue-500',
                glow: 'shadow-blue-500/20'
            }
        default:
            return {
                primary: '#6B7280',
                secondary: '#F3F4F6',
                border: 'border-gray-500/30',
                bg: 'bg-gray-500/10',
                text: 'text-gray-500',
                glow: 'shadow-gray-500/20'
            }
    }
}

export const getScoreColor = (score: number) => {
    if (score >= 70) return getVerdictColor('Play On')
    if (score >= 40) return getVerdictColor('Yellow Card')
    return getVerdictColor('Red Card')
}

export const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400'
    if (confidence >= 0.6) return 'text-yellow-400'
    return 'text-red-400'
}