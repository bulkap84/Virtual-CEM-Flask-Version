import os

def get_saml_settings():
    return {
        "strict": True,
        "debug": True,
        "sp": {
            "entityId": "https://cem.mykaarma.com",
            "assertionConsumerService": {
                "url": "https://cem.mykaarma.com/login/saml/callback",
                "binding": "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
            },
            "singleLogoutService": {
                "url": "https://cem.mykaarma.com/logout/callback",
                "binding": "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect"
            },
            "NameIDFormat": "urn:oasis:names:tc:SAML:2.0:nameid-format:transient",
            "x509cert": "",
            "privateKey": ""
        },
        "idp": {
            "entityId": "https://accounts.mykaarma.com/saml2/idp/metadata.php",
            "singleSignOnService": {
                "url": "https://accounts.mykaarma.com/module.php/saml/idp/singleSignOnService",
                "binding": "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect"
            },
            "singleLogoutService": {
                "url": "https://accounts.mykaarma.com/module.php/saml/idp/singleLogout",
                "binding": "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect"
            },
            "x509cert": os.getenv("SAML_IDP_CERT", "")
        }
    }
