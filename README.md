# Quantum_Chess
Like normal chess, but you have the ability to quantumly superimpose your pieces, splitting into a real and fake version of the piece.  Your opponent can only see that it is split, they cannot see which option is real or fake.  Like the classic quantum superposition thought experiment Schrodinger's cat, you can only find out which of the options is real when you interact with the system (take either of the pieces).  To win the game you must capture the king, there are no check or checkmate conditions in this game as it would enable the user to deduct which of the superimposed pieces is real or fake, taking away the fun.  The act of splitting a piece takes a move.  You may move both split pieces during the same turn.  Good luck, have fun.

Bugs to fix:
Pieces wont move while on player view, they only move when on developer view
Castling doesn't work
When moving split pieces, it makes you select the real piece then its destination, then choose the fake piece and its destination.  When they are on top of each other, you choose the destination for the real piece but it doesn't move out of the way.  This makes it impossible to select and move the fake piece under it, so you get soft locked.

To start it:
python app.py |then| ctrl + click (the link they give you)
