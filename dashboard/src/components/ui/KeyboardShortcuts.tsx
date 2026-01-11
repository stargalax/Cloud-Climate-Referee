'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface KeyboardShortcutsProps {
    isOpen: boolean
    onClose: () => void
}

const shortcuts = [
    {
        category: 'Navigation',
        items: [
            { keys: ['←', '→'], description: 'Navigate between regions' },
            { keys: ['j', 'k'], description: 'Navigate next/previous region' },
            { keys: ['Home', 'g'], description: 'Go to first region' },
            { keys: ['End', 'G'], description: 'Go to last region' },
            { keys: ['1-9', '0'], description: 'Select region by number' },
            { keys: ['Space'], description: 'Toggle region selection' },
        ]
    },
    {
        category: 'Actions',
        items: [
            { keys: ['Escape'], description: 'Clear selection' },
            { keys: ['Ctrl', 'C'], description: 'Copy shareable URL' },
            { keys: ['?'], description: 'Show keyboard shortcuts' },
        ]
    },
    {
        category: 'Accessibility',
        items: [
            { keys: ['Tab'], description: 'Navigate focusable elements' },
            { keys: ['Enter'], description: 'Activate focused element' },
            { keys: ['Shift', 'Tab'], description: 'Navigate backwards' },
        ]
    }
]

export default function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="shortcuts-title"
                >
                    <motion.div
                        className="glass-panel-enhanced max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        transition={{ type: "spring", damping: 20 }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-600/50">
                            <h2 id="shortcuts-title" className="text-xl font-semibold text-slate-100">
                                ⌨️ Keyboard Shortcuts
                            </h2>
                            <motion.button
                                onClick={onClose}
                                className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400/50"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                aria-label="Close shortcuts dialog"
                            >
                                ✕
                            </motion.button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {shortcuts.map((category, categoryIndex) => (
                                <motion.div
                                    key={category.category}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: categoryIndex * 0.1 }}
                                >
                                    <h3 className="text-lg font-medium text-slate-200 mb-3">
                                        {category.category}
                                    </h3>
                                    <div className="space-y-2">
                                        {category.items.map((shortcut, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
                                            >
                                                <span className="text-slate-300 text-sm">
                                                    {shortcut.description}
                                                </span>
                                                <div className="flex items-center space-x-1">
                                                    {shortcut.keys.map((key, keyIndex) => (
                                                        <span key={keyIndex} className="flex items-center">
                                                            <kbd className="px-2 py-1 text-xs font-mono bg-slate-700 text-slate-200 rounded border border-slate-600 shadow-sm">
                                                                {key}
                                                            </kbd>
                                                            {keyIndex < shortcut.keys.length - 1 && (
                                                                <span className="mx-1 text-slate-500 text-xs">
                                                                    +
                                                                </span>
                                                            )}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}

                            {/* Footer note */}
                            <motion.div
                                className="pt-4 border-t border-slate-600/50"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                <p className="text-sm text-slate-400 text-center">
                                    💡 Tip: Press <kbd className="px-1 py-0.5 text-xs bg-slate-700 rounded">?</kbd> anytime to show these shortcuts
                                </p>
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

// Hook to manage keyboard shortcuts modal
export function useKeyboardShortcutsModal() {
    const [isOpen, setIsOpen] = useState(false)

    const openShortcuts = () => setIsOpen(true)
    const closeShortcuts = () => setIsOpen(false)
    const toggleShortcuts = () => setIsOpen(!isOpen)

    return {
        isOpen,
        openShortcuts,
        closeShortcuts,
        toggleShortcuts,
        KeyboardShortcutsModal: ({ ...props }) => (
            <KeyboardShortcuts
                isOpen={isOpen}
                onClose={closeShortcuts}
                {...props}
            />
        )
    }
}