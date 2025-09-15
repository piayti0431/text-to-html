function convertToHTML(text) {
    const lines = text.split('\n');
    return lines.map(line => {
        const trimmed = line.trim();

        // Nhận diện: H1, h1, Heading 1, heading1, Tiêu đề 1, H 1, H1:
        const headingRegex = /^(H(?:eading)?\s*([1-4])[:\s]?|Tiêu đề\s*([1-4]))/i;
        const match = trimmed.match(headingRegex);

        if (match) {
            const level = match[2] || match[3];
            const content = trimmed.replace(match[0], '').trim();
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

    if (start === end) return; // Nếu không bôi đen thì không làm gì

    const selectedText = textarea.value.slice(start, end);
    let formattedText = selectedText;

    switch (format) {
        case 'bold':
            formattedText = `<b>${selectedText}</b>`;
            break;
        case 'italic':
            formattedText = `<i>${selectedText}</i>`;
            break;
        case 'underline':
            formattedText = `<u>${selectedText}</u>`;
            break;
        case 'capitalize':
            formattedText = selectedText.replace(/\b\w/g, c => c.toUpperCase());
            break;
    }

    textarea.setRangeText(formattedText, start, end, 'end');
}
