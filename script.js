document.addEventListener('DOMContentLoaded', function () {
    const inputText = document.getElementById('inputText');
    const outputHTML = document.getElementById('outputHTML');

    function convertToHTML(text) {
        const lines = text.split('\n');
        return lines.map(line => {
            const trimmed = line.trim();

            // Nhận biết các dạng heading như H1, heading 2, H 3, heading4:
            const headingMatch = trimmed.match(/^(h\s*([1-4])[:\s])|^(heading\s*([1-4]))[:\s]?/i);
            if (headingMatch) {
                const level = headingMatch[2] || headingMatch[4];
                const content = trimmed.replace(headingMatch[0], '').trim();
                return `<h${level}>${content}</h${level}>`;
            }

            return `<p>${trimmed}</p>`;
        }).join('\n');
    }

    inputText.addEventListener('input', function () {
        const html = convertToHTML(inputText.value);
        outputHTML.value = html;
    });

    window.applyFormat = function (format) {
        const start = inputText.selectionStart;
        const end = inputText.selectionEnd;
        const selected = inputText.value.slice(start, end);

        if (!selected) return;

        let formatted = selected;
        if (format === 'uppercase') {
            formatted = selected.toUpperCase();
        } else if (format === 'bold') {
            formatted = `<b>${selected}</b>`;
        } else if (format === 'italic') {
            formatted = `<i>${selected}</i>`;
        } else if (format === 'capitalize') {
            formatted = selected.replace(/\b\w/g, c => c.toUpperCase());
        }

        inputText.setRangeText(formatted, start, end, 'end');
        inputText.dispatchEvent(new Event('input'));
    };
});
