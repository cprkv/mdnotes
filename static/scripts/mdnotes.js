window.addEventListener("load", onPageLoad);

function onPageLoad() {
  $('[data-toggle="tooltip"]').tooltip();

  const mdText = $("#md-text").text();
  if (mdText) {
    createMdConverter();
    $("#md-render").html(mdConverter.makeHtml(mdText));
    const mdHeader = $("#md-render > :header:first-child").text();
    if (mdHeader.length) {
      document.title = mdHeader;
    }
  }

  const editorEl = $("#editor");
  if (editorEl.length) {
    createEditor("editor");
  }
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

function createEditor(element) {
  window.editor = ace.edit(element, {
    theme: "ace/theme/textmate",
    mode: "ace/mode/markdown",
    autoScrollEditorIntoView: true,
    maxLines: 100,
    tabSize: 2,
    // useSoftTabs: true,
    // useWrapMode: true,
  });
  // #editor-delete
  // #editor-cancel
  // #editor-save

  showError("aboba");

  $("#editor-save").click(function () {
    // alert("Handler for .click() called.");
    console.log("saving...");
    const content = editor.getValue();
    const query = new URLSearchParams(location.search);
    const path = query.get("p");
    if (!path || path.length == 0) {
      return showError("path empty");
    }
  });
}

function showError(error) {
  $("#error-name").text(`error happend at ${new Date().toISOString()}:`);
  $("#error-details").text(error);
  $("#errors").css("display", "block");
}
