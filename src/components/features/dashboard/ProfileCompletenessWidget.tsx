import { CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";


interface ProfileCompletenessWidgetProps {
    profile: any;
    onCompleteProfile: () => void;
}

export function ProfileCompletenessWidget({ profile, onCompleteProfile }: ProfileCompletenessWidgetProps) {
    if (!profile) return null;

    const checks = [
        { label: "Avatar", valid: !!profile.avatar_url, weight: 20 },
        { label: "Banner", valid: !!profile.banner_url, weight: 10 },
        { label: "Full Name", valid: !!profile.full_name, weight: 10 },
        { label: "Bio", valid: !!profile.bio && profile.bio.length > 10, weight: 20 },
        { label: "Skills", valid: !!profile.skills && profile.skills.length > 0, weight: 20 },
        { label: "Location", valid: !!profile.location, weight: 10 },
        { label: "Socials", valid: !!profile.social_links && Object.keys(profile.social_links).length > 0, weight: 10 },
    ];

    const completedWeight = checks.reduce((acc, curr) => acc + (curr.valid ? curr.weight : 0), 0);
    const isComplete = completedWeight === 100;

    if (isComplete) return null;

    return (
        <div className="bg-card rounded-3xl border border-border p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <CheckCircle2 className="w-24 h-24" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                        Complete Your Profile
                    </h3>
                    <span className="font-black text-2xl text-primary">{completedWeight}%</span>
                </div>

                <div className="w-full bg-muted rounded-full h-2 mb-6 overflow-hidden">
                    <div
                        className="bg-primary h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${completedWeight}%` }}
                    />
                </div>

                <div className="space-y-2 mb-6">
                    {checks.filter(c => !c.valid).slice(0, 3).map((check) => (
                        <div key={check.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            Add {check.label} (+{check.weight}%)
                        </div>
                    ))}
                    {checks.filter(c => !c.valid).length > 3 && (
                        <div className="text-xs text-muted-foreground pl-3.5">
                            + {checks.filter(c => !c.valid).length - 3} more items
                        </div>
                    )}
                </div>

                <button
                    onClick={onCompleteProfile}
                    className="w-full py-3 bg-foreground text-background rounded-xl font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                    Finish Setup <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
