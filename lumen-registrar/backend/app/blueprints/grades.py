"""Grade resource endpoints (nested under students + flat by id)."""
from __future__ import annotations

from flask import Blueprint, jsonify, request

from ..errors import ApiError
from ..models import Grade, Student, compute_gpa, db
from ..validation import validate_grade

grades_bp = Blueprint("grades", __name__, url_prefix="/api")


def _envelope(data, meta=None, status=200):
    return jsonify({"data": data, "error": None, "meta": meta}), status


def _get_student_or_404(student_id: int) -> Student:
    student = db.session.get(Student, student_id)
    if student is None:
        raise ApiError("Student not found.", status=404, code="not_found")
    return student


def _get_grade_or_404(grade_id: int) -> Grade:
    grade = db.session.get(Grade, grade_id)
    if grade is None:
        raise ApiError("Grade not found.", status=404, code="not_found")
    return grade


def _summary(grades: list[Grade]) -> dict:
    return {
        "gpa": compute_gpa(grades),
        "totalCredits": sum(g.credits for g in grades),
        "count": len(grades),
        "averageScore": round(sum(g.score for g in grades) / len(grades), 1) if grades else None,
    }


@grades_bp.get("/students/<int:student_id>/grades")
def list_grades(student_id: int):
    student = _get_student_or_404(student_id)
    grades = sorted(student.grades, key=lambda g: (g.term, g.subject))
    return _envelope([g.to_dict() for g in grades], meta=_summary(student.grades))


@grades_bp.post("/students/<int:student_id>/grades")
def add_grade(student_id: int):
    student = _get_student_or_404(student_id)
    payload = request.get_json(silent=True) or {}
    clean = validate_grade(payload)
    grade = Grade(student_id=student.id, **clean)
    db.session.add(grade)
    db.session.commit()
    return _envelope(grade.to_dict(), meta=_summary(student.grades), status=201)


@grades_bp.put("/grades/<int:grade_id>")
def update_grade(grade_id: int):
    grade = _get_grade_or_404(grade_id)
    payload = request.get_json(silent=True) or {}
    clean = validate_grade(payload)
    for key, value in clean.items():
        setattr(grade, key, value)
    db.session.commit()
    return _envelope(grade.to_dict(), meta=_summary(grade.student.grades))


@grades_bp.delete("/grades/<int:grade_id>")
def delete_grade(grade_id: int):
    grade = _get_grade_or_404(grade_id)
    student = grade.student
    db.session.delete(grade)
    db.session.commit()
    return _envelope({"id": grade_id, "deleted": True}, meta=_summary(student.grades))
