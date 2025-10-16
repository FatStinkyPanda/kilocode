# Color Theory for Document Design

## Overview

Color is a powerful tool in document design that affects readability, professionalism, and emotional response. This guide covers color theory principles specifically for professional documents.

## Color Models

### RGB (Red, Green, Blue)

- **Use for**: Digital documents (PDF, web)
- **Range**: 0-255 for each channel
- **Example**: `RGB(52, 152, 219)` = bright blue
- **LaTeX**: `\definecolor{name}{RGB}{52,152,219}`

### CMYK (Cyan, Magenta, Yellow, Black)

- **Use for**: Print documents
- **Range**: 0-100% for each channel
- **Conversion**: PDF viewers handle RGB→CMYK
- **LaTeX**: `\definecolor{name}{cmyk}{0.76,0.32,0,0.14}`

### Hexadecimal

- **Use for**: Web, some design tools
- **Format**: #RRGGBB (00-FF for each channel)
- **Example**: `#3498DB` = bright blue
- **LaTeX**: `\definecolor{name}{HTML}{3498DB}`

### Grayscale

- **Use for**: Black/white printers, accessibility
- **Range**: 0.0 (black) to 1.0 (white)
- **Example**: `gray=0.8` = light gray (80% white)
- **LaTeX**: `\definecolor{name}{gray}{0.8}`

## Color Psychology

### Professional Colors

**Blue** - Trust, professionalism, stability

- Most universally professional color
- Safe choice for all industries
- Conveys competence and reliability
- **Use for**: Headers, accents, links
- **Avoid**: Pure bright blue (use muted tones)

**Gray** - Neutral, sophisticated, modern

- Versatile and professional
- Good for text and backgrounds
- Creates hierarchy without color
- **Use for**: Secondary text, backgrounds
- **Shades**: Dark gray for text (#333), light gray for backgrounds (#F5F5F5)

**Black** - Authority, elegance, formality

- Classic and timeless
- Use dark gray (#333) instead of pure black (#000)
- **Use for**: Body text, formal documents
- **Avoid**: Pure black (harsh on eyes)

**Green** - Growth, success, money

- Positive connotation
- Good for highlighting achievements
- Financial documents
- **Use for**: Positive metrics, eco-related content
- **Avoid**: Lime green, neon green

**Red** - Energy, urgency, importance

- Powerful accent color
- Use sparingly
- Can indicate errors/warnings
- **Use for**: Important call-outs, very selective accents
- **Avoid**: Large areas of red

**Purple** - Creativity, luxury, wisdom

- Less common in professional docs
- Good for creative industries
- **Use for**: Creative resumes, design portfolios

**Orange** - Enthusiasm, creativity, warmth

- Friendly and approachable
- Creative industries
- **Use for**: Startups, creative fields
- **Avoid**: Traditional/conservative industries

## Color Harmony

### Complementary Colors

- Opposite on color wheel
- High contrast
- **Example**: Blue (#3498DB) + Orange (#E67E22)
- **Use**: Rare in professional docs (too high contrast)

### Analogous Colors

- Adjacent on color wheel
- Harmonious, subtle
- **Example**: Blue (#3498DB) + Blue-Green (#1ABC9C)
- **Use**: Multiple accent colors

### Monochromatic

- Single hue with varying saturation/lightness
- Most professional and safe
- **Example**: Dark blue header, medium blue accents, light blue backgrounds
- **Use**: Professional resumes, business docs

### Triadic

- Three colors equally spaced on wheel
- Vibrant but balanced
- **Example**: Blue, Red, Yellow
- **Use**: Creative designs (use with caution)

### Split-Complementary

- Base color + two adjacent to complement
- **Example**: Blue + Yellow-Orange + Red-Orange
- **Use**: Creative documents

## Professional Color Palettes

### Conservative Professional (Finance, Law)

```
Primary text:   #2C3E50 (dark blue-gray)
Headers:        #1A237E (navy blue)
Accents:        #0D47A1 (deep blue)
Backgrounds:    #FAFAFA (off-white)
```

### Modern Business (Tech, Consulting)

```
Primary text:   #34495E (slate)
Headers:        #2C3E50 (darker slate)
Primary accent: #3498DB (bright blue)
Secondary:      #2ECC71 (green)
Backgrounds:    #ECF0F1 (light gray)
```

### Creative Professional (Design, Marketing)

```
Primary text:   #2C3E50 (slate)
Headers:        #E74C3C (vibrant red)
Primary accent: #9B59B6 (purple)
Secondary:      #F39C12 (orange)
Backgrounds:    #FFFFFF (white)
```

### Academic/Traditional

```
Primary text:   #000000 (black)
Headers:        #000080 (navy)
Accents:        #4B0082 (indigo)
Backgrounds:    #FFFFFF (white)
```

### Tech/Startup

```
Primary text:   #2C3E50 (slate)
Headers:        #1A73E8 (Google blue)
Primary accent: #34A853 (green)
Secondary:      #FBBC04 (yellow)
Backgrounds:    #F8F9FA (light)
```

## Contrast and Readability

### WCAG Guidelines

- **AA Standard**: Minimum 4.5:1 contrast for normal text
- **AA Standard**: Minimum 3:1 contrast for large text (18pt+)
- **AAA Standard**: 7:1 for normal text (stricter)

### Text-Background Combinations

**High Readability**

```
Black text on white:        21:1 (excellent)
Dark gray (#333) on white:  12.6:1 (excellent)
Navy (#001f3f) on white:    11.5:1 (excellent)
```

**Acceptable**

```
Gray (#666) on white:       5.7:1 (good)
Blue (#0074D9) on white:    4.5:1 (minimum AA)
```

**Poor (Avoid)**

```
Light gray (#CCC) on white: 1.6:1 (fail)
Yellow on white:            1.1:1 (fail)
```

### Testing Contrast

- Use online contrast checkers
- View in grayscale mode
- Print test to verify
- Consider colorblind accessibility

## Color Application in Documents

### Resume/CV

**Recommended approach**: Monochromatic

```latex
\definecolor{headercolor}{RGB}{44,62,80}    % Dark blue-gray
\definecolor{accentcolor}{RGB}{52,152,219}  % Bright blue
\definecolor{textcolor}{RGB}{44,62,80}      % Same as header
\definecolor{lightgray}{gray}{0.95}         % Light backgrounds
```

**Usage**:

- Name: headercolor, large and bold
- Section headers: headercolor or accentcolor
- Links: accentcolor
- Body text: black or headercolor
- Backgrounds: lightgray (subtle)

### Business Plan

**Recommended approach**: Corporate colors

```latex
\definecolor{corporate}{RGB}{0,51,102}      % Navy
\definecolor{accent}{RGB}{255,102,0}        % Orange
\definecolor{text}{RGB}{51,51,51}           % Dark gray
```

**Usage**:

- Title page: corporate color backgrounds
- Headers: corporate color
- Charts/graphs: accent colors
- Body: dark gray text

### Academic Paper

**Recommended approach**: Minimal color

```latex
\definecolor{titlecolor}{RGB}{0,0,128}      % Navy
\definecolor{linkcolor}{RGB}{0,0,200}       % Blue
```

**Usage**:

- Title: titlecolor
- Hyperlinks: linkcolor
- Body: black
- Figures: color for data clarity only

## Color Accessibility

### Colorblind Considerations

**Protanopia (Red-blind)**: 1% males

- Avoid: Red-green combinations
- Use: Blue-orange, blue-yellow

**Deuteranopia (Green-blind)**: 1% males

- Avoid: Red-green combinations
- Use: Blue-orange combinations

**Tritanopia (Blue-blind)**: <0.01%

- Avoid: Blue-yellow combinations
- Use: Red-green combinations

**Best practice**: Don't rely on color alone for meaning

- Use text labels
- Use patterns/textures
- Use shapes/icons
- Ensure sufficient contrast

### Tools

- Color Oracle (colorblind simulator)
- Coblis (colorblind simulation)
- Contrast checkers (WebAIM, etc.)

## Cultural Considerations

### Western Cultures

- White: Purity, cleanliness, professionalism
- Black: Elegance, formality
- Blue: Trust, professional
- Red: Danger, importance, love

### Eastern Cultures

- Red: Luck, prosperity, celebration
- White: Mourning (in some cultures)
- Yellow: Royalty (in some cultures)
- Gold: Wealth, prosperity

**Best practice**: For international audiences, stick to blue, gray, black - universally professional.

## Print Considerations

### RGB vs CMYK

- Design in RGB for digital
- PDF viewers convert to CMYK for print
- Some colors shift in print (especially bright blues, greens)

### Grayscale Test

- Always view in grayscale
- Ensure hierarchy remains clear
- Contrast should still work
- Colors should be distinguishable

### Paper Color

- White paper: Standard
- Off-white/cream: Softer, traditional
- Colored paper: Usually avoid for professional docs

## Best Practices Summary

### Do's

1. **Limit palette**: 2-4 colors maximum
2. **High contrast**: Ensure readability
3. **Consistent usage**: Same color for same purpose
4. **Test in grayscale**: Must work without color
5. **Professional tones**: Muted, not neon
6. **Consider audience**: Industry and culture

### Don'ts

1. **Avoid rainbow**: Too many colors
2. **No neon/fluorescent**: Unprofessional
3. **Poor contrast**: Light text on light background
4. **Inconsistent**: Different colors for same element
5. **Color as only indicator**: Include text/icons
6. **Pure black**: Use #333 instead

## LaTeX Color Commands

### Defining Colors

```latex
\usepackage{xcolor}

% RGB (0-255)
\definecolor{myblue}{RGB}{52,152,219}

% HTML hex
\definecolor{myblue}{HTML}{3498DB}

% Grayscale (0.0-1.0)
\definecolor{mygray}{gray}{0.8}

% Predefined colors
\usepackage[dvipsnames]{xcolor}  % Access Maroon, RoyalBlue, etc.
```

### Using Colors

```latex
\textcolor{myblue}{Colored text}
{\color{myblue} Multiple words}
\colorbox{lightgray}{Background color}
\fcolorbox{blue}{lightgray}{Frame and background}
```

### Color Mixing

```latex
\color{red!50}           % 50% red, 50% white
\color{red!75!blue}      % 75% red, 25% blue
\color{red!50!blue!25}   % Complex mix
```

## Quick Reference: Safe Professional Colors

### Blues

```
Navy:           #001f3f  RGB(0,31,63)
Professional:   #0074D9  RGB(0,116,217)
Bright:         #3498DB  RGB(52,152,219)
Sky:            #87CEEB  RGB(135,206,235)
```

### Grays

```
Almost black:   #111111  RGB(17,17,17)
Dark gray:      #333333  RGB(51,51,51)
Medium gray:    #666666  RGB(102,102,102)
Light gray:     #CCCCCC  RGB(204,204,204)
Very light:     #F5F5F5  RGB(245,245,245)
```

### Greens

```
Forest:         #228B22  RGB(34,139,34)
Professional:   #2ECC71  RGB(46,204,113)
Emerald:        #27AE60  RGB(39,174,96)
```

### Reds

```
Deep:           #8B0000  RGB(139,0,0)
Professional:   #E74C3C  RGB(231,76,60)
Tomato:         #FF6347  RGB(255,99,71)
```

## Conclusion

Effective color use in professional documents requires:

1. Understanding color psychology
2. Ensuring sufficient contrast
3. Limiting color palette
4. Testing for accessibility
5. Considering cultural context
6. Maintaining consistency

**Golden rule**: When in doubt, use less color. A conservative, well-executed color scheme is better than an adventurous, poorly implemented one.
