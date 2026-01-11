'use client'

import { Component, ReactNode } from 'react'

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error('Dashboard Error:', error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="glass-panel p-8 text-center">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h2 className="text-xl font-semibold mb-2 text-red-400">
                        The Referee has called a technical timeout
                    </h2>
                    <p className="text-slate-400 mb-4">
                        Something went wrong with the dashboard
                    </p>
                    <button
                        onClick={() => this.setState({ hasError: false })}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                    >
                        Resume Play
                    </button>
                </div>
            )
        }

        return this.props.children
    }
}