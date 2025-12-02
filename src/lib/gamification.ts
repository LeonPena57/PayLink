import { supabase } from "@/lib/supabase/client";

export async function checkAndPromoteUser(userId: string) {
    try {
        // 1. Get User Stats
        const { count: ordersCount } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('seller_id', userId)
            .eq('status', 'completed');

        const { data: reviews } = await supabase
            .from('reviews')
            .select('rating')
            .eq('reviewee_id', userId);

        const averageRating = reviews && reviews.length > 0
            ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
            : 0;

        // 2. Determine Level
        let newLevel = 'New Seller';
        if (ordersCount && ordersCount >= 50 && averageRating >= 4.9) {
            newLevel = 'Top Rated';
        } else if (ordersCount && ordersCount >= 20 && averageRating >= 4.7) {
            newLevel = 'Level 2';
        } else if (ordersCount && ordersCount >= 5 && averageRating >= 4.5) {
            newLevel = 'Level 1';
        }

        // 3. Get Current Level
        const { data: profile } = await supabase
            .from('profiles')
            .select('seller_level')
            .eq('id', userId)
            .single();

        if (profile && profile.seller_level !== newLevel) {
            // 4. Update Level
            await supabase
                .from('profiles')
                .update({ seller_level: newLevel })
                .eq('id', userId);

            // 5. Notify User
            await supabase.from('notifications').insert({
                user_id: userId,
                type: 'level_up',
                title: 'Congratulations! You Leveled Up!',
                message: `You are now a ${newLevel} seller. Keep up the great work!`,
                link: '/dashboard'
            });
        }

    } catch (error) {
        console.error("Error checking user level:", error);
    }
}
