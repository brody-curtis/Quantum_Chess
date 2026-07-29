# Quantum_Chess
Like normal chess, but you have the ability to quantumly superimpose your pieces, splitting into a real and fake version of the piece.  Your opponent can only see that it is split, they cannot see which option is real or fake.  Like the classic quantum superposition thought experiment Schrodinger's cat, you can only find out which of the options is real when you interact with the system (take either of the pieces).  To win the game you must capture the king, there are no check or checkmate conditions in this game as it would enable the user to deduct which of the superimposed pieces is real or fake, taking away the fun.  The act of splitting a piece takes a move.  You may move both split pieces during the same turn.  Good luck, have fun.

Bugs to fix:

White pieces wont move while on dev view and black pieces wont move on player view - fix: it is because from the player view the coordinates are all turned around, so it thinks youre clicking a coordinate you are not.  Add some sort of anchor in the coordinates

On developer view (show true) it doesn't show the false pieces.  This is not what i want.  What i instead want is it to show the image of the full piece on top of the true piece and the split piece on top of the split piece (the same as what that player would see if theyre his pieces).  The opponent of the split piece should see two split images, not knowing which one is real.

Castling doesn't work - fix: add a button to castle or add it to legalK

When moving split pieces, it makes you select the real piece then its destination, then choose the fake piece and its destination.  When they are on top of each other, you choose the destination for the real piece but it doesn't move out of the way.  This makes it impossible to select and move the fake piece under it, so you get soft locked.

True board has white pieces on the wrong side - fix: is in app.py line 142, change mapped_temp[7-r][c] = temp[r][c] to mapped_temp[7-r][7-c] = temp[r][c] or change it to mapped_temp[r][c] = temp[r][c]



To start it:

python app.py |then| ctrl + click (the link they give you)
