mod route;
mod err;

use tauri::{Manager, WindowEvent};
use route::router;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {

    let router = router::build_router().unwrap();

    tauri::Builder::default()
        .register_uri_scheme_protocol("local", move |_ctx, request| {
            let router = router.clone();
            router::route(&router, request).unwrap_or_else(|err| {
                let body = format!("Internal Server Error: {}", err);
                http::Response::builder()
                    .status(500)
                    .header("Content-Type", "text/plain")
                    .header("Content-Length", body.len().to_string())
                    .body(body.into_bytes())
                    .unwrap()
            })
        })
        .setup(|app| {
            let window = app.get_window("main").unwrap();
            window.on_window_event(move |event| {
                if let WindowEvent::CloseRequested { api: _, .. } = event {
                    println!("CloseRequested");
                    // api.prevent_close();
                }
                if let WindowEvent::Destroyed = event {
                    println!("Destroyed")
                }
            });
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
