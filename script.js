document.addEventListener('DOMContentLoaded', function () {
    const inputDiv = document.getElementById('inputText');
    const outputHTML = document.getElementById('outputHTML');

    const allowedTags = ['STRONG', 'EM', 'U', 'A', 'P', 'H1', 'H2', 'H3', 'H4', 'BR'];

    // 🧼 Làm sạch node: giữ lại thẻ hợp lệ, chuẩn SEO (b -> strong, i -> em)
    function cleanNode(node) {
        const children = Array.from(node.childNodes);
        for (let child of children) {
            if (child.nodeType === Node.ELEMENT_NODE) {
                // ✨ Chuyển <b> -> <strong>, <i> -> <em>
                if (child.tagName === 'B') {
                    const strong = document.createElement('strong');
                    while (child.firstChild) strong.appendChild(child.firstChild);
                    node.replaceChild(strong, child);
                    cleanNode(strong);
                    continue;
                }
                if (child.tagName === 'I') {
                    const em = document.createElement('em');
                    while (child.firstChild) em.appendChild(child.firstChild);
                    node.replaceChild(em, child);
                    cleanNode(em);
                    continue;
                }

                // ❌ Loại thẻ không hợp lệ
                if (!allowedTags.includes(child.tagName)) {
                    const fragment = document.createDocumentFragment();
                    while (child.firstChild) {
                        fragment.appendChild(child.firstChild);
                    }
                    node.replaceChild(fragment, child);
                    cleanNode(node);
                } else {
                    // ⚙️ Xoá mọi thuộc tính (trừ href trong <a>)
                    [...child.attributes].forEach(attr => {
                        if (child.tagName === 'A' && attr.name === 'href') return;
                        child.removeAttribute(attr.name);
                    });
                    cleanNode(child);
                }
            }
        }
    }

    // ✅ Chuyển HTML từ contenteditable sang HTML sạch
    function convertToHTMLFromContentEditable(htmlContent) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;

        cleanNode(tempDiv); // Làm sạch rác

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

    // 📥 Cập nhật HTML kết quả
    function updateOutputHTML() {
        const html = convertToHTMLFromContentEditable(inputDiv.innerHTML);
        outputHTML.value = html;
    }

    // 🧠 Lắng nghe mọi thay đổi
    inputDiv.addEventListener('input', updateOutputHTML);
    inputDiv.addEventListener('paste', () => {
        setTimeout(updateOutputHTML, 10); // đợi paste hoàn tất
    });
    inputDiv.addEventListener('keyup', updateOutputHTML);

    // 🔘 Các nút định dạng
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
            document.execCommand('bold', false, null); // sẽ chuyển <b> → <strong> khi clean
        } else if (format === 'italic') {
            document.execCommand('italic', false, null); // sẽ chuyển <i> → <em> khi clean
        } else if (format === 'link') {
            const url = prompt("Nhập URL liên kết:", "https://");
            if (!url) return;
            document.execCommand('createLink', false, url);
        }

        updateOutputHTML();
    };
});
