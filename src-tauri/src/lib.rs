mod err;
mod route;
mod utils;

use route::router;
use tauri::{Manager, WindowEvent};
use err::Error;
use specta;
use tauri_specta::{collect_commands, Builder};
// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/


#[tauri::command]
#[specta::specta]
fn read_to_string(fullpath: &str) -> Result<String, Error> {
    Ok(utils::read_to_string(fullpath)?)
}

#[tauri::command]
#[specta::specta]
fn write_to_string(fullpath: &str, content: &str) -> Result<(), Error> {
    Ok(utils::write_to_string(fullpath, content)?)
}

#[tauri::command]
#[specta::specta]
fn app_read_to_string(subpath: &str) -> Result<String, Error> {
    Ok(utils::app_read_to_string(subpath)?)
}

#[tauri::command]
#[specta::specta]
fn app_write_to_string(subpath: &str, content: &str) -> Result<(), Error> {
    Ok(utils::app_write_to_string(subpath, content)?)
}



#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = Builder::<tauri::Wry>::new().commands(collect_commands![
        read_to_string,
        write_to_string,
        app_read_to_string,
        app_write_to_string,
    ]);

    #[cfg(debug_assertions)]
    {
        use std::path::Path;
        // use std::fs::OpenOptions;
        // use std::io::Write;

        use specta_typescript::BigIntExportBehavior;
        use specta_typescript::Typescript;
        // use specta::TypeCollection;


        let bindings_path = Path::new("../src/bindings.ts");
        let ts = Typescript::default().bigint(BigIntExportBehavior::Number);
        builder
            .export(ts.clone(), bindings_path)
            .expect("Failed to export typescript bindings");
    }


    let router = router::build_router().unwrap();

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
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
        // .invoke_handler(tauri::generate_handler![
        //     read_to_string,
        //     write_to_string,
        //     app_read_to_string,
        //     app_write_to_string,
        // ])
        .invoke_handler(builder.invoke_handler())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
