export const FORBIDDEN_KEYWORDS = [
    "email",
    "phone",
    "whatsapp",
    "telegram",
    "pay outside",
    "venmo",
    "paypal",
    "cashapp",
    "skype",
    "zoom",
    "meet",
    "contact me directly"
];

export function containsForbiddenKeywords(text: string): { found: boolean; keyword?: string } {
    const lowerText = text.toLowerCase();
    for (const keyword of FORBIDDEN_KEYWORDS) {
        if (lowerText.includes(keyword)) {
            return { found: true, keyword };
        }
    }
    return { found: false };
}
