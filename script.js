document.addEventListener('DOMContentLoaded', function () {
    const inputDiv = document.getElementById('inputText');
    const outputHTML = document.getElementById('outputHTML');

    const allowedTags = ['STRONG', 'EM', 'U', 'A', 'P', 'H1', 'H2', 'H3', 'H4', 'BR'];

    // 🧼 Làm sạch: chỉ giữ lại các thẻ hợp lệ
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
                    cleanNode(fragment);
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

    // 🧾 Tách các dòng văn bản có nghĩa từ nội dung DOM
    function extractCleanTextLines(element) {
        const lines = [];
        let buffer = '';

        function recurse(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                buffer += node.textContent;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.tagName === 'BR') {
                    if (buffer.trim()) lines.push(buffer.trim());
                    buffer = '';
                } else {
                    for (const child of node.childNodes) {
                        recurse(child);
                    }
                    if (['DIV', 'P'].includes(node.tagName)) {
                        if (buffer.trim()) lines.push(buffer.trim());
                        buffer = '';
                    }
                }
            }
        }

        recurse(element);
        if (buffer.trim()) lines.push(buffer.trim());
        return lines.filter(line => line.length > 0);
    }

    // ✨ Chuyển HTML nhập vào thành HTML chuẩn sạch
    function convertToHTMLFromContentEditable(htmlContent) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;

        cleanNode(tempDiv);
        const lines = extractCleanTextLines(tempDiv);

        const result = lines.map(rawLine => {
            const headingMatch = rawLine.match(/^H([1-4]):\s*(.+)/i);
            if (headingMatch) {
                const level = headingMatch[1];
                const title = headingMatch[2];
                return `<h${level}><strong>${title}</strong></h${level}>`;
            }
            return `<p>${rawLine}</p>`;
        });

        return result.join('\n');
    }

    // 🔁 Cập nhật output HTML sau mỗi hành động
    function updateOutputHTML() {
        const html = convertToHTMLFromContentEditable(inputDiv.innerHTML);
        outputHTML.value = html.trim() || '';
    }

    // 👂 Theo dõi input, gõ, dán...
    inputDiv.addEventListener('input', updateOutputHTML);
    inputDiv.addEventListener('keyup', updateOutputHTML);
    inputDiv.addEventListener('paste', () => {
        setTimeout(updateOutputHTML, 50); // đợi nội dung dán xong
    });

    // 🎯 Nút định dạng văn bản
    window.applyFormat = function (format) {
        inputDiv.focus();
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        const selectedText = selection.toString();
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
            if (url) document.execCommand('createLink', false, url);
        }

        updateOutputHTML();
    };
});
