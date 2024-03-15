const STATUSES = {
    violations: 1,
    incomplete: 2,
    passes: 3
};

function convertAxeResultsToStream(axeResults) {
    let tagIdCounter = 1;
    let codeIdCounter = 1;
    let ruleTagId, messageTagId;

    const streamData = {
        messages: [],
        tags: [],
        code: [],
        pages: [{ pageId: 1, pageUrl: axeResults.result.results.url }],
        statuses: [
            { statusId: STATUSES.violations, status: 'Violations' },
            { statusId: STATUSES.incomplete, status: 'Incomplete' },
            { statusId: STATUSES.passes, status: 'Passes' }
        ]
    };

    const ensureTags = () => {
        if (!ruleTagId) {
            ruleTagId = tagIdCounter++;
            streamData.tags.push({ tagId: ruleTagId, tag: 'axe-core Rule' });
        }
        if (!messageTagId) {
            messageTagId = tagIdCounter++;
            streamData.tags.push({ tagId: messageTagId, tag: 'axe-core Message' });
        }
    };

    const formatRuleId = (id) => id.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    const getOrCreateTagId = (tag) => {
        let tagEntry = streamData.tags.find(t => t.tag === tag);
        if (!tagEntry) {
            tagEntry = { tagId: tagIdCounter++, tag: tag };
            streamData.tags.push(tagEntry);
        }
        return tagEntry.tagId;
    };

    const addMessage = (messageText, codeId, status, isRule, additionalTags = []) => {
        const tagIds = additionalTags.map(getOrCreateTagId);
        tagIds.push(isRule ? ruleTagId : messageTagId);

        let existingMessage = streamData.messages.find(m => m.message === messageText && m.relatedStatusId === STATUSES[status]);
        if (existingMessage) {
            if (!existingMessage.relatedcodeIds.includes(codeId)) {
                existingMessage.relatedcodeIds.push(codeId);
            }
        } else {
            streamData.messages.push({
                message: messageText,
                relatedTagIds: tagIds,
                relatedcodeIds: [codeId],
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
            const axeCoreTags = issue.tags.map(tag => tag); // Capture axe-core issue tags

            issue.nodes.forEach(node => {
                node.any.forEach(detail => {
                    const codeId = codeIdCounter++;
                    streamData.code.push({ codeId, code: node.html });
                    
                    const detailMessageText = `${detail.message}`;
                    addMessage(detailMessageText, codeId, status, false, axeCoreTags);
                });

                const codeId = codeIdCounter++;
                streamData.code.push({ codeId, code: node.html });
                addMessage(ruleMessageText, codeId, status, true, axeCoreTags);
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