use std::{fs, error::Error, path::Path};

use crate::struct_data::IdData;

// Define global result definition for easier readability.
type Result<T> = std::result::Result<T,Box<dyn Error>>;

/// Represents a method for fetching all ID datas. 
/// 
/// ### Returns `Vec<IdData>`
/// A list of all fetched id sections.
pub fn fetch_ids(id_path: &String) -> Result<Vec<IdData>> {
    let mut id_datas: Vec<IdData> = Vec::new();

    let entries = fs::read_dir(id_path).unwrap();

    for entry in entries {
        let entry = entry.map_err(|e| format!("Error reading directory entry: {}", e))?;

        if entry.file_type().map_or(false, |t| t.is_file()) {
            if let Ok(id_data) = read_id_file(entry.path().to_str().ok_or("Invalid file path")?) {
                id_datas.push(id_data);
            }
        }
    }

    Ok(id_datas)
}

/// Represents a method for reading a single id file and retrieving the IDs.
///
/// ### Parameter
/// - `file_path`: The filepath from the current selected ID file.
///
/// ### Returns `Result<IdData>`
/// The found IDs from the selected file.
fn read_id_file(file_path: &str) -> Result<IdData> {
    let path = Path::new(file_path);
    let filename = path
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or_default()
        .to_string();

    let file_content = fs::read_to_string(file_path)?;

    let ids: Vec<String> = file_content.lines().map(|line| line.to_string()).collect();

    Ok(IdData::new(filename, ids))
}