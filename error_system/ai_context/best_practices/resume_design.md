# Resume Design Best Practices

## Overview

A well-designed resume combines visual appeal with readability and professional standards. This guide covers essential design principles for creating effective resumes.

## General Principles

### 1. Readability First

- **Primary goal**: Information must be easily scannable
- **Reading pattern**: Design for F-pattern or Z-pattern eye movement
- **Hierarchy**: Most important information should be most prominent

### 2. Professional Standards

- **Page count**: 1 page for <10 years experience, 2 pages for senior roles
- **File format**: PDF only (preserves formatting)
- **File size**: Keep under 2MB for email compatibility
- **ATS compatibility**: Many companies use Applicant Tracking Systems

## Layout Guidelines

### Margins

```
Recommended margins:
- Standard professional: 0.75-1 inch all sides
- Space-efficient: 0.5-0.75 inch all sides
- Modern minimal: 0.4-0.6 inch all sides
```

**Trade-offs:**

- Larger margins = more white space, easier to read
- Smaller margins = more content, potentially cramped

### Sections Order (Traditional)

1. Header (Name, contact info)
2. Professional Summary (optional, 2-3 sentences)
3. Experience (reverse chronological)
4. Education
5. Skills
6. Additional (Projects, Certifications, Publications)

### Alternative Layouts

- **Two-column**: Contact/skills sidebar + main content
- **Skills-first**: Skills before experience (for career changers)
- **Functional**: Group by skill area (for diverse background)

## Typography

### Font Selection

**Serif Fonts** (Traditional/Professional)

- Times New Roman
- Georgia
- Garamond
- Palatino
- **Use for**: Law, finance, academia, traditional industries

**Sans-Serif Fonts** (Modern/Clean)

- Calibri (recommended default)
- Helvetica
- Arial
- Lato
- Open Sans
- Roboto
- **Use for**: Tech, design, creative, modern companies

### Font Sizes

```
Name: 18-24pt (can go larger for visual impact)
Section headers: 12-14pt
Job titles/degrees: 11-12pt
Body text: 10-11pt (never below 10pt)
Date ranges: 10-11pt (can be slightly smaller)
```

### Font Styling

- **Bold**: Section headers, job titles, company names, school names
- **Italic**: Job locations, degree types, dates (use sparingly)
- **ALL CAPS**: Section headers only (use sparingly, reduces readability)
- **Avoid**: Underline (use color or bold instead)

## Color Usage

### Professional Color Palettes

**Conservative (Finance, Law, Traditional)**

```
Primary text: #2C3E50 (dark blue-gray) or #333333
Headers: #1A1A1A or #000080 (navy)
Accents: #0066CC (professional blue)
Background: #FFFFFF (white)
```

**Modern Professional (Tech, Business)**

```
Primary text: #2C3E50
Headers: #34495E
Accents: #3498DB (bright blue)
Secondary accent: #2ECC71 (green)
Light backgrounds: #ECF0F1
```

**Creative (Design, Marketing)**

```
More flexibility, but maintain professionalism
Use 2-3 colors maximum
Ensure excellent contrast ratios
```

### Color Rules

1. **Contrast**: Minimum 4.5:1 for text (WCAG AA standard)
2. **Consistency**: Use same color scheme throughout
3. **Print-friendly**: Should look good in grayscale
4. **Avoid**: Pure black (#000000) - use #333333 instead
5. **Subtlety**: Colors should enhance, not distract

## White Space

### Importance

- Improves readability
- Creates visual hierarchy
- Reduces cognitive load
- Looks more professional

### Application

```latex
% Between sections
\vspace{0.3cm}

% Between entries
\vspace{0.2cm}

% After section headers
\vspace{0.15cm}

% Line spacing
\linespread{1.05} or \setstretch{1.05}
```

### Balance

- Too much white space = wasted space
- Too little = cramped, hard to read
- Goal: Comfortable breathing room

## Content Hierarchy

### Visual Weight Order

1. **Name**: Largest, boldest element
2. **Section headers**: Clear visual breaks
3. **Job titles/degrees**: Secondary emphasis
4. **Body text**: Standard weight and size
5. **Dates/locations**: De-emphasized (lighter or smaller)

### Techniques

- **Size**: Larger = more important
- **Weight**: Bold = more important
- **Color**: Darker or accent color = more important
- **Position**: Top and left = most attention

## ATS (Applicant Tracking System) Compatibility

### ATS-Friendly Practices

- Use standard fonts (Arial, Calibri, Times New Roman)
- Avoid text in headers/footers
- No images or graphics for critical info
- Use standard section headings
- Save as PDF (with text layer intact)
- Avoid tables for layout (use when necessary)
- Don't use text boxes

### Critical Sections to Label Clearly

- EXPERIENCE / WORK EXPERIENCE
- EDUCATION
- SKILLS
- CERTIFICATIONS

### Testing ATS Compatibility

- Copy-paste resume into plain text editor
- If formatting is readable, likely ATS-friendly
- Use online ATS scanners for verification

## Specific Design Patterns

### Header Styles

**Centered Traditional**

```
              JOHN DOE
           Software Engineer
    email@example.com | (555) 123-4567
        LinkedIn | GitHub | Portfolio
```

**Left-Aligned Modern**

```
JOHN DOE
Software Engineer
email@example.com | (555) 123-4567 | LinkedIn | GitHub
```

**Two-Column Header**

```
JOHN DOE                    email@example.com
Software Engineer           (555) 123-4567
                           LinkedIn | GitHub
```

### Section Headers

**Bold with Line**

```latex
\textbf{\large EXPERIENCE}
\hrule
```

**Colored with Icon**

```latex
\textcolor{blue}{\textbf{EXPERIENCE}}
```

**Background Fill**

```latex
% TikZ colored box with white text
```

## Bullet Points

### Formatting

- Use consistent bullet style (•, ○, –, ▸)
- Left-aligned with hanging indent
- 3-5 bullets per position (max 6-7 for current role)
- Start each bullet with action verb
- Include metrics when possible

### Spacing

```latex
\begin{itemize}[leftmargin=*, nosep]  % Compact
\begin{itemize}[leftmargin=*, itemsep=2pt]  % Slight spacing
```

## Common Mistakes to Avoid

### Design Mistakes

1. **Too many fonts**: Stick to 1-2 font families
2. **Poor contrast**: Text must be clearly readable
3. **Inconsistent spacing**: Maintain uniform spacing
4. **Over-decoration**: Graphics should enhance, not distract
5. **Tiny margins**: Need white space for readability
6. **Mixing styles**: Choose one style and stick to it

### Content Mistakes

1. **Generic objective statement**: Use targeted summary or omit
2. **Listing responsibilities**: Focus on achievements
3. **No metrics**: Quantify impact when possible
4. **Irrelevant information**: Tailor to job
5. **Typos/errors**: Proofread multiple times

## Industry-Specific Considerations

### Tech/Engineering

- Skills section prominent
- GitHub/portfolio links essential
- Projects section valuable
- Modern, clean design preferred

### Finance/Consulting

- Traditional, conservative design
- Emphasis on metrics and results
- Education often before experience (for early career)
- Prestigious affiliations highlighted

### Creative/Design

- More design freedom
- Visual portfolio link critical
- Design itself is portfolio piece
- Can break traditional rules (carefully)

### Academia

- CV format (multiple pages acceptable)
- Publications, grants, teaching prominent
- Traditional format expected
- Comprehensive rather than concise

## Accessibility

### Best Practices

1. **Sufficient contrast**: WCAG AA minimum (4.5:1)
2. **Clear hierarchy**: Logical document structure
3. **Readable fonts**: Minimum 10pt
4. **Consistent formatting**: Aids screen readers
5. **Alt text**: For any images (though avoid images for content)

### Testing

- Print in grayscale to check contrast
- View at 150% zoom to check readability
- Have others review for clarity

## Modern Trends (2024-2025)

### Popular

- Two-column layouts
- Subtle color accents
- Icons for contact info
- QR codes to portfolio
- Clean, minimal designs
- Sans-serif fonts

### Avoid

- Overly decorative graphics
- Complex graphics that don't print well
- Excessive color
- Outdated fonts (Comic Sans, Papyrus, etc.)
- Personal photos (in US resumes)

## Tools and Resources

### Color Tools

- Coolors.co - color palette generator
- Contrast Checker - WCAG compliance
- Adobe Color - color scheme designer

### Font Pairing

- Google Fonts - free font families
- FontPair - font combination suggestions

### Testing

- ATS resume scanner
- Print preview before finalizing
- PDF readers on different devices

## Final Checklist

Before submission:

- [ ] Consistent formatting throughout
- [ ] No typos or grammatical errors
- [ ] All dates and info accurate
- [ ] Readable in grayscale
- [ ] PDF format with embedded fonts
- [ ] File name: FirstName_LastName_Resume.pdf
- [ ] Contact info current and working
- [ ] Links working and professional
- [ ] Tailored to specific job/company
- [ ] 1-2 pages (appropriate for experience level)

## Key Takeaway

**Balance is key**: Professional appearance + easy readability + strong content = effective resume. Design should enhance content, never overshadow it.
