use std::fs;
use std::path::Path;
use crate::err::Error;
use std::env;

const APP_NAME: &str = "tr-tools";

pub fn read_to_string<P: AsRef<Path>>(fullpath: P) -> Result<String, Error> {
    Ok(fs::read_to_string(fullpath)?)
}

pub fn write_to_string<P: AsRef<Path>>(fullpath: P, content: &str) -> Result<(), Error> {
    if let Some(parent) = fullpath.as_ref().parent() {
        if !parent.exists() {
            fs::create_dir_all(parent)?;
        }
    }
    fs::write(fullpath, content)?;
    Ok(())
}

pub fn app_read_to_string<P: AsRef<Path>>(subpath: P) -> Result<String, Error> {
    let basepath = env::var("LOCALAPPDATA")?;
    let fullpath = Path::new(&basepath).join(APP_NAME).join(&subpath);
    read_to_string(&fullpath)
}

pub fn app_write_to_string<P: AsRef<Path>>(subpath: P, content: &str) -> Result<(), Error> {
    let basepath = env::var("LOCALAPPDATA")?;
    let fullpath = Path::new(&basepath).join(APP_NAME).join(&subpath);
    write_to_string(&fullpath, content)
}
