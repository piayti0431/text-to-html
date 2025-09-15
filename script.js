document.addEventListener('DOMContentLoaded', function () {
    const inputDiv = document.getElementById('inputText');
    const outputHTML = document.getElementById('outputHTML');

    const allowedTags = ['STRONG', 'EM', 'U', 'A', 'P', 'H1', 'H2', 'H3', 'H4', 'BR', 'UL', 'OL', 'LI'];

    function cleanNode(node) {
        const children = Array.from(node.childNodes);
        for (let child of children) {
            if (child.nodeType === Node.ELEMENT_NODE) {
                if (!allowedTags.includes(child.tagName)) {
                    const fragment = document.createDocumentFragment();
                    while (child.firstChild) {
                        fragment.appendChild(child.firstChild);
                    }
                    node.replaceChild(fragment, child);
                    cleanNode(node);
                } else {
                    [...child.attributes].forEach(attr => {
                        if (child.tagName === 'A' && attr.name === 'href') return;
                        child.removeAttribute(attr.name);
                    });
                    cleanNode(child);
                }
            }
        }
    }

    function convertToHTMLFromContentEditable(htmlContent) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        cleanNode(tempDiv);

        const lines = [];
        let buffer = [];

        for (const child of tempDiv.childNodes) {
            if (child.nodeType === 1 && (child.tagName === 'DIV' || child.tagName === 'P')) {
                const content = child.innerHTML.trim();
                if (content) lines.push(content);
            } else if (child.nodeType === 3) {
                const content = child.textContent.trim();
                if (content) lines.push(content);
            } else if (child.nodeType === 1) {
                const outer = child.outerHTML.trim();
                if (outer) lines.push(outer);
            }
        }

        const result = [];
        let inList = false;

        for (let rawLine of lines) {
            const line = rawLine.trim();

            const headingMatch = line.match(/^(h\s*([1-4])[:\s])|^(heading\s*([1-4]))[:\s]?/i);
            if (headingMatch) {
                const level = headingMatch[2] || headingMatch[4];
                const title = line.replace(headingMatch[0], '').trim();
                result.push(`<h${level}><strong>${title}</strong></h${level}>`);
                continue;
            }

            // Check for list item
            if (/^<li>|<ul>|<ol>|<\/ul>|<\/ol>|<\/li>/.test(line) || /^\u2022|^- /.test(line)) {
                if (!inList) {
                    result.push('<ul>');
                    inList = true;
                }
                const text = line.replace(/^\u2022|^- /, '').trim();
                result.push(`<li>${text}</li>`);
                continue;
            }

            if (inList) {
                result.push('</ul>');
                inList = false;
            }

            result.push(`<p>${line}</p>`);
        }

        if (inList) {
            result.push('</ul>');
        }

        return result.join('\n');
    }

    function updateOutputHTML() {
        const html = convertToHTMLFromContentEditable(inputDiv.innerHTML);
        outputHTML.value = html.trim();
    }

    inputDiv.addEventListener('input', updateOutputHTML);
    inputDiv.addEventListener('keyup', updateOutputHTML);
    inputDiv.addEventListener('paste', () => {
        setTimeout(updateOutputHTML, 100);
    });

    window.applyFormat = function (format) {
        inputDiv.focus();
        const sel = window.getSelection();
        if (!sel.rangeCount) return;

        const range = sel.getRangeAt(0);
        const selectedText = sel.toString();
        if (!selectedText) return;

        if (format === 'uppercase') {
            document.execCommand('insertText', false, selectedText.toUpperCase());
        } else if (format === 'capitalize') {
            const cap = selectedText.replace(/\b\w/g, c => c.toUpperCase());
            document.execCommand('insertText', false, cap);
        } else if (format === 'bold') {
            document.execCommand('bold');
        } else if (format === 'italic') {
            document.execCommand('italic');
        } else if (format === 'link') {
            const url = prompt('Nhập URL:', 'https://');
            if (!url) return;
            document.execCommand('createLink', false, url);
        }

        updateOutputHTML();
    };
});
