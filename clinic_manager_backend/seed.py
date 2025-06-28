from run import create_app
from extensions import db
from models import User, Appointment
from werkzeug.security import generate_password_hash
from datetime import datetime

app = create_app()

with app.app_context():
    db.drop_all()
    db.create_all()

    # Admin
    admin = User(username='admin', full_name='Admin User', role='admin',
                 password=generate_password_hash('admin123'))

    # Doctors
    doctors = [
        User(username='doctor1', full_name='Dr. Alice', role='doctor', password=generate_password_hash('doc123')),
        User(username='doctor2', full_name='Dr. Bob', role='doctor', password=generate_password_hash('doc123')),
        User(username='doctor3', full_name='Dr. Carol', role='doctor', password=generate_password_hash('doc123'))
    ]

    # Lab Technicians
    labtechs = [
        User(username='labtech1', full_name='Lab Tech Mike', role='labtech', password=generate_password_hash('lab123')),
        User(username='labtech2', full_name='Lab Tech Jane', role='labtech', password=generate_password_hash('lab123'))
    ]

    # Patients
    patients = []
    for i in range(1, 6):
        patient = User(
            username=f'patient{i}',
            full_name=f'Patient {i}',
            role='patient',
            password=generate_password_hash('patient123')
        )
        patients.append(patient)

    # Commit users first so they get IDs
    db.session.add(admin)
    db.session.add_all(doctors + labtechs + patients)
    db.session.commit()

    # Create appointments for patients
    appointments = []
    for i, patient in enumerate(patients, start=1):
        pending_appt = Appointment(
            patient_id=patient.id,
            date=datetime(2025, 7, i),
            reason=f"Consultation #{i}",
            status='Pending'
        )
        approved_appt = Appointment(
            patient_id=patient.id,
            date=datetime(2025, 7, i + 1),
            reason=f"Follow-up #{i}",
            status='Approved',
            doctor_id=doctors[i % len(doctors)].id
        )
        appointments.extend([pending_appt, approved_appt])

    db.session.add_all(appointments)
    db.session.commit()

    print("✅ Seeded: admin, 3 doctors, 2 lab techs, 5 patients, and appointments.")
