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
    | { type: 'SET_WEIGHTS'; payload: FactorWeights }
    | { type: 'SET_EVALUATING'; payload: boolean }

// Factor weights interface
interface FactorWeights {
    carbon: number   // 0-1
    latency: number  // 0-1  
    cost: number     // 0-1
}

// Enhanced state interface
interface EnhancedDashboardState extends DashboardState {
    weights: FactorWeights
    isEvaluating: boolean
}

// Initial state
const initialState: EnhancedDashboardState = {
    selectedRegion: null,
    verdicts: {},
    loading: true,
    error: null,
    weights: {
        carbon: 0.4,   // 40% - Eco-Friendly
        latency: 0.4,  // 40% - Performance
        cost: 0.2      // 20% - Budget
    },
    isEvaluating: false
}

// Reducer function
function dashboardReducer(state: EnhancedDashboardState, action: DashboardAction): EnhancedDashboardState {
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
        case 'SET_WEIGHTS':
            return {
                ...state,
                weights: action.payload
            }
        case 'SET_EVALUATING':
            return {
                ...state,
                isEvaluating: action.payload
            }
        case 'RESET_STATE':
            return initialState
        default:
            return state
    }
}

// Context interface
interface DashboardContextType {
    state: EnhancedDashboardState
    dispatch: React.Dispatch<DashboardAction>
    selectRegion: (regionCode: string | null) => void
    clearSelection: () => void
    updateVerdict: (regionCode: string, verdict: ArbitratorVerdict) => void
    resetState: () => void
    // Navigation helpers
    navigateToRegion: (regionCode: string) => void
    getShareableUrl: (regionCode: string) => string
    // Weight management
    updateWeights: (weights: FactorWeights) => void
    reevaluateAllRegions: () => Promise<void>
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

    // Weight management
    const updateWeights = (weights: FactorWeights) => {
        dispatch({ type: 'SET_WEIGHTS', payload: weights })
    }

    // Re-evaluate all regions with new weights
    const reevaluateAllRegions = async () => {
        dispatch({ type: 'SET_EVALUATING', payload: true })

        try {
            // Simulate re-evaluation with new weights
            await new Promise(resolve => setTimeout(resolve, 1500))

            // Generate new verdicts based on current weights
            const newVerdicts: Record<string, ArbitratorVerdict> = {}
            const regions = Object.keys(state.verdicts)

            regions.forEach(regionCode => {
                const existingVerdict = state.verdicts[regionCode]
                if (existingVerdict) {
                    // Recalculate composite score with new weights
                    const { latency, carbon, cost } = existingVerdict.scores
                    const newCompositeScore =
                        latency.score * state.weights.latency +
                        carbon.score * state.weights.carbon +
                        cost.score * state.weights.cost

                    // Apply Red Card Rule: Any individual score < 30 = Red Card
                    const hasRedCardFactor = latency.score < 30 || carbon.score < 30 || cost.score < 30
                    const finalScore = hasRedCardFactor ? Math.min(newCompositeScore, 29) : newCompositeScore

                    // Determine new verdict based on score
                    let newVerdictType: 'Red Card' | 'Yellow Card' | 'Play On' | 'Blue Card'
                    let newReason: string

                    if (finalScore < 40) {
                        newVerdictType = 'Red Card'
                        if (state.weights.carbon >= 0.8 && carbon.score < 30) {
                            newReason = `The Referee cannot sanction this choice. With Eco-Priority mode active, this region's high carbon intensity (${Math.round((100 - carbon.score) * 5)}g CO2/kWh) results in an immediate Red Card. The environmental cost is too high.`
                        } else if (state.weights.latency >= 0.8 && latency.score < 30) {
                            newReason = `The Referee cannot sanction this choice. With Performance mode active, this region's poor latency (${Math.round((100 - latency.score) * 2)}ms) results in an immediate Red Card. The performance cost is too high.`
                        } else if (state.weights.cost >= 0.8 && cost.score < 30) {
                            newReason = `The Referee cannot sanction this choice. With Budget mode active, this region's high cost results in an immediate Red Card. The financial cost is too high.`
                        } else {
                            newReason = `The Referee has reviewed your choice and issues a Red Card. Multiple factors are below acceptable thresholds with current priorities.`
                        }
                    } else if (finalScore < 70) {
                        newVerdictType = 'Yellow Card'
                        newReason = `The Referee advises caution. This region shows mixed performance across your priority factors. Consider alternatives or optimization strategies.`
                    } else {
                        newVerdictType = 'Play On'
                        newReason = `The Referee approves this choice. This region aligns well with your current priorities and shows strong performance across key factors.`
                    }

                    newVerdicts[regionCode] = {
                        ...existingVerdict,
                        verdict: newVerdictType,
                        reason: newReason,
                        scores: {
                            ...existingVerdict.scores,
                            composite: {
                                overallScore: Math.round(finalScore * 100) / 100,
                                weightedBreakdown: {
                                    latency: latency.score * state.weights.latency,
                                    carbon: carbon.score * state.weights.carbon,
                                    cost: cost.score * state.weights.cost
                                },
                                confidence: existingVerdict.scores.composite.confidence
                            }
                        },
                        timestamp: new Date()
                    }
                }
            })

            dispatch({ type: 'SET_VERDICTS', payload: newVerdicts })
        } catch (error) {
            console.error('Failed to re-evaluate regions:', error)
            dispatch({ type: 'SET_ERROR', payload: 'Failed to re-evaluate regions with new weights' })
        } finally {
            dispatch({ type: 'SET_EVALUATING', payload: false })
        }
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
        getShareableUrl,
        updateWeights,
        reevaluateAllRegions
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