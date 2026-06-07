"""Seed the Lumen Registrar database with realistic sample data."""
from __future__ import annotations

from datetime import date, datetime, timedelta

from app import create_app
from app.models import Course, Grade, Student, db, score_to_letter

COURSES = [
    ("CS-BS", "B.S. Computer Science", "School of Engineering"),
    ("EE-BS", "B.S. Electrical Engineering", "School of Engineering"),
    ("ME-BS", "B.S. Mechanical Engineering", "School of Engineering"),
    ("MAT-BS", "B.S. Mathematics", "College of Sciences"),
    ("BIO-BS", "B.S. Biology", "College of Sciences"),
    ("ECO-BA", "B.A. Economics", "College of Arts & Letters"),
    ("PSY-BA", "B.A. Psychology", "College of Arts & Letters"),
    ("BUS-BBA", "Bachelor of Business Administration", "Business School"),
]

# (name, email, phone, dob, course_code, enroll_year)
STUDENTS = [
    ("Amara Okafor", "amara.okafor@lumen.edu", "+1 (415) 555-0182", date(2003, 4, 12), "CS-BS", 2022),
    ("Liam Bennett", "liam.bennett@lumen.edu", "+1 (415) 555-0147", date(2002, 9, 3), "CS-BS", 2021),
    ("Sofia Castellano", "sofia.castellano@lumen.edu", "+1 (628) 555-0119", date(2004, 1, 27), "MAT-BS", 2023),
    ("Noah Kim", "noah.kim@lumen.edu", "+1 (510) 555-0166", date(2003, 7, 19), "EE-BS", 2022),
    ("Priya Sharma", "priya.sharma@lumen.edu", "+1 (415) 555-0173", date(2002, 11, 8), "BUS-BBA", 2021),
    ("Mateo Rossi", "mateo.rossi@lumen.edu", "+1 (650) 555-0134", date(2004, 5, 30), "ME-BS", 2023),
    ("Hannah Lindqvist", "hannah.lindqvist@lumen.edu", "+1 (415) 555-0151", date(2003, 2, 14), "BIO-BS", 2022),
    ("Daniel Mensah", "daniel.mensah@lumen.edu", "+1 (408) 555-0128", date(2001, 12, 1), "ECO-BA", 2020),
    ("Yuki Tanaka", "yuki.tanaka@lumen.edu", "+1 (415) 555-0190", date(2004, 8, 22), "PSY-BA", 2023),
    ("Olivia Carter", "olivia.carter@lumen.edu", "+1 (510) 555-0112", date(2002, 6, 9), "CS-BS", 2021),
    ("Ethan Mwangi", "ethan.mwangi@lumen.edu", "+1 (628) 555-0177", date(2003, 10, 16), "MAT-BS", 2022),
    ("Isabella Moreau", "isabella.moreau@lumen.edu", "+1 (415) 555-0163", date(2004, 3, 5), "BUS-BBA", 2023),
    ("Aarav Patel", "aarav.patel@lumen.edu", "+1 (650) 555-0145", date(2002, 1, 23), "EE-BS", 2021),
    ("Grace O'Sullivan", "grace.osullivan@lumen.edu", "+1 (415) 555-0156", date(2003, 5, 11), "BIO-BS", 2022),
    ("Lucas Andersen", "lucas.andersen@lumen.edu", "+1 (408) 555-0139", date(2001, 8, 28), "ECO-BA", 2020),
    ("Mia Rossi", "mia.rossi@lumen.edu", "+1 (415) 555-0184", date(2004, 12, 19), "PSY-BA", 2023),
]

# (course_code) -> list of (subject, term, score, credits)
GRADE_TEMPLATES = {
    "CS-BS": [
        ("Data Structures", "Fall 2022", 91, 4),
        ("Algorithms", "Spring 2023", 88, 4),
        ("Operating Systems", "Fall 2023", 84, 3),
        ("Discrete Mathematics", "Fall 2022", 95, 3),
    ],
    "EE-BS": [
        ("Circuit Analysis", "Fall 2022", 79, 4),
        ("Signals & Systems", "Spring 2023", 86, 3),
        ("Electromagnetics", "Fall 2023", 72, 4),
    ],
    "MAT-BS": [
        ("Real Analysis", "Fall 2023", 93, 4),
        ("Linear Algebra", "Spring 2023", 89, 3),
        ("Probability Theory", "Fall 2023", 81, 3),
    ],
    "BUS-BBA": [
        ("Principles of Marketing", "Fall 2022", 87, 3),
        ("Financial Accounting", "Spring 2023", 78, 3),
        ("Organizational Behavior", "Fall 2023", 90, 3),
    ],
    "BIO-BS": [
        ("Cell Biology", "Fall 2022", 84, 4),
        ("Genetics", "Spring 2023", 88, 3),
        ("Organic Chemistry", "Fall 2023", 69, 4),
    ],
    "ME-BS": [
        ("Statics", "Fall 2023", 82, 3),
        ("Thermodynamics", "Spring 2023", 76, 4),
    ],
    "ECO-BA": [
        ("Microeconomics", "Fall 2020", 91, 3),
        ("Macroeconomics", "Spring 2021", 85, 3),
        ("Econometrics", "Fall 2022", 80, 4),
    ],
    "PSY-BA": [
        ("Intro to Psychology", "Fall 2023", 94, 3),
        ("Research Methods", "Spring 2024", 88, 3),
    ],
}


def run() -> None:
    app = create_app()
    with app.app_context():
        db.drop_all()
        db.create_all()

        code_to_course: dict[str, Course] = {}
        for code, name, dept in COURSES:
            course = Course(code=code, name=name, department=dept)
            db.session.add(course)
            code_to_course[code] = course
        db.session.flush()

        created_at = datetime.utcnow() - timedelta(days=len(STUDENTS))
        for idx, (name, email, phone, dob, code, year) in enumerate(STUDENTS):
            student = Student(
                name=name,
                email=email,
                phone=phone,
                dob=dob,
                course_id=code_to_course[code].id,
                enrollment_year=year,
                status="active",
                created_at=created_at + timedelta(days=idx),
            )
            db.session.add(student)
            db.session.flush()

            for subject, term, score, credits in GRADE_TEMPLATES.get(code, []):
                db.session.add(
                    Grade(
                        student_id=student.id,
                        subject=subject,
                        term=term,
                        score=float(score),
                        letter=score_to_letter(score),
                        credits=float(credits),
                    )
                )

        db.session.commit()
        print(
            f"Seeded {len(COURSES)} courses, {len(STUDENTS)} students, "
            f"{Grade.query.count()} grades."
        )


if __name__ == "__main__":
    run()
