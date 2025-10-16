# fontspec Package Documentation

## Overview

The `fontspec` package provides advanced font selection capabilities for XeLaTeX and LuaLaTeX, allowing the use of system fonts and OpenType features.

**Important**: This package requires XeLaTeX or LuaLaTeX, not pdfLaTeX.

## Basic Usage

```latex
\usepackage{fontspec}
\setmainfont{Times New Roman}
```

## Compiler Check

```latex
% Recommended preamble
\usepackage{iftex}
\ifxetex
  \usepackage{fontspec}
\else\ifluatex
  \usepackage{fontspec}
\else
  % pdfLaTeX fallback
  \usepackage[T1]{fontenc}
  \usepackage{lmodern}
\fi\fi
```

## Font Selection

### Main Document Font

```latex
\setmainfont{Font Name}              % Roman/serif font
\setsansfont{Font Name}              % Sans-serif font
\setmonofont{Font Name}              % Monospace font
```

### Font Families

```latex
\newfontfamily\headerfont{Arial}
\newfontfamily\bodyfont{Georgia}

% Usage
{\headerfont Header Text}
{\bodyfont Body Text}
```

## Font Features

### OpenType Features

```latex
\setmainfont{Font Name}[
  Ligatures=TeX,              % Enable TeX ligatures (-- --- etc.)
  Numbers=OldStyle,           % Old-style figures
  Scale=1.0,                  % Scaling factor
  Color=000000                % Font color (hex)
]
```

### Weight and Style

```latex
\setmainfont{Font Name}[
  BoldFont=Font Name Bold,
  ItalicFont=Font Name Italic,
  BoldItalicFont=Font Name Bold Italic
]
```

## Common Professional Fonts

### Serif Fonts (Traditional/Professional)

```latex
\setmainfont{Times New Roman}        % Classic, readable
\setmainfont{Georgia}                % Web-safe, elegant
\setmainfont{Garamond}               % Elegant, condensed
\setmainfont{Palatino}               % Readable, distinctive
\setmainfont{Crimson Text}           % Modern serif
```

### Sans-Serif Fonts (Modern/Clean)

```latex
\setsansfont{Arial}                  % Standard, clean
\setsansfont{Helvetica}              % Professional, widely used
\setsansfont{Calibri}                % Modern, friendly
\setsansfont{Roboto}                 % Contemporary
\setsansfont{Open Sans}              % Friendly, readable
\setsansfont{Lato}                   % Professional, modern
```

### Monospace Fonts (Code/Technical)

```latex
\setmonofont{Courier New}            % Classic monospace
\setmonofont{Consolas}               % Modern, clear
\setmonofont{Source Code Pro}        % Adobe, readable
\setmonofont{Fira Code}              % With ligatures
```

## Complete Font Setup Examples

### Professional Resume

```latex
\usepackage{fontspec}
\setmainfont{Calibri}[
  Ligatures=TeX,
  Scale=1.0
]
\setsansfont{Arial}[
  Scale=MatchLowercase
]
\newfontfamily\headerfont{Helvetica Neue}[
  Scale=1.1,
  Color=2C3E50
]
```

### Academic CV

```latex
\usepackage{fontspec}
\setmainfont{Garamond}[
  Ligatures=TeX,
  Numbers=OldStyle
]
\setsansfont{Helvetica}[
  Scale=MatchLowercase
]
\setmonofont{Courier New}[
  Scale=0.9
]
```

### Modern Business

```latex
\usepackage{fontspec}
\setmainfont{Lato}[
  Ligatures=TeX,
  Scale=1.0,
  UprightFont=*-Regular,
  BoldFont=*-Bold,
  ItalicFont=*-Italic
]
\newfontfamily\titlefont{Montserrat}[
  Scale=1.2,
  UprightFont=*-Bold
]
```

## Font Size Commands

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

### Custom Font Sizes

```latex
\fontsize{size}{baselineskip}\selectfont

% Example
{\fontsize{14pt}{17pt}\selectfont Large text}
```

## Advanced Features

### Small Caps

```latex
\setmainfont{Font Name}[
  SmallCapsFont=Font Name SC
]

\textsc{Small Caps Text}
```

### Number Styles

```latex
\setmainfont{Font Name}[
  Numbers={Lining, Proportional}    % Modern, variable width
]
\setmainfont{Font Name}[
  Numbers={OldStyle, Tabular}       % Classical, fixed width
]
```

### Ligatures

```latex
\setmainfont{Font Name}[
  Ligatures=TeX,                    % -- --- `` ''
  Ligatures=Common,                 % ff fi fl ffi ffl
  Ligatures=Rare                    % ct st
]
```

## Best Practices for Document Types

### Resume/CV

- **Body**: Calibri, Helvetica, or Lato (10-11pt)
- **Headers**: Bold or different font family
- **Size**: 10-11pt body, 14-18pt name, 11-13pt section headers

```latex
\setmainfont{Calibri}[Scale=1.0]
\newfontfamily\namefont{Helvetica Neue}[Scale=1.5, UprightFont=*-Bold]
\newfontfamily\sectionfont{Helvetica}[Scale=1.1, UprightFont=*-Bold]
```

### Business Plans

- **Body**: Georgia, Garamond, or Times New Roman (11-12pt)
- **Headers**: Sans-serif for contrast (Arial, Helvetica)
- **Size**: 11-12pt body, 16-20pt title, 13-15pt headers

```latex
\setmainfont{Georgia}[Ligatures=TeX]
\setsansfont{Arial}
\newfontfamily\headerfont{Arial}[UprightFont=*-Bold]
```

### Academic Papers

- **Body**: Times New Roman, Garamond (12pt)
- **Consistent**: Same font throughout typically required
- **Size**: 12pt (institutional requirement)

```latex
\setmainfont{Times New Roman}[Ligatures=TeX, Scale=1.0]
```

## Font Availability

### Windows Default Fonts

- Arial, Calibri, Cambria, Consolas, Courier New, Georgia, Times New Roman, Verdana

### macOS Default Fonts

- Helvetica, Helvetica Neue, Times, Courier, Avenir, San Francisco

### Cross-Platform Safe

- Arial, Times New Roman, Courier New, Georgia, Verdana

### Google Fonts (Free)

- Roboto, Open Sans, Lato, Montserrat, Source Sans Pro, Crimson Text

## Fallback Strategy

```latex
\IfFontExistsTF{Helvetica Neue}{
  \setsansfont{Helvetica Neue}
}{
  \setsansfont{Arial}  % Fallback
}
```

## Common Issues

1. **Font not found**: Check font name exactly matches system font
2. **Ligatures not working**: Add `Ligatures=TeX`
3. **Bold not working**: Explicitly set `BoldFont`
4. **Compilation fails**: Ensure using XeLaTeX or LuaLaTeX, not pdfLaTeX

## Integration with Other Packages

### With xcolor

```latex
\usepackage{fontspec}
\usepackage{xcolor}
\newfontfamily\accentfont{Arial}[Color=2980B9]
```

### With hyperref

```latex
\usepackage{fontspec}
\usepackage{hyperref}
% fontspec should be loaded before hyperref
```

### With microtype

```latex
\usepackage{fontspec}
\usepackage{microtype}  % Improved typography
```

## Performance Considerations

- Font loading adds compilation time
- Limit number of font families (3-4 maximum)
- System fonts must be installed on compilation machine
- Consider embedding fonts in final PDF for distribution

## Document Generation Guidelines

1. **Check compiler**: Verify XeLaTeX/LuaLaTeX available
2. **Font availability**: Check fonts installed on system
3. **Fallbacks**: Provide alternative fonts if primary unavailable
4. **Consistency**: Use same fonts across document type (all resumes use same fonts)
5. **Accessibility**: Ensure minimum 10pt for body text
6. **Professional standards**:
    - Sans-serif for modern/tech: Calibri, Helvetica, Lato
    - Serif for traditional/academic: Times, Georgia, Garamond
