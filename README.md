# Virtual Performance Manager (Flask Version)

A lightweight, monolithic version of the Virtual CEM application using **Flask**, **Vanilla JavaScript**, and **Tailwind CSS**.

## Architecture
- **Backend**: Flask (Python) serves HTML templates and proxies API requests.
- **Frontend**: Plain HTML/JS (No Build Step).
- **Styling**: Tailwind CSS (via CDN).
- **Auth**: SAML 2.0 Service Provider (python3-saml).

## SAML 2.0 Setup
The application is configured as a Service Provider (SP). You must configure your Identity Provider (IdP) with the following settings:

| Parameter | Value |
| :--- | :--- |
| **Entity ID (Audience)** | `https://cem.mykaarma.com` |
| **ACS URL (Callback)** | `https://cem.mykaarma.com/login/saml/callback` |
| **Logout URL** | `https://cem.mykaarma.com/logout/callback` |
| **NameID Format** | `urn:oasis:names:tc:SAML:2.0:nameid-format:transient` |

### Required Attributes
Ensure your IdP maps the following attributes to the SAML assertion:
- `email` (User's email)
- `firstName` (User's first name)
- `lastName` (User's last name)
- `dealerUuid` (Vitally/Dealer UUID for context switching)

### Certificates
To complete the handshake, you must provide your IdP's x.509 certificate via an environment variable:
```bash
SAML_IDP_CERT="MIID..." # Single line, no headers
```
```
/
├── app.py              # Main Flask Application
├── templates/
│   └── index.html      # Main UI Layout
├── static/
│   ├── js/
│   │   ├── app.js      # UI Logic
│   │   ├── cem-data.js # Data Module
│   │   └── coach-service.js # Business Logic
│   └── img/            # Assets
└── requirements.txt    # Python Dependencies
```

## Running Locally

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure Environment**:
   Create a `.env` file (or set variables):
   ```
   VITALLY_API_TOKEN=your_token_here
   VITALLY_SUBDOMAIN=mykaarma
   SECRET_KEY=dev-key
   ```

3. **Run Server**:
   ```bash
   python app.py
   ```
   Access at `http://localhost:8080`

## Deployment

### Docker (Local Testing)
Build and run the container locally to verify production parity:
```bash
# Build
docker build -t vpm-flask .

# Run
docker run -p 8080:8080 --env-file .env vpm-flask
```

### Production
For full production deployment details (including Cloud Run, DNS, and SAML configuration), please refer to **[ENGINEERING_HANDOVER.md](ENGINEERING_HANDOVER.md)**.

## Troubleshooting

### Missing CEM Images
If images are not loading, ensure the `static/img` folder is populated. You can restore them from the original project source:
```powershell
New-Item -ItemType Directory -Force -Path "static\img"
Copy-Item "C:\Virtual CEM\CEM Pictures\*" -Destination "static\img\" -Force
Get-ChildItem "static\img" | Rename-Item -NewName { $_.Name -replace ' \(1\)', '' }
```
