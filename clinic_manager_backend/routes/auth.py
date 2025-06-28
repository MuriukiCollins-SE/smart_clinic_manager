# routes/auth.py

from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db
from models import User
from flask_jwt_extended import create_access_token
from datetime import timedelta

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    full_name = data.get('full_name')
    role = data.get('role')

    if not all([username, password, full_name, role]):
        return jsonify({'msg': 'Missing required fields'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'msg': 'Username already exists'}), 409

    hashed_password = generate_password_hash(password)
    new_user = User(username=username, password=hashed_password, full_name=full_name, role=role)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'msg': f'{role} registered successfully'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    if not user or not check_password_hash(user.password, password):
        return jsonify({'msg': 'Invalid username or password'}), 401

    access_token = create_access_token(identity={'id': user.id, 'role': user.role}, expires_delta=timedelta(days=1))

    return jsonify({
        'access_token': access_token,
        'role': user.role,
        'id': user.id,
        'full_name': user.full_name
    }), 200
