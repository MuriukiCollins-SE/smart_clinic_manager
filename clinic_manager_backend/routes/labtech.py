from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import LabResult, User
from datetime import datetime

labtech_bp = Blueprint('labtech', __name__)

# GET all lab tests assigned to this lab technician
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
            'test_description': result.test_description,
            'results': result.results,
            'created_at': result.created_at.strftime('%Y-%m-%d') if result.created_at else None
        })

    return jsonify(output), 200

# POST lab test result for an assigned lab result
@labtech_bp.route('/record', methods=['POST'])
@jwt_required()
def record_result():
    identity = get_jwt_identity()
    labtech_id = identity['id']
    data = request.json

    result_id = data.get('result_id')
    results = data.get('results')

    if not result_id or not results:
        return jsonify({'msg': 'Missing result_id or results field'}), 400

    lab_result = LabResult.query.get(result_id)

    if not lab_result:
        return jsonify({'msg': 'Lab result not found'}), 404

    if lab_result.labtech_id != labtech_id:
        return jsonify({'msg': 'Unauthorized: This result is not assigned to you'}), 403

    lab_result.results = results
    lab_result.created_at = datetime.utcnow()

    db.session.commit()

    return jsonify({'msg': 'Lab result recorded successfully'}), 200
