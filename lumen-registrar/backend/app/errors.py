"""API error type with a consistent envelope."""
from __future__ import annotations


class ApiError(Exception):
    def __init__(self, message: str, status: int = 400, code: str = "bad_request", fields: dict | None = None):
        super().__init__(message)
        self.message = message
        self.status = status
        self.code = code
        self.fields = fields or {}

    def to_dict(self) -> dict:
        payload: dict = {"message": self.message, "code": self.code}
        if self.fields:
            payload["fields"] = self.fields
        return payload


def field_error(fields: dict[str, str], message: str = "Please correct the highlighted fields.") -> ApiError:
    return ApiError(message, status=422, code="validation_error", fields=fields)
