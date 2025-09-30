
use serde::{Serialize, Deserialize};
use specta::Type;
use thiserror::Error;

#[derive(Type, Serialize, Deserialize, Error, Debug)]
pub enum Error {
    #[error("Err {0}")]
    ApiError(String),
}


// impl From<http::Error> for Error {
//     fn from(e: http::Error) -> Self { Error::ApiError(e.to_string()) }
// }
macro_rules! impl_from_error {
    ($($t:ty),*) => {
        $(
            impl From<$t> for Error {
                fn from(e: $t) -> Self {
                    Error::ApiError(e.to_string())
                }
            }
        )*
    };
}
impl_from_error!(
    http::Error,
    std::io::Error,
    serde_json::Error,
    std::env::VarError,
    matchit::InsertError,
    std::string::FromUtf8Error
);

// impl From<matchit::InsertError> for ApiError {
//     fn from(e: matchit::InsertError) -> Self {
//         ApiError::Error(e.to_string())
//     }
// }
//
// impl From<std::string::FromUtf8Error> for ApiError {
//     fn from(e: std::string::FromUtf8Error) -> Self {
//         ApiError::Error(e.to_string())
//     }
// }
