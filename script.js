// script.js

// DOM element references
const inputDiv = document.getElementById("inputText");
const outputTextarea = document.getElementById("outputHTML");

// Convert contenteditable input to clean HTML
function updateOutputHTML() {
    let html = inputDiv.innerHTML;

    // Clean up content and convert to semantic HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    // Convert common formatting
    cleanFormatting(tempDiv);

    // Ensure semantic tags for headers/lists
    detectHeadings(tempDiv);
    wrapListItems(tempDiv);

    // Return cleaned innerHTML
    outputTextarea.value = tempDiv.innerHTML.trim();
}

// Wrap headings if starting with "heading 1", "heading 2", etc.
function detectHeadings(container) {
    const lines = container.innerHTML.split(/<br\s*\/?>(?!<br)/i);
    container.innerHTML = "";

    lines.forEach(line => {
        const match = line.match(/^heading\s?(\d)\s?(.*)/i);
        if (match) {
            const level = match[1];
            const text = match[2];
            container.innerHTML += `<h${level}><strong>${text}</strong></h${level}>`;
        } else {
            container.innerHTML += `<p>${line.trim()}</p>`;
        }
    });
}

// Format bold, italic, etc.
function cleanFormatting(container) {
    const replaceTags = {
        B: "strong",
        I: "em",
        STRONG: "strong",
        EM: "em"
    };

    Object.entries(replaceTags).forEach(([oldTag, newTag]) => {
        const elements = container.getElementsByTagName(oldTag);
        while (elements.length > 0) {
            const el = elements[0];
            const newEl = document.createElement(newTag);
            newEl.innerHTML = el.innerHTML;
            el.parentNode.replaceChild(newEl, el);
        }
    });
}

// Convert <p><li>...</li></p> to <ul><li>...</li></ul>
function wrapListItems(container) {
    const lis = container.querySelectorAll("li");
    if (lis.length > 0) {
        const ul = document.createElement("ul");
        lis.forEach(li => {
            ul.appendChild(li.cloneNode(true));
            li.remove();
        });
        container.appendChild(ul);
    }
}

// Apply formatting
function applyFormat(type) {
    document.execCommand("styleWithCSS", false, false);

    if (type === "bold") {
        document.execCommand("bold", false, null);
    } else if (type === "italic") {
        document.execCommand("italic", false, null);
    } else if (type === "uppercase") {
        changeCase("upper");
    } else if (type === "capitalize") {
        changeCase("capitalize");
    } else if (type === "link") {
        const url = prompt("Nhập URL:");
        if (url) {
            document.execCommand("createLink", false, url);
        }
    }

    updateOutputHTML();
}

// Change text case
function changeCase(mode) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    if (!selectedText) return;

    let newText = mode === "upper"
        ? selectedText.toUpperCase()
        : selectedText.replace(/\b\w/g, c => c.toUpperCase());

    const span = document.createElement("span");
    span.textContent = newText;
    range.deleteContents();
    range.insertNode(span);
}

// Custom button: insert H2
function wrapWithHeading(level) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    if (!selectedText) return;

    const wrapper = document.createElement(`h${level}`);
    const strong = document.createElement("strong");
    strong.textContent = selectedText;
    wrapper.appendChild(strong);

    range.deleteContents();
    range.insertNode(wrapper);

    updateOutputHTML();
}

// Convert pasted rich text
inputDiv.addEventListener("paste", function (e) {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData("text/plain");
    document.execCommand("insertText", false, text);
    setTimeout(updateOutputHTML, 0);
});

// Detect input changes
inputDiv.addEventListener("input", updateOutputHTML);
document.addEventListener("DOMContentLoaded", updateOutputHTML);
