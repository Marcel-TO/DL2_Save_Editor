use std::mem;

use serde::{Serialize, Deserialize};

use crate::file_analizer::format_bytes_to_string;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum ItemTypeEnum {
    Craftplan,
    ToolSkin,
    Collectable
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct IdData {
    pub filename: String,
    pub ids: Vec<String>,
}

impl IdData {
    pub fn new(filename: String, ids: Vec<String>) -> Self {
        IdData {
            filename,
            ids,
        }
    }
}


#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct InventoryChunk {
    pub level: Vec<u8>,
    pub seed: Vec<u8>,
    pub amount: Vec<u8>,
    pub durability: Vec<u8>,
    pub space: Vec<u8>,
    pub index: usize,
    pub level_value: u16,
    pub seed_value: u16,
    pub amount_value: u32,
    pub durability_value: String,
}

impl InventoryChunk {
    pub fn new(
        level: Vec<u8>,
        seed: Vec<u8>,
        amount: Vec<u8>,
        durability: Vec<u8>,
        space: Vec<u8>,
        index: usize,
    ) -> Self {
        InventoryChunk {
            level: level.clone(),
            seed: seed.clone(),
            amount: amount.clone(),
            durability: durability.clone(),
            space: space.clone(),
            index,
            level_value: u16::from_le_bytes(level.clone().try_into().unwrap()),
            seed_value: u16::from_le_bytes(seed.clone().try_into().unwrap()),
            amount_value: u32::from_le_bytes(amount.clone().try_into().unwrap()),
            durability_value: format!("{:.1}", unsafe { mem::transmute::<u32, f32>(u32::from_le_bytes(durability.clone().try_into().unwrap())) }),
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Mod {
    pub name: String,
    pub index: usize,
    pub data_content: Vec<u8>,
    pub data_string: String,
}

impl Mod {
    pub fn new(
        name: String, 
        index: usize,
        data_content: Vec<u8>,
    ) -> Self {
        Mod {
            name,
            index,
            data_content: data_content.clone(),
            data_string: format_bytes_to_string(data_content.clone()),
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct InventoryItem {
    pub name: String,
    pub index: usize,
    pub size: usize,
    pub sgd_data: Vec<u8>,
    pub chunk_data: InventoryChunk,
    pub mod_data: Vec<Mod>,
}

impl InventoryItem {
    pub fn new(
        name: String,
        index: usize,
        size: usize,
        sgd_data: Vec<u8>,
        chunk_data: InventoryChunk,
        mod_data: Vec<Mod>
    ) -> Self {
        InventoryItem {
            name,
            index,
            size,
            sgd_data,
            chunk_data: chunk_data,
            mod_data,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct InventoryItemRow {
    pub name: String,
    pub inventory_items: Vec<InventoryItem>,
}

impl InventoryItemRow {
    pub fn new(
        name: String,
        inventory_items: Vec<InventoryItem>,
    ) -> Self {
        InventoryItemRow {
            name,
            inventory_items,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SkillItem {
    pub name: String,
    pub index: usize,
    pub size: usize,
    pub sgd_data: Vec<u8>,
    pub points_data: Vec<u8>,
    pub points_value: u16,
}

impl SkillItem {
    pub fn new(
        name: String,
        index: usize,
        size: usize,
        sgd_data: Vec<u8>,
        points_data: Vec<u8>,
    ) -> Self {
        SkillItem {
            name,
            index,
            size,
            sgd_data,
            points_data: points_data.clone(),
            points_value: u16::from_le_bytes(points_data.try_into().unwrap()),
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Skills {
    pub base_skills: Vec<SkillItem>,
    pub legend_skills: Vec<SkillItem>,
}

impl Skills {
    pub fn new(
        base_skills: Vec<SkillItem>,
        legend_skills: Vec<SkillItem>,
    ) -> Self {
        Skills {
            base_skills,
            legend_skills,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UnlockableItem {
    pub name: String,
    pub index: usize,
    pub size: usize,
    pub sgd_data: Vec<u8>,
}

impl UnlockableItem {
    pub fn new(
        name: String,
        index: usize,
        size: usize,
        sgd_data: Vec<u8>,
    ) -> Self {
        UnlockableItem {
            name,
            index,
            size,
            sgd_data,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SaveFile {
    pub path: String,
    pub file_content: Vec<u8>,
    pub file_string: String,
    pub skills: Skills,
    pub unlockable_items: Vec<UnlockableItem>,
    pub items: Vec<InventoryItemRow>,
}

impl SaveFile {
    pub fn new(
        path: String,
        file_content: Vec<u8>,
        skills: Skills,
        unlockable_items: Vec<UnlockableItem>,
        items: Vec<InventoryItemRow>,
    ) -> Self {
        SaveFile {
            path,
            file_content: file_content.clone(),
            file_string: format_bytes_to_string(file_content.clone()),
            items,
            unlockable_items,
            skills,
        }
    }
}