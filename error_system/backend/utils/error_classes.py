"""
Error Classes and Enums
Comprehensive error handling system for AI Document Generator
"""
from enum import Enum
from typing import Optional, Dict, Any
from datetime import datetime
import traceback
import uuid


class ErrorSeverity(Enum):
    """Error severity levels"""
    CRITICAL = "critical"  # System-breaking errors
    ERROR = "error"        # Operation-breaking errors
    WARNING = "warning"    # Recoverable issues
    INFO = "info"          # Informational messages


class ErrorComponent(Enum):
    """System components where errors can occur"""
    AI = "ai"
    SCHEMA = "schema"
    FILE = "file"
    TEMPLATE = "template"
    LATEX = "latex"
    DATABASE = "database"
    API = "api"
    FRONTEND = "frontend"
    EXTRACTION = "extraction"
    COMPILATION = "compilation"
    CONVERSION = "conversion"
    AUTH = "auth"
    VALIDATION = "validation"
    SYSTEM = "system"
    PROJECT_SERVICE = "project_service"
    WORKFLOW_SERVICE = "workflow_service"
    JOB_GROUP_SERVICE = "job_group_service"
    EXTRACTION_PROFILE_SERVICE = "extraction_profile_service"
    AI_SERVICE = "ai_service"
    SCHEMA_SERVICE = "schema_service"
    FILE_SERVICE = "file_service"
    TEMPLATE_SERVICE = "template_service"
    LATEX_COMPILER = "latex_compiler"


class ErrorCategory(Enum):
    """Error categories for classification"""
    # API Errors
    API_KEY_INVALID = "api_key_invalid"
    API_RATE_LIMIT = "api_rate_limit"
    API_TIMEOUT = "api_timeout"
    API_CONNECTION = "api_connection"
    API_RESPONSE_INVALID = "api_response_invalid"

    # Validation Errors
    VALIDATION_FAILED = "validation_failed"
    SCHEMA_INVALID = "schema_invalid"
    XML_INVALID = "xml_invalid"
    DATA_MISSING = "data_missing"
    DATA_CONFLICT = "data_conflict"

    # File Errors
    FILE_NOT_FOUND = "file_not_found"
    FILE_READ_ERROR = "file_read_error"
    FILE_WRITE_ERROR = "file_write_error"
    FILE_TYPE_UNSUPPORTED = "file_type_unsupported"
    FILE_TOO_LARGE = "file_too_large"
    FILE_CORRUPTED = "file_corrupted"

    # LaTeX Errors
    LATEX_COMPILATION_FAILED = "latex_compilation_failed"
    LATEX_SYNTAX_ERROR = "latex_syntax_error"
    LATEX_PACKAGE_MISSING = "latex_package_missing"
    LATEX_COMMAND_UNDEFINED = "latex_command_undefined"

    # Database Errors
    DATABASE_CONNECTION = "database_connection"
    DATABASE_QUERY_FAILED = "database_query_failed"
    DATABASE_CONSTRAINT = "database_constraint"
    DATABASE_TRANSACTION = "database_transaction"

    # Extraction Errors
    EXTRACTION_FAILED = "extraction_failed"
    EXTRACTION_PARSING = "extraction_parsing"
    EXTRACTION_TIMEOUT = "extraction_timeout"

    # Template Errors
    TEMPLATE_NOT_FOUND = "template_not_found"
    TEMPLATE_INVALID = "template_invalid"
    TEMPLATE_GENERATION_FAILED = "template_generation_failed"

    # System Errors
    SYSTEM_ERROR = "system_error"
    PERMISSION_DENIED = "permission_denied"
    RESOURCE_EXHAUSTED = "resource_exhausted"
    NOT_IMPLEMENTED = "not_implemented"

    # General Errors
    NOT_FOUND = "not_found"
    VALIDATION_ERROR = "validation_error"
    PROCESSING_ERROR = "processing_error"
    CONFIGURATION_ERROR = "configuration_error"
    DATABASE_ERROR = "database_error"

    # Unknown
    UNKNOWN = "unknown"


class ErrorContext:
    """Context information for errors"""

    def __init__(self):
        self.user_id: Optional[str] = None
        self.project_id: Optional[int] = None
        self.file_id: Optional[int] = None
        self.template_id: Optional[int] = None
        self.request_id: Optional[str] = None
        self.session_id: Optional[str] = None
        self.additional_data: Dict[str, Any] = {}

    def to_dict(self) -> Dict[str, Any]:
        """Convert context to dictionary"""
        return {
            "user_id": self.user_id,
            "project_id": self.project_id,
            "file_id": self.file_id,
            "template_id": self.template_id,
            "request_id": self.request_id,
            "session_id": self.session_id,
            "additional_data": self.additional_data
        }


class AppError(Exception):
    """
    Base application error class
    All custom errors should inherit from this class
    """

    def __init__(
        self,
        message: str,
        severity: ErrorSeverity = ErrorSeverity.ERROR,
        component: ErrorComponent = ErrorComponent.SYSTEM,
        category: ErrorCategory = ErrorCategory.SYSTEM_ERROR,
        context: Optional[ErrorContext] = None,
        original_exception: Optional[Exception] = None,
        user_message: Optional[str] = None,
        suggested_fix: Optional[str] = None,
        error_code: Optional[str] = None
    ):
        """
        Initialize AppError

        Args:
            message: Technical error message for logging
            severity: Error severity level
            component: Component where error occurred
            category: Error category
            context: Additional context information
            original_exception: Original exception if this is a wrapper
            user_message: User-friendly error message
            suggested_fix: Suggested fix for the error
            error_code: Unique error code for tracking
        """
        super().__init__(message)

        self.message = message
        self.severity = severity
        self.component = component
        self.category = category
        self.context = context or ErrorContext()
        self.original_exception = original_exception
        self.user_message = user_message or self._generate_user_message()
        self.suggested_fix = suggested_fix
        self.error_code = error_code or self._generate_error_code()
        self.timestamp = datetime.utcnow()
        self.stack_trace = traceback.format_exc()

    def _generate_error_code(self) -> str:
        """Generate unique error code"""
        return f"{self.component.value.upper()}-{uuid.uuid4().hex[:8].upper()}"

    def _generate_user_message(self) -> str:
        """Generate user-friendly message based on category"""
        messages = {
            ErrorCategory.API_KEY_INVALID: "Invalid API key. Please check your API configuration.",
            ErrorCategory.API_RATE_LIMIT: "Rate limit exceeded. Please wait a moment and try again.",
            ErrorCategory.API_TIMEOUT: "Request timed out. Please try again.",
            ErrorCategory.FILE_NOT_FOUND: "File not found. Please check the file path.",
            ErrorCategory.FILE_TOO_LARGE: "File is too large. Please use a smaller file.",
            ErrorCategory.LATEX_COMPILATION_FAILED: "Document compilation failed. Please check the template.",
            ErrorCategory.VALIDATION_FAILED: "Data validation failed. Please check your input.",
            ErrorCategory.DATABASE_CONNECTION: "Database connection error. Please try again.",
        }
        return messages.get(self.category, "An error occurred. Please try again or contact support.")

    def to_dict(self) -> Dict[str, Any]:
        """Convert error to dictionary for logging/API responses"""
        return {
            "error_code": self.error_code,
            "message": self.message,
            "user_message": self.user_message,
            "severity": self.severity.value,
            "component": self.component.value,
            "category": self.category.value,
            "timestamp": self.timestamp.isoformat(),
            "context": self.context.to_dict(),
            "suggested_fix": self.suggested_fix,
            "stack_trace": self.stack_trace if self.severity in [ErrorSeverity.CRITICAL, ErrorSeverity.ERROR] else None
        }

    def __str__(self) -> str:
        """String representation"""
        return f"[{self.error_code}] {self.component.value.upper()}: {self.message}"


# Specific Error Classes

class AIProviderError(AppError):
    """Errors related to AI providers"""

    def __init__(self, message: str, provider: str, **kwargs):
        kwargs['component'] = ErrorComponent.AI
        super().__init__(message, **kwargs)
        self.provider = provider


class SchemaValidationError(AppError):
    """Errors related to schema validation"""

    def __init__(self, message: str, schema_id: Optional[int] = None, **kwargs):
        kwargs['component'] = ErrorComponent.SCHEMA
        kwargs['category'] = ErrorCategory.VALIDATION_FAILED
        super().__init__(message, **kwargs)
        self.schema_id = schema_id


class FileProcessingError(AppError):
    """Errors related to file processing"""

    def __init__(self, message: str, file_path: Optional[str] = None, **kwargs):
        kwargs['component'] = ErrorComponent.FILE
        super().__init__(message, **kwargs)
        self.file_path = file_path


class LaTeXCompilationError(AppError):
    """Errors related to LaTeX compilation"""

    def __init__(self, message: str, latex_errors: Optional[list] = None, **kwargs):
        kwargs['component'] = ErrorComponent.LATEX
        kwargs['category'] = ErrorCategory.LATEX_COMPILATION_FAILED
        super().__init__(message, **kwargs)
        self.latex_errors = latex_errors or []


class DatabaseError(AppError):
    """Errors related to database operations"""

    def __init__(self, message: str, query: Optional[str] = None, **kwargs):
        kwargs['component'] = ErrorComponent.DATABASE
        super().__init__(message, **kwargs)
        self.query = query


class ExtractionError(AppError):
    """Errors related to data extraction"""

    def __init__(self, message: str, extraction_method: Optional[str] = None, **kwargs):
        kwargs['component'] = ErrorComponent.EXTRACTION
        kwargs['category'] = ErrorCategory.EXTRACTION_FAILED
        super().__init__(message, **kwargs)
        self.extraction_method = extraction_method


class TemplateError(AppError):
    """Errors related to templates"""

    def __init__(self, message: str, template_id: Optional[int] = None, **kwargs):
        kwargs['component'] = ErrorComponent.TEMPLATE
        super().__init__(message, **kwargs)
        self.template_id = template_id
