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
use regex::Regex;
use flate2::write::GzEncoder;
use flate2::Compression;
use crate::logger::{ConsoleLogger, LoggerFunctions};
// Import all struct datas.
use crate::save_logic::struct_data::{
    SaveFile, 
    Skills, 
    SkillItem,
    UnlockableItem,
    ItemTypeEnum,
    InventoryItem,
    InventoryItemRow,
    InventoryChunk,
    IdData,
};

use super::struct_data::Mod;

// Define global result definition for easier readability.
type Result<T> = std::result::Result<T,Box<dyn Error>>;

// Defines the first sequence for the skill section.
static START_SKILLS: &[u8] = b"Skills::SkillInstance";

// Defines the last sequence for the skill section.
static END_SKILLS: [u8; 33] = [
    0x50, 0x72, 0x6F, 0x67, 0x72, 0x65, 0x73, 0x73,
    0x69, 0x6F, 0x6E, 0x53, 0x74, 0x61, 0x74, 0x65,
    0x3A, 0x3A, 0x45, 0x45, 0x6C, 0x65, 0x6D, 0x65,
    0x6E, 0x74, 0x56, 0x65, 0x72, 0x73, 0x69, 0x6F,
    0x6E
];

static START_INVENTORY: [u8; 15] = [
    0x4D, 0x61, 0x69, 0x6E, 0x01, 0x00, 0x00, 0x00, 0x05, 
    0x00, 0x4F, 0x74, 0x68, 0x65, 0x72
];

/// Represents a method for loading a savefile and preparing all necessary information.
/// 
/// ### Parameter
/// - `file_path`: The filepath of the current selected save.
/// - `file_content`: The content of the current file.
/// - `ids`: The list of all IDs.
/// - `logger`: The console logger that logs every event.
/// - `is_debugging`: Indicates whether the file analyser is in debugging mode or not.
/// 
/// ### Returns `SaveFile`
/// The save file with all collected data.
pub fn load_save_file(
    file_path: &str,
    file_content: Vec<u8>,
    ids: Vec<IdData>,
    logger: &mut ConsoleLogger,
    is_debugging: bool
) -> Result<SaveFile> {   
    // Gets the indices of the skill data.
    let skill_start_index: usize = get_index_from_sequence(&file_content, &0, &START_SKILLS, true);
    let skill_end_index: usize = get_index_from_sequence(&file_content, &skill_start_index, &END_SKILLS, true);
    
    // Check if there was an error while trying to get the indices.
    if skill_start_index == 0 || skill_end_index == 0 {
        return Err("It appears the file provided does not fit the save file structure. Please check if the path is set to a valid save file.".into());
    }
    
    let skill_data_range: &[u8] = &file_content[skill_start_index - 1 .. skill_end_index];

    // Collect all skills.
    let base_skills: Vec<String> = find_base_skill_matches(&skill_data_range);
    let legend_skills: Vec<String> = find_legend_skill_matches(&skill_data_range);
    
    // Check if the editor did not find a base skill which is essential for analysing the save.
    if base_skills.len() == 0 {
        return Err("In the skill section, the editor could not validate a single skill.".into());
    }
    
    let skills = analize_skill_data(&file_content, &base_skills, &legend_skills, logger, is_debugging);
    
    // Check if the editor did not manage to validate the skills.
    match &skills {
        Ok(skills_unwrapped) => {
            logger.log_message(&format!("{} Skills got validated", skills_unwrapped.base_skills.len() + skills_unwrapped.legend_skills.len()), Vec::new());

            // Wait for user input to continue with the analysation.
            if is_debugging {
                logger.wait_for_input();
            }
        },
        Err(err) => return Err(err.to_string().into())
    }

    // Find all unlockable items.
    let unlockable_result: Result<Vec<UnlockableItem>> = analize_unlockable_items_data(&file_content, logger, is_debugging);
    
    // Check if the editor did not manage to validate the unlockables.
    match &unlockable_result {
        Ok(unlocks) => {
            logger.log_message(&format!("{} Unlockables got validated.", unlocks.len()), Vec::new());

            // Wait for user input to continue with the analysation.
            if is_debugging {
                logger.wait_for_input();
            }
        },
        Err(err) => return Err(err.to_string().into())
    }
    
    let unlockable_items = unlockable_result?; 
    let index_inventory_items_result: Result<usize> = get_index_for_inventory_items(&unlockable_items, &file_content, logger, is_debugging);

    // Check if the editor did not manage to validate the inventory index.
    match &index_inventory_items_result {
        Ok(_) => {            
            // Wait for user input to continue with the analysation.
            if is_debugging {
                logger.wait_for_input();
            }
        },
        Err(err) => return Err(err.to_string().into())
    }

    let index_inventory_items: usize = index_inventory_items_result.unwrap();

    // Get all items within the inventory.
    let items_result: Result<Vec<InventoryItemRow>> = get_all_items(&file_content, index_inventory_items, ids, logger, is_debugging);

    // Check if the editor did not manage to validate the unlockables.
    match &items_result {
        Ok(i) => {
            logger.log_message(&format!("{} Tabs from inventory got validated.", i.len()), Vec::new());

            // Wait for user input to continue with the analysation.
            if is_debugging {
                logger.wait_for_input();
            }
        },
        Err(err) => return Err(err.to_string().into())
    }

    Ok(SaveFile::new(
        file_path.to_string(),
        file_content,
        skills.unwrap().clone(),
        unlockable_items,
        items_result?,
        logger.log_histroy.clone()
    ))
}

/// Represents a method for loading a PC savefile and preparing all necessary information.
/// 
/// ### Parameter
/// - `file_path`: The filepath of the current selected save.
/// - `compressed`: The compressed content of the current file.
/// - `ids`: The list of all IDs.
/// - `logger`: The console logger that logs every event.
/// - `is_debugging`: Indicates whether the file analyser is in debugging mode or not.
/// 
/// ### Returns `SaveFile`
/// The save file with all collected data.
pub fn load_save_file_pc(
    file_path: &str,
    compressed: Vec<u8>,
    ids: Vec<IdData>,
    logger: &mut ConsoleLogger,
    is_debugging: bool
) -> Result<SaveFile> {
    let mut gz = GzDecoder::new(&compressed[..]);
    let mut file_content = Vec::new();
    if let Err(error) = gz.read_to_end(&mut file_content) {
        return Err(format!("{} -> Make sure that the file you want to decompress is actually compressed.", error.to_string()).into());
    }

    load_save_file(file_path, file_content, ids, logger, is_debugging)
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
        save_file.items,
        save_file.log_history.clone()
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

    // Returns content
    save_file_content
}

/// Represents a method for editing the durability for all items in a section at once.
/// 
/// ### Parameter
/// - `item_chunks`: The list of all item chunks.
/// - `value`: The new durability value.
/// - `save_file_content`: The content of the save file.
/// 
/// ### Returns `(Vec<InventoryChunk>, Vec<u8>)`
/// The new content of the save file and all changed item chunks.
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

/// Represents a method for editing the amount for all items in a section at once.
/// 
/// ### Parameter
/// - `item_chunks`: The list of all item chunks.
/// - `value`: The new amount value.
/// - `save_file_content`: The content of the save file.
/// 
/// ### Returns `(Vec<InventoryChunk>, Vec<u8>)`
/// The new content of the save file and all changed item chunks.
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

/// Represents a method for removing an item from the inventory.
/// 
/// ### Parameter
/// - `start_index`: The starting index of the removed item.
/// - `end_index`: The ending index of the removed item.
/// - `chunk_index`: The chunk index of the removed item.
/// - `save_file_content`: The content of the save file.
/// 
/// ### Returns `Vec<u8>`
/// The new content of the save file.
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
/// - `logger`: The console logger that logs every event.
/// - `is_debugging`: Indicates whether the file analyser is in debugging mode or not.
/// 
/// ### Returns `Result<Skills>`
/// All matching skills.
fn analize_skill_data(
    data: &[u8],
    base_matches: &[String],
    legend_matches: &[String],
    logger: &mut ConsoleLogger,
    is_debugging: bool
) -> Result<Skills> {
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
        
        // If debuggin is set to true, log found collected data of current skill.
        if is_debugging {
            logger.log_message(&format!("Found at offset: [{}] the skill: [{}]", index, name).as_str(), Vec::new());
        }
        
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

        // If debugging is set to true, log found collected data of current skill.
        if is_debugging {
            logger.log_message(&format!("Found at offset: [{}] the skill: [{}]", index, name).as_str(), Vec::new());
        }

        let skill_item: SkillItem = SkillItem::new(
            name,
            index,
            match_bytes.len(),
            match_bytes.to_vec(),
            extracted_bytes.to_vec(),
        );

        legend_skills.push(skill_item);
        // Updates index to improve performance.
        last_index = index;
    }

    Ok(Skills::new(
        base_skills,
        legend_skills,
    ))
}

/// Represents a method for analyzing and extracting the data for each unlockable item.
/// 
/// ### Parameter
/// - `content`: The byte data of the save.
/// - `logger`: The console logger that logs every event.
/// - `is_debugging`: Indicates whether the file analyser is in debugging mode or not.
/// 
/// ### Returns `Result<Vec<UnlockableItem>>`
/// All unlockable items inside the inventory.
fn analize_unlockable_items_data(content: &[u8], logger: &mut ConsoleLogger, is_debugging: bool) -> Result<Vec<UnlockableItem>> {    
    // Finds all inventory sequences inside the file.
    let indices: Vec<usize> = get_all_indices_from_sequence(content, &0, &START_INVENTORY, false);
    let mut items: Vec<UnlockableItem> = Vec::new();


    // Checks if the sequence is not valid.
    if indices.len() == 0 {
        return Err("Start pattern(s) for unlockables not found in save".into());
    }

    // Takes the last inventory index for needed information.
    let start_index: usize = indices[indices.len() - 1];
    if is_debugging {
        logger.log_message(&format!("The starting index for the unlockables is: [{}]", start_index), Vec::new());
    }

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
        return Err("No matching unlockable item strings found. in save".into())
    }

    // Iterate through all matching indices.
    for i in 0..matching_string_indices.len() {
        // Cleans string and returns unwanted characters.
        let clean_string: String = get_full_string(&inventory_data, matching_string_indices[i]);
        let current_index: usize = matching_string_indices[i] + &start_index;
        let size: usize = clean_string.as_bytes().len();
        let sgd: Vec<u8> = inventory_data[matching_string_indices[i]..matching_string_indices[i] + size].to_vec();
        
        // If debugging is set to true, log collected data of current unlockable.
        if is_debugging {
            logger.log_message(&format!("Found the unlockable: [{}]", clean_string).as_str(), Vec::new());
        }

        items.push(UnlockableItem::new(
            clean_string,
            current_index,
            size,
            sgd,
        ));
    }

    // Sorts the items by their index.
    items.sort_by(|a, b| a.index.cmp(&b.index));
    Ok(items)
}

/// Represents a method for retrieving the index from where the inventory items start.
/// 
/// ### Parameter
/// - `unlockable_items`: The unlockable items.
/// - `file_content`: The byte data of the save.
/// - `logger`: The console logger that logs every event.
/// - `is_debugging`: Indicates whether the file analyser is in debugging mode or not.
/// 
/// ### Returns `usize`
/// The index from where the inventory items continue.
fn get_index_for_inventory_items(unlockable_items: &[UnlockableItem], file_content: &[u8], logger: &mut ConsoleLogger, is_debugging: bool) -> Result<usize> {
    let start_index: usize = unlockable_items[0].index + unlockable_items[0].size;

    let sgd_position = get_index_from_sequence(&file_content[start_index..], &0, &[0, 83, 71, 68, 115], true);
    
    // -36 to get the chunk data from the first SGDs
    if sgd_position > 0 {
        let inventory_index = start_index + sgd_position - 36;
        
        if is_debugging {
            logger.log_message(format!("The starting index of the inventory is expected to be at [{}]; (the first SGDs Data)", inventory_index).as_str(), Vec::new())
        }

        return Ok(inventory_index)
    }

    // +76 as jump offset between unlockables and SGDs from items
    if unlockable_items.len() > 0 {
        let inventory_index = unlockable_items[unlockable_items.len() - 1].index + unlockable_items[unlockable_items.len() - 1].size + 76;
        if is_debugging {
            logger.log_message(format!("The starting index of the inventory is expected to be at [{}]; (the first SGDs Data)", inventory_index).as_str(), Vec::new())
        }
        Ok(inventory_index)
    } else {
        Err("There was no match regarding the start index of the inventory.".into())
    }
}

/// Represents the method for finding all items inside the inventory.
/// 
/// ### Parameter
/// - `content`: The byte data of the current selected save.
/// - `start_index`: The start index of the inventory data.
/// - `ids`: The list of all IDs.
/// - `logger`: The console logger that logs every event.
/// - `is_debugging`: Indicates whether the file analyser is in debugging mode or not.
/// 
/// ### Returns `Vec<Vec<InventoryItem>>`
/// The list of all different item sections.
/// Each section contains a list of items, for example: gear, weapons, etc....
fn get_all_items(
    content: &[u8],
    start_index: usize,
    ids: Vec<IdData>,
    logger: &mut ConsoleLogger,
    is_debugging: bool
) -> Result<Vec<InventoryItemRow>> {
    // Prepare data.
    let mut items: Vec<InventoryItemRow> = Vec::new();
    let mut index: usize = start_index;

    loop {
        // Prepare the inner item section.
        let mut inner_item_list: Vec<InventoryItem> = Vec::new();
        // Find all data chunks for the section.
        let find_result = find_all_inventory_chunks(content, index, logger, is_debugging);
        
        match find_result {
            Ok((ref chunks, ref new_index)) => {
                logger.log_message(&format!("[{}] inventory chunks found. The new index is: [{}]", chunks.len(), new_index), Vec::new());
                logger.log_break();
                // Wait for user input to continue with the analysation.
                if is_debugging {
                    logger.wait_for_input();
                }
            },
            Err(_) => {
                break;
            }
        }

        let (chunks, new_index) = find_result.unwrap();

        // Find the corresponding matches to each chunk (Including Mod data).
        let (current_item_ids, current_item_indices) = find_amount_of_matches(content, new_index, chunks.len(), logger, is_debugging);

        // Preparing iteration data.
        let mut current_item_id: String = String::new();
        let mut current_item_index: usize = 0;
        let mut chunk_counter: usize = chunks.len() - 1;
        let mut current_inv_chunk: InventoryChunk = chunks[chunk_counter].clone();
        let mut match_bytes: &[u8] = current_item_id.as_bytes();
        let mut mods: Vec<Mod> = Vec::new();

        // iterate through each found match and validate the position of the match.
        for i in 0..current_item_ids.len() {
            // Check if the match is an item or a mod.
            if validate_item_or_mod(&current_item_ids[i]) {
                // Check if the bullet acts as item or mod or if there is a transmog item.
                if validate_item_or_transmog(&current_item_ids[i], &current_item_id) {
                    if is_debugging {
                        logger.log_message(&format!("Since this item can be item and mod, the editor validated it as a mod: [{}]", current_item_ids[i].to_string()), Vec::new());
                    }
                    
                    mods.push(Mod::new(
                        current_item_ids[i].clone(),
                        current_item_indices[i],
                        content[current_item_indices[i] .. current_item_indices[i] + 30].to_vec(),
                    ));

                    continue;
                } else if current_item_ids[i].to_lowercase().contains("outfit") && current_item_id.to_lowercase().contains("outfit") && current_item_indices[i] - (current_item_index + current_item_id.len()) <= 30 {
                    if is_debugging {
                        logger.log_message(&format!("Since this item can be item and transmog, the editor validated it as a transmog: [{}]", current_item_ids[i].to_string()), Vec::new());
                    }
                    
                    mods.push(Mod::new(
                        current_item_ids[i].clone(),
                        current_item_indices[i],
                        content[current_item_indices[i] .. current_item_indices[i] + 30].to_vec(),
                    ));

                    continue;
                }

                // Set the current item initialization.
                current_item_id = current_item_ids[i].trim_end_matches("SGDs").to_string();
                match_bytes = current_item_ids[i].as_bytes();
                current_item_index = current_item_indices[i];
                current_inv_chunk = chunks[chunk_counter].clone();
                
                // The chunk counter is decreased to get the correct chunk for the item, since the chunk is mirrored to the ids.
                if chunk_counter > 0 {
                    chunk_counter -= 1;
                } 
                
                // Add the previous item (if exists) to the list.
                if current_item_id != String::new() {
                    inner_item_list.push(InventoryItem::new(
                        current_item_id.replace("\x00", "").replace("\x01", ""),
                        current_item_index,
                        match_bytes.len(),
                        match_bytes.to_vec(),
                        current_inv_chunk.clone(),
                        mods.clone(),
                    ));

                    if is_debugging {
                        logger.log_message_no_linebreak(&format!("At offset [{}] validated item: ", current_item_index), Vec::new());
                        logger.log_message(&format!("[{}]", current_item_id.replace("\x00", "").replace("\x01", "")), vec![term::Attr::ForegroundColor(term::color::CYAN)]);
                    }

                    mods.clear();
                }   
            }
            // Add mod to mods list
            else {
                if is_debugging {
                    logger.log_message(&format!("Validated mod: [{}]", current_item_ids[i].to_string()), Vec::new());
                }

                mods.push(Mod::new(
                    current_item_ids[i].to_string(),
                    current_item_indices[i],
                    content[current_item_indices[i] .. current_item_indices[i] + 30].to_vec(),
                ));
            }
        }

        // Add the inner section to the item list.
        let item_row = create_item_row(inner_item_list.clone(), ids.clone());
        items.push(item_row);
        let last_inner_item: &InventoryItem = &inner_item_list.last().unwrap();
        index = last_inner_item.index;

        if last_inner_item.mod_data.len() > 0 {
            let last_mod: &Mod = last_inner_item.mod_data.last().unwrap();
            index = last_mod.index + last_mod.name.len();
        }

        // fix the index by offset.
        index += 75;

        if is_debugging {
            logger.log_message(&format!("Used the index of from the last mod and added the +75 to the offset for the next item: [{}]", index), Vec::new());
            logger.log_break();
            logger.wait_for_input();
        }
    }

    Ok(items)
}

fn validate_item_or_mod(current_match: &str) -> bool {
    if !current_match.to_lowercase().contains("mod") && !current_match.to_lowercase().contains("charm") {
        return true
    }

    false
}

fn validate_item_or_transmog(current_match: &str, last_match: &str) -> bool {
    if (current_match.to_lowercase().contains("bullet") || current_match.to_lowercase().contains("craftplan")) &&
    (last_match.to_lowercase().contains("bow") || (last_match.to_lowercase().contains("firearm") && !last_match.to_lowercase().contains("bullet")) || last_match.to_lowercase().contains("gun") || last_match.to_lowercase().contains("harpoon")) {
        return true
    }

    false
}

/// Represents the method for matching the item of each section to its dedicated row.
/// 
/// ### Parameter
/// - `items`: The item of a specific section.
/// - `ids`: The list of all IDs.
/// 
/// ### Returns `InventoryItemRow`
/// A specific itemrow with name and items inside.
fn create_item_row(items: Vec<InventoryItem>, ids: Vec<IdData>) -> InventoryItemRow {
    let mut tab_tokens = 0;
    let mut tab_equipment = 0;
    let mut tab_craftresources = 0;
    let mut tab_consumables = 0;
    let mut tab_accessories = 0;
    let mut tab_quest = 0;
    let mut tab_ammunition = 0;
    let mut tab_weapons = 0;
    let mut tab_item = 0;

    for item in items.iter() {
        let mut is_matched = false;
        for id_section in ids.iter() {
            if is_matched {
                break;
            }

            for id_name in id_section.ids.iter() {
                if is_matched {
                    break;
                }

                if item.name.contains(id_name) {
                    match id_section.filename.to_lowercase().as_str() {
                        "ammo" => tab_ammunition += 1,
                        "cash" => tab_item += 1,
                        "collectable" => tab_item += 1,
                        "craftcomponent" => tab_craftresources += 1,
                        "craftpart" => tab_craftresources += 1,
                        "equipment" => tab_equipment += 1,
                        "evolvingitem" => tab_item += 1,
                        "firearm" => tab_weapons += 1,
                        "flashlight" => tab_accessories += 1,
                        "inventoryitem" => tab_accessories += 1,
                        "itembundle" => tab_item += 1,
                        "lockpick" => tab_equipment += 1,
                        "lootpack" => tab_craftresources += 1,
                        "medkit" => tab_consumables += 1,
                        "melee" => tab_weapons += 1,
                        "other" => tab_quest += 1,
                        "outfitpart" => tab_craftresources += 1,
                        "powerup" => tab_consumables += 1,
                        "survivorpack" => tab_item += 1,
                        "syringeantizin" => tab_consumables += 1,
                        "throwable" => tab_accessories += 1,
                        "throwableliquid" => tab_accessories += 1,
                        "token" => tab_tokens += 1,
                        "uncategorized" => tab_item += 1,
                        "valuable" => tab_craftresources += 1,
                        "vehicleupgrade" => tab_item += 1,
                        "voucher" => tab_item += 1,
                        _ => tab_item += 1
                    }

                    is_matched = true;
                    break;
                }
            }
        }
    }

    // Initialize the counters
    let counters = vec![
        tab_tokens, tab_equipment, tab_craftresources, tab_consumables,
        tab_accessories, tab_quest, tab_ammunition, tab_weapons, tab_item
    ];

    // Find the maximum value among the counters
    let highest_counter = counters.iter().max().unwrap();

    // Perform actions based on the highest counter
    if highest_counter == &tab_tokens {
        return InventoryItemRow::new("Tokens/Tickets".to_string(), items);
    } else if highest_counter == &tab_equipment {
        return InventoryItemRow::new("Equipment".to_string(), items);
    } else if highest_counter == &tab_craftresources {
        return InventoryItemRow::new("Outfits/Craftresources".to_string(), items);
    } else if highest_counter == &tab_consumables {
        return InventoryItemRow::new("Consumables".to_string(), items);
    } else if highest_counter == &tab_accessories {
        return InventoryItemRow::new("Accessories".to_string(), items);
    } else if highest_counter == &tab_quest {
        return InventoryItemRow::new("Quest Items".to_string(), items);
    } else if highest_counter == &tab_ammunition {
        return InventoryItemRow::new("Ammunition".to_string(), items);
    } else if highest_counter == &tab_weapons {
        return InventoryItemRow::new("Weapons".to_string(), items);
    } else if highest_counter == &tab_item {
        return InventoryItemRow::new("Items".to_string(), items)
    }

    InventoryItemRow::new("Items".to_string(), items)
}

/// Represents a method for finding all SGD chunks inside the inventory.
/// 
/// ### Parameter
/// - `content`: The byte data of the current save file.
/// - `start_index`: The starting index on where the search begins.
/// - `logger`: The console logger that logs every event.
/// - `is_debugging`: Indicates whether the file analyser is in debugging mode or not.
/// 
/// ### Returns `Result<(Vec<InventoryItem>, usize)>`
/// The array of all found chunks inside the inventory and the last position to increase further performance.
fn find_all_inventory_chunks(content: &[u8], start_index: usize, logger: &mut ConsoleLogger, is_debugging: bool) -> Result<(Vec<InventoryChunk>, usize)> {
    // Checks if the index is out of range.
    if start_index > content.len() {
        return Err("The start_index must not be greater than the content length.".into());
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

    // Find the first SGD index.
    let first_sgds_index_result = find_first_sgd_index(content, start_index);

    if let Err(err) = first_sgds_index_result {
        return Err(err);
    }

    // Finding all SGD matches and their corresponding indices.
    let (match_values, match_indices) = get_sgd_matches(&content, first_sgds_index_result.unwrap());

    // Check if no matches where found.
    if match_values.is_empty() {
        return Err(format!("No matches found from the start index: [{}]", start_index).into());
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

            if is_debugging {
                logger.log_message(&format!("SGDs found at offset: [{}]", data_index), Vec::new());
            }

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

        Ok((chunks, last_index))
    }
}

/// Represents a method for finding the first sgd chunk after a completed itemrow.
/// 
/// ### Parameter
/// - `content`: The byte data of the current save file.
/// - `start_index`: The starting index on where the search begins.
/// 
/// ### Returns `Result<usize>`
/// The index of the first sgd chunk after a completed itemrow.
fn find_first_sgd_index(content: &[u8], start_index: usize) -> Result<usize> {
    let sgd: [u8; 5] = [0, 83, 71, 68, 115]; // SGDs and the 0 byte in front of it.
    let zero_bytes: Vec<u8> = vec![0; 2];
    let mut curr_index: usize = start_index;

    // Iterates through matches, since weapons can contain invalid SGDs too.
    loop {
        // Find SGDs.
        let match_index = get_index_from_sequence(content, &curr_index, &sgd, true);
        
        // Check if match did not work.
        if match_index == 0 {
            break;
        }
        
        // Check whether savegame is between the start index and the match index.
        let is_savegame_between = is_savegame_between(content, start_index, match_index);
        // Get the values in front of the match.
        let sgds_indicator = content[match_index - 5.. match_index - 3].to_vec();
        // Validate whether the SGDs is valid or not.
        if sgds_indicator != zero_bytes {
            // Check if Savegame indicator is between
            if is_savegame_between {
                return Ok(0);
            }
    
            return Ok(match_index);
        }

        // Didn't find a correct SGDs chunk. Might be an SGDs chunk inside a weapon. So we increase the current index and continue.
        curr_index = match_index + 4;
    }
    

    return Err("No SGDs found.".into());
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
           
            curr_index = match_index + 4;
            match_values.push(tmp_match_value);
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

/// Represents a method for checking whether the savegame indicator is between the start and the end index.
/// 
/// ### Parameter
/// - `content`: The byte data of the current save.
/// - `start_index`: The index from where the search starts.
/// - `end_index`: The index from where the search ends.
/// 
/// ### Returns `bool`
/// Indicates whether the savegame indicator is between the start and the end index or not.
fn is_savegame_between(content: &[u8], start_index: usize, end_index: usize) -> bool {
    if start_index > end_index {
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
/// - `logger`: The console logger that logs every event.
/// - `is_debugging`: Indicates whether the file analyser is in debugging mode or not.
/// 
/// ### Returns `(Vec<String>, Vec<usize>)`
/// A tuple that contains the matches for the current chunk and their corresponding index.
fn find_amount_of_matches(content: &[u8], start_index: usize, amount: usize, logger: &mut ConsoleLogger, is_debugging: bool) -> (Vec<String>, Vec<usize>) {
    // Prepare data.
    let mut item_counter: usize = 0;
    let mut match_values: Vec<String> = Vec::new();
    let mut match_indices: Vec<usize> = Vec::new();
    let mut iteration_index: usize = start_index;
    let mut last_match: String = String::new();
    let mut last_index: usize = start_index;
    // Convert the byte data to string to check regex patterns.
    let string_data = String::from_utf8_lossy(&content[start_index..]);

    let nightrunner_items = vec![
        "NightRunnerItemSGDs",
        "ParachuteSGDs",
        "ClimbPickaxeSGDs",
        "RopeHookSGDs",
        "BinocularsSGDs",
        "LockpickItemSGDs",
        "AntizinContainerSGDs",
        "BicycleSGDs"
    ];


    // The Regex pattern to match the sgds.
    let pattern: &str = r"(?:[a-zA-Z0-9_]{4,}(?:\x00*))*SGDs";

    // Defines the regex instances.
    let re: Regex = Regex::new(pattern).expect("Invalid regex pattern.");

    for mat in re.find_iter(&string_data) {
        // There are mod slots for each item. Even tokens, I mean why not Techland, right?
        // Check if the amount of item matches is in range and if the length of the match is at least 4.
        if item_counter < amount && mat.as_str().len() > 4 {
            // Items normally always have an "_" inside their name.
            // Except the following items: "NightRunnerItemSGDs", "ParachuteSGDs", "ClimbPickaxeSGDs", "RopeHookSGDs", "BinocularsSGDs"
            if mat.as_str().contains("_") || nightrunner_items.contains(&mat.as_str()){
                // set set the current item id.
                let mut current_matching_value = mat.as_str().to_string();
                let index = get_index_from_sequence(content, &iteration_index, &current_matching_value.as_bytes(), true);
                // Check if the current SGD is valid
                let size_bytes = &content[index - 2..index].to_vec();
                let size = u16::from_le_bytes(size_bytes.clone().try_into().unwrap()) as usize;
    
                // Checks if the SGDs has the correct size or if the item has a space between the name and the SGDs.
                if size > 0 {
                    if !current_matching_value.clone().ends_with("SGDs") && size > current_matching_value.clone().len() {
                        // Include spaces between item name and SGDs
                        current_matching_value = String::from_utf8_lossy(&content[index..index + size + 4]).to_string();
                    }
                } else {
                    continue;
                }
                
                // Checks whether the match is an item or a mod.
                if validate_item_or_mod(mat.as_str()) {
                    // Checks whether the match is bullet that acts as a mod.
                    if validate_item_or_transmog(mat.as_str(), &last_match) {                
                        if is_debugging {
                            logger.log_message(&format!("Found potential SGDs match for mod: [{}]", mat.as_str()), Vec::new());
                        }
    
                        match_values.push(current_matching_value.clone());
                        match_indices.push(index);
                        last_match = current_matching_value;
                        last_index = index;
                        iteration_index = index + last_match.len();
    
                        continue;
                    } else if mat.as_str().to_lowercase().contains("outfit") && last_match.to_lowercase().contains("outfit") && index - (last_index + last_match.len()) <= 30 {
                        if is_debugging {
                            logger.log_message(&format!("Found potential SGDs match for transmog: [{}]", mat.as_str()), Vec::new());
                        }
    
                        match_values.push(current_matching_value.clone());
                        match_indices.push(index);
                        last_match = current_matching_value;
                        last_index = index;
                        iteration_index = index + last_match.len();
    
                        continue;
                    }
    
                    // update data.
                    item_counter += 1;
                    match_values.push(current_matching_value.clone());
                    match_indices.push(index);
                    last_match = current_matching_value;
                    last_index = index;
                    iteration_index = index + last_match.len();
    
                    if is_debugging {
                        logger.log_message_no_linebreak("Found potential SGDs match for item: ", Vec::new());
                        logger.log_message(&format!("[{}]", mat.as_str()), vec![term::Attr::ForegroundColor(term::color::CYAN)]);
                    }
    
                    continue;
                } else {
                    if is_debugging {
                        logger.log_message(&format!("Found potential SGDs match for mod: [{}]", mat.as_str()), Vec::new());
                    }
    
                    match_values.push(current_matching_value.clone());
                    match_indices.push(index);
                    last_match = current_matching_value;
                    last_index = index;
                    iteration_index = index + last_match.len();
                }
            }
        }
    }

    // // Gets indices for all collected matches.
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