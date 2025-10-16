"""
AI Context API Routes
Endpoints for accessing LaTeX documentation and examples
"""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

from backend.services.ai_context_service import AIContextManager
from backend.utils.logger import get_logger

logger = get_logger()
router = APIRouter()


# Request/Response Models
class DetectContextRequest(BaseModel):
    """Request to detect needed context"""
    user_request: str = Field(..., description="User's request or prompt")

    class Config:
        json_schema_extra = {
            "example": {
                "user_request": "Create a modern two-column resume with blue color scheme"
            }
        }


class BuildContextRequest(BaseModel):
    """Request to build context prompt"""
    packages: Optional[List[str]] = Field(None, description="Package names to include")
    examples: Optional[List[str]] = Field(None, description="Example names to include")
    best_practices: Optional[List[str]] = Field(None, description="Best practices to include")
    snippets: Optional[List[str]] = Field(None, description="Snippet names to include")
    max_tokens: int = Field(50000, description="Maximum tokens to include", ge=1000, le=100000)

    class Config:
        json_schema_extra = {
            "example": {
                "packages": ["xcolor", "geometry"],
                "examples": ["two_column_resume"],
                "best_practices": ["resume_design"],
                "max_tokens": 50000
            }
        }


class SearchContextRequest(BaseModel):
    """Request to search context"""
    query: str = Field(..., description="Search query")
    category: Optional[str] = Field(None, description="Category to search in")

    class Config:
        json_schema_extra = {
            "example": {
                "query": "color",
                "category": "packages"
            }
        }


class ContextResponse(BaseModel):
    """Context response"""
    success: bool
    data: Dict[str, Any]


class ContextListResponse(BaseModel):
    """List response"""
    success: bool
    data: List[Dict[str, Any]]


# Endpoints

@router.get("/packages/{package_name}", response_model=ContextResponse)
async def get_package_docs(package_name: str):
    """
    Get documentation for a LaTeX package

    - **package_name**: Name of the package (xcolor, geometry, fontspec, tikz, multicol, hyperref, biblatex)
    """
    try:
        context_manager = AIContextManager()

        docs = context_manager.get_package_docs(package_name)

        if not docs:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Package documentation not found: {package_name}"
            )

        return {
            "success": True,
            "data": docs
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get package docs: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get package documentation: {str(e)}"
        )


@router.get("/examples/{example_name}", response_model=ContextResponse)
async def get_example(example_name: str):
    """
    Get an example LaTeX template

    - **example_name**: Name of the example (two_column_resume, academic_cv, creative_resume, complex_layout)
    """
    try:
        context_manager = AIContextManager()

        example = context_manager.get_example(example_name)

        if not example:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Example template not found: {example_name}"
            )

        return {
            "success": True,
            "data": example
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get example: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get example template: {str(e)}"
        )


@router.get("/best-practices/{topic}", response_model=ContextResponse)
async def get_best_practices(topic: str):
    """
    Get best practices documentation

    - **topic**: Topic name (resume_design, color_theory, typography)
    """
    try:
        context_manager = AIContextManager()

        practices = context_manager.get_best_practices(topic)

        if not practices:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Best practices not found: {topic}"
            )

        return {
            "success": True,
            "data": practices
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get best practices: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get best practices: {str(e)}"
        )


@router.get("/snippets/{snippet_name}", response_model=ContextResponse)
async def get_snippet(snippet_name: str):
    """
    Get a reusable template snippet

    - **snippet_name**: Name of the snippet (header_styles, section_formats)
    """
    try:
        context_manager = AIContextManager()

        snippet = context_manager.get_template_snippet(snippet_name)

        if not snippet:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Template snippet not found: {snippet_name}"
            )

        return {
            "success": True,
            "data": snippet
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get snippet: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get template snippet: {str(e)}"
        )


@router.post("/detect", response_model=ContextResponse)
async def detect_needed_context(request: DetectContextRequest):
    """
    Analyze user request and detect needed context

    - **user_request**: User's request or prompt

    Returns recommended context items based on keywords
    """
    try:
        context_manager = AIContextManager()

        context_needs = context_manager.detect_needed_context(request.user_request)

        return {
            "success": True,
            "data": {
                "user_request": request.user_request,
                "detected_context": context_needs
            }
        }

    except Exception as e:
        logger.error(f"Failed to detect context: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to detect needed context: {str(e)}"
        )


@router.post("/build", response_model=ContextResponse)
async def build_context_prompt(request: BuildContextRequest):
    """
    Build a comprehensive context prompt from specified items

    - **packages**: List of package names to include
    - **examples**: List of example names to include
    - **best_practices**: List of best practices to include
    - **snippets**: List of snippet names to include
    - **max_tokens**: Maximum tokens to include (approximate)

    Returns formatted context string ready for AI prompt injection
    """
    try:
        context_manager = AIContextManager()

        context_needs = {
            "packages": request.packages or [],
            "examples": request.examples or [],
            "best_practices": request.best_practices or [],
            "snippets": request.snippets or []
        }

        context_prompt = context_manager.build_context_prompt(
            context_needs,
            max_tokens=request.max_tokens
        )

        return {
            "success": True,
            "data": {
                "context_prompt": context_prompt,
                "character_count": len(context_prompt),
                "approximate_tokens": len(context_prompt) // 4,
                "included_items": context_needs
            }
        }

    except Exception as e:
        logger.error(f"Failed to build context prompt: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to build context prompt: {str(e)}"
        )


@router.get("/list", response_model=ContextResponse)
async def list_available_context():
    """
    List all available context files

    Returns lists of available files in each category
    """
    try:
        context_manager = AIContextManager()

        available = context_manager.list_available_context()

        return {
            "success": True,
            "data": available
        }

    except Exception as e:
        logger.error(f"Failed to list context: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list available context: {str(e)}"
        )


@router.post("/search", response_model=ContextListResponse)
async def search_context(request: SearchContextRequest):
    """
    Search for context files matching a query

    - **query**: Search query
    - **category**: Optional category to search in (packages, examples, best_practices, snippets)

    Returns list of matching files with metadata
    """
    try:
        context_manager = AIContextManager()

        results = context_manager.search_context(
            query=request.query,
            category=request.category
        )

        return {
            "success": True,
            "data": results
        }

    except Exception as e:
        logger.error(f"Failed to search context: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search context: {str(e)}"
        )


@router.get("/health", response_model=ContextResponse)
async def health_check():
    """
    Check if AI context system is operational

    Returns status of context directories
    """
    try:
        context_manager = AIContextManager()

        # Check each directory
        status_info = {
            "packages_dir": str(context_manager.packages_dir),
            "packages_exists": context_manager.packages_dir.exists(),
            "examples_dir": str(context_manager.examples_dir),
            "examples_exists": context_manager.examples_dir.exists(),
            "best_practices_dir": str(context_manager.best_practices_dir),
            "best_practices_exists": context_manager.best_practices_dir.exists(),
            "templates_dir": str(context_manager.templates_dir),
            "templates_exists": context_manager.templates_dir.exists()
        }

        # Get counts
        available = context_manager.list_available_context()
        status_info["available_counts"] = {
            "packages": len(available["packages"]),
            "examples": len(available["examples"]),
            "best_practices": len(available["best_practices"]),
            "snippets": len(available["snippets"])
        }

        # Determine overall health
        all_exist = all([
            status_info["packages_exists"],
            status_info["examples_exists"],
            status_info["best_practices_exists"],
            status_info["templates_exists"]
        ])

        status_info["healthy"] = all_exist

        return {
            "success": True,
            "data": status_info
        }

    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Health check failed: {str(e)}"
        )
