#include <iostream>
#include <fstream>

#include <webview.h>


int main() {

    // Create a WebView window
    webview::webview w(true, nullptr);
    w.set_title("Monaco Editor with Game Controller");
    w.set_size(800, 600, WEBVIEW_HINT_NONE);

    w.navigate("file:///home/byamba/CLionProjects/Editor/monaco/index.html");

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

//    std::ifstream open_example("/home/byamba/CLionProjects/Editor/example.txt");
//
//    if (!open_example.is_open()) {
//        std::cerr << "Failed to open example.txt" << std::endl;
//        return 1;  // Exit the program if the file is not found
//    }
//
//    std::string file_text;
//    std::string line;
//
//    while(getline(open_example, line)){
//        file_text += line + "\n";
//        std::cout << "The Lines: " << line << "\t";
//    }
//
//    std::cout << "this is the file text:\n" << file_text << std::endl;
//    std::string jsCode = "updateMonacoEditor(`" + file_text + "`);";
//    w.eval(jsCode);
//    std::string text = "// Eat\n"
//                       "if (touch(Grass) == Below) { eat(Grass); }\n"
//                       "\n"
//                       "// Want to move?\n"
//                       "if (chance(0.25)) {\n"
//                       "  // Want to move, so decide a direction\n"
//                       "  int r = random(0, 4);\n"
//                       "  if (r == 0) {\n"
//                       "    // Don't do anything\n"
//                       "  } else if (r == 1) {\n"
//                       "    // Is there any grass north from us?\n"
//                       "    if (touch(Grass) == North) { move(North, 10); }\n"
//                       "  } else if (r == 2) {\n"
//                       "    // Is there any grass east from us?\n"
//                       "    if (touch(Grass) == East) { move(East, 10); }\n"
//                       "  } else if (r == 3) {\n"
//                       "    // Is there any grass south from us?\n"
//                       "    if (touch(Grass) == South) { move(South, 10); }\n"
//                       "  } else if (r == 4) {\n"
//                       "    // Is there any grass west from us?\n"
//                       "    if (touch(Grass) == West) { move(West, 10); }\n"
//                       "  }\n"
//                       "}";
//    w.eval("updateMonacoEditor('" + text + "');");
    w.eval("console.log(`heyoo`);");
    while (running) {

        w.run();
    }

    return 0;
}
