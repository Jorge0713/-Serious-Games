export const MAIN_MENU_COLORS = {
    bg: 0xfffbf0,
    bgCard: 0xffffff,
    ink: 0x2e3142,
    inkHex: '#2E3142',
    ink2Hex: '#4F5266',
    inkMuteHex: '#9094A4',
    frutas: 0x7ad3a0,
    frutasTint: 0xe4f4ea,
    cereales: 0xf9cd55,
    cerealesTint: 0xfcefc9,
    cerealesDimHex: '#A6811A',
    legumin: 0xff9580,
    accent: 0x8a95e0,
    accentTint: 0xe6e9f6,
} as const;

export const LEVEL_SELECT_COLORS = {
    bg: 0xf2eadb,
    paper: 0xfffbf0,
    paperAlt: 0xfff7e8,
    card: 0xf9f5e9,
    cardDim: 0xf0eadf,
    white: 0xffffff,
    ink: 0x2e3142,
    mutedInk: 0x6b6f7f,
    gray: 0xb7b1a7,
    grayDark: 0x77736d,
    green: 0x77d39d,
    coral: 0xff907f,
    legume: 0xe7a59b,
    cereal: 0xf7ce63,
    animal: 0xf4a36f,
    junk: 0x5b4638,
    yellow: 0xffcf55,
    route: 0x75c995,
    progressTrack: 0xe7e0d3,
} as const;

export const LEVEL_SELECT_HEX = {
    ink: '#2E3142',
    mutedInk: '#6B6F7F',
    grayDark: '#77736D',
    paper: '#FFFBF0',
    white: '#FFFFFF',
} as const;

export type MainMenuColorKey = keyof typeof MAIN_MENU_COLORS;
export type LevelSelectColorKey = keyof typeof LEVEL_SELECT_COLORS;
export type LevelSelectHexColorKey = keyof typeof LEVEL_SELECT_HEX;
