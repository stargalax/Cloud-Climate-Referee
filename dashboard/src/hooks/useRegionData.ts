'use client'

import { useState, useEffect } from 'react'
import { ArbitratorVerdict, CloudRegion } from '@/types'
import { AWS_REGIONS } from '@/data/aws-regions'
import { regionArbitratorAPI } from '@/services/api'

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
        const loadData = async () => {
            try {
                setLoading(true)
                setError(null)

                // Check if API is ready
                const healthCheck = await regionArbitratorAPI.healthCheck()
                if (healthCheck.status !== 'healthy') {
                    throw new Error(`API health check failed: ${healthCheck.message}`)
                }

                // Set regions immediately
                setRegions(mockRegions)

                // Evaluate all regions using the real RegionArbitrator backend
                console.log('🏟️ The Referee is evaluating all regions...')
                const evaluatedVerdicts = await regionArbitratorAPI.evaluateMultipleRegions(mockRegions)

                // Convert array to record for easy lookup
                const verdictRecord: Record<string, ArbitratorVerdict> = {}
                evaluatedVerdicts.forEach(verdict => {
                    verdictRecord[verdict.region.regionCode] = verdict
                })

                setVerdicts(verdictRecord)

                // Log the match report for debugging
                const matchReport = regionArbitratorAPI.formatMatchReport(
                    evaluatedVerdicts,
                    'Dashboard Initial Load'
                )
                console.log('📋 Referee Match Report:\n', matchReport)

            } catch (err) {
                console.error('Failed to load region data:', err)
                const errorMessage = err instanceof Error ? err.message : 'Failed to load region data'
                setError(errorMessage)

                // Fallback to regions without verdicts
                setRegions(mockRegions)
                setVerdicts({})
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [])

    const evaluateRegion = async (regionCode: string): Promise<ArbitratorVerdict | null> => {
        try {
            const region = regions.find(r => r.regionCode === regionCode)
            if (!region) {
                console.error(`Region not found: ${regionCode}`)
                return null
            }

            console.log(`🏟️ The Referee is evaluating ${region.displayName}...`)
            const verdict = await regionArbitratorAPI.evaluateRegion(region)

            // Update the verdicts state
            setVerdicts(prev => ({
                ...prev,
                [regionCode]: verdict
            }))

            return verdict
        } catch (err) {
            console.error(`Failed to evaluate region ${regionCode}:`, err)
            return null
        }
    }

    const evaluateMultipleRegions = async (regionCodes: string[]): Promise<ArbitratorVerdict[]> => {
        try {
            const regionsToEvaluate = regions.filter(r => regionCodes.includes(r.regionCode))
            if (regionsToEvaluate.length === 0) {
                return []
            }

            console.log(`🏟️ The Referee is evaluating ${regionsToEvaluate.length} regions...`)
            const evaluatedVerdicts = await regionArbitratorAPI.evaluateMultipleRegions(regionsToEvaluate)

            // Update the verdicts state
            const updatedVerdicts = { ...verdicts }
            evaluatedVerdicts.forEach(verdict => {
                updatedVerdicts[verdict.region.regionCode] = verdict
            })
            setVerdicts(updatedVerdicts)

            return evaluatedVerdicts
        } catch (err) {
            console.error('Failed to evaluate multiple regions:', err)
            return []
        }
    }

    const getConfiguration = () => {
        try {
            return regionArbitratorAPI.getConfiguration()
        } catch (err) {
            console.error('Failed to get configuration:', err)
            return null
        }
    }

    const updateWeights = (weights: { carbon: number; latency: number; cost: number }) => {
        try {
            regionArbitratorAPI.configureWeights(weights)
            console.log('🏟️ The Referee has updated the scoring weights:', weights)
            return true
        } catch (err) {
            console.error('Failed to update weights:', err)
            return false
        }
    }

    return {
        regions,
        verdicts,
        loading,
        error,
        evaluateRegion,
        evaluateMultipleRegions,
        getConfiguration,
        updateWeights
    }
}