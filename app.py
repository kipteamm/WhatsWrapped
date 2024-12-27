from flask import Flask, request, render_template


app = Flask(__name__)
app.config["DEBUG"] = True


@app.get("/")
def index():
    return render_template("index.html")


@app.get("/results")
def results():
    return render_template("results.html")
    

@app.get("/privacy-policy")
def privacy_policy():
    return render_template("privavy_policy.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5020)
