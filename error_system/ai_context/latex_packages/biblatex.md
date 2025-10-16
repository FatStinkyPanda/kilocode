# biblatex Package Documentation

## Overview

`biblatex` is a modern bibliography management package for LaTeX that provides advanced features, flexible formatting, and better Unicode support than traditional BibTeX.

## Basic Usage

```latex
\usepackage[backend=biber, style=numeric]{biblatex}
\addbibresource{references.bib}

\begin{document}
Citation example \cite{key2023}.

\printbibliography
\end{document}
```

## Backend Options

```latex
\usepackage[backend=biber]{biblatex}    % Modern (recommended)
\usepackage[backend=bibtex]{biblatex}   % Legacy compatibility
```

## Citation Styles

### Numeric (Default)

```latex
\usepackage[style=numeric]{biblatex}
% Produces: [1], [2], etc.
```

### Author-Year

```latex
\usepackage[style=authoryear]{biblatex}
% Produces: (Smith, 2023)
```

### Alphabetic

```latex
\usepackage[style=alphabetic]{biblatex}
% Produces: [Smi23]
```

### APA Style

```latex
\usepackage[style=apa]{biblatex}
% Requires biblatex-apa package
```

### IEEE Style

```latex
\usepackage[style=ieee]{biblatex}
```

### Chicago Style

```latex
\usepackage[style=chicago-authordate]{biblatex}
```

## Bibliography File Format

### references.bib Example

```bibtex
@article{smith2023,
  author = {Smith, John and Doe, Jane},
  title = {Machine Learning Applications},
  journal = {Journal of AI Research},
  year = {2023},
  volume = {15},
  number = {3},
  pages = {245--267},
  doi = {10.1234/jair.2023.1234}
}

@book{johnson2022,
  author = {Johnson, Michael},
  title = {Deep Learning Fundamentals},
  publisher = {Tech Press},
  year = {2022},
  isbn = {978-1-234-56789-0}
}

@inproceedings{chen2023,
  author = {Chen, Wei and Zhang, Li},
  title = {Novel Neural Network Architecture},
  booktitle = {Proceedings of ICML 2023},
  year = {2023},
  pages = {1234--1245}
}

@online{website2023,
  author = {Organization},
  title = {Documentation Title},
  url = {https://example.com/docs},
  urldate = {2023-10-15}
}

@thesis{brown2021,
  author = {Brown, Sarah},
  title = {PhD Dissertation Title},
  type = {PhD thesis},
  institution = {University Name},
  year = {2021}
}
```

## Citation Commands

### Basic Citations

```latex
\cite{key}                % [1] or (Smith, 2023)
\cite[p.~5]{key}          % [1, p. 5]
\cite[see][]{key}         % [see 1]
```

### Text Citations

```latex
\textcite{key}            % Smith (2023) or Smith [1]
\citeauthor{key}          % Smith
\citeyear{key}            % 2023
\citetitle{key}           % Title
```

### Multiple Citations

```latex
\cite{key1,key2,key3}     % [1,2,3] or (Smith 2023; Doe 2022)
```

### Parenthetical Citations

```latex
\parencite{key}           % (Smith, 2023) or [1]
```

## Bibliography Printing

### Basic

```latex
\printbibliography
```

### With Title

```latex
\printbibliography[title={References}]
```

### By Type

```latex
\printbibliography[type=article, title={Journal Articles}]
\printbibliography[type=book, title={Books}]
```

### By Keyword

```latex
% In .bib file: keywords = {machine-learning}
\printbibliography[keyword=machine-learning, title={ML Papers}]
```

### Multiple Bibliographies

```latex
\printbibliography[heading=subbibliography, type=article, title={Articles}]
\printbibliography[heading=subbibliography, type=book, title={Books}]
```

## Configuration Options

### Basic Setup

```latex
\usepackage[
  backend=biber,
  style=numeric,
  sorting=nyt,              % Name, year, title
  maxbibnames=99,           % Show all authors
  maxcitenames=2,           % Show 2 authors in citations
  giveninits=true,          % Use initials for first names
  doi=true,                 % Include DOI
  url=true,                 % Include URL
  isbn=false                % Exclude ISBN
]{biblatex}
```

### Academic Paper Setup

```latex
\usepackage[
  backend=biber,
  style=authoryear,
  sorting=nyt,
  maxcitenames=2,
  maxbibnames=99,
  uniquename=init,
  uniquelist=true,
  doi=true,
  url=false,
  isbn=false
]{biblatex}
```

## Sorting Options

```latex
sorting=nty               % Name, title, year
sorting=nyt               % Name, year, title
sorting=nyvt              % Name, year, volume, title
sorting=anyt              % Alphabetic label, name, year, title
sorting=none              % Citation order
sorting=ynt               % Year, name, title
```

## Use Cases for Document Generation

### Resume/CV Publications Section

```latex
\documentclass{article}
\usepackage[backend=biber, style=numeric, sorting=ydnt]{biblatex}
\addbibresource{publications.bib}

\begin{document}

\section{Publications}
\nocite{*}                % Include all entries
\printbibliography[heading=none]

\end{document}
```

### Academic CV with Categorized Publications

```latex
\section{Publications}

\printbibliography[
  type=article,
  title={Journal Articles},
  heading=subbibliography
]

\printbibliography[
  type=inproceedings,
  title={Conference Papers},
  heading=subbibliography
]

\printbibliography[
  type=thesis,
  title={Theses},
  heading=subbibliography
]
```

### Business Plan References

```latex
\usepackage[backend=biber, style=apa]{biblatex}
\addbibresource{market-research.bib}

\section{Market Research}
According to recent studies \parencite{marketreport2023}, the industry...

\printbibliography[title={References}]
```

### Research Paper

```latex
\usepackage[
  backend=biber,
  style=ieee,
  sorting=none              % Citation order
]{biblatex}
\addbibresource{references.bib}

In \cite{smith2023}, the authors demonstrate...

\printbibliography
```

## Advanced Features

### Filtering

```latex
% Only show cited references (default)
\printbibliography

% Show all references including uncited
\nocite{*}
\printbibliography
```

### Custom Bibliography Headings

```latex
\defbibheading{myheading}[\bibname]{%
  \section*{#1}
  \markboth{#1}{#1}
}

\printbibliography[heading=myheading]
```

### Bibliography Categories

```latex
% In preamble
\DeclareBibliographyCategory{primary}
\addtocategory{primary}{key1,key2}

% In document
\printbibliography[category=primary, title={Primary Sources}]
```

### Bibliography Segments

```latex
\begin{refsegment}
  Citations in this segment \cite{key1}.
  \printbibliography[segment=\therefsegment, heading=subbibliography]
\end{refsegment}
```

## Customization

### Suppress Fields

```latex
\AtEveryBibitem{%
  \clearfield{note}
  \clearfield{issn}
  \clearfield{isbn}
  \clearfield{url}
}
```

### Custom Formatting

```latex
\DeclareFieldFormat{title}{\textit{#1}}     % Italicize titles
\DeclareFieldFormat{doi}{\texttt{doi:#1}}   % Format DOI
```

### Name Format

```latex
\DeclareNameAlias{author}{family-given}     % Last, First
\DeclareNameAlias{author}{given-family}     % First Last
```

## Entry Types

Common entry types in .bib files:

- `@article` - Journal article
- `@book` - Book
- `@inproceedings` - Conference paper
- `@incollection` - Book chapter
- `@thesis` - PhD/Master's thesis
- `@online` - Website
- `@misc` - Miscellaneous
- `@techreport` - Technical report
- `@patent` - Patent
- `@software` - Software

## Compilation

```bash
# Compile sequence
pdflatex document.tex
biber document
pdflatex document.tex
pdflatex document.tex

# Or with XeLaTeX
xelatex document.tex
biber document
xelatex document.tex
xelatex document.tex
```

## Best Practices

### General

1. Use `backend=biber` for modern documents
2. Choose appropriate citation style for field
3. Keep .bib file organized and consistent
4. Include DOIs for academic papers
5. Use `url` field for online resources

### Resume/CV

```latex
% Reverse chronological for publications
\usepackage[backend=biber, style=numeric, sorting=ydnt]{biblatex}
```

### Academic Papers

```latex
% Follow journal requirements
\usepackage[backend=biber, style=numeric]{biblatex}  % or authoryear
```

### Business Documents

```latex
% Clear, professional style
\usepackage[backend=biber, style=apa]{biblatex}
```

## Common Issues

### Bibliography Not Showing

- Run `biber document` (not `bibtex`)
- Check .bib file for syntax errors
- Ensure at least one `\cite{}` or `\nocite{*}`

### Compilation Errors

- Update biblatex and biber to matching versions
- Check for special characters in .bib file
- Use `\addbibresource{}` not `\bibliography{}`

### Duplicate Entries

- Use `uniquename` and `uniquelist` options
- Check for duplicate keys in .bib file

### URLs Not Breaking

```latex
\usepackage{xurl}          % Better URL breaking
\usepackage{biblatex}
```

## Integration with Other Packages

### With hyperref

```latex
\usepackage{hyperref}      % Load before biblatex
\usepackage{biblatex}

\hypersetup{
  colorlinks=true,
  citecolor=blue,
  linkcolor=blue,
  urlcolor=blue
}
```

### With cleveref

```latex
\usepackage{hyperref}
\usepackage{biblatex}
\usepackage{cleveref}
```

## Complete Example

```latex
\documentclass{article}
\usepackage[backend=biber, style=authoryear]{biblatex}
\usepackage{hyperref}

\addbibresource{references.bib}

\hypersetup{
  colorlinks=true,
  citecolor=blue,
  urlcolor=blue
}

\begin{document}

\section{Introduction}
Recent research \parencite{smith2023} demonstrates that...

According to \textcite{johnson2022}, the fundamental concepts...

Multiple studies \parencite{smith2023,johnson2022,chen2023} show...

\printbibliography[title={References}]

\end{document}
```

## Performance Tips

- Keep .bib file clean and organized
- Remove unused entries for faster compilation
- Use `sorting=none` for fastest compilation
- Consider splitting large bibliographies

## Localization

```latex
\usepackage[english]{babel}
\usepackage[backend=biber]{biblatex}

% Changes "Bibliography" to "References"
\DefineBibliographyStrings{english}{
  bibliography = {References}
}
```
