from extensions import db
from datetime import datetime

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    role = db.Column(db.String(50), nullable=False)  # patient, doctor, admin, labtech
    username = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    full_name = db.Column(db.String(200), nullable=False)

    # Relationships
    appointments = db.relationship('Appointment', backref='patient', lazy=True, foreign_keys='Appointment.patient_id')
    assigned_appointments = db.relationship('Appointment', backref='doctor', lazy=True, foreign_keys='Appointment.doctor_id')

    # Lab results where user is the lab technician
    lab_results_as_tech = db.relationship('LabResult', backref='labtech', lazy=True, foreign_keys='LabResult.labtech_id')

    # Lab results where user is the patient
    lab_results_as_patient = db.relationship('LabResult', backref='patient_user', lazy=True, foreign_keys='LabResult.patient_id')

    # Prescriptions given as doctor
    prescriptions_given = db.relationship('Prescription', backref='doctor', lazy=True, foreign_keys='Prescription.doctor_id')

    # Prescriptions received as patient
    prescriptions_received = db.relationship('Prescription', backref='patient_user', lazy=True, foreign_keys='Prescription.patient_id')

class Appointment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    reason = db.Column(db.Text)
    status = db.Column(db.String(50), default='Pending')  # Pending, Approved, Rejected

class HealthRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class LabResult(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    labtech_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    test_description = db.Column(db.Text, nullable=True)  # What test is required
    results = db.Column(db.Text, nullable=True)           # Final results
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Prescription(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    content = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
