document.addEventListener('DOMContentLoaded', function () {
    const inputDiv = document.getElementById('inputText');
    const outputHTML = document.getElementById('outputHTML');

    function convertToHTMLFromContentEditable(htmlContent) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;

        const lines = [];
        for (const child of tempDiv.childNodes) {
            let lineHTML = '';
            if (child.nodeType === 1 && child.tagName === 'DIV') {
                lineHTML = child.innerHTML.trim();
            } else if (child.nodeType === 3 && child.textContent.trim()) {
                lineHTML = child.textContent.trim();
            } else if (child.nodeType === 1) {
                lineHTML = child.outerHTML.trim();
            }

            if (lineHTML) {
                const headingMatch = lineHTML.match(/^(h\s*([1-4])[:\s])|^(heading\s*([1-4]))[:\s]?/i);
                if (headingMatch) {
                    const level = headingMatch[2] || headingMatch[4];
                    const content = lineHTML.replace(headingMatch[0], '').trim();
                    lines.push(`<h${level}>${content}</h${level}>`);
                } else {
                    lines.push(`<p>${lineHTML}</p>`);
                }
            }
        }

        return lines.join('\n');
    }

    function updateOutputHTML() {
        const html = convertToHTMLFromContentEditable(inputDiv.innerHTML);
        outputHTML.value = html;
    }

    inputDiv.addEventListener('input', updateOutputHTML);

    // Dùng execCommand để giữ format cũ và thêm mới chồng lên
    window.applyFormat = function (format) {
        inputDiv.focus();
        if (format === 'uppercase' || format === 'capitalize') {
            const sel = window.getSelection();
            if (!sel.rangeCount) return;
            const range = sel.getRangeAt(0);
            const selected = range.toString();
            if (!selected) return;

            const modified = format === 'uppercase'
                ? selected.toUpperCase()
                : selected.replace(/\b\w/g, c => c.toUpperCase());

            document.execCommand('insertText', false, modified);
        } else if (format === 'bold') {
            document.execCommand('bold', false, null);
        } else if (format === 'italic') {
            document.execCommand('italic', false, null);
        } else if (format === 'link') {
            const url = prompt("Nhập URL:", "https://");
            if (!url) return;
            document.execCommand('createLink', false, url);
        }

        updateOutputHTML();
    };

    // Hàm clean chuẩn
    window.cleanInput = function () {
        const temp = document.createElement('div');
        temp.innerHTML = inputDiv.innerHTML;

        const allowedTags = ['STRONG', 'EM', 'U', 'A', 'P', 'H1', 'H2', 'H3', 'H4', 'BR'];

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
                        cleanNode(node); // Đệ quy
                    } else {
                        [...child.attributes].forEach(attr => {
                            if (child.tagName === 'A' && attr.name === 'href') return;
                            child.removeAttribute(attr.name);
                        });
                        cleanNode(child); // Đệ quy con cháu
                    }
                }
            }
        }

        cleanNode(temp);
        inputDiv.innerHTML = temp.innerHTML;
        updateOutputHTML();
    };
});
