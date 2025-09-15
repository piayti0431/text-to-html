document.addEventListener('DOMContentLoaded', function () {
    const inputDiv = document.getElementById('inputText');
    const outputHTML = document.getElementById('outputHTML');

    const allowedTags = ['STRONG', 'EM', 'U', 'A', 'P', 'H1', 'H2', 'H3', 'H4', 'BR', 'UL', 'LI'];

    // ✅ Làm sạch: giữ lại các thẻ được cho phép
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

    // ✅ Chuyển đổi nội dung có định dạng sang HTML SEO-friendly
    function convertToHTMLFromContentEditable(htmlContent) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        cleanNode(tempDiv);

        const lines = [];
        let buffer = [];

        for (const child of tempDiv.childNodes) {
            if (child.nodeType === Node.ELEMENT_NODE) {
                const tagName = child.tagName;

                if (tagName === 'UL' || tagName === 'OL') {
                    lines.push(child.outerHTML);
                    continue;
                }

                if (tagName === 'DIV' || tagName === 'P') {
                    const content = child.innerHTML.trim();
                    if (content === '' && buffer.length) {
                        lines.push(buffer.join(' ').trim());
                        buffer = [];
                    } else if (content !== '') {
                        buffer.push(content);
                    }
                    continue;
                }

                lines.push(child.outerHTML.trim());
            } else if (child.nodeType === Node.TEXT_NODE) {
                const content = child.textContent.trim();
                if (content !== '') {
                    buffer.push(content);
                }
            }
        }

        if (buffer.length) {
            lines.push(buffer.join(' ').trim());
        }

        // ✅ Duyệt và định dạng thẻ heading
        const result = lines.map(rawLine => {
            const headingMatch = rawLine.match(/^(h\s*([1-4])[:\s])|^(heading\s*([1-4]))[:\s]?/i);

            if (headingMatch) {
                const level = headingMatch[2] || headingMatch[4];
                const title = rawLine.replace(headingMatch[0], '').trim();
                return `<h${level}><strong>${title}</strong></h${level}>`;
            }

            // Đã là <ul>, <ol> thì không bọc <p>
            if (rawLine.startsWith('<ul') || rawLine.startsWith('<ol')) {
                return rawLine;
            }

            return `<p>${rawLine}</p>`;
        });

        return result.join('\n');
    }

    // ✅ Cập nhật kết quả
    function updateOutputHTML() {
        const html = convertToHTMLFromContentEditable(inputDiv.innerHTML);
        outputHTML.value = html.trim();
    }

    // 🎯 Sự kiện người dùng
    inputDiv.addEventListener('input', updateOutputHTML);
    inputDiv.addEventListener('keyup', updateOutputHTML);
    inputDiv.addEventListener('paste', () => setTimeout(updateOutputHTML, 100));

    // 🎯 Các nút định dạng
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
            const capitalized = selectedText.replace(/\b\w/g, c => c.toUpperCase());
            document.execCommand('insertText', false, capitalized);
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
