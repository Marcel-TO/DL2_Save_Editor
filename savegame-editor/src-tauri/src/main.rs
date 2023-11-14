// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod file_analizer;
mod id_fetcher;
mod struct_data;

use dotenv::dotenv;
use file_analizer::load_save_file;
use log::info;
use struct_data::SaveFile;
use id_fetcher::fetch_ids;
use tauri::AppHandle;

#[tauri::command(rename_all = "snake_case")]
fn get_ids(app_handle: AppHandle) -> Vec<struct_data::IdData> {
    let resource_path = app_handle.path_resolver().resolve_resource("./IDs/").unwrap();
    info!("{:?}", resource_path.display());

    match fetch_ids(&resource_path.display().to_string()) {
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

    // // Uncomment the following line to if .env file should be selected.
    // let file_path = std::env::var("FILE_PATH").expect("FILE_PATH must be set.");
    // load_save(&file_path);
}