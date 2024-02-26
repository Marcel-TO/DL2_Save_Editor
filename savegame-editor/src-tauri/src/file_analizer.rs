//! Takes a Dying Light 2 Save file and analizes its content for editing purpose.
//! 
//! After reading the content of the file, the following information is required:
//! - Skills (Base skills and Legend skills)
//! - Unlockable items (craftplans, toolskins, consumables)
//! - Inventory items (weapons, gear, accesssories, etc)

use std::io::Write;
use std::{fs, io::Read};
use std::error::Error;
use flate2::read::GzDecoder;
use log::info;
use regex::Regex;
use flate2::write::GzEncoder;
use flate2::Compression;


// Import all struct datas.
use crate::struct_data::{
    SaveFile, 
    Skills, 
    SkillItem,
    UnlockableItem,
    ItemTypeEnum,
    InventoryItem,
    InventoryItemRow,
    InventoryChunk,
    Mod,
};

// Define global result definition for easier readability.
type Result<T> = std::result::Result<T,Box<dyn Error>>;

// Defines the first sequence for the skill section.
static START_SKILLS: &[u8] = "Skills::SkillInstance".as_bytes();

// Defines the last sequence for the skill section.
static END_SKILLS: [u8; 33] = [
    0x50, 0x72, 0x6F, 0x67, 0x72, 0x65, 0x73, 0x73,
    0x69, 0x6F, 0x6E, 0x53, 0x74, 0x61, 0x74, 0x65,
    0x3A, 0x3A, 0x45, 0x45, 0x6C, 0x65, 0x6D, 0x65,
    0x6E, 0x74, 0x56, 0x65, 0x72, 0x73, 0x69, 0x6F,
    0x6E
];

// Defines the sequence where the inventory starts
// -> Token.....Unknown
// static START_INVENTORY: [u8; 18] = [
//     0x54, 0x6F, 0x6B, 0x65, 0x6E, 0x00, 0x00, 0x00,
//     0x00, 0x07, 0x00, 0x55, 0x6E, 0x6B, 0x6E, 0x6F, 0x77, 0x6E
// ];

// -> Special.....Unknown
// static START_INVENTORY: [u8; 20] = [
//     0x53, 0x70, 0x65, 0x63, 0x69, 0x61, 0x6C, 0x00, 0x00, 
//     0x00, 0x00, 0x07, 0x00, 0x55, 0x6E, 0x6B, 0x6E, 0x6F, 0x77, 0x6E
// ];

static START_INVENTORY: [u8; 15] = [
    0x4D, 0x61, 0x69, 0x6E, 0x01, 0x00, 0x00, 0x00, 0x05, 
    0x00, 0x4F, 0x74, 0x68, 0x65, 0x72
];

/// Represents a method for loading a savefile and preparing all necessary information.
/// 
/// ### Parameter
/// - `file_path`: The filepath of the current selected save.
/// - `file_content`: The content of the current file.
/// 
/// ### Returns `SaveFile`
/// The save file with all collected data.
pub fn load_save_file(file_path: &str, file_content: Vec<u8>) -> SaveFile {    
    // Gets the indices of the skill data.
    let skill_start_index: usize = get_index_from_sequence(&file_content, &0, &START_SKILLS, true);
    let skill_end_index: usize = get_index_from_sequence(&file_content, &skill_start_index, &END_SKILLS, true);
    let skill_data_range: &[u8] = &file_content[skill_start_index - 1 .. skill_end_index];

    // Check if there was an error while trying to get the indices.
    if skill_data_range.len() <= 0 {
        info!("Error: index not found");
    }

    // Collect all skills.
    let base_skills: Vec<String> = find_base_skill_matches(&skill_data_range);
    let legend_skills: Vec<String> = find_legend_skill_matches(&skill_data_range);
    let skills: Skills = analize_skill_data(&file_content, &base_skills, &legend_skills);
    
    // Find all unlockable items.
    let unlockable_items: Vec<UnlockableItem> = analize_unlockable_items_data(&file_content);
    let index_inventory_items: usize = get_index_for_inventory_items(&unlockable_items, &file_content);

    // Get all items within the inventory.
    let items: Vec<InventoryItemRow> = get_all_items(&file_content, index_inventory_items);

    SaveFile::new(
        file_path.to_string(),
        file_content,
        skills,
        unlockable_items,
        items,
    )
}

/// Represents a method for loading a PC savefile and preparing all necessary information.
/// 
/// ### Parameter
/// - `file_path`: The filepath of the current selected save.
/// - `file_content`: The content of the current file.
/// 
/// ### Returns `SaveFile`
/// The save file with all collected data.
pub fn load_save_file_pc(file_path: &str, compressed: Vec<u8>) -> SaveFile {
    let mut gz = GzDecoder::new(&compressed[..]);
    let mut file_content = Vec::new();
    gz.read_to_end(&mut file_content).unwrap();

    load_save_file(file_path, file_content)
}

/// Represents a method for exporting the save for PC (compressing).
/// 
/// ### Parameter
/// - `data`: The content of the save file.
/// 
/// ### Returns `Vec<u8>`
/// The compressed data.
pub fn export_save_for_pc(data: &Vec<u8>) -> Vec<u8> {
    let mut encoder = GzEncoder::new(Vec::new(), Compression::default());
    let _ = encoder.write_all(data);
    let compressed = encoder.finish().unwrap();

    compressed
}

/// Represents a method for converting byte content into string content
/// 
/// ### Parameter
/// - `file_content`: The byte data.
/// 
/// ### Returns `String`
/// The converted byte data.
pub fn format_bytes_to_string(file_content: Vec<u8>) -> String {
    file_content.iter()
                .map(|byte| format!("{:02X}", byte))
                .collect::<Vec<String>>()
                .join(" ")
}

/// Represents a method for changing the value of a skill.
/// 
/// ### Parameter
/// - `current_skill`: The selected skill.
/// - `current_skill_index`: The list index of selected skill.
/// - `is_base_skill`: Indicates whether the selected skill is a base skill or a legend skill.
/// - `new_value`: The new value of the selected skill.
/// - `save_file`: The current save file.
/// 
/// ### Returns `SaveFile`
/// The new save file with all changes to the skill.
pub fn edit_skill(
    current_skill: SkillItem, 
    current_skill_index: usize, 
    is_base_skill: bool, 
    new_value: u16, 
    save_file: SaveFile
) -> SaveFile {
    // Creates the skill with the new value.
    let new_skill: SkillItem = SkillItem::new(
        current_skill.name.clone(),
        current_skill.index.clone(),
        current_skill.size.clone(),
        current_skill.sgd_data.clone(),
        new_value.to_le_bytes().to_vec(),
    );

    // Creates a new save file with correct file content.
    let mut new_save_file: SaveFile = SaveFile::new(
        save_file.path,
        replace_content_of_file(&new_skill.index + &new_skill.size, new_skill.points_data.clone(), save_file.file_content),
        save_file.skills,
        save_file.unlockable_items,
        save_file.items
    );

    // Changes the current skill to the new one.
    if is_base_skill {
        new_save_file.skills.base_skills[current_skill_index] = new_skill.clone()
    } else {
        new_save_file.skills.legend_skills[current_skill_index] = new_skill.clone()
    }
    
    new_save_file
}

/// Represents a method for changing the values of a the item chunks
/// 
/// ### Parameter
/// - `current_item_chunk_index`: The index on where the chunk starts.
/// - `new_level`: The new level value.
/// - `new_seed`: The new seed value.
/// - `new_amount`: The new amount value.
/// - `new_durability`: The new durability value.
/// - `save_file_content`: The content of the save file.
/// 
/// ### Returns `Vec<u8>`
/// The new content of the save file.
pub fn edit_inventory_item_chunk(
    current_item_index: usize,
    new_id: String,
    current_item_chunk_index: usize,
    current_item_size: usize,
    new_level: u16,
    new_seed: u16,
    new_amount: u32,
    new_durability: f32,
    mut save_file_content: Vec<u8>
) -> Vec<u8> {
    let zero_bytes: Vec<u8> = vec![0; current_item_size - 4]; // -4 because of leaving the old SGDs
    let new_id_bytes: Vec<u8> = new_id.as_bytes().to_vec();
    let level_bytes: Vec<u8> = new_level.to_le_bytes().to_vec();
    let seed_bytes: Vec<u8> = new_seed.to_le_bytes().to_vec();
    let amount_bytes: Vec<u8> = new_amount.to_le_bytes().to_vec();
    let durability_bytes: Vec<u8> = new_durability.to_le_bytes().to_vec();
        
    // Replace all new values.
    save_file_content = replace_content_of_file(current_item_chunk_index, level_bytes, save_file_content);
    save_file_content = replace_content_of_file(current_item_chunk_index + 2, seed_bytes, save_file_content);
    save_file_content = replace_content_of_file(current_item_chunk_index + 4, amount_bytes, save_file_content);
    save_file_content = replace_content_of_file(current_item_chunk_index + 8, durability_bytes, save_file_content);
    
    // First empty 
    save_file_content = replace_content_of_file(current_item_index, zero_bytes, save_file_content);
    save_file_content = replace_content_of_file(current_item_index, new_id_bytes, save_file_content);

    save_file_content
}

pub fn change_items_durability(
    item_chunks: Vec<InventoryChunk>,
    value: f32,
    mut save_file_content: Vec<u8>,
) -> (Vec<InventoryChunk>, Vec<u8>) {
    let mut new_item_chunks: Vec<InventoryChunk> = Vec::new();
    
    for current_chunk in item_chunks {
        let durability_bytes: Vec<u8> = value.to_le_bytes().to_vec();
        let new_chunk = InventoryChunk::new(
            current_chunk.level,
            current_chunk.seed,
            current_chunk.amount,
            durability_bytes.clone(),
            current_chunk.space,
            current_chunk.index
        );

        new_item_chunks.push(new_chunk);
            
        // Replace all new values.
        save_file_content = replace_content_of_file(current_chunk.index + 8, durability_bytes, save_file_content);
    }

    (new_item_chunks, save_file_content)
}

pub fn change_items_amount(
    item_chunks: Vec<InventoryChunk>,
    value: u32,
    mut save_file_content: Vec<u8>,
) -> (Vec<InventoryChunk>, Vec<u8>) {
    let mut new_item_chunks: Vec<InventoryChunk> = Vec::new();
    
    for current_chunk in item_chunks {
        let amount_bytes: Vec<u8> = value.to_le_bytes().to_vec();
        let new_chunk = InventoryChunk::new(
            current_chunk.level,
            current_chunk.seed,
            amount_bytes.clone(),
            current_chunk.durability,
            current_chunk.space,
            current_chunk.index
        );

        new_item_chunks.push(new_chunk);
            
        // Replace all new values.
        save_file_content = replace_content_of_file(current_chunk.index + 4, amount_bytes, save_file_content);
    }

    (new_item_chunks, save_file_content)
}

pub fn remove_inventory_item(
    mut start_index: usize,
    end_index: usize,
    chunk_index: usize,
    mut save_file_content: Vec<u8>
) -> Vec<u8> {
    start_index = start_index - 6; // This is due to [id value][id size] in front of the ID
    let size: usize = end_index - start_index;
    let zero_bytes: Vec<u8> = vec![0; size];
    let zero_chunk_bytes: Vec<u8> = vec![0; 37];


    save_file_content = replace_content_of_file(start_index, zero_bytes, save_file_content);
    save_file_content = replace_content_of_file(chunk_index, zero_chunk_bytes, save_file_content);

    save_file_content
}

/// Represents a method for replacing the file content.
/// 
/// ### Parameter
/// - `replace_index`: The index on where the value is beeing replaced.
/// - `replace_value`: The new value.
/// - `content`: The content of the current file.
/// 
/// ### Returns `Vec<u8>`
/// The new content of the save file.
fn replace_content_of_file(replace_index: usize, replace_value: Vec<u8>, mut content: Vec<u8>) -> Vec<u8> {
    // Check if all indices are within bounds
    if replace_index + replace_value.len() < content.len() {
        for i in 0..replace_value.len() {
            content[replace_index + i] = replace_value[i];
        }

        content
    } else {
        content
    }
}

/// Represents the method for finding all base skills inside the save.
/// 
/// ### Parameter
/// - `content`: The byte data of the current save.
/// 
/// ### Returns `Vec<String>`
/// All found base skill names.
fn find_base_skill_matches(content: &[u8]) -> Vec<String> {
    // Convert the byte data to string to check regex patterns.
    let string_data: String = String::from_utf8_lossy(content).to_string();
    // The Regex pattern to match base skills.
    let pattern: &str = r"([A-Za-z0-9_]+_skill)";
    // Defines the regex instance.
    let regex: Regex = Regex::new(pattern).expect("Failed to create regex");

    // Find all matches convert them to String and filter all matches that start with LP_
    let matches: Vec<String> = regex
        .find_iter(&string_data)
        .map(|m| m.as_str().to_string())
        .filter(|s| !s.contains("LP_"))
        .collect();

    matches
}

/// Represents the method for finding all legend skills inside the save.
/// 
/// ### Parameter
/// - `content`: The byte data of the current save.
/// 
/// ### Returns `Vec<String>`
/// All found legend skill names.
fn find_legend_skill_matches(content: &[u8]) -> Vec<String> {
    // Convert the byte data to string to check regex patterns.
    let string_data: String = String::from_utf8_lossy(content).to_string();
    // The Regex pattern to match base skills.
    let pattern: &str = r"(LP_[A-Za-z0-9_]+_skill)";
    // Defines the regex instance.
    let regex: Regex = Regex::new(pattern).expect("Failed to create regex");

    // Find all matches convert them to String.
    let matches: Vec<String> = regex
        .find_iter(&string_data)
        .map(|m| m.as_str().trim().to_string())
        .collect();

    matches
}

/// Represents the method for analyzing the found skill matches and finds the corresponding index.
/// 
/// ### Parameter
/// - `data`: The needed byte data of the current save.
/// - `base_matches`: All base skill names that match the skill pattern.
/// - `legend_matches`: All legend skill names that match the skill pattern.
/// 
/// ### Returns `Skills`
/// All matching skills.
fn analize_skill_data(
    data: &[u8],
    base_matches: &[String],
    legend_matches: &[String],
) -> Skills {
    // Prepare data.
    let mut base_skills: Vec<SkillItem> = Vec::new();
    let mut legend_skills: Vec<SkillItem> = Vec::new();
    let mut last_index: usize = 0;

    // Iterate through all base skill matches.
    for base_match in base_matches {
        // Get needed data like bytes, index, point data.
        let match_bytes: &[u8] = base_match.as_bytes();
        let index: usize = get_index_from_sequence(data, &last_index, match_bytes, true);
        let name: String = base_match.trim().to_string();
        let extracted_bytes: &[u8] = &data[index + match_bytes.len() .. index + match_bytes.len() + 2];
        let skill_item: SkillItem = SkillItem::new(
            name,
            index,
            match_bytes.len(),
            match_bytes.to_vec(),
            extracted_bytes.to_vec(),
        );

        base_skills.push(skill_item);
        // Update index to improve performance.
        last_index = index;
    }

    // Reset index for legend skills
    last_index = 0;

    // Iterate through all legend skill matches.
    for legend_match in legend_matches {
        // Get needed data like bytes, index, point data.
        let match_bytes: &[u8] = legend_match.as_bytes();
        let index: usize = get_index_from_sequence(data, &last_index, match_bytes, true);
        let name: String = legend_match.trim().to_string();
        let extracted_bytes: &[u8] = &data[index + match_bytes.len() .. index + match_bytes.len() + 2];

        let skill_item: SkillItem = SkillItem::new(
            name,
            index,
            match_bytes.len(),
            match_bytes.to_vec(),
            extracted_bytes.to_vec(),
        );

        legend_skills.push(skill_item);
        // Update index to improve performance.
        last_index = index;
    }

    Skills::new(
        base_skills,
        legend_skills,
    )
}

/// Represents a method for analyzing and extracting the data for each unlockable item.
/// 
/// ### Parameter
/// - `content`: The byte data of the save.
/// 
/// ### Returns `Vec<UnlockableItem>`
/// All unlockable items inside the inventory.
fn analize_unlockable_items_data(content: &[u8]) -> Vec<UnlockableItem> {
    // Finds all inventory sequences inside the file.
    let indices: Vec<usize> = get_all_indices_from_sequence(content, &0, &START_INVENTORY, false);
    let mut items: Vec<UnlockableItem> = Vec::new();


    // Checks if the sequence is not valid.
    if indices.len() == 0 {
        panic!("Start pattern(s) not found in file.");
    }

    // Takes the second inventory index for needed information.
    let start_index: usize = indices[indices.len() - 1];
    // Compresses the data and only extracts the inventory part of the file.
    let inventory_data: &[u8] = &content[start_index..];
    // Prepares a list of all matching strings.
    let mut matching_string_indices: Vec<usize> = Vec::new();

    // Checks for all unlockableitem IDs.
    // The "_" is important, so that it doesn't include items like "hint_collectable".
    let mut collectable_indices: Vec<usize> = get_all_indices_from_sequence(inventory_data, &0, format!("{:?}_", ItemTypeEnum::Collectable).as_bytes(), true);
    let mut craftplan_indices: Vec<usize> = get_all_indices_from_sequence(inventory_data, &0, format!("{:?}_", ItemTypeEnum::Craftplan).as_bytes(), true);
    let mut tool_skin_indices: Vec<usize> = get_all_indices_from_sequence(inventory_data, &0, format!("{:?}_", ItemTypeEnum::ToolSkin).as_bytes(), true);
    matching_string_indices.append(&mut collectable_indices);
    matching_string_indices.append(&mut craftplan_indices);
    matching_string_indices.append(&mut tool_skin_indices);

    if matching_string_indices.len() == 0 {
        panic!("No matching unlockable item strings found.")
    }

    // Iterate through all matching indices.
    for i in 0..matching_string_indices.len() {
        // Cleans string and returns unwanted characters.
        let clean_string: String = get_full_string(&inventory_data, matching_string_indices[i]);
        let current_index: usize = matching_string_indices[i] + &start_index;
        let size: usize = clean_string.as_bytes().len();
        let sgd: Vec<u8> = inventory_data[matching_string_indices[i]..matching_string_indices[i] + size].to_vec();
        items.push(UnlockableItem::new(
            clean_string,
            current_index,
            size,
            sgd,
        ));
    }

    // Sorts the items by their index.
    items.sort_by(|a, b| a.index.cmp(&b.index));
    items
}

/// Represents a method for retrieving the index from where the inventory items start.
/// 
/// ### Parameter
/// - `unlockable_items`: The unlockable items.
/// - `file_content`: The byte data of the save.
/// 
/// ### Returns `usize`
/// The index from where the inventory items continue.
fn get_index_for_inventory_items(unlockable_items: &[UnlockableItem], file_content: &[u8]) -> usize {
    let start_index: usize = unlockable_items[0].index + unlockable_items[0].size;
    let string_content = String::from_utf8_lossy(&file_content[start_index..]);

    let sgd_position = get_index_from_sequence(&file_content[start_index..], &0, &[0, 83, 71, 68, 115], true);
    
    // -36 to get the chunk data from the first SGDs
    if sgd_position > 0 {
        return start_index + sgd_position - 36
    }

    // +75 as jump offset between unlockables and SGDs from items
    if unlockable_items.len() > 0 {
        return unlockable_items[unlockable_items.len() - 1].index + unlockable_items[unlockable_items.len() - 1].size + 76
    } else {
        0 // Default return value if no match is found
    }
}

/// Represents the method for finding all items inside the inventory.
/// 
/// ### Parameter
/// - `content`: The byte data of the current selected save.
/// - `start_index`: The start index of the inventory data.
/// 
/// ### Returns `Vec<Vec<InventoryItem>>`
/// The list of all different item sections.
/// Each section contains a list of items, for example: gear, weapons, etc....
fn get_all_items(content: &[u8], start_index: usize) -> Vec<InventoryItemRow> {
    // Prepare data.
    let mut items: Vec<InventoryItemRow> = Vec::new();
    let mut index: usize = start_index;

    loop {
        // Prepare the inner item section.
        let mut inner_item_list: Vec<InventoryItem> = Vec::new();
        // Find all data chunks for the section.
        let (chunks, new_index) = find_all_inventory_chunks(content, index);

        // Check if there are no chunks left.
        if chunks.len() == 0 {
            break;
        }

        // Find the corresponding matches to each chunk (Including Mod data).
        let (current_item_ids, current_item_indices) = find_amount_of_matches(content, new_index, chunks.len());

        // Preparing iteration data.
        let mut mod_counter: usize = 0;
        let mut current_item_id: String = String::new();
        let mut current_item_index: usize = 0;
        let mut chunk_counter: usize = chunks.len() - 1;
        let mut current_inv_chunk: InventoryChunk = chunks[chunk_counter].clone();
        let mut match_bytes: &[u8] = current_item_id.as_bytes();
        let mut mods: Vec<Mod> = Vec::new();

        // iterate through each found match and validate the position of the match.
        for i in 0..current_item_ids.len() {
            // Check if the match is an item or a mod.
            if !&current_item_ids[i].contains("Mod") && !&current_item_ids[i].contains("charm") && &current_item_ids[i] != "NoneSGDs" && &current_item_ids[i] != "SGDs" {
                // Check if the bullet acts as item or mod or if there is a transmog item.
                if ((current_item_ids[i].contains("Bullet") && mod_counter > 0 && mod_counter < 4) || (current_item_ids[i].contains("Craftplan") && mod_counter < 4)) || mod_counter == 3 {
                    mods.push(Mod::new(
                        current_item_ids[i].clone(),
                        current_item_indices[i],
                        content[current_item_indices[i] .. current_item_indices[i] + 30].to_vec(),
                    ));

                    mod_counter += 1;
                    continue;
                }    
                
                // Add the previous item (if exists) to the list.
                if current_item_id != String::new() && !mods.is_empty() {
                    inner_item_list.push(InventoryItem::new(
                        current_item_id.replace("\x00", "").replace("\x01", ""),
                        current_item_index,
                        match_bytes.len(),
                        match_bytes.to_vec(),
                        current_inv_chunk.clone(),
                        mods.clone(),
                    ));

                    mod_counter = 0;
                    mods.clear();
                }

                // Set the current item initialization.
                current_item_id = current_item_ids[i].trim_end_matches("SGDs").to_string();
                match_bytes = current_item_ids[i].as_bytes();
                current_item_index = current_item_indices[i];
                current_inv_chunk = chunks[chunk_counter].clone();
                
                if chunk_counter > 0 {
                    chunk_counter -= 1;
                }
            }
            // Add mod to mods list
            else {
                mods.push(Mod::new(
                    current_item_ids[i].to_string(),
                    current_item_indices[i],
                    content[current_item_indices[i] .. current_item_indices[i] + 30].to_vec(),
                ));

                mod_counter += 1;
            }
        }
    
        // Add the last item to the inner section.
        inner_item_list.push(InventoryItem::new(
            current_item_id.replace("\x00", "").replace("\x01", ""),
            current_item_index,
            match_bytes.len(),
            match_bytes.to_vec(),
            current_inv_chunk.clone(),
            mods.clone(),
        ));

        // Add the inner section to the item list and fix the index by offset.
        items.push(create_item_row(inner_item_list.clone()));
        let last_mod: &Mod = &inner_item_list[inner_item_list.clone().len() - 1].mod_data[inner_item_list[inner_item_list.clone().len() - 1].mod_data.len() - 1];
        index = last_mod.index + last_mod.name.len();
        index += 75;
    }

    items
}

fn create_item_row(items: Vec<InventoryItem>) -> InventoryItemRow {
    for item in items.iter() {
        if item.name.contains("Token") || item.name.contains("Ticket") {
            return InventoryItemRow::new("Tokens/Tickets".to_string(), items);
        }
        else if item.name.contains("Keyfinder") || item.name.contains("Binoculars") {
            return InventoryItemRow::new("Equipment".to_string(), items);
        }
        else if item.name.contains("Outfit") || item.name.contains("Craft") || item.name.contains("Plant") {
            return InventoryItemRow::new("Outfits/Craftresources".to_string(), items);
        }
        else if item.name.contains("Potion") || item.name.contains("Booster")  || item.name.contains("Medkit") || item.name.contains("Flare") {
            return InventoryItemRow::new("Consumables".to_string(), items);
        }
        else if item.name.contains("KaDoom") || item.name.contains("Broom") || item.name.contains("Throwable") || (item.name.contains("wpn") && item.name.contains("challenge")) {
            return InventoryItemRow::new("Accessories".to_string(), items);
        }
        else if item.name.contains("Quest") {
            return InventoryItemRow::new("Quest Items".to_string(), items);
        }
        else if item.name.contains("Bullet") {
            return InventoryItemRow::new("Ammunition".to_string(), items);
        }
        else if item.name.contains("wpn") && !item.name.contains("challenge") {
            return InventoryItemRow::new("Weapons".to_string(), items);
        }
    }

    InventoryItemRow::new("Items".to_string(), items)
}

/// Represents a method for finding all SGD chunks inside the inventory.
/// 
/// ### Parameter
/// - `content`: The byte data of the current save file.
/// - `start_index`: The starting index on where the search begins.
/// 
/// ### Returns `(Vec<InventoryItem>, usize)`
/// The array of all found chunks inside the inventory and the last position to increase further performance.
fn find_all_inventory_chunks(content: &[u8], start_index: usize) -> (Vec<InventoryChunk>, usize) {
    // Checks if the index is out of range.
    if start_index > content.len() {
        panic!("The start_index must not be greater than the content length.")
    }

    // Prepare chunk vector.
    let mut chunks: Vec<InventoryChunk> = Vec::new();

    // Prepare offsets.
    let level_offset: usize = 2;
    let seed_offset: usize = 2;
    let amount_offset: usize = 4;
    let durability_offset: usize = 4;
    let space_offset: usize = 25;
    let data_offset: usize = level_offset + seed_offset + amount_offset + durability_offset + space_offset;

    // Finding all SGD matches and their corresponding indices.
    let (match_values, match_indices) = get_sgd_matches(&content, start_index);

    // Check if no matches where found.
    if match_values.is_empty() {
        return (chunks, 0);
    } else {
        // Iterate through each value and get the needed 12 Bytes of data.
        for i in 0..match_values.len() {
            let data_index: usize = match_indices[i] - data_offset;

            // Extracts the content
            let mut index: usize = data_index;
            let level_data: Vec<u8> = content[index..index+level_offset].to_vec();
            index += level_offset;
            let seed_data: Vec<u8> = content[index..index+seed_offset].to_vec();
            index += seed_offset;
            let amount_data: Vec<u8> = content[index..index+amount_offset].to_vec();
            index += amount_offset;
            let durability_data: Vec<u8> = content[index..index+durability_offset].to_vec();
            index += durability_offset;
            let chunk_space: Vec<u8> = content[index..index+space_offset].to_vec();

            chunks.push(InventoryChunk::new(
                level_data,
                seed_data,
                amount_data,
                durability_data,
                chunk_space,
                data_index,
            ));
        }

        // The 4 is for the SGDs name offset.
        let last_index: usize = chunks.last().map_or(start_index, |chunk| chunk.index + data_offset + 4);

        (chunks, last_index)
    }
}

/// Represents a method for finding all sgd matches inside the range.
/// 
/// ### Parameter
/// - `content`: The byte data of the current save.
/// - `start_index`: The index from where the search starts.
/// 
/// ### Returns `(Vec<String>, usize)`
/// The array of all found sgd matches inside the inventory and the last position to increase further performance.
fn get_sgd_matches(content: &[u8], start_index: usize) -> (Vec<String>, Vec<usize>) {
    // Preparing data.
    let mut match_values: Vec<String> = Vec::new();
    // Convert the byte data to string to check regex patterns.
    let string_data: String = String::from_utf8_lossy(&content[start_index..]).to_string();
    // The Regex pattern to match base skills.
    let pattern: &str = r"[A-Za-z0-9_]*SGDs";
    // Defines the regex instance.
    let re: Regex = Regex::new(pattern).unwrap();
    let mut match_iter = re.find_iter(&string_data);
    let mut curr_index = start_index;

    // iterate through each match.
    while let Some(mat) = match_iter.next() {
        // Looking for all SGDs inside the current chunk.
        if mat.end() - mat.start() == 4 {
            let tmp_match_value = mat.as_str().to_string();
            let match_index = get_index_from_sequence(content, &curr_index, tmp_match_value.as_bytes(), true);
            let previous_distance_for_sgds_1 = &content[match_index - 116..match_index - 112];
            let previous_distance_for_sgds_2 = &content[match_index - 180..match_index - 176];

            if String::from_utf8_lossy(previous_distance_for_sgds_1) == "SGDs" || String::from_utf8_lossy(previous_distance_for_sgds_2) == "SGDs" {
                curr_index = match_index + 4;
                match_values.push(tmp_match_value);
            } else {
                break;
            }
        } else {
            break;
        }
    }

    let mut match_indices: Vec<usize> = get_indices_from_values(&content, start_index, &match_values);

    // Check if Savegame section is between the start and the first SGDs.
    let mut first_index: usize = 0;

    if match_values.len() >= 1 {
        first_index = match_indices[0];
    }
    
    let is_savegame: bool = is_savegame_between(&content, start_index, first_index);

    // Reset matches if savegame is between.
    if is_savegame {
        match_values.clear();
        match_indices.clear();
    }

    (match_values, match_indices)
}

fn is_savegame_between(content: &[u8], start_index: usize, end_index: usize) -> bool {
    if start_index >= end_index {
        return true;
    }
    
    let target_data: &[u8] = &content[start_index..end_index];
    let index: usize = get_index_from_sequence(target_data, &0, "Savegame".as_bytes(), true);

    if index <= 0 {
        false
    } else {
        true
    }
}

/// Represents the method for finding all matches for each chunk.
/// 
/// ### Parameter
/// - `content`: The byte data of the inventory.
/// - `start_index`: The start index of the search.
/// - `amount`: The amount of chunks found for the current section. 
/// 
/// ### Returns `(Vec<String>, Vec<usize>)`
/// A tuple that contains the matches for the current chunk and their corresponding index.
fn find_amount_of_matches(content: &[u8], start_index: usize, amount: usize) -> (Vec<String>, Vec<usize>) {
    // Prepare data.
    let mut counter: usize = 0;
    let mut mod_counter: i32 = 0;
    let mut match_values: Vec<String> = Vec::new();
    // Convert the byte data to string to check regex patterns.
    let string_data = String::from_utf8_lossy(&content[start_index..]);

    // The Regex pattern to match the sgds.
    let pattern: &str = r"(?:[a-zA-Z0-9_]{4,}(?:\x00*))*SGDs";

    // Defines the regex instances.
    let re: Regex = Regex::new(pattern).expect("Invalid regex pattern.");
    let savegame_re: Regex = Regex::new("Savegame").expect("Invalid regex pattern.");
    let is_savegame_match: bool = savegame_re.is_match(&string_data);

    for mat in re.find_iter(&string_data) {
        // There are mod slots for each item. Even tokens, I mean why not Techland, right?
        // Check if the amount of item matches is in range and if the length of the match is at least 4.
        if counter <= amount && mat.as_str().len() >= 4 {
            // Check if it is an item or a mod.
            if !mat.as_str().contains("Mod") && !mat.as_str().contains("charm") &&
                mat.as_str() != "NoneSGDs" && mat.as_str() != "SGDs" {
                    // Check if the bullet acts as item or mod.
                    if ((mat.as_str().contains("Bullet") || mat.as_str().contains("Craftplan")) && mod_counter > 0 && mod_counter <= 4) || mod_counter == 4 {                        
                        // Check if the current SGD is valid
                        let tmp_matching_value = mat.as_str().to_string();
                        let index = get_index_from_sequence(content, &start_index, &tmp_matching_value.as_bytes(), true);
                        let size_bytes = &content[index - 2..index].to_vec();
                        let size = u16::from_le_bytes(size_bytes.clone().try_into().unwrap()) as usize;

                        // Compares if the SGDs have the correct size
                        if size > 0 {
                            if tmp_matching_value.clone().ends_with("SGDs") && size + 4 == tmp_matching_value.clone().len() {
                                match_values.push(tmp_matching_value.clone());
                                mod_counter += 1;
                            } else if !tmp_matching_value.clone().ends_with("SGDs") && size > tmp_matching_value.clone().len() {
                                // Include spaces between item name and SGDs
                                let longer_match_value = String::from_utf8_lossy(&content[index..index + size + 4]);

                                if longer_match_value.ends_with("SGDs") {
                                    match_values.push(longer_match_value.to_string());
                                    mod_counter += 1;
                                } else {
                                    continue;
                                }
                            }
                        } else {
                            continue;
                        }

                        continue;
                    }

                    // update data.
                    counter += 1;
                    mod_counter = 0;
                } 
                // Checks if the SGDs is at the end of the found list.
                else if mat.as_str() == "SGDs" && mod_counter != 4 {
                    break;
                } 
                // Checks if the match equals SGDs, since it is also possible for weapon mods.
                else if mat.as_str() == "SGDs" {
                    // Check if Savegame indicator is between
                    if is_savegame_match {
                        if let Some(savegame) = savegame_re.find(&string_data) {
                            if savegame.start() < mat.start() {
                                break;
                            }
                        }
                    }

                    match_values.push(mat.as_str().to_string());
                    continue;
                }

                let tmp_matching_value = mat.as_str().to_string();
                let index = get_index_from_sequence(content, &start_index, &tmp_matching_value.as_bytes(), true);
                let size_bytes = &content[index - 2..index].to_vec();
                let size = u16::from_le_bytes(size_bytes.clone().try_into().unwrap()) as usize;

                if size > 0 {
                    if tmp_matching_value.clone().ends_with("SGDs") && size + 4 == tmp_matching_value.clone().len() {
                        match_values.push(tmp_matching_value.clone());
                        mod_counter += 1;
                    } else if !tmp_matching_value.clone().ends_with("SGDs") && size > tmp_matching_value.clone().len() {
                        let longer_match_value = String::from_utf8_lossy(&content[index..index + size + 4]);

                        if longer_match_value.ends_with("SGDs") {
                            match_values.push(longer_match_value.to_string());
                            mod_counter += 1;
                        } else {
                            continue;
                        }
                    }
                } else {
                    continue;
                }
        } else {
            break;
        }
    }

    // Gets indices for all collected matches.
    let match_indices = get_indices_from_values(&content, start_index, &match_values);
    (match_values, match_indices)

}

/// Represents a method for finding the indices for each matching value.
/// 
/// ### Parameter
/// - `content`: The byte data of the save.
/// - `start_index`: The starting index of the inventory.
/// - `values`: The matching values of the items.
/// 
/// ### Returns `Vec<usize>`
/// The indices for each matching value.
fn get_indices_from_values(content: &[u8], start_index: usize, values: &[String]) -> Vec<usize>{
    // Prepare indices vector.
    let mut indices: Vec<usize> = Vec::new();

    // Get first index.
    if values.len() > 0 {
        let first_index: usize = get_index_from_sequence(content, &start_index, &values[0].as_bytes(), true);
        indices.push(first_index);
    }

    // Seperates the content into blocks and returns position if found. 
    for i in 1..values.len() {
        let last_index: usize = indices[i - 1];
        let match_bytes: &[u8] = values[i].as_bytes();
        let current_index: usize = last_index + &values[i - 1].as_bytes().len();

        indices.push(get_index_from_sequence(content, &current_index, match_bytes, true));
    }

    indices
}

/// Represents a method for finding a specific sequence inside an array.
/// 
/// ### Parameter
/// - `content`: The byte data of the current save snippet.
/// - `start_index`: The starting index of the iteration.
/// - `sequence`: The wanted sequence.
/// - `get_started`: Indicates whether it should return the start index of the sequence or the end index.
/// 
/// ### Returns `usize`
/// The index of the specific sequence.
fn get_index_from_sequence(content: &[u8], start_index: &usize, sequence: &[u8], get_start: bool) -> usize {
    let mut counter: usize = *start_index;

    // iterates through the data.
    loop {
        if counter >= content.len() {
            return 0;
        }

        // resets values for each inner iteration.
        let mut is_valid = true;
        let mut last_index: usize = 0;

        // checks if the sequence starts with the same value as the current data.
        for i in 0..sequence.len() {
            last_index = counter + i;
            if content[last_index] != sequence[i] {
                is_valid = false;
                break;
            } 
        }   
        
        // checks if it should return the start or the end position.
        if is_valid && get_start {
            return counter;
        } else if is_valid {
            return last_index + 1;
        }

        counter += 1;
    }
}

/// Represents a method for finding all sequences inside an byte array.
/// 
/// ### Parameter
/// - `content`: The byte data of the current save snippet.
/// - `start_index`: The starting index of the iteration.
/// - `sequence`: The wanted sequence.
/// - `get_started`: Indicates whether it should return the start index of the sequence or the end index.
/// 
/// ### Returns `Vec<usize>`
/// The indizes for each found sequence.
fn get_all_indices_from_sequence(content: &[u8], start_index: &usize, sequence: &[u8], get_start: bool) -> Vec<usize> {
    // Prepare data.
    let mut counter: usize = *start_index;
    let mut indices: Vec<usize> = Vec::new();

    // iterates through the data.
    loop {
        if counter >= content.len() - sequence.len()     {
            break;
        }

        // resets values for each inner iteration.
        let mut is_valid: bool = true;
        let mut last_index: usize = 0;

        // checks if the sequence starts with the same value as the current data.
        for i in 0..sequence.len() {
            last_index = counter + i;
            if content[last_index] != sequence[i] {
                is_valid = false;
                break;
            } 
        }   
        
        // checks if it should push the start or the end position.
        if is_valid && get_start {
            indices.push(counter);
        } else if is_valid {
            indices.push(last_index + 1);
        }

        counter += 1;
    }

    indices
}

/// Represents a method for retreiving the byte content from a save file.
/// 
/// ### Parameter
/// - `file_path`: The save file.
/// 
/// ### Returns `Result<Vec<u8>>`
/// The byte data from the current selected save file.
pub fn get_contents_from_file(file_path: &str) -> Result<Vec<u8>> {
    let mut file = fs::File::open(file_path)?;

    // Get the file size for allocating the byte array
    let file_size = file.metadata()?.len() as usize;

    // Create a byte array to hold the file contents
    let mut file_contents = vec![0; file_size];

    // Read the binary data from the file into the byte array
    file.read_exact(&mut file_contents)?;
    
    Ok(file_contents)
}

/// Represents a method for creating a backup file.
/// 
/// ### Parameter
/// - `file_path`: The save file.
/// - `file_content`: The content of the file.
pub fn create_backup_from_file(file_path: &str, file_content: &[u8]) {
    let backup_path = format!("{}.bak", file_path);
    let mut file = fs::File::create(&backup_path).unwrap();
    file.write_all(file_content).unwrap();
}

/// Represents a method for converting to string and removing unnecessary characters.
/// 
/// ### Parameter
/// - `data`: The byte data from the current selected file.
/// - `index`: The index from where the string starts.
/// 
/// ### Returns `String`
/// The full trimmed string. 
fn get_full_string(data: &[u8], index: usize) -> String {
    for i in index..data.len() {
        if data[i] == b'\x00' {
            let extracted_bytes = &data[index..i];
            return String::from_utf8_lossy(extracted_bytes)
            .replace("\x00", "")
            .replace("\x01", "")
            .to_string();
        }
    }

    let extracted_bytes = &data[index..data.len()];
    String::from_utf8_lossy(extracted_bytes)
        .replace("\x00", "")
        .to_string()
}