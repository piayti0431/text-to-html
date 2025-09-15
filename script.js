const inputDiv = document.getElementById("inputText");
const outputTextarea = document.getElementById("outputHTML");

// Bắt sự kiện paste
inputDiv.addEventListener("paste", function (e) {
    e.preventDefault();

    const clipboardData = (e.clipboardData || window.clipboardData);
    const htmlData = clipboardData.getData("text/html");
    const textData = clipboardData.getData("text/plain");

    if (htmlData) {
        // Nếu là nội dung có định dạng từ Word, Google Docs, v.v.
        const cleanedHTML = sanitizeHTML(htmlData);
        pasteHtmlAtCaret(cleanedHTML);
    } else {
        // Nếu là text thường
        document.execCommand("insertText", false, textData);
    }

    setTimeout(updateOutput, 100); // Delay nhỏ để cập nhật đúng
});

// Hàm dán HTML tại vị trí con trỏ
function pasteHtmlAtCaret(html) {
    const sel = window.getSelection();
    if (!sel.rangeCount) return;

    const range = sel.getRangeAt(0);
    range.deleteContents();

    const el = document.createElement("div");
    el.innerHTML = html;

    const frag = document.createDocumentFragment();
    let node;
    while ((node = el.firstChild)) {
        frag.appendChild(node);
    }

    range.insertNode(frag);
    sel.collapseToEnd();
}

// Hàm loại bỏ các thẻ không mong muốn như <div>, giữ lại <strong>, <em>, <h1>, <ul>, v.v.
function sanitizeHTML(input) {
    const allowedTags = ['p', 'ul', 'ol', 'li', 'strong', 'em', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'br'];
    const div = document.createElement("div");
    div.innerHTML = input;

    const removeDisallowed = (node) => {
        const children = Array.from(node.childNodes);
        children.forEach(child => {
            if (child.nodeType === 1) {
                // Nếu là element
                if (!allowedTags.includes(child.tagName.toLowerCase())) {
                    const fragment = document.createDocumentFragment();
                    while (child.firstChild) {
                        fragment.appendChild(child.firstChild);
                    }
                    node.replaceChild(fragment, child);
                } else {
                    removeDisallowed(child); // Đệ quy
                }
            }
        });
    };

    removeDisallowed(div);
    return div.innerHTML;
}

// Cập nhật kết quả HTML trong textarea output
function updateOutput() {
    const html = inputDiv.innerHTML
        .replace(/\s?data-[^=]+="[^"]*"/g, '') // xóa thuộc tính không cần thiết
        .replace(/ style="[^"]*"/g, '');       // xóa style inline
    outputTextarea.value = html.trim();
}
