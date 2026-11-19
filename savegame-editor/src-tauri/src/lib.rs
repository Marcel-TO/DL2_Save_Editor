mod logger;
mod save_logic;

use std::error::Error;

use logger::ConsoleLogger;
use save_logic::bypass_crc::get_files_and_copy_to_destination;
use save_logic::file_analyser::{
    change_items_amount, change_items_durability, create_backup_from_file,
    edit_inventory_item_chunk, edit_skill, export_save_for_pc, get_contents_from_file,
    load_save_file, load_save_file_pc, remove_inventory_item, InventoryItemEdit,
};
use save_logic::id_fetcher::{fetch_ids, update_ids};
use save_logic::patched_items_fetcher::fetch_patched_ids;
use save_logic::save_outpost::fetch_outpost_saves;
use save_logic::struct_data::{IdData, InventoryChunk, OutpostSave, PatchedItems, SaveFile};
use tauri::path::BaseDirectory;
use tauri::{AppHandle, Manager};

#[tauri::command(rename_all = "snake_case")]
async fn get_ids(app_handle: AppHandle) -> Result<Vec<IdData>, String> {
    // Initializes resource path where IDs are stored.
    let resource_path = app_handle
        .path()
        .resolve("./IDs/", BaseDirectory::Resource)
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
async fn get_patched_items(app_handle: AppHandle) -> Result<PatchedItems, String> {
    // Initializes resource path where IDs are stored.
    let resource_path = app_handle
        .path()
        .resolve("./Patched_Items/", BaseDirectory::Resource)
        .unwrap();

    match fetch_patched_ids(&resource_path.display().to_string()) {
        Ok(patched_items) => Ok(patched_items),
        Err(_) => Err("Could not find the patched files.".into()),
    }
}

#[tauri::command(rename_all = "snake_case")]
fn update_id_folder(app_handle: AppHandle, file_path: &str) {
    // Initializes resource path where IDs are stored.
    let resource_path = app_handle
        .path()
        .resolve("./IDs/", BaseDirectory::Resource)
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
        .path()
        .resolve("./IDs/", BaseDirectory::Resource)
        .unwrap();

    // Initializes IDs
    let ids: Result<Vec<IdData>, Box<dyn Error>> = fetch_ids(&resource_path.display().to_string());

    let file_content: Vec<u8> = get_contents_from_file(file_path).unwrap();

    // Checks if the file is compressed.
    if file_content[0] == 31 && file_content[1] == 139 {
        return load_save_pc(app_handle, file_path, is_debugging, has_automatic_backup);
    }

    let backup_path = if has_automatic_backup {
        Some(
            create_backup_from_file(file_path, &file_content).map_err(|error| {
                format!(
                    "Could not create a backup before loading the save: {}",
                    error
                )
            })?,
        )
    } else {
        None
    };

    let mut save_file = load_save_file(
        file_path,
        file_content,
        ids.unwrap(),
        &mut logger,
        is_debugging,
        false,
    )
    .map_err(|error| error.to_string())?;

    save_file.backup_path = backup_path;
    Ok(save_file)
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
        .path()
        .resolve("./IDs/", BaseDirectory::Resource)
        .unwrap();

    // Initializes IDs
    let ids = fetch_ids(&resource_path.display().to_string()).unwrap();

    let file_content: Vec<u8> = get_contents_from_file(file_path).unwrap();

    let backup_path = if has_automatic_backup {
        Some(
            create_backup_from_file(file_path, &file_content).map_err(|error| {
                format!(
                    "Could not create a backup before loading the save: {}",
                    error
                )
            })?,
        )
    } else {
        None
    };

    let mut save_file = load_save_file_pc(
        file_path,
        file_content,
        ids,
        &mut logger,
        is_debugging,
        true,
    )
    .map_err(|error| error.to_string())?;

    save_file.backup_path = backup_path;
    Ok(save_file)
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
    edit: InventoryItemEdit,
    save_file_content: Vec<u8>,
) -> Result<Vec<u8>, String> {
    let new_save_content = edit_inventory_item_chunk(edit, save_file_content);

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
    let local_window = tauri::WebviewWindowBuilder::new(
        &app_handle,
        name.replace(" ", "_").to_uppercase().as_str(),
        tauri::WebviewUrl::App(url.into()),
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
        .path()
        .resolve("./CRC_Bypass/", BaseDirectory::Resource)
        .unwrap();

    match get_files_and_copy_to_destination(&resource_path.display().to_string(), file_path) {
        Ok(_) => Ok(true),
        Err(err) => {
            println!("Error: {}", err);
            Err(err.to_string())
        }
    }
}

#[tauri::command(rename_all = "snake_case")]
async fn get_outpost_saves(app_handle: AppHandle) -> Result<Vec<OutpostSave>, String> {
    // Initializes resource path where IDs are stored.
    let resource_path_result = app_handle
        .path()
        .resolve("./Hawks_Outpost/", BaseDirectory::Resource);

    let resource_path = match resource_path_result {
        Ok(path) => path,
        Err(err) => {
            println!("Error: {}", err);
            return Err(err.to_string());
        }
    };

    match fetch_outpost_saves(app_handle, &resource_path.display().to_string()) {
        Ok(result) => Ok(result),
        Err(err) => {
            println!("Error: {}", err);
            Err(err.to_string())
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
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
            add_crc_bypass_files,
            get_outpost_saves,
            get_patched_items
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
