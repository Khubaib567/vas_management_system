use webauthn_rs::prelude::*;
use std::convert::TryFrom;

fn verify_user_passkey() -> Result<(), String> {
    // 1. RECONSTRUCT THE ORIGINAL CHALLENGE SESSION
    // In production, this matches the unique token you generated right before triggering the prompt.
    const EXPECTED_CHALLENGE: &str = "your-unique-one-time-challenge-string";
    
    let expected_challenge = Challenge::try_from(EXPECTED_CHALLENGE.as_bytes())
        .map_err(|_| "Failed to format expected challenge")?;

    // 2. RETRIEVE RECOVERY DETAILS FROM PREVIOUS REGISTRATION 
    // This public key was generated the very first time the user registered their passkey.
    let stored_credential_id = vec![/* Binary Credential ID bytes */];
    let stored_public_key = vec![/* Binary COSE/Raw Public Key bytes */];
    let stored_counter = 0u32; // Tracks logins to protect against cloned keys

    // 3. CAPTURE DYNAMIC CREDENTIAL DATA FROM WINDOWS API RESULT
    // These base64 fields are generated on-the-fly inside webauthn.dll after a valid biometric scan.
    let dynamic_client_data_json = "{\"type\":\"webauthn.get\",\"challenge\":\"...\",\"origin\":\"http://localhost\"}";
    let dynamic_authenticator_data = vec![/* Binary network bytes from Windows */];
    let dynamic_signature = vec![/* Cryptographic asymmetric signature bytes from hardware */];

    // 4. PARSE LOGS INTO STANDARD WEBAUTHN FORMAT
    let raw_assertion = AuthenticatorAssertionResponseRaw {
        client_data_json: Base64UrlSafeData::from(dynamic_client_data_json.as_bytes().to_vec()),
        authenticator_data: Base64UrlSafeData::from(dynamic_authenticator_data),
        signature: Base64UrlSafeData::from(dynamic_signature),
        user_handle: None,
    };

    // 5. RUN CRYPTOGRAPHIC VALIDATION CHECKS
    // The library decodes the JSON, takes the public key, and verifies the dynamic signature
    match raw_assertion.verify(
        &expected_challenge,
        "localhost",                  // Target Relying Party ID
        &stored_credential_id,
        &stored_public_key,
        stored_counter,
        false,                         // user_present check
    ) {
        Ok(new_counter) => {
            println!("Verification Successful! Passkey matches public key record.");
            println!("Next expected counter value: {}", new_counter);
            Ok(())
        }
        Err(err) => {
            Err(format!("Cryptographic signature mismatch! Error: {:?}", err))
        }
    }
}

fn main() {
    match verify_user_passkey() {
        Ok(_) => println!("User Authenticated! Security verification passed."),
        Err(e) => println!("Access Denied: {}", e),
    }
}
