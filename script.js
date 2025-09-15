document.addEventListener('DOMContentLoaded', function () {
    const inputDiv = document.getElementById('inputText');
    const outputHTML = document.getElementById('outputHTML');

    const allowedTags = ['STRONG', 'EM', 'U', 'A', 'BR'];

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

    function convertToHTMLFromContentEditable(htmlContent) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        cleanNode(tempDiv);

        const paragraphs = [];
        let buffer = '';

        tempDiv.childNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'BR') {
                if (buffer.trim()) {
                    paragraphs.push(`<p>${buffer.trim()}</p>`);
                    buffer = '';
                }
            } else if (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.ELEMENT_NODE) {
                buffer += node.outerHTML || node.textContent;
            }
        });

        if (buffer.trim()) {
            paragraphs.push(`<p>${buffer.trim()}</p>`);
        }

        return paragraphs.length ? paragraphs.join('\n') : '<br>';
    }

    function updateOutputHTML() {
        const html = convertToHTMLFromContentEditable(inputDiv.innerHTML);
        outputHTML.value = html;
    }

    // Sự kiện nhập, dán và gõ bàn phím
    inputDiv.addEventListener('input', updateOutputHTML);
    inputDiv.addEventListener('paste', () => {
        setTimeout(updateOutputHTML, 50); // Cho phép nội dung paste được render trước khi xử lý
    });
    inputDiv.addEventListener('keyup', updateOutputHTML);

    window.applyFormat = function (format) {
        inputDiv.focus();
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const selectedText = selection.toString();
        if (!selectedText) return;

        if (format === 'uppercase' || format === 'capitalize') {
            const modified = format === 'uppercase'
                ? selectedText.toUpperCase()
                : selectedText.replace(/\b\w/g, c => c.toUpperCase());
            document.execCommand('insertText', false, modified);
        } else if (format === 'bold') {
            document.execCommand('bold', false, null);
        } else if (format === 'italic') {
            document.execCommand('italic', false, null);
        } else if (format === 'link') {
            const url = prompt("Nhập URL liên kết:", "https://");
            if (!url) return;
            document.execCommand('createLink', false, url);
        }

        updateOutputHTML();
    };
});
