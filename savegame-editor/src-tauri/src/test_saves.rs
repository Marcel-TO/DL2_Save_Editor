#[cfg(test)]
mod tests {
    use dotenv::dotenv;
    use crate::file_analizer::{load_save_file, get_contents_from_file};
    use std::fs;
    use std::path::Path;

    #[test]
    fn test_items_for_various_save_files() {
        dotenv().ok();

        let dir_string = std::env::var("SAVE_DIRECTORY_PATH").expect("SAVE_DIRECTORY_PATH must be set.");
        let dir_path = Path::new(dir_string.as_str());

        if dir_path.is_dir() {
            for entry in fs::read_dir(dir_path).unwrap() {
                let entry = entry.unwrap();
                let path = entry.path();
    
                if path.is_file() {
                    if let Some(file_name) = path.file_name() {
                        // Check if the file has the desired extension
                        if file_name.to_string_lossy().ends_with(".sav") {
                            let file_content: Vec<u8> = get_contents_from_file(path.to_str().unwrap()).unwrap();
                            let save_file = load_save_file(path.to_str().unwrap(), file_content);        
                            assert!(
                                save_file.items.len() > 0,
                                "Save file at path '{}' should have at least one item, but it has {} items.",
                                path.to_str().unwrap(),
                                save_file.items.len()
                            );
                        }
                    }
                }
            }
        } else {
            assert!(false, "The path given by .env is not a directory");
        }
    }
}