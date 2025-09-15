document.addEventListener('DOMContentLoaded', function () {
    const inputDiv = document.getElementById('inputText');
    const outputHTML = document.getElementById('outputHTML');

    function convertToHTML(text) {
        const lines = text.split('\n');
        return lines.map(line => {
            const trimmed = line.trim();

            const headingMatch = trimmed.match(/^(h\s*([1-4])[:\s])|^(heading\s*([1-4]))[:\s]?/i);
            if (headingMatch) {
                const level = headingMatch[2] || headingMatch[4];
                const content = trimmed.replace(headingMatch[0], '').trim();
                return `<h${level}>${content}</h${level}>`;
            }

            return `<p>${trimmed}</p>`;
        }).join('\n');
    }

    function updateOutputHTML() {
        const text = inputDiv.innerText;
        const html = convertToHTML(text);
        outputHTML.value = html;
    }

    inputDiv.addEventListener('input', updateOutputHTML);

    window.applyFormat = function (format) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const selectedText = range.toString();
        if (!selectedText) return;

        if (format === 'uppercase') {
            document.execCommand('insertText', false, selectedText.toUpperCase());
        } else if (format === 'capitalize') {
            const capitalized = selectedText.replace(/\b\w/g, c => c.toUpperCase());
            document.execCommand('insertText', false, capitalized);
        } else {
            // Wrap with tag
            let wrapperTag = '';
            if (format === 'bold') wrapperTag = 'b';
            if (format === 'italic') wrapperTag = 'i';

            if (wrapperTag) {
                const el = document.createElement(wrapperTag);
                el.textContent = selectedText;
                range.deleteContents();
                range.insertNode(el);
                selection.collapseToEnd();
            }
        }

        updateOutputHTML();
    };
});
