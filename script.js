document.addEventListener('DOMContentLoaded', function () {
    const inputDiv = document.getElementById('inputText');
    const outputHTML = document.getElementById('outputHTML');

    const allowedTags = ['STRONG', 'EM', 'U', 'A', 'P', 'H1', 'H2', 'H3', 'H4', 'BR', 'UL', 'LI'];

    // Làm sạch nội dung: chỉ giữ các thẻ được phép
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

    // Chuyển nội dung từ contenteditable thành HTML sạch
    function convertToHTMLFromContentEditable(htmlContent) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        cleanNode(tempDiv);

        const lines = [];
        let buffer = [];

        for (const child of tempDiv.childNodes) {
            if (child.nodeType === 1 && (child.tagName === 'UL' || child.tagName === 'OL')) {
                lines.push(child.outerHTML);
                continue;
            }

            let content = '';
            if (child.nodeType === 1 && child.tagName === 'DIV') {
                content = child.innerHTML.trim();
            } else if (child.nodeType === 3) {
                content = child.textContent.trim();
            } else if (child.nodeType === 1) {
                content = child.outerHTML.trim();
            }

            if (content === '' && buffer.length) {
                lines.push(buffer.join(' ').trim());
                buffer = [];
            } else if (content !== '') {
                buffer.push(content);
            }
        }

        if (buffer.length) {
            lines.push(buffer.join(' ').trim());
        }

        // Xử lý heading và chuẩn hóa nội dung
        const result = lines.map(rawLine => {
            const headingMatch = rawLine.match(/^(h\s*([1-4])[:\s])|^(heading\s*([1-4]))[:\s]?/i);

            if (headingMatch) {
                const level = headingMatch[2] || headingMatch[4];
                const title = rawLine.replace(headingMatch[0], '').trim();
                return `<h${level}><strong>${title}</strong></h${level}>`;
            }

            // Tránh bọc <p> quanh danh sách
            if (rawLine.startsWith('<ul') || rawLine.startsWith('<ol')) {
                return rawLine;
            }

            return `<p>${rawLine}</p>`;
        });

        return result.join('\n');
    }

    // Cập nhật output mỗi khi người dùng nhập
    function updateOutputHTML() {
        const html = convertToHTMLFromContentEditable(inputDiv.innerHTML);
        outputHTML.value = html.trim() || '';
    }

    inputDiv.addEventListener('input', updateOutputHTML);
    inputDiv.addEventListener('keyup', updateOutputHTML);
    inputDiv.addEventListener('paste', () => {
        setTimeout(updateOutputHTML, 30); // Đợi paste hoàn tất
    });

    // Các nút định dạng
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

    // Nút bọc heading thủ công
    window.wrapWithHeading = function (level) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        const range = selection.getRangeAt(0);
        const selectedText = range.toString().trim();
        if (!selectedText) return;

        const heading = document.createElement(`h${level}`);
        const strong = document.createElement('strong');
        strong.textContent = selectedText;
        heading.appendChild(strong);

        range.deleteContents();
        range.insertNode(heading);

        updateOutputHTML();
    };
});
