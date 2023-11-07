use serde::{Serialize, Deserialize};

use crate::file_analizer::{bytes_to_f32, to_little_endian, format_bytes_to_string};

#[derive(Debug, Serialize, Deserialize)]
pub struct IdData {
    filename: String,
    ids: Vec<String>,
}

impl IdData {
    pub fn new(filename: String, ids: Vec<String>) -> Self {
        IdData {
            filename,
            ids,
        }
    }
}


#[derive(Debug, Serialize, Deserialize)]
pub struct InventoryChunk {
    level: Vec<u8>,
    seed: Vec<u8>,
    amount: Vec<u8>,
    durability: Vec<u8>,
    space: Vec<u8>,
    index: f32,
    level_value: f32,
    seed_value: f32,
    amount_value: f32,
    durability_value: f32,
    space_value: f32,
}

impl InventoryChunk {
    pub fn new(
        level: Vec<u8>,
        seed: Vec<u8>,
        amount: Vec<u8>,
        durability: Vec<u8>,
        space: Vec<u8>,
        index: f32,
    ) -> Self {
        InventoryChunk {
            level: level.clone(),
            seed: seed.clone(),
            amount: amount.clone(),
            durability: durability.clone(),
            space: space.clone(),
            index,
            level_value: bytes_to_f32(to_little_endian(level.clone())),
            seed_value: bytes_to_f32(to_little_endian(seed.clone())),
            amount_value: bytes_to_f32(to_little_endian(amount.clone())),
            durability_value: bytes_to_f32(to_little_endian(durability.clone())),
            space_value: bytes_to_f32(to_little_endian(space.clone())),
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Mod {
    name: String,
    index: f32,
    data_content: Vec<u8>,
    data_string: String,
}

impl Mod {
    pub fn new(
        name: String, 
        index: f32,
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

#[derive(Debug, Serialize, Deserialize)]
pub struct InventoryItem {
    name: String,
    index: f32,
    size: f32,
    sgd_data: Vec<u8>,
    chunk_data: InventoryChunk,
    mod_data: Vec<Mod>,
}

impl InventoryItem {
    pub fn new(
        name: String,
        index: f32,
        size: f32,
        sgd_data: Vec<u8>,
        chunk_data: InventoryChunk,
        mod_data: Vec<Mod>
    ) -> Self {
        InventoryItem {
            name,
            index,
            size,
            sgd_data,
            chunk_data,
            mod_data,
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SkillItem {
    name: String,
    index: f32,
    size: f32,
    sgd_data: Vec<u8>,
    points_data: Vec<u8>,
    points_value: f32,
}

impl SkillItem {
    pub fn new(
        name: String,
        index: f32,
        size: f32,
        sgd_data: Vec<u8>,
        points_data: Vec<u8>,
    ) -> Self {
        SkillItem {
            name,
            index,
            size,
            sgd_data,
            points_data: points_data.clone(),
            points_value: bytes_to_f32(to_little_endian(points_data.clone())),
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Skills {
    base_skills: Vec<SkillItem>,
    legend_skills: Vec<SkillItem>,
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

#[derive(Debug, Serialize, Deserialize)]
pub struct SaveFile {
    path: String,
    file_content: Vec<u8>,
    file_string: String,
    items: Vec<Vec<InventoryItem>>,
    skills: Vec<SkillItem>,
}

impl SaveFile {
    pub fn new(
        path: String,
        file_content: Vec<u8>,
        file_string: String,
        items: Vec<Vec<InventoryItem>>,
        skills: Vec<SkillItem>,
    ) -> Self {
        SaveFile {
            path,
            file_content: file_content.clone(),
            file_string: format_bytes_to_string(file_content.clone()),
            items,
            skills,
        }
    }
}