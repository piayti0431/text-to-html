document.addEventListener('DOMContentLoaded', function () {
    const inputDiv = document.getElementById('inputText');
    const outputHTML = document.getElementById('outputHTML');

    // Chuyển nội dung HTML thành đoạn HTML có thẻ <p>, <h1>..., giữ các thẻ quan trọng
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

    // Cập nhật ô HTML
    function updateOutputHTML() {
        const html = convertToHTMLFromContentEditable(inputDiv.innerHTML);
        outputHTML.value = html;
    }

    // Gõ là cập nhật
    inputDiv.addEventListener('input', updateOutputHTML);

    // Nút định dạng
    window.applyFormat = function (format) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const selectedText = range.toString();
        if (!selectedText) return;

        let wrapper;

        if (format === 'uppercase') {
            const span = document.createElement('span');
            span.textContent = selectedText.toUpperCase();
            wrapper = span;
        } else if (format === 'capitalize') {
            const span = document.createElement('span');
            span.textContent = selectedText.replace(/\b\w/g, c => c.toUpperCase());
            wrapper = span;
        } else if (format === 'bold') {
            wrapper = document.createElement('strong');
            wrapper.textContent = selectedText;
        } else if (format === 'italic') {
            wrapper = document.createElement('em');
            wrapper.textContent = selectedText;
        } else if (format === 'link') {
            const url = prompt("Nhập URL:", "https://");
            if (!url) return;
            wrapper = document.createElement('a');
            wrapper.href = url;
            wrapper.textContent = selectedText;
        }

        if (wrapper) {
            range.deleteContents();
            range.insertNode(wrapper);
            range.setStartAfter(wrapper);
            range.setEndAfter(wrapper);
            selection.removeAllRanges();
            selection.addRange(range);
            updateOutputHTML();
        }
    };

    // Nút Clean: loại bỏ các thẻ không cần thiết (span, style, class, ...)
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

        cleanNode(temp);

        inputDiv.innerHTML = temp.innerHTML;
        updateOutputHTML();
    };
});
