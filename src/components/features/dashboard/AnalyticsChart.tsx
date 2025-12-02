import clsx from "clsx";

interface AnalyticsChartProps {
    data: { date: string; amount: number }[];
    title: string;
}

export function AnalyticsChart({ data, title }: AnalyticsChartProps) {
    const maxAmount = Math.max(...data.map(d => d.amount), 1); // Avoid division by zero

    return (
        <div className="bg-card p-6 rounded-3xl border border-border shadow-sm h-full flex flex-col">
            <h3 className="font-bold text-lg mb-6">{title}</h3>

            <div className="flex-1 flex items-end gap-2 min-h-[200px]">
                {data.map((item, index) => {
                    const heightPercentage = (item.amount / maxAmount) * 100;
                    return (
                        <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                            <div className="relative w-full flex items-end justify-center h-full">
                                <div
                                    className="w-full bg-primary/20 rounded-t-lg group-hover:bg-primary/40 transition-all relative"
                                    style={{ height: `${heightPercentage}%` }}
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                        ${item.amount}
                                    </div>
                                </div>
                            </div>
                            <div className="text-[10px] text-muted-foreground font-medium truncate w-full text-center">
                                {new Date(item.date).getDate()}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
