import type { Candidate } from '@/types';

export const getStatusChartData = (candidates: Candidate[]) => {
    const counts = candidates.reduce((acc, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return [
        { name: 'Submitted', value: counts.submitted || 0 },
        { name: 'Interview Scheduled', value: counts.interview_scheduled || 0 },
        { name: 'Rejected', value: counts.rejected || 0 },
        { name: 'Approved', value: counts.approved || 0 },
    ].filter(item => item.value > 0);
};

export const getScoreDistributionData = (candidates: Candidate[]) => {
    const scoredCandidates = candidates.filter(c => c.score !== null && c.score !== undefined);
    const bins = {
        '0-20': 0,
        '21-40': 0,
        '41-60': 0,
        '61-80': 0,
        '81-100': 0,
    };

    scoredCandidates.forEach(c => {
        const score = c.score!;
        if (score >= 0 && score <= 20) bins['0-20']++;
        else if (score <= 40) bins['21-40']++;
        else if (score <= 60) bins['41-60']++;
        else if (score <= 80) bins['61-80']++;
        else if (score <= 100) bins['81-100']++;
    });

    return Object.entries(bins).map(([name, value]) => ({ name, count: value }));
};
