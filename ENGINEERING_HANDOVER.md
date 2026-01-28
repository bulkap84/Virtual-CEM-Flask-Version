# myKaarma Integration Handover: Virtual Performance Manager (Flask Version)

This document contains the technical details required for the Head of Engineering to finalize the integration of the VPM application (Flask Edition) into the myKaarma ecosystem.

## 1. Custom Domain Configuration (DNS)
To finalize the branded URL for the application, please add the following CNAME record to the **mykaarma.com** DNS zone:

| Record Type | Host | Target / Value |
| :--- | :--- | :--- |
| **CNAME** | `cem` | `ghs.googlehosted.com` |

> [!NOTE]
> Once the DNS is updated, the Google Cloud Run service will automatically provision a managed SSL certificate. This typically takes 15–60 minutes.

---

## 2. SAML 2.0 Configuration (Service Provider)
The application is configured as a SAML 2.0 Service Provider (SP) using the `python3-saml` library.

| Parameter | Value |
| :--- | :--- |
| **SP Entity ID (Audience URI)** | `https://cem.mykaarma.com` |
| **ACS URL (Callback)** | `https://cem.mykaarma.com/login/saml/callback` |
| **Single Logout URL** | `https://cem.mykaarma.com/logout/callback` |
| **NameID Format** | `urn:oasis:names:tc:SAML:2.0:nameid-format:transient` |

### Required Attribute Mapping
Please ensure the SAML assertion includes the following attributes to map the user context correctly:

| Attribute Name | Description | Example |
| :--- | :--- | :--- |
| `email` | User's email address | `devon.supper@mykaarma.com` |
| `firstName` | User's first name | `Devon` |
| `lastName` | User's last name | `Supper` |
| `dealerUuid` | UUID of the target dealership | `336ab112-d93d-4b5a-a718-30023fe5eae9` |

---

## 3. Deployment & Environment

- **Stack**: Python 3.11+ / Flask
- **Server**: Gunicorn (Production WSGI)
- **Container**: Docker (Google Cloud Run)

### Environment Variables
The following environment variables must be set in the production environment:

```bash
# App Configuration
SECRET_KEY=your-secure-session-secret
PORT=8080

# Vitally API (Proxy Auth)
VITALLY_API_TOKEN=your-vitally-token
VITALLY_SUBDOMAIN=mykaarma
VITALLY_AUTH_TYPE=basic

# SAML IdP Certificate
SAML_IDP_CERT=MIID... (Content of IdP x509 Certificate)
```

### Run Command (Production)
```bash
gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 app:app
```

---

## 4. Security Headers
The Flask application forces enterprise-grade security headers on all responses to support myKaarma portal embedding:

- **Content-Security-Policy**: `frame-ancestors 'self' https://*.mykaarma.com https://*.mykaarma.com:*;`
- **X-Frame-Options**: *Removed* (to support cross-origin framing).

---

## 5. Repository & Structure
- **Repo**: `bulkap84/Virtual-CEM-Flask-Version`
- **Frontend**: Vanilla JS (No build step required). served via `static/` and `templates/`.
- **Backend**: `app.py` (Monolithic Flask app).

**Handover Date**: January 13, 2026
**Implementation Status**: Application Deployed, SAML Configured, API Parity Verified.
