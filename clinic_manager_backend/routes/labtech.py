# routes/labtech.py

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import LabResult, User
from datetime import datetime

labtech_bp = Blueprint('labtech', __name__)

@labtech_bp.route('/assigned', methods=['GET'])
@jwt_required()
def get_assigned_tests():
    identity = get_jwt_identity()
    labtech_id = identity['id']

    lab_results = LabResult.query.filter_by(labtech_id=labtech_id).all()
    output = []

    for result in lab_results:
        patient = User.query.get(result.patient_id)
        output.append({
            'id': result.id,
            'patient_name': patient.full_name,
            'results': result.results,
            'created_at': result.created_at.strftime('%Y-%m-%d') if result.created_at else None
        })

    return jsonify(output), 200

@labtech_bp.route('/record', methods=['POST'])
@jwt_required()
def record_result():
    identity = get_jwt_identity()
    labtech_id = identity['id']
    data = request.json

    result_id = data.get('result_id')
    results = data.get('results')

    lab_result = LabResult.query.get(result_id)

    if not lab_result or lab_result.labtech_id != labtech_id:
        return jsonify({'msg': 'Lab result not found or not assigned to you'}), 404

    lab_result.results = results
    lab_result.created_at = datetime.utcnow()

    db.session.commit()

    return jsonify({'msg': 'Lab result recorded successfully'}), 200
