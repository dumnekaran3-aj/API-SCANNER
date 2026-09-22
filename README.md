# 🛡 VulnCheck — Mini Web Vulnerability Scanner

A Bash-based security scanning toolkit built to test web applications (APIs, servers) for common security misconfigurations — built from scratch as a shell scripting + web security learning project.

> ⚠️ **Disclaimer**: This tool is built strictly for **authorized security testing** — use it only on systems you own or have explicit permission to test (e.g. your own localhost / staging environment). Do not use it against any system without permission.

---

## 📌 What Is This Project?

VulnCheck is a collection of Bash scripts that automate common steps a security researcher takes when testing a web application:

1. **Checking which network ports are open** on a server
2. **Scanning API endpoints** to see which ones are publicly accessible, which require authentication, and which are leaking sensitive data
3. **Detecting IDOR (Insecure Direct Object Reference) bugs** — checking whether an API exposes other users' data just by changing an ID in the URL

It was built entirely using core Bash scripting concepts — variables, loops, conditionals, functions, arrays, and Unix text-processing tools (`grep`, `curl`, `jq`) — with no external hacking frameworks. The goal was to understand *how* automated vulnerability scanners work internally, by building simplified versions of the same logic.

---

## 🎯 Why This Project / What Problem It Solves

Modern web apps (like MERN-stack apps — React + Node/Express + MongoDB) commonly suffer from a few repeat security mistakes:

- Debug/admin routes accidentally left public in production
- APIs returning sensitive fields (passwords, tokens, API keys) in responses
- Missing authentication checks on protected routes
- IDOR bugs — one logged-in user able to view another user's private data by changing an ID in the URL

Manually checking every endpoint of an application for these issues is slow and error-prone. VulnCheck automates this — point it at a target, and it tells you exactly which endpoints are risky and why.

---

## 🧩 Components

| Script | Purpose |
|---|---|
| `api-scanner.sh` | Scans a list of API endpoints, shows live response content for public ones, flags authenticated ones (401/403) without exposing their data, and detects sensitive-data leaks |
| `vulncheck-web.sh` | Combined tool: Port Scan + API Scan + IDOR Scan, controlled via command-line flags (built for automation / backend integration) |
| `server.js` + `index.html` | Optional web dashboard — a simple Node/Express + HTML frontend that triggers the scans from a browser button instead of the terminal |

---

## ⚙️ How It Works (Under the Hood)

### 1. Port Scanner
Uses Bash's built-in `/dev/tcp` feature (no external tools like `nmap` required) to attempt a TCP connection to common ports (22, 80, 443, 3306, 8080, etc.) on the target host. If the connection succeeds, the port is open.

```bash
timeout 2 bash -c "echo > /dev/tcp/$host/$port" 2>/dev/null
```

### 2. API Endpoint Scanner
Uses `curl` to send a request to each endpoint and reads the HTTP status code:

| Status Code | Meaning in the Scanner |
|---|---|
| `200` | Publicly accessible — content is displayed |
| `401` / `403` | Authentication required — flagged, content is **not** shown |
| `404` | Endpoint does not exist |

The response body of any `200` endpoint is also scanned with `grep` for sensitive keywords (`password`, `token`, `apiKey`, `secret`, `balance`, etc.) to catch accidental data leaks — and pretty-printed with `jq` if it's JSON.

### 3. IDOR Scanner
Iterates through a range of numeric IDs (e.g. 1–10) against an endpoint pattern like `/api/user/{id}`, and checks whether each response contains another user's private data — without any authentication or ownership check. If it does, that's a textbook IDOR vulnerability (OWASP Top 10 — Broken Access Control).

---

## 🚀 How to Run

### Requirements
- A Linux/WSL/macOS terminal with Bash
- `curl` installed (usually pre-installed)
- `jq` installed for pretty-printed JSON output *(optional but recommended)*:
  ```bash
  sudo apt install jq -y
  ```
- Node.js + npm *(only needed if using the optional web dashboard)*

### Option A — Run the API Scanner (interactive, terminal-based)

```bash
chmod +x api-scanner.sh
./api-scanner.sh
```

You'll be prompted for:
- **Target base URL** — e.g. `http://localhost:8000`
- **Endpoints** — comma-separated (e.g. `/api/health,/api/admin`), or leave blank to use a built-in default list

### Option B — Run the Combined Scanner via Flags (automation-friendly)

```bash
chmod +x vulncheck-web.sh
./vulncheck-web.sh -m 4 -H localhost -u http://localhost:8000 -i http://localhost:8000/api/user -r 10
```

Flags:
| Flag | Meaning |
|---|---|
| `-m` | Mode: `1`=Port Scan, `2`=API Scan, `3`=IDOR Scan, `4`=Full Scan |
| `-H` | Target host (for port scan) |
| `-u` | Target base URL (for API scan) |
| `-i` | IDOR endpoint base (e.g. `.../api/user`, IDs get appended) |
| `-r` | ID range to test for IDOR scan |

### Option C — Run via Web Dashboard (optional)

```bash
npm init -y
npm install express
node server.js
```
Then open `http://localhost:4000` in a browser, select a scan mode, and click **Run Scan**.

---

## 🧪 Example Test Setup

To test the tool yourself, spin up a small Express server (`localhost:8000`) with a few sample routes:
- `/api/health` → returns `{"msg": "server is healthy"}` (safe, public)
- `/api/config` → returns `{"apiKey": "sk-12345-secret"}` (intentionally leaky, for demo)
- `/api/user/:id` → returns user data by ID with no ownership check (intentionally vulnerable, for IDOR demo)

Run the scanner against it and observe how each case is correctly classified.

---

## 🛠 Tech Used

- **Bash** — core scripting (all 3 scanning modules)
- **curl** — HTTP requests
- **grep** — pattern/keyword matching
- **jq** — JSON formatting
- **Node.js + Express** *(optional)* — backend API to trigger scans from a browser
- **HTML/CSS/JS** *(optional)* — simple frontend dashboard

---

## 📈 Possible Future Improvements

- Export scan results as a PDF/HTML report
- Add rate-limiting bypass testing
- Add JWT token analysis module (decode and inspect payload for exposed sensitive data)
- Multi-threaded scanning for faster results on large endpoint lists

---

## 👤 Author

Built by Karan as a hands-on shell scripting + web application security learning project — combining Bash automation with OWASP Top 10 concepts (Broken Access Control, Sensitive Data Exposure) applied to a real Node/Express test environment.
