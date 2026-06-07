"""Server-side request validation, mirroring the client schema."""
from __future__ import annotations

import re
from datetime import date

from .errors import field_error
from .models import GRADE_POINTS, score_to_letter

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
PHONE_RE = re.compile(r"^[+()\-\s\d]{7,20}$")
MIN_ENROLL_YEAR = 1980
MAX_ENROLL_YEAR = date.today().year + 1
MIN_AGE = 14
MAX_AGE = 100


def validate_student(payload: dict, course_ids: set[int]) -> dict:
    errors: dict[str, str] = {}

    name = (payload.get("name") or "").strip()
    if not name:
        errors["name"] = "Full name is required."
    elif len(name) < 2:
        errors["name"] = "Name must be at least 2 characters."

    email = (payload.get("email") or "").strip().lower()
    if not email:
        errors["email"] = "Email is required."
    elif not EMAIL_RE.match(email):
        errors["email"] = "Enter a valid email address."

    phone = (payload.get("phone") or "").strip()
    if phone and not PHONE_RE.match(phone):
        errors["phone"] = "Enter a valid phone number."

    dob_raw = (payload.get("dob") or "").strip()
    dob_val: date | None = None
    if not dob_raw:
        errors["dob"] = "Date of birth is required."
    else:
        try:
            dob_val = date.fromisoformat(dob_raw)
            if dob_val > date.today():
                errors["dob"] = "Date of birth cannot be in the future."
            else:
                age = date.today().year - dob_val.year - (
                    (date.today().month, date.today().day) < (dob_val.month, dob_val.day)
                )
                if age < MIN_AGE or age > MAX_AGE:
                    errors["dob"] = f"Age must be between {MIN_AGE} and {MAX_AGE}."
        except ValueError:
            errors["dob"] = "Enter a valid date."

    course_id = payload.get("courseId")
    try:
        course_id = int(course_id)
        if course_id not in course_ids:
            errors["courseId"] = "Select a valid course."
    except (TypeError, ValueError):
        errors["courseId"] = "Select a course."
        course_id = None

    year = payload.get("enrollmentYear")
    try:
        year = int(year)
        if year < MIN_ENROLL_YEAR or year > MAX_ENROLL_YEAR:
            errors["enrollmentYear"] = f"Year must be between {MIN_ENROLL_YEAR} and {MAX_ENROLL_YEAR}."
    except (TypeError, ValueError):
        errors["enrollmentYear"] = "Enter a valid enrollment year."
        year = None

    if errors:
        raise field_error(errors)

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "dob": dob_val,
        "course_id": course_id,
        "enrollment_year": year,
    }


VALID_LETTERS = set(GRADE_POINTS.keys())


def validate_grade(payload: dict) -> dict:
    errors: dict[str, str] = {}

    subject = (payload.get("subject") or "").strip()
    if not subject:
        errors["subject"] = "Subject is required."

    term = (payload.get("term") or "").strip()
    if not term:
        errors["term"] = "Term is required."

    score = payload.get("score")
    score_val: float | None = None
    try:
        score_val = float(score)
        if score_val < 0 or score_val > 100:
            errors["score"] = "Score must be between 0 and 100."
    except (TypeError, ValueError):
        errors["score"] = "Enter a numeric score (0–100)."

    credits = payload.get("credits", 3.0)
    try:
        credits = float(credits)
        if credits <= 0 or credits > 12:
            errors["credits"] = "Credits must be between 0 and 12."
    except (TypeError, ValueError):
        errors["credits"] = "Enter valid credits."
        credits = None

    # Letter is optional from client; derive from score when valid.
    letter = (payload.get("letter") or "").strip().upper()
    if letter and letter not in VALID_LETTERS:
        errors["letter"] = "Enter a valid letter grade."

    if errors:
        raise field_error(errors)

    if not letter:
        letter = score_to_letter(score_val)

    return {
        "subject": subject,
        "term": term,
        "score": score_val,
        "letter": letter,
        "credits": credits,
    }
