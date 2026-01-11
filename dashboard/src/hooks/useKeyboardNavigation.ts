'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useDashboard } from '@/contexts/DashboardContext'
import { AWS_REGIONS } from '@/data/aws-regions'

interface UseKeyboardNavigationOptions {
    enableGlobalShortcuts?: boolean
    enableRegionNavigation?: boolean
    enableAccessibility?: boolean
}

export function useKeyboardNavigation(options: UseKeyboardNavigationOptions = {}) {
    const {
        enableGlobalShortcuts = true,
        enableRegionNavigation = true,
        enableAccessibility = true
    } = options

    const { state, selectRegion, clearSelection, navigateToRegion } = useDashboard()
    const { selectedRegion, verdicts } = state

    // Keep track of available regions
    const availableRegions = AWS_REGIONS.map(region => region.regionCode)
    const currentIndex = useRef<number>(-1)

    // Update current index when selection changes
    useEffect(() => {
        if (selectedRegion) {
            currentIndex.current = availableRegions.indexOf(selectedRegion)
        } else {
            currentIndex.current = -1
        }
    }, [selectedRegion, availableRegions])

    // Navigation functions
    const navigateNext = useCallback(() => {
        if (!enableRegionNavigation) return

        const nextIndex = (currentIndex.current + 1) % availableRegions.length
        const nextRegion = availableRegions[nextIndex]
        navigateToRegion(nextRegion)

        // Announce to screen readers
        if (enableAccessibility) {
            announceRegionChange(nextRegion, 'next')
        }
    }, [availableRegions, navigateToRegion, enableRegionNavigation, enableAccessibility])

    const navigatePrevious = useCallback(() => {
        if (!enableRegionNavigation) return

        const prevIndex = currentIndex.current <= 0
            ? availableRegions.length - 1
            : currentIndex.current - 1
        const prevRegion = availableRegions[prevIndex]
        navigateToRegion(prevRegion)

        // Announce to screen readers
        if (enableAccessibility) {
            announceRegionChange(prevRegion, 'previous')
        }
    }, [availableRegions, navigateToRegion, enableRegionNavigation, enableAccessibility])

    const selectFirstRegion = useCallback(() => {
        if (!enableRegionNavigation || availableRegions.length === 0) return

        const firstRegion = availableRegions[0]
        navigateToRegion(firstRegion)

        if (enableAccessibility) {
            announceRegionChange(firstRegion, 'first')
        }
    }, [availableRegions, navigateToRegion, enableRegionNavigation, enableAccessibility])

    const selectLastRegion = useCallback(() => {
        if (!enableRegionNavigation || availableRegions.length === 0) return

        const lastRegion = availableRegions[availableRegions.length - 1]
        navigateToRegion(lastRegion)

        if (enableAccessibility) {
            announceRegionChange(lastRegion, 'last')
        }
    }, [availableRegions, navigateToRegion, enableRegionNavigation, enableAccessibility])

    // Screen reader announcements
    const announceRegionChange = useCallback((regionCode: string, direction: string) => {
        const region = AWS_REGIONS.find(r => r.regionCode === regionCode)
        const verdict = verdicts[regionCode]

        if (region && verdict) {
            const message = `Navigated to ${direction} region: ${region.displayName}. Verdict: ${verdict.verdict}. Score: ${Math.round(verdict.scores.composite.overallScore)}`

            // Create a live region for screen reader announcements
            const announcement = document.createElement('div')
            announcement.setAttribute('aria-live', 'polite')
            announcement.setAttribute('aria-atomic', 'true')
            announcement.className = 'sr-only'
            announcement.textContent = message

            document.body.appendChild(announcement)

            // Remove after announcement
            setTimeout(() => {
                document.body.removeChild(announcement)
            }, 1000)
        }
    }, [verdicts])

    // Copy shareable URL to clipboard
    const copyShareableUrl = useCallback(async () => {
        if (!selectedRegion) return

        try {
            const url = new URL(window.location.origin + window.location.pathname)
            url.searchParams.set('region', selectedRegion)

            await navigator.clipboard.writeText(url.toString())

            // Announce success
            if (enableAccessibility) {
                const announcement = document.createElement('div')
                announcement.setAttribute('aria-live', 'polite')
                announcement.className = 'sr-only'
                announcement.textContent = 'Shareable URL copied to clipboard'
                document.body.appendChild(announcement)

                setTimeout(() => {
                    document.body.removeChild(announcement)
                }, 1000)
            }
        } catch (error) {
            console.warn('Failed to copy URL to clipboard:', error)
        }
    }, [selectedRegion, enableAccessibility])

    // Keyboard event handler
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        // Don't interfere with form inputs
        if (event.target instanceof HTMLInputElement ||
            event.target instanceof HTMLTextAreaElement ||
            event.target instanceof HTMLSelectElement) {
            return
        }

        // Global shortcuts
        if (enableGlobalShortcuts) {
            switch (event.key) {
                case 'Escape':
                    clearSelection()
                    event.preventDefault()
                    break
                case 'c':
                    if (event.ctrlKey || event.metaKey) {
                        copyShareableUrl()
                        event.preventDefault()
                    }
                    break
                case '?':
                    // Show help modal (could be implemented later)
                    event.preventDefault()
                    break
            }
        }

        // Region navigation shortcuts
        if (enableRegionNavigation) {
            switch (event.key) {
                case 'ArrowRight':
                case 'j':
                    navigateNext()
                    event.preventDefault()
                    break
                case 'ArrowLeft':
                case 'k':
                    navigatePrevious()
                    event.preventDefault()
                    break
                case 'Home':
                case 'g':
                    if (event.key === 'g' && !event.shiftKey) {
                        selectFirstRegion()
                        event.preventDefault()
                    } else if (event.key === 'Home') {
                        selectFirstRegion()
                        event.preventDefault()
                    }
                    break
                case 'End':
                case 'G':
                    if (event.key === 'G' && event.shiftKey) {
                        selectLastRegion()
                        event.preventDefault()
                    } else if (event.key === 'End') {
                        selectLastRegion()
                        event.preventDefault()
                    }
                    break
                case ' ':
                    // Space to select/deselect current region
                    if (selectedRegion) {
                        clearSelection()
                    } else if (availableRegions.length > 0) {
                        selectFirstRegion()
                    }
                    event.preventDefault()
                    break
            }
        }

        // Number keys for direct region selection (1-9, 0)
        if (enableRegionNavigation && event.key >= '1' && event.key <= '9') {
            const index = parseInt(event.key) - 1
            if (index < availableRegions.length) {
                const region = availableRegions[index]
                navigateToRegion(region)
                event.preventDefault()
            }
        } else if (enableRegionNavigation && event.key === '0') {
            const index = 9 // 0 key maps to 10th item (index 9)
            if (index < availableRegions.length) {
                const region = availableRegions[index]
                navigateToRegion(region)
                event.preventDefault()
            }
        }
    }, [
        enableGlobalShortcuts,
        enableRegionNavigation,
        clearSelection,
        copyShareableUrl,
        navigateNext,
        navigatePrevious,
        selectFirstRegion,
        selectLastRegion,
        selectedRegion,
        availableRegions,
        navigateToRegion
    ])

    // Set up keyboard event listeners
    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [handleKeyDown])

    // Return navigation functions for programmatic use
    return {
        navigateNext,
        navigatePrevious,
        selectFirstRegion,
        selectLastRegion,
        copyShareableUrl,
        currentIndex: currentIndex.current,
        totalRegions: availableRegions.length
    }
}