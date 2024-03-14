function convertAxeResultsToStream(axeResults) {
    let tagIdCounter = 1;
    let codeSnippetIdCounter = 1;

    const streamData = {
        messages: [],
        tags: [],
        codeSnippets: [],
        pages: [{ pageId: 1, pageUrl: axeResults.result.results.url }]
    };

    axeResults.result.results.violations.forEach((violation) => {
        // Ensure the impact level is treated as a tag.
        let impactTagId = streamData.tags.find(t => t.tagName === violation.impact)?.tagId;
        if (!impactTagId) {
            impactTagId = tagIdCounter;
            streamData.tags.push({ tagId: tagIdCounter++, tagName: violation.impact });
        }

        const relatedTagIds = violation.tags.map(tag => {
            let tagEntry = streamData.tags.find(t => t.tagName === tag);
            if (!tagEntry) {
                tagEntry = { tagId: tagIdCounter++, tagName: tag };
                streamData.tags.push(tagEntry);
            }
            return tagEntry.tagId;
        }).concat(impactTagId); // Include the impact tag.

        violation.nodes.forEach(node => {
            // Include help text and URL inline with the message
            const messageText = `${violation.description} Help: ${violation.help}. More information: ${violation.helpUrl}`;

            streamData.messages.push({
                message: messageText,
                relatedTagIds: relatedTagIds.map(String), // Ensure IDs are strings as per schema
                relatedCodeSnippetIds: [codeSnippetIdCounter.toString()],
                relatedPageIds: [1] // Assuming single page context for simplicity.
            });

            streamData.codeSnippets.push({
                codeSnippetId: codeSnippetIdCounter++,
                codeSnippet: node.html
            });
        });
    });

    return streamData;
}

module.exports = convertAxeResultsToStream;