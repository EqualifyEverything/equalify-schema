function convertAxeResultsToStream(axeResults) {
    let tagIdCounter = 1;
    let codeSnippetIdCounter = 1;

    const streamData = {
        messages: [],
        tags: [],
        codeSnippets: [],
        pages: []
    };

    // Ensure the page URL is correctly extracted and assigned
    const pageUrl = axeResults.result.results.url;
    streamData.pages.push({ pageId: 1, pageUrl: pageUrl });

    // Combine the violations and incomplete issues for processing
    const issues = [...axeResults.result.results.violations, ...axeResults.result.results.incomplete];

    issues.forEach((issue) => {
        // Prepare message text including help and more information link
        const messageText = `${issue.description} Help: ${issue.help}. More information: ${issue.helpUrl}`;

        // Check if a message for this issue already exists
        let existingMessage = streamData.messages.find(m => m.message === messageText);
        if (!existingMessage) {
            // Prepare tags related to this issue
            const relatedTagIds = issue.tags.map(tag => {
                let tagEntry = streamData.tags.find(t => t.tagName === tag);
                if (!tagEntry) {
                    tagEntry = { tagId: tagIdCounter++, tagName: tag };
                    streamData.tags.push(tagEntry);
                }
                return tagEntry.tagId;
            });

            existingMessage = {
                message: messageText,
                relatedTagIds: relatedTagIds.map(String), // Convert tag IDs to strings as per schema
                relatedCodeSnippetIds: [], // This will be populated below
                relatedPageIds: [1] // Assuming single page context
            };
            streamData.messages.push(existingMessage);
        }

        // Process nodes related to the issue
        issue.nodes.forEach(node => {
            const codeSnippetId = codeSnippetIdCounter++;
            existingMessage.relatedCodeSnippetIds.push(codeSnippetId.toString()); // Update the existing message with new code snippet ID

            streamData.codeSnippets.push({
                codeSnippetId: codeSnippetId,
                codeSnippet: node.html
            });
        });
    });

    return streamData;
}

module.exports = convertAxeResultsToStream;