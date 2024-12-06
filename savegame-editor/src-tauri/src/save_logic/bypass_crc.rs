use crate::save_logic::file_analyser::get_contents_from_file;
use std::io::Write;
use std::{error::Error, fs};

// Define global result definition for easier readability.
type Result<T> = std::result::Result<T, Box<dyn Error>>;

/// Represents a method for fetching all ID datas.
///
/// ### Returns `Vec<IdData>`
/// A list of all fetched id sections.
pub fn get_files_and_copy_to_destination(crc_path: &String, game_files_path: &str) -> Result<bool> {
    let entries = fs::read_dir(crc_path).map_err(|e| format!("Error reading directory: {}", e))?;

    for entry in entries {
        let entry = entry.map_err(|e| format!("Error reading directory entry: {}", e))?;

        if entry.file_type().map_or(false, |t| t.is_file()) {
            let path = entry.path();
            let filename = path
                .file_name()
                .ok_or_else(|| "Error getting file name".to_string())?
                .to_string_lossy()
                .to_string();
            let file_content = get_contents_from_file(
                &path
                    .to_str()
                    .ok_or_else(|| "Error converting path to string".to_string())?
                    .to_string(),
            )
            .map_err(|e| format!("Error reading file content: {}", e))?;
            let target_file_path = format!("{}/{}", game_files_path, filename);
            let mut file = fs::File::create(&target_file_path)
                .map_err(|e| format!("Error creating file: {}", e))?;
            file.write_all(&file_content)
                .map_err(|e| format!("Error writing to file: {}", e))?;
        }
    }

    Ok(true)
}
