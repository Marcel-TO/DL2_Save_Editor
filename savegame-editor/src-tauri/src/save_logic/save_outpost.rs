use tauri::AppHandle;

use crate::load_save;
use crate::save_logic::struct_data::OutpostSave;
use std::fs::{DirEntry, ReadDir};
use std::io;
use std::path::PathBuf;
use std::{error::Error, fs};

use super::struct_data::SaveFile;

// Define global result definition for easier readability.
type Result<T> = std::result::Result<T, Box<dyn Error>>;

/// Represents a method for fetching all saves from the dedicated outpost directory.
///
/// ### Returns `Vec<OutpostSave>`
/// A list of all fetched outpost saves.
pub fn fetch_outpost_saves(
    app_handle: AppHandle,
    outpost_path: &String,
) -> Result<Vec<OutpostSave>> {
    // Initialize the vector for the outpost saves.
    let mut outpost_saves: Vec<OutpostSave> = Vec::new();
    // Read the directory entries.
    let entries: ReadDir = fs::read_dir(outpost_path).unwrap();

    // Iterate over each entry in the outpost directory.
    for save_dir in entries {
        // Get the entry
        let entry: DirEntry =
            save_dir.map_err(|e: io::Error| format!("Error reading directory entry: {}", e))?;

        // Check if the entry is a directory.
        if entry.file_type().map_or(false, |t| t.is_dir()) {
            // get file inside the directory.
            let entries: ReadDir =
                fs::read_dir(entry.path().to_str().ok_or("Invalid file path")?).unwrap();
            // get the 2 needed files (the save.json and the file that ends with .sav).
            let mut save_file: Option<PathBuf> = None;
            let mut save_json: Option<PathBuf> = None;
            // iterate over all entries in the directory.
            for entry in entries {
                let entry: DirEntry = entry
                    .map_err(|e: io::Error| format!("Error reading directory entry: {}", e))?;
                // check if the entry is a file.
                if entry.file_type().map_or(false, |t| t.is_file()) {
                    let path = entry.path();
                    // check if the file is a save file or a save.json file.
                    if path.extension().map_or(false, |e| e == "sav") {
                        save_file = Some(path);
                    } else if path.file_name().map_or(false, |f| f == "save.json") {
                        save_json = Some(path);
                    }
                }
            }

            // check if both files are found
            if save_file.is_none() || save_json.is_none() {
                return Err("Missing save file or save.json".into());
            }

            // read the save.json file
            let save_json = fs::read_to_string(save_json.unwrap())?;
            // convert to json
            let save_json: serde_json::Value = serde_json::from_str(&save_json)?;

            // get the path from the save file and call the read_save_file function
            let save_file: PathBuf = save_file.unwrap();
            let save_file: std::result::Result<SaveFile, String> = load_save(
                app_handle.clone(),
                save_file.to_str().ok_or("Invalid file path")?,
                false,
                false,
            );

            // return the OutpostSave struct
            match save_file {
                Ok(save_file) => outpost_saves.push(OutpostSave::new(
                    save_json["name"].as_str().unwrap_or("").to_string(),
                    save_json["owner"].as_str().unwrap_or("").to_string(),
                    save_json["description"].as_str().unwrap_or("").to_string(),
                    save_json["features"]
                        .as_array()
                        .unwrap_or(&vec![])
                        .iter()
                        .filter_map(|v| v.as_str().map(|s| s.to_string()))
                        .collect::<Vec<String>>(),
                    save_json["version"].as_str().unwrap_or("").to_string(),
                    save_file,
                )),
                Err(e) => return Err(e.into()),
            }
        }
    }

    Ok(outpost_saves)
}
