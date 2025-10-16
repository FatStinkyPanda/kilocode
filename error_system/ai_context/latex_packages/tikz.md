# TikZ Package Documentation

## Overview

TikZ is a powerful package for creating graphics programmatically in LaTeX. It's particularly useful for diagrams, charts, decorative elements, and custom designs in documents.

## Basic Usage

```latex
\usepackage{tikz}
\usetikzlibrary{shapes, positioning, arrows, calc}

\begin{tikzpicture}
  % Drawing commands here
\end{tikzpicture}
```

## Common Libraries

```latex
\usetikzlibrary{
  shapes,          % Additional shapes
  positioning,     % Relative positioning
  arrows,          % Arrow styles
  calc,            % Coordinate calculations
  decorations,     % Path decorations
  patterns,        % Fill patterns
  shadows,         % Drop shadows
  backgrounds,     % Background layers
  fit,             % Fitting nodes around others
  matrix           % Matrix layouts
}
```

## Basic Drawing

### Lines and Paths

```latex
\draw (0,0) -- (2,0);                    % Straight line
\draw (0,0) -- (1,1) -- (2,0);          % Path with multiple points
\draw (0,0) .. controls (1,1) .. (2,0); % Bezier curve
\draw[thick, red] (0,0) -- (2,0);       % Styled line
```

### Shapes

```latex
\draw (0,0) circle (1cm);                % Circle
\draw (0,0) ellipse (2cm and 1cm);      % Ellipse
\draw (0,0) rectangle (2,1);             % Rectangle
\draw (0,0) -- (2,0) -- (1,2) -- cycle; % Triangle
```

### Filling

```latex
\fill[blue] (0,0) circle (1cm);         % Filled circle
\fill[red!30] (0,0) rectangle (2,1);    % Semi-transparent fill
\filldraw[fill=blue!20, draw=blue] (0,0) circle (1cm); % Fill and draw
```

## Nodes and Text

### Basic Nodes

```latex
\node at (0,0) {Text};
\node[circle, draw] at (1,1) {Node};
\node[rectangle, fill=blue!20] at (2,0) {Box};
```

### Styled Nodes

```latex
\node[
  rectangle,
  rounded corners,
  draw=black,
  fill=blue!20,
  minimum width=3cm,
  minimum height=1cm,
  align=center
] at (0,0) {Styled Node};
```

### Positioning

```latex
\node (a) at (0,0) {A};
\node[right=of a] (b) {B};              % Requires positioning library
\node[above=2cm of a] (c) {C};
\node[below right=of a] (d) {D};
```

## Document Generation Use Cases

### Resume Section Dividers

```latex
\begin{tikzpicture}[remember picture, overlay]
  \fill[blue!20] (0,0) rectangle (\textwidth, 0.3cm);
  \node[right] at (0.2cm, 0.15cm) {\textbf{\color{white} EXPERIENCE}};
\end{tikzpicture}
```

### Header Decoration

```latex
\begin{tikzpicture}[remember picture, overlay]
  \fill[blue!60] (current page.north west) rectangle
                 ([yshift=-3cm]current page.north east);
  \node[white, font=\Huge\bfseries] at
        ([yshift=-1.5cm]current page.north) {John Doe};
\end{tikzpicture}
```

### Skill Bars

```latex
\newcommand{\skillbar}[2]{%
  \begin{tikzpicture}
    \fill[gray!20] (0,0) rectangle (5cm, 0.4cm);
    \fill[blue!60] (0,0) rectangle (#2cm, 0.4cm);
    \node[right] at (5.2cm, 0.2cm) {#1};
  \end{tikzpicture}
}

% Usage
\skillbar{Python}{4.5}
\skillbar{JavaScript}{3.8}
```

### Timeline

```latex
\begin{tikzpicture}
  \draw[thick, -] (0,0) -- (10,0);
  \foreach \x/\year in {0/2020, 2.5/2021, 5/2022, 7.5/2023, 10/2024} {
    \draw (\x,0.1) -- (\x,-0.1);
    \node[below] at (\x,-0.1) {\year};
  }
  \node[above] at (1.25, 0.1) {Event 1};
  \node[above] at (3.75, 0.1) {Event 2};
\end{tikzpicture}
```

### Icons and Symbols

```latex
% Checkmark
\newcommand{\checkmark}{%
  \begin{tikzpicture}[scale=0.5]
    \draw[green, thick] (0,0) -- (0.3,-0.3) -- (0.8,0.3);
  \end{tikzpicture}
}

% Star rating
\newcommand{\star}{%
  \begin{tikzpicture}[scale=0.3]
    \fill[yellow] (0,1) -- (0.2,0.3) -- (1,0.3) -- (0.4,-0.1)
                  -- (0.6,-0.9) -- (0,-0.4) -- (-0.6,-0.9)
                  -- (-0.4,-0.1) -- (-1,0.3) -- (-0.2,0.3) -- cycle;
  \end{tikzpicture}
}
```

### Progress Circles

```latex
\newcommand{\progresscircle}[2]{%
  \begin{tikzpicture}
    \draw[gray!20, line width=3pt] (0,0) circle (1cm);
    \draw[blue!60, line width=3pt] (0,0)
          arc[start angle=90, end angle=90-#2*3.6, radius=1cm];
    \node at (0,0) {#1\%};
  \end{tikzpicture}
}

% Usage: \progresscircle{75}{75}
```

### Decorative Boxes

```latex
\begin{tikzpicture}
  \node[
    rectangle,
    rounded corners=5pt,
    draw=blue!60,
    fill=blue!10,
    line width=2pt,
    minimum width=\textwidth-2cm,
    minimum height=2cm,
    align=left
  ] {
    \textbf{Summary}\\
    Professional summary text here...
  };
\end{tikzpicture}
```

## Coordinate Systems

### Absolute Coordinates

```latex
\draw (0,0) -- (2,1);                   % Cartesian (x,y)
\draw (0:1) -- (45:1.414);              % Polar (angle:radius)
```

### Relative Coordinates

```latex
\draw (0,0) -- ++(1,0) -- ++(0,1);     % Relative (cumulative)
\draw (0,0) -- +(1,0) -- +(0,1);       % Relative (from origin)
```

### Calculated Coordinates

```latex
\draw (0,0) -- ($(0,0)!0.5!(2,2)$);    % Midpoint
\draw (0,0) -- ($(0,0) + (45:1cm)$);   % Polar offset
```

## Styling

### Line Styles

```latex
\draw[thin] ...
\draw[thick] ...
\draw[very thick] ...
\draw[dashed] ...
\draw[dotted] ...
\draw[dash dot] ...
```

### Colors

```latex
\draw[red] ...
\draw[blue!50] ...                      % 50% blue
\draw[red!75!blue] ...                  % 75% red, 25% blue
```

### Arrows

```latex
\draw[->] (0,0) -- (1,0);              % Arrow at end
\draw[<-] (0,0) -- (1,0);              % Arrow at start
\draw[<->] (0,0) -- (1,0);             % Arrows both ends
\draw[-stealth] (0,0) -- (1,0);        % Stealth arrow style
```

## Advanced Features

### Layers

```latex
\begin{tikzpicture}
  \begin{pgfonlayer}{background}
    \fill[blue!20] (0,0) rectangle (4,2);
  \end{pgfonlayer}
  \node at (2,1) {Foreground};
\end{tikzpicture}
```

### Clipping

```latex
\begin{tikzpicture}
  \clip (0,0) circle (1cm);
  \fill[red] (-1,-1) rectangle (1,1);
\end{tikzpicture}
```

### Loops

```latex
\foreach \x in {0,1,2,3,4} {
  \draw (\x,0) circle (0.2cm);
}
```

## Best Practices for Document Generation

1. **Performance**: Limit complex TikZ graphics, they slow compilation
2. **Consistency**: Define custom commands for repeated elements
3. **Modularity**: Create reusable components
4. **Colors**: Use document color scheme
5. **Scaling**: Make graphics scale with text size

### Reusable Components

```latex
% In preamble
\newcommand{\sectionline}{%
  \begin{tikzpicture}
    \fill[blue!60] (0,0) rectangle (\textwidth, 0.1cm);
  \end{tikzpicture}
}

\newcommand{\decorbox}[1]{%
  \begin{tikzpicture}
    \node[rectangle, rounded corners, fill=blue!10,
          inner sep=10pt, text width=\textwidth-20pt] {#1};
  \end{tikzpicture}
}
```

## Common Patterns for Resume/CV

### Modern Header

```latex
\begin{tikzpicture}[remember picture, overlay]
  \fill[headercolor] (current page.north west)
        rectangle ([yshift=-4cm]current page.north east);
  \node[white, font=\Huge] at ([yshift=-2cm]current page.north)
        {\textbf{NAME}};
\end{tikzpicture}
```

### Sidebar

```latex
\begin{tikzpicture}[remember picture, overlay]
  \fill[sidebarcolor] (current page.north west)
        rectangle ([xshift=5cm]current page.south west);
\end{tikzpicture}
```

### Rating System

```latex
\newcommand{\rating}[1]{%
  \begin{tikzpicture}
    \foreach \x in {1,...,5} {
      \ifnum\x>#1
        \draw[gray] (\x*0.4,0) circle (0.15cm);
      \else
        \fill[blue!60] (\x*0.4,0) circle (0.15cm);
      \fi
    }
  \end{tikzpicture}
}
```

## Troubleshooting

- **Dimension too large**: Scale down coordinates or use smaller units
- **Slow compilation**: Simplify graphics or use external tool
- **Positioning issues**: Use `remember picture, overlay` for page-level positioning
- **Text wrapping**: Use `text width` option in node

## Integration Tips

- Place complex TikZ in preamble as commands
- Use with `geometry` package for page layout
- Combine with `xcolor` for consistent colors
- Use `\tikzset{}` for global style settings
