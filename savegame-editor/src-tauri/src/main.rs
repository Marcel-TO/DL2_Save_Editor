// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod file_analizer;
mod id_fetcher;
mod struct_data;
mod test_saves;

use dotenv::dotenv;
use file_analizer::{load_save_file, edit_skill, edit_inventory_item_chunk, change_items_durability, change_items_amount, export_save_for_pc, remove_inventory_item};
use struct_data::{SaveFile, InventoryChunk};
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
async fn export_for_pc(data: Vec<u8>) -> Result<Vec<u8>, ()> {
    let compressed: Vec<u8> = export_save_for_pc(&data);

    Ok(compressed)
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

#[tauri::command(rename_all = "snake_case")]
async fn change_items_durability_max(
    item_chunks: Vec<InventoryChunk>,
    save_file_content: Vec<u8>,
) -> Result<(Vec<InventoryChunk>, Vec<u8>), ()> {
    let new_save_data = change_items_durability(
        item_chunks, 
        9999999.0,
        save_file_content,
    );

    Ok(new_save_data)
}

#[tauri::command(rename_all = "snake_case")]
async fn change_items_durability_1(
    item_chunks: Vec<InventoryChunk>,
    save_file_content: Vec<u8>,
) -> Result<(Vec<InventoryChunk>, Vec<u8>), ()> {
    let new_save_data = change_items_durability(
        item_chunks, 
        1.0,
        save_file_content,
    );

    Ok(new_save_data)
}

#[tauri::command(rename_all = "snake_case")]
async fn change_items_durability_1_negative(
    item_chunks: Vec<InventoryChunk>,
    save_file_content: Vec<u8>,
) -> Result<(Vec<InventoryChunk>, Vec<u8>), ()> {
    let new_save_data = change_items_durability(
        item_chunks, 
        -1.0,
        save_file_content,
    );

    Ok(new_save_data)
}

#[tauri::command(rename_all = "snake_case")]
async fn change_items_amount_max(
    item_chunks: Vec<InventoryChunk>,
    save_file_content: Vec<u8>,
) -> Result<(Vec<InventoryChunk>, Vec<u8>), ()> {
    let new_save_data = change_items_amount(
        item_chunks, 
        9999999,
        save_file_content,
    );

    Ok(new_save_data)
}

#[tauri::command(rename_all = "snake_case")]
async fn change_items_amount_1(
    item_chunks: Vec<InventoryChunk>,
    save_file_content: Vec<u8>,
) -> Result<(Vec<InventoryChunk>, Vec<u8>), ()> {
    let new_save_data = change_items_amount(
        item_chunks, 
        1,
        save_file_content,
    );

    Ok(new_save_data)
}

#[tauri::command(rename_all = "snake_case")]
async fn remove_item(
    start_index: usize,
    end_index: usize,
    chunk_index: usize,
    save_file_content: Vec<u8>
) -> Result<Vec<u8>, ()> {
    let new_save_data = remove_inventory_item(
        start_index, 
        end_index,
        chunk_index,
        save_file_content,
    );

    Ok(new_save_data)
}

fn main() {
    dotenv().ok();
    // Comment tauri builder if debugging.
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            get_ids,
            load_save,
            export_for_pc,
            handle_edit_skill,
            handle_edit_item_chunk,
            remove_item,
            change_items_durability_max,
            change_items_durability_1,
            change_items_durability_1_negative,
            change_items_amount_max,
            change_items_amount_1,
            ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    // // Uncomment the following line to if .env file should be selected.
    // let file_path = std::env::var("FILE_PATH").expect("FILE_PATH must be set.");
    // let save_file = load_save_file(&file_path);
}