import { ref, type Ref } from 'vue'

import { SLOT_COORDS } from '@/game/slots'
import { useSquadStore } from '@/stores/squad'
import type { Slot } from '@/types/playerType'

export function useFieldDrag(fieldRef: Ref<HTMLElement | null>, minTopPct = 0) {
    const store = useSquadStore()
    const draggingId = ref<number | null>(null)

    let dragOffsetX = 0
    let dragOffsetY = 0
    let pillWPct = 0
    let pillHPct = 0
    let dragStartPct: { topPct: number; leftPct: number } | null = null

    function findNearestSlot(topPct: number, leftPct: number, excludeGk = false): Slot {
        const cx = leftPct * 300
        const cy = topPct * 400
        let best: Slot = 'gk'
        let bestDist = Infinity
        for (const slot of Object.keys(SLOT_COORDS) as Slot[]) {
            if (excludeGk && slot === 'gk') continue
            const [sx, sy] = SLOT_COORDS[slot]
            const d = Math.hypot(sx - cx, sy - cy)
            if (d < bestDist) {
                bestDist = d
                best = slot
            }
        }
        return best
    }

    function detectConflicts(dragId: number): void {
        const dragged = store.pillCoords[dragId]
        if (!dragged) {
            store.conflictIds = new Set()
            return
        }
        const dCxPct = dragged.leftPct + pillWPct / 2
        const dCyPct = dragged.topPct + pillHPct / 2
        const next = new Set<number>()
        for (const p of store.players) {
            if (p.id === dragId) continue
            const other = store.pillCoords[p.id]
            if (!other) continue
            const dxCenterPct = Math.abs(other.leftPct + pillWPct / 2 - dCxPct)
            const dyCenterPct = Math.abs(other.topPct + pillHPct / 2 - dCyPct)
            if (dxCenterPct < pillWPct && dyCenterPct < pillHPct) {
                next.add(dragId)
                next.add(p.id)
            }
        }
        store.conflictIds = next
    }

    const handlePointerMove = (e: PointerEvent) => {
        if (draggingId.value === null || !fieldRef.value) return
        const fieldRect = fieldRef.value.getBoundingClientRect()
        if (fieldRect.width === 0 || fieldRect.height === 0) return
        const rawLeftPx = e.clientX - fieldRect.left - dragOffsetX
        const rawTopPx = e.clientY - fieldRect.top - dragOffsetY
        const maxLeft = 1 - pillWPct
        const maxTop = 1 - pillHPct
        const newLeftPct = Math.max(0, Math.min(maxLeft, rawLeftPx / fieldRect.width))
        const newTopPct = Math.max(minTopPct, Math.min(maxTop, rawTopPx / fieldRect.height))
        const id = draggingId.value
        store.setCoord(id, newTopPct, newLeftPct)
        detectConflicts(id)
    }

    const handlePointerUp = () => {
        if (draggingId.value !== null) {
            const id = draggingId.value
            const start = dragStartPct
            if (store.conflictIds.size > 0 && start) {
                store.setCoord(id, start.topPct, start.leftPct)
            } else {
                const coord = store.pillCoords[id]
                if (coord) {
                    const slot = findNearestSlot(coord.topPct, coord.leftPct, true)
                    store.updatePosition(id, slot)
                }
            }
        }
        draggingId.value = null
        store.conflictIds = new Set()
        dragStartPct = null
        document.removeEventListener('pointermove', handlePointerMove)
        document.removeEventListener('pointerup', handlePointerUp)
    }

    const handleDragStart = (id: number, clientX: number, clientY: number) => {
        if (!fieldRef.value) return
        const pillEl = fieldRef.value.querySelector(
            `.player-pill[data-player-id="${id}"]`,
        ) as HTMLElement | null
        if (!pillEl) return
        const pillRect = pillEl.getBoundingClientRect()
        const fieldRect = fieldRef.value.getBoundingClientRect()
        if (fieldRect.width === 0 || fieldRect.height === 0) return
        dragOffsetX = clientX - (pillRect.left + pillRect.width / 2)
        dragOffsetY = clientY - (pillRect.top + pillRect.height / 2)
        pillWPct = pillRect.width / fieldRect.width
        pillHPct = pillRect.height / fieldRect.height
        const start = store.pillCoords[id]
        dragStartPct = start ? { ...start } : null
        draggingId.value = id
        document.addEventListener('pointermove', handlePointerMove)
        document.addEventListener('pointerup', handlePointerUp)
    }

    return {
        draggingId,
        handleDragStart,
    }
}