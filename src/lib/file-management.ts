import { supabase } from '@/lib/supabase/client';
import { OrderFile } from '@/types/paylink';

// --- File Management (The "Google Drive" Side) ---

export async function uploadOrderFile(
    orderId: string,
    file: File,
    uploaderId: string
) {
    // 1. Check for existing file with same name to handle versioning
    const { data: existingFiles } = await supabase
        .from('order_files')
        .select('version')
        .eq('order_id', orderId)
        .eq('file_name', file.name)
        .order('version', { ascending: false })
        .limit(1);

    const nextVersion = existingFiles && existingFiles.length > 0 ? existingFiles[0].version + 1 : 1;

    // 2. Upload to Storage (Bucket: 'order-files' - assumed to exist or we use a general one)
    // We'll use a path like: {orderId}/{version}_{fileName}
    const filePath = `${orderId}/v${nextVersion}_${file.name}`;

    // Note: 'order-files' bucket needs to be created in Supabase if not exists, 
    // or we can use a generic 'files' bucket. Assuming 'order-files' for now based on plan.
    const { error: uploadError } = await supabase.storage
        .from('order-files')
        .upload(filePath, file);

    if (uploadError) throw uploadError;

    const publicUrl = supabase.storage.from('order-files').getPublicUrl(filePath).data.publicUrl;

    // 3. Update previous versions to not be latest
    if (nextVersion > 1) {
        await supabase
            .from('order_files')
            .update({ is_latest: false })
            .eq('order_id', orderId)
            .eq('file_name', file.name);
    }

    // 4. Insert Metadata
    const { data: fileRecord, error: dbError } = await supabase
        .from('order_files')
        .insert({
            order_id: orderId,
            uploader_id: uploaderId,
            file_name: file.name,
            file_url: publicUrl,
            file_size: file.size,
            version: nextVersion,
            is_latest: true,
        })
        .select()
        .single();

    if (dbError) throw dbError;

    return fileRecord;
}

export async function getOrderFiles(orderId: string) {
    const { data, error } = await supabase
        .from('order_files')
        .select('*')
        .eq('order_id', orderId)
        .eq('is_latest', true) // Only show latest by default
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as OrderFile[];
}

export async function getFileHistory(orderId: string, fileName: string) {
    const { data, error } = await supabase
        .from('order_files')
        .select('*')
        .eq('order_id', orderId)
        .eq('file_name', fileName)
        .order('version', { ascending: false });

    if (error) throw error;
    return data as OrderFile[];
}

// --- The Vault ---

export async function getVaultFiles(buyerId: string) {
    // Fetch all files from all completed orders for this buyer
    // This requires a join or a complex query.

    const { data, error } = await supabase
        .from('order_files')
        .select(`
      *,
      orders!inner (
        id,
        status,
        buyer_id
      )
    `)
        .eq('orders.buyer_id', buyerId)
        .eq('orders.status', 'completed')
        .eq('is_latest', true)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}
