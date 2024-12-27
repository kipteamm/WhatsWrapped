// Retrieve the Base64-encoded data from the query parameter
const urlParams = new URLSearchParams(window.location.search);
const base64Encoded = urlParams.get('d');

// Step 1: Ensure the Base64 string is URL-safe (reverse the encoding)
let base64Decoded = base64Encoded.replace(/-/g, '+').replace(/_/g, '/');

// Step 2: Decode the Base64 string back to a byte array
const decodedString = atob(base64Decoded);

// Step 3: Convert the decoded string back to a UTF-8 byte array
const utf8BytesDecoded = new Uint8Array(decodedString.split('').map(c => c.charCodeAt(0)));

// Step 4: Use TextDecoder to decode the byte array back into a UTF-8 string
const decoder = new TextDecoder();
const decodedDataString = decoder.decode(utf8BytesDecoded);

// Step 5: Parse the decoded string into a JavaScript object
const dataObject = JSON.parse(decodedDataString);

// Now you can work with your original object
console.log(dataObject);
