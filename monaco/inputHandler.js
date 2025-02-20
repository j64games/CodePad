
window.updateMonacoEditor = function(data) {
    if (window.editor) {
        const currentValue = window.editor.getValue();
        window.editor.setValue(currentValue + "\n" + data); // Append data to the editor
    }
};

// Example: Send data to C++ backend
function sendToCpp(data) {
    console.log("From js, called sendToCpp");
    window.sendToMonaco(data).then(response => {
        console.log("Response from C++:", response);
    });
}

window.addEventListener("gamepadconnected", (e) => {
    const gp = navigator.getGamepads()[e.gamepad.index];
    console.log(
        `Gamepad connected at index ${gp.index}: ${gp.id} with ${gp.buttons.length} buttons, ${gp.axes.length} axes.`,
    );
});


window.addEventListener("gamepaddisconnected", (e) => {
    console.log(
        "Gamepad disconnected from index %d: %s",
        e.gamepad.index,
        e.gamepad.id,
    );
});

// Function to check if a button is pressed
function buttonPressed(gamepad, buttonIndex) {
    if (gamepad.buttons[buttonIndex].pressed) {
        return true;
    }
    return false;
}

// Function to update gamepad state
function update() {
    const gamepads = navigator.getGamepads();
    for (const gamepad of gamepads) {
        if (gamepad) {
            // Check Button 0 (A button)
            if (buttonPressed(gamepad, 0)) {
                editor.setValue("Button 0 pressed!"); // Insert text into editor
            }

            // Check Button 1 (B button)
            if (buttonPressed(gamepad, 1)) {
                editor.setValue("Button 1 pressed!"); // Insert text into editor
            }

            // Check axes (e.g., left joystick)
            if (Math.abs(gamepad.axes[0]) > 0.1) {
                const currentPosition = editor.getPosition();
                const newPosition = {
                    lineNumber: currentPosition.lineNumber,
                    column: currentPosition.column + Math.round(gamepad.axes[0])
                };
                editor.setPosition(newPosition); // Move cursor
            }
        }
    }
    requestAnimationFrame(update); // Continue polling
}