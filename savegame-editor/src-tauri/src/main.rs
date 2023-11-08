// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::env;
use file_analizer::load_save_file;
use log::info;
mod file_analizer;
mod struct_data;

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
fn get_content(file_path: &str) {
    info!("RUST: {}", file_path);
    
}

#[tauri::command(rename_all = "snake_case")]
fn get_ids() -> Vec<struct_data::IdData> {
    match file_analizer::fetch_ids() {
        Ok(id_datas) => {
            id_datas
        }
        Err(_) => {
            let empty_vectory: Vec<struct_data::IdData> = Vec::new();
            empty_vectory
        }
    }
}

#[tauri::command(rename_all = "snake_case")]
fn load_save() {
    if let Ok(current_dir) = env::current_dir() {
        let file_path = current_dir.join("save_main_0.sav");
        if let Some(file_path_str) = file_path.to_str() {
            load_save_file(file_path_str);
        } else {
            eprintln!("Error converting file path to a valid string");
        }
    } else {
        eprintln!("Error getting current directory");
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
            load_save
            ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}