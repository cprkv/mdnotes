window.addEventListener("load", onPageLoad);

function onPageLoad() {
  $('[data-toggle="tooltip"]').tooltip();
  $(".btn-tree").popover({ html: true });
  $(".add-dir-tree").each(function () {
    const el = $(this);
    const path = el.attr("mdnotes-path");
    const inputId = uid();
    const form = `
      <div class="form-inline">
        <input class="form-control form-control-sm" type="text" placeholder="name" id="${inputId}">
        <button class="btn btn-primary btn-sm" onclick="createDir('${path}', '${inputId}')">create</button>
      </div>
    `;
    el.attr("data-content", form);
  });
  $(".add-file-tree").each(function () {
    const el = $(this);
    const path = el.attr("mdnotes-path");
    const inputId = uid();
    const form = `
      <div class="form-inline">
        <input class="form-control form-control-sm" type="text" placeholder="name" id="${inputId}">
        <button class="btn btn-primary btn-sm" onclick="createFile('${path}', '${inputId}')">create</button>
      </div>
    `;
    el.attr("data-content", form);
  });
  createMdConverter();
  renderMarkdown();
  createEditor();
}

function createDir(path, inputId) {
  const name = $(`#${inputId}`).val();
  sendData("POST", `/dirs?p=${path}`, { name })
    .then(() => showSuccess("created!"))
    .catch(showError);
}

function createFile(path, inputId) {
  const name = $(`#${inputId}`).val();
  sendData("POST", `/files?p=${path}`, { name })
    .then(() => showSuccess("created!"))
    .catch(showError);
}

function createMdConverter() {
  window.mdConverter = new showdown.Converter({
    extensions: ["github"],
    emoji: true,
    simpleLineBreaks: true,
    tables: true,
    parseImgDimensions: true,
    headerLevelStart: 2,
  });
  mdConverter.setFlavor("github");
}

function renderMarkdown() {
  const mdText = $("#md-text").text();
  if (!mdText) {
    return;
  }

  $("#md-render").html(mdConverter.makeHtml(mdText));

  const mdHeader = $("#md-render > :header:first-child").text();
  if (mdHeader.length) {
    document.title = mdHeader;
  }

  $("table").each(function () {
    const el = $(this);
    if (!el.hasClass("table")) {
      el.addClass("table");
    }
  });

  $("blockquote").each(function () {
    const el = $(this);
    if (!el.hasClass("blockquote")) {
      el.addClass("blockquote");
    }
  });
}

function createEditor() {
  if (!$("#editor").length) {
    return;
  }
  window.editor = ace.edit("editor", {
    theme: "ace/theme/textmate",
    mode: "ace/mode/markdown",
    autoScrollEditorIntoView: true,
    maxLines: 100,
    tabSize: 2,
    // TODO: useSoftTabs: true,
    // TODO: useWrapMode: true,
  });

  // TODO: #editor-delete
  $("#editor-save").click(saveNote);
}

function showError(error) {
  console.error(error);
  showMessage("danger", "Error!", error);
}

function showSuccess(title, message) {
  console.log(title, message);
  showMessage("success", title, message);

  clearTimeout(window.closeSuccessTimeout);
  window.closeSuccessTimeout = setTimeout(() => {
    $(".alert-success").alert("close");
  }, 3000);
}

function showMessage(type, title, message) {
  if (typeof message !== "string") {
    message = JSON.stringify(message, null, 2);
  }

  const alertHtml = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      <strong>${title}</strong>${
    message ? `<pre class="mb-0">${message}</pre>` : ""
  }
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  `;
  $("#errors").append(alertHtml);
  $(".alert").alert();
}

function saveNote() {
  console.log("saving...");
  const content = editor.getValue();
  const query = new URLSearchParams(location.search);
  const path = query.get("p");
  if (!path || path.length == 0) {
    return showError("path empty");
  }

  sendData("PUT", `/edit?p=${path}`, { content })
    .then(() => showSuccess("saved!"))
    .catch(showError);
}

async function sendData(method, url, data) {
  const response = await fetch(url, {
    method,
    cache: "no-cache",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
}

function uid() {
  return (
    "i" + Date.now().toString(36) + Math.random().toString(36).substring(2)
  );
}
