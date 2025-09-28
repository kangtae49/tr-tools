use std::fs::File;
use std::io::{Read, Seek, SeekFrom};
use http::header;
use matchit::{Params, Router};
use tauri::http::{Request, Response};
use urlencoding;
use std::sync::Arc;
use crate::err::{ApiError, ApiResult};
const MAX_FILE_SIZE: u64 = 50 * 1024 * 1024;

// # Example
// ```
// let router = router::build_router().unwrap();
//
// tauri::Builder::default()
//     .register_uri_scheme_protocol("local", move |_ctx, request| {
//         let router = router.clone();
//         router::route(&router, request).unwrap_or_else(|err| {
//             let body = format!("Internal Server Error: {}", err);
//             http::Response::builder()
//                 .status(500)
//                 .header("Content-Type", "text/plain")
//                 .header("Content-Length", body.len().to_string())
//                 .body(body.into_bytes())
//                 .unwrap()
//         })
//     })
// ```



pub fn build_router() -> ApiResult<Arc<Router<&'static str>>> {
    let mut router: Router<&str> = Router::new();

    router.insert("/file/{path}", "file")?;

    Ok(Arc::new(router))
}


pub fn route(router: &Router<&str>, req: Request<Vec<u8>>) -> ApiResult<Response<Vec<u8>>> {
    let path = req.uri().path();
    println!("path: {:?}", path);
    if let Ok(matched) = router.at(path) {
        println!("found");
        match (&req.method().as_str(), matched.value) {
            (&"GET", &"file") => file_get(&req, &matched.params),
            _ => Ok(Response::builder().status(405).body("Method Not Allowed".into())?),
        }
    } else {
        println!("not found");
        Ok(Response::builder().status(404).body("Not Found".into())?)
    }
}

fn file_get(req: &Request<Vec<u8>>, params: &Params) -> ApiResult<Response<Vec<u8>>> {
    let enc_path = params.get("path").ok_or(ApiError::Error(String::from("Path Not Found")))?;
    let dec_path = urlencoding::decode(enc_path)?;
    let path = std::path::Path::new(dec_path.as_ref());
    // let path = std::path::Path::new("C:/Users/kkt/Downloads/mp3/상상_선우정아.mp3");
    let mut file = match File::open(path) {
        Ok(f) => f,
        Err(_) => {
            return Ok(Response::builder()
                .status(404)
                .body("File not found".into())?);
        }
    };

    let file_len = match file.metadata() {
        Ok(m) => m.len(),
        Err(_) => 0,
    };


    if let Some(range_header) = req.headers().get(header::RANGE) {
        if let Ok(range_str) = range_header.to_str() {
            if let Some((start, end)) = parse_range(range_str, file_len) {
                let length = (end - start + 1) as usize;
                let mut buffer = vec![0u8; length];

                if file.seek(SeekFrom::Start(start)).is_ok() {
                    if file.read_exact(&mut buffer).is_ok() {
                        return Ok(Response::builder()
                            .status(206)
                            .header(header::CONTENT_RANGE,
                                    format!("bytes {}-{}/{}", start, end, file_len))
                            .header(header::CONTENT_LENGTH, buffer.len().to_string())
                            .header(header::ACCEPT_RANGES, "bytes")
                            .body(buffer)?);
                    }
                }
            }
        }
    }

    if file_len <= MAX_FILE_SIZE {
        let mut buffer = Vec::with_capacity(file_len as usize);
        file.read_to_end(&mut buffer).unwrap();
        Ok(Response::builder()
            .status(200)
            .header(header::CONTENT_LENGTH, buffer.len().to_string())
            .header(header::ACCEPT_RANGES, "bytes")
            .body(buffer)?)

    } else {
        Err(ApiError::Error(format!("Internal Server Error: FILE_SIZE {} (LIMIT {})", file_len, MAX_FILE_SIZE)))
    }

}

fn parse_range(range: &str, file_len: u64) -> Option<(u64, u64)> {
    if !range.starts_with("bytes=") {
        return None;
    }
    let range = &range[6..];
    let parts: Vec<&str> = range.split('-').collect();
    if parts.len() != 2 {
        return None;
    }

    let start = parts[0].parse::<u64>().ok();
    let end = parts[1].parse::<u64>().ok();

    match (start, end) {
        (Some(s), Some(e)) if s <= e && e < file_len => Some((s, e)),
        (Some(s), None) if s < file_len => Some((s, file_len - 1)),
        (None, Some(e)) if e < file_len => Some((file_len - e, file_len - 1)),
        _ => None,
    }
}
