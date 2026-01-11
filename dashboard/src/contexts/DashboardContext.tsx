'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { ArbitratorVerdict, CloudRegion, DashboardState } from '@/types'
import { useRegionData } from '@/hooks/useRegionData'

// Action types for state management
type DashboardAction =
    | { type: 'SET_SELECTED_REGION'; payload: string | null }
    | { type: 'SET_VERDICTS'; payload: Record<string, ArbitratorVerdict> }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'UPDATE_VERDICT'; payload: { regionCode: string; verdict: ArbitratorVerdict } }
    | { type: 'CLEAR_SELECTION' }
    | { type: 'RESET_STATE' }

// Initial state
const initialState: DashboardState = {
    selectedRegion: null,
    verdicts: {},
    loading: true,
    error: null
}

// Reducer function
function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
    switch (action.type) {
        case 'SET_SELECTED_REGION':
            return {
                ...state,
                selectedRegion: action.payload
            }
        case 'SET_VERDICTS':
            return {
                ...state,
                verdicts: action.payload
            }
        case 'SET_LOADING':
            return {
                ...state,
                loading: action.payload
            }
        case 'SET_ERROR':
            return {
                ...state,
                error: action.payload,
                loading: false
            }
        case 'UPDATE_VERDICT':
            return {
                ...state,
                verdicts: {
                    ...state.verdicts,
                    [action.payload.regionCode]: action.payload.verdict
                }
            }
        case 'CLEAR_SELECTION':
            return {
                ...state,
                selectedRegion: null
            }
        case 'RESET_STATE':
            return initialState
        default:
            return state
    }
}

// Context interface
interface DashboardContextType {
    state: DashboardState
    dispatch: React.Dispatch<DashboardAction>
    selectRegion: (regionCode: string | null) => void
    clearSelection: () => void
    updateVerdict: (regionCode: string, verdict: ArbitratorVerdict) => void
    resetState: () => void
    // Navigation helpers
    navigateToRegion: (regionCode: string) => void
    getShareableUrl: (regionCode: string) => string
}

// Create context
const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

// Provider component
interface DashboardProviderProps {
    children: ReactNode
    initialRegion?: string | null
}

export function DashboardProvider({ children, initialRegion = null }: DashboardProviderProps) {
    const [state, dispatch] = useReducer(dashboardReducer, {
        ...initialState,
        selectedRegion: initialRegion
    })

    const { verdicts, loading, error } = useRegionData()

    // Sync with useRegionData hook
    useEffect(() => {
        dispatch({ type: 'SET_VERDICTS', payload: verdicts })
    }, [verdicts])

    useEffect(() => {
        dispatch({ type: 'SET_LOADING', payload: loading })
    }, [loading])

    useEffect(() => {
        dispatch({ type: 'SET_ERROR', payload: error })
    }, [error])

    // Action creators
    const selectRegion = (regionCode: string | null) => {
        dispatch({ type: 'SET_SELECTED_REGION', payload: regionCode })
    }

    const clearSelection = () => {
        dispatch({ type: 'CLEAR_SELECTION' })
    }

    const updateVerdict = (regionCode: string, verdict: ArbitratorVerdict) => {
        dispatch({ type: 'UPDATE_VERDICT', payload: { regionCode, verdict } })
    }

    const resetState = () => {
        dispatch({ type: 'RESET_STATE' })
    }

    // Navigation helpers
    const navigateToRegion = (regionCode: string) => {
        const url = new URL(window.location.href)
        url.searchParams.set('region', regionCode)
        window.history.pushState({}, '', url.toString())
        selectRegion(regionCode)
    }

    const getShareableUrl = (regionCode: string) => {
        const url = new URL(window.location.origin + window.location.pathname)
        url.searchParams.set('region', regionCode)
        return url.toString()
    }

    const contextValue: DashboardContextType = {
        state,
        dispatch,
        selectRegion,
        clearSelection,
        updateVerdict,
        resetState,
        navigateToRegion,
        getShareableUrl
    }

    return (
        <DashboardContext.Provider value={contextValue}>
            {children}
        </DashboardContext.Provider>
    )
}

// Custom hook to use the dashboard context
export function useDashboard() {
    const context = useContext(DashboardContext)
    if (context === undefined) {
        throw new Error('useDashboard must be used within a DashboardProvider')
    }
    return context
}

// Hook for URL synchronization
export function useUrlSync() {
    const { selectRegion } = useDashboard()

    useEffect(() => {
        // Read initial region from URL on mount
        const urlParams = new URLSearchParams(window.location.search)
        const regionFromUrl = urlParams.get('region')
        if (regionFromUrl) {
            selectRegion(regionFromUrl)
        }

        // Listen for browser back/forward navigation
        const handlePopState = () => {
            const urlParams = new URLSearchParams(window.location.search)
            const regionFromUrl = urlParams.get('region')
            selectRegion(regionFromUrl)
        }

        window.addEventListener('popstate', handlePopState)
        return () => window.removeEventListener('popstate', handlePopState)
    }, [selectRegion])
}