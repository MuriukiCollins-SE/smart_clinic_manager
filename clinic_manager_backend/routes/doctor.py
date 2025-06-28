# routes/doctor.py

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Appointment, LabResult, Prescription, User
from datetime import datetime

doctor_bp = Blueprint('doctor', __name__)

@doctor_bp.route('/patients', methods=['GET'])
@jwt_required()
def get_assigned_patients():
    identity = get_jwt_identity()
    doctor_id = identity['id']

    appointments = Appointment.query.filter_by(doctor_id=doctor_id, status='Approved').all()
    output = []
    for appt in appointments:
        patient = User.query.get(appt.patient_id)
        lab_results = LabResult.query.filter_by(patient_id=appt.patient_id).all()
        results = [{'id': r.id, 'results': r.results, 'created_at': r.created_at.strftime('%Y-%m-%d')} for r in lab_results]
        
        output.append({
            'appointment_id': appt.id,
            'patient_id': patient.id,
            'patient_name': patient.full_name,
            'lab_results': results
        })

    return jsonify(output), 200

@doctor_bp.route('/prescribe', methods=['POST'])
@jwt_required()
def give_prescription():
    identity = get_jwt_identity()
    doctor_id = identity['id']
    data = request.json

    patient_id = data.get('patient_id')
    content = data.get('content')

    if not all([patient_id, content]):
        return jsonify({'msg': 'Missing required fields'}), 400

    prescription = Prescription(
        patient_id=patient_id,
        doctor_id=doctor_id,
        content=content,
        created_at=datetime.utcnow()
    )
    db.session.add(prescription)
    db.session.commit()

    return jsonify({'msg': 'Prescription saved successfully'}), 201

@doctor_bp.route('/recommend-lab', methods=['POST'])
@jwt_required()
def recommend_lab_test():
    identity = get_jwt_identity()
    doctor_id = identity['id']
    data = request.json

    patient_id = data.get('patient_id')
    labtech_id = data.get('labtech_id')

    if not all([patient_id, labtech_id]):
        return jsonify({'msg': 'Missing required fields'}), 400

    # Create empty lab result assigned to labtech
    lab = LabResult(
        patient_id=patient_id,
        labtech_id=labtech_id
    )
    db.session.add(lab)
    db.session.commit()

    return jsonify({'msg': 'Lab test recommendation assigned'}), 201
