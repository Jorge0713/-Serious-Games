import { PlayerService } from './PlayerService';

export type FlowProgressFlag =
    | 'tutorialFrutasCompleted'
    | 'tutorialCerealesCompleted'
    | 'tutorialAnimalCompleted'
    | 'preTutorialConceptosCompleted'
    | 'crucigramaCompleted';

export type FlowProgressState = Record<FlowProgressFlag, boolean>;

const STORAGE_PREFIX = 'plachef_flow_progress';

const DEFAULT_PROGRESS: FlowProgressState = {
    tutorialFrutasCompleted: false,
    tutorialCerealesCompleted: false,
    tutorialAnimalCompleted: false,
    preTutorialConceptosCompleted: false,
    crucigramaCompleted: false,
};

function getStorage(): Storage | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage;
}

function getStorageKey(): string {
    const jugador = PlayerService.obtenerJugadorActivo();
    return `${STORAGE_PREFIX}:${jugador?.id ?? 'global'}`;
}

function readProgress(): FlowProgressState {
    const storage = getStorage();
    if (!storage) return { ...DEFAULT_PROGRESS };

    const raw = storage.getItem(getStorageKey());
    if (!raw) return { ...DEFAULT_PROGRESS };

    try {
        const parsed = JSON.parse(raw) as Partial<FlowProgressState>;
        return {
            ...DEFAULT_PROGRESS,
            ...Object.fromEntries(
                Object.keys(DEFAULT_PROGRESS).map(key => [
                    key,
                    parsed[key as FlowProgressFlag] === true,
                ])
            ) as FlowProgressState,
        };
    } catch {
        return { ...DEFAULT_PROGRESS };
    }
}

function saveProgress(progress: FlowProgressState): void {
    const storage = getStorage();
    if (!storage) return;

    storage.setItem(getStorageKey(), JSON.stringify(progress));
}

export class FlowProgressService {
    static getProgress(): FlowProgressState {
        return readProgress();
    }

    static markCompleted(flag: FlowProgressFlag): FlowProgressState {
        const progress = readProgress();
        const nextProgress = {
            ...progress,
            [flag]: true,
        };
        saveProgress(nextProgress);
        return nextProgress;
    }

    static isMainLevelUnlocked(progress: FlowProgressState = readProgress()): boolean {
        return Object.values(progress).every(Boolean);
    }
}
