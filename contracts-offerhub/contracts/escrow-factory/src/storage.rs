// use soroban_sdk::{Address, BytesN, ConversionError, Env, IntoVal, TryFromVal, Val};
use soroban_sdk::{contracttype, Address, BytesN, Env};

/// Keys for contract storage.
#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub enum DataKey {
    /// WASM/code hash or reference for the escrow implementation.
    EscrowWasm,
    /// Monotonic counter for assigning new escrow IDs.
    NextEscrowId,
    /// id -> escrow contract address
    EscrowById(u32),
    /// escrow contract address -> id
    EscrowIdByAddr(Address),
    /// ArchivedEscrows
    Archives(u32),
}

/// Read next ID (defaults to 0 if unset).
pub fn next_escrow_id(e: &Env) -> u32 {
    e.storage()
        .instance()
        .get::<DataKey, u32>(&DataKey::NextEscrowId)
        .unwrap_or(0)
}

/// Lookup escrow address by numeric ID.
pub fn escrow_addr_by_id(e: &Env, id: u32) -> Option<Address> {
    e.storage()
        .instance()
        .get::<DataKey, Address>(&DataKey::EscrowById(id))
}

/// Lookup escrow ID by contract address.
pub fn escrow_id_by_addr(e: &Env, addr: &Address) -> Option<u32> {
    e.storage()
        .instance()
        .get::<DataKey, u32>(&DataKey::EscrowIdByAddr(addr.clone()))
}

/// Get Escrow Wasm
pub fn get_escrow_wasm(e: &Env) -> Option<BytesN<32>> {
    e.storage()
        .instance()
        .get::<DataKey, BytesN<32>>(&DataKey::EscrowWasm)
}
/// Set next ID.
pub fn set_next_escrow_id(e: &Env, next: u32) {
    e.storage()
        .instance()
        .set::<DataKey, u32>(&DataKey::NextEscrowId, &next);
}

/// Save both forward and reverse indices for a newly created escrow.
pub fn store_escrow(e: &Env, id: &u32, addr: &Address) {
    let s = e.storage().instance();
    s.set::<DataKey, Address>(&DataKey::EscrowById(id.clone()), addr);
    s.set::<DataKey, u32>(&DataKey::EscrowIdByAddr(addr.clone()), id);
}

/// Stores Escrow Implementation hash
pub fn store_escrow_wasm(e: &Env, wasm_hash: BytesN<32>) {
    e.storage()
        .instance()
        .set::<DataKey, BytesN<32>>(&DataKey::EscrowWasm, &wasm_hash);
}

/// Archives escrow indices
pub fn archive_escrow(e: &Env, id: u32, addr: Address) {
    let s = e.storage().instance();
    s.set::<DataKey, Address>(&DataKey::Archives(id), &addr);
}

pub fn is_archived(e: &Env, id: u32) -> bool {
    e.storage()
        .instance()
        .get::<DataKey, Address>(&DataKey::Archives(id))
        .is_some()
}
