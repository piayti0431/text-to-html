document.addEventListener('DOMContentLoaded', function () {
    const inputDiv = document.getElementById('inputText');
    const outputHTML = document.getElementById('outputHTML');

    const allowedTags = ['STRONG', 'EM', 'U', 'A', 'P', 'H1', 'H2', 'H3', 'H4', 'BR'];

    // 🧼 Hàm làm sạch các thẻ không được phép
    function cleanNode(node) {
        const children = Array.from(node.childNodes);
        for (let child of children) {
            if (child.nodeType === Node.ELEMENT_NODE) {
                // Loại bỏ các thẻ không nằm trong danh sách cho phép
                if (!allowedTags.includes(child.tagName)) {
                    const fragment = document.createDocumentFragment();
                    while (child.firstChild) {
                        fragment.appendChild(child.firstChild);
                    }
                    node.replaceChild(fragment, child);
                    cleanNode(node); // Làm sạch tiếp
                } else {
                    // Loại bỏ toàn bộ thuộc tính (trừ href của <a>)
                    [...child.attributes].forEach(attr => {
                        if (child.tagName === 'A' && attr.name === 'href') return;
                        child.removeAttribute(attr.name);
                    });
                    cleanNode(child); // Tiếp tục kiểm tra bên trong
                }
            }
        }
    }

    // ✅ Hàm chuyển contenteditable HTML thành HTML sạch và chuẩn
    function convertToHTMLFromContentEditable(htmlContent) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;

        cleanNode(tempDiv); // Dọn sạch nội dung

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
                // Heading nhận dạng từ đầu dòng
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

    // 📥 Cập nhật kết quả HTML bên phải
    function updateOutputHTML() {
        const html = convertToHTMLFromContentEditable(inputDiv.innerHTML);
        outputHTML.value = html;
    }

    // 👂 Theo dõi mọi thao tác người dùng
    inputDiv.addEventListener('input', updateOutputHTML);
    inputDiv.addEventListener('paste', () => {
        setTimeout(updateOutputHTML, 10); // Đợi paste xong rồi mới xử lý
    });
    inputDiv.addEventListener('keyup', updateOutputHTML);

    // 🔘 Hàm định dạng khi nhấn nút
    window.applyFormat = function (format) {
        inputDiv.focus();

        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const selectedText = selection.toString();
        if (!selectedText) return;

        // Chuyển đổi kiểu
        if (format === 'uppercase' || format === 'capitalize') {
            const modified = format === 'uppercase'
                ? selectedText.toUpperCase()
                : selectedText.replace(/\b\w/g, c => c.toUpperCase());

            document.execCommand('insertText', false, modified);
        } else if (format === 'bold') {
            document.execCommand('formatBlock', false, 'strong');
            document.execCommand('bold', false, null); // Dùng strong nhưng giữ hỗ trợ
        } else if (format === 'italic') {
            document.execCommand('italic', false, null); // Chuyển thành <em> sau khi clean
        } else if (format === 'link') {
            const url = prompt("Nhập URL liên kết:", "https://");
            if (!url) return;
            document.execCommand('createLink', false, url);
        }

        updateOutputHTML();
    };
});
