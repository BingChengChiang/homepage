# Test-only headless terminal adapter. Never shipped as the browser engine.
package Curses;
use Exporter 'import';
our @EXPORT=qw(noecho curs_set halfdelay getch COLOR_PAIR init_pair start_color has_colors endwin KEY_RESIZE);
sub KEY_RESIZE(){410}
sub A_BOLD(){256} sub COLOR_PAIR{$_[0]} sub noecho{} sub curs_set{} sub halfdelay{} sub getch{return -1} sub init_pair{} sub start_color{} sub has_colors{1}
sub new {bless {cells=>{},attr=>0},'Curses::Window'}
sub endwin{}
package Curses::Window;
sub getmaxx{120} sub getmaxy{40} sub attron{$_[0]{attr}=$_[1]} sub attroff{$_[0]{attr}=0} sub refresh{} sub bkgdset{}
sub addstr{my($s,$y,$x,$str)=@_;for my $c(split//,$str){$s->{cells}{"$x,$y"}=[$c,$s->{attr}];$x++;if($x>=120){$x=0;$y++;}}}
1;
