// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod logger;
mod save_logic;

use std::error::Error;
use std::thread::current;

use crate::logger::ConsoleLogger;
use dotenv::dotenv;
use save_logic::bypass_crc::get_files_and_copy_to_destination;
use save_logic::file_analyser::{
    change_items_amount, change_items_durability, create_backup_from_file,
    edit_inventory_item_chunk, edit_skill, export_save_for_pc, get_contents_from_file,
    load_save_file, load_save_file_pc, remove_inventory_item,
};
use save_logic::id_fetcher::{fetch_ids, update_ids};
use save_logic::struct_data::{IdData, InventoryChunk, SaveFile};
use tauri::AppHandle;

#[tauri::command(rename_all = "snake_case")]
async fn get_ids(app_handle: AppHandle) -> Result<Vec<IdData>, String> {
    // Initializes resource path where IDs are stored.
    let resource_path = app_handle
        .path_resolver()
        .resolve_resource("./IDs/")
        .unwrap();

    match fetch_ids(&resource_path.display().to_string()) {
        Ok(id_datas) => Ok(id_datas),
        Err(_) => {
            let empty_vectory: Vec<IdData> = Vec::new();
            Ok(empty_vectory)
        }
    }
}

#[tauri::command(rename_all = "snake_case")]
fn update_id_folder(app_handle: AppHandle, file_path: &str) {
    // Initializes resource path where IDs are stored.
    let resource_path = app_handle
        .path_resolver()
        .resolve_resource("./IDs/")
        .unwrap();

    match update_ids(file_path, &resource_path.display().to_string()) {
        Ok(()) => println!("Successfully replaced directory contents."),
        Err(err) => eprintln!("Error: {}", err),
    }
}

#[tauri::command(rename_all = "snake_case")]
fn load_save(
    app_handle: AppHandle,
    file_path: &str,
    is_debugging: bool,
    has_automatic_backup: bool,
) -> Result<SaveFile, String> {
    // Initializes the logger.
    let mut logger: ConsoleLogger = ConsoleLogger::new();
    // Initializes resource path where IDs are stored.
    let resource_path: std::path::PathBuf = app_handle
        .path_resolver()
        .resolve_resource("./IDs/")
        .unwrap();

    // Initializes IDs
    let ids: Result<Vec<IdData>, Box<dyn Error>> = fetch_ids(&resource_path.display().to_string());

    let file_content: Vec<u8> = get_contents_from_file(&file_path).unwrap();

    // Checks if the file is compressed.
    if file_content[0] == 31 && file_content[1] == 139 {
        let save_file = load_save_pc(app_handle, file_path, is_debugging, has_automatic_backup);
        match save_file {
            Ok(save) => return Ok(save),
            Err(err) => return Err(err),
        }
    }

    // Creates a backup file if the settings are set to true.
    if has_automatic_backup {
        create_backup_from_file(&file_path, &file_content);
    }

    let save_file = load_save_file(
        &file_path,
        file_content,
        ids.unwrap(),
        &mut logger,
        is_debugging,
        false,
    );

    match save_file {
        Ok(save) => return Ok(save),
        Err(err) => return Err(err.to_string()),
    }
}

#[tauri::command(rename_all = "snake_case")]
fn load_save_pc(
    app_handle: AppHandle,
    file_path: &str,
    is_debugging: bool,
    has_automatic_backup: bool,
) -> Result<SaveFile, String> {
    // Initializes the logger.
    let mut logger: ConsoleLogger = ConsoleLogger::new();
    // Initializes resource path where IDs are stored.
    let resource_path = app_handle
        .path_resolver()
        .resolve_resource("./IDs/")
        .unwrap();

    // Initializes IDs
    let ids = fetch_ids(&resource_path.display().to_string()).unwrap();

    let file_content: Vec<u8> = get_contents_from_file(&file_path).unwrap();

    // Creates a backup file if the settings are set to true.
    if has_automatic_backup {
        create_backup_from_file(&file_path, &file_content);
    }

    let save_file = load_save_file_pc(
        &file_path,
        file_content,
        ids,
        &mut logger,
        is_debugging,
        true,
    );

    match save_file {
        Ok(save) => return Ok(save),
        Err(err) => return Err(err.to_string()),
    }
}

#[tauri::command(rename_all = "snake_case")]
async fn compress_save(data: Vec<u8>) -> Result<Vec<u8>, String> {
    let compressed: Vec<u8> = export_save_for_pc(&data);

    Ok(compressed)
}

#[tauri::command(rename_all = "snake_case")]
async fn handle_edit_skill(
    current_item_size: usize,
    current_skill_index: usize,
    new_value: u16,
    save_file_content: Vec<u8>,
) -> Result<Vec<u8>, String> {
    let new_save_file_content = edit_skill(
        current_item_size,
        current_skill_index,
        new_value,
        save_file_content,
    );
    
    Ok(new_save_file_content)
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
    save_file_content: Vec<u8>,
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
        save_file_content,
    );

    Ok(new_save_content)
}

#[tauri::command(rename_all = "snake_case")]
async fn change_items_durability_max(
    item_chunks: Vec<InventoryChunk>,
    save_file_content: Vec<u8>,
) -> Result<(Vec<InventoryChunk>, Vec<u8>), String> {
    let new_save_data = change_items_durability(item_chunks, 9999999.0, save_file_content);

    Ok(new_save_data)
}

#[tauri::command(rename_all = "snake_case")]
async fn change_items_durability_1(
    item_chunks: Vec<InventoryChunk>,
    save_file_content: Vec<u8>,
) -> Result<(Vec<InventoryChunk>, Vec<u8>), String> {
    let new_save_data = change_items_durability(item_chunks, 1.0, save_file_content);

    Ok(new_save_data)
}

#[tauri::command(rename_all = "snake_case")]
async fn change_items_durability_1_negative(
    item_chunks: Vec<InventoryChunk>,
    save_file_content: Vec<u8>,
) -> Result<(Vec<InventoryChunk>, Vec<u8>), String> {
    let new_save_data = change_items_durability(item_chunks, -1.0, save_file_content);

    Ok(new_save_data)
}

#[tauri::command(rename_all = "snake_case")]
async fn change_items_amount_max(
    item_chunks: Vec<InventoryChunk>,
    save_file_content: Vec<u8>,
) -> Result<(Vec<InventoryChunk>, Vec<u8>), String> {
    let new_save_data = change_items_amount(item_chunks, 9999999, save_file_content);

    Ok(new_save_data)
}

#[tauri::command(rename_all = "snake_case")]
async fn change_items_amount_1(
    item_chunks: Vec<InventoryChunk>,
    save_file_content: Vec<u8>,
) -> Result<(Vec<InventoryChunk>, Vec<u8>), String> {
    let new_save_data = change_items_amount(item_chunks, 1, save_file_content);

    Ok(new_save_data)
}

#[tauri::command(rename_all = "snake_case")]
async fn remove_item(
    start_index: usize,
    end_index: usize,
    chunk_index: usize,
    save_file_content: Vec<u8>,
) -> Result<Vec<u8>, String> {
    let new_save_data =
        remove_inventory_item(start_index, end_index, chunk_index, save_file_content);

    Ok(new_save_data)
}

#[tauri::command(rename_all = "snake_case")]
async fn open_knowledge_window(
    app_handle: AppHandle,
    url: &str,
    name: &str,
) -> Result<bool, String> {
    let local_window = tauri::WindowBuilder::new(
        &app_handle,
        name.replace(" ", "_").to_uppercase().as_str(),
        tauri::WindowUrl::App(url.into()),
    )
    .title(name)
    .maximized(true)
    .build();

    match local_window {
        Ok(_) => Ok(true),
        Err(_) => Err(format!("Error while opening window with url: {}.", url)),
    }
}

#[tauri::command(rename_all = "snake_case")]
async fn add_crc_bypass_files(app_handle: AppHandle, file_path: &str) -> Result<bool, String> {
    println!("Adding CRC bypass files.");
    println!("{}", file_path);

    // Initializes resource path where IDs are stored.
    let resource_path = app_handle
        .path_resolver()
        .resolve_resource("./CRC_Bypass/")
        .unwrap();

    match get_files_and_copy_to_destination(&resource_path.display().to_string(), file_path) {
        Ok(_) => Ok(true),
        Err(err) => {
            println!("Error: {}", err);
            Err(err.to_string())
        }
    }
}

fn main() {
    dotenv().ok();
    // Comment tauri builder if debugging.
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::default().build())
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            get_ids,
            update_id_folder,
            load_save,
            load_save_pc,
            compress_save,
            handle_edit_skill,
            handle_edit_item_chunk,
            remove_item,
            change_items_durability_max,
            change_items_durability_1,
            change_items_durability_1_negative,
            change_items_amount_max,
            change_items_amount_1,
            open_knowledge_window,
            add_crc_bypass_files
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    // // Uncomment the following line to if .env file should be selected.
    // // let file_path = std::env::var("FILE_PATH").expect("FILE_PATH must be set.");
    // let file_path = "C:\\Users\\MarcelTurobin-Ort\\Downloads\\save_main_0 (2).sav";
    // // Initializes the logger.
    // let mut logger: ConsoleLogger = ConsoleLogger::new();
    // // Initializes resource path where IDs are stored.
    // // let resource_path = std::env::var("IDS_PATH").expect("IDS_PATH must be set.");
    // let resource_path = "C:\\Users\\MarcelTurobin-Ort\\Github\\_Privat\\DL2_Save_Editor\\savegame-editor\\src-tauri\\IDs".to_string();

    // // Initializes IDs
    // let ids = fetch_ids(&resource_path).unwrap();

    // let file_content: Vec<u8> = get_contents_from_file(&file_path).unwrap();
    // create_backup_from_file(&file_path, &file_content);
    // let save_file = load_save_file(&file_path, file_content, ids, &mut logger, true, false).unwrap();

    // // println!("{:?}", save_file.file_string)
}
