import { NextResponse } from 'next/server';
import { resend } from '@/lib/resend';
import { WelcomeEmail } from '@/components/emails/WelcomeEmail';

export async function POST(request: Request) {
    try {
        const { email, username } = await request.json();

        const { data, error } = await resend.emails.send({
            from: 'PayLink <onboarding@resend.dev>', // Update this with your verified domain later
            to: [email],
            subject: 'Welcome to PayLink!',
            react: WelcomeEmail({ username }) as React.ReactElement,
        });

        if (error) {
            return NextResponse.json({ error }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}
