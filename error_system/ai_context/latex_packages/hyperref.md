# hyperref Package Documentation

## Overview

The `hyperref` package creates hyperlinks in PDF documents, including table of contents, citations, URLs, and custom links. Essential for modern digital documents.

## Basic Usage

```latex
\usepackage{hyperref}
```

**Important**: Load `hyperref` as one of the last packages (after most others).

## Configuration

### Basic Setup

```latex
\hypersetup{
  colorlinks=true,
  linkcolor=blue,
  urlcolor=cyan,
  citecolor=green,
  filecolor=magenta
}
```

### Professional Setup (Resume/CV)

```latex
\usepackage{xcolor}
\usepackage{hyperref}
\hypersetup{
  colorlinks=true,
  linkcolor=black,
  urlcolor=blue!60!black,
  pdftitle={John Doe - Resume},
  pdfauthor={John Doe},
  pdfsubject={Software Engineer Resume},
  pdfkeywords={software, engineer, python, javascript}
}
```

### Minimal Visible Links

```latex
\hypersetup{
  hidelinks              % No colored boxes or colored text
}
```

## Link Types

### URLs

```latex
\url{https://www.example.com}
\href{https://www.example.com}{Click here}
```

### Email

```latex
\href{mailto:email@example.com}{email@example.com}
```

### Internal Links

```latex
\section{Introduction}\label{sec:intro}
See Section \ref{sec:intro}           % Automatic hyperlink
```

### Custom Anchors

```latex
\hypertarget{target}{Target location}
\hyperlink{target}{Go to target}
```

## URL Formatting

### Break Long URLs

```latex
\usepackage{hyperref}
\usepackage{url}

\url{https://very-long-url.com/path/to/resource}
```

### Custom URL Style

```latex
\urlstyle{same}        % Same font as text
\urlstyle{tt}          % Typewriter font
\urlstyle{rm}          % Roman font
\urlstyle{sf}          % Sans-serif font
```

## PDF Metadata

### Document Properties

```latex
\hypersetup{
  pdftitle={Document Title},
  pdfauthor={Author Name},
  pdfsubject={Subject},
  pdfkeywords={keyword1, keyword2, keyword3},
  pdfcreator={LaTeX with hyperref},
  pdfproducer={XeLaTeX}
}
```

### For Resume/CV

```latex
\hypersetup{
  pdftitle={John Doe - Software Engineer Resume},
  pdfauthor={John Doe},
  pdfsubject={Resume - Software Engineering},
  pdfkeywords={Python, JavaScript, React, Node.js, AWS, Software Engineer}
}
```

## Link Appearance

### Colored Links

```latex
\hypersetup{
  colorlinks=true,
  linkcolor=red,         % Internal links
  urlcolor=blue,         % URLs
  citecolor=green,       % Citations
  anchorcolor=black,     % Anchor text
  filecolor=magenta      % File links
}
```

### Boxes Instead of Colors

```latex
\hypersetup{
  colorlinks=false,
  linkbordercolor=red,
  urlbordercolor=blue,
  pdfborderstyle={/S/U/W 1}  % Underline style
}
```

### No Visible Links

```latex
\hypersetup{
  hidelinks              % Completely invisible
}
```

## Use Cases for Document Generation

### Resume Contact Links

```latex
\begin{center}
  \href{mailto:john@example.com}{john@example.com} |
  \href{tel:+15551234567}{(555) 123-4567} |
  \href{https://linkedin.com/in/johndoe}{LinkedIn} |
  \href{https://github.com/johndoe}{GitHub}
\end{center}
```

### Portfolio Links

```latex
\section{Projects}
\textbf{\href{https://project-url.com}{Project Name}}\\
Description of the project...
```

### Professional Profile Links

```latex
\newcommand{\linkedin}[1]{%
  \href{https://linkedin.com/in/#1}{\includegraphics[height=10pt]{linkedin-icon} linkedin.com/in/#1}
}

\newcommand{\github}[1]{%
  \href{https://github.com/#1}{\texttt{github.com/#1}}
}
```

### Clickable Table of Contents

```latex
\tableofcontents       % Automatically hyperlinked with hyperref
```

### Reference Links

```latex
For more information, see \href{https://docs.example.com}{the documentation}.
```

## Complete Examples

### Professional Resume Header

```latex
\documentclass{article}
\usepackage[margin=0.75in]{geometry}
\usepackage{xcolor}
\usepackage{hyperref}

\hypersetup{
  colorlinks=true,
  linkcolor=black,
  urlcolor=blue!70!black,
  pdftitle={Jane Smith - Data Scientist Resume},
  pdfauthor={Jane Smith},
  pdfkeywords={data science, machine learning, python, statistics}
}

\begin{document}

\begin{center}
  {\Huge\textbf{Jane Smith}}\\[5pt]
  \href{mailto:jane.smith@email.com}{jane.smith@email.com} $|$
  \href{tel:+15551234567}{(555) 123-4567}\\
  \href{https://linkedin.com/in/janesmith}{linkedin.com/in/janesmith} $|$
  \href{https://github.com/janesmith}{github.com/janesmith} $|$
  \href{https://janesmith.dev}{janesmith.dev}
\end{center}

\section{Experience}
\textbf{Data Scientist} at \href{https://company.com}{Tech Company}\\
...

\end{document}
```

### Academic CV with References

```latex
\hypersetup{
  colorlinks=true,
  linkcolor=blue!50!black,
  urlcolor=blue!70!black,
  citecolor=green!50!black,
  pdftitle={Dr. John Doe - Curriculum Vitae},
  pdfauthor={Dr. John Doe}
}

\section{Publications}
\cite{doe2023}         % Hyperlinked citation

\section{References}
Available at \href{https://university.edu/~jdoe}{my university page}.
```

### Business Card with QR Code Link

```latex
\href{https://website.com}{%
  \includegraphics[width=2cm]{qr-code.png}
}
```

## Advanced Features

### Bookmark Levels

```latex
\pdfbookmark[0]{Title Page}{titlepage}
\pdfbookmark[1]{Section}{section}
```

### Open Links in New Window

```latex
\hypersetup{
  pdfnewwindow=true
}
```

### Custom Link Colors Per Link

```latex
\hypersetup{colorlinks=true, urlcolor=blue}
\href[urlcolor=red]{https://example.com}{Red link}
```

### PDF Display Options

```latex
\hypersetup{
  pdfstartview=FitH,       % Fit width
  pdfpagelayout=OneColumn, % Single page
  pdfpagemode=UseOutlines  % Show bookmarks
}
```

## Best Practices

### Resume/CV

1. **Minimal distraction**: Use `hidelinks` or subtle colors
2. **Professional URLs**: Link email, phone, LinkedIn, GitHub
3. **Portfolio**: Link projects to live demos or repositories
4. **Keywords**: Include relevant keywords in PDF metadata for searchability

```latex
\hypersetup{
  hidelinks,
  pdftitle={Name - Job Title Resume},
  pdfkeywords={skill1, skill2, skill3, job title}
}
```

### Business Documents

1. **Clear identification**: Color URLs distinctly
2. **Readable**: Ensure links work when printed
3. **Contact info**: Always link email and phone
4. **Metadata**: Complete PDF metadata for professionalism

### Academic Documents

1. **Citations**: Use colored citation links
2. **Cross-references**: Link figures, tables, sections
3. **Bibliography**: Link DOIs and URLs
4. **TOC**: Automatic hyperlinked table of contents

## Common Issues and Solutions

### Package Load Order

```latex
% Correct order
\usepackage{graphicx}
\usepackage{xcolor}
\usepackage{tikz}
% ... most packages ...
\usepackage{hyperref}      % Near the end
\usepackage{cleveref}      % After hyperref if used
```

### URL Line Breaking

```latex
\usepackage{hyperref}
\usepackage{xurl}          % Better URL breaking

% Or
\PassOptionsToPackage{hyphens}{url}
\usepackage{hyperref}
```

### Links Not Working

```latex
% Ensure label comes after caption
\caption{Figure}\label{fig:label}  % Correct
\label{fig:label}\caption{Figure}  % Wrong
```

### Special Characters in URLs

```latex
\href{https://example.com/file\%20name.pdf}{Link} % Escape with \
```

## Integration with Other Packages

### With cleveref

```latex
\usepackage{hyperref}
\usepackage{cleveref}      % Must be after hyperref

\cref{fig:example}         % "Figure 1" with hyperlink
```

### With xcolor

```latex
\usepackage{xcolor}
\usepackage{hyperref}

\definecolor{linkcolor}{RGB}{0,102,204}
\hypersetup{urlcolor=linkcolor}
```

### With fontspec (XeLaTeX)

```latex
\usepackage{fontspec}
% ... font setup ...
\usepackage{hyperref}
```

### With bookmark

```latex
\usepackage{hyperref}
\usepackage{bookmark}      % Enhanced bookmarks
```

## Security Considerations

- Avoid linking to sensitive URLs in public documents
- Check that all links work before distribution
- Consider privacy when including personal links
- Use URL shorteners for very long URLs (with caution)

## Accessibility

```latex
\hypersetup{
  pdfstartview=FitH,
  pdflang={en-US},
  pdfmetalang={en-US}
}
```

## Testing Links

- Compile with XeLaTeX or pdfLaTeX
- Open PDF in viewer (not all viewers support all features)
- Test all links before distribution
- Check appearance in print preview

## Document Type Recommendations

### Resume

```latex
\hypersetup{hidelinks}     % Clean, professional
% Or subtle colors
\hypersetup{colorlinks=true, urlcolor=blue!60!black, linkcolor=black}
```

### Academic Paper

```latex
\hypersetup{
  colorlinks=true,
  linkcolor=blue!50!black,
  citecolor=green!50!black,
  urlcolor=blue!70!black
}
```

### Business Plan

```latex
\hypersetup{
  colorlinks=true,
  linkcolor=blue!80!black,
  urlcolor=blue!60!black
}
```

### Interactive PDF

```latex
\hypersetup{
  colorlinks=true,
  linkcolor=red!70!black,
  urlcolor=blue,
  pdfborder={0 0 1}        % Visible borders
}
```
