# routes/admin.py

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import User, Appointment

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def get_all_users():
    identity = get_jwt_identity()
    if identity['role'] != 'admin':
        return jsonify({'msg': 'Unauthorized'}), 403

    users = User.query.all()
    return jsonify([{
        'id': u.id,
        'username': u.username,
        'role': u.role,
        'full_name': u.full_name
    } for u in users]), 200


@admin_bp.route('/appointments', methods=['GET'])
@jwt_required()
def get_all_appointments():
    identity = get_jwt_identity()
    if identity['role'] != 'admin':
        return jsonify({'msg': 'Unauthorized'}), 403

    appointments = Appointment.query.all()
    return jsonify([{
        'id': a.id,
        'patient_id': a.patient_id,
        'date': a.date.strftime('%Y-%m-%d'),
        'reason': a.reason,
        'status': a.status,
        'doctor_id': a.doctor_id,
        'doctor_name': a.doctor.full_name if a.doctor else None,
        'patient_name': a.patient.full_name if a.patient else None
    } for a in appointments]), 200


@admin_bp.route('/approve', methods=['POST'])
@jwt_required()
def approve_appointment():
    identity = get_jwt_identity()
    if identity['role'] != 'admin':
        return jsonify({'msg': 'Unauthorized'}), 403

    data = request.json
    appointment_id = data.get('appointment_id')
    doctor_id = data.get('doctor_id')
    status = data.get('status')

    appt = Appointment.query.get(appointment_id)
    if not appt:
        return jsonify({'msg': 'Appointment not found'}), 404

    appt.status = status
    appt.doctor_id = doctor_id
    db.session.commit()

    return jsonify({'msg': f'Appointment {status} and doctor assigned'}), 200
