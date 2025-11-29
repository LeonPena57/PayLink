import { NextResponse } from "next/server";

export async function GET(request: Request) {
    // Just redirect back to settings. The settings page will re-fetch status.
    return NextResponse.redirect(new URL("/settings?tab=payments&status=returned", request.url));
}
