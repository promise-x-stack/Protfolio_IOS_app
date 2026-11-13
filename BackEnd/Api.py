from flask import Flask, request, render_template, jsonify
import json
from Modules import message
from flask_cors import CORS

app=Flask(__name__)
CORS(app)

@app.route("/", methods=["GET"])
def Home():
    return render_template("Landing_Page.html")


@app.route("/api/products", methods=["GET"])
def product():
    if request.method == "GET":
        ######################################
        with open(".json/products.json","r",encoding="utf-8") as f:
            data=json.load(f)
            f.close()
        try:
            return jsonify(data), 200
        except Exception as e:
            return jsonify({"Error":f"Error: {e}"}), 500


@app.route("/api/products/entertainment", methods=["GET"])
def entertainment_product():
    if request.method == "GET":
        ######################################
        with open(".json/entertainment.json","r",encoding="utf-8") as f:
            data=json.load(f)
            f.close()
        try:
            return jsonify(data), 200
        except Exception as e:
            return jsonify({"Error":f"Error: {e}"}), 500
        

@app.route("/api/products/community", methods=["GET"])
def community_product():
    if request.method == "GET":
        ######################################
        with open(".json/comunity.json","r",encoding="utf-8") as f:
            data=json.load(f)
            f.close()
        try:
            return jsonify(data), 200
        except Exception as e:
            return jsonify({"Error":f"Error: {e}"}), 500
        

@app.route("/api/products/portfolio", methods=["GET"])
def portfolio_product():
    if request.method == "GET":
        ######################################
        with open(".json/portfolio.json","r",encoding="utf-8") as f:
            data=json.load(f)
            f.close()
        try:
            return jsonify(data), 200
        except Exception as e:
            return jsonify({"Error":f"Error: {e}"}), 500
        

@app.route("/api/products/productivity", methods=["GET"])
def productivity_product():
    if request.method == "GET":
        ######################################
        with open(".json/productivity.json","r",encoding="utf-8") as f:
            data=json.load(f)
            f.close()
        try:
            return jsonify(data), 200
        except Exception as e:
            return jsonify({"Error":f"Error: {e}"}), 500


@app.route("/message-user-data", methods=["POST"])
def Message():
    if request.method=="POST":
        data=request.get_json()
        user=data.get("userMassege")
        try:
            with open(".json/masege.json","w") as f:
                ######################
                json.dump(user,f ,indent=3)
                f.close()
            return jsonify({"Responce":"Masege Data recived"}), 200

        except Exception as e:
            return jsonify({"Error":f"Error: {e}"}), 500

    
    
@app.route("/mail-user-data", methods=["POST"])
def Mails():
    if request.method=="POST":
        data=request.get_json()
        new_data=data.get("email")
        try:
            with open(".json/email.json","w") as f:
                #######################
                json.dump(new_data, f, indent=3)
                f.close()
            return jsonify({"Response":"Email data recived"}), 200

        except Exception as e:
            return jsonify({"Error":f"Error: {e}"}), 500
        
    

@app.route("/Gui", methods=["GET"])
def Gui():
    if request.method=="GET":
        file_path = message.Message(".json/masege.json")
        data = file_path.file_r()
        no=len(data)
        return render_template("Gui.html",data=data, num=no)


if __name__ == "__main__":
    app.run(
        debug=True
    )