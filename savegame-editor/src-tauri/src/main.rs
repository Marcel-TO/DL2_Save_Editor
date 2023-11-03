// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{fs, io::Read};
use log::info;

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

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            greet, 
            file_to_backend,
            get_content,
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
