const STATUSES = {
    violations: 1,
    incomplete: 2,
    passes: 3
};

function convertAxeResultsToStream(axeResults) {
    let tagIdCounter = 1;
    let codeSnippetIdCounter = 1;
    let ruleTagId, messageTagId;

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

    const ensureTags = () => {
        if (!ruleTagId) {
            ruleTagId = tagIdCounter++;
            streamData.tags.push({ tagId: ruleTagId, tagName: 'axe-core Rule' });
        }
        if (!messageTagId) {
            messageTagId = tagIdCounter++;
            streamData.tags.push({ tagId: messageTagId, tagName: 'axe-core Message' });
        }
    };

    const formatRuleId = (id) => id.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    const getOrCreateTagId = (tagName) => {
        let tagEntry = streamData.tags.find(t => t.tagName === tagName);
        if (!tagEntry) {
            tagEntry = { tagId: tagIdCounter++, tagName: tagName };
            streamData.tags.push(tagEntry);
        }
        return tagEntry.tagId;
    };

    const addMessage = (messageText, codeSnippetId, status, isRule, additionalTags = []) => {
        const tagIds = additionalTags.map(getOrCreateTagId);
        tagIds.push(isRule ? ruleTagId : messageTagId);

        let existingMessage = streamData.messages.find(m => m.message === messageText && m.relatedStatusId === STATUSES[status]);
        if (existingMessage) {
            if (!existingMessage.relatedCodeSnippetIds.includes(codeSnippetId)) {
                existingMessage.relatedCodeSnippetIds.push(codeSnippetId);
            }
        } else {
            streamData.messages.push({
                message: messageText,
                relatedTagIds: tagIds,
                relatedCodeSnippetIds: [codeSnippetId],
                relatedPageIds: [1],
                relatedStatusId: STATUSES[status]
            });
        }
    };

    const processIssues = (issues, status) => {
        ensureTags();

        issues.forEach(issue => {
            const formattedRuleId = formatRuleId(issue.id);
            const ruleMessageText = `${formattedRuleId} Rule: ${issue.description}. ${issue.help}. More information: ${issue.helpUrl}`;
            const axeCoreTags = issue.tags.map(tagName => tagName); // Capture axe-core issue tags

            issue.nodes.forEach(node => {
                node.any.forEach(detail => {
                    const codeSnippetId = codeSnippetIdCounter++;
                    streamData.codeSnippets.push({ codeSnippetId, codeSnippet: node.html });
                    
                    const detailMessageText = `${detail.message}`;
                    addMessage(detailMessageText, codeSnippetId, status, false, axeCoreTags);
                });

                const codeSnippetId = codeSnippetIdCounter++;
                streamData.codeSnippets.push({ codeSnippetId, codeSnippet: node.html });
                addMessage(ruleMessageText, codeSnippetId, status, true, axeCoreTags);
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