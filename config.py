import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Config:
    """Application configuration from environment variables"""
    
    # Flask Settings
    DEBUG = os.getenv('FLASK_ENV', 'production') == 'development'
    SECRET_KEY = os.getenv('SECRET_KEY', os.urandom(24).hex())
    
    # Vitally API Configuration
    VITALLY_SUBDOMAIN = os.getenv('VITALLY_SUBDOMAIN', 'mykaarma')
    VITALLY_API_TOKEN = os.getenv('VITALLY_API_TOKEN')
    VITALLY_AUTH_TYPE = os.getenv('VITALLY_AUTH_TYPE', 'basic')
    
    # JWT Configuration
    JWT_SECRET = os.getenv('JWT_SECRET', '1ed2a7b8c3d9e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9')
    
    # Session Configuration
    SESSION_COOKIE_SECURE = os.getenv('FLASK_ENV', 'production') == 'production'
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
