import { supabase } from './supabase.js';

/**
 * Staff Login using Supabase Auth
 */
export async function loginStaff(email, password) {
    if (!supabase) throw new Error("Supabase client not initialized.");
    
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) throw error;

    // Check if the user has staff role in metadata (we can set this or default to staff)
    const user = data.user;
    const isStaff = user.user_metadata?.role === 'staff' || email.endsWith('@trendytouch.com');
    if (!isStaff) {
        // Sign out if not staff
        await supabase.auth.signOut();
        throw new Error("Access denied. Not a staff member.");
    }

    return user;
}

/**
 * Student Login using Username (student_id) and Password
 * We look up the email in the students table first, then authenticate using Supabase Auth
 */
export async function loginStudent(studentId, password) {
    if (!supabase) throw new Error("Supabase client not initialized.");

    // 1. Look up student profile by student_id to get their email
    const { data: student, error: fetchError } = await supabase
        .from('students')
        .select('*')
        .eq('student_id', studentId.trim().toLowerCase())
        .single();

    if (fetchError || !student) {
        throw new Error("Student ID not found.");
    }

    // 2. Enforce physical verification check
    if (student.status !== 'Confirmed') {
        throw new Error("Pre-Booked: Please visit the studio for physical verification to enable portal access.");
    }

    // 3. Authenticate with Supabase Auth using email and password
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: student.email,
        password: password
    });

    if (authError) {
        // Fallback: If auth fails, try to sign up if it's the first time they are logging in
        // (This helps migrate legacy/seeded students easily)
        if (authError.message.includes("Invalid login credentials")) {
            try {
                const signUpResult = await signUpNewAuthUser(student.email, password, studentId);
                return signUpResult.user;
            } catch (signupErr) {
                throw new Error("Invalid username or password.");
            }
        }
        throw authError;
    }

    return authData.user;
}

/**
 * Register a new student in Supabase Auth
 */
export async function signUpNewAuthUser(email, password, studentId) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                role: 'student',
                student_id: studentId
            }
        }
    });
    if (error) throw error;
    return data;
}

/**
 * Sign out current session
 */
export async function logoutUser() {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Error signing out:", error.message);
}

/**
 * Get active session user
 */
export async function getSessionUser() {
    if (!supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

/**
 * Get student details for logged-in user
 */
export async function getLoggedStudentProfile(email) {
    if (!supabase) return null;
    const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('email', email)
        .single();
    
    if (error) {
        console.error("Error fetching student profile:", error);
        return null;
    }
    return data;
}
