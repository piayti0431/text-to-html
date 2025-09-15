function convertToHTML(text) {
    const lines = text.split('\n');
    return lines.map(line => {
        const trimmed = line.trim();

        // Nhận biết Heading từ các định dạng: H1, H1:, Heading1, heading 1, H 1:, v.v.
        const headingMatch = trimmed.match(/^(h\s*([1-4])[:\s])|^(heading\s*([1-4]))[:\s]?/i);
        if (headingMatch) {
            const level = headingMatch[2] || headingMatch[4];
            const content = trimmed.replace(headingMatch[0], '').trim();
            return `<h${level}>${content}</h${level}>`;
        }

        return `<p>${trimmed}</p>`;
    }).join('\n');
}

// Cập nhật HTML mỗi khi người dùng nhập văn bản
document.getElementById('inputText').addEventListener('input', function () {
    const inputText = this.value;
    const html = convertToHTML(inputText);
    document.getElementById('outputHTML').value = html;
});

// Áp dụng định dạng cho văn bản được bôi đen ở ô nhập (inputText)
function applyFormat(format) {
    const textarea = document.getElementById('inputText');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.slice(start, end);

    if (!selected) return; // Không làm gì nếu không bôi đen gì

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

    // Thay thế đoạn văn bản được chọn
    textarea.setRangeText(formatted, start, end, 'end');

    // Kích hoạt lại sự kiện input để cập nhật ô HTML
    textarea.dispatchEvent(new Event('input'));
}
