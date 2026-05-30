import { supabase } from './supabase.js';
import { signUpNewAuthUser } from './auth.js';

// ==========================================================================
// BOOKINGS APIS
// ==========================================================================

export async function fetchBookings() {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching bookings:", error.message);
        throw error;
    }
    return data;
}

export async function createBooking(booking) {
    if (!supabase) throw new Error("Supabase client not initialized.");
    const { data, error } = await supabase
        .from('bookings')
        .insert([booking])
        .select();

    if (error) {
        console.error("Error creating booking:", error.message);
        throw error;
    }
    return data[0];
}

export async function updateBookingStatus(id, newStatus) {
    if (!supabase) throw new Error("Supabase client not initialized.");
    const { data, error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', id)
        .select();

    if (error) {
        console.error("Error updating booking status:", error.message);
        throw error;
    }
    return data[0];
}

export async function rescheduleBooking(id, newDateTime) {
    if (!supabase) throw new Error("Supabase client not initialized.");
    const { data, error } = await supabase
        .from('bookings')
        .update({ date_time: newDateTime, status: 'Rescheduled' })
        .eq('id', id)
        .select();

    if (error) {
        console.error("Error rescheduling booking:", error.message);
        throw error;
    }
    return data[0];
}

// ==========================================================================
// STUDENTS APIS
// ==========================================================================

export async function fetchStudents() {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching students:", error.message);
        throw error;
    }
    return data;
}

export async function createStudentInquiry(student, desiredPassword) {
    if (!supabase) throw new Error("Supabase client not initialized.");
    
    // 1. Insert into profiles table
    const { data, error } = await supabase
        .from('students')
        .insert([student])
        .select();

    if (error) {
        console.error("Error inserting student profile:", error.message);
        throw error;
    }

    // 2. Create the credentials in Supabase Auth (disabled/pre-booked until verified)
    try {
        await signUpNewAuthUser(student.email, desiredPassword, student.student_id);
    } catch (authErr) {
        console.warn("Auth signup failed (might already exist):", authErr.message);
    }

    return data[0];
}

export async function verifyStudent(studentId) {
    if (!supabase) throw new Error("Supabase client not initialized.");
    
    // 1. Get student profile email first
    const { data: student, error: fetchErr } = await supabase
        .from('students')
        .select('name, email')
        .eq('student_id', studentId)
        .single();
        
    if (fetchErr) throw fetchErr;

    // 2. Update status in students table
    const { data, error } = await supabase
        .from('students')
        .update({ status: 'Confirmed' })
        .eq('student_id', studentId)
        .select();

    if (error) {
        console.error("Error verifying student:", error.message);
        throw error;
    }
    
    return data[0];
}

// ==========================================================================
// FEEDBACKS APIS (TESTIMONIALS)
// ==========================================================================

export async function fetchFeedbacks() {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('feedbacks')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching feedbacks:", error.message);
        throw error;
    }
    return data;
}

export async function submitFeedback(feedback) {
    if (!supabase) throw new Error("Supabase client not initialized.");
    const { data, error } = await supabase
        .from('feedbacks')
        .insert([feedback])
        .select();

    if (error) {
        console.error("Error submitting feedback:", error.message);
        throw error;
    }
    return data[0];
}

export async function deleteFeedback(id) {
    if (!supabase) throw new Error("Supabase client not initialized.");
    const { error } = await supabase
        .from('feedbacks')
        .delete()
        .eq('id', id);

    if (error) {
        console.error("Error deleting feedback:", error.message);
        throw error;
    }
    return true;
}

// ==========================================================================
// GALLERY & STORAGE APIS
// ==========================================================================

export async function fetchGallery() {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching gallery feed:", error.message);
        throw error;
    }
    return data;
}

/**
 * Upload image or video file to Supabase Storage bucket 'gallery-media'
 */
export async function uploadGalleryFile(file) {
    if (!supabase) throw new Error("Supabase client not initialized.");
    
    // Create a unique file name to avoid collision
    const fileExt = file.name.split('.').pop();
    const fileName = `GLP-${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    // Upload file
    const { data, error } = await supabase.storage
        .from('gallery-media')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        console.error("Storage upload error:", error.message);
        throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from('gallery-media')
        .getPublicUrl(filePath);

    return publicUrl;
}

export async function createGalleryPost(post) {
    if (!supabase) throw new Error("Supabase client not initialized.");
    const { data, error } = await supabase
        .from('gallery')
        .insert([post])
        .select();

    if (error) {
        console.error("Error publishing gallery post:", error.message);
        throw error;
    }
    return data[0];
}

export async function deleteGalleryPost(postId, mediaUrl) {
    if (!supabase) throw new Error("Supabase client not initialized.");
    
    // 1. Delete database record
    const { error: dbError } = await supabase
        .from('gallery')
        .delete()
        .eq('id', postId);

    if (dbError) throw dbError;

    // 2. Try to extract file path from URL and delete from storage
    try {
        const urlParts = mediaUrl.split('/gallery-media/');
        if (urlParts.length > 1) {
            const storagePath = decodeURIComponent(urlParts[1]);
            const { error: storageError } = await supabase.storage
                .from('gallery-media')
                .remove([storagePath]);
            if (storageError) console.warn("Failed to remove from storage bucket:", storageError.message);
        }
    } catch (e) {
        console.warn("Could not parse storage path for deletion:", e);
    }

    return true;
}
