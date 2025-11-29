import { supabase } from '@/lib/supabase/client';
import { Order, OrderStatus, Service, ServiceTier, Transaction, SellerMetrics, ProfileStats } from '@/types/paylink';

// --- Services & Tiers ---

export async function createService(
    service: Omit<Service, 'id' | 'created_at' | 'updated_at' | 'tiers'>,
    tiers: Omit<ServiceTier, 'id' | 'service_id' | 'created_at'>[]
) {
    const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .insert(service)
        .select()
        .single();

    if (serviceError) throw serviceError;

    const tiersWithServiceId = tiers.map((tier) => ({
        ...tier,
        service_id: serviceData.id,
    }));

    const { error: tiersError } = await supabase.from('service_tiers').insert(tiersWithServiceId);

    if (tiersError) throw tiersError;

    return serviceData;
}

export async function getServiceDetails(serviceId: string) {
    const { data, error } = await supabase
        .from('services')
        .select('*, tiers:service_tiers(*)')
        .eq('id', serviceId)
        .single();

    if (error) throw error;
    return data as Service;
}

// --- Orders & State Machine ---

export async function createOrder(
    buyerId: string,
    sellerId: string,
    serviceId: string,
    tierId: string,
    price: number,
    requirements: string
) {
    // 1. Create Order (Incomplete by default or Active if requirements met? Assuming Active for now if reqs provided)
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
            buyer_id: buyerId,
            seller_id: sellerId,
            service_id: serviceId,
            tier_id: tierId,
            price,
            requirements,
            status: 'active', // Jumping to active for simplicity if requirements are present
        })
        .select()
        .single();

    if (orderError) throw orderError;

    // 2. Create Transaction (Escrow)
    const { error: txError } = await supabase.from('transactions').insert({
        order_id: order.id,
        amount: price,
        status: 'held',
    });

    if (txError) throw txError; // Should probably rollback order here in a real transaction

    return order;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
    const updates: Partial<Order> = { status, updated_at: new Date().toISOString() };

    if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId)
        .select()
        .single();

    if (error) throw error;

    // Handle Transaction Release on Completion
    if (status === 'completed') {
        await releaseFunds(orderId);
        await updateSellerMetrics(data.seller_id, 'completed');
    } else if (status === 'cancelled') {
        await refundFunds(orderId);
        await updateSellerMetrics(data.seller_id, 'cancelled');
    }

    return data;
}

// --- Transactions ---

async function releaseFunds(orderId: string) {
    await supabase
        .from('transactions')
        .update({ status: 'released', released_at: new Date().toISOString() })
        .eq('order_id', orderId);
}

async function refundFunds(orderId: string) {
    await supabase
        .from('transactions')
        .update({ status: 'refunded', released_at: new Date().toISOString() })
        .eq('order_id', orderId);
}

// --- Seller Metrics ---

async function updateSellerMetrics(sellerId: string, type: 'completed' | 'cancelled') {
    // This is a simplified increment. Ideally, we'd recalculate from scratch or use a database trigger.
    // Fetch current metrics
    const { data: current } = await supabase
        .from('seller_metrics')
        .select('*')
        .eq('seller_id', sellerId)
        .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: any = {
        total_orders: (current?.total_orders || 0) + 1,
        updated_at: new Date().toISOString(),
    };

    if (type === 'completed') {
        updates.completed_orders = (current?.completed_orders || 0) + 1;
    } else if (type === 'cancelled') {
        updates.cancelled_orders = (current?.cancelled_orders || 0) + 1;
    }

    // Recalculate on-time delivery (mock logic)
    // In a real app, we'd check the order deadline vs completion time.

    const { error } = await supabase
        .from('seller_metrics')
        .upsert({ seller_id: sellerId, ...updates });

    if (error) console.error('Failed to update seller metrics', error);
}

export async function getSellerMetrics(sellerId: string) {
    const { data, error } = await supabase
        .from('seller_metrics')
        .select('*')
        .eq('seller_id', sellerId)
        .single();

    if (error) return null;
    return data as SellerMetrics;
}

// --- Disputes ---

export async function raiseDispute(orderId: string, reason: string) {
    const { data, error } = await supabase
        .from('orders')
        .update({
            status: 'disputed',
            dispute_reason: reason,
            is_paused: true,
            updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function resolveDispute(orderId: string, outcome: 'continue' | 'cancel') {
    const status = outcome === 'continue' ? 'active' : 'cancelled';
    const { data, error } = await supabase
        .from('orders')
        .update({
            status,
            is_paused: false,
            updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .select()
        .single();

    if (error) throw error;

    if (status === 'cancelled') {
        await refundFunds(orderId);
    }

    return data;
}

// --- Follow Stats ---

export async function getProfileStats(targetUserId: string): Promise<ProfileStats> {
    const { data, error } = await supabase.rpc('get_profile_stats', { target_user_id: targetUserId });

    if (error) throw error;
    return data as ProfileStats;
}
