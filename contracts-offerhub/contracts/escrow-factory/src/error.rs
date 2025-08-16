use soroban_sdk::{contracterror, panic_with_error, Env};

#[contracterror]
#[derive(Copy, Clone, Eq, PartialEq, Debug)]
pub enum Error {
    WasmKeyError = 1,
    StorageKeyError = 2,
    EscrowIdNotFoundError = 3,
    EscrowInfoNotSet = 4,
    InvalidAmountSet = 5,
    AddressesShouldNotMatch = 6,
    BatchSizeExceeded = 7,
}

pub fn handle_error(env: &Env, error: Error) -> ! {
    panic_with_error!(env, error);
}
