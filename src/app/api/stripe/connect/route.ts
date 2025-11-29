import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
    try {
        if (!process.env.STRIPE_SECRET_KEY) {
            return NextResponse.json(
                { error: "Stripe Secret Key is missing" },
                { status: 500 }
            );
        }

        // Get the user from the session
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

        // Check if user already has a stripe account
        const { data: profile } = await supabase
            .from("profiles")
            .select("stripe_account_id")
            .eq("id", user.id)
            .single();

        let accountId = profile?.stripe_account_id;

        if (!accountId) {
            // Create a new Stripe Express account
            const account = await stripe.accounts.create({
                type: "express",
                country: "US", // Default to US for now
                email: user.email,
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
            });
            accountId = account.id;

            // Save to profile
            const { error: updateError } = await supabase
                .from("profiles")
                .update({ stripe_account_id: accountId })
                .eq("id", user.id);

            if (updateError) {
                console.error("Error updating profile with stripe_account_id:", updateError);
                // Fallback: If we can't save the ID, we shouldn't proceed with the link
                // because we'll lose the reference.
                // Try using service role if available?
                // For now, return error.
                return NextResponse.json({ error: "Failed to save Stripe account ID" }, { status: 500 });
            }
        }

        // Create an account link
        const origin = request.headers.get("origin") || "http://localhost:3000";
        const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: `${origin}/settings?tab=payments&status=refresh`,
            return_url: `${origin}/api/stripe/callback?account_id=${accountId}`,
            type: "account_onboarding",
        });

        return NextResponse.json({ url: accountLink.url });
    } catch (error) {
        console.error("Stripe Connect Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
