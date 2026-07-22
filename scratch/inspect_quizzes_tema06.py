import json

filepath = "src/data/quizzes.json"

with open(filepath, "r", encoding="utf-8-sig") as f:
    data = json.load(f)

print(f"Data type of quizzes.json: {type(data)}")
if isinstance(data, dict):
    print(f"Keys: {list(data.keys())[:10]}")
    for k in list(data.keys())[:5]:
        v = data[k]
        print(f"Key {k} -> type {type(v)}, len {len(v) if hasattr(v, '__len__') else 'N/A'}")
elif isinstance(data, list):
    print(f"List length: {len(data)}, first element: {data[0]}")
