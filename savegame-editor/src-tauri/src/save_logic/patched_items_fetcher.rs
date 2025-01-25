use crate::save_logic::struct_data::PatchedItems;
use std::{error::Error, fs};

// Define global result definition for easier readability.
type Result<T> = std::result::Result<T, Box<dyn Error>>;

/// Represents a method for fetching all patched items.
///
/// ### Returns `PatchedItems`
/// A collection of all patched items.
pub fn fetch_patched_ids(id_path: &String) -> Result<PatchedItems> {
    let entries = fs::read_dir(id_path).unwrap();

    // Check if there is a file called "not_dropable.txt" and "not_shareable.txt"
    let mut not_dropable: Vec<String> = Vec::new();
    let mut not_shareable: Vec<String> = Vec::new();

    for entry in entries {
        let entry = entry.map_err(|e| format!("Error reading directory entry: {}", e))?;

        if entry.file_type().map_or(false, |t| t.is_file()) {
            if let Ok(ids) = read_patch_file(entry.path().to_str().ok_or("Invalid file path")?) {
                if entry.file_name().to_str().unwrap() == "not_dropable.txt" {
                    not_dropable = ids;
                } else if entry.file_name().to_str().unwrap() == "not_shareable.txt" {
                    not_shareable = ids;
                }
            }
        }
    }

    // If not_dropable or not_shareable is empty, return an error
    if not_dropable.is_empty() || not_shareable.is_empty() {
        return Err("Could not find the patched files.".into());
    }

    Ok(PatchedItems::new(not_dropable, not_shareable))
}

/// Represents a method for reading a single patched file and retrieving the IDs.
///
/// ### Parameter
/// - `file_path`: The filepath from the current selected ID file.
///
/// ### Returns `Result<String>`
/// The found IDs from the selected file.
fn read_patch_file(file_path: &str) -> Result<Vec<String>> {
    let file_content = fs::read_to_string(file_path)?;

    let ids: Vec<String> = file_content.lines().map(|line| line.to_string()).collect();

    Ok(ids)
}
