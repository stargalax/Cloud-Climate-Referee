// Formatting utilities for the dashboard
export const formatScore = (score: number): string => {
    return Math.round(score).toString()
}

export const formatLatency = (latency: number): string => {
    return `${Math.round(latency)}ms`
}

export const formatCarbon = (carbon: number): string => {
    return `${Math.round(carbon)}g CO₂/kWh`
}

export const formatCost = (cost: number): string => {
    return `$${cost.toFixed(3)}/hr`
}

export const formatPercentage = (percentage: number): string => {
    return `${Math.round(percentage)}%`
}

export const formatConfidence = (confidence: number): string => {
    if (confidence >= 0.8) return 'High'
    if (confidence >= 0.6) return 'Medium'
    return 'Low'
}

export const formatTimestamp = (timestamp: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
    }).format(timestamp)
}

export const formatRegionName = (regionCode: string): string => {
    // Convert region codes to display names
    const regionNames: Record<string, string> = {
        'us-east-1': 'N. Virginia',
        'us-west-2': 'Oregon',
        'eu-west-1': 'Ireland',
        'eu-central-1': 'Frankfurt',
        'ap-southeast-1': 'Singapore',
        'ap-northeast-1': 'Tokyo',
        'ca-central-1': 'Canada Central',
        'sa-east-1': 'São Paulo',
        'ap-south-1': 'Mumbai',
        'eu-north-1': 'Stockholm'
    }

    return regionNames[regionCode] || regionCode.toUpperCase()
}