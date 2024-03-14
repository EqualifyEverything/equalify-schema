const STATUSES = {
    violations: 1,
    incomplete: 2,
    passes: 3 // Assuming you might also want to handle 'passes' similarly
};

function convertAxeResultsToStream(axeResults) {
    let tagIdCounter = 100; // Starting from 100 to differentiate from status IDs
    let codeSnippetIdCounter = 1;

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

    // Helper to process and categorize issues
    const processIssues = (issues, status) => {
        issues.forEach((issue) => {
            issue.nodes.forEach(node => {
                const messageText = `${issue.description} Help: ${issue.help}. More information: ${issue.helpUrl}`;
                const codeSnippetId = codeSnippetIdCounter++;
                
                // Check for an existing tag for this issue, otherwise create a new one
                const issueTagIds = issue.tags.map(tag => {
                    let tagEntry = streamData.tags.find(t => t.tagName === tag);
                    if (!tagEntry) {
                        tagEntry = { tagId: tagIdCounter++, tagName: tag };
                        streamData.tags.push(tagEntry);
                    }
                    return tagEntry.tagId;
                });

                streamData.codeSnippets.push({
                    codeSnippetId: codeSnippetId,
                    codeSnippet: node.html
                });

                // Find or create a new message entry ensuring integers for IDs
                let existingMessage = streamData.messages.find(m => m.message === messageText && m.relatedStatusId === STATUSES[status]);
                if (existingMessage) {
                    existingMessage.relatedCodeSnippetIds.push(codeSnippetId); // Use integer ID directly
                } else {
                    streamData.messages.push({
                        message: messageText,
                        relatedTagIds: issueTagIds, // Use integer IDs directly
                        relatedCodeSnippetIds: [codeSnippetId], // Use integer ID directly
                        relatedPageIds: [1],
                        relatedStatusId: STATUSES[status]
                    });
                }
            });
        });
    };

    // Process each category of results with its respective status
    processIssues(axeResults.result.results.violations, 'violations');
    processIssues(axeResults.result.results.incomplete, 'incomplete');
    if(axeResults.result.results.passes) {
        processIssues(axeResults.result.results.passes, 'passes'); // If you're handling passes
    }

    return streamData;
}

module.exports = convertAxeResultsToStream;
