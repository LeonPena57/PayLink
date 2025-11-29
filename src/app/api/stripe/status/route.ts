import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
    try {
        if (!process.env.STRIPE_SECRET_KEY) {
            return NextResponse.json({ connected: false, error: "Missing key" });
        }

        const authHeader = request.headers.get("Authorization");
        if (!authHeader) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const token = authHeader.replace("Bearer ", "");
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("stripe_account_id, stripe_connected")
            .eq("id", user.id)
            .single();

        if (!profile?.stripe_account_id) {
            return NextResponse.json({ connected: false });
        }

        const account = await stripe.accounts.retrieve(profile.stripe_account_id);
        const isConnected = account.details_submitted && account.charges_enabled;

        if (isConnected !== profile.stripe_connected) {
            // Update status in DB
            await supabase
                .from("profiles")
                .update({ stripe_connected: isConnected })
                .eq("id", user.id);
        }

        return NextResponse.json({ connected: isConnected });
    } catch (error) {
        console.error("Stripe Status Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
