import type { Position } from '../types/common'

interface Boundaries {
    minX: number
    maxX: number
    minY: number
    maxY: number
}

export function calculateNewPosition(
    currentPosition: Position,
    delta: { x: number; y: number },
    boundaries: Boundaries
): Position {
    const newX = Math.max(
        boundaries.minX,
        Math.min(boundaries.maxX, currentPosition.x + delta.x)
    )
    const newY = Math.max(
        boundaries.minY,
        Math.min(boundaries.maxY, currentPosition.y + delta.y)
    )

    return { x: newX, y: newY }
}

export function getWindowBoundaries(element: HTMLElement): Boundaries {
    const rect = element.getBoundingClientRect()
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight

    return {
        minX: 0,
        maxX: windowWidth - rect.width,
        minY: 0,
        maxY: windowHeight - rect.height,
    }
}

export function getElementBoundaries(
    container: HTMLElement,
    element: HTMLElement
): Boundaries {
    const containerRect = container.getBoundingClientRect()
    const elementRect = element.getBoundingClientRect()

    return {
        minX: 0,
        maxX: containerRect.width - elementRect.width,
        minY: 0,
        maxY: containerRect.height - elementRect.height,
    }
} 