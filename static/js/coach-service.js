// static/js/coach-service.js

const normalizeValue = (val) => {
    if (val === undefined || val === null || val === "") return undefined;
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
        const cleaned = val.replace(/%/g, '').trim();
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? undefined : parsed;
    }
    return undefined;
};

const formatReviewMarkdown = (dealerName, userName, kpis, debugInfo) => {
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const shortDateStr = today.toLocaleDateString('en-US');
    const timestamp = today.toLocaleString('en-US');

    let markdown = `### ${dealerName} – Service Department Performance Review\n\n`;
    markdown += `* **Customer Engagement Manager:** ${userName}\n`;
    markdown += `* **Date:** ${dateStr}\n`;
    markdown += `* 📊 Data reflects Vitally metrics pulled as of ${shortDateStr}.\n\n`;

    markdown += `---\n\n`;
    markdown += `#### Section 0 – KPI Summary\n\n`;

    const getVal = (val, isPercent = false) => {
        if (val === undefined || val === null) return "No data returned";
        return isPercent ? `${val}%` : val;
    };

    const getInsight = (val, benchmark, label) => {
        if (val === undefined || val === null) return "—";
        return val >= benchmark ? `✅ Strong ${label}` : `⚠️ Opportunity for ${label}`;
    };

    markdown += `| Metric | Value | Performance Insight |\n`;
    markdown += `| :--- | :--- | :--- |\n`;
    markdown += `| Active Conversations | **${getVal(kpis?.ActiveConversation)}** | ${getInsight(kpis?.ActiveConversation, 50, "Engagement")} |\n`;
    markdown += `| Total MPIs (Sent/MTD) | **${getVal(kpis?.TotalMPISent)}** | ${getInsight(kpis?.TotalMPISent, 80, "Volume")} |\n`;
    markdown += `| Tech Video Adoption | **${getVal(kpis?.ClosedROsWithTechVideoMade_Percent, true)}** | ${getInsight(kpis?.ClosedROsWithTechVideoMade_Percent, 70, "Adoption")} |\n`;
    markdown += `| Inspections Completed | **${getVal(kpis?.InspectionsComnpletedSentToCustomer_Percent, true)}** | ${getInsight(kpis?.InspectionsComnpletedSentToCustomer_Percent, 80, "Transparency")} |\n\n`;

    if (!kpis || (kpis.ActiveConversation === undefined && kpis.TotalMPISent === undefined && kpis.ClosedROsWithTechVideoMade_Percent === undefined)) {
        markdown += `* *Note: KPI mapping mismatch detected for this store's configuration.*\n\n`;
        if (debugInfo) {
            markdown += `> [!NOTE]\n`;
            markdown += `> **Diagnostic Metadata (Debug Only):**\n`;
            markdown += `> ${debugInfo}\n\n`;
        }
    }

    markdown += `---\n\n`;

    markdown += `#### 1. Positives\n\n`;
    if (kpis && kpis.InspectionsComnpletedSentToCustomer_Percent && kpis.InspectionsComnpletedSentToCustomer_Percent > 80) {
        markdown += `* **High Transparency**: Technical inspection delivery is exceptional, building strong customer trust.\n`;
    } else {
        markdown += `* **Leadership Commitment**: The team shows consistent effort in processing repair orders through the digital platform.\n`;
    }
    markdown += `* **Operational Foundation**: Core workflows are established and being utilized daily.\n\n`;

    markdown += `#### 2. Areas to Improve\n\n`;
    if (kpis && kpis.ActiveConversation && kpis.ActiveConversation < 50) {
        markdown += `* **Proactive Messaging**: Current active threads suggest advisors may be reactive. Implementation of "Mid-Repair" status updates is recommended.\n`;
    }
    markdown += `* **Video Quality & Consistency**: Ensure every RO includes a high-quality video to drive approval rates.\n\n`;

    markdown += `#### 3. Prioritized Next Steps (30/60/90-Day Plan)\n\n`;
    markdown += `| Timeframe | Focus Area | Action Owner | KPI Target |\n`;
    markdown += `| :--- | :--- | :--- | :--- |\n`;
    markdown += `| 30 Days | Advisor Texting Habits | Service Manager | 75+ Active Threads |\n`;
    markdown += `| 60 Days | 100% MPI Compliance | Shop Foreman | 400+ MPIs Sent |\n`;
    markdown += `| 90 Days | Video Quality Review | Service Leads | 80% Video Adoption |\n\n`;

    markdown += `#### 4. Word Track (Coaching Script)\n\n`;
    markdown += `> "Team, I want to recognize the incredible work on our inspection transparency. Our customers are seeing the value of our work more than ever before.\n\n`;
    markdown += `> However, we have a major opportunity to take this trust to the next level by over-communicating. If we can bump our texting engagement up and make those status updates proactive, we'll see approval times drop and scores rise.\n\n`;
    markdown += `> My goal is for every customer to feel uniquely informed throughout their visit. Let's aim for at least two status updates per RO starting today."\n\n`;

    markdown += `#### 5. Executive Summary\n\n`;
    markdown += `* **Top Strengths**: Inspection Delivery & Digital Trust.\n`;
    markdown += `* **Key Opportunities**: Proactive Advisor Engagement & Video Volume.\n`;
    markdown += `* **Strategic Recommendation**: Standardize a texting cadence for all service advisors.\n`;
    markdown += `* **Overall Rating**: ${kpis ? "🟢 Strong Performing" : "🟡 Reviewing Metrics"}\n\n`;

    markdown += `---\n\n`;
    markdown += `*Data reflects Vitally metrics pulled as of ${timestamp}.*`;

    return markdown;
};

// Global CoachService
window.CoachService = {
    generateReview: async (vitallyUuid, dealerName, userName) => {
        try {
            const url = `/api/vitally/accounts/${vitallyUuid}`;
            const response = await fetch(url, { headers: { 'Accept': 'application/json' } });

            if (response.status === 401) {
                return `### Error: Unauthorized\n\nThe server's Vitally API Token is invalid. Please check settings.`;
            }
            if (response.status === 404) {
                return `### Error: Dealership Not Found\n\nNo Vitally account matches UUID: \`${vitallyUuid}\` for **${dealerName}**.`;
            }
            if (!response.ok) {
                throw new Error(`Proxy error: ${response.status}`);
            }

            const data = await response.json();
            const source = data.traits || data.customFields || data;

            let debugInfo = "";
            const keys = Object.keys(source).filter(k => k.length < 60);
            debugInfo = `Available fields: ${keys.slice(0, 30).join(', ')}...`;

            const kpis = {
                ActiveConversation: normalizeValue(
                    source['Active Conversation %'] || source['vitally.custom.activeConversation'] || source['bigquery.ActiveConversation']
                ),
                TotalMPISent: normalizeValue(
                    source['MPI Sent %'] || source['MPI Sent % '] || source['vitally.custom.mpiMade30Day'] || source['Total MPIs Sent']
                ),
                ClosedROsWithTechVideoMade_Percent: normalizeValue(
                    source['Closed ROs TV Made %'] || source['vitally.custom.techVideoMade30Day'] || source['Closed ROs w/ Tech Video (%)']
                ),
                InspectionsComnpletedSentToCustomer_Percent: normalizeValue(
                    source['% of ROs w MPI Completed'] || source['MPI Completed to Made %'] || source['vitally.custom.mpiMade30Day'] || source['Inspections Completed (%)']
                )
            };

            return formatReviewMarkdown(data.name || dealerName, userName, kpis, debugInfo);

        } catch (error) {
            console.error("CoachService Proxy Error:", error);
            return formatReviewMarkdown(dealerName, userName, null, `Technical error: ${error.message}`);
        }
    }
};
