import { supabase } from './supabase.js';

/**
 * Subscribe to new bookings and student inquiries in realtime.
 * Triggers callback functions when new rows are inserted in Supabase.
 */
export function subscribeToRealtimeAlerts(onNewBooking, onNewStudent) {
    if (!supabase) {
        console.warn("Supabase client not initialized, realtime subscription bypassed.");
        return null;
    }

    const channel = supabase
        .channel('realtime-staff-alerts')
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'bookings'
            },
            (payload) => {
                console.log("Realtime: New booking received!", payload.new);
                if (onNewBooking) onNewBooking(payload.new);
            }
        )
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'students'
            },
            (payload) => {
                console.log("Realtime: New student registration!", payload.new);
                if (onNewStudent) onNewStudent(payload.new);
            }
        )
        .subscribe((status) => {
            console.log("Supabase Realtime Connection Status:", status);
        });

    return channel;
}

/**
 * Unsubscribe a given channel
 */
export async function unsubscribeFromRealtime(channel) {
    if (!supabase || !channel) return;
    await supabase.removeChannel(channel);
}
