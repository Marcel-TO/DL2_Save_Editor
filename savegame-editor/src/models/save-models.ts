export interface IdData {
    filename: string,
    ids: string[]
}

export interface PatchedItems {
    not_dropable: string[],
    not_shareable: string[]
}

export interface InventoryChunk {
    level: Uint8Array,
    seed: Uint8Array,
    amount: Uint8Array,
    durability: Uint8Array,
    space: Uint8Array,
    index: number,
    level_value: number,
    seed_value: number,
    amount_value: number,
    durability_value: number
}

export interface Mod {
    name: string,
    index: number,
    data_content: Uint8Array,
    data_string: string
}

export interface InventoryItem {
    name: string,
    index: number,
    size: number,
    sgd_data: Uint8Array,
    chunk_data: InventoryChunk,
    mod_data: Mod[]
}

export interface InventoryItemRow {
    name: string,
    inventory_items: InventoryItem[]
}

export interface SkillItem {
    name: string,
    index: number,
    size: number,
    sgd_data: Uint8Array,
    points_data: Uint8Array,
    points_value: number
}

export interface Skills {
    base_skills: SkillItem[],
    legend_skills: SkillItem[],
}

export interface UnlockableItem {
    name: string,
    index: number,
    size: number,
    sgd_data: Uint8Array,
}

export interface SaveFile {
    path: string,
    file_content: Uint8Array,
    file_string: string,
    skills: Skills,
    unlockable_items: UnlockableItem[],
    items: InventoryItemRow[],
    log_history: string[],
    is_compressed: boolean,
    game_version: string
}

export interface OutpostSave {
    name: string,
    owner: string,
    description: string,
    features: string[],
    version: string,
    save_file: SaveFile
}
