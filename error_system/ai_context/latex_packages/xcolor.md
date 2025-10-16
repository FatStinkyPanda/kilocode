# xcolor Package Documentation

## Overview

The `xcolor` package provides advanced color management capabilities for LaTeX documents, including color mixing, color models, and predefined color sets.

## Basic Usage

```latex
\usepackage{xcolor}
```

## Color Definition

### Named Colors

```latex
\color{red}           % Switch to red
\textcolor{blue}{text} % Blue text
```

### Custom Colors

```latex
\definecolor{mycolor}{RGB}{255,100,50}
\definecolor{darkblue}{HTML}{00008B}
\definecolor{lightgray}{gray}{0.9}
```

## Color Models

- **RGB**: `\definecolor{name}{RGB}{r,g,b}` (0-255)
- **rgb**: `\definecolor{name}{rgb}{r,g,b}` (0.0-1.0)
- **HTML**: `\definecolor{name}{HTML}{RRGGBB}` (hex)
- **gray**: `\definecolor{name}{gray}{value}` (0.0-1.0)
- **cmyk**: `\definecolor{name}{cmyk}{c,m,y,k}` (0.0-1.0)

## Color Mixing

```latex
\color{red!50}        % 50% red, 50% white
\color{red!75!blue}   % 75% red, 25% blue
\color{red!50!blue!30!white} % Complex mixing
```

## Coloring Elements

### Text

```latex
\textcolor{color}{text}
{\color{color} text}
```

### Backgrounds

```latex
\colorbox{color}{text}
\fcolorbox{framecolor}{bgcolor}{text}
```

### Page Elements

```latex
\pagecolor{color}     % Page background
```

## Predefined Color Sets

```latex
\usepackage[dvipsnames]{xcolor}  % 68 colors (Maroon, RoyalBlue, etc.)
\usepackage[svgnames]{xcolor}    % 151 colors
\usepackage[x11names]{xcolor}    % 317 colors
```

## Common Use Cases for Document Generation

### Professional Resume Colors

```latex
\definecolor{headercolor}{RGB}{44,62,80}      % Dark blue-gray
\definecolor{accentcolor}{RGB}{52,152,219}    % Bright blue
\definecolor{textcolor}{RGB}{44,62,80}        % Main text
\definecolor{lightgray}{gray}{0.95}           % Section backgrounds
```

### Business Plan Colors

```latex
\definecolor{corporate}{RGB}{0,51,102}        % Corporate blue
\definecolor{accent}{RGB}{255,102,0}          % Orange accent
\definecolor{success}{RGB}{39,174,96}         % Green for positive
\definecolor{warning}{RGB}{243,156,18}        % Amber warning
```

### Academic Document Colors

```latex
\definecolor{titlecolor}{RGB}{0,0,128}        % Navy blue
\definecolor{sectioncolor}{RGB}{70,70,70}     % Dark gray
\definecolor{linkcolor}{RGB}{0,0,200}         % Hyperlink blue
```

## Best Practices

1. **Limit Color Palette**: Use 2-4 colors maximum for professional documents
2. **Accessibility**: Ensure sufficient contrast (WCAG 4.5:1 for text)
3. **Print Considerations**: Test colors in grayscale
4. **Consistency**: Define colors once and reuse throughout document
5. **Professional Defaults**:
    - Avoid pure black (#000000), use #333333 or RGB(44,62,80)
    - Avoid pure white backgrounds for long documents
    - Use muted accent colors for professional contexts

## Common Pitfalls

- Don't use `\color{}` without braces `{}` as it affects all following text
- RGB values are 0-255, rgb values are 0.0-1.0
- Some PDF viewers may display colors differently
- Overuse of colors reduces readability

## Integration with Other Packages

### With TikZ

```latex
\begin{tikzpicture}
  \fill[red!30] (0,0) rectangle (2,1);
\end{tikzpicture}
```

### With Tables

```latex
\rowcolor{lightgray}
\cellcolor{blue!25}
```

### With Hyperref

```latex
\hypersetup{
  colorlinks=true,
  linkcolor=blue,
  urlcolor=cyan
}
```
