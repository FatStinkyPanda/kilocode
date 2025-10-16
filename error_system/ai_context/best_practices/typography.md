# Typography Best Practices for Documents

## Overview

Typography is the art and technique of arranging type. In professional documents, good typography enhances readability, establishes hierarchy, and conveys professionalism.

## Fundamental Concepts

### Typeface vs Font

- **Typeface**: The design (e.g., Helvetica)
- **Font**: Specific style and size (e.g., Helvetica Bold 12pt)

### Font Classifications

**Serif**

- Small decorative strokes at character ends
- Traditional, formal, readable in print
- Examples: Times New Roman, Georgia, Garamond
- **Use for**: Body text in print, traditional documents, academic papers

**Sans-Serif**

- No decorative strokes
- Clean, modern, readable on screens
- Examples: Arial, Helvetica, Calibri, Roboto
- **Use for**: Digital documents, modern resumes, headings

**Monospace**

- Fixed-width characters
- Technical, code-like appearance
- Examples: Courier, Consolas, Source Code Pro
- **Use for**: Code snippets, technical data, special emphasis

**Display**

- Decorative, attention-grabbing
- Not for body text
- **Use for**: Large headings, posters (rarely in professional docs)

## Font Selection

### Professional Fonts for Resumes

**Most Recommended (2024)**

1. **Calibri** - Modern, clean, default in MS Office
2. **Helvetica** - Timeless, professional, widely used
3. **Arial** - Universal, safe choice
4. **Garamond** - Elegant, space-efficient
5. **Georgia** - Readable, web-safe serif

**Also Good**

- Lato (modern, friendly)
- Open Sans (clean, readable)
- Roboto (contemporary)
- Cambria (modern serif)
- Palatino (distinctive serif)

**Avoid**

- Comic Sans (unprofessional)
- Papyrus (outdated)
- Brush Script (too casual)
- Impact (too aggressive)
- Curlz (juvenile)

### Font Pairing

**Serif + Sans-Serif** (Classic)

```
Headers: Arial (sans-serif)
Body: Georgia (serif)
```

**Sans + Sans** (Modern)

```
Headers: Montserrat Bold (geometric sans)
Body: Open Sans (humanist sans)
```

**Serif + Serif** (Traditional)

```
Headers: Garamond Bold
Body: Garamond Regular
```

**Same Family** (Safest)

```
Headers: Helvetica Bold
Body: Helvetica Regular
```

### LaTeX Font Setup

**XeLaTeX/LuaLaTeX (Modern)**

```latex
\usepackage{fontspec}

% Single font family
\setmainfont{Calibri}

% Multiple fonts
\setmainfont{Georgia}           % Body
\setsansfont{Helvetica}         % Sans-serif
\setmonofont{Courier New}       % Monospace

% Custom families
\newfontfamily\headerfont{Arial}[UprightFont=*-Bold]
```

**pdfLaTeX (Legacy)**

```latex
% Default Computer Modern
% Or load font packages
\usepackage{times}              % Times Roman
\usepackage{helvet}             % Helvetica
\usepackage{palatino}           % Palatino
```

## Font Sizes

### Standard Sizes for Documents

```
Name/Title:           18-28pt
Major headings:       14-16pt
Section headers:      12-14pt
Job titles:           11-12pt
Body text:            10-11pt (never below 10pt)
Small text:           9pt (captions, footnotes)
```

### Size Hierarchy

**Rule**: Maintain clear distinction

```
Heading:  14pt
Subhead:  12pt
Body:     11pt
Caption:  9pt
```

**Avoid**: Similar sizes

```
Bad example:
Heading: 12pt, Subhead: 11pt, Body: 10pt (too subtle)
```

### LaTeX Font Sizes

**Relative sizing** (preferred)

```latex
\tiny
\scriptsize
\footnotesize
\small
\normalsize
\large
\Large
\LARGE
\huge
\Huge
```

**Absolute sizing**

```latex
\fontsize{size}{baseline skip}\selectfont
\fontsize{14pt}{17pt}\selectfont Large text
```

## Line Spacing (Leading)

### Optimal Line Spacing

**General rule**: 120-145% of font size

```
10pt font → 12-14.5pt line spacing
11pt font → 13.2-15.95pt line spacing
12pt font → 14.4-17.4pt line spacing
```

### LaTeX Line Spacing

**Package approach**

```latex
\usepackage{setspace}

\singlespacing          % 1.0
\onehalfspacing         % 1.5
\doublespacing          % 2.0
\setstretch{1.15}       % Custom
```

**Direct approach**

```latex
\linespread{1.05}       % Slightly more than single
\renewcommand{\baselinestretch}{1.15}
```

### Context-Specific

**Tight spacing** (resumes)

```latex
\setstretch{1.0} to \setstretch{1.08}
```

**Standard** (business docs)

```latex
\setstretch{1.15} to \setstretch{1.25}
```

**Loose** (academic papers)

```latex
\doublespacing  % Often required
```

## Letter Spacing (Tracking)

### When to Adjust

**Increase tracking for**:

- ALL CAPS TEXT
- Small font sizes
- Light text on dark backgrounds

**Decrease tracking for**:

- Titles with limited space
- Very large text

### LaTeX Letter Spacing

```latex
\usepackage{microtype}  % Automatic micro-adjustments

% Manual (requires soul or letterspace package)
\usepackage{soul}
\setstretch{0.1}\textls[100]{TEXT}
```

## Word Spacing

### Optimal Spacing

- **Too tight**: Words run together
- **Too loose**: "Rivers" of white space
- **Just right**: Comfortable reading rhythm

### LaTeX Control

```latex
% Space after periods
\frenchspacing          % Single space (modern)
\nonfrenchspacing       % Double space (traditional)

% Manual adjustments
\,   % thin space
\:   % medium space
\;   % thick space
\    % normal space
\quad % em space
\qquad % 2em space
```

## Alignment

### Types

**Left-aligned** (Recommended)

- Most readable for multi-line text
- Natural reading pattern
- Use for body text, bullet points

**Centered**

- Good for titles, headers
- Avoid for body text (hard to read)
- Use for name on resume

**Right-aligned**

- Unusual, use sparingly
- Good for dates, page numbers
- Can work for contact info

**Justified**

- Even left and right edges
- Can create awkward spacing
- Requires hyphenation
- Professional look but readability issues

### LaTeX Alignment

```latex
\begin{flushleft}
Left-aligned text
\end{flushleft}

\begin{center}
Centered text
\end{center}

\begin{flushright}
Right-aligned text
\end{flushright}

% Justified (default)
Regular paragraph text
```

### Ragged Right vs Justified

**Ragged right** (left-aligned)

- Better for narrow columns
- More even word spacing
- Easier to read
- Recommended for resumes

**Justified**

- More formal appearance
- Can look cleaner
- Requires good hyphenation
- Use for business reports, books

## Hierarchy and Emphasis

### Creating Hierarchy

**Size**

```
Level 1: 16pt bold
Level 2: 14pt bold
Level 3: 12pt bold
Body: 11pt regular
```

**Weight**

```
Headers: Bold
Subheaders: Semi-bold or bold
Body: Regular
Captions: Regular or light
```

**Color**

```
Primary headers: Dark blue
Secondary headers: Medium gray
Body: Dark gray
Metadata: Light gray
```

**Spacing**

```
Large space before major sections
Medium space before subsections
Small space between paragraphs
```

### Emphasis Techniques

**Bold** - Strong emphasis

- Job titles
- Company names
- Section headers
- Keywords (use sparingly)

**Italic** - Subtle emphasis

- Job locations
- Dates
- Book titles
- Foreign words

**UPPERCASE** - Maximum emphasis

- Section headers only
- Use sparingly (reduces readability)

**Color** - Visual emphasis

- Links
- Accents
- Important keywords

**Size** - Hierarchical emphasis

- Headers larger than body
- Name largest element

### LaTeX Emphasis

```latex
\textbf{Bold text}
\textit{Italic text}
\textsc{Small Caps}
\underline{Underlined} (avoid)
\textcolor{blue}{Colored}

% Semantic emphasis
\emph{Emphasis} (usually italic)
```

## Special Typography Elements

### Ligatures

Common ligatures: fi, fl, ff, ffi, ffl

```latex
\usepackage{fontspec}
\setmainfont{Font Name}[Ligatures=TeX]
```

### Small Caps

Use for subtle emphasis

```latex
\textsc{Small Caps Text}
```

### Oldstyle vs Lining Figures

**Lining** (default): 0123456789 - uniform height
**Oldstyle**: Varying heights, more elegant

```latex
\usepackage{fontspec}
\setmainfont{Font}[Numbers=OldStyle]  % or Numbers=Lining
```

### Hyphenation

**Enable hyphenation**

```latex
\usepackage[english]{babel}
\hyphenation{spe-cial-word}  % Custom rules
```

**Disable hyphenation**

```latex
\hyphenpenalty=10000
\exhyphenpenalty=10000
```

## Document-Specific Guidelines

### Resume/CV

**Font choice**: Sans-serif preferred (Calibri, Helvetica, Arial)
**Size**: 10-11pt body, 18-24pt name
**Line spacing**: 1.0-1.08 (tight)
**Alignment**: Left or justified
**Emphasis**: Bold for titles/companies, italic for locations

```latex
\setmainfont{Calibri}[Scale=1.0]
\setstretch{1.05}
```

### Business Letter

**Font choice**: Serif (Times, Georgia) or Sans (Arial)
**Size**: 11-12pt
**Line spacing**: 1.15-1.25
**Alignment**: Left (modern) or justified (traditional)

### Academic Paper

**Font choice**: Times New Roman, Garamond (or institutional requirement)
**Size**: 12pt (often required)
**Line spacing**: Double (often required)
**Alignment**: Left or justified

### Business Plan

**Font choice**: Professional sans (Calibri, Arial) for headers, serif for body
**Size**: 11-12pt body
**Line spacing**: 1.15-1.5
**Alignment**: Justified preferred

## Readability Principles

### Line Length

**Optimal**: 50-75 characters per line (including spaces)
**Acceptable**: 45-90 characters
**Formula**: 2-3 alphabets (65-78 characters)

**Too short**: Choppy reading, frequent line breaks
**Too long**: Readers lose place

### Measure Control

```latex
\usepackage{geometry}
\geometry{textwidth=6.5in}  % ~65 characters at 12pt

% Two columns for better measure
\usepackage{multicol}
\begin{multicols}{2}
Content
\end{multicols}
```

### Contrast

**Minimum contrast**: 4.5:1 (WCAG AA)
**Recommended**: 7:1 or higher

**Good**:

- Black on white: 21:1
- #333 on white: 12.6:1

**Poor**:

- Light gray on white: <3:1
- Yellow on white: <2:1

### Paragraph Spacing

**Modern style**: No indent, space between paragraphs

```latex
\setlength{\parindent}{0pt}
\setlength{\parskip}{0.5em}
```

**Traditional style**: Indent, no space

```latex
\setlength{\parindent}{1em}
\setlength{\parskip}{0pt}
```

## Common Mistakes

### Typography Mistakes to Avoid

1. **Too many fonts**: Limit to 2-3 families maximum
2. **Inconsistent sizing**: Use defined hierarchy
3. **Poor contrast**: Ensure readability
4. **Over-emphasis**: Too much bold/italic/color
5. **All caps body text**: Hard to read
6. **Centered body text**: Difficult to follow
7. **Tiny fonts**: Never below 10pt for body
8. **Tight line spacing**: Text feels cramped
9. **Excessive justification**: Creates rivers of white space
10. **Mixing alignment**: Be consistent

### LaTeX-Specific Mistakes

1. **Wrong quotes**: Use `` and '' not " "
2. **Double hyphens**: Use --- for em-dash, -- for en-dash
3. **Missing space after period**: LaTeX handles this, but be aware
4. **Unnecessary formatting**: Let LaTeX handle typography

## Advanced Techniques

### Hanging Indentation

For bullet points and references

```latex
\begin{itemize}[leftmargin=*]
\item Text with hanging indent
\end{itemize}
```

### Drop Caps

```latex
\usepackage{lettrine}
\lettrine{F}{irst} word...
```

### Optical Margins

```latex
\usepackage{microtype}
\usepackage{hanging}
```

### Kerning

Microtype handles most cases automatically

```latex
\usepackage{microtype}
```

## Professional Polish

### Final Checklist

Typography review:

- [ ] Consistent font family throughout
- [ ] Appropriate font size (10pt minimum)
- [ ] Clear hierarchy (3-4 levels max)
- [ ] Sufficient contrast (4.5:1 minimum)
- [ ] Readable line length (50-75 characters)
- [ ] Appropriate line spacing (120-145% of font size)
- [ ] Consistent alignment
- [ ] Minimal emphasis (not overdone)
- [ ] No orphans/widows (single lines at page breaks)
- [ ] Professional font choice for industry

### Testing Readability

1. **Squint test**: Can you see hierarchy at a glance?
2. **10-foot test**: Can you read headers from 10 feet?
3. **Speed test**: Can you quickly scan for information?
4. **Print test**: Does it look good printed?
5. **Peer review**: Have others read it

## Quick Reference

### Font Size Scale

```
Name:     20-24pt (or larger)
H1:       16pt
H2:       14pt
H3:       12pt
Body:     11pt
Small:    9pt
```

### Line Spacing Scale

```
Tight:    1.0-1.08  (resumes)
Normal:   1.15-1.25 (business)
Loose:    1.5-2.0   (academic)
```

### Font Recommendations by Industry

```
Tech:         Calibri, Roboto, Open Sans
Finance:      Times New Roman, Georgia, Garamond
Creative:     Helvetica, Lato, Montserrat
Academic:     Times New Roman, Computer Modern
Legal:        Times New Roman, Century Schoolbook
Healthcare:   Arial, Calibri, Verdana
```

## Conclusion

Good typography is invisible - it guides the reader without being noticed. Key principles:

1. **Consistency** - Use systematic sizing and spacing
2. **Hierarchy** - Make structure obvious
3. **Readability** - Ensure comfortable reading
4. **Professionalism** - Choose appropriate fonts
5. **Simplicity** - Avoid over-designing

Remember: Typography should enhance content, never distract from it.
