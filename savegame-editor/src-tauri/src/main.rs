// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod save_logic;
mod logger;

use std::error::Error;

use dotenv::dotenv;
use save_logic::file_analyser::{change_items_amount, change_items_durability, create_backup_from_file, edit_inventory_item_chunk, edit_skill, export_save_for_pc, get_contents_from_file, load_save_file, load_save_file_pc, remove_inventory_item};
use save_logic::struct_data::{SaveFile, InventoryChunk, IdData};
use save_logic::id_fetcher::{fetch_ids, update_ids};
use tauri::AppHandle;
use crate::logger::ConsoleLogger;


#[tauri::command(rename_all = "snake_case")]
async fn get_ids(app_handle: AppHandle) -> Result<Vec<IdData>, String> {
    // Initializes resource path where IDs are stored.
    let resource_path = app_handle.path_resolver().resolve_resource("./IDs/").unwrap();

    match fetch_ids(&resource_path.display().to_string()) {
        Ok(id_datas) => {
            Ok(id_datas)
        }
        Err(_) => {
            let empty_vectory: Vec<IdData> = Vec::new();
            Ok(empty_vectory)
        }
    }
}

#[tauri::command(rename_all = "snake_case")]
fn update_id_folder(app_handle: AppHandle, file_path: &str) {
    // Initializes resource path where IDs are stored.
    let resource_path = app_handle.path_resolver().resolve_resource("./IDs/").unwrap();

    match update_ids(file_path, &resource_path.display().to_string()) {
        Ok(()) => println!("Successfully replaced directory contents."),
        Err(err) => eprintln!("Error: {}", err),
    }
}

#[tauri::command(rename_all = "snake_case")]
fn load_save(app_handle: AppHandle, file_path: &str, is_debugging: bool, has_automatic_backup: bool) -> Result<SaveFile, String> {
    // Initializes the logger.
    let mut logger: ConsoleLogger = ConsoleLogger::new();
    // Initializes resource path where IDs are stored.
    let resource_path: std::path::PathBuf = app_handle.path_resolver().resolve_resource("./IDs/").unwrap();

    // Initializes IDs
    let ids: Result<Vec<IdData>, Box<dyn Error>> = fetch_ids(&resource_path.display().to_string());
    
    let file_content: Vec<u8> = get_contents_from_file(&file_path).unwrap();
    
    // Creates a backup file if the settings are set to true.
    if has_automatic_backup {
        create_backup_from_file(&file_path, &file_content);
    }
    
    let save_file = load_save_file(&file_path, file_content, ids.unwrap(), &mut logger, is_debugging);

    match save_file {
        Ok(save) => return Ok(save),
        Err(err) => return Err(err.to_string())
    }
}

#[tauri::command(rename_all = "snake_case")]
async fn load_save_pc(app_handle: AppHandle, file_path: &str, is_debugging: bool, has_automatic_backup: bool) -> Result<SaveFile, String> {
    // Initializes the logger.
    let mut logger: ConsoleLogger = ConsoleLogger::new();
    // Initializes resource path where IDs are stored.
    let resource_path = app_handle.path_resolver().resolve_resource("./IDs/").unwrap();

    // Initializes IDs
    let ids = fetch_ids(&resource_path.display().to_string()).unwrap();

    let file_content: Vec<u8> = get_contents_from_file(&file_path).unwrap();

    // Creates a backup file if the settings are set to true.
    if has_automatic_backup {
        create_backup_from_file(&file_path, &file_content);
    }

    let save_file = load_save_file_pc(&file_path, file_content, ids, &mut logger, is_debugging);

    match save_file {
        Ok(save) => return Ok(save),
        Err(err) => return Err(err.to_string())
    }
}

#[tauri::command(rename_all = "snake_case")]
async fn export_for_pc(data: Vec<u8>) -> Result<Vec<u8>, String> {
    let compressed: Vec<u8> = export_save_for_pc(&data);

    Ok(compressed)
}

#[tauri::command(rename_all = "snake_case")]
async fn handle_edit_skill(current_skill: String, current_skill_index: usize, is_base_skill: bool,  new_value: u16, save_file: String) -> Result<String, String> {
    let converted_skill = serde_json::from_str(&current_skill).map_err(|_| ()).unwrap();
    let converted_save_file = serde_json::from_str(&save_file).map_err(|_| ()).unwrap();
    
    let new_save_file = edit_skill(converted_skill, current_skill_index, is_base_skill, new_value, converted_save_file);

    let result_save = serde_json::to_string(&new_save_file).map_err(|_| ()).unwrap();    
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
) -> Result<Vec<u8>, String> {
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
) -> Result<(Vec<InventoryChunk>, Vec<u8>), String> {
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
) -> Result<(Vec<InventoryChunk>, Vec<u8>), String> {
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
) -> Result<(Vec<InventoryChunk>, Vec<u8>), String> {
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
) -> Result<(Vec<InventoryChunk>, Vec<u8>), String> {
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
) -> Result<(Vec<InventoryChunk>, Vec<u8>), String> {
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
) -> Result<Vec<u8>, String> {
    let new_save_data = remove_inventory_item(
        start_index, 
        end_index,
        chunk_index,
        save_file_content,
    );

    Ok(new_save_data)
}

#[tauri::command(rename_all = "snake_case")]
async fn open_knowledge_window(app_handle: AppHandle, url: &str, name: &str) -> Result<bool, String> {
    let local_window = tauri::WindowBuilder::new(
        &app_handle,
        name.replace(" ", "_").to_uppercase().as_str(),
        tauri::WindowUrl::App(url.into())
      )
      .title(name)
      .maximized(true)
      .build();
      
    match local_window {
        Ok(_) => Ok(true),
        Err(_) => Err(format!("Error while opening window with url: {}.", url))
    }
}

fn main() {
    dotenv().ok();
    // Comment tauri builder if debugging.
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            get_ids,
            update_id_folder,
            load_save,
            load_save_pc,
            export_for_pc,
            handle_edit_skill,
            handle_edit_item_chunk,
            remove_item,
            change_items_durability_max,
            change_items_durability_1,
            change_items_durability_1_negative,
            change_items_amount_max,
            change_items_amount_1,
            open_knowledge_window
            ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    // // Uncomment the following line to if .env file should be selected.
    // let file_path = std::env::var("FILE_PATH").expect("FILE_PATH must be set.");
    // // Initializes the logger.
    // let mut logger: ConsoleLogger = ConsoleLogger::new();
    // // Initializes resource path where IDs are stored.
    // let resource_path = "/home/mchawk/Documents/Github/DL2_Save_Editor/savegame-editor/src-tauri/target/debug/IDs".to_string();

    // // Initializes IDs
    // let ids = fetch_ids(&resource_path).unwrap();

    // let file_content: Vec<u8> = get_contents_from_file(&file_path).unwrap();
    // create_backup_from_file(&file_path, &file_content);
    // let save_file = load_save_file(&file_path, file_content, ids, &mut logger, false).unwrap();

    // println!("{:?}", save_file.file_string)
}