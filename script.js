document.addEventListener('DOMContentLoaded', function () {
    const inputDiv = document.getElementById('inputText');
    const outputHTML = document.getElementById('outputHTML');

    // Chuyển nội dung trực quan thành HTML chuẩn với <p>, <h1>... và giữ lại <b>, <i>, <a>
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

    // Cập nhật kết quả HTML khi nhập
    function updateOutputHTML() {
        const html = convertToHTMLFromContentEditable(inputDiv.innerHTML);
        outputHTML.value = html;
    }

    inputDiv.addEventListener('input', updateOutputHTML);

    // Xử lý các nút định dạng văn bản
    window.applyFormat = function (format) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const selectedText = selection.toString();
        if (!selectedText) return;

        if (format === 'uppercase') {
            document.execCommand('insertText', false, selectedText.toUpperCase());
        } else if (format === 'capitalize') {
            const capitalized = selectedText.replace(/\b\w/g, c => c.toUpperCase());
            document.execCommand('insertText', false, capitalized);
        } else if (['bold', 'italic', 'link'].includes(format)) {
            const tag = format === 'bold' ? 'b' :
                        format === 'italic' ? 'i' :
                        format === 'link' ? 'a' : null;

            const newNode = document.createElement(tag);

            if (format === 'link') {
                const url = prompt("Nhập URL liên kết:", "https://");
                if (!url) return;
                newNode.setAttribute('href', url);
            }

            newNode.textContent = selectedText;
            range.deleteContents();
            range.insertNode(newNode);
        }

        // Sau khi định dạng, cập nhật lại HTML
        updateOutputHTML();
    };
});
