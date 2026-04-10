"""Quick smoke test for the /predict endpoint."""
import json
import urllib.request
from pathlib import Path

IMG = Path("tmp_test.jpg").read_bytes()
BOUNDARY = b"testboundary12345"

body = (
    b"--" + BOUNDARY + b"\r\n"
    b'Content-Disposition: form-data; name="file"; filename="tmp_test.jpg"\r\n'
    b"Content-Type: image/jpeg\r\n\r\n"
    + IMG
    + b"\r\n--" + BOUNDARY + b"--\r\n"
)

req = urllib.request.Request(
    "http://localhost:8000/predict",
    data=body,
    method="POST",
)
req.add_header("Content-Type", f"multipart/form-data; boundary={BOUNDARY.decode()}")

try:
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read())
        print(json.dumps(data, indent=2))
        print("\n✅ /predict endpoint working correctly!")
        print(f"   Crop: {data.get('crop')}")
        print(f"   Status: {data.get('status')}")
        print(f"   Disease: {data.get('disease')}")
        print(f"   Confidence: {data.get('confidence')}%")
        print(f"   Fallback: {'fallback::' in str(data.get('model_label', ''))}")
except urllib.error.HTTPError as e:
    print(f"HTTP Error {e.code}: {e.read().decode()}")
except Exception as e:
    print(f"Error: {e}")
