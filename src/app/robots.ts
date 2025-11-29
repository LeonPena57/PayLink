import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/dashboard/', '/settings/', '/messages/'],
        },
        sitemap: 'https://paylink.com/sitemap.xml',
    };
}
