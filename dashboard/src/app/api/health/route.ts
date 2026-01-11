import { NextRequest, NextResponse } from 'next/server'
import { regionArbitratorAPI } from '@/services/api'

/**
 * Health check endpoint for the Region Arbitrator Dashboard
 * 
 * This endpoint provides system health information including:
 * - Dashboard status
 * - RegionArbitrator backend status
 * - Configuration information
 * - Performance metrics
 */
export async function GET(request: NextRequest) {
    try {
        const startTime = Date.now()

        // Check if the RegionArbitrator API is healthy
        const apiHealth = await regionArbitratorAPI.healthCheck()

        // Get system configuration
        let configuration = null
        try {
            configuration = regionArbitratorAPI.getConfiguration()
        } catch (error) {
            console.warn('Could not retrieve configuration:', error)
        }

        const responseTime = Date.now() - startTime

        // Determine overall health status
        const isHealthy = apiHealth.status === 'healthy'

        const healthResponse = {
            status: isHealthy ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            services: {
                dashboard: {
                    status: 'healthy',
                    message: 'Dashboard is operational'
                },
                regionArbitrator: {
                    status: apiHealth.status,
                    message: apiHealth.message,
                    configuration: apiHealth.configuration
                }
            },
            performance: {
                responseTimeMs: responseTime,
                memoryUsage: process.memoryUsage(),
                uptime: process.uptime()
            },
            configuration: {
                enableRealAPI: process.env.NEXT_PUBLIC_ENABLE_REAL_API === 'true',
                enableDebugLogging: process.env.NEXT_PUBLIC_ENABLE_DEBUG_LOGGING === 'true',
                defaultWeights: {
                    carbon: parseFloat(process.env.NEXT_PUBLIC_DEFAULT_CARBON_WEIGHT || '0.4'),
                    latency: parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LATENCY_WEIGHT || '0.4'),
                    cost: parseFloat(process.env.NEXT_PUBLIC_DEFAULT_COST_WEIGHT || '0.2')
                }
            },
            referee: {
                message: isHealthy
                    ? '🏟️ The Referee is ready and operational!'
                    : '🚨 The Referee is experiencing technical difficulties',
                confidence: isHealthy ? 'High' : 'Low'
            }
        }

        // Return appropriate HTTP status code
        const statusCode = isHealthy ? 200 : 503

        return NextResponse.json(healthResponse, {
            status: statusCode,
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        })

    } catch (error) {
        console.error('Health check failed:', error)

        const errorResponse = {
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: {
                message: error instanceof Error ? error.message : 'Unknown health check error',
                type: error instanceof Error ? error.constructor.name : 'UnknownError'
            },
            services: {
                dashboard: {
                    status: 'healthy',
                    message: 'Dashboard is operational but backend check failed'
                },
                regionArbitrator: {
                    status: 'unhealthy',
                    message: 'Backend health check failed'
                }
            },
            referee: {
                message: '🔴 The Referee is unable to make decisions due to technical issues',
                confidence: 'Low'
            }
        }

        return NextResponse.json(errorResponse, {
            status: 503,
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        })
    }
}

/**
 * Handle OPTIONS requests for CORS
 */
export async function OPTIONS(request: NextRequest) {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    })
}