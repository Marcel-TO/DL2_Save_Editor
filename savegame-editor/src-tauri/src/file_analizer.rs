use std::{fs, io::Read, env};
use log::info;
use std::error::Error;
use regex::Regex;


// Import all struct datas.
use crate::struct_data::{
    IdData, 
    SaveFile, 
    Skills, 
    SkillItem
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

//  -> Result<struct_data::SaveFile>
pub fn load_save_file(file_path: &str) {
    info!("{}", file_path);
    // Gets the content from the file.
    let file_content: Vec<u8> = get_contents_from_file(file_path).unwrap();
    info!("{}", format_bytes_to_string(file_content.clone()));
    
    // Gets the indices of the skill data.
    let skill_start_index: usize = get_index_from_sequence(&file_content, &START_SKILLS);
    let skill_end_index: usize = get_index_from_sequence(&file_content, &START_SKILLS);
    let skill_data_range = &file_content[skill_start_index + START_SKILLS.len() .. skill_end_index];

    // Check if there was an error while trying to get the indices.
    if skill_data_range.len() <= 0 {
        info!("Error: index not found");
    }

    let base_skills: Vec<String> = find_base_skill_matches(&file_content);
    let legend_skills: Vec<String> = find_legend_skill_matches(&file_content);
    let skills: Skills = analize_skill_data(&file_content, &base_skills, &legend_skills);


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
    let pattern = r"(LP_[A-Za-z0-9_]+)";
    let regex = Regex::new(pattern).expect("Failed to create regex");

    let matches: Vec<String> = regex
        .find_iter(&string_data)
        .map(|m| m.as_str().to_string())
        .collect();

    matches
}

fn analize_skill_data(
    data: &[u8],
    base_matches: &[String],
    legend_matches: &[String],
) -> Skills {
    let mut base_skills = Vec::new();
    let mut legend_skills = Vec::new();

    for base_match in base_matches {
        let match_bytes = base_match.as_bytes();
        let index = get_index_from_sequence(data, match_bytes);
        let name = base_match.replace('\x01', "").replace('\x00', "").to_string();
        let extracted_bytes = &data[index + match_bytes.len() .. index + match_bytes.len() + 2];

        let skill_item = SkillItem::new(
            name,
            index,
            match_bytes.len(),
            match_bytes.to_vec(),
            extracted_bytes.to_vec(),
        );

        base_skills.push(skill_item);
    }

    for legend_match in legend_matches {
        let match_bytes = legend_match.as_bytes();
        let index = get_index_from_sequence(data, match_bytes);
        let name = legend_match.replace('\x01', "").replace('\x00', "").to_string();
        let extracted_bytes = &data[index + match_bytes.len() .. index + match_bytes.len() + 2];

        let skill_item = SkillItem::new(
            name,
            index,
            match_bytes.len(),
            match_bytes.to_vec(),
            extracted_bytes.to_vec(),
        );

        legend_skills.push(skill_item);
    }

    Skills::new(
        base_skills,
        legend_skills,
    )
}


fn get_index_from_sequence(content: &[u8], sequence: &[u8]) -> usize {
    content
        .windows(sequence.len())
        .position(|window| window == sequence)
        .unwrap_or(0)
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

pub fn to_little_endian(bytes: Vec<u8>) -> Vec<u8> {
    let mut result = Vec::with_capacity(bytes.len());
    
    for i in (0..bytes.len()).rev() {
        result.push(bytes[i]);
    }
    
    result
}

pub fn bytes_to_f32(bytes: Vec<u8>) -> f32 {
    if bytes.len() != 4 {
        panic!("Byte vector should have exactly 4 bytes for an f32 value.");
    }

    let mut data = [0u8; 4];
    data.copy_from_slice(&bytes);

    f32::from_le_bytes(data)
}
