use std::{fs, io::Read, env};
use log::info;
use std::error::Error;
use regex::Regex;


// Import all struct datas.
use crate::struct_data::{
    IdData, 
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

static START_SKILLS: [u8; 35] = [
    0x41, 0x6E, 0x74, 0x69, 0x7A, 0x69, 0x6E, 0x43,
    0x61, 0x70, 0x61, 0x63, 0x69, 0x74, 0x79, 0x55,
    0x70, 0x67, 0x72, 0x61, 0x64, 0x65, 0x53, 0x74,
    0x61, 0x6D, 0x69, 0x6E, 0x61, 0x5F, 0x73, 0x6B,
    0x69, 0x6C, 0x6C
];


static END_SKILLS: [u8; 33] = [
    0x50, 0x72, 0x6F, 0x67, 0x72, 0x65, 0x73, 0x73,
    0x69, 0x6F, 0x6E, 0x53, 0x74, 0x61, 0x74, 0x65,
    0x3A, 0x3A, 0x45, 0x45, 0x6C, 0x65, 0x6D, 0x65,
    0x6E, 0x74, 0x56, 0x65, 0x72, 0x73, 0x69, 0x6F,
    0x6E
];

static START_INVENTORY: [u8; 18] = [
    0x54, 0x6F, 0x6B, 0x65, 0x6E, 0x00, 0x00, 0x00,
    0x00, 0x07, 0x00, 0x55, 0x6E, 0x6B, 0x6E, 0x6F, 0x77, 0x6E
];

pub fn load_save_file(file_path: &str) -> SaveFile {
    // Gets the content from the file.
    let file_content: Vec<u8> = get_contents_from_file(file_path).unwrap();
    // info!("Length: {}", file_content.clone().len());
    
    // Gets the indices of the skill data.
    let skill_start_index: usize = get_index_from_sequence(&file_content, &0, &START_SKILLS, true);
    let skill_end_index: usize = get_index_from_sequence(&file_content, &skill_start_index, &END_SKILLS, true);
    let skill_data_range = &file_content[skill_start_index - 1 .. skill_end_index];
    // info!("Start: {}", skill_start_index);
    // info!("End: {}", skill_end_index);
    // info!("Data: {:?}", format_bytes_to_string(skill_data_range.to_vec()));

    // Check if there was an error while trying to get the indices.
    if skill_data_range.len() <= 0 {
        info!("Error: index not found");
    }

    let base_skills: Vec<String> = find_base_skill_matches(&skill_data_range);
    let legend_skills: Vec<String> = find_legend_skill_matches(&skill_data_range);
    let skills: Skills = analize_skill_data(&file_content, &base_skills, &legend_skills);
    
    // find all unlockable items.
    let unlockable_items: Vec<UnlockableItem> = analize_unlockable_items_data(&file_content);
    let last_item: &UnlockableItem = unlockable_items.last().unwrap();

    // the space between the SGD IDs and chunk data.
    let jump_offset = last_item.index + last_item.size +75;

    // get all items within the inventory.
    let items: Vec<Vec<InventoryItem>> = get_all_items(&file_content, jump_offset);
    SaveFile::new(
        file_path.to_string(),
        file_content,
        skills,
        unlockable_items,
        items
    )

}

fn find_base_skill_matches(content: &[u8]) -> Vec<String> {
    let string_data = String::from_utf8_lossy(content).to_string();
    let pattern = r"([A-Za-z0-9_]+_skill)";
    let regex = Regex::new(pattern).expect("Failed to create regex");

    let matches: Vec<String> = regex
        .find_iter(&string_data)
        .map(|m| m.as_str().to_string())
        .filter(|s| !s.contains("LP_"))
        .collect();

    matches
}

fn find_legend_skill_matches(content: &[u8]) -> Vec<String> {
    let string_data = String::from_utf8_lossy(content).to_string();
    let pattern = r"(LP_[A-Za-z0-9_]+_skill)";
    let regex = Regex::new(pattern).expect("Failed to create regex");

    let matches: Vec<String> = regex
        .find_iter(&string_data)
        .map(|m| m.as_str().trim().to_string())
        .collect();

    matches
}

fn analize_skill_data(
    data: &[u8],
    base_matches: &[String],
    legend_matches: &[String],
) -> Skills {
    let mut base_skills: Vec<SkillItem> = Vec::new();
    let mut legend_skills: Vec<SkillItem> = Vec::new();
    let mut last_index: usize = 0;

    for base_match in base_matches {
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
        last_index = index;
    }

    for legend_match in legend_matches {
        let match_bytes: &[u8] = legend_match.as_bytes();
        let index: usize = get_index_from_sequence(data, &last_index, match_bytes, true);
        let name: String = legend_match.trim().to_string();
        let extracted_bytes: &[u8] = &data[index + match_bytes.len() .. index + match_bytes.len() + 2];

        let skill_item = SkillItem::new(
            name,
            index,
            match_bytes.len(),
            match_bytes.to_vec(),
            extracted_bytes.to_vec(),
        );

        legend_skills.push(skill_item);
        last_index = index;
    }

    Skills::new(
        base_skills,
        legend_skills,
    )
}

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

    for i in 0..matching_string_indices.len() {
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

    items.sort_by(|a, b| a.index.cmp(&b.index));
    items
}

fn get_all_items(content: &[u8], start_index: usize) -> Vec<Vec<InventoryItem>> {
    let mut items: Vec<Vec<InventoryItem>> = Vec::new();
    let mut index = start_index;

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
        let mut current_item_id = String::new();
        let mut current_item_index: usize = 0;
        let mut chunk_counter: usize = 0;
        let mut current_inv_chunk = chunks[0].clone();
        let mut match_bytes = current_item_id.as_bytes();
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
        let last_mod = &inner_item_list[inner_item_list.clone().len() - 1].mod_data[inner_item_list[inner_item_list.clone().len() - 1].mod_data.len() - 1];
        index = last_mod.index + last_mod.name.len();
        index += 75;
    }

    items
}

fn find_all_inventory_chunks(content: &[u8], start_index: usize) -> (Vec<InventoryChunk>, usize) {
    if start_index > content.len() {
        panic!("The start_index must not be greater than the content length.")
    }

    let mut chunks: Vec<InventoryChunk> = Vec::new();

    let level_offset = 2;
    let seed_offset = 2;
    let amount_offset = 4;
    let durability_offset = 4;
    let space_offset = 25;
    let data_offset = level_offset + seed_offset + amount_offset + durability_offset + space_offset;

    let (match_values, match_indices) = get_sgd_matches(&content, start_index);

    if match_values.is_empty() {
        return (chunks, 0);
    } else {
        for i in 0..match_values.len() {
            if match_indices[i] - data_offset < 0 {
                panic!("The match_indices at index {} must not be less than data_offset", i);
            }
    
            let data_index = match_indices[i] - data_offset;
            let mut level_data: Vec<u8> = Vec::new();
            let mut seed_data: Vec<u8> = Vec::new();
            let mut amount_data: Vec<u8> = Vec::new();
            let mut durability_data: Vec<u8> = Vec::new();
            let mut chunk_space: Vec<u8> = Vec::new();

            // Extracts the content
            let mut index = data_index;
            level_data = content[index..index+level_offset].to_vec();
            index += level_offset;
            seed_data = content[index..index+seed_offset].to_vec();
            index += seed_offset;
            amount_data = content[index..index+amount_offset].to_vec();
            index += amount_offset;
            durability_data = content[index..index+durability_offset].to_vec();
            index += durability_offset;
            chunk_space = content[index..index+space_offset].to_vec();

            chunks.push(InventoryChunk::new(
                level_data,
                seed_data,
                amount_data,
                durability_data,
                chunk_space,
                data_index,
            ));
        }

        let last_index = chunks.last().map_or(start_index, |chunk| chunk.index + data_offset + 4);
        
        (chunks, 0)
    }
}

fn get_sgd_matches(content: &[u8], start_index: usize) -> (Vec<String>, Vec<usize>) {
    // Prepare data for iteration.
    let mut match_values: Vec<String> = Vec::new();
    let string_data = String::from_utf8_lossy(&content[start_index..]);

    // Create regex pattern.
    let pattern = r"[a-zA-Z0-9_]*SGDs";
    let re = Regex::new(pattern).expect("Invalid regex pattern");

    let mut found_match = re.find(&string_data);
    while let Some(mat) = found_match {
        if mat.as_str().len() == 4 {
            match_values.push(mat.as_str().to_string());
        } else {
            break;
        }

        found_match = re.find(mat.as_str()).or_else(|| re.find(&string_data[mat.end()..]));
    }

    let mut match_indices = get_indices_from_values(content, start_index, &match_values);

    // Check if Savegame section is between the start and the first SGDs
    let is_savegame = match_values.len() > 1 && is_savegame_between(&content, start_index, match_indices[0]);

    // Reset matches if savegame is between
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

fn find_amount_of_matches(content: &[u8], start_index: usize, amount: usize) -> (Vec<String>, Vec<usize>) {
    let mut counter = 0;
    let mut mod_counter = 0;
    let mut match_values: Vec<String> = Vec::new();
    let mut current_item = String::new();
    let string_data = String::from_utf8_lossy(&content[start_index..]);

    // Create regex patterns.
    let pattern = r"[a-zA-Z0-9_]*SGDs";
    let sgd_pattern = "SGDs";
    let savegame_pattern = "Savegame";

    let re = Regex::new(pattern).expect("Invalid regex pattern.");
    let savegame_re = Regex::new(savegame_pattern).expect("Invalid regex pattern.");

    for mat in re.find_iter(&string_data) {
        if counter <= amount && mat.as_str().len() >= 4 {
            if !mat.as_str().contains("Mod") && !mat.as_str().contains("charm") &&
                mat.as_str() != "NoneSGDs" && mat.as_str() != sgd_pattern {
                    if mat.as_str().contains("Bullet") && mod_counter > 0 && mod_counter <= 4 {
                        match_values.push(mat.as_str().to_string());
                        mod_counter += 1;
                        continue;
                    }

                    counter += 1;
                    mod_counter = 0;
                    current_item = mat.as_str().to_string();
                } else if mat.as_str() == sgd_pattern && mod_counter != 4 {
                    break;
                } else if mat.as_str() == sgd_pattern {
                    if savegame_re.find(&string_data).map_or(false,|savegame_mat| savegame_mat.start() < mat.start()) {
                        break;
                    }

                    match_values.push(mat.as_str().to_string());
                    continue;
                }

                match_values.push(mat.as_str().to_string());
                mod_counter += 1;
        } else {
            break;
        }
    }

    let match_indices = get_indices_from_values(&content, start_index, &match_values);
    (match_values, match_indices)

}

fn get_indices_from_values(content: &[u8], start_index: usize, values: &[String]) -> Vec<usize>{
    let mut indices: Vec<usize> = Vec::new();
    for value in values {
        if let Some(index) = content[start_index..].windows(value.len()).position(|window| {
            window == value.as_bytes()
        }) {
            indices.push(index + start_index);
        }
    }

    indices
}

fn get_index_from_sequence(content: &[u8], start_index: &usize, sequence: &[u8], get_start: bool) -> usize {
    let mut counter: usize = *start_index;

    // iterates through the data.
    loop {
        if counter >= content.len() {
            return 0;
        }

        let mut is_valid = true;
        let mut last_index: usize = 0;

        for i in 0..sequence.len() {
            last_index = counter + i;
            if content[last_index] != sequence[i] {
                is_valid = false;
                break;
            } 
        }   
        
        if is_valid && get_start {
            return counter;
        } else if is_valid {
            return last_index + 1;
        }

        counter += 1;
    }
}

fn get_all_indices_from_sequence(content: &[u8], start_index: &usize, sequence: &[u8], get_start: bool) -> Vec<usize> {
    let mut counter: usize = *start_index;
    let mut indices: Vec<usize> = Vec::new();

    // iterates through the data.
    loop {
        if counter >= content.len() - sequence.len()     {
            break;
        }

        let mut is_valid: bool = true;
        let mut last_index: usize = 0;

        for i in 0..sequence.len() {
            last_index = counter + i;
            if content[last_index] != sequence[i] {
                is_valid = false;
                break;
            } 
        }   
        
        if is_valid && get_start {
            indices.push(counter);
        } else if is_valid {
            indices.push(last_index + 1);
        }

        counter += 1;
    }

    indices
}

pub fn format_bytes_to_string(file_content: Vec<u8>) -> String {
    file_content.iter()
                .map(|byte| format!("{:02X}", byte))
                .collect::<Vec<String>>()
                .join(" ")
}

pub fn fetch_ids() -> Result<Vec<IdData>> {
    let mut id_datas = Vec::new();

    if let Ok(current_dir) = env::current_dir() {
        // Now, you can use `current_dir` to construct full paths or access files
        let current_path = current_dir.join("IDs/");

        if let Ok(entries) = fs::read_dir(current_path) {
            for entry in entries {
                if let Ok(entry) = entry {
                    if entry.file_type().ok().map_or(false, |t| t.is_file()) {
                        if let Ok(id_data) = read_id_file(entry.path().to_str().unwrap()) {
                            id_datas.push(id_data);
                        }
                    }
                }
            }
        } else {
            return Err("Unable to locate ID directory.".into());
        }
    } else {
        return Err("Unable to retrieve the current working directory.".into());
    }

    Ok(id_datas)
}

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

fn read_id_file(file_path: &str) -> Result<IdData> {
    // Create a PathBuf from the file_path
    let path = std::path::Path::new(file_path);

    // Get the filename without extension
    let filename = path.file_stem().and_then(|s| s.to_str()).unwrap_or_default().to_string();

    let file_content = fs::read_to_string(file_path)?;

    let ids: Vec<String> = file_content.lines().map(|line| line.to_string()).collect();

    Ok(IdData::new(filename, ids))
}

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
