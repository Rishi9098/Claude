"""Course resource endpoints."""
from __future__ import annotations

from flask import Blueprint, jsonify, request

from ..errors import ApiError, field_error
from ..models import Course, db

courses_bp = Blueprint("courses", __name__, url_prefix="/api/courses")


def _envelope(data, meta=None, status=200):
    return jsonify({"data": data, "error": None, "meta": meta}), status


def _get_course_or_404(course_id: int) -> Course:
    course = db.session.get(Course, course_id)
    if course is None:
        raise ApiError("Course not found.", status=404, code="not_found")
    return course


def _validate(payload: dict, existing_id: int | None = None) -> dict:
    errors: dict[str, str] = {}
    code = (payload.get("code") or "").strip().upper()
    name = (payload.get("name") or "").strip()
    department = (payload.get("department") or "").strip()

    if not code:
        errors["code"] = "Course code is required."
    if not name:
        errors["name"] = "Course name is required."

    if code:
        dup_query = Course.query.filter(Course.code == code)
        if existing_id is not None:
            dup_query = dup_query.filter(Course.id != existing_id)
        if dup_query.first():
            errors["code"] = "A course with this code already exists."

    if errors:
        raise field_error(errors)
    return {"code": code, "name": name, "department": department or None}


@courses_bp.get("")
def list_courses():
    courses = Course.query.order_by(Course.code.asc()).all()
    return _envelope([c.to_dict() for c in courses])


@courses_bp.post("")
def create_course():
    payload = request.get_json(silent=True) or {}
    clean = _validate(payload)
    course = Course(**clean)
    db.session.add(course)
    db.session.commit()
    return _envelope(course.to_dict(), status=201)


@courses_bp.put("/<int:course_id>")
def update_course(course_id: int):
    course = _get_course_or_404(course_id)
    payload = request.get_json(silent=True) or {}
    clean = _validate(payload, existing_id=course.id)
    for key, value in clean.items():
        setattr(course, key, value)
    db.session.commit()
    return _envelope(course.to_dict())


@courses_bp.delete("/<int:course_id>")
def delete_course(course_id: int):
    course = _get_course_or_404(course_id)
    if any(not s.archived for s in course.students):
        raise ApiError(
            "This course still has enrolled students and cannot be deleted.",
            status=409,
            code="course_in_use",
        )
    db.session.delete(course)
    db.session.commit()
    return _envelope({"id": course_id, "deleted": True})
