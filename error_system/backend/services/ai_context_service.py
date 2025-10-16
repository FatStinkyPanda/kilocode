"""
AI Context Manager Service
Manages LaTeX documentation, examples, and best practices for AI context injection
"""
import os
from typing import Dict, List, Optional, Any
from pathlib import Path
import re

from backend.utils.logger import get_logger

logger = get_logger()


class AIContextManager:
    """Manages AI context files for LaTeX generation"""

    def __init__(self, context_dir: str = "ai_context"):
        """
        Initialize AI Context Manager

        Args:
            context_dir: Path to AI context directory
        """
        self.context_dir = Path(context_dir)
        self.packages_dir = self.context_dir / "latex_packages"
        self.examples_dir = self.context_dir / "examples"
        self.best_practices_dir = self.context_dir / "best_practices"
        self.templates_dir = self.context_dir / "templates"

        logger.info(f"AI Context Manager initialized with directory: {self.context_dir}")

    def get_package_docs(self, package_name: str) -> Optional[Dict[str, Any]]:
        """
        Get documentation for a LaTeX package

        Args:
            package_name: Name of the package (e.g., 'xcolor', 'geometry')

        Returns:
            Dictionary with package documentation or None if not found
        """
        try:
            package_file = self.packages_dir / f"{package_name}.md"

            if not package_file.exists():
                logger.warning(f"Package documentation not found: {package_name}")
                return None

            with open(package_file, 'r', encoding='utf-8') as f:
                content = f.read()

            logger.info(f"Retrieved documentation for package: {package_name}")

            return {
                "package_name": package_name,
                "file_path": str(package_file),
                "content": content,
                "content_length": len(content)
            }

        except Exception as e:
            logger.error(f"Error reading package documentation for {package_name}: {str(e)}")
            return None

    def get_example(self, example_name: str) -> Optional[Dict[str, Any]]:
        """
        Get an example LaTeX template

        Args:
            example_name: Name of the example (e.g., 'two_column_resume', 'academic_cv')

        Returns:
            Dictionary with example content or None if not found
        """
        try:
            # Try with .tex extension
            example_file = self.examples_dir / f"{example_name}.tex"

            if not example_file.exists():
                logger.warning(f"Example template not found: {example_name}")
                return None

            with open(example_file, 'r', encoding='utf-8') as f:
                content = f.read()

            logger.info(f"Retrieved example template: {example_name}")

            return {
                "example_name": example_name,
                "file_path": str(example_file),
                "content": content,
                "content_length": len(content)
            }

        except Exception as e:
            logger.error(f"Error reading example template {example_name}: {str(e)}")
            return None

    def get_best_practices(self, topic: str) -> Optional[Dict[str, Any]]:
        """
        Get best practices documentation

        Args:
            topic: Topic name (e.g., 'resume_design', 'color_theory', 'typography')

        Returns:
            Dictionary with best practices content or None if not found
        """
        try:
            practices_file = self.best_practices_dir / f"{topic}.md"

            if not practices_file.exists():
                logger.warning(f"Best practices not found: {topic}")
                return None

            with open(practices_file, 'r', encoding='utf-8') as f:
                content = f.read()

            logger.info(f"Retrieved best practices: {topic}")

            return {
                "topic": topic,
                "file_path": str(practices_file),
                "content": content,
                "content_length": len(content)
            }

        except Exception as e:
            logger.error(f"Error reading best practices for {topic}: {str(e)}")
            return None

    def get_template_snippet(self, snippet_name: str) -> Optional[Dict[str, Any]]:
        """
        Get a reusable template snippet

        Args:
            snippet_name: Name of the snippet (e.g., 'header_styles', 'section_formats')

        Returns:
            Dictionary with snippet content or None if not found
        """
        try:
            snippet_file = self.templates_dir / f"{snippet_name}.tex"

            if not snippet_file.exists():
                logger.warning(f"Template snippet not found: {snippet_name}")
                return None

            with open(snippet_file, 'r', encoding='utf-8') as f:
                content = f.read()

            logger.info(f"Retrieved template snippet: {snippet_name}")

            return {
                "snippet_name": snippet_name,
                "file_path": str(snippet_file),
                "content": content,
                "content_length": len(content)
            }

        except Exception as e:
            logger.error(f"Error reading template snippet {snippet_name}: {str(e)}")
            return None

    def detect_needed_context(self, user_request: str) -> Dict[str, List[str]]:
        """
        Analyze user request and determine what context to include

        Args:
            user_request: User's request or prompt

        Returns:
            Dictionary with recommended context items
        """
        logger.info("Analyzing user request for context needs")

        context_needs = {
            "packages": [],
            "examples": [],
            "best_practices": [],
            "snippets": []
        }

        # Convert to lowercase for matching
        request_lower = user_request.lower()

        # Package detection
        package_keywords = {
            "xcolor": ["color", "colored", "rgb", "hex", "palette"],
            "geometry": ["margin", "page size", "layout", "paper"],
            "fontspec": ["font", "typeface", "typography", "arial", "calibri"],
            "tikz": ["graphic", "diagram", "visual", "icon", "chart", "shape"],
            "multicol": ["column", "two-column", "multi-column"],
            "hyperref": ["link", "url", "hyperlink", "clickable"],
            "biblatex": ["citation", "bibliography", "reference", "publication"]
        }

        for package, keywords in package_keywords.items():
            if any(keyword in request_lower for keyword in keywords):
                context_needs["packages"].append(package)

        # Example detection
        example_keywords = {
            "two_column_resume": ["two column", "2 column", "sidebar", "two-column"],
            "academic_cv": ["academic", "cv", "research", "publication", "phd"],
            "creative_resume": ["creative", "design", "visual", "colorful", "modern design"],
            "complex_layout": ["complex", "advanced layout", "sophisticated", "custom design"]
        }

        for example, keywords in example_keywords.items():
            if any(keyword in request_lower for keyword in keywords):
                context_needs["examples"].append(example)

        # Best practices detection
        practices_keywords = {
            "resume_design": ["resume", "cv", "professional", "job application"],
            "color_theory": ["color", "palette", "rgb", "contrast"],
            "typography": ["font", "text", "typography", "readability", "typeface"]
        }

        for practice, keywords in practices_keywords.items():
            if any(keyword in request_lower for keyword in keywords):
                context_needs["best_practices"].append(practice)

        # Snippet detection
        snippet_keywords = {
            "header_styles": ["header", "name", "contact info", "top section"],
            "section_formats": ["section", "heading", "experience section", "education"]
        }

        for snippet, keywords in snippet_keywords.items():
            if any(keyword in request_lower for keyword in keywords):
                context_needs["snippets"].append(snippet)

        # Remove duplicates
        for key in context_needs:
            context_needs[key] = list(set(context_needs[key]))

        logger.info(f"Context detection complete: {context_needs}")
        return context_needs

    def build_context_prompt(self, context_needs: Dict[str, List[str]],
                            max_tokens: int = 50000) -> str:
        """
        Build a comprehensive context prompt from detected needs

        Args:
            context_needs: Dictionary of needed context items
            max_tokens: Maximum tokens to include (approximate)

        Returns:
            Formatted context string
        """
        logger.info("Building context prompt")

        context_parts = []
        current_tokens = 0  # Rough estimate: 1 token ≈ 4 characters

        # Add packages
        for package in context_needs.get("packages", []):
            if current_tokens >= max_tokens:
                break

            docs = self.get_package_docs(package)
            if docs:
                part = f"\n## LaTeX Package: {package}\n\n{docs['content']}\n"
                context_parts.append(part)
                current_tokens += len(part) // 4

        # Add examples
        for example in context_needs.get("examples", []):
            if current_tokens >= max_tokens:
                break

            example_data = self.get_example(example)
            if example_data:
                part = f"\n## Example Template: {example}\n\n```latex\n{example_data['content']}\n```\n"
                context_parts.append(part)
                current_tokens += len(part) // 4

        # Add best practices
        for practice in context_needs.get("best_practices", []):
            if current_tokens >= max_tokens:
                break

            practices_data = self.get_best_practices(practice)
            if practices_data:
                part = f"\n## Best Practices: {practice}\n\n{practices_data['content']}\n"
                context_parts.append(part)
                current_tokens += len(part) // 4

        # Add snippets
        for snippet in context_needs.get("snippets", []):
            if current_tokens >= max_tokens:
                break

            snippet_data = self.get_template_snippet(snippet)
            if snippet_data:
                part = f"\n## Template Snippet: {snippet}\n\n```latex\n{snippet_data['content']}\n```\n"
                context_parts.append(part)
                current_tokens += len(part) // 4

        full_context = "".join(context_parts)

        logger.info(f"Context prompt built: {len(full_context)} characters, ~{current_tokens} tokens")
        return full_context

    def list_available_context(self) -> Dict[str, List[str]]:
        """
        List all available context files

        Returns:
            Dictionary with lists of available files in each category
        """
        logger.info("Listing available context files")

        available = {
            "packages": [],
            "examples": [],
            "best_practices": [],
            "snippets": []
        }

        try:
            # List packages
            if self.packages_dir.exists():
                available["packages"] = [
                    f.stem for f in self.packages_dir.glob("*.md")
                ]

            # List examples
            if self.examples_dir.exists():
                available["examples"] = [
                    f.stem for f in self.examples_dir.glob("*.tex")
                ]

            # List best practices
            if self.best_practices_dir.exists():
                available["best_practices"] = [
                    f.stem for f in self.best_practices_dir.glob("*.md")
                ]

            # List snippets
            if self.templates_dir.exists():
                available["snippets"] = [
                    f.stem for f in self.templates_dir.glob("*.tex")
                ]

            logger.info(f"Available context files: {available}")
            return available

        except Exception as e:
            logger.error(f"Error listing available context: {str(e)}")
            return available

    def search_context(self, query: str, category: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Search for context files matching a query

        Args:
            query: Search query
            category: Optional category to search in (packages, examples, best_practices, snippets)

        Returns:
            List of matching files with metadata
        """
        logger.info(f"Searching context for: {query} in category: {category}")

        results = []
        query_lower = query.lower()

        categories_to_search = {}
        if category:
            if category == "packages":
                categories_to_search = {"packages": self.packages_dir}
            elif category == "examples":
                categories_to_search = {"examples": self.examples_dir}
            elif category == "best_practices":
                categories_to_search = {"best_practices": self.best_practices_dir}
            elif category == "snippets":
                categories_to_search = {"snippets": self.templates_dir}
        else:
            categories_to_search = {
                "packages": self.packages_dir,
                "examples": self.examples_dir,
                "best_practices": self.best_practices_dir,
                "snippets": self.templates_dir
            }

        try:
            for cat_name, cat_dir in categories_to_search.items():
                if not cat_dir.exists():
                    continue

                for file_path in cat_dir.glob("*"):
                    # Check filename match
                    if query_lower in file_path.stem.lower():
                        results.append({
                            "category": cat_name,
                            "name": file_path.stem,
                            "file_path": str(file_path),
                            "match_type": "filename"
                        })
                        continue

                    # Check content match
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                            if query_lower in content.lower():
                                # Find context around match
                                match_pos = content.lower().find(query_lower)
                                context_start = max(0, match_pos - 100)
                                context_end = min(len(content), match_pos + 100)
                                context_snippet = content[context_start:context_end]

                                results.append({
                                    "category": cat_name,
                                    "name": file_path.stem,
                                    "file_path": str(file_path),
                                    "match_type": "content",
                                    "snippet": context_snippet
                                })
                    except Exception as e:
                        logger.warning(f"Error reading file {file_path}: {str(e)}")
                        continue

            logger.info(f"Search found {len(results)} results")
            return results

        except Exception as e:
            logger.error(f"Error searching context: {str(e)}")
            return results
