use strict;
use warnings;
use FindBin;
use lib "$FindBin::Bin", "$FindBin::Bin/../vendor/Term-Animation-2.6/lib";
our($rng,$constant,$calls);
BEGIN {
 *CORE::GLOBAL::rand = sub {
  my $n=defined($_[0])?$_[0]:1;
  $main::calls++;
  if(defined($main::constant)){return $main::constant*$n;}
  $main::rng=(1664525*$main::rng+1013904223)%4294967296;
  return ($main::rng/4294967296)*$n;
 };
}
use JSON::PP;
use Digest::SHA 'sha256_hex';
use Term::Animation;
use Term::Animation::Entity;
our @captured;
{
 package Capture;
 our @ISA=('Term::Animation');
 sub new_entity {my($s,%p)=@_;my %c=%p;for(keys %c){delete $c{$_} if ref($c{$_}) eq 'CODE';}push @main::captured,\%c;}
}
my $source;{local $/;open my $f,'<',"$FindBin::Bin/../vendor/asciiquarium/asciiquarium.pl" or die $!;$source=<$f>;}
$source =~ s/^main\(\);$/# GUI entry point disabled by comparison harness/m;
eval $source;die $@ if $@;
my $mode=shift(@ARGV)||'assets';
if($mode eq 'assets'){
 my %assets;
 no warnings 'redefine';
 local *main::rand_color=sub { $_[0] };
 $source =~ /sub add_fish\s*\{.*?my \@fish_image = \((.*?)\n\);/s or die 'Original fish array missing';
 $assets{fish}=eval '['.$1.']';die $@ if $@;
 my $anim=bless {WIDTH=>120,HEIGHT=>40},'Capture';
 for my $fn(qw(add_castle add_environment add_ship add_whale add_monster add_big_fish add_shark add_splat add_fishhook add_swan add_ducks add_dolphins)){
  my @directions;
  for my $c(0,.9){$constant=$c;@captured=();no strict 'refs';if($fn eq 'add_castle'||$fn eq 'add_environment'){&{"main::$fn"}($anim);}elsif($fn eq 'add_splat'){&{"main::$fn"}($anim,20,20,3);}else{&{"main::$fn"}(undef,$anim);}push @directions,[@captured];}
  $assets{$fn}=\@directions;
 }
 print JSON::PP->new->canonical->encode(\%assets);
}elsif($mode eq 'trace'){
 my @traces;
 for my $case([1,undef],[17,undef],[12345,undef],[7,'add_fishhook'],[12,'add_dolphins'],[99,'add_monster']){
  my($seed,$special)=@$case;
  $rng=$seed;$constant=undef;$calls=0;my $serial=0;
  no warnings 'redefine';my $original_add=\&Term::Animation::add_entity;
  local *Term::Animation::add_entity=sub{my($a,@es)=@_;for(@es){$_->{TEST_ID}=$serial++;}$original_add->($a,@es);};
  my $a=bless {WIDTH=>120,HEIGHT=>40,ENTITIES=>{},ENTITYCOUNT=>0,PHYSICALCOUNT=>0,PHYSICALENTITIES=>{},WIN=>Curses->new(),COLOR_ENABLED=>1,COLORS=>{w=>1,r=>2,g=>3,b=>4,c=>5,m=>6,y=>7,k=>8}},'Term::Animation';
  main::add_environment($a);main::add_castle($a);main::add_all_seaweed($a);main::add_all_fish($a);
  if(defined($special)){no strict 'refs';&{"main::$special"}(undef,$a);}else{main::random_object(undef,$a);}
  if(defined($special)&&$special eq 'add_fishhook'){
   my($point)=grep{$_->{TYPE} eq 'hook_point'}values %{$a->{ENTITIES}};
   my $fish;for my $candidate(values %{$a->{ENTITIES}}){next unless $candidate->{TYPE} eq 'fish';$fish=$candidate if !defined($fish)||$candidate->{TEST_ID}<$fish->{TEST_ID};}
   # Put one fish on the hook's path to exercise catch/retract deterministically.
   $fish->{X}=$point->{X};$fish->{Y}=12;$fish->{Z}=4;$fish->{CALLBACK_ARGS}[0]=0;
  }
  my @frames;
  for(1..500){
   my @cb=map { $a->{ENTITIES}{$_}{TEST_ID} } keys %{$a->{ENTITIES}};
   $a->_do_callbacks();my @ph=map {$_->{TEST_ID}} values %{$a->{ENTITIES}};
   $a->_find_collisions();$a->_collision_handlers();$a->_remove_deleted_entities();
   my @draw=map {$_->{TEST_ID}} values %{$a->{ENTITIES}};
   $a->_build_screen();my($chars,$colors)=('','');
   for my $y(0..39){for my $x(0..119){my $cell=$a->{WIN}{cells}{"$x,$y"}||[' ',0];$chars.=$cell->[0];my $c=(qw(w w r g b c m y k))[$cell->[1]&255]||'w';$c=uc($c) if $cell->[1]&256;$colors.=$c;}}
   push @frames,{callbacks=>\@cb,physics=>\@ph,draw=>\@draw,hash=>sha256_hex($chars.$colors),calls=>$calls};
  }
  push @traces,{seed=>$seed,special=>$special,frames=>\@frames};
 }
 print JSON::PP->new->canonical->encode(\@traces);
}elsif($mode eq 'fixtures'){
 my @out;
 for my $seed(1,17,12345){for my $fn(qw(add_castle add_environment add_seaweed add_fish add_ship add_whale add_monster add_big_fish add_shark add_splat add_fishhook add_swan add_ducks add_dolphins)){
  $rng=$seed;$constant=undef;$calls=0;
  my $a=bless {WIDTH=>120,HEIGHT=>40,ENTITIES=>{},ENTITYCOUNT=>0,PHYSICALCOUNT=>0,PHYSICALENTITIES=>{}},'Term::Animation';
  no strict 'refs';if($fn eq 'add_castle'||$fn eq 'add_environment'){&{"main::$fn"}($a);}elsif($fn eq 'add_splat'){&{"main::$fn"}($a,20,20,3);}else{&{"main::$fn"}(undef,$a);}
  my @entities;for my $e(values %{$a->{ENTITIES}}){
   push @entities,{map {$_=>$e->{$_}} qw(NAME X Y Z WIDTH HEIGHT DEPTH TYPE PHYSICAL CALLBACK_ARGS SHAPE COLOR ATTR CURR_FRAME DIE_OFFSCREEN DIE_FRAME TRANSPARENT)};
  }
  push @out,{seed=>$seed,fn=>$fn,calls=>$calls,entities=>\@entities};
 }}
 print JSON::PP->new->canonical->encode(\@out);
}
