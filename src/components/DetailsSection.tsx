
type DetailsSectionProps = {
    children: React.ReactNode;
};

export function DetailsSection({ children }: DetailsSectionProps) {
    return (
        <section>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-6">
                {children}
            </div>
        </section>
    );
}

type DetailItemProps = {
    label: string;
    value: string | number | null | undefined;
};

export function DetailItem({ label, value }: DetailItemProps) {
    if (!value || value === 'N/A') return null;

    return (
        <div className="text-shadow">
            <p className="text-sm font-semibold text-foreground/80">{label}</p>
            <p className="text-base font-bold text-white">{value}</p>
        </div>
    );
}
