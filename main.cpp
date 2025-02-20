#include <iostream>

#include <webview.h>


int main() {

    // Create a WebView window
    webview::webview w(true, nullptr);
    w.set_title("Monaco Editor with Game Controller");
    w.set_size(800, 600, WEBVIEW_HINT_NONE);

    w.navigate("http://localhost:8000/index.html");

    w.bind("sendToSDL", [&](std::string s) -> std::string {
        std::cout << "Received " << s << std::endl;
        return "Received";
    });

    w.bind("sendToMonaco", [&](std::string data) -> std::string {
        std::cout << "Received data from JavaScript: " << data << std::endl;

        // Send data to Monaco Editor
        std::string jsCode = "updateMonacoEditor('" + data + "');";
        w.eval(jsCode); // Execute JavaScript code in the WebView

        return "Data sent to Monaco Editor";
    });

    //Probably the only way to debug the window of webview
    w.bind("log", [](std::string message) -> std::string {
        std::cout << "JavaScript Log: " << message << std::endl;
        return "";
    });

    w.bind("error", [](std::string message) -> std::string {
        std::cerr << "JavaScript Error: " << message << std::endl;
        return "";
    });

    // Main loop
    bool running = true;
    while (running) {

        w.run();
    }

    return 0;
}
