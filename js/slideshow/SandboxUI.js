function SandboxUI(container) {
  var self = this;
  self.container = container;
  self.container.classList.add("sandbox_ui");

  //////////////////////
  // Slider //
  //////////////////////

  var contagionLabel = document.createElement("div");
  var contagionInput = document.createElement("input");
  contagionInput.type = "range";
  contagionInput.min = 5;
  contagionInput.max = 15;
  contagionInput.step = 1;
  contagionInput.value = 7;
  contagionInput.oninput = function() {
    _updateContagion();
  };
  contagionInput.ontouchstart = function(event) {
    event.stopPropagation(); // AHHHH MOBILE
  };
  contagionInput.ontouchmove = function(event) {
    event.stopPropagation(); // AHHHH MOBILE
  };
  var _labelContagion0 = getWords("sandbox_contagion");
  var _updateContagion = function() {
    // update sim
    var contagion = contagionInput.value;
    slideshow.simulations.sims[0].contagion = contagion;

    // update label
    var label = _labelContagion0 + " ";
    label += contagion;
    // label += "(" + (contagion == 0 ? _labelContagion1 : _labelContagion2) + ")";
    contagionLabel.innerHTML = label;
  };
  container.appendChild(contagionLabel);
  container.appendChild(contagionInput);
  setTimeout(function() {
    _updateContagion();
  }, 1);

  // var toolChooserLabel = document.createElement("div");
  // toolChooserLabel.innerHTML = getWords("sandbox_tool_chooser");
  // toolChooserLabel.style.marginTop = "0.25em";
  // var tools = ["pencil", "add", "add_infected", "move", "delete", "clear"];
  // var toolChooser = new ChooseOne({
  //   options: tools,
  //   makeButton: function(value) {
  //     var button = document.createElement("div");
  //     button.className = "choose_tool";

  //     // Icon
  //     var buttonImage = document.createElement("div");
  //     button.appendChild(buttonImage);
  //     buttonImage.id = "icon";
  //     var frame = tools.indexOf(value);
  //     buttonImage.style.backgroundPosition = -16 * frame + "px 0px";

  //     // Label
  //     var buttonLabel = document.createElement("span");
  //     button.appendChild(buttonLabel);
  //     buttonLabel.innerHTML = getWords("sandbox_tool_" + value);

  //     return button;
  //   },
  //   oninput: function(value) {
  //     // update sim
  //     var sandbox_state = tools.indexOf(value);
  //     slideshow.simulations.sims[0].connectorCutter.sandbox_state = sandbox_state;
  //   }
  // });
  // container.appendChild(toolChooserLabel);
  // container.appendChild(toolChooser.dom);

  ////////////////////////
  // Keyboard Shortcuts //
  ////////////////////////

  var shortcutsLabel = document.createElement("div");
  shortcutsLabel.innerHTML = getWords("sandbox_shortcuts_label");
  shortcutsLabel.id = "sandbox_shortcuts_label";
  shortcutsLabel.style.marginTop = "0.5em";
  shortcutsLabel.style.lineHeight = "1.2em";
  var shortcuts = document.createElement("div");
  shortcuts.innerHTML = getWords("sandbox_shortcuts");
  shortcuts.id = "sandbox_shortcuts";
  container.appendChild(shortcutsLabel);
  container.appendChild(shortcuts);

  // HEY IT'S SANDBOX MODE //
  slideshow.simulations.sims[0].SANDBOX_MODE = true;
}

function ChooseOne(config) {
  var self = this;

  // Container
  self.dom = document.createElement("div");
  self.dom.className = "choose_one";

  // Make Buttons
  var buttons = [];
  config.options.forEach(function(option) {
    var buttonConfig = option; //.button;
    var value = option; //.value;

    // New Button
    var buttonDOM = config.makeButton(buttonConfig);
    self.dom.appendChild(buttonDOM);
    buttons.push(buttonDOM);

    // On Input
    buttonDOM.onclick = function() {
      publish("sound/button");
      self.highlight(buttonDOM); // highlight
      config.oninput(value); // input
    };
    _stopPropButton(buttonDOM);
  });

  // Highlight
  self.highlight = function(toHighlight) {
    buttons.forEach(function(button) {
      button.removeAttribute("selected");
    });
    toHighlight.setAttribute("selected", true);
  };
  self.highlight(buttons[0]); // highlight 1st one always, whatever
}
