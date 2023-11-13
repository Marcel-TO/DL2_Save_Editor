// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod file_analizer;
mod id_fetcher;
mod struct_data;

use dotenv::dotenv;
use file_analizer::load_save_file;
use struct_data::SaveFile;
use id_fetcher::fetch_ids;

#[tauri::command(rename_all = "snake_case")]
fn get_ids(id_path: &str) -> Vec<struct_data::IdData> {
    match fetch_ids(id_path) {
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
fn load_save(file_path: &str) -> SaveFile {
    // // Uncomment the following line to if .env file should be selected.
    // file_path = std::env::var("FILE_PATH").expect("FILE_PATH must be set.");
    
    load_save_file(&file_path)
}


fn main() {
    dotenv().ok();
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            get_ids,
            load_save
            ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}