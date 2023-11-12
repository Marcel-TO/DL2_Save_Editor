//! Takes a Dying Light 2 Save file and analizes its content for editing purpose.
//! 
//! After reading the content of the file, the following information is required:
//! - Skills (Base skills and Legend skills)
//! - Unlockable items (craftplans, toolskins, consumables)
//! - Inventory items (weapons, gear, accesssories, etc)

use std::{fs, io::Read};
use log::info;
use std::error::Error;
use regex::Regex;


// Import all struct datas.
use crate::struct_data::{
    SaveFile, 
    Skills, 
    SkillItem,
    UnlockableItem,
    ItemTypeEnum,
    InventoryItem,
    InventoryChunk,
    Mod
};

// Define global result definition for easier readability.
type Result<T> = std::result::Result<T,Box<dyn Error>>;

// Defines the first sequence for the skill section.
static START_SKILLS: [u8; 35] = [
    0x41, 0x6E, 0x74, 0x69, 0x7A, 0x69, 0x6E, 0x43,
    0x61, 0x70, 0x61, 0x63, 0x69, 0x74, 0x79, 0x55,
    0x70, 0x67, 0x72, 0x61, 0x64, 0x65, 0x53, 0x74,
    0x61, 0x6D, 0x69, 0x6E, 0x61, 0x5F, 0x73, 0x6B,
    0x69, 0x6C, 0x6C
];

// Defines the last sequence for the skill section.
static END_SKILLS: [u8; 33] = [
    0x50, 0x72, 0x6F, 0x67, 0x72, 0x65, 0x73, 0x73,
    0x69, 0x6F, 0x6E, 0x53, 0x74, 0x61, 0x74, 0x65,
    0x3A, 0x3A, 0x45, 0x45, 0x6C, 0x65, 0x6D, 0x65,
    0x6E, 0x74, 0x56, 0x65, 0x72, 0x73, 0x69, 0x6F,
    0x6E
];

// Defines the sequence where the inventory starts
static START_INVENTORY: [u8; 18] = [
    0x54, 0x6F, 0x6B, 0x65, 0x6E, 0x00, 0x00, 0x00,
    0x00, 0x07, 0x00, 0x55, 0x6E, 0x6B, 0x6E, 0x6F, 0x77, 0x6E
];

/// Represents a method for loading a savefile and preparing all necessary information.
/// 
/// ### Parameter
/// - `file_path`: The filepath of the current selected save.
/// 
/// ### Returns `SaveFile`
/// The save file with all collected data.
pub fn load_save_file(file_path: &str) -> SaveFile {
    // Gets the content from the file.
    let file_content: Vec<u8> = get_contents_from_file(file_path).unwrap();
    
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
    let last_item: &UnlockableItem = unlockable_items.last().unwrap();

    // The space between the SGD IDs and chunk data.
    let jump_offset = last_item.index + last_item.size +75;

    // Get all items within the inventory.
    let items: Vec<Vec<InventoryItem>> = get_all_items(&file_content, jump_offset);
    SaveFile::new(
        file_path.to_string(),
        file_content,
        skills,
        unlockable_items,
        items
    )
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
    if indices.len() == 0 || indices.len() != 2 {
        panic!("Start pattern(s) not found in file.");
    }

    // Takes the second inventory index for needed information.
    let start_index: usize = indices[1];
    // Compresses the data and only extracts the inventory part of the file.
    let inventory_data: &[u8] = &content[start_index..];
    // Prepares a list of all matching strings.
    let mut matching_string_indices: Vec<usize> = Vec::new();

    // Checks for all unlockableitem IDs.
    // The "_" is important, so that it doesn't include items like "hint_collectable".
    let mut craftplan_indices: Vec<usize> = get_all_indices_from_sequence(inventory_data, &0, format!("{:?}_", ItemTypeEnum::Craftplan).as_bytes(), true);
    let mut tool_skin_indices: Vec<usize> = get_all_indices_from_sequence(inventory_data, &0, format!("{:?}_", ItemTypeEnum::ToolSkin).as_bytes(), true);
    let mut collectable_indices: Vec<usize> = get_all_indices_from_sequence(inventory_data, &0, format!("{:?}_", ItemTypeEnum::Collectable).as_bytes(), true);
    matching_string_indices.append(&mut craftplan_indices);
    matching_string_indices.append(&mut tool_skin_indices);
    matching_string_indices.append(&mut collectable_indices);

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

/// Represents the method for finding all items inside the inventory.
/// 
/// ### Parameter
/// - `content`: The byte data of the current selected save.
/// - `start_index`: The start index of the inventory data.
/// 
/// ### Returns `Vec<Vec<InventoryItem>>`
/// The list of all different item sections.
/// Each section contains a list of items, for example: gear, weapons, etc....
fn get_all_items(content: &[u8], start_index: usize) -> Vec<Vec<InventoryItem>> {
    // Prepare data.
    let mut items: Vec<Vec<InventoryItem>> = Vec::new();
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
        let mut chunk_counter: usize = 0;
        let mut current_inv_chunk: InventoryChunk = chunks[0].clone();
        let mut match_bytes: &[u8] = current_item_id.as_bytes();
        let mut mods: Vec<Mod> = Vec::new();

        // iterate through each found match and validate the position of the match.
        for i in 0..current_item_ids.len() {
            // Check if the match is an item or a mod.
            if !&current_item_ids[i].contains("Mod") && !&current_item_ids[i].contains("charm") && &current_item_ids[i] != "NoneSGDs" && &current_item_ids[i] != "SGDs" {
                // Check if the bullet acts as item or mod or if there is a transmog item.
                if (current_item_ids[i].contains("Bullet") && mod_counter > 0 && mod_counter < 4) || mod_counter == 3 {
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
                current_item_id = current_item_ids[i].to_string();
                match_bytes = current_item_ids[i].as_bytes();
                current_item_index = current_item_indices[i];
                current_inv_chunk = chunks[chunk_counter].clone();
                chunk_counter += 1;
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
        items.push(inner_item_list.clone());
        let last_mod: &Mod = &inner_item_list[inner_item_list.clone().len() - 1].mod_data[inner_item_list[inner_item_list.clone().len() - 1].mod_data.len() - 1];
        index = last_mod.index + last_mod.name.len();
        index += 75;
    }

    items
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

    // iterate through each match.
    while let Some(mat) = match_iter.next() {
        // Looking for all SGDs inside the current chunk.
        if mat.end() - mat.start() == 4 {
            match_values.push(mat.as_str().to_string());
        } else {
            break;
        }
    }

    let mut match_indices: Vec<usize> = get_indices_from_values(&content, start_index, &match_values);

    // Check if Savegame section is between the start and the first SGDs.
    let mut first_index: usize = 0;

    if match_values.len() > 1 {
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
    let pattern: &str = r"[a-zA-Z0-9_]*SGDs";
    // The patterns that need to be checked.
    let sgd_pattern: &str = "SGDs";
    let savegame_pattern: &str = "Savegame";

    // Defines the regex instances.
    let re: Regex = Regex::new(pattern).expect("Invalid regex pattern.");
    let savegame_re: Regex = Regex::new(savegame_pattern).expect("Invalid regex pattern.");

    for mat in re.find_iter(&string_data) {
        // There are mod slots for each item. Even tokens, I mean why not Techland, right?
        // Check if the amount of item matches is in range and if the length of the match is at least 4.
        if counter <= amount && mat.as_str().len() >= 4 {
            // Check if it is an item or a mod.
            if !mat.as_str().contains("Mod") && !mat.as_str().contains("charm") &&
                mat.as_str() != "NoneSGDs" && mat.as_str() != sgd_pattern {
                    // Check if the bullet acts as item or mod.
                    if mat.as_str().contains("Bullet") && mod_counter > 0 && mod_counter <= 4 {
                        match_values.push(mat.as_str().to_string());
                        mod_counter += 1;
                        continue;
                    }

                    // update data.
                    counter += 1;
                    mod_counter = 0;
                } 
                // Checks if the SGDs is at the end of the found list.
                else if mat.as_str() == sgd_pattern && mod_counter != 4 {
                    break;
                } 
                // Checks if the match equals SGDs, since it is also possible for weapon mods.
                else if mat.as_str() == sgd_pattern {
                    // Check if Savegame indicator is between
                    if savegame_re.find(&string_data).map_or(false,|savegame_mat| savegame_mat.start() < mat.start()) {
                        break;
                    }

                    match_values.push(mat.as_str().to_string());
                    continue;
                }

                // Add the match to the values and update counter.
                match_values.push(mat.as_str().to_string());
                mod_counter += 1;
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
        info!("{:?}", first_index);
        indices.push(first_index);
    }

    // Seperates the content into blocks and returns position if found. 
    for i in 1..values.len() {
        let last_index: usize = indices[i - 1];
        let match_bytes: &[u8] = values[i].as_bytes();
        info!("{:?}", last_index);
        info!("{:?}", match_bytes);
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
fn get_contents_from_file(file_path: &str) -> Result<Vec<u8>> {
    let mut file = fs::File::open(file_path)?;

    // Get the file size for allocating the byte array
    let file_size = file.metadata()?.len() as usize;

    // Create a byte array to hold the file contents
    let mut file_contents = vec![0; file_size];

    // Read the binary data from the file into the byte array
    file.read_exact(&mut file_contents)?;
    
    Ok(file_contents)
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
