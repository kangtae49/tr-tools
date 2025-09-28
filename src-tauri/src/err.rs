use thiserror::Error;

pub type ApiResult<T> = Result<T, ApiError>;

#[derive(Debug, Error)]
pub enum ApiError {
    #[error("Api error: {0}")]
    Error(String),
}

impl From<http::Error> for ApiError {
    fn from(e: http::Error) -> Self {
        ApiError::Error(e.to_string())
    }
}

impl From<matchit::InsertError> for ApiError {
    fn from(e: matchit::InsertError) -> Self {
        ApiError::Error(e.to_string())
    }
}

impl From<std::string::FromUtf8Error> for ApiError {
    fn from(e: std::string::FromUtf8Error) -> Self {
        ApiError::Error(e.to_string())
    }
}

