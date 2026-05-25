use std::path::PathBuf;
use tauri::{AppHandle, Manager};

#[derive(serde::Serialize)]
struct FileInfo {
    file_name: String,
    date_created: String,
}

// Resolve (and create) the dedicated notes directory inside app_data_dir.
// Notes are kept here so they don't sit next to WebKit-managed files
// (hsts-storage.*, cookies.*) that Tauri writes into app_data_dir on Linux.
fn notes_dir(app: &AppHandle) -> Result<PathBuf, String> {
    use std::fs;

    let app_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;

    let notes = app_dir.join("notes");
    fs::create_dir_all(&notes)
        .map_err(|e| format!("Failed to create notes dir: {}", e))?;

    Ok(notes)
}

// Resolve notes_dir/<file_name>.md, rejecting names that would let the path
// escape notes/ (path separators, parent-dir refs, absolute paths, NUL).
// All commands that accept a frontend-supplied file_name must go through this.
fn notes_file_path(app: &AppHandle, file_name: &str) -> Result<PathBuf, String> {
    if file_name.is_empty() {
        return Err("File name cannot be empty".to_string());
    }
    if file_name.contains('/') || file_name.contains('\\') || file_name.contains('\0') {
        return Err("File name contains invalid characters".to_string());
    }
    if file_name == "." || file_name == ".." {
        return Err("Invalid file name".to_string());
    }

    let notes = notes_dir(app)?;
    Ok(notes.join(format!("{}.md", file_name)))
}

// One-time migration: move every *.md file from the top of app_data_dir
// into app_data_dir/notes/. Skips WebKit-managed files and skips any name
// that would overwrite an existing file in notes/.
fn migrate_notes_to_subdir(app: &AppHandle) -> Result<(), String> {
    use std::fs;

    // WebKit/Tauri runtime files that must not be migrated as user notes.
    // hsts-storage.md is recreated by WebKitGTK at the app_data_dir root on Linux.
    const WEBKIT_FILES: &[&str] = &["hsts-storage.md"];

    let app_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;

    if !app_dir.exists() {
        return Ok(());
    }

    let notes = notes_dir(app)?;

    for entry in fs::read_dir(&app_dir)
        .map_err(|e| format!("Failed to read app data dir: {}", e))?
    {
        let entry = entry.map_err(|e| format!("Failed to read directory entry: {}", e))?;
        let path = entry.path();

        if !path.is_file() {
            continue;
        }

        let Some(file_name) = path.file_name().and_then(|s| s.to_str()) else {
            continue;
        };

        if !file_name.ends_with(".md") {
            continue;
        }

        if WEBKIT_FILES.contains(&file_name) {
            continue;
        }

        let dest = notes.join(file_name);
        if dest.exists() {
            continue;
        }

        fs::rename(&path, &dest)
            .map_err(|e| format!("Failed to migrate {} into notes/: {}", file_name, e))?;
    }

    Ok(())
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn save_content(app: AppHandle, content: String) -> Result<(), String> {
    use std::fs;

    let notes = notes_dir(&app)?;
    let file_path = notes.join("content.md");

    fs::write(&file_path, content)
        .map_err(|e| format!("Failed to write content file: {}", e))?;

    Ok(())
}

#[tauri::command]
fn load_content(app: AppHandle) -> Result<String, String> {
    use std::fs;

    let notes = notes_dir(&app)?;
    let file_path = notes.join("content.md");

    if file_path.exists() {
        let content = fs::read_to_string(&file_path)
            .map_err(|e| format!("Failed to read content file: {}", e))?;
        Ok(content)
    } else {
        Ok(String::new())
    }
}

#[tauri::command]
fn load_content_by_name(app: AppHandle, file_name: String) -> Result<String, String> {
    use std::fs;

    let file_path = notes_file_path(&app, &file_name)?;

    if file_path.exists() {
        let content = fs::read_to_string(&file_path)
            .map_err(|e| format!("Failed to read content file: {}", e))?;
        Ok(content)
    } else {
        Ok(String::new())
    }
}

#[tauri::command]
fn save_content_by_name(app: AppHandle, file_name: String, content: String) -> Result<(), String> {
    use std::fs;

    let file_path = notes_file_path(&app, &file_name)?;

    fs::write(&file_path, content)
        .map_err(|e| format!("Failed to write content file: {}", e))?;

    Ok(())
}

#[tauri::command]
fn add_file(app: AppHandle, file_name: String) -> Result<(), String> {
    use std::fs;

    let file_path = notes_file_path(&app, &file_name)?;

    fs::write(&file_path, "")
        .map_err(|e| format!("Failed to create file: {}", e))?;

    Ok(())
}

#[tauri::command]
fn load_files(app: AppHandle) -> Result<Vec<FileInfo>, String> {
    use std::fs;

    let notes = notes_dir(&app)?;

    let mut files = Vec::new();
    for entry in fs::read_dir(&notes).map_err(|e| format!("Failed to read notes dir: {}", e))? {
        let entry = entry.map_err(|e| format!("Failed to read directory entry: {}", e))?;
        let path = entry.path();
        if path.is_file() {
            if let Some(file_name) = path.file_stem().and_then(|s| s.to_str()) {
                let metadata = fs::metadata(&path)
                    .map_err(|e| format!("Failed to get file metadata: {}", e))?;
                let date_created = metadata
                    .created()
                    .ok()
                    .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                    .map(|d| d.as_secs().to_string())
                    .unwrap_or_default();

                files.push(FileInfo {
                    file_name: file_name.to_string(),
                    date_created,
                });
            }
        }
    }

    Ok(files)
}

#[tauri::command]
fn delete_file_by_name(app: AppHandle, file_name: String) -> Result<(), String> {
    use std::fs;

    let file_path = notes_file_path(&app, &file_name)?;

    if file_path.exists() {
        fs::remove_file(&file_path)
            .map_err(|e| format!("Failed to delete file: {}", e))?;
        Ok(())
    } else {
        Err("File not found".to_string())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            if let Err(e) = migrate_notes_to_subdir(app.handle()) {
                eprintln!("Notes migration skipped: {}", e);
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            save_content,
            load_content,
            add_file,
            load_files,
            load_content_by_name,
            save_content_by_name,
            delete_file_by_name
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
