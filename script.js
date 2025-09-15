
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

document.getElementById('inputText').addEventListener('input', function () {
    const inputText = this.value;
    const html = convertToHTML(inputText);
    document.getElementById('outputHTML').value = html;
});

function applyFormat(format) {
    const textarea = document.getElementById('outputHTML');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.slice(start, end);

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

    textarea.setRangeText(formatted, start, end, 'end');
}
