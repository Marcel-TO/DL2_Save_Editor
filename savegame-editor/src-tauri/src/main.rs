// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod file_analizer;
mod id_fetcher;
mod struct_data;

use dotenv::dotenv;
use file_analizer::{load_save_file, edit_skill, edit_inventory_item_chunk};
use struct_data::{SaveFile, SkillItem, InventoryItem, InventoryItemRow};
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
async fn handle_edit_skill(current_skill: SkillItem, current_skill_index: usize, is_base_skill: bool,  new_value: u16, save_file: SaveFile) -> Result<SaveFile, ()> {
    let new_save_file = edit_skill(current_skill, current_skill_index, is_base_skill, new_value, save_file);

    Ok(new_save_file)
}

#[tauri::command(rename_all = "snake_case")]
async fn handle_edit_item_chunk(
    current_item: InventoryItem,
    current_item_row: InventoryItemRow, 
    current_item_index: usize, 
    new_level: u16,
    new_seed: u16,
    new_amount: u32,
    new_durability: u32,
    save_file: SaveFile
) -> Result<SaveFile, ()> {
    let new_save_file = edit_inventory_item_chunk(
        current_item, 
        current_item_row, 
        current_item_index, 
        new_level, 
        new_seed, 
        new_amount, 
        new_durability, 
        save_file
    );

    Ok(new_save_file)
}

fn main() {
    dotenv().ok();
    // Comment tauri builder if debugging.
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            get_ids,
            load_save,
            handle_edit_skill,
            handle_edit_item_chunk
            ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    // // Uncomment the following line to if .env file should be selected.
    // let file_path = std::env::var("FILE_PATH").expect("FILE_PATH must be set.");
    // let save_file = load_save_file(&file_path);

    // let changing_skill = save_file.skills.legend_skills[0].clone();
    // let new_save_file = edit_skill(changing_skill, 0, false, 5, save_file.clone());
    
    // println!("{:?}", save_file.clone().skills.legend_skills[0]);
    // println!("{:?}", new_save_file.clone().skills.legend_skills[0]);
}