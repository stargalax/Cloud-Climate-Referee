'use client'

import { useState, useEffect } from 'react'
import { ArbitratorVerdict, CloudRegion } from '@/types'
import { AWS_REGIONS } from '@/data/aws-regions'

// Convert AWS region data to CloudRegion format
const mockRegions: CloudRegion[] = AWS_REGIONS.map(region => ({
    provider: 'AWS',
    regionCode: region.regionCode,
    displayName: region.displayName,
    location: {
        country: region.country,
        city: region.city,
        latitude: region.coordinates[1],
        longitude: region.coordinates[0]
    }
}))

export function useRegionData() {
    const [regions, setRegions] = useState<CloudRegion[]>([])
    const [verdicts, setVerdicts] = useState<Record<string, ArbitratorVerdict>>({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        // Simulate API loading
        const loadData = async () => {
            try {
                setLoading(true)
                // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, 1000))

                setRegions(mockRegions)

                // Mock verdicts with varied results for demonstration
                const mockVerdicts: Record<string, ArbitratorVerdict> = {}
                const verdictTypes: ('Red Card' | 'Yellow Card' | 'Play On')[] = ['Red Card', 'Yellow Card', 'Play On']

                mockRegions.forEach((region, index) => {
                    const verdictType = verdictTypes[index % 3]
                    const baseScore = verdictType === 'Play On' ? 80 : verdictType === 'Yellow Card' ? 55 : 25
                    const variation = Math.random() * 15 - 7.5 // ±7.5 variation
                    const score = Math.max(0, Math.min(100, baseScore + variation))

                    mockVerdicts[region.regionCode] = {
                        region,
                        verdict: verdictType,
                        reason: `Mock evaluation for ${region.displayName} - ${verdictType.toLowerCase()} based on simulated metrics`,
                        suggestion: {
                            type: verdictType === 'Red Card' ? 'alternative_region' : 'optimization_strategy',
                            description: verdictType === 'Red Card'
                                ? 'Consider switching to a greener region like eu-north-1 (Stockholm)'
                                : 'Consider optimizing your workload for better efficiency'
                        },
                        scores: {
                            latency: {
                                score: Math.max(0, Math.min(100, score + Math.random() * 20 - 10)),
                                confidence: 0.8,
                                reasoning: 'Mock latency analysis',
                                category: score > 70 ? 'good' : score > 40 ? 'acceptable' : 'poor'
                            },
                            carbon: {
                                score: Math.max(0, Math.min(100, score + Math.random() * 20 - 10)),
                                confidence: 0.7,
                                reasoning: 'Mock carbon analysis',
                                category: score > 70 ? 'clean' : score > 40 ? 'moderate' : 'high_carbon',
                                renewablePercentage: Math.random() * 100
                            },
                            cost: {
                                score: Math.max(0, Math.min(100, score + Math.random() * 20 - 10)),
                                confidence: 0.9,
                                reasoning: 'Mock cost analysis',
                                category: score > 70 ? 'affordable' : score > 40 ? 'moderate' : 'expensive',
                                relativeCostIndex: 0.8 + Math.random() * 0.8
                            },
                            composite: {
                                overallScore: score,
                                weightedBreakdown: {
                                    latency: score * 0.4,
                                    carbon: score * 0.4,
                                    cost: score * 0.2
                                },
                                confidence: 0.8
                            }
                        },
                        timestamp: new Date()
                    }
                })

                setVerdicts(mockVerdicts)
                setError(null)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load region data')
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [])

    const evaluateRegion = async (regionCode: string): Promise<ArbitratorVerdict | null> => {
        // Mock implementation - will be replaced in subtask 12.4
        return verdicts[regionCode] || null
    }

    const evaluateMultipleRegions = async (regionCodes: string[]): Promise<ArbitratorVerdict[]> => {
        // Mock implementation - will be replaced in subtask 12.4
        return regionCodes.map(code => verdicts[code]).filter(Boolean)
    }

    return {
        regions,
        verdicts,
        loading,
        error,
        evaluateRegion,
        evaluateMultipleRegions
    }
}