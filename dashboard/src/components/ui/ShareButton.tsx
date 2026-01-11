'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDashboard } from '@/contexts/DashboardContext'

interface ShareButtonProps {
    className?: string
    size?: 'small' | 'medium' | 'large'
    variant?: 'icon' | 'text' | 'full'
}

export default function ShareButton({
    className = '',
    size = 'medium',
    variant = 'icon'
}: ShareButtonProps) {
    const { state, getShareableUrl } = useDashboard()
    const { selectedRegion } = state
    const [copied, setCopied] = useState(false)
    const [isSharing, setIsSharing] = useState(false)

    const sizeClasses = {
        small: 'p-2 text-sm',
        medium: 'p-3 text-base',
        large: 'p-4 text-lg'
    }

    const iconSizeClasses = {
        small: 'w-4 h-4',
        medium: 'w-5 h-5',
        large: 'w-6 h-6'
    }

    const handleShare = async () => {
        if (!selectedRegion) return

        setIsSharing(true)
        const shareableUrl = getShareableUrl(selectedRegion)

        try {
            // Try native Web Share API first (mobile devices)
            if (navigator.share) {
                await navigator.share({
                    title: 'Region Arbitrator Analysis',
                    text: `Check out this cloud region analysis: ${selectedRegion}`,
                    url: shareableUrl
                })
            } else {
                // Fallback to clipboard
                await navigator.clipboard.writeText(shareableUrl)
                setCopied(true)

                // Reset copied state after 2 seconds
                setTimeout(() => setCopied(false), 2000)
            }
        } catch (error) {
            console.warn('Failed to share:', error)
            // Try clipboard as final fallback
            try {
                await navigator.clipboard.writeText(shareableUrl)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
            } catch (clipboardError) {
                console.error('Failed to copy to clipboard:', clipboardError)
            }
        } finally {
            setIsSharing(false)
        }
    }

    if (!selectedRegion) {
        return null
    }

    const buttonContent = () => {
        if (isSharing) {
            return (
                <>
                    <motion.div
                        className={iconSizeClasses[size]}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                        ⚽
                    </motion.div>
                    {variant !== 'icon' && <span className="ml-2">Sharing...</span>}
                </>
            )
        }

        if (copied) {
            return (
                <>
                    <motion.div
                        className={iconSizeClasses[size]}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 15 }}
                    >
                        ✅
                    </motion.div>
                    {variant !== 'icon' && <span className="ml-2">Copied!</span>}
                </>
            )
        }

        return (
            <>
                <div className={iconSizeClasses[size]}>
                    📋
                </div>
                {variant === 'text' && <span className="ml-2">Share</span>}
                {variant === 'full' && <span className="ml-2">Share Analysis</span>}
            </>
        )
    }

    return (
        <motion.button
            onClick={handleShare}
            disabled={isSharing}
            className={`
                ${sizeClasses[size]}
                ${className}
                flex items-center justify-center
                bg-slate-800/50 hover:bg-slate-700/50
                border border-slate-600/50 hover:border-slate-500/50
                rounded-lg backdrop-blur-sm
                text-slate-300 hover:text-slate-100
                transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                focus:outline-none focus:ring-2 focus:ring-slate-400/50
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={
                copied ? 'URL copied to clipboard' :
                    isSharing ? 'Sharing analysis' :
                        'Share region analysis'
            }
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={copied ? 'copied' : isSharing ? 'sharing' : 'default'}
                    className="flex items-center"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                >
                    {buttonContent()}
                </motion.div>
            </AnimatePresence>
        </motion.button>
    )
}

// Shareable URL display component
export function ShareableUrlDisplay({
    regionCode,
    className = ''
}: {
    regionCode: string
    className?: string
}) {
    const { getShareableUrl } = useDashboard()
    const [copied, setCopied] = useState(false)

    const shareableUrl = getShareableUrl(regionCode)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareableUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            console.error('Failed to copy URL:', error)
        }
    }

    return (
        <div className={`${className} flex items-center space-x-2`}>
            <div className="flex-1 min-w-0">
                <input
                    type="text"
                    value={shareableUrl}
                    readOnly
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400/50"
                    aria-label="Shareable URL"
                />
            </div>
            <motion.button
                onClick={handleCopy}
                className="px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 rounded text-sm text-slate-300 hover:text-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400/50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={copied ? 'URL copied' : 'Copy URL'}
            >
                {copied ? '✅' : '📋'}
            </motion.button>
        </div>
    )
}