use std::{fs, env, error::Error};
use crate::struct_data::IdData;

// Define global result definition for easier readability.
type Result<T> = std::result::Result<T,Box<dyn Error>>;

/// Represents a method for fetching all ID datas. 
/// 
/// ### Returns `Result<Vec<IdData>>`
/// A list of all fetched id sections.
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

/// Represents a method for reading a single id file and retreiving the IDs.
/// 
/// ### Parameter
/// - `file_path`: The filepath from the current selected ID file.
/// 
/// ### Returns `Result<IdData>`
/// The found IDs from the selected file.
fn read_id_file(file_path: &str) -> Result<IdData> {
    // Create a PathBuf from the file_path
    let path = std::path::Path::new(file_path);

    // Get the filename without extension
    let filename = path.file_stem().and_then(|s| s.to_str()).unwrap_or_default().to_string();

    let file_content = fs::read_to_string(file_path)?;

    let ids: Vec<String> = file_content.lines().map(|line| line.to_string()).collect();

    Ok(IdData::new(filename, ids))
}