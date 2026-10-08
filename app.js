(function () {
  "use strict";

  var contactEmail = "hello@starstart.world";
  var formFields = {
    support: {
      title: "Thoughtful customer reply",
      input: "A customer’s order arrived two days late and the ceramic mug is chipped. They love the design and ask if we can send a replacement before Friday. Our policy: apologize, offer a replacement at no charge, and don’t promise a delivery date until the warehouse confirms.",
      preview: [
        "<p><strong>Next step</strong> — Prepare a no-charge replacement and ask the warehouse to confirm its dispatch window.</p>",
        "<p><strong>Draft reply</strong> — “I’m sorry your mug arrived chipped and that your order was late. I’m arranging a replacement at no charge. I’ll confirm the delivery timing as soon as our warehouse gets back to me.”</p>"
      ].join(""),
      example: "A customer’s order arrived two days late and the ceramic mug is chipped. They love the design and ask if we can send a replacement before Friday. Our policy: apologize, offer a replacement at no charge, and don’t promise a delivery date until the warehouse confirms."
    },
    meeting: {
      title: "Clear meeting follow-up",
      input: "Notes from the product sync: Maya will share revised onboarding copy by Thursday. Luis will check the analytics event for invited teammates. We need to decide if the launch guide includes a video; Sam to draft two options by Monday. We have not picked a launch date yet.",
      preview: [
        "<p><strong>Actions found</strong> — Maya: onboarding copy by Thursday. Luis: check the teammate invite event. Sam: prepare two launch guide options by Monday.</p>",
        "<p><strong>Open question</strong> — The team has not decided whether the guide needs a video. No launch date was agreed.</p>"
      ].join(""),
      example: "Notes from the product sync: Maya will share revised onboarding copy by Thursday. Luis will check the analytics event for invited teammates. We need to decide if the launch guide includes a video; Sam to draft two options by Monday. We have not picked a launch date yet."
    },
    lead: {
      title: "A personal first touch",
      input: "A new lead from a two-person design studio asks whether our workflow tool can help turn interview notes into consistent project briefs. They use Notion today, have one client kickoff next week, and asked for a short explanation before booking a call. Don’t claim we have a Notion integration.",
      preview: [
        "<p><strong>Useful context</strong> — Small design studio, uses Notion, preparing for a client kickoff next week.</p>",
        "<p><strong>Suggested reply</strong> — Thank them for the specific use case. Explain how structured steps could turn interview notes into a reviewable brief, be transparent that a Notion integration is not available yet, and invite them to share a sample workflow.</p>"
      ].join(""),
      example: "A new lead from a two-person design studio asks whether our workflow tool can help turn interview notes into consistent project briefs. They use Notion today, have one client kickoff next week, and asked for a short explanation before booking a call. Don’t claim we have a Notion integration."
    }
  };

  var input = document.getElementById("demo-input");
  var title = document.getElementById("demo-title");
  var output = document.getElementById("output-text");
  var outputMode = document.getElementById("output-mode");
  var characterCount = document.getElementById("character-count");
  var runButton = document.getElementById("run-demo");
  var selectedScenario = "support";
  var connected = false;
  var toastTimer;

  function showToast(message) {
    var toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 2800);
  }

  function updateCharacterCount() {
    characterCount.textContent = input.value.length.toLocaleString() + " / 1,400";
  }

  function setLiveState(isLive, model) {
    var liveStatus = document.querySelector(".demo-live-status");
    var label = document.getElementById("api-label");
    var modelNote = document.getElementById("model-note");
    connected = isLive;
    liveStatus.classList.toggle("is-live", isLive);
    label.textContent = isLive ? "Claude connected" : "Preview mode";
    modelNote.textContent = isLive ? "Live response · " + model : "Claude-powered when connected";
  }

  function checkConnection() {
    fetch("/api/status", { headers: { Accept: "application/json" } })
      .then(function (response) {
        if (!response.ok) throw new Error("Preview mode");
        return response.json();
      })
      .then(function (data) {
        setLiveState(Boolean(data.connected), data.model || "Claude");
      })
      .catch(function () {
        setLiveState(false, "");
      });
  }

  function chooseScenario(button) {
    var scenario = button.getAttribute("data-scenario");
    if (!formFields[scenario]) return;
    selectedScenario = scenario;
    document.querySelectorAll(".demo-step").forEach(function (item) {
      var active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-selected", active ? "true" : "false");
    });
    title.textContent = formFields[scenario].title;
    input.value = formFields[scenario].input;
    output.innerHTML = formFields[scenario].preview;
    outputMode.textContent = "SAMPLE PREVIEW";
    outputMode.classList.remove("is-live");
    updateCharacterCount();
  }

  function renderResponse(data) {
    var responseText = typeof data.text === "string" ? data.text.trim() : "";
    if (!responseText) throw new Error("The response was empty.");
    var safe = responseText
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    output.innerHTML = "<p>" + safe.replace(/\n/g, "<br>") + "</p>";
    outputMode.textContent = "LIVE · CLAUDE";
    outputMode.classList.add("is-live");
  }

  function runWorkflow() {
    var prompt = input.value.trim();
    if (!prompt) {
      showToast("Add a little context before running this workflow.");
      input.focus();
      return;
    }
    if (prompt.length > 1400) {
      showToast("Keep your preview under 1,400 characters.");
      return;
    }

    runButton.classList.add("is-busy");
    runButton.disabled = true;
    runButton.innerHTML = "Thinking it through <span aria-hidden=\"true\">…</span>";

    if (connected) {
      fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ scenario: selectedScenario, input: prompt })
      })
        .then(function (response) {
          return response.json().then(function (data) {
            if (!response.ok) throw new Error(data.error || "Claude could not complete this workflow.");
            return data;
          });
        })
        .then(function (data) {
          renderResponse(data);
        })
        .catch(function (error) {
          showToast(error.message || "Claude could not complete this workflow.");
        })
        .finally(resetRunButton);
      return;
    }

    window.setTimeout(function () {
      output.innerHTML = formFields[selectedScenario].preview;
      outputMode.textContent = "SAMPLE PREVIEW";
      outputMode.classList.remove("is-live");
      showToast("Showing a sample response. Add a Claude API key to enable live runs.");
      resetRunButton();
    }, 720);
  }

  function resetRunButton() {
    runButton.classList.remove("is-busy");
    runButton.disabled = false;
    runButton.innerHTML = "Run workflow <span aria-hidden=\"true\">↗</span>";
  }

  function copyDraft() {
    var text = output.innerText.trim();
    if (!navigator.clipboard || !window.isSecureContext) {
      showToast("Select the draft text and copy it from the preview.");
      return;
    }
    navigator.clipboard.writeText(text)
      .then(function () {
        showToast("Draft copied to your clipboard.");
      })
      .catch(function () {
        showToast("Your browser could not copy the draft.");
      });
  }

  function setupNavigation() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.getElementById("site-nav");
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
      nav.classList.toggle("is-open", open);
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open navigation");
        nav.classList.remove("is-open");
      });
    });
  }

  function setupContact() {
    var dialog = document.getElementById("contact-dialog");
    var form = document.getElementById("contact-form");
    document.getElementById("open-contact").addEventListener("click", function () {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "open");
    });
    dialog.querySelector(".dialog-close").addEventListener("click", function () {
      dialog.close();
    });
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) dialog.close();
    });
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;
      var formData = new FormData(form);
      var name = String(formData.get("name") || "").trim();
      var email = String(formData.get("email") || "").trim();
      var note = String(formData.get("note") || "").trim();
      var subject = encodeURIComponent("Early access conversation — StarStart");
      var body = encodeURIComponent(
        "Hi StarStart,\n\nI’d like to join the early conversation.\n\n" +
        "Name: " + name + "\nWork email: " + email + "\n\n" +
        "What I’m building / a workflow I’d like help with:\n" + note + "\n"
      );
      window.location.href = "mailto:" + contactEmail + "?subject=" + subject + "&body=" + body;
      dialog.close();
      showToast("Your email app should open with a note ready to send.");
    });
  }

  document.querySelectorAll(".demo-step").forEach(function (button) {
    button.addEventListener("click", function () { chooseScenario(button); });
  });
  input.addEventListener("input", updateCharacterCount);
  runButton.addEventListener("click", runWorkflow);
  document.getElementById("copy-output").addEventListener("click", copyDraft);
  setupNavigation();
  setupContact();
  updateCharacterCount();
  checkConnection();
})();

