// Supabase Client Wrapper
// Works both in Vite dev/build environments and direct browser opening

let supabaseUrl = "";
let supabaseKey = "";

// Check if Vite env variables are defined
try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
        supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    }
} catch (e) {
    // import.meta.env might throw in non-bundler browser environments
}

// Fallback to credentials provided directly (in case they run direct HTML)
if (!supabaseUrl || !supabaseKey) {
    supabaseUrl = "https://ktvechwkfiooqtmgckku.supabase.co";
    supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0dmVjaHdrZmlvb3F0bWdja2t1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxMDk0OTQsImV4cCI6MjA5NTY4NTQ5NH0.NBDh22k4sNFQuczxwLAmRkkeig-q-EEPao78EWPT1Jg";
}

// Fetch createClient from window.supabase (exposed by CDN)
const supabaseSDK = window.supabase;
if (!supabaseSDK) {
    console.error("Supabase SDK CDN not found! Ensure the CDN script is included in HTML.");
}

export const supabase = supabaseSDK ? supabaseSDK.createClient(supabaseUrl, supabaseKey) : null;
export default supabase;
