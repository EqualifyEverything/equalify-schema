function convertAxeResultsToStream(axeResults) {
    let tagIdCounter = 1;
    let nodeIdCounter = 1;
    let ruleTagId, messageTagId;

    const nodeMap = new Map();
    const messageMap = new Map();
    const tagMap = new Map(); // Added to track existing tags

    const streamData = {
        messages: [],
        tags: [],
        nodes: [],
        urls: [{ urlId: 1, url: axeResults.result.results.url }]
    };

    const ensureTags = () => {
        if (!ruleTagId) {
            const ruleTag = 'axe-core Rule';
            ruleTagId = getOrCreateTagId(ruleTag); // Use getOrCreateTagId to handle ruleTag
        }
        if (!messageTagId) {
            const messageTag = 'axe-core Message';
            messageTagId = getOrCreateTagId(messageTag); // Use getOrCreateTagId to handle messageTag
        }
    };

    const formatRuleId = (id) => id.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    const getOrCreateTagId = (tag) => {
        if (tagMap.has(tag)) {
            return tagMap.get(tag);
        } else {
            const tagId = tagIdCounter++;
            tagMap.set(tag, tagId);
            streamData.tags.push({ tagId, tag }); // Note the use of 'tag' to match the schema
            return tagId;
        }
    };

    const getOrCreateNodeId = (html, targets) => {
        const key = `${html}::${targets.join(',')}`;
        if (!nodeMap.has(key)) {
            const nodeId = nodeIdCounter++;
            nodeMap.set(key, nodeId);
            streamData.nodes.push({ nodeId, html, targets });
        }
        return nodeMap.get(key);
    };

    const addOrUpdateMessage = (messageText, messageType, isRule, html, targets, additionalTags = []) => {
        const nodeId = getOrCreateNodeId(html, targets);
        const key = `${messageText}::${messageType}`;
        const tagIds = [isRule ? ruleTagId : messageTagId].concat(
            additionalTags.map(tag => getOrCreateTagId(tag))
        );

        if (!messageMap.has(key)) {
            const message = {
                message: messageText,
                relatedTagIds: tagIds,
                relatedNodeIds: [nodeId],
                relatedUrlIds: [1],
                type: messageType
            };
            streamData.messages.push(message);
            messageMap.set(key, message);
        } else {
            const existingMessage = messageMap.get(key);
            if (!existingMessage.relatedNodeIds.includes(nodeId)) {
                existingMessage.relatedNodeIds.push(nodeId);
            }
        }
    };

    const processIssues = (issues, messageType) => {
        ensureTags();

        issues.forEach(issue => {
            const formattedRuleId = formatRuleId(issue.id);
            const ruleMessageText = `${formattedRuleId} Rule: ${issue.description}. ${issue.help}. More information: ${issue.helpUrl}`;

            issue.nodes.forEach(node => {
                const targets = node.target || [];
                addOrUpdateMessage(ruleMessageText, messageType, true, node.html, targets, issue.tags);

                node.any.forEach(detail => {
                    const detailMessageText = detail.message;
                    addOrUpdateMessage(detailMessageText, messageType, false, node.html, targets, issue.tags);
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