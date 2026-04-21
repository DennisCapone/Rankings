use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn process_data(input: &str) -> String {
    format!("Rust ha ricevuto: '{}'. Elaborazione completata!", input)
}