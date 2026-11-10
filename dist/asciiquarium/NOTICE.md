# asciiquarium — browser translation

Original program: asciiquarium 1.1, by Kirk Baucom.
Official release: https://robobunny.com/projects/asciiquarium/asciiquarium.tar.gz
Version 1.1, released 2013-03-09. Source SHA-256:
f3afa00cdcea5cc5e4f2c22ee987bc10eddc5f41a56ec4836ef3e4011999e65a

Copyright (C) 2013 Kirk Baucom <kbaucom@schizoid.com>.
Most ASCII artwork: Joan Stark.

This browser translation is distributed under GNU GPL version 2 or, at your
option, any later version, without warranty. The full license is in COPYING.

The original sprites, animation frames and color masks are extracted by running
the original Perl definitions. They are not redrawn or mirrored by the port.
engine.js translates asciiquarium's creation/callback rules and the used parts
of Term::Animation 2.6. browser.js replaces only the terminal display/input loop.

Term::Animation 2.6: Copyright (C) 2003 Kirk Baucom. The upstream library is
available under the same terms as Perl itself. Its original source is retained
for review. The browser derivative is distributed under GPL-2.0-or-later.
Source archive: https://cpan.metacpan.org/authors/id/K/KB/KBAUCOM/Term-Animation-2.6.tar.gz

## Source files (served alongside the application)

- Original asciiquarium: upstream.pl
- Original animation dependency: Term-Animation.pm and Entity.pm
- JavaScript translation: engine.js
- Extracted sprites and masks: assets.js
- Browser adapter: browser.js
- License: COPYING

Complete source, extraction harness, provenance and differential tests are also
included in the downloadable homepage source ZIP supplied with this project.

## Equivalence boundary

Rules, shapes and masks follow the author's official 1.1 release. This replaces
the earlier GitHub fork with the official fishhook, swan, ducks, dolphins and
four-frame sea serpent. Browser timing,
font rendering and randomness are host adapters. Perl hash iteration (including
ties between equal-depth objects) is randomized by Perl; JavaScript Map iteration
is stable. Therefore independently launched sessions do not share an identical
random trajectory. Differential frame tests replay Perl's iteration order and
random draws to compare the same execution character-for-character and color-
for-color. This is a JavaScript port, not the original Perl interpreter.

No added feeding, fish steering, sine-wave motion, forced shark schedule, day/
night mode or extra background art is present. The browser starts paused when
the visitor requests reduced motion; resuming uses the same simulation rules.
