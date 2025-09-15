document.addEventListener('DOMContentLoaded', function () {
    const inputDiv = document.getElementById('inputText');
    const outputHTML = document.getElementById('outputHTML');

    const allowedTags = ['STRONG', 'EM', 'U', 'A', 'BR'];

    // 🧼 Làm sạch HTML: giữ lại thẻ cần thiết
    function cleanNode(node) {
        const children = Array.from(node.childNodes);
        for (let child of children) {
            if (child.nodeType === Node.ELEMENT_NODE) {
                // Nếu không thuộc thẻ cho phép thì gỡ
                if (!allowedTags.includes(child.tagName)) {
                    const fragment = document.createDocumentFragment();
                    while (child.firstChild) {
                        fragment.appendChild(child.firstChild);
                    }
                    node.replaceChild(fragment, child);
                    cleanNode(node); // tiếp tục làm sạch
                } else {
                    // Xoá hết attribute (trừ href của a)
                    [...child.attributes].forEach(attr => {
                        if (child.tagName === 'A' && attr.name === 'href') return;
                        child.removeAttribute(attr.name);
                    });
                    cleanNode(child); // tiếp tục làm sạch trong
                }
            }
        }
    }

    // 🧾 Chuyển đổi nội dung đã clean thành HTML
    function convertToHTMLFromContentEditable(htmlContent) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;

        cleanNode(tempDiv); // dọn sạch HTML

        return tempDiv.innerHTML.trim(); // không chia dòng
    }

    // 🖥️ Cập nhật nội dung output
    function updateOutputHTML() {
        const html = convertToHTMLFromContentEditable(inputDiv.innerHTML);
        outputHTML.value = html;
    }

    // 🎯 Gõ trực tiếp: cập nhật ngay
    inputDiv.addEventListener('input', updateOutputHTML);

    // 🧩 Paste từ Google Docs hay MS Word
    inputDiv.addEventListener('paste', () => {
        // Delay nhẹ để đảm bảo nội dung được paste xong
        setTimeout(() => {
            updateOutputHTML();
        }, 50);
    });

    // 🎛️ Các nút định dạng
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
            document.execCommand('bold', false, null); // kết hợp với clean để ra <strong>
        } else if (format === 'italic') {
            document.execCommand('italic', false, null); // sẽ thành <em>
        } else if (format === 'link') {
            const url = prompt("Nhập URL liên kết:", "https://");
            if (url) {
                document.execCommand('createLink', false, url);
            }
        }

        // Sau mỗi thay đổi, cập nhật lại output
        updateOutputHTML();
    };
});
