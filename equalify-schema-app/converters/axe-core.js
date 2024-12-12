function convertAxeResultsToEqualifySchema(axeResults) {
    let tagIdCounter = 1;
    let nodeIdCounter = 1;
    let ruleTagId, messageTagId;

    const nodeMap = new Map();
    const messageMap = new Map();
    const tagMap = new Map();

    const equalifySchemaData = {
        urls: [{ urlId: 1, url: axeResults.results.url }], // This script only converts one url
        messages: [],
        tags: [],
        nodes: []
    };

    const ensureTags = () => {
        if (!ruleTagId) {
            const ruleTag = 'axe-core Rule';
            ruleTagId = getOrCreateTagId(ruleTag);
        }
        if (!messageTagId) {
            const messageTag = 'axe-core Message';
            messageTagId = getOrCreateTagId(messageTag);
        }
    };

    const formatRuleId = (id) => id.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    const getOrCreateTagId = (tag) => {
        if (tagMap.has(tag)) {
            return tagMap.get(tag);
        } else {
            const tagId = tagIdCounter++;
            tagMap.set(tag, tagId);
            equalifySchemaData.tags.push({ tagId, tag });
            return tagId;
        }
    };

    const getOrCreateNodeId = (html, targets) => {
        const key = `${html}::${targets.join(',')}`;
        if (!nodeMap.has(key)) {
            const nodeId = nodeIdCounter++;
            nodeMap.set(key, nodeId);
            equalifySchemaData.nodes.push({ 
                nodeId, 
                html, 
                targets, 
                relatedUrlId: 1,
                equalified: false  
             });
        }
        return nodeMap.get(key);
    };

    const addOrUpdateMessage = (messageText, messageType, isRule, html, targets, relatedHtmls, additionalTags = []) => {
        const nodeId = getOrCreateNodeId(html, targets);
        const key = `${messageText}::${messageType}`;
        const tagIds = [isRule ? ruleTagId : messageTagId].concat(
            additionalTags.map(tag => getOrCreateTagId(tag))
        );

        // Process related nodes
        const relatedNodeIds = relatedHtmls.map(relatedHtml => getOrCreateNodeId(relatedHtml, targets));

        if (!messageMap.has(key)) {
            const message = {
                message: messageText,
                relatedTagIds: tagIds,
                relatedNodeIds: [nodeId, ...relatedNodeIds],
                type: messageType
            };
            equalifySchemaData.messages.push(message);
            messageMap.set(key, message);
        } else {
            const existingMessage = messageMap.get(key);
            if (!existingMessage.relatedNodeIds.includes(nodeId)) {
                existingMessage.relatedNodeIds.push(nodeId);
            }
            relatedNodeIds.forEach(rNodeId => {
                if (!existingMessage.relatedNodeIds.includes(rNodeId)) {
                    existingMessage.relatedNodeIds.push(rNodeId);
                }
            });
        }
    };

    const processIssues = (issues, messageType) => {
        ensureTags();

        issues.forEach(issue => {
            const formattedRuleId = formatRuleId(issue.id);
            const ruleMessageText = `${formattedRuleId} Rule: ${issue.description}. ${issue.help}. More information: ${issue.helpUrl}`;

            issue.nodes.forEach(node => {
                const targets = node.target || [];
                const relatedHtmls = node.any.flatMap(detail => 
                    detail.relatedNodes ? detail.relatedNodes.map(rNode => rNode.html) : []
                );

                addOrUpdateMessage(ruleMessageText, messageType, true, node.html, targets, relatedHtmls, issue.tags);

                node.any.forEach(detail => {
                    const detailMessageText = detail.message;
                    addOrUpdateMessage(detailMessageText, messageType, false, node.html, targets, relatedHtmls, issue.tags);
                });

                const nodeId = getOrCreateNodeId(node.html, targets); 
                const nodeInEqualifySchema = equalifySchemaData.nodes.find(n => n.nodeId === nodeId);
                if (nodeInEqualifySchema) {
                    nodeInEqualifySchema.equalified = (messageType === 'pass');
                }
            });
        });
    };

    if (axeResults.results.violations) {
        processIssues(axeResults.results.violations, 'violation');
    }
    if (axeResults.results.incomplete) {
        processIssues(axeResults.results.incomplete, 'warning');
    }
    if (axeResults.results.passes) {
        processIssues(axeResults.results.passes, 'pass');
    }

    return equalifySchemaData;
}

module.exports = convertAxeResultsToEqualifySchema;
