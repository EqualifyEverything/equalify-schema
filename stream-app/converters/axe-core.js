function convertAxeResultsToStream(axeResults) {
    let tagIdCounter = 1;
    let codeSnippetMap = new Map();
    let codeIdCounter = 1;
    let ruleTagId, messageTagId;

    const streamData = {
        messages: [],
        tags: [],
        code: [],
        urls: [{ urlId: 1, url: axeResults.result.results.url }]
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

    const getOrCreateCodeId = (html) => {
        if (codeSnippetMap.has(html)) {
            return codeSnippetMap.get(html);
        } else {
            const codeId = codeIdCounter++;
            codeSnippetMap.set(html, codeId);
            streamData.code.push({ codeId, code: html });
            return codeId;
        }
    };

    const addOrUpdateMessage = (messageText, html, messageType, isRule, additionalTags = []) => {
        const codeId = getOrCreateCodeId(html);
        let existingMessage = streamData.messages.find(m => m.message === messageText && m.type === messageType);

        if (existingMessage) {
            if (!existingMessage.relatedCodeIds.includes(codeId)) {
                existingMessage.relatedCodeIds.push(codeId);
            }
            additionalTags.forEach(tag => {
                const tagId = getOrCreateTagId(tag);
                if (!existingMessage.relatedTagIds.includes(tagId)) {
                    existingMessage.relatedTagIds.push(tagId);
                }
            });
        } else {
            const tagIds = [isRule ? ruleTagId : messageTagId].concat(
                additionalTags.map(tag => getOrCreateTagId(tag))
            );

            streamData.messages.push({
                message: messageText,
                relatedTagIds: tagIds,
                relatedCodeIds: [codeId],
                relatedUrlIds: [1],
                type: messageType
            });
        }
    };

    const getOrCreateTagId = (tag) => {
        let tagEntry = streamData.tags.find(t => t.tag === tag);
        if (!tagEntry) {
            tagEntry = { tagId: tagIdCounter++, tag: tag };
            streamData.tags.push(tagEntry);
        }
        return tagEntry.tagId;
    };

    const processIssues = (issues, messageType) => {
        ensureTags();

        issues.forEach(issue => {
            const formattedRuleId = formatRuleId(issue.id);
            const ruleMessageText = `${formattedRuleId} Rule: ${issue.description}. ${issue.help}. More information: ${issue.helpUrl}`;

            issue.nodes.forEach(node => {
                addOrUpdateMessage(ruleMessageText, node.html, messageType, true, issue.tags);

                node.any.forEach(detail => {
                    const detailMessageText = detail.message;
                    addOrUpdateMessage(detailMessageText, node.html, messageType, false, issue.tags);
                });
            });
        });
    };

    processIssues(axeResults.result.results.violations, 'violation');
    processIssues(axeResults.result.results.incomplete, 'error');
    if (axeResults.result.results.passes) {
        processIssues(axeResults.result.results.passes, 'pass');
    }

    return streamData;
}

module.exports = convertAxeResultsToStream;
