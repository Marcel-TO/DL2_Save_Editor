// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{fs, io::Read, env};
use log::info;
use serde::{Serialize, Deserialize};
use std::error::Error;

#[tauri::command(rename_all = "snake_case")]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command(rename_all = "snake_case")]
fn file_to_backend(file_path: &str) -> String {
    info!("RUST: {}", file_path);
    let result = format!("{}", file_path);
    info!("{}", result);
    result
}

#[tauri::command(rename_all = "snake_case")]
fn get_content(file_path: &str) -> String {
    info!("RUST: {}", file_path);
    match get_contents_from_file(file_path) {
        Ok(bytes) => {
            let formatted_string = bytes.iter()
                .map(|byte| format!("{:02X}", byte))
                .collect::<Vec<String>>()
                .join(" ");
            formatted_string
        }
        Err(_) => {
            "Error: Unable to read file.".to_string()
        }
    }
}

#[tauri::command(rename_all = "snake_case")]
fn get_ids() -> Vec<IdData> {
    match fetch_ids() {
        Ok(id_datas) => {
            id_datas
        }
        Err(_) => {
            let empty_vectory: Vec<IdData> = Vec::new();
            empty_vectory
        }
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            greet, 
            file_to_backend,
            get_content,
            get_ids,
            ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn get_contents_from_file(file_path: &str) -> Result<Vec<u8>, std::io::Error> {
    let mut file = fs::File::open(file_path)?;

    // Get the file size for allocating the byte array
    let file_size = file.metadata()?.len() as usize;

    // Create a byte array to hold the file contents
    let mut file_contents = vec![0; file_size];

    // Read the binary data from the file into the byte array
    file.read_exact(&mut file_contents)?;
    
    Ok(file_contents)
}

// ID Fetcher:
#[derive(Debug, Serialize, Deserialize)]
struct IdData {
    filename: String,
    ids: Vec<String>, // Use a Vec<String> instead of an array
}

impl IdData {
    fn new(filename: String, ids: Vec<String>) -> Self {
        IdData {
            filename,
            ids,
        }
    }
}

fn fetch_ids() -> Result<Vec<IdData>, Box<dyn Error>> {
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

fn read_id_file(file_path: &str) -> Result<IdData, Box<dyn Error>> {
    // Create a PathBuf from the file_path
    let path = std::path::Path::new(file_path);

    // Get the filename without extension
    let filename = path.file_stem().and_then(|s| s.to_str()).unwrap_or_default().to_string();

    let file_content = fs::read_to_string(file_path)?;

    let ids: Vec<String> = file_content.lines().map(|line| line.to_string()).collect();

    Ok(IdData::new(filename, ids))
}