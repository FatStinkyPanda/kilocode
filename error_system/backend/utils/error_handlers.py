"""
Error Handling Decorators and Context Managers
Provides convenient error handling utilities
"""
import functools
from contextlib import contextmanager
from typing import Callable, Optional, Type
from .error_classes import AppError, ErrorSeverity, ErrorComponent, ErrorCategory, ErrorContext
from .logger import get_logger


def handle_errors(
    component: ErrorComponent,
    severity: ErrorSeverity = ErrorSeverity.ERROR,
    category: ErrorCategory = ErrorCategory.SYSTEM_ERROR,
    user_message: Optional[str] = None,
    reraise: bool = True
):
    """
    Decorator to handle errors in functions

    Args:
        component: Component where function is located
        severity: Default severity for errors
        category: Default error category
        user_message: User-friendly error message
        reraise: Whether to re-raise the error after logging

    Usage:
        @handle_errors(ErrorComponent.AI, user_message="Failed to process AI request")
        def process_ai_request():
            # function code
            pass
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            logger = get_logger()
            try:
                return func(*args, **kwargs)
            except AppError as e:
                # Already an AppError, just log it
                logger.log_error(e)
                if reraise:
                    raise
                return None
            except Exception as e:
                # Wrap in AppError
                app_error = AppError(
                    message=f"Error in {func.__name__}: {str(e)}",
                    severity=severity,
                    component=component,
                    category=category,
                    original_exception=e,
                    user_message=user_message
                )
                logger.log_error(app_error)
                if reraise:
                    raise app_error from e
                return None

        return wrapper
    return decorator


def async_handle_errors(
    component: ErrorComponent,
    severity: ErrorSeverity = ErrorSeverity.ERROR,
    category: ErrorCategory = ErrorCategory.SYSTEM_ERROR,
    user_message: Optional[str] = None,
    reraise: bool = True
):
    """
    Decorator to handle errors in async functions

    Args:
        component: Component where function is located
        severity: Default severity for errors
        category: Default error category
        user_message: User-friendly error message
        reraise: Whether to re-raise the error after logging

    Usage:
        @async_handle_errors(ErrorComponent.AI)
        async def async_ai_request():
            # async function code
            pass
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            logger = get_logger()
            try:
                return await func(*args, **kwargs)
            except AppError as e:
                # Already an AppError, just log it
                logger.log_error(e)
                if reraise:
                    raise
                return None
            except Exception as e:
                # Wrap in AppError
                app_error = AppError(
                    message=f"Error in {func.__name__}: {str(e)}",
                    severity=severity,
                    component=component,
                    category=category,
                    original_exception=e,
                    user_message=user_message
                )
                logger.log_error(app_error)
                if reraise:
                    raise app_error from e
                return None

        return wrapper
    return decorator


@contextmanager
def error_context(
    component: ErrorComponent,
    operation: str,
    severity: ErrorSeverity = ErrorSeverity.ERROR,
    category: ErrorCategory = ErrorCategory.SYSTEM_ERROR,
    context: Optional[ErrorContext] = None,
    user_message: Optional[str] = None,
    suppress_errors: bool = False
):
    """
    Context manager for error handling

    Args:
        component: Component where operation is being performed
        operation: Description of the operation
        severity: Error severity
        category: Error category
        context: Error context information
        user_message: User-friendly error message
        suppress_errors: Whether to suppress errors (don't re-raise)

    Usage:
        with error_context(ErrorComponent.DATABASE, "Saving user data"):
            # code that might raise errors
            db.save(user)
    """
    logger = get_logger()
    try:
        yield
    except AppError as e:
        # Add context if provided
        if context:
            e.context = context
        logger.log_error(e)
        if not suppress_errors:
            raise
    except Exception as e:
        # Wrap in AppError
        app_error = AppError(
            message=f"Error during {operation}: {str(e)}",
            severity=severity,
            component=component,
            category=category,
            context=context,
            original_exception=e,
            user_message=user_message or f"Failed to {operation}"
        )
        logger.log_error(app_error)
        if not suppress_errors:
            raise app_error from e


def log_and_raise(
    error_class: Type[AppError],
    message: str,
    **kwargs
) -> None:
    """
    Helper function to log and raise an error

    Args:
        error_class: The AppError subclass to raise
        message: Error message
        **kwargs: Additional arguments for the error class

    Usage:
        log_and_raise(
            AIProviderError,
            "API key invalid",
            provider="anthropic",
            category=ErrorCategory.API_KEY_INVALID
        )
    """
    logger = get_logger()
    error = error_class(message, **kwargs)
    logger.log_error(error)
    raise error


def try_or_log(
    func: Callable,
    component: ErrorComponent,
    default_return: any = None,
    error_message: Optional[str] = None
) -> any:
    """
    Try to execute a function, log errors, and return default value on failure

    Args:
        func: Function to execute
        component: Component for error logging
        default_return: Value to return on error
        error_message: Custom error message

    Returns:
        Function result or default_return on error

    Usage:
        result = try_or_log(
            lambda: risky_operation(),
            ErrorComponent.FILE,
            default_return=None,
            error_message="Failed to process file"
        )
    """
    logger = get_logger()
    try:
        return func()
    except AppError as e:
        logger.log_error(e)
        return default_return
    except Exception as e:
        app_error = AppError(
            message=error_message or f"Error executing function: {str(e)}",
            component=component,
            original_exception=e
        )
        logger.log_error(app_error)
        return default_return


# Utility functions for common error scenarios

def validate_not_none(value: any, field_name: str, component: ErrorComponent):
    """
    Validate that a value is not None

    Args:
        value: Value to check
        field_name: Name of the field for error message
        component: Component where validation is occurring

    Raises:
        AppError: If value is None
    """
    if value is None:
        log_and_raise(
            AppError,
            f"{field_name} cannot be None",
            component=component,
            category=ErrorCategory.DATA_MISSING,
            user_message=f"Required field '{field_name}' is missing"
        )


def validate_file_exists(file_path: str, component: ErrorComponent):
    """
    Validate that a file exists

    Args:
        file_path: Path to the file
        component: Component where validation is occurring

    Raises:
        AppError: If file doesn't exist
    """
    import os
    if not os.path.exists(file_path):
        log_and_raise(
            AppError,
            f"File not found: {file_path}",
            component=component,
            category=ErrorCategory.FILE_NOT_FOUND,
            user_message=f"File not found: {os.path.basename(file_path)}"
        )


def validate_type(value: any, expected_type: Type, field_name: str, component: ErrorComponent):
    """
    Validate that a value is of expected type

    Args:
        value: Value to check
        expected_type: Expected type
        field_name: Name of the field for error message
        component: Component where validation is occurring

    Raises:
        AppError: If value is not of expected type
    """
    if not isinstance(value, expected_type):
        log_and_raise(
            AppError,
            f"{field_name} must be of type {expected_type.__name__}, got {type(value).__name__}",
            component=component,
            category=ErrorCategory.VALIDATION_FAILED,
            user_message=f"Invalid data type for '{field_name}'"
        )
