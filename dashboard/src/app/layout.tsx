import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '../components/ui/ThemeProvider'
import { DashboardProvider } from '../contexts/DashboardContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Region Arbitrator Dashboard',
    description: 'Cloud region evaluation with referee-style verdicts',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <ThemeProvider>
                    <DashboardProvider>
                        {children}
                    </DashboardProvider>
                </ThemeProvider>
            </body>
        </html>
    )
}