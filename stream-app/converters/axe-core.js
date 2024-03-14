const STATUSES = {
    violations: 1,
    incomplete: 2,
    passes: 3
};

function convertAxeResultsToStream(axeResults) {
    let tagIdCounter = 1; 
    let codeSnippetIdCounter = 1;
    let ruleTagId; // ID for the 'Rule' tag

    const streamData = {
        messages: [],
        tags: [],
        codeSnippets: [],
        pages: [{ pageId: 1, pageUrl: axeResults.result.results.url }],
        statuses: [
            { statusId: STATUSES.violations, statusName: 'Violations' },
            { statusId: STATUSES.incomplete, statusName: 'Incomplete' },
            { statusId: STATUSES.passes, statusName: 'Passes' }
        ]
    };

    const ensureRuleTag = () => {
        if (!ruleTagId) {
            ruleTagId = tagIdCounter++;
            streamData.tags.push({ tagId: ruleTagId, tagName: 'Rule' });
        }
    };

    const formatRuleId = (id) => {
        return id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const processIssues = (issues, status) => {
        ensureRuleTag(); 

        issues.forEach((issue) => {
            const formattedRuleId = formatRuleId(issue.id);
            const messageText = `${formattedRuleId} Rule: ${issue.description}. ${issue.help}. More information: ${issue.helpUrl}`;
            
            // Get tag IDs, including 'Rule' tag
            const issueTagIds = issue.tags.map(tag => {
                let tagEntry = streamData.tags.find(t => t.tagName === tag);
                if (!tagEntry) {
                    tagEntry = { tagId: tagIdCounter++, tagName: tag };
                    streamData.tags.push(tagEntry);
                }
                return tagEntry.tagId;
            }).concat(ruleTagId);

            let existingMessage = streamData.messages.find(m => m.message === messageText && m.relatedStatusId === STATUSES[status]);

            issue.nodes.forEach(node => {
                const codeSnippetId = codeSnippetIdCounter++;
                streamData.codeSnippets.push({
                    codeSnippetId: codeSnippetId,
                    codeSnippet: node.html
                });

                if (existingMessage) {
                    // If the message exists, add new codeSnippetId to it
                    if (!existingMessage.relatedCodeSnippetIds.includes(codeSnippetId)) {
                        existingMessage.relatedCodeSnippetIds.push(codeSnippetId);
                    }
                } else {
                    // Create a new message entry
                    streamData.messages.push({
                        message: messageText,
                        relatedTagIds: issueTagIds,
                        relatedCodeSnippetIds: [codeSnippetId],
                        relatedPageIds: [1],
                        relatedStatusId: STATUSES[status]
                    });
                    // Update the existingMessage reference to the newly added message
                    existingMessage = streamData.messages[streamData.messages.length - 1];
                }
            });
        });
    };

    processIssues(axeResults.result.results.violations, 'violations');
    processIssues(axeResults.result.results.incomplete, 'incomplete');
    if (axeResults.result.results.passes) {
        processIssues(axeResults.result.results.passes, 'passes');
    }

    return streamData;
}

module.exports = convertAxeResultsToStream;
