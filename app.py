from flask import Flask, Response, request, jsonify, render_template
import json
import os

app = Flask(__name__)

path = "./store.json"
    
@app.get("/")
def index():
    return render_template("index.html")

@app.get("/get/<string:sortType>")
def get_data(sortType):
    with open(path, "r") as f:
        data = json.load(f)
        data_events = data['events']
        if len(data_events) > 0:
            sortedData = []
            if sortType == "date":
                sortedData = sorted(data_events, key=lambda k: k['endDate'])
            elif sortType == "priority":
                priorities = ["High", "Medium", "Low"];
                sortedData = sorted(data_events, key=lambda k: priorities.index(k['eventPriority']))
            data_events = sortedData
            data['events'] = data_events
            with open(path, "w") as f:
                json.dump(data, f)

    with open(path, "r") as f:
        if os.stat(path).st_size == 0:
            return Response(status=200)
        else:
            data = json.load(f)
            return jsonify(data)

@app.put("/set")
def set_data():
    requestData: dict = request.get_json()
    data = {}
    with open(path, "r") as f:
        if os.stat(path).st_size == 0:
            data = {'events': [requestData]}
        else:
            data: dict = json.load(f)
            data['events'].append(requestData)
    with open(path, "w") as f:        
        json.dump(data, f)
    return Response(status=200)

@app.delete("/delete/<int:id>")
def delete_data(id: int):
    with open(path, "r") as f:
        data: dict = json.load(f)
        for i in range(len(data['events'])):
            if i == id:
                del data['events'][i]
                break
        with open(path, "w") as f:        
            json.dump(data, f)
    return Response(status=200)

if __name__ == '__main__':
    app.run(debug=True, port=8000) #host='0.0.0.0',