import * as React from 'react';

interface WelcomeEmailProps {
    username: string;
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({ username }) => (
    <div style={{ fontFamily: 'sans-serif', color: '#333' }}>
        <h1>Welcome to PayLink, {username}!</h1>
        <p>We're excited to have you on board. PayLink is the best place to manage your creative business.</p>
        <p>Here are a few things you can do to get started:</p>
        <ul>
            <li>Complete your profile</li>
            <li>Create your first service</li>
            <li>Upload your portfolio</li>
        </ul>
        <p>
            <a href="https://paylink.com/home" style={{ display: 'inline-block', padding: '10px 20px', backgroundColor: '#000', color: '#fff', textDecoration: 'none', borderRadius: '5px' }}>
                Go to Dashboard
            </a>
        </p>
    </div>
);
