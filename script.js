// script.js

const inputDiv = document.getElementById("inputText");
const outputArea = document.getElementById("outputHTML");

function updateHTML() {
    let html = "";
    const childNodes = inputDiv.childNodes;

    childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            const lines = node.textContent.split("\n");
            lines.forEach((line) => {
                if (line.trim() !== "") {
                    html += `<p>${escapeHTML(line)}</p>`;
                }
            });
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            html += node.outerHTML;
        }
    });

    // Clean up nested block tags like <div><p>text</p></div>
    html = html.replace(/<div><p>/g, '<p>')
               .replace(/<\/p><\/div>/g, '</p>');

    outputArea.value = html;
}

function escapeHTML(text) {
    const div = document.createElement("div");
    div.innerText = text;
    return div.innerHTML;
}

inputDiv.addEventListener("input", updateHTML);

inputDiv.addEventListener("paste", function (e) {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData("text/plain");
    document.execCommand("insertText", false, text);
});

function applyFormat(command, value = null) {
    document.execCommand(command, false, value);
    updateHTML();
}

function wrapWithHeading(level) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    const content = range.extractContents();
    const heading = document.createElement(`h${level}`);
    heading.appendChild(content);
    range.insertNode(heading);
    selection.removeAllRanges();
    selection.addRange(range);
    updateHTML();
}

function wrapWithList() {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const content = range.extractContents();
    const listItems = content.textContent
        .split("\n")
        .filter(line => line.trim() !== "")
        .map(line => `<li>${escapeHTML(line)}</li>`)
        .join("");

    const ul = document.createElement("ul");
    ul.innerHTML = listItems;
    range.deleteContents();
    range.insertNode(ul);
    updateHTML();
}
