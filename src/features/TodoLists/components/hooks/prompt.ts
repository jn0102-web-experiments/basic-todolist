import { useRef, useState } from "react";

export enum PromptResultStatus {
    RESOLVED,
    CANCELLED,
}

export interface ResolvedPromptResult<T> {
    value: T
    status: PromptResultStatus.RESOLVED
}

export interface CancelledPromptResult {
    status: PromptResultStatus.CANCELLED
}

export type PromptResult<T> = ResolvedPromptResult<T> | CancelledPromptResult

interface PromptControl {
    resolve(): void
    cancel(): void
}

export function usePrompt<T>(supplier?: () => T) {
    const [isPromptActive, togglePromptActive] = useState(false)

    const ctxRef = useRef<PromptControl>({
        resolve() { },
        cancel() { },
    })

    return [
        isPromptActive,
        activatePrompt,
        resolvePrompt,
        cancelPrompt,
    ] as const

    function activatePrompt(): Promise<PromptResult<T>> {
        togglePromptActive(true)
        return new Promise(resolve => {
            ctxRef.current = {
                resolve() {
                    togglePromptActive(false)
                    resolve({
                        status: PromptResultStatus.RESOLVED,
                        value: supplier && supplier() as any,
                    })
                },
                cancel() {
                    togglePromptActive(false)
                    resolve({
                        status: PromptResultStatus.CANCELLED,
                    })
                },
            }
        })
    }

    function resolvePrompt() {
        togglePromptActive(false)
        ctxRef.current.resolve()
    }

    function cancelPrompt() {
        togglePromptActive(false)
        ctxRef.current.cancel()
    }
}
