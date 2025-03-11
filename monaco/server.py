from flask import Flask, render_template

app = Flask(__name__, template_folder=".")  # Set current directory as template folder

@app.route("/")
def home():
    return render_template("index.html")  # Serve index.html

if __name__ == "__main__":
    app.run(debug=True, port=8000)  # Run on port 8000 with hot reloading
