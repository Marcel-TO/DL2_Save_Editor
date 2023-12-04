// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod file_analizer;
mod id_fetcher;
mod struct_data;

use dotenv::dotenv;
use file_analizer::{load_save_file, edit_skill, edit_inventory_item_chunk};
use log::info;
use regex::Regex;
use struct_data::SaveFile;
use id_fetcher::fetch_ids;
use tauri::AppHandle;

#[tauri::command(rename_all = "snake_case")]
async fn get_ids(app_handle: AppHandle) -> Result<Vec<struct_data::IdData>, ()> {
    let resource_path = app_handle.path_resolver().resolve_resource("./IDs/").unwrap();

    match fetch_ids(&resource_path.display().to_string()) {
        Ok(id_datas) => {
            Ok(id_datas)
        }
        Err(_) => {
            let empty_vectory: Vec<struct_data::IdData> = Vec::new();
            Ok(empty_vectory)
        }
    }
}

#[tauri::command(rename_all = "snake_case")]
async fn load_save(file_path: &str) -> Result<SaveFile, ()> {
    let save_file = load_save_file(&file_path);

    Ok(save_file)
}

#[tauri::command(rename_all = "snake_case")]
async fn handle_edit_skill(current_skill: String, current_skill_index: usize, is_base_skill: bool,  new_value: u16, save_file: String) -> Result<String, ()> {
    let converted_skill = serde_json::from_str(&current_skill).map_err(|_| ())?;
    let converted_save_file = serde_json::from_str(&save_file).map_err(|_| ())?;
    
    let new_save_file = edit_skill(converted_skill, current_skill_index, is_base_skill, new_value, converted_save_file);

    let result_save = serde_json::to_string(&new_save_file).map_err(|_| ())?;    
    Ok(result_save)
}

#[tauri::command(rename_all = "snake_case")]
async fn handle_edit_item_chunk(
    current_item_index: usize,
    new_id: String,
    current_item_chunk_index: usize,
    current_item_size: usize,
    new_level: u16,
    new_seed: u16,
    new_amount: u32,
    new_durability: f32,
    save_file_content: Vec<u8>
) -> Result<Vec<u8>, ()> {
    let new_save_content = edit_inventory_item_chunk(
        current_item_index,
        new_id,
        current_item_chunk_index,
        current_item_size,
        new_level,
        new_seed,
        new_amount,
        new_durability,
        save_file_content
    );

    Ok(new_save_content)
}

fn main() {
    dotenv().ok();
    // // Comment tauri builder if debugging.
    // tauri::Builder::default()
    //     .plugin(tauri_plugin_log::Builder::default().build())
    //     .invoke_handler(tauri::generate_handler![
    //         get_ids,
    //         load_save,
    //         handle_edit_skill,
    //         handle_edit_item_chunk
    //         ])
    //     .run(tauri::generate_context!())
    //     .expect("error while running tauri application");

    // // Uncomment the following line to if .env file should be selected.
    // let file_path = std::env::var("FILE_PATH").expect("FILE_PATH must be set.");
    // let save_file = load_save_file(&file_path);

    // let changing_item = save_file.items[0].inventory_items[0].clone();
    // let new_save_file = edit_inventory_item_chunk(changing_item, save_file.items[0].clone(), 0, 3, 3, 3, 3, save_file.clone());

    // println!("{:?}", save_file.clone().items[0].inventory_items[0]);
    // println!("{:?}", new_save_file.clone().items[0].inventory_items[0]);



    // let byte_vector: Vec<u8> = vec![
    //     0x45, 0x61, 0x73, 0x74, 0x65, 0x72, 0x45, 0x67, 0x67, 0x5F, 0x43, 0x79, 0x62, 0x65, 0x72,
    //     0x68, 0x61, 0x6E, 0x64, 0x73, 0x00, 0x00, 0x53, 0x47, 0x44, 0x73,
    // ];

    // let string_data = String::from_utf8_lossy(&byte_vector);
    // let pattern: &str = r"(?:[a-zA-Z0-9_]{4,}(?:\x00*))*SGDs";
    // let re: Regex = Regex::new(pattern).expect("Invalid regex pattern.");

    // for mat in re.find_iter(&string_data) { 
    //     let res = mat.as_str().to_string();
    //     println!("{:?}", res);
    // }
}