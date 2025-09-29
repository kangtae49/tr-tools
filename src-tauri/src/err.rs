
#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("Err {0}")]
    ApiError(String),
    #[error(transparent)]
    Io(#[from] std::io::Error),
    #[error(transparent)]
    Utf8(#[from] std::str::Utf8Error),
    #[error(transparent)]
    FromUtf8Error(#[from] std::string::FromUtf8Error),
    #[error(transparent)]
    Matchit(#[from] matchit::InsertError),
    #[error(transparent)]
    Http(#[from] http::Error),
}

#[derive(serde::Serialize)]
#[serde(tag = "kind", content = "message")]
#[serde(rename_all = "camelCase")]
pub enum ErrorKind {
    ApiError(String),
    Io(String),
    Utf8(String),
    FromUtf8Error(String),
    Http(String),
    Matchit(String),
}

impl serde::Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        let error_message = self.to_string();
        let error_kind = match self {
            Self::ApiError(_) => ErrorKind::ApiError(error_message),
            Self::Io(_) => ErrorKind::Io(error_message),
            Self::Utf8(_) => ErrorKind::Utf8(error_message),
            Self::FromUtf8Error(_) => ErrorKind::FromUtf8Error(error_message),
            Self::Http(_) => ErrorKind::Http(error_message),
            Self::Matchit(_) => ErrorKind::Matchit(error_message),
        };
        error_kind.serialize(serializer)
    }
}



// impl From<http::Error> for ApiError {
//     fn from(e: http::Error) -> Self {
//         ApiError::Error(e.to_string())
//     }
// }

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

