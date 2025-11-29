import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    // Create the redirect URL pointing to dashboard
    const redirectUrl = new URL('/dashboard', request.url);

    // Copy all search params (code, error, error_description, etc.)
    requestUrl.searchParams.forEach((value, key) => {
        redirectUrl.searchParams.set(key, value);
    });

    return NextResponse.redirect(redirectUrl);
}
