from flask import Flask, render_template, send_from_directory

app = Flask(__name__, template_folder=".")  # Set current directory as template folder

@app.route("/")
def home():
    return render_template("index2.html")  # Serve index.html

# Static files route
@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)

@app.route("/ANTLR/<path:filename>")
def antlr_files(filename):
    return send_from_directory('ANTLR', filename)

if __name__ == "__main__":
    app.run(debug=True, port=8000)  # Run on port 8000 with hot reloading
