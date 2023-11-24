// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod file_analizer;
mod id_fetcher;
mod struct_data;

use dotenv::dotenv;
use file_analizer::{load_save_file, edit_skill};
use log::info;
use struct_data::{SaveFile, SkillItem};
use id_fetcher::fetch_ids;
use tauri::AppHandle;

#[tauri::command(rename_all = "snake_case")]
fn get_ids(app_handle: AppHandle) -> Vec<struct_data::IdData> {
    let resource_path = app_handle.path_resolver().resolve_resource("./IDs/").unwrap();

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
    let save_file = load_save_file(&file_path);

    save_file
}

#[tauri::command(rename_all = "snake_case")]
fn handle_edit_skill(current_skill: SkillItem, current_skill_index: usize, is_base_skill: bool,  new_value: u16, save_file: SaveFile) -> SaveFile {
    let new_save_file = edit_skill(current_skill, current_skill_index, is_base_skill, new_value, save_file);

    new_save_file
}


fn main() {
    dotenv().ok();
    // // Comment tauri builder if debugging.
    // tauri::Builder::default()
    //     .plugin(tauri_plugin_log::Builder::default().build())
    //     .invoke_handler(tauri::generate_handler![
    //         get_ids,
    //         load_save,
    //         handle_edit_skill
    //         ])
    //     .run(tauri::generate_context!())
    //     .expect("error while running tauri application");

    // Uncomment the following line to if .env file should be selected.
    let file_path = std::env::var("FILE_PATH").expect("FILE_PATH must be set.");
    let save_file = load_save_file(&file_path);

    let changing_skill: &SkillItem = &save_file.skills.legend_skills.clone()[0];
    let new_save_file: SaveFile = edit_skill(changing_skill.clone(), 0, false, 1, save_file);
    info!("{:?}", changing_skill);
    info!("{:?}", &new_save_file.skills.legend_skills[0]);
    info!("Changed")
}