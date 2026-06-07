"""Dashboard statistics endpoint."""
from __future__ import annotations

from collections import Counter

from flask import Blueprint, jsonify

from ..models import Grade, Student, compute_gpa

stats_bp = Blueprint("stats", __name__, url_prefix="/api")


def _envelope(data, meta=None, status=200):
    return jsonify({"data": data, "error": None, "meta": meta}), status


@stats_bp.get("/stats")
def get_stats():
    students = Student.query.filter(Student.archived.is_(False)).all()
    total = len(students)

    by_course: Counter[str] = Counter()
    by_year: Counter[int] = Counter()
    for s in students:
        if s.course:
            by_course[s.course.code] += 1
        by_year[s.enrollment_year] += 1

    course_dist = sorted(
        [{"label": code, "value": count} for code, count in by_course.items()],
        key=lambda d: d["value"],
        reverse=True,
    )
    year_dist = sorted(
        [{"label": str(year), "value": count} for year, count in by_year.items()],
        key=lambda d: d["label"],
    )

    recent_students = (
        Student.query.filter(Student.archived.is_(False))
        .order_by(Student.created_at.desc())
        .limit(5)
        .all()
    )
    recent_grades = (
        Grade.query.order_by(Grade.created_at.desc()).limit(6).all()
    )

    all_grades = Grade.query.all()
    overall_gpa = compute_gpa(all_grades)

    return _envelope(
        {
            "totalStudents": total,
            "totalCourses": len(by_course),
            "totalGrades": len(all_grades),
            "overallGpa": overall_gpa,
            "courseDistribution": course_dist,
            "yearDistribution": year_dist,
            "recentStudents": [s.to_dict() for s in recent_students],
            "recentGrades": [
                {**g.to_dict(), "studentName": g.student.name if g.student else None}
                for g in recent_grades
            ],
        }
    )
