use std::path::{Path, PathBuf};
use tauri::{AppHandle, Manager};

// The folder pre-existing notes are migrated into. Special only as a migration
// target - the user may rename or delete it like any other folder.
const DEFAULT_FOLDER: &str = "general";

// WebKit/Tauri runtime files that must not be treated as user notes or folders.
// hsts-storage.md is recreated by WebKitGTK at the app_data_dir root on Linux.
const WEBKIT_FILES: &[&str] = &["hsts-storage.md"];

#[derive(serde::Serialize)]
struct FileInfo {
    file_name: String,
    date_created: String,
}

#[derive(serde::Serialize)]
struct FolderInfo {
    folder_name: String,
    note_count: usize,
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

// Reject any name that could let a path escape notes/ (separators, parent-dir
// refs, absolute paths, NUL). Shared by folder names and file names on purpose:
// a laxer folder check would let notes/<folder> escape while the file path stays
// guarded, so there is deliberately only one implementation.
fn validate_name(name: &str, label: &str) -> Result<(), String> {
    if name.is_empty() {
        return Err(format!("{} cannot be empty", label));
    }
    if name.contains('/') || name.contains('\\') || name.contains('\0') {
        return Err(format!("{} contains invalid characters", label));
    }
    if name == "." || name == ".." {
        return Err(format!("Invalid {}", label.to_lowercase()));
    }

    Ok(())
}

// Resolve notes/<folder_name>. Validates only - does NOT create the directory,
// so read paths never materialise folders for names the user mistyped.
fn folder_dir(app: &AppHandle, folder_name: &str) -> Result<PathBuf, String> {
    validate_name(folder_name, "Folder name")?;

    let notes = notes_dir(app)?;

    Ok(notes.join(folder_name))
}

fn ensure_folder_dir(app: &AppHandle, folder_name: &str) -> Result<PathBuf, String> {
    use std::fs;

    let dir = folder_dir(app, folder_name)?;
    fs::create_dir_all(&dir)
        .map_err(|e| format!("Failed to create folder \"{}\": {}", folder_name, e))?;

    Ok(dir)
}

// Resolve notes/<folder_name>/<file_name>.md. Read path - folder is not created.
fn notes_file_path(app: &AppHandle, folder_name: &str, file_name: &str) -> Result<PathBuf, String> {
    validate_name(file_name, "File name")?;

    let dir = folder_dir(app, folder_name)?;

    Ok(dir.join(format!("{}.md", file_name)))
}

// Write-path variant: creates the folder if it is missing so an autosave can
// never fail - and silently drop the user's buffer - because the folder vanished
// underneath the UI. The file name is validated before the mkdir so a bad name
// doesn't leave an empty folder behind.
fn notes_file_path_ensured(
    app: &AppHandle,
    folder_name: &str,
    file_name: &str,
) -> Result<PathBuf, String> {
    validate_name(file_name, "File name")?;

    let dir = ensure_folder_dir(app, folder_name)?;

    Ok(dir.join(format!("{}.md", file_name)))
}

fn ensure_default_folder(app: &AppHandle) -> Result<PathBuf, String> {
    ensure_folder_dir(app, DEFAULT_FOLDER)
}

fn count_notes_in_dir(dir: &Path) -> Result<usize, String> {
    use std::fs;

    let mut count = 0;
    for entry in fs::read_dir(dir).map_err(|e| format!("Failed to read folder: {}", e))? {
        let entry = entry.map_err(|e| format!("Failed to read directory entry: {}", e))?;
        let path = entry.path();

        if path.is_file() && path.extension().and_then(|s| s.to_str()) == Some("md") {
            count += 1;
        }
    }

    Ok(count)
}

// Pick a non-colliding destination inside `dir` for <stem>.md: foo.md, then
// "foo (2).md", "foo (3).md"... Never returns an existing path, so a migration
// never has to skip - and thus never strands a note at a location no command
// can list, which users read as the note having been deleted.
fn unique_md_path(dir: &Path, stem: &str) -> Result<PathBuf, String> {
    let direct = dir.join(format!("{}.md", stem));
    if !direct.exists() {
        return Ok(direct);
    }

    for n in 2..1000 {
        let candidate = dir.join(format!("{} ({}).md", stem, n));
        if !candidate.exists() {
            return Ok(candidate);
        }
    }

    Err(format!("Could not find a free name for \"{}\"", stem))
}

// Move every *.md file sitting directly in `src` into `dest`, skipping WebKit
// runtime files. Subdirectories of `src` are never touched, which is what makes
// this safe to aim at notes/ itself and idempotent on re-run.
fn move_md_files_into(src: &Path, dest: &Path) -> Result<(), String> {
    use std::fs;

    if !src.exists() || src == dest {
        return Ok(());
    }

    fs::create_dir_all(dest)
        .map_err(|e| format!("Failed to create migration target: {}", e))?;

    for entry in fs::read_dir(src).map_err(|e| format!("Failed to read {:?}: {}", src, e))? {
        let entry = entry.map_err(|e| format!("Failed to read directory entry: {}", e))?;
        let path = entry.path();

        if !path.is_file() {
            continue;
        }

        let Some(file_name) = path.file_name().and_then(|s| s.to_str()) else {
            continue;
        };

        if !file_name.ends_with(".md") || WEBKIT_FILES.contains(&file_name) {
            continue;
        }

        let Some(stem) = path.file_stem().and_then(|s| s.to_str()) else {
            continue;
        };

        let target = unique_md_path(dest, stem)?;
        fs::rename(&path, &target)
            .map_err(|e| format!("Failed to migrate {} into {:?}: {}", file_name, dest, e))?;
    }

    Ok(())
}

// One-time migration: notes/*.md (loose, from before folders existed) -> notes/general/.
fn migrate_loose_notes_to_default_folder(app: &AppHandle) -> Result<(), String> {
    let notes = notes_dir(app)?;
    let general = ensure_default_folder(app)?;

    move_md_files_into(&notes, &general)
}

// One-time migration: app_data_dir/*.md (from before the notes/ subdir existed)
// -> notes/general/.
fn migrate_root_notes_to_default_folder(app: &AppHandle) -> Result<(), String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;

    let general = ensure_default_folder(app)?;

    move_md_files_into(&app_dir, &general)
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn load_content_by_name(
    app: AppHandle,
    folder_name: String,
    file_name: String,
) -> Result<String, String> {
    use std::fs;

    let file_path = notes_file_path(&app, &folder_name, &file_name)?;

    if file_path.exists() {
        let content = fs::read_to_string(&file_path)
            .map_err(|e| format!("Failed to read content file: {}", e))?;
        Ok(content)
    } else {
        Ok(String::new())
    }
}

#[tauri::command]
fn save_content_by_name(
    app: AppHandle,
    folder_name: String,
    file_name: String,
    content: String,
) -> Result<(), String> {
    use std::fs;

    let file_path = notes_file_path_ensured(&app, &folder_name, &file_name)?;

    fs::write(&file_path, content)
        .map_err(|e| format!("Failed to write content file: {}", e))?;

    Ok(())
}

#[tauri::command]
fn add_file(app: AppHandle, folder_name: String, file_name: String) -> Result<(), String> {
    use std::fs;

    let file_path = notes_file_path_ensured(&app, &folder_name, &file_name)?;

    if file_path.exists() {
        return Err(format!("A file named \"{}\" already exists", file_name));
    }

    fs::write(&file_path, "")
        .map_err(|e| format!("Failed to create file: {}", e))?;

    Ok(())
}

#[tauri::command]
fn load_files(app: AppHandle, folder_name: String) -> Result<Vec<FileInfo>, String> {
    use std::fs;

    let dir = folder_dir(&app, &folder_name)?;

    // A stale folder selection shows an empty list rather than an error.
    if !dir.exists() {
        return Ok(Vec::new());
    }

    let mut files = Vec::new();
    for entry in fs::read_dir(&dir).map_err(|e| format!("Failed to read folder: {}", e))? {
        let entry = entry.map_err(|e| format!("Failed to read directory entry: {}", e))?;
        let path = entry.path();

        if !path.is_file() || path.extension().and_then(|s| s.to_str()) != Some("md") {
            continue;
        }

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

    Ok(files)
}

#[tauri::command]
fn delete_file_by_name(
    app: AppHandle,
    folder_name: String,
    file_name: String,
) -> Result<(), String> {
    use std::fs;

    let file_path = notes_file_path(&app, &folder_name, &file_name)?;

    if file_path.exists() {
        fs::remove_file(&file_path)
            .map_err(|e| format!("Failed to delete file: {}", e))?;
        Ok(())
    } else {
        Err("File not found".to_string())
    }
}

#[tauri::command]
fn rename_file_by_name(
    app: AppHandle,
    folder_name: String,
    old_file_name: String,
    new_file_name: String,
) -> Result<(), String> {
    use std::fs;

    let old_path = notes_file_path(&app, &folder_name, &old_file_name)?;
    let new_path = notes_file_path(&app, &folder_name, &new_file_name)?;

    if !old_path.exists() {
        return Err("File not found".to_string());
    }

    if old_path == new_path {
        return Ok(());
    }

    if new_path.exists() {
        return Err(format!("A file named \"{}\" already exists", new_file_name));
    }

    fs::rename(&old_path, &new_path)
        .map_err(|e| format!("Failed to rename file: {}", e))?;

    Ok(())
}

#[tauri::command]
fn load_folders(app: AppHandle) -> Result<Vec<FolderInfo>, String> {
    use std::fs;

    let notes = notes_dir(&app)?;

    let mut folders = Vec::new();
    for entry in fs::read_dir(&notes).map_err(|e| format!("Failed to read notes dir: {}", e))? {
        let entry = entry.map_err(|e| format!("Failed to read directory entry: {}", e))?;
        let path = entry.path();

        if !path.is_dir() {
            continue;
        }

        let Some(folder_name) = path.file_name().and_then(|s| s.to_str()) else {
            continue;
        };

        // Only dotfiles and known WebKit names are hidden. Filtering by any other
        // heuristic would turn a real folder into an invisible pile of notes.
        if folder_name.starts_with('.') || WEBKIT_FILES.contains(&folder_name) {
            continue;
        }

        folders.push(FolderInfo {
            folder_name: folder_name.to_string(),
            note_count: count_notes_in_dir(&path)?,
        });
    }

    // read_dir order is OS-dependent; sort so the panel doesn't reshuffle between launches.
    folders.sort_by(|a, b| {
        a.folder_name
            .to_lowercase()
            .cmp(&b.folder_name.to_lowercase())
    });

    Ok(folders)
}

#[tauri::command]
fn add_folder(app: AppHandle, folder_name: String) -> Result<(), String> {
    use std::fs;

    let dir = folder_dir(&app, &folder_name)?;

    if dir.exists() {
        return Err(format!("A folder named \"{}\" already exists", folder_name));
    }

    fs::create_dir_all(&dir)
        .map_err(|e| format!("Failed to create folder: {}", e))?;

    Ok(())
}

#[tauri::command]
fn rename_folder_by_name(
    app: AppHandle,
    old_folder_name: String,
    new_folder_name: String,
) -> Result<(), String> {
    use std::fs;

    let old_path = folder_dir(&app, &old_folder_name)?;
    let new_path = folder_dir(&app, &new_folder_name)?;

    if !old_path.is_dir() {
        return Err("Folder not found".to_string());
    }

    if old_path == new_path {
        return Ok(());
    }

    // Never merge on collision: merging means per-file collision handling inside
    // a rename, and a mistake there deletes notes.
    if new_path.exists() {
        return Err(format!("A folder named \"{}\" already exists", new_folder_name));
    }

    fs::rename(&old_path, &new_path)
        .map_err(|e| format!("Failed to rename folder: {}", e))?;

    Ok(())
}

#[tauri::command]
fn delete_folder_by_name(app: AppHandle, folder_name: String) -> Result<(), String> {
    use std::fs;

    let dir = folder_dir(&app, &folder_name)?;

    // is_dir rather than exists: this stops remove_dir_all being aimed at a
    // stray file named notes/<folder_name>.
    if !dir.is_dir() {
        return Err("Folder not found".to_string());
    }

    fs::remove_dir_all(&dir)
        .map_err(|e| format!("Failed to delete folder: {}", e))?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            if let Err(e) = ensure_default_folder(app.handle()) {
                eprintln!("Default folder setup skipped: {}", e);
            }
            // Loose notes run first: notes/ is the newer authoritative location,
            // so it wins the plain name and a stale root copy becomes "x (2).md".
            if let Err(e) = migrate_loose_notes_to_default_folder(app.handle()) {
                eprintln!("Loose notes migration skipped: {}", e);
            }
            if let Err(e) = migrate_root_notes_to_default_folder(app.handle()) {
                eprintln!("Root notes migration skipped: {}", e);
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            add_file,
            load_files,
            load_content_by_name,
            save_content_by_name,
            delete_file_by_name,
            rename_file_by_name,
            load_folders,
            add_folder,
            rename_folder_by_name,
            delete_folder_by_name
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
