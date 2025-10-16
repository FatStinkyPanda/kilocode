# geometry Package Documentation

## Overview

The `geometry` package provides a flexible interface for customizing page dimensions and margins in LaTeX documents.

## Basic Usage

```latex
\usepackage{geometry}
\geometry{a4paper, margin=1in}
```

## Page Setup Options

### Paper Size

```latex
\geometry{a4paper}           % A4 (210mm × 297mm)
\geometry{letterpaper}       % US Letter (8.5" × 11")
\geometry{legalpaper}        % US Legal (8.5" × 14")
\geometry{executivepaper}    % Executive (7.25" × 10.5")
```

### Custom Paper Size

```latex
\geometry{paperwidth=8.5in, paperheight=11in}
```

## Margin Configuration

### Uniform Margins

```latex
\geometry{margin=1in}        % All margins
\geometry{margin=2cm}        % Metric
```

### Individual Margins

```latex
\geometry{
  top=1in,
  bottom=1in,
  left=1.25in,
  right=1.25in
}
```

### Horizontal/Vertical

```latex
\geometry{hmargin=1in}       % Left and right
\geometry{vmargin=1.5in}     % Top and bottom
```

## Advanced Layout

### Text Area Dimensions

```latex
\geometry{
  textwidth=6.5in,
  textheight=9in
}
```

### Head and Foot

```latex
\geometry{
  headheight=15pt,
  headsep=25pt,
  footskip=30pt
}
```

### Margin Notes

```latex
\geometry{
  marginparwidth=2cm,
  marginparsep=10pt
}
```

## Orientation

```latex
\geometry{landscape}         % Landscape mode
\geometry{portrait}          % Portrait mode (default)
```

## Two-Sided Documents

```latex
\geometry{
  twoside,
  inner=1.5in,              % Binding side
  outer=1in                 % Outer edge
}
```

## Common Presets for Document Types

### Resume/CV - Maximized Space

```latex
\geometry{
  letterpaper,
  top=0.5in,
  bottom=0.5in,
  left=0.6in,
  right=0.6in
}
```

### Business Letter - Professional

```latex
\geometry{
  letterpaper,
  top=1in,
  bottom=1in,
  left=1.25in,
  right=1.25in
}
```

### Academic Paper - Standard

```latex
\geometry{
  letterpaper,
  margin=1in
}
```

### Business Plan - Balanced

```latex
\geometry{
  letterpaper,
  top=1in,
  bottom=1in,
  left=1in,
  right=1in
}
```

### Two-Column Resume

```latex
\geometry{
  letterpaper,
  top=0.4in,
  bottom=0.4in,
  left=0.3in,
  right=0.3in
}
```

## Complete Example

```latex
\documentclass{article}
\usepackage[
  letterpaper,
  top=0.75in,
  bottom=0.75in,
  left=0.75in,
  right=0.75in,
  headheight=14pt,
  headsep=20pt,
  footskip=25pt
]{geometry}

\begin{document}
Content here
\end{document}
```

## Dynamic Layout Changes

```latex
% In preamble
\usepackage{geometry}

% In document
\newgeometry{margin=0.5in}   % Change geometry
% Content with new geometry
\restoregeometry             % Restore original
```

## Show Layout (Debugging)

```latex
\geometry{showframe}         % Show frame boxes
```

## Best Practices

1. **Resume/CV**: Minimize margins (0.5-0.75in) to maximize content space
2. **Business Documents**: Use 1-1.25in margins for professional appearance
3. **Academic**: Follow institutional guidelines (typically 1in)
4. **Readability**: Line length should be 60-70 characters for optimal reading
5. **Print Safety**: Ensure at least 0.5in margins for printing
6. **Two-Column**: Use smaller outer margins (0.3-0.5in) to maximize columns

## Common Calculations

### Text Width from Margins

```
textwidth = paperwidth - left - right
```

### Optimal Line Length

```latex
% For 60-70 characters at 12pt
\geometry{textwidth=4.5in}   % ~65 characters
```

## Integration with Other Packages

### With fancyhdr

```latex
\usepackage{fancyhdr}
\usepackage{geometry}
\geometry{
  headheight=15pt,           % Accommodate header
  headsep=20pt
}
```

### With multicol

```latex
\usepackage{geometry}
\geometry{
  left=0.5in,
  right=0.5in                % Wider columns
}
```

## Troubleshooting

- **"Overfull \hbox"**: Margins too narrow for content
- **Header too large**: Increase `headheight`
- **Footer cut off**: Increase `footskip`
- **Margin notes overlap**: Increase `marginparwidth` or `marginparsep`

## Platform Considerations

- **US documents**: Use `letterpaper` (8.5" × 11")
- **International**: Use `a4paper` (210mm × 297mm)
- **Print margins**: Minimum 0.5in for standard printers
- **Digital only**: Can use smaller margins (0.3in minimum)
