from flask import Flask, request, jsonify, render_template, redirect, session, url_for
from flask_cors import CORS
from onelogin.saml2.auth import OneLogin_Saml2_Auth
from saml_config import get_saml_settings
import requests
import os
import json

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'dev-secret-key')
CORS(app)

# --- CONFIG ---
VITALLY_SUBDOMAIN = os.getenv('VITALLY_SUBDOMAIN', 'mykaarma')
VITALLY_API_TOKEN = os.getenv('VITALLY_API_TOKEN')
VITALLY_AUTH_TYPE = os.getenv('VITALLY_AUTH_TYPE', 'basic')

# --- HELPER FOR SAML ---
def prepare_flask_request(request):
    return {
        'https': 'on' if request.scheme == 'https' else 'off',
        'http_host': request.host,
        'server_port': request.environ['SERVER_PORT'],
        'script_name': request.path,
        'get_data': request.args.copy(),
        'post_data': request.form.copy()
    }

# --- SECURITY HEADERS ---
@app.after_request
def add_security_headers(response):
    response.headers['Content-Security-Policy'] = "frame-ancestors 'self' https://*.mykaarma.com https://*.mykaarma.com:*;"
    response.headers.pop('X-Frame-Options', None)
    return response

# --- ROUTES ---

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/health')
def health():
    return jsonify({"status": "healthy", "vitally": bool(VITALLY_API_TOKEN)})

# --- VITALLY PROXY ---
@app.route('/api/vitally/accounts/<uuid>')
def vitally_proxy(uuid):
    if not VITALLY_API_TOKEN:
        return jsonify({"error": "Server missing API Token"}), 500
        
    url = f"https://{VITALLY_SUBDOMAIN}.rest.vitally.io/resources/accounts/{uuid}"
    headers = {
        'Authorization': f"{'Bearer' if VITALLY_AUTH_TYPE == 'bearer' else 'Basic'} {VITALLY_API_TOKEN}",
        'Accept': 'application/json'
    }
    
    try:
        res = requests.get(url, headers=headers)
        res.raise_for_status()
        return jsonify(res.json())
    except requests.exceptions.RequestException as e:
        status = e.response.status_code if e.response else 500
        return jsonify({"proxy_error": str(e)}), status

# --- AUTH ---
@app.route('/api/auth/me')
def auth_me():
    if 'samlUserdata' in session:
        return jsonify({
            "authenticated": True,
            "user": {
                "email": session['samlUserdata'].get('email', [None])[0],
                "firstName": session['samlUserdata'].get('firstName', [None])[0],
                "lastName": session['samlUserdata'].get('lastName', [None])[0],
                "dealerUuid": session['samlUserdata'].get('dealerUuid', [None])[0]
            }
        })
    return jsonify({"authenticated": False})

@app.route('/login/saml')
def login():
    req = prepare_flask_request(request)
    auth = OneLogin_Saml2_Auth(req, get_saml_settings())
    
    # If using a specific return_to URL
    return_to = request.host_url
    return redirect(auth.login(return_to))

@app.route('/login/saml/callback', methods=['POST'])
def saml_callback():
    req = prepare_flask_request(request)
    auth = OneLogin_Saml2_Auth(req, get_saml_settings())
    
    auth.process_response()
    errors = auth.get_errors()
    
    if not errors:
        if auth.is_authenticated():
            session['samlUserdata'] = auth.get_attributes()
            session['samlNameId'] = auth.get_nameid()
            session['samlSessionIndex'] = auth.get_session_index()
            
            # If relay state is set, redirect there, otherwise root
            if 'RelayState' in request.form and request.form['RelayState'] != OneLogin_Saml2_Auth.REDIRECT_URL:
                 return redirect(auth.redirect_to(request.form['RelayState']))
            return redirect('/')
    else:
        return f"Error when processing SAML Response: {', '.join(errors)}"

@app.route('/logout')
def logout():
    req = prepare_flask_request(request)
    auth = OneLogin_Saml2_Auth(req, get_saml_settings())
    
    name_id = session.get('samlNameId')
    session_index = session.get('samlSessionIndex')
    name_id_format = "urn:oasis:names:tc:SAML:2.0:nameid-format:transient"
    
    return redirect(auth.logout(name_id=name_id, session_index=session_index, name_id_format=name_id_format))

@app.route('/logout/callback')
def logout_callback():
    req = prepare_flask_request(request)
    auth = OneLogin_Saml2_Auth(req, get_saml_settings())
    dscb = lambda: session.clear()
    
    url = auth.process_slo(delete_session_cb=dscb)
    errors = auth.get_errors()
    
    if len(errors) == 0:
        if url:
             return redirect(url)
        else:
             return redirect('/')
    elif auth.get_last_error_reason():
         return auth.get_last_error_reason()
    return "Error processing SLO"

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5555))
    print(f"Server is starting on http://127.0.0.1:{port}")
    app.run(host='127.0.0.1', port=port, debug=True)
