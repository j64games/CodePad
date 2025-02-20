cmake_minimum_required(VERSION 3.30)
project(Editor)

set(CMAKE_CXX_STANDARD 20)

add_subdirectory(webview)

add_executable(Editor main.cpp)

target_include_directories(Editor PRIVATE ${CMAKE_SOURCE_DIR}/webview)

if (WIN32)
    target_link_libraries(Editor PRIVATE webview::core)
elseif (APPLE)
    target_link_libraries(Editor PRIVATE webview::core "-framework WebKit")
elseif (UNIX AND NOT APPLE)
    target_link_libraries(Editor PRIVATE webview::core)
endif()