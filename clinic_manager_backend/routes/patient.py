from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Appointment, LabResult, Prescription, User
from datetime import datetime

patient_bp = Blueprint('patient', __name__)

# Book appointment
@patient_bp.route('/book', methods=['POST'])
@jwt_required()
def book_appointment():
    identity = get_jwt_identity()
    patient_id = identity['id']
    data = request.json

    reason = data.get('reason')
    date = data.get('date')

    if not reason or not date:
        return jsonify({'msg': 'Please provide reason and date'}), 400

    appointment = Appointment(
        patient_id=patient_id,
        reason=reason,
        date=datetime.strptime(date, "%Y-%m-%d")
    )
    db.session.add(appointment)
    db.session.commit()

    return jsonify({'msg': 'Appointment booking successful, waiting for confirmation'}), 201

# Get patient's appointments
@patient_bp.route('/appointments', methods=['GET'])
@jwt_required()
def get_appointments():
    identity = get_jwt_identity()
    patient_id = identity['id']

    appointments = Appointment.query.filter_by(patient_id=patient_id).all()
    results = [{
        'id': a.id,
        'date': a.date.strftime('%Y-%m-%d'),
        'reason': a.reason,
        'status': a.status,
        'doctor': User.query.get(a.doctor_id).full_name if a.doctor_id else None
    } for a in appointments]

    return jsonify(results), 200

# Get patient's lab results
@patient_bp.route('/lab-results', methods=['GET'])
@jwt_required()
def get_lab_results():
    identity = get_jwt_identity()
    patient_id = identity['id']

    results = LabResult.query.filter_by(patient_id=patient_id).all()
    output = [{
        'id': r.id,
        'results': r.results,
        'test_description': r.test_description,  # ✅ Added field
        'created_at': r.created_at.strftime('%Y-%m-%d'),
        'labtech': User.query.get(r.labtech_id).full_name if r.labtech_id else None
    } for r in results]

    return jsonify(output), 200

# Get patient's prescriptions
@patient_bp.route('/prescriptions', methods=['GET'])
@jwt_required()
def get_prescriptions():
    identity = get_jwt_identity()
    patient_id = identity['id']

    prescriptions = Prescription.query.filter_by(patient_id=patient_id).all()
    output = [{
        'id': p.id,
        'content': p.content,
        'created_at': p.created_at.strftime('%Y-%m-%d'),
        'doctor': User.query.get(p.doctor_id).full_name if p.doctor_id else None
    } for p in prescriptions]

    return jsonify(output), 200
