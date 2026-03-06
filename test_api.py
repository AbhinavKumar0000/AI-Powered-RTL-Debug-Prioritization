import requests
import json
import os

results = {}

def test_severity():
    url = "https://abhinavdread-rtl-log-severity-classifier-api.hf.space/predict_batch"
    headers = {"Content-Type": "application/json"}
    data = {"logs": [{"module": "AXI_CTRL", "message": "AXI burst length violation"}]}
    try:
        response = requests.post(url, headers=headers, json=data)
        results["severity"] = response.json()
    except Exception as e:
        results["severity"] = str(e)

def test_intelligence():
    url = "https://abhinavdread-rtl-log-intelligence-api.hf.space/analyze_log"
    headers = {"Content-Type": "application/json"}
    data = {"log_text": "AXI burst length violation"}
    try:
        response = requests.post(url, headers=headers, json=data)
        results["intelligence"] = response.json()
    except Exception as e:
        results["intelligence"] = str(e)

if __name__ == "__main__":
    test_severity()
    test_intelligence()
    with open("api_diag.json", "w") as f:
        json.dump(results, f, indent=2)
