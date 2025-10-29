
import { DetailsSection, DetailItem } from './DetailsSection';
import { formatCurrency } from '@/lib/utils';

type MediaDetailsProps = {
    status: string;
    budget?: number;
    revenue?: number;
};

export function MediaDetails({ status, budget, revenue }: MediaDetailsProps) {
    const hasNumericDetails = budget || revenue;

    return (
        <DetailsSection>
            <DetailItem label="Status" value={status} />
            {budget ? <DetailItem label="Budget" value={formatCurrency(budget)} /> : null}
            {revenue ? <DetailItem label="Revenue" value={formatCurrency(revenue)} /> : null}
        </DetailsSection>
    );
}
